/* ═══════════════════════════════════════════════════
   MOORI_OS — script.js v4
   ─────────────────────────────────────────────────
   ✅ Mascota: peek → visible → shrink-to-cursor
   ✅ Mini mascota sigue el cursor con frases
   ✅ Registro: VIEWER por defecto, código 999600911 = ADMIN
   ✅ BYE: mascota baila → desvanece bonito
   ✅ Tarjetas hero expandibles con animación
   ✅ Navbar limpia hasta iniciar sesión
═══════════════════════════════════════════════════ */
 
/* ══════ FIREBASE CONFIG ══════ */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDI5_UhyiFhz7FgELyg49YjvmltPcUfrvk",
  authDomain:        "josejose-49388.firebaseapp.com",
  projectId:         "josejose-49388",
  storageBucket:     "josejose-49388.firebasestorage.app",
  messagingSenderId: "297650955910",
  appId:             "1:297650955910:web:1867650fe8c3dc492bd307"
};
const ADMIN_SECRET = "999600911";
 
/* ══════ CARGAR FIREBASE ══════ */
const _s = document.createElement('script');
_s.type = 'module';
_s.textContent = `
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
  import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where }
    from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
  const app = initializeApp(${JSON.stringify(FIREBASE_CONFIG)});
  const db  = getFirestore(app);
  window._fb = { db, collection, getDocs, addDoc, deleteDoc, doc, query, where };
  window.dispatchEvent(new Event('firebase-ready'));
`;
document.head.appendChild(_s);
 
/* ══════ ESTADO ══════ */
let currentUser = null;
let activeUnit  = null;
let activeWeek  = null;
let fbReady     = false;
let expandedCard = null;
 
const unitNames = ['','Análisis de Datos','Diseño Relacional','Sentencias SQL','Protocolos de Seguridad'];
 
/* ══════ INIT ══════ */
document.addEventListener('DOMContentLoaded', () => {
  // Navbar limpia
  document.getElementById('user-pill').classList.add('hidden');
  document.getElementById('btn-login-nav').classList.remove('hidden');
 
  // Mini mascota cursor
  initMiniMascot();
 
  // Cerrar tarjeta expandida al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (expandedCard && !e.target.closest('.expandable')) {
      collapseAllCards();
    }
  });
});
 
window.addEventListener('firebase-ready', async () => {
  fbReady = true;
  await updateCounters();
});
 
/* ══════ FIREBASE HELPERS ══════ */
async function fbGetAll(col, filters = []) {
  if (!fbReady) throw new Error('Firebase no listo');
  const { db, collection, getDocs, query, where } = window._fb;
  let q = collection(db, col);
  if (filters.length)
    q = query(q, ...filters.map(([f,op,v]) => where(f,op,v)));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function fbAdd(col, data) {
  if (!fbReady) throw new Error('Firebase no listo');
  const { db, collection, addDoc } = window._fb;
  return (await addDoc(collection(db, col), data)).id;
}
async function fbDelete(col, id) {
  if (!fbReady) throw new Error('Firebase no listo');
  const { db, doc, deleteDoc } = window._fb;
  await deleteDoc(doc(db, col, id));
}
 
/* ══════════════════════════════════════════════
   MASCOTA GRANDE — SISTEMA DE ESTADOS
   Flujo: hidden → peek → visible → (frases) → shrink-to-cursor
══════════════════════════════════════════════ */
const FRASES_BIENVENIDA = [
  "¡Volviste, señorón! 👑",
  "Eso es responsabilidad, campeón 💪",
  "El que no falla, no para de crecer 🚀",
  "Tus tareas no se van a subir solas... ¡dale! 😄",
  "Presencia confirmada en el sistema ✅",
  "El estudiante ha regresado. El profe tiembla 😎",
  "La constancia hace al maestro, sigue así 🏆",
  "Eres de los que sí llegan, no de los que dicen 💯",
];
const FRASES_SUBIDA = [
  "¡Lo hiciste a tiempo, buen trabajo campeón! 🎉",
  "Tarea entregada. La responsabilidad te define 💼",
  "Así se hace, sin excusas ni pretextos 🔥",
  "¡Eso es disciplina pura! Sigue adelante 💪",
  "Archivo guardado. Eres un ejemplo a seguir 🏅",
  "La entrega puntual es el primer paso del éxito 📚",
];
const FRASES_BYE = [
  "¡Hasta la próxima, señorón! 👋",
  "Nos vemos pronto, campeón 🏆",
  "¡Que descanses! Mañana sigues siendo crack 🌙",
];
 
let mascotTimer = null;
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
 
// Rastrear cursor siempre
document.addEventListener('mousemove', (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
});
 
function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
 
function setMascotState(state) {
  const el = document.getElementById('mascot-wrap');
  el.className = 'mascot-wrap ' + state;
}
 
function mostrarMascota(frase) {
  if (mascotTimer) { clearTimeout(mascotTimer); mascotTimer = null; }
 
  const bubble = document.getElementById('mascot-bubble');
  bubble.classList.remove('show');
 
  // 1. Estado PEEK: se asoma por la derecha
  setMascotState('state-peek');
 
  setTimeout(() => {
    // 2. Estado VISIBLE: sale completo
    setMascotState('state-visible');
 
    setTimeout(() => {
      // 3. Mostrar burbuja
      bubble.textContent = frase;
      bubble.classList.add('show');
 
      // 4. Después de 4s, esconderse hacia el cursor
      mascotTimer = setTimeout(() => {
        bubble.classList.remove('show');
        setTimeout(() => encogersiaHaciaCursor(), 400);
      }, 4200);
 
    }, 600);
  }, 700);
}
 
function encogersiaHaciaCursor() {
  const el  = document.getElementById('mascot-wrap');
  const rect = el.getBoundingClientRect();
  const mascotCX = rect.left + rect.width / 2;
  const mascotCY = rect.top  + rect.height / 2;
 
  // Calcular diferencia hacia el cursor
  const dx = cursorX - mascotCX;
  const dy = cursorY - mascotCY;
 
  el.style.transition = 'transform 0.7s cubic-bezier(0.55,0,1,0.45), opacity 0.5s ease';
  el.style.transform  = `translate(${dx}px,${dy}px) scale(0.05)`;
  el.style.opacity    = '0';
 
  setTimeout(() => {
    el.style.transition = '';
    el.style.transform  = '';
    el.style.opacity    = '';
    setMascotState('state-hidden');
  }, 750);
}
 
function ocultarMascotaInmediato() {
  const bubble = document.getElementById('mascot-bubble');
  bubble.classList.remove('show');
  setMascotState('state-hidden');
  if (mascotTimer) { clearTimeout(mascotTimer); mascotTimer = null; }
}
 
/* ══════════════════════════════════════════════
   BYE OVERLAY — mascota sale, baila y se esconde
══════════════════════════════════════════════ */
function mostrarBye() {
  const overlay   = document.getElementById('bye-overlay');
  const zone      = document.getElementById('bye-mascot-zone');
 
  // Partículas
  generarParticulas();
 
  // Clonar SVG mascota
  const svg    = document.getElementById('mascot-svg').cloneNode(true);
  svg.style.cssText = 'width:220px;height:308px;';
  zone.innerHTML = '';
  zone.appendChild(svg);
 
  overlay.classList.remove('bye-hidden');
 
  // Cerrar elegantemente después de 3s
  setTimeout(() => {
    overlay.style.transition = 'opacity 0.8s ease';
    overlay.style.opacity    = '0';
    setTimeout(() => {
      overlay.style.opacity    = '';
      overlay.style.transition = '';
      overlay.classList.add('bye-hidden');
      // Limpiar navbar
      document.getElementById('btn-login-nav').classList.remove('hidden');
      document.getElementById('user-pill').classList.add('hidden');
    }, 850);
  }, 3000);
}
 
function generarParticulas() {
  const container = document.getElementById('bye-particles');
  container.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'bye-particle';
    const angle = Math.random() * 360;
    const dist  = 80 + Math.random() * 200;
    p.style.cssText = `
      left:${20+Math.random()*60}%;
      top:${20+Math.random()*60}%;
      width:${4+Math.random()*8}px;
      height:${4+Math.random()*8}px;
      background:${Math.random()>0.5?'#f97316':Math.random()>0.5?'#fff':'#ffb347'};
      --tx:${Math.cos(angle)*dist}px;
      --ty:${Math.sin(angle)*dist}px;
      --dur:${1.5+Math.random()*2}s;
      --delay:${Math.random()*0.5}s;
    `;
    container.appendChild(p);
  }
}
 
/* ══════════════════════════════════════════════
   MINI MASCOTA CURSOR
══════════════════════════════════════════════ */
const TIPS = {
  // Atributo data-tip definido en HTML directamente
};
 
let miniVisible = false;
let miniHideTimer = null;
 
function initMiniMascot() {
  const mini   = document.getElementById('mini-mascot');
  const bubble = document.getElementById('mini-bubble');
 
  // Seguir cursor
  document.addEventListener('mousemove', (e) => {
    mini.style.left = (e.clientX + 18) + 'px';
    mini.style.top  = (e.clientY - 14) + 'px';
  });
 
  // Detectar elementos con data-tip
  document.addEventListener('mouseover', (e) => {
    const el  = e.target.closest('[data-tip]');
    if (!el) return;
 
    const tip = el.getAttribute('data-tip');
    if (!tip) return;
 
    if (miniHideTimer) { clearTimeout(miniHideTimer); miniHideTimer = null; }
    bubble.textContent = tip;
    mini.classList.add('active');
    miniVisible = true;
  });
 
  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest('[data-tip]');
    if (!el) return;
    // Solo ocultar si realmente salimos del elemento
    const to = e.relatedTarget;
    if (to && el.contains(to)) return;
 
    miniHideTimer = setTimeout(() => {
      mini.classList.remove('active');
      miniVisible = false;
    }, 250);
  });
}
 
/* ══════ OJITO ══════ */
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  const open  = btn.querySelector('.eye-open');
  const closed = btn.querySelector('.eye-closed');
  if (input.type === 'password') {
    input.type = 'text';
    open.classList.add('hidden');
    closed.classList.remove('hidden');
  } else {
    input.type = 'password';
    open.classList.remove('hidden');
    closed.classList.add('hidden');
  }
}
 
/* ══════ TOGGLE CAMPO ADMIN ══════ */
let adminFieldVisible = false;
function toggleAdminField() {
  adminFieldVisible = !adminFieldVisible;
  const field = document.getElementById('admin-code-field');
  const btn   = document.getElementById('admin-toggle-btn');
  field.style.display = adminFieldVisible ? '' : 'none';
  btn.style.cssText   = adminFieldVisible
    ? 'border-color:var(--orange);color:var(--orange);'
    : '';
}
 
/* ══════ AUTH ══════ */
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
  // Reset campo admin
  if (!isLogin) {
    adminFieldVisible = false;
    document.getElementById('admin-code-field').style.display = 'none';
  }
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
  const code = (document.getElementById('r-code')?.value || '').trim();
  if (!user || !pass || !name) return showErr('Completa todos los campos.');
 
  // Determinar rol
  const role = code === ADMIN_SECRET ? 'ADMIN' : 'VIEWER';
 
  try {
    const existing = await fbGetAll('users', [['user','==',user]]);
    if (existing.length) return showErr('Ese usuario ya existe.');
    await fbAdd('users', { user, pass, name, role });
    const msg = role === 'ADMIN'
      ? '✅ ¡Cuenta ADMIN creada! Inicia sesión.'
      : '✅ Cuenta creada como Viewer. Inicia sesión.';
    showErr(msg);
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
  const initials = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('pill-avatar').textContent = initials;
  document.getElementById('pill-name').textContent   = u.name.toUpperCase();
  const roleEl = document.getElementById('pill-role');
  roleEl.textContent = u.role;
  roleEl.style.cssText = u.role === 'ADMIN'
    ? 'background:rgba(249,115,22,0.15);color:#f97316;border:1px solid rgba(249,115,22,0.3);font-family:var(--mono);font-size:9px;font-weight:600;padding:2px 6px;border-radius:3px;letter-spacing:1px;width:fit-content;'
    : 'background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.25);font-family:var(--mono);font-size:9px;font-weight:600;padding:2px 6px;border-radius:3px;letter-spacing:1px;width:fit-content;';
 
  // Mascota con animación completa
  mostrarMascota(rnd(FRASES_BIENVENIDA));
}
 
function doLogout() {
  currentUser = null;
  // La mascota sale una última vez antes del BYE
  ocultarMascotaInmediato();
  setTimeout(() => {
    mostrarBye();
  }, 100);
}
 
/* ══════ CONTADORES ══════ */
async function updateCounters() {
  try {
    const files = await fbGetAll('files');
    let total = 0;
    for (let i = 1; i <= 4; i++) {
      const n = files.filter(f => f.unit == i).length;
      total += n;
      const el = document.getElementById('c' + i);
      if (el) el.textContent = n + (n === 1 ? ' archivo' : ' archivos');
    }
    // Actualizar stat total en tarjeta
    const statEl = document.getElementById('stat-total');
    if (statEl) statEl.textContent = total;
  } catch {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById('c' + i);
      if (el) el.textContent = '— archivos';
    }
  }
}
 
/* ══════════════════════════════════════════════
   TARJETAS HERO — EXPANDIBLES
══════════════════════════════════════════════ */
const cardIds = ['info','contact','stats'];
const cardObjIds = ['card-info','card-contact','card-stats'];
const foIds = ['fo-a','fo-b','fo-c'];
 
function expandCard(id) {
  // Si ya está expandida, colapsar
  if (expandedCard === id) {
    collapseAllCards();
    return;
  }
 
  expandedCard = id;
 
  cardObjIds.forEach((cid, i) => {
    const el    = document.getElementById(cid);
    const foEl  = el; // misma referencia
    const expId = 'exp-' + cardIds[i];
 
    if (cardIds[i] === id) {
      // Esta se expande
      el.classList.add('expanded');
      el.classList.remove('pushed-left','pushed-right');
    } else {
      // Las otras se alejan
      el.classList.remove('expanded');
      const expandedIndex = cardIds.indexOf(id);
      const thisIndex     = cardIds.indexOf(cardIds[i]);
      el.classList.add(thisIndex < expandedIndex ? 'pushed-left' : 'pushed-right');
    }
  });
}
 
function collapseAllCards() {
  expandedCard = null;
  cardObjIds.forEach(cid => {
    const el = document.getElementById(cid);
    el.classList.remove('expanded','pushed-left','pushed-right');
  });
}
 
/* ══════ MODAL UNIDAD ══════ */
function openUnit(u) {
  activeUnit = u; activeWeek = null;
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
  document.querySelectorAll('.wbtn').forEach((b,i) => b.classList.toggle('active', i+1===w));
  document.getElementById('um-sub').textContent = 'Semana ' + w;
  renderFiles();
}
 
/* ══════ RENDER ARCHIVOS ══════ */
async function renderFiles() {
  const body = document.getElementById('unit-body');
  body.innerHTML = '<div class="loading-row"><div class="spin"></div> Cargando archivos…</div>';
  let files = [];
  try {
    files = await fbGetAll('files',[['unit','==',activeUnit],['week','==',activeWeek]]);
  } catch {
    body.innerHTML = '<div class="empty-msg">Error al conectar con Firebase.</div>';
    return;
  }
 
  let html = '';
 
  // Zona de subida — solo ADMIN con sesión
  if (currentUser !== null && currentUser.role === 'ADMIN') {
    html += `
      <div class="upload-zone">
        <span class="upload-label">↑ Subir archivo</span>
        <div class="upload-row1">
          <input type="text" id="f-title" placeholder="Título del trabajo académico">
        </div>
        <div class="upload-row2">
          <input type="file" id="f-file">
          <button class="btn-upload" onclick="uploadFile()" data-tip="Guardar tarea en la nube ☁️">Subir</button>
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
            <button class="btn-dl" onclick="downloadFile('${f.id}')" data-tip="Descargar este archivo 📥">↓ Descargar</button>
            ${currentUser?.role === 'ADMIN'
              ? `<button class="btn-del" onclick="deleteFile('${f.id}')" data-tip="Eliminar permanentemente 🗑️">✕</button>`
              : ''}
          </div>
        </div>`;
    });
    html += '</div>';
  }
 
  body.innerHTML = html;
}
 
/* ══════ CRUD ══════ */
async function uploadFile() {
  const titleEl   = document.getElementById('f-title');
  const fileInput = document.getElementById('f-file');
  const title     = titleEl?.value.trim() || '';
  const file      = fileInput?.files[0];
  if (!title || !file) return alert('Escribe un título y selecciona un archivo.');
 
  const btn = document.querySelector('.btn-upload');
  if (btn) { btn.textContent = 'Subiendo…'; btn.disabled = true; }
 
  const reader = new FileReader();
  reader.onload = async function () {
    try {
      await fbAdd('files',{unit:activeUnit,week:activeWeek,title,filename:file.name,data:reader.result,ts:Date.now()});
      await updateCounters();
      renderFiles();
      mostrarMascota(rnd(FRASES_SUBIDA));
    } catch(e) {
      alert('Error al subir. Revisa Firebase.');
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
    a.href = f.data; a.download = f.filename; a.click();
  } catch { alert('Error al descargar.'); }
}
 
async function deleteFile(id) {
  if (!confirm('¿Eliminar este archivo permanentemente?')) return;
  try {
    await fbDelete('files', id);
    await updateCounters();
    renderFiles();
  } catch { alert('Error al eliminar.'); }
}
