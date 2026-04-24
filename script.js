/* ═══════════════════════════════════════════════
   MOORI_OS — script.js v6
   ─────────────────────────────────────────────
   ✅ Canvas fondo con partículas y grid 3D
   ✅ Cursor personalizado con efecto hover
   ✅ Robot metálico con animaciones
   ✅ Terminal de frases animadas
   ✅ 3D tilt en tarjetas
   ✅ Firebase Firestore
   ✅ Registro VIEWER / ADMIN (código 999600911)
   ✅ Limpieza de campos al logout/login
   ✅ Subir archivos Y vínculos
═══════════════════════════════════════════════ */
 
/* ══════ FIREBASE ══════ */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDI5_UhyiFhz7FgELyg49YjvmltPcUfrvk",
  authDomain:        "josejose-49388.firebaseapp.com",
  projectId:         "josejose-49388",
  storageBucket:     "josejose-49388.firebasestorage.app",
  messagingSenderId: "297650955910",
  appId:             "1:297650955910:web:1867650fe8c3dc492bd307"
};
const ADMIN_SECRET = "999600911";
 
const _fb = document.createElement('script');
_fb.type = 'module';
_fb.textContent = `
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
  import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where }
    from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
  const app = initializeApp(${JSON.stringify(FIREBASE_CONFIG)});
  const db  = getFirestore(app);
  window._fb = { db, collection, getDocs, addDoc, deleteDoc, doc, query, where };
  window.dispatchEvent(new Event('firebase-ready'));
`;
document.head.appendChild(_fb);
 
/* ══════ ESTADO ══════ */
let currentUser = null;
let activeUnit  = null;
let activeWeek  = null;
let fbReady     = false;
let uploadMode  = 'file';
let mouseX = 0, mouseY = 0;
const unitNames = ['','Análisis de Datos','Diseño Relacional','Sentencias SQL','Protocolos de Seguridad'];
const WEEKS_PER_UNIT = 4, FILES_PER_WEEK = 2;
 
/* ══════ INIT ══════ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('user-pill').classList.add('hidden');
  document.getElementById('btn-login-nav').classList.remove('hidden');
 
  initBgCanvas();
  initCursor();
  initRobot();
  initTerminal();
  initTilt();
  initScrollAnimations();
});
 
window.addEventListener('firebase-ready', async () => {
  fbReady = true;
  await updateCounters();
});
 
/* ══════ FIREBASE HELPERS ══════ */
async function fbGetAll(col, filters = []) {
  if (!fbReady) throw new Error('FB no listo');
  const { db, collection, getDocs, query, where } = window._fb;
  let q = collection(db, col);
  if (filters.length) q = query(q, ...filters.map(([f,op,v]) => where(f,op,v)));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function fbAdd(col, data) {
  if (!fbReady) throw new Error('FB no listo');
  const { db, collection, addDoc } = window._fb;
  return (await addDoc(collection(db, col), data)).id;
}
async function fbDelete(col, id) {
  if (!fbReady) throw new Error('FB no listo');
  const { db, doc, deleteDoc } = window._fb;
  await deleteDoc(doc(db, col, id));
}
 
/* ══════════════════════════════════════════════
   CANVAS FONDO — partículas + grid
══════════════════════════════════════════════ */
function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], lines = [];
  const PARTICLE_COUNT = 80;
 
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
 
  // Inicializar partículas
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      r: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: 0.2 + Math.random() * 0.5,
      color: Math.random() > 0.5 ? '#0088ff' : (Math.random() > 0.5 ? '#00ff88' : '#ff0080')
    });
  }
 
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
 
    // Fondo base con gradiente radial
    const grd = ctx.createRadialGradient(W*0.5, H*0.4, 0, W*0.5, H*0.4, W*0.7);
    grd.addColorStop(0,   'rgba(0,40,80,0.3)');
    grd.addColorStop(0.5, 'rgba(0,10,30,0.2)');
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
 
    // Partículas
    particles.forEach(p => {
      p.x += p.vx + Math.sin(t * 0.01 + p.y * 0.01) * 0.1;
      p.y += p.vy + Math.cos(t * 0.01 + p.x * 0.01) * 0.1;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
 
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
 
    // Conectar partículas cercanas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,136,255,${0.06 * (1 - dist/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
 
    // Línea de horizonte glow
    const grdH = ctx.createLinearGradient(0, H*0.55, W, H*0.55);
    grdH.addColorStop(0,    'transparent');
    grdH.addColorStop(0.3,  'rgba(0,136,255,0.08)');
    grdH.addColorStop(0.5,  'rgba(0,136,255,0.15)');
    grdH.addColorStop(0.7,  'rgba(0,136,255,0.08)');
    grdH.addColorStop(1,    'transparent');
    ctx.fillStyle = grdH;
    ctx.fillRect(0, H*0.53, W, 4);
 
    t++;
    requestAnimationFrame(draw);
  }
  draw();
}
 
/* ══════════════════════════════════════════════
   CURSOR PERSONALIZADO
══════════════════════════════════════════════ */
function initCursor() {
  const dot  = document.getElementById('custom-cursor');
  const ring = document.getElementById('cursor-ring');
  let rx = 0, ry = 0;
 
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });
 
  // Ring con lag suave
  function animRing() {
    rx += (mouseX - rx) * 0.12;
    ry += (mouseY - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();
 
  // Hover en interactivos
  document.addEventListener('mouseover', e => {
    if (e.target.closest('button,a,[onclick],[data-tip],.ucard-3d,.info-card-3d,.module-item')) {
      ring.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('button,a,[onclick],[data-tip],.ucard-3d,.info-card-3d,.module-item')) {
      ring.classList.remove('hovering');
    }
  });
  document.addEventListener('mousedown', () => ring.classList.add('clicking'));
  document.addEventListener('mouseup',   () => ring.classList.remove('clicking'));
}
 
/* ══════════════════════════════════════════════
   ROBOT — aparece, habla, animaciones
══════════════════════════════════════════════ */
const FRASES_BIENVENIDA = [
  "¡Volviste, señorón! Sistema en línea 👾",
  "Acceso concedido. Bienvenido, campeón 💪",
  "Identificación verificada. ¡Qué responsabilidad! 🤖",
  "El estudiante ha regresado. El profe tiembla 😎",
  "La constancia hace al maestro 🏆",
  "Eres de los que sí llegan 💯",
];
const FRASES_SUBIDA = [
  "¡Archivo cargado! Buen trabajo, campeón 🎉",
  "Tarea registrada. La disciplina te define 💼",
  "¡Sin excusas, sin pretextos! Así se hace 🔥",
  "Upload completado. Eres un ejemplo 🏅",
  "La entrega puntual es el primer paso 📚",
];
 
let robotTimer = null;
 
function mostrarRobot(frase, delay = 0) {
  if (robotTimer) { clearTimeout(robotTimer); robotTimer = null; }
  const wrap   = document.getElementById('robot-wrap');
  const bubble = document.getElementById('robot-bubble');
  bubble.classList.remove('show');
 
  setTimeout(() => {
    wrap.classList.add('visible');
    wrap.classList.remove('bye-exit');
 
    setTimeout(() => {
      bubble.textContent = frase;
      bubble.classList.add('show');
 
      robotTimer = setTimeout(() => {
        bubble.classList.remove('show');
        setTimeout(() => {
          wrap.classList.remove('visible');
        }, 400);
      }, 5000);
    }, 600);
  }, delay);
}
 
function ocultarRobot() {
  const wrap   = document.getElementById('robot-wrap');
  const bubble = document.getElementById('robot-bubble');
  bubble.classList.remove('show');
  wrap.classList.remove('visible');
  if (robotTimer) { clearTimeout(robotTimer); robotTimer = null; }
}
 
function initRobot() {
  // El robot sigue ligeramente el mouse (parallax)
  document.addEventListener('mousemove', e => {
    const svg = document.getElementById('robot-svg');
    if (!svg) return;
    const cx = window.innerWidth - 160;
    const cy = window.innerHeight - 200;
    const dx = (e.clientX - cx) / window.innerWidth * 8;
    const dy = (e.clientY - cy) / window.innerHeight * 6;
    svg.style.transform = `translateX(${dx}px) translateY(${dy}px)`;
  });
}
 
function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
 
/* ══════════════════════════════════════════════
   TERMINAL DE FRASES (hero)
══════════════════════════════════════════════ */
function initTerminal() {
  const lines = document.querySelectorAll('.terminal-line');
  let current = 0;
  setInterval(() => {
    lines.forEach((l, i) => {
      l.classList.remove('active','dim');
      if (i === current) l.classList.add('active');
      else if (i < current) l.classList.add('dim');
    });
    current = (current + 1) % lines.length;
  }, 2200);
}
 
/* ══════════════════════════════════════════════
   EFECTO TILT 3D en tarjetas
══════════════════════════════════════════════ */
function initTilt() {
  document.querySelectorAll('.ucard-3d, .info-card-3d').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const rx = ((e.clientY - cy) / rect.height) * 8;
      const ry = ((e.clientX - cx) / rect.width)  * -8;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
 
/* ══════════════════════════════════════════════
   SCROLL ANIMATIONS
══════════════════════════════════════════════ */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity    = '1';
        e.target.style.transform  = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
 
  document.querySelectorAll('.ucard-3d, .info-card-3d, .section-header').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });
}
 
/* ══════ BYE ══════ */
function mostrarBye() {
  generarParticulas();
  const ov = document.getElementById('bye-overlay');
  ov.classList.remove('bye-hidden');
 
  // Canvas de ondas en bye
  const c = document.getElementById('bye-canvas');
  const ctx = c.getContext('2d');
  c.width = window.innerWidth; c.height = window.innerHeight;
  let t = 0;
  const drawBye = () => {
    if (ov.classList.contains('bye-hidden')) return;
    ctx.clearRect(0, 0, c.width, c.height);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0,136,255,${0.08 - i*0.02})`;
      ctx.lineWidth = 1.5 - i*0.3;
      for (let x = 0; x < c.width; x += 3) {
        const y = c.height/2 + Math.sin((x + t + i*50) * 0.015) * (60 + i*20);
        x === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    t += 2;
    requestAnimationFrame(drawBye);
  };
  drawBye();
 
  setTimeout(() => {
    ov.style.transition = 'opacity 0.8s ease';
    ov.style.opacity    = '0';
    setTimeout(() => {
      ov.style.opacity = ''; ov.style.transition = '';
      ov.classList.add('bye-hidden');
      document.getElementById('btn-login-nav').classList.remove('hidden');
      document.getElementById('user-pill').classList.add('hidden');
    }, 850);
  }, 3200);
}
 
function generarParticulas() {
  const c = document.getElementById('bye-particles');
  c.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'bye-particle';
    const angle = Math.random() * 360;
    const dist  = 100 + Math.random() * 250;
    const colors = ['#0088ff','#00ff88','#ff0080','#ffffff','#f97316'];
    p.style.cssText = `
      left:${10+Math.random()*80}%;top:${10+Math.random()*80}%;
      width:${3+Math.random()*7}px;height:${3+Math.random()*7}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      --tx:${Math.cos(angle*Math.PI/180)*dist}px;
      --ty:${Math.sin(angle*Math.PI/180)*dist}px;
      --dur:${1.5+Math.random()*2}s;
      --delay:${Math.random()*0.4}s;
    `;
    c.appendChild(p);
  }
}
 
/* ══════ OJITO ══════ */
function togglePass(inputId, btn) {
  const i  = document.getElementById(inputId);
  const o  = btn.querySelector('.eye-open');
  const cl = btn.querySelector('.eye-closed');
  if (i.type === 'password') { i.type='text'; o.classList.add('hidden'); cl.classList.remove('hidden'); }
  else { i.type='password'; o.classList.remove('hidden'); cl.classList.add('hidden'); }
}
 
/* ══════ ADMIN TOGGLE ══════ */
let adminVisible = false;
function toggleAdminField() {
  adminVisible = !adminVisible;
  document.getElementById('admin-code-field').style.display = adminVisible ? '' : 'none';
  const btn = document.getElementById('admin-toggle-btn');
  btn.style.cssText = adminVisible ? 'border-color:rgba(0,136,255,0.4);color:var(--accent);' : '';
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
function showErr(msg) { document.getElementById('auth-err').textContent = msg; }
 
function switchTab(tab) {
  document.getElementById('auth-err').textContent = '';
  const isL = tab === 'login';
  document.getElementById('f-login').style.display = isL ? '' : 'none';
  document.getElementById('f-reg').style.display   = isL ? 'none' : '';
  document.getElementById('t-login').classList.toggle('active', isL);
  document.getElementById('t-reg').classList.toggle('active', !isL);
  if (!isL) { adminVisible = false; document.getElementById('admin-code-field').style.display = 'none'; }
}
 
async function doLogin() {
  const user = document.getElementById('l-user').value.trim();
  const pass = document.getElementById('l-pass').value.trim();
  if (!user || !pass) return showErr('COMPLETA TODOS LOS CAMPOS');
  try {
    const users = await fbGetAll('users', [['user','==',user],['pass','==',pass]]);
    if (!users.length) return showErr('USUARIO O CONTRASEÑA INCORRECTOS');
    loginSuccess(users[0]);
  } catch(e) { showErr('ERROR DE CONEXIÓN · VERIFICA FIREBASE'); }
}
 
async function doRegister() {
  const user = document.getElementById('r-user').value.trim();
  const pass = document.getElementById('r-pass').value.trim();
  const name = document.getElementById('r-name').value.trim();
  const code = (document.getElementById('r-code')?.value || '').trim();
  if (!user || !pass || !name) return showErr('COMPLETA TODOS LOS CAMPOS');
  const role = code === ADMIN_SECRET ? 'ADMIN' : 'VIEWER';
  try {
    const ex = await fbGetAll('users', [['user','==',user]]);
    if (ex.length) return showErr('ESE USUARIO YA EXISTE');
    await fbAdd('users', { user, pass, name, role });
    showErr(role==='ADMIN' ? '✅ CUENTA ADMIN CREADA · INICIA SESIÓN' : '✅ CUENTA CREADA · INICIA SESIÓN');
    switchTab('login');
    document.getElementById('l-user').value = user;
  } catch { showErr('ERROR AL REGISTRAR · VERIFICA FIREBASE'); }
}
 
function loginSuccess(u) {
  currentUser = u;
  cerrarLogin();
  // ✅ Limpiar campos
  document.getElementById('l-user').value = '';
  document.getElementById('l-pass').value = '';
 
  document.getElementById('btn-login-nav').classList.add('hidden');
  const pill = document.getElementById('user-pill');
  pill.classList.remove('hidden');
  const ini = u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('pill-avatar').textContent = ini;
  document.getElementById('pill-name').textContent   = u.name.toUpperCase();
  const re = document.getElementById('pill-role');
  re.textContent = u.role;
  re.style.cssText = u.role === 'ADMIN'
    ? 'background:rgba(0,255,136,0.12);color:#00ff88;border:1px solid rgba(0,255,136,0.3);'
    : 'background:rgba(0,136,255,0.1);color:#0088ff;border:1px solid rgba(0,136,255,0.25);';
  re.style.cssText += 'font-family:var(--mono);font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;letter-spacing:1px;width:fit-content;';
 
  mostrarRobot(rnd(FRASES_BIENVENIDA));
}
 
function doLogout() {
  currentUser = null;
  // ✅ Limpiar campos
  document.getElementById('l-user').value = '';
  document.getElementById('l-pass').value = '';
  ocultarRobot();
  setTimeout(() => mostrarBye(), 100);
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
    const se = document.getElementById('stat-files');
    if (se) se.textContent = total;
  } catch {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById('c' + i);
      if (el) el.textContent = '— archivos';
    }
  }
}
 
/* ══════ INFO CARDS ══════ */
function toggleInfoCard(id) {
  const body = document.getElementById('icb-' + id);
  const card = document.getElementById('ic-' + id);
  const chev = document.getElementById('chev-' + id);
  const isOpen = !body.classList.contains('hidden');
  if (id === 'progreso' && !isOpen) renderProgress();
  body.classList.toggle('hidden', isOpen);
  card.classList.toggle('open', !isOpen);
}
 
async function renderProgress() {
  const bars   = document.getElementById('progress-bars');
  const tipMsg = document.getElementById('ic-tip-msg');
  bars.innerHTML = '<div class="prog-loading">CALCULANDO…</div>';
  let allFiles = [];
  try { allFiles = await fbGetAll('files'); } catch { bars.innerHTML = '<div class="prog-loading">ERROR DE CONEXIÓN</div>'; return; }
 
  const MAX = WEEKS_PER_UNIT * FILES_PER_WEEK;
  let missing = null, html = '';
  const clrs = ['','','u2','u3','u4'];
 
  for (let u = 1; u <= 4; u++) {
    const count = allFiles.filter(f => f.unit == u).length;
    const pct   = Math.min(100, Math.round(count / MAX * 100));
    if (count === 0 && missing === null) missing = u;
    html += `
      <div class="prog-unit">
        <div class="prog-head">
          <span class="prog-label">${unitNames[u]}</span>
          <span class="prog-pct">${pct}% · ${count}/${MAX}</span>
        </div>
        <div class="prog-bar-bg">
          <div class="prog-bar-fill ${clrs[u]}" id="pb${u}" style="width:0%"></div>
        </div>
      </div>`;
  }
  bars.innerHTML = html;
  requestAnimationFrame(() => {
    for (let u = 1; u <= 4; u++) {
      const count = allFiles.filter(f => f.unit == u).length;
      const pct   = Math.min(100, Math.round(count / MAX * 100));
      setTimeout(() => {
        const b = document.getElementById('pb' + u);
        if (b) b.style.width = pct + '%';
      }, u * 120);
    }
  });
  if (missing !== null) {
    tipMsg.textContent = `⚠️ ${unitNames[missing]} no tiene archivos. ¡Es momento de subir tus tareas!`;
    tipMsg.classList.remove('hidden');
  } else {
    tipMsg.classList.add('hidden');
  }
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
function cerrarUnidad() { document.getElementById('ov-unit').classList.remove('open'); }
 
function selectWeek(w) {
  activeWeek = w;
  document.querySelectorAll('.wbtn').forEach((b,i) => b.classList.toggle('active', i+1===w));
  document.getElementById('um-sub').textContent = 'SEMANA ' + w;
  renderFiles();
}
 
/* ══════ RENDER ARCHIVOS ══════ */
async function renderFiles() {
  const body = document.getElementById('unit-body');
  body.innerHTML = '<div class="loading-row"><div class="spin"></div> CARGANDO…</div>';
  let files = [];
  try { files = await fbGetAll('files',[['unit','==',activeUnit],['week','==',activeWeek]]); }
  catch { body.innerHTML = '<div class="empty-msg">ERROR DE CONEXIÓN</div>'; return; }
 
  let html = '';
  if (currentUser?.role === 'ADMIN') {
    html += `
      <div class="upload-zone">
        <span class="upload-label">↑ AGREGAR CONTENIDO</span>
        <div class="upload-tabs">
          <button class="utab ${uploadMode==='file'?'active':''}" onclick="setUploadMode('file')">📄 ARCHIVO</button>
          <button class="utab ${uploadMode==='link'?'active':''}" onclick="setUploadMode('link')">🔗 VÍNCULO</button>
        </div>
        <div class="upload-row1">
          <input type="text" id="f-title" placeholder="Título del contenido">
        </div>
        <div id="upload-file-zone" class="upload-row2" style="display:${uploadMode==='file'?'flex':'none'}">
          <input type="file" id="f-file">
          <button class="btn-upload" onclick="uploadFile()">SUBIR</button>
        </div>
        <div id="upload-link-zone" class="upload-row3" style="display:${uploadMode==='link'?'flex':'none'}">
          <input type="text" id="f-url" placeholder="https://...">
          <button class="btn-upload" onclick="uploadLink()">GUARDAR</button>
        </div>
      </div>`;
  }
 
  if (files.length === 0) {
    html += '<div class="empty-msg">SIN ARCHIVOS EN ESTA SEMANA</div>';
  } else {
    html += '<div class="file-list">';
    files.forEach(f => {
      const isLink   = f.type === 'link';
      const canAdmin = currentUser?.role === 'ADMIN';
      html += `
        <div class="fitem ${isLink?'is-link':''}">
          <div class="finfo">
            <div class="fname">${isLink?'🔗 ':'📄 '}${f.title}</div>
            <div class="fmeta">${isLink ? f.url : f.filename}</div>
          </div>
          <div class="factions">
            ${isLink
              ? `<button class="btn-open-link" onclick="openLink('${f.url}')">↗ ABRIR</button>`
              : `<button class="btn-dl" onclick="downloadFile('${f.id}')">↓ DESCARGAR</button>`}
            ${canAdmin ? `<button class="btn-del" onclick="deleteFile('${f.id}')">✕</button>` : ''}
          </div>
        </div>`;
    });
    html += '</div>';
  }
  body.innerHTML = html;
}
 
function setUploadMode(mode) {
  uploadMode = mode;
  const fz = document.getElementById('upload-file-zone');
  const lz = document.getElementById('upload-link-zone');
  if (fz) fz.style.display = mode==='file' ? 'flex' : 'none';
  if (lz) lz.style.display = mode==='link' ? 'flex' : 'none';
  document.querySelectorAll('.utab').forEach((t,i) => {
    t.classList.toggle('active', (i===0&&mode==='file')||(i===1&&mode==='link'));
  });
}
 
async function uploadFile() {
  const title = document.getElementById('f-title')?.value.trim() || '';
  const file  = document.getElementById('f-file')?.files[0];
  if (!title || !file) return alert('Escribe un título y selecciona un archivo.');
  const btn = document.querySelector('.btn-upload');
  if (btn) { btn.textContent = 'SUBIENDO…'; btn.disabled = true; }
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      await fbAdd('files',{type:'file',unit:activeUnit,week:activeWeek,title,filename:file.name,data:reader.result,ts:Date.now()});
      await updateCounters(); renderFiles();
      mostrarRobot(rnd(FRASES_SUBIDA));
    } catch { alert('Error al subir.'); if(btn){btn.textContent='SUBIR';btn.disabled=false;} }
  };
  reader.readAsDataURL(file);
}
 
async function uploadLink() {
  const title = document.getElementById('f-title')?.value.trim() || '';
  const url   = document.getElementById('f-url')?.value.trim() || '';
  if (!title || !url) return alert('Escribe un título y la URL.');
  if (!url.startsWith('http')) return alert('La URL debe empezar con http:// o https://');
  const btn = document.querySelector('.btn-upload');
  if (btn) { btn.textContent = 'GUARDANDO…'; btn.disabled = true; }
  try {
    await fbAdd('files',{type:'link',unit:activeUnit,week:activeWeek,title,url,ts:Date.now()});
    await updateCounters(); renderFiles();
    mostrarRobot(rnd(FRASES_SUBIDA));
  } catch { alert('Error al guardar.'); if(btn){btn.textContent='GUARDAR';btn.disabled=false;} }
}
 
function openLink(url) { window.open(url,'_blank','noopener'); }
 
async function downloadFile(id) {
  try {
    const files = await fbGetAll('files');
    const f = files.find(x => x.id===id);
    if (!f) return alert('Archivo no encontrado.');
    const a = document.createElement('a');
    a.href=f.data; a.download=f.filename; a.click();
  } catch { alert('Error al descargar.'); }
}
 
async function deleteFile(id) {
  if (!confirm('¿Eliminar permanentemente?')) return;
  try { await fbDelete('files',id); await updateCounters(); renderFiles(); }
  catch { alert('Error al eliminar.'); }
}
 
