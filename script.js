// ═══════════════════════════════════════════════════════════
//  MOORI_OS — script.js
//  Firebase Firestore: almacenamiento real en la nube
//  ─────────────────────────────────────────────────────────
//  SETUP: ve a https://console.firebase.google.com
//  1. Crea un proyecto
//  2. Agrega una app web  →  copia tu firebaseConfig
//  3. Ve a Firestore Database → Crear base de datos
//  4. En Reglas pon:
//     rules_version = '2';
//     service cloud.firestore {
//       match /databases/{database}/documents {
//         match /{document=**} { allow read, write: if true; }
//       }
//     }
//  5. Reemplaza el objeto FIREBASE_CONFIG de abajo
// ═══════════════════════════════════════════════════════════
 
const FIREBASE_CONFIG = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROYECTO.firebaseapp.com",
  projectId:         "TU_PROYECTO_ID",
  storageBucket:     "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};
 
// ── Carga Firebase desde CDN ──────────────────────────────
const fbScript  = document.createElement('script');
fbScript.type   = 'module';
fbScript.textContent = `
  import { initializeApp }                          from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
  import { getFirestore, collection, getDocs,
           addDoc, deleteDoc, doc, query,
           where, getDoc }                          from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
 
  const app = initializeApp(${JSON.stringify(FIREBASE_CONFIG)});
  const db  = getFirestore(app);
 
  // Exponer al scope global para que el código de abajo lo use
  window._fb = { collection, getDocs, addDoc, deleteDoc, doc, query, where, db, getDoc };
  window.dispatchEvent(new Event('firebase-ready'));
`;
document.head.appendChild(fbScript);
 
// ════════════════════════════════════════════════════════════
//  ESTADO GLOBAL
// ════════════════════════════════════════════════════════════
let currentUser = null;
let activeUnit  = null;
let activeWeek  = null;
let fbReady     = false;
 
const unitNames = ['','Análisis de Datos','Diseño Relacional','Sentencias SQL','Protocolos de Seguridad'];
 
// ════════════════════════════════════════════════════════════
//  MASCOTA
// ════════════════════════════════════════════════════════════
const FRASES_BIENVENIDA = [
  "¡Volviste, señorón! 👑",
  "Eso es responsabilidad, campéon 💪",
  "El que no falla, no para de crecer 🚀",
  "Tus tareas no se van a subir solas... ¡dale! 😄",
  "Presencia en el sistema confirmada ✅",
  "El estudiante ha regresado. El profe tiembla 😎",
  "La constancia hace al maestro, sigue así 🏆",
  "Eres de los que sí llegan, no de los que dicen que llegan 💯",
];
 
const FRASES_SUBIDA = [
  "¡Lo hiciste a tiempo, buen trabajo campeón! 🎉",
  "Tarea entregada. La responsabilidad te define 💼",
  "Así se hace, sin excusas ni pretextos 🔥",
  "¡Eso es disciplina pura! Sigue adelante 💪",
  "Archivo guardado. Eres un ejemplo a seguir 🏅",
  "La entrega puntual es el primer paso del éxito 📚",
];
 
let mascotTimer = null;
 
function mostrarMascota(frase) {
  const wrap   = document.getElementById('mascot-wrap');
  const bubble = document.getElementById('mascot-bubble');
 
  // Cancelar timer previo
  if (mascotTimer) { clearTimeout(mascotTimer); mascotTimer = null; }
 
  bubble.textContent = frase;
  wrap.classList.remove('hidden');
  // Pequeño delay para que el slide-in esté primero
  setTimeout(() => bubble.classList.add('show'), 80);
 
  mascotTimer = setTimeout(() => {
    bubble.classList.remove('show');
    setTimeout(() => wrap.classList.add('hidden'), 350);
  }, 4500);
}
 
function fraseAleatoria(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
 
// ════════════════════════════════════════════════════════════
//  FIREBASE HELPERS
// ════════════════════════════════════════════════════════════
async function fbGetAll(colName, filters = []) {
  if (!fbReady) throw new Error('Firebase no está listo');
  const { db, collection, getDocs, query, where } = window._fb;
  let q = collection(db, colName);
  if (filters.length) {
    q = query(q, ...filters.map(([field, op, val]) => where(field, op, val)));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
 
async function fbAdd(colName, data) {
  if (!fbReady) throw new Error('Firebase no está listo');
  const { db, collection, addDoc } = window._fb;
  const ref = await addDoc(collection(db, colName), data);
  return ref.id;
}
 
async function fbDelete(colName, id) {
  if (!fbReady) throw new Error('Firebase no está listo');
  const { db, doc, deleteDoc } = window._fb;
  await deleteDoc(doc(db, colName, id));
}
 
// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════
window.addEventListener('firebase-ready', async () => {
  fbReady = true;
  await updateCounters();
});
 
// ════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════
function abrirLogin() {
  document.getElementById('ov-login').classList.add('open');
}
function cerrarLogin() {
  document.getElementById('ov-login').classList.remove('open');
  document.getElementById('auth-err').textContent = '';
}
function showErr(msg) {
  document.getElementById('auth-err').textContent = msg;
}
function switchTab(tab) {
  document.getElementById('auth-err').textContent = '';
  const isLogin = tab === 'login';
  document.getElementById('f-login').style.display = isLogin ? '' : 'none';
  document.getElementById('f-reg').style.display   = isLogin ? 'none' : '';
  document.getElementById('t-login').classList.toggle('active', isLogin);
  document.getElementById('t-reg').classList.toggle('active', !isLogin);
}
 
async function doLogin() {
  const user = document.getElementById('l-user').value.trim();
  const pass = document.getElementById('l-pass').value.trim();
  if (!user || !pass) return showErr('Completa todos los campos.');
  try {
    const users = await fbGetAll('users', [['user','==',user],['pass','==',pass]]);
    if (!users.length) return showErr('Usuario o contraseña incorrectos.');
    loginSuccess(users[0]);
  } catch(e) {
    showErr('Error de conexión. Verifica Firebase.');
    console.error(e);
  }
}
 
async function doRegister() {
  const user = document.getElementById('r-user').value.trim();
  const pass = document.getElementById('r-pass').value.trim();
  const name = document.getElementById('r-name').value.trim();
  if (!user || !pass || !name) return showErr('Completa todos los campos.');
  try {
    const existing = await fbGetAll('users', [['user','==',user]]);
    if (existing.length) return showErr('Ese usuario ya existe.');
    // Primer usuario = ADMIN, los demás = VIEWER
    const allUsers = await fbGetAll('users');
    const role = allUsers.length === 0 ? 'ADMIN' : 'VIEWER';
    await fbAdd('users', { user, pass, name, role });
    showErr('¡Cuenta creada! Inicia sesión.');
    switchTab('login');
    document.getElementById('l-user').value = user;
  } catch(e) {
    showErr('Error al registrar. Verifica Firebase.');
    console.error(e);
  }
}
 
function loginSuccess(u) {
  currentUser = u;
  cerrarLogin();
 
  // Navbar
  document.getElementById('btn-login-nav').classList.add('hidden');
  const pill = document.getElementById('user-pill');
  pill.classList.remove('hidden');
  document.getElementById('pill-name').textContent = u.name.toUpperCase();
  const roleEl = document.getElementById('pill-role');
  roleEl.textContent = u.role;
  roleEl.style.cssText = u.role === 'ADMIN'
    ? 'background:rgba(249,115,22,0.15);color:#f97316;border:1px solid rgba(249,115,22,0.3);border-radius:4px;padding:2px 7px;font-family:var(--mono);font-size:10px;font-weight:600;'
    : 'background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.25);border-radius:4px;padding:2px 7px;font-family:var(--mono);font-size:10px;font-weight:600;';
 
  // Mascota
  mostrarMascota(fraseAleatoria(FRASES_BIENVENIDA));
}
 
function doLogout() {
  currentUser = null;
  document.getElementById('btn-login-nav').classList.remove('hidden');
  document.getElementById('user-pill').classList.add('hidden');
}
 
// ════════════════════════════════════════════════════════════
//  CONTADORES
// ════════════════════════════════════════════════════════════
async function updateCounters() {
  try {
    const files = await fbGetAll('files');
    for (let i = 1; i <= 4; i++) {
      const count = files.filter(f => f.unit == i).length;
      const el = document.getElementById('c' + i);
      if (el) el.textContent = count + (count === 1 ? ' archivo' : ' archivos');
    }
  } catch(e) {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById('c' + i);
      if (el) el.textContent = '—';
    }
  }
}
 
// ════════════════════════════════════════════════════════════
//  MODAL UNIDAD
// ════════════════════════════════════════════════════════════
function openUnit(u) {
  activeUnit = u;
  activeWeek = null;
  document.getElementById('um-num').textContent   = '0' + u;
  document.getElementById('um-title').textContent = unitNames[u];
  document.getElementById('um-sub').textContent   = 'Selecciona una semana';
  document.querySelectorAll('.wbtn').forEach(b => b.classList.remove('active'));
  document.getElementById('unit-body').innerHTML  = '<div class="pick-hint">Selecciona una semana para ver los archivos</div>';
  document.getElementById('ov-unit').classList.add('open');
}
function cerrarUnidad() {
  document.getElementById('ov-unit').classList.remove('open');
}
function selectWeek(w) {
  activeWeek = w;
  document.querySelectorAll('.wbtn').forEach((b, i) => b.classList.toggle('active', i + 1 === w));
  document.getElementById('um-sub').textContent = 'Semana ' + w;
  renderFiles();
}
 
// ════════════════════════════════════════════════════════════
//  RENDER ARCHIVOS
// ════════════════════════════════════════════════════════════
async function renderFiles() {
  const body = document.getElementById('unit-body');
  body.innerHTML = '<div class="loading-row"><div class="spin"></div> Cargando archivos…</div>';
 
  let files = [];
  try {
    files = await fbGetAll('files', [
      ['unit','==', activeUnit],
      ['week','==', activeWeek]
    ]);
  } catch(e) {
    body.innerHTML = '<div class="empty-msg">Error al conectar con Firebase. Revisa tu configuración.</div>';
    return;
  }
 
  let html = '';
 
  // Zona de subida — solo ADMIN
  if (currentUser && currentUser.role === 'ADMIN') {
    html += `
      <div class="upload-zone">
        <span class="upload-label">Subir archivo</span>
        <div class="upload-row1">
          <input type="text" id="f-title" placeholder="Título del trabajo académico">
        </div>
        <div class="upload-row2">
          <input type="file" id="f-file">
          <button class="btn-upload" onclick="uploadFile()">Subir</button>
        </div>
      </div>`;
  }
 
  if (files.length === 0) {
    html += '<div class="empty-msg">Sin archivos en esta semana.</div>';
  } else {
    html += '<div class="file-list">';
    files.forEach(f => {
      html += `
        <div class="fitem">
          <div class="finfo">
            <div class="fname">${f.title}</div>
            <div class="fmeta">${f.filename}</div>
          </div>
          <div class="factions">
            <button class="btn-dl" onclick="downloadFile('${f.id}')">↓ Descargar</button>
            ${currentUser && currentUser.role === 'ADMIN'
              ? `<button class="btn-del" onclick="deleteFile('${f.id}')">✕</button>`
              : ''}
          </div>
        </div>`;
    });
    html += '</div>';
  }
 
  body.innerHTML = html;
}
 
// ════════════════════════════════════════════════════════════
//  CRUD ARCHIVOS
// ════════════════════════════════════════════════════════════
async function uploadFile() {
  const title     = document.getElementById('f-title').value.trim();
  const fileInput = document.getElementById('f-file');
  const file      = fileInput.files[0];
  if (!title || !file) return alert('Escribe un título y selecciona un archivo.');
 
  const btn = document.querySelector('.btn-upload');
  btn.textContent = 'Subiendo…';
  btn.disabled = true;
 
  const reader = new FileReader();
  reader.onload = async function () {
    try {
      await fbAdd('files', {
        unit:     activeUnit,
        week:     activeWeek,
        title,
        filename: file.name,
        data:     reader.result,
        ts:       Date.now()
      });
      await updateCounters();
      renderFiles();
      // Mascota feliz
      mostrarMascota(fraseAleatoria(FRASES_SUBIDA));
    } catch(e) {
      alert('Error al subir. Revisa la conexión con Firebase.');
      btn.textContent = 'Subir';
      btn.disabled = false;
      console.error(e);
    }
  };
  reader.readAsDataURL(file);
}
 
async function downloadFile(id) {
  try {
    const files = await fbGetAll('files', []);
    const f = files.find(x => x.id === id);
    if (!f) return alert('Archivo no encontrado.');
    const a = document.createElement('a');
    a.href = f.data;
    a.download = f.filename;
    a.click();
  } catch(e) {
    alert('Error al descargar.');
  }
}
 
async function deleteFile(id) {
  if (!confirm('¿Eliminar este archivo permanentemente?')) return;
  try {
    await fbDelete('files', id);
    await updateCounters();
    renderFiles();
  } catch(e) {
    alert('Error al eliminar.');
  }
}
 
