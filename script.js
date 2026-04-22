// ═══════════════════════════════════════════════════════════
//  MOORI_OS — script.js  v3
//  ─────────────────────────────────────────────
//  CAMBIOS:
//  ✅ Navbar limpia al iniciar (sin nombre hasta login)
//  ✅ Registro = ADMIN directo
//  ✅ Botón subir archivo arreglado (validación de rol correcta)
//  ✅ Ojito para mostrar/ocultar contraseña
//  ✅ BYE overlay con mascota grande
//  ✅ Sin sesión → solo ver y descargar archivos
// ═══════════════════════════════════════════════════════════
 
/* ══════════ FIREBASE CONFIG ══════════ */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDI5_UhyiFhz7FgELyg49YjvmltPcUfrvk",
  authDomain:        "josejose-49388.firebaseapp.com",
  projectId:         "josejose-49388",
  storageBucket:     "josejose-49388.firebasestorage.app",
  messagingSenderId: "297650955910",
  appId:             "1:297650955910:web:1867650fe8c3dc492bd307",
  measurementId:     "G-VPF171PYP5"
};
 
/* ══════════ CARGAR FIREBASE ══════════ */
const _s = document.createElement('script');
_s.type = 'module';
_s.textContent = `
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
  import { getFirestore, collection, getDocs, addDoc,
           deleteDoc, doc, query, where }
    from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
  const app = initializeApp(${JSON.stringify(FIREBASE_CONFIG)});
  const db  = getFirestore(app);
  window._fb = { db, collection, getDocs, addDoc, deleteDoc, doc, query, where };
  window.dispatchEvent(new Event('firebase-ready'));
`;
document.head.appendChild(_s);
 
/* ══════════ ESTADO GLOBAL ══════════ */
let currentUser = null;   // null = no hay sesión
let activeUnit  = null;
let activeWeek  = null;
let fbReady     = false;
 
const unitNames = [
  '',
  'Análisis de Datos',
  'Diseño Relacional',
  'Sentencias SQL',
  'Protocolos de Seguridad'
];
 
/* ══════════ INIT ══════════ */
// Asegurar que la navbar empieza limpia (sin nombre)
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('user-pill').classList.add('hidden');
  document.getElementById('btn-login-nav').classList.remove('hidden');
});
 
window.addEventListener('firebase-ready', async () => {
  fbReady = true;
  await updateCounters();
});
 
/* ══════════ FIREBASE HELPERS ══════════ */
async function fbGetAll(col, filters = []) {
  if (!fbReady) throw new Error('Firebase no listo');
  const { db, collection, getDocs, query, where } = window._fb;
  let q = collection(db, col);
  if (filters.length)
    q = query(q, ...filters.map(([f, op, v]) => where(f, op, v)));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function fbAdd(col, data) {
  if (!fbReady) throw new Error('Firebase no listo');
  const { db, collection, addDoc } = window._fb;
  const ref = await addDoc(collection(db, col), data);
  return ref.id;
}
async function fbDelete(col, id) {
  if (!fbReady) throw new Error('Firebase no listo');
  const { db, doc, deleteDoc } = window._fb;
  await deleteDoc(doc(db, col, id));
}
 
/* ══════════ MASCOTA ══════════ */
const FRASES_BIENVENIDA = [
  "¡Volviste, señorón! 👑",
  "Eso es responsabilidad, campeón 💪",
  "El que no falla, no para de crecer 🚀",
  "Tus tareas no se van a subir solas... ¡dale! 😄",
  "Presencia confirmada en el sistema ✅",
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
  if (mascotTimer) { clearTimeout(mascotTimer); mascotTimer = null; }
  bubble.textContent = frase;
  wrap.classList.remove('hidden');
  setTimeout(() => bubble.classList.add('show'), 80);
  mascotTimer = setTimeout(() => {
    bubble.classList.remove('show');
    setTimeout(() => wrap.classList.add('hidden'), 400);
  }, 4800);
}
 
function ocultarMascota() {
  const wrap   = document.getElementById('mascot-wrap');
  const bubble = document.getElementById('mascot-bubble');
  bubble.classList.remove('show');
  wrap.classList.add('hidden');
  if (mascotTimer) { clearTimeout(mascotTimer); mascotTimer = null; }
}
 
function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
 
/* ══════════ BYE OVERLAY ══════════ */
function mostrarBye() {
  ocultarMascota();
 
  const overlay = document.getElementById('bye-overlay');
  const zone    = document.getElementById('bye-mascot-zone');
 
  // Clonar SVG de la mascota para el overlay
  const originalSvg = document.getElementById('mascot-svg');
  const cloned = originalSvg.cloneNode(true);
  cloned.style.width  = '260px';
  cloned.style.height = '364px';
  cloned.style.filter = 'drop-shadow(0 0 40px rgba(249,115,22,0.6))';
  zone.innerHTML = '';
  zone.appendChild(cloned);
 
  overlay.classList.remove('hidden');
 
  // Cerrar después de 2.8s y limpiar navbar
  setTimeout(() => {
    overlay.classList.add('hidden');
    // Limpiar navbar
    document.getElementById('btn-login-nav').classList.remove('hidden');
    document.getElementById('user-pill').classList.add('hidden');
  }, 2800);
}
 
/* ══════════ OJITO (mostrar/ocultar contraseña) ══════════ */
function togglePass(inputId, btn) {
  const input    = document.getElementById(inputId);
  const eyeOpen  = btn.querySelector('.eye-open');
  const eyeClosed = btn.querySelector('.eye-closed');
  if (input.type === 'password') {
    input.type = 'text';
    eyeOpen.classList.add('hidden');
    eyeClosed.classList.remove('hidden');
  } else {
    input.type = 'password';
    eyeOpen.classList.remove('hidden');
    eyeClosed.classList.add('hidden');
  }
}
 
/* ══════════ AUTH ══════════ */
function abrirLogin() {
  document.getElementById('ov-login').classList.add('open');
  document.getElementById('auth-err').textContent = '';
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
    // ✅ SIEMPRE ADMIN al registrarse
    await fbAdd('users', { user, pass, name, role: 'ADMIN' });
    showErr('✅ ¡Cuenta ADMIN creada! Inicia sesión.');
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
 
  // Iniciales para el avatar
  const initials = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('pill-avatar').textContent = initials;
  document.getElementById('pill-name').textContent   = u.name.toUpperCase();
 
  const roleEl = document.getElementById('pill-role');
  roleEl.textContent = u.role;
  if (u.role === 'ADMIN') {
    roleEl.style.cssText = 'background:rgba(249,115,22,0.15);color:#f97316;border:1px solid rgba(249,115,22,0.3);';
  } else {
    roleEl.style.cssText = 'background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.25);';
  }
  roleEl.style.cssText += 'font-family:var(--mono);font-size:9px;font-weight:600;padding:2px 6px;border-radius:3px;letter-spacing:1px;width:fit-content;';
 
  mostrarMascota(rnd(FRASES_BIENVENIDA));
}
 
function doLogout() {
  currentUser = null;
  mostrarBye();
  // ─ La navbar se limpia dentro de mostrarBye() después de 2.8s ─
}
 
/* ══════════ CONTADORES ══════════ */
async function updateCounters() {
  try {
    const files = await fbGetAll('files');
    for (let i = 1; i <= 4; i++) {
      const n  = files.filter(f => f.unit == i).length;
      const el = document.getElementById('c' + i);
      if (el) el.textContent = n + (n === 1 ? ' archivo' : ' archivos');
    }
  } catch {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById('c' + i);
      if (el) el.textContent = '— archivos';
    }
  }
}
 
/* ══════════ MODAL UNIDAD ══════════ */
function openUnit(u) {
  activeUnit = u;
  activeWeek = null;
  document.getElementById('um-num').textContent   = '0' + u;
  document.getElementById('um-title').textContent = unitNames[u];
  document.getElementById('um-sub').textContent   = 'Selecciona una semana';
  document.querySelectorAll('.wbtn').forEach(b => b.classList.remove('active'));
  document.getElementById('unit-body').innerHTML  =
    '<div class="pick-hint">Selecciona una semana para ver los archivos</div>';
  document.getElementById('ov-unit').classList.add('open');
}
function cerrarUnidad() {
  document.getElementById('ov-unit').classList.remove('open');
}
function selectWeek(w) {
  activeWeek = w;
  document.querySelectorAll('.wbtn').forEach((b, i) =>
    b.classList.toggle('active', i + 1 === w)
  );
  document.getElementById('um-sub').textContent = 'Semana ' + w;
  renderFiles();
}
 
/* ══════════ RENDER ARCHIVOS ══════════ */
async function renderFiles() {
  const body = document.getElementById('unit-body');
  body.innerHTML = '<div class="loading-row"><div class="spin"></div> Cargando archivos…</div>';
 
  let files = [];
  try {
    files = await fbGetAll('files', [
      ['unit', '==', activeUnit],
      ['week', '==', activeWeek]
    ]);
  } catch(e) {
    body.innerHTML = '<div class="empty-msg">Error al conectar con Firebase.</div>';
    return;
  }
 
  let html = '';
 
  // ✅ ZONA DE SUBIDA: solo si hay sesión Y es ADMIN
  // currentUser puede ser null (sin sesión) o tener role ADMIN o VIEWER
  if (currentUser !== null && currentUser.role === 'ADMIN') {
    html += `
      <div class="upload-zone">
        <span class="upload-label">↑ Subir archivo</span>
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
      // Botón eliminar solo para ADMIN con sesión
      const canDelete = currentUser !== null && currentUser.role === 'ADMIN';
      html += `
        <div class="fitem">
          <div class="finfo">
            <div class="fname">${f.title}</div>
            <div class="fmeta">${f.filename}</div>
          </div>
          <div class="factions">
            <button class="btn-dl" onclick="downloadFile('${f.id}')">↓ Descargar</button>
            ${canDelete ? `<button class="btn-del" onclick="deleteFile('${f.id}')">✕</button>` : ''}
          </div>
        </div>`;
    });
    html += '</div>';
  }
 
  body.innerHTML = html;
}
 
/* ══════════ CRUD ══════════ */
async function uploadFile() {
  const titleEl = document.getElementById('f-title');
  const fileInput = document.getElementById('f-file');
  const title = titleEl ? titleEl.value.trim() : '';
  const file  = fileInput ? fileInput.files[0] : null;
  if (!title || !file) return alert('Escribe un título y selecciona un archivo.');
 
  const btn = document.querySelector('.btn-upload');
  if (btn) { btn.textContent = 'Subiendo…'; btn.disabled = true; }
 
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
      mostrarMascota(rnd(FRASES_SUBIDA));
    } catch(e) {
      alert('Error al subir. Revisa la conexión con Firebase.');
      if (btn) { btn.textContent = 'Subir'; btn.disabled = false; }
      console.error(e);
    }
  };
  reader.readAsDataURL(file);
}
 
async function downloadFile(id) {
  try {
    const files = await fbGetAll('files');
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
