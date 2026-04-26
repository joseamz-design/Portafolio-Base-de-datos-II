/* ═══════════════════════════════════════════
   MOORI_OS — script.js v7
   Firebase · Robot · Cursor · Auth · CRUD
═══════════════════════════════════════════ */
 
/* ── FIREBASE ── */
const FB_CFG = {
  apiKey:            "AIzaSyDI5_UhyiFhz7FgELyg49YjvmltPcUfrvk",
  authDomain:        "josejose-49388.firebaseapp.com",
  projectId:         "josejose-49388",
  storageBucket:     "josejose-49388.firebasestorage.app",
  messagingSenderId: "297650955910",
  appId:             "1:297650955910:web:1867650fe8c3dc492bd307"
};
const ADMIN_CODE = "999600911";
const MAX_FILES  = 8; // 4 semanas × 2 archivos por unidad
 
const _s = document.createElement('script');
_s.type  = 'module';
_s.textContent = `
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
  import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where }
    from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
  const app = initializeApp(${JSON.stringify(FB_CFG)});
  const db  = getFirestore(app);
  window._db = { db, collection, getDocs, addDoc, deleteDoc, doc, query, where };
  window.dispatchEvent(new Event('fb-ready'));
`;
document.head.appendChild(_s);
 
/* ── ESTADO ── */
let user      = null;
let fbOk      = false;
let unitActive = null;
let weekActive = null;
let uploadMode = 'file';
 
const unitNames = ['','Análisis de Datos','Diseño Relacional','Sentencias SQL','Protocolos de Seguridad'];
const unitColors = ['','#6366f1','#8b5cf6','#06b6d4','#10b981'];
 
/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('user-pill').classList.add('hidden');
  initCursor();
  initRobot();
  initScrollFade();
});
 
window.addEventListener('fb-ready', async () => {
  fbOk = true;
  await refreshCounters();
});
 
/* ── FIREBASE HELPERS ── */
async function dbGet(col, filters = []) {
  if (!fbOk) throw 0;
  const { db, collection, getDocs, query, where } = window._db;
  let q = collection(db, col);
  if (filters.length) q = query(q, ...filters.map(([f,o,v]) => where(f,o,v)));
  return (await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
}
async function dbAdd(col, data) {
  if (!fbOk) throw 0;
  const { db, collection, addDoc } = window._db;
  return (await addDoc(collection(db, col), data)).id;
}
async function dbDel(col, id) {
  if (!fbOk) throw 0;
  const { db, doc, deleteDoc } = window._db;
  await deleteDoc(doc(db, col, id));
}
 
/* ═══════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════ */
function initCursor() {
  const el = document.getElementById('cur');
  document.addEventListener('mousemove', e => {
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mouseover', e => {
    if (e.target.closest('button,a,[onclick]')) el.classList.add('big');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('button,a,[onclick]')) el.classList.remove('big');
  });
}
 
/* ═══════════════════════════════════════════
   ROBOT
   - Siempre está en la esquina inferior derecha
   - Por defecto: solo la cabeza visible (robot-peek)
   - Al iniciar sesión: sale completo (robot-show), habla, luego vuelve a peek
   - Al subir archivo: asoma brevemente
═══════════════════════════════════════════ */
const HELLO_PHRASES = [
  "¡Volviste, señorón! 👋",
  "Acceso concedido. ¡Bienvenido! 🤖",
  "Sistema en línea. ¡Qué puntualidad! ✅",
  "El estudiante ha regresado. 🎓",
  "La constancia hace al maestro. 💪",
];
const UPLOAD_PHRASES = [
  "¡Archivo guardado! Buen trabajo. 🎉",
  "Tarea entregada. ¡Así se hace! 🔥",
  "Upload exitoso. Eres un crack. 💼",
  "Disciplina pura. ¡Sigue así! 🏅",
];
 
let robotTimer = null;
 
function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
 
function initRobot() {
  // El robot siempre empieza en peek (solo cabeza visible)
  // Nada más que hacer en init.
}
 
function robotSpeak(phrase, fullBody = false) {
  const robot   = document.getElementById('robot');
  const speech  = document.getElementById('robot-speech');
  if (robotTimer) { clearTimeout(robotTimer); robotTimer = null; }
 
  speech.classList.remove('show');
 
  // Primero salir
  robot.classList.remove('robot-peek','robot-show','robot-hide');
  robot.classList.add(fullBody ? 'robot-show' : 'robot-peek');
 
  setTimeout(() => {
    speech.textContent = phrase;
    speech.classList.add('show');
 
    robotTimer = setTimeout(() => {
      speech.classList.remove('show');
      setTimeout(() => {
        // Volver a peek (solo cabeza)
        robot.classList.remove('robot-show');
        robot.classList.add('robot-peek');
      }, 300);
    }, 4800);
  }, fullBody ? 700 : 400);
}
 
function robotHide() {
  const robot  = document.getElementById('robot');
  const speech = document.getElementById('robot-speech');
  speech.classList.remove('show');
  robot.classList.remove('robot-peek','robot-show');
  robot.classList.add('robot-hide');
  if (robotTimer) { clearTimeout(robotTimer); robotTimer = null; }
}
 
/* ═══════════════════════════════════════════
   SCROLL FADE IN
═══════════════════════════════════════════ */
function initScrollFade() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08 });
 
  document.querySelectorAll('.ucard,.info-card,.deco-card').forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition= 'opacity .6s ease, transform .6s ease';
    obs.observe(el);
  });
}
 
/* ═══════════════════════════════════════════
   AUTH
═══════════════════════════════════════════ */
function openLogin() {
  document.getElementById('ov-login').classList.add('open');
  document.getElementById('merr').textContent = '';
}
function closeLogin() {
  document.getElementById('ov-login').classList.remove('open');
  document.getElementById('merr').textContent = '';
}
function setErr(msg) { document.getElementById('merr').textContent = msg; }
 
function switchTab(t) {
  document.getElementById('merr').textContent = '';
  const isL = t === 'l';
  document.getElementById('f-l').style.display   = isL ? '' : 'none';
  document.getElementById('f-r').style.display   = isL ? 'none' : '';
  document.getElementById('t-l').classList.toggle('active', isL);
  document.getElementById('t-r').classList.toggle('active', !isL);
  if (!isL) { adminOpen = false; document.getElementById('r-code-wrap').style.display = 'none'; }
}
 
let adminOpen = false;
function toggleAdmin() {
  adminOpen = !adminOpen;
  document.getElementById('r-code-wrap').style.display = adminOpen ? '' : 'none';
  const btn = document.getElementById('btn-toggle-admin');
  btn.style.cssText = adminOpen ? 'border-color:rgba(99,102,241,.4);color:var(--accent);' : '';
}
 
async function doLogin() {
  const u = document.getElementById('l-u').value.trim();
  const p = document.getElementById('l-p').value.trim();
  if (!u || !p) return setErr('Completa todos los campos.');
  try {
    const rows = await dbGet('users', [['user','==',u],['pass','==',p]]);
    if (!rows.length) return setErr('Usuario o contraseña incorrectos.');
    loginOk(rows[0]);
  } catch { setErr('Error de conexión. Verifica Firebase.'); }
}
 
async function doRegister() {
  const u = document.getElementById('r-u').value.trim();
  const p = document.getElementById('r-p').value.trim();
  const n = document.getElementById('r-n').value.trim();
  const c = (document.getElementById('r-c')?.value || '').trim();
  if (!u || !p || !n) return setErr('Completa todos los campos.');
  const role = c === ADMIN_CODE ? 'ADMIN' : 'VIEWER';
  try {
    const ex = await dbGet('users', [['user','==',u]]);
    if (ex.length) return setErr('Ese usuario ya existe.');
    await dbAdd('users', { user:u, pass:p, name:n, role });
    setErr(role==='ADMIN' ? '✅ Cuenta ADMIN creada. Inicia sesión.' : '✅ Cuenta creada. Inicia sesión.');
    switchTab('l');
    document.getElementById('l-u').value = u;
  } catch { setErr('Error al registrar. Verifica Firebase.'); }
}
 
function loginOk(u) {
  user = u;
  closeLogin();
  // Limpiar campos
  document.getElementById('l-u').value = '';
  document.getElementById('l-p').value = '';
 
  // Navbar
  document.getElementById('btn-login').classList.add('hidden');
  const pill = document.getElementById('user-pill');
  pill.classList.remove('hidden');
 
  const ini = u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('pill-av').textContent   = ini;
  document.getElementById('pill-name').textContent  = u.name;
  const re = document.getElementById('pill-role');
  re.textContent = u.role;
  re.style.cssText = u.role === 'ADMIN'
    ? 'background:rgba(99,102,241,.15);color:#6366f1;border:1px solid rgba(99,102,241,.3);'
    : 'background:rgba(255,255,255,.05);color:#888;border:1px solid #222;';
  re.style.cssText += 'font-family:var(--mono);font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;letter-spacing:.8px;';
 
  // Robot sale completo y habla
  robotSpeak(rnd(HELLO_PHRASES), true);
}
 
function doLogout() {
  user = null;
  // Limpiar campos
  document.getElementById('l-u').value = '';
  document.getElementById('l-p').value = '';
 
  document.getElementById('btn-login').classList.remove('hidden');
  document.getElementById('user-pill').classList.add('hidden');
 
  // Robot se esconde
  robotHide();
 
  // BYE
  setTimeout(() => {
    const bye = document.getElementById('bye');
    bye.classList.remove('bye-off');
    setTimeout(() => {
      bye.style.opacity = '0';
      setTimeout(() => {
        bye.style.opacity = '';
        bye.classList.add('bye-off');
        // Volver a peek
        const robot = document.getElementById('robot');
        robot.classList.remove('robot-hide');
        robot.classList.add('robot-peek');
      }, 750);
    }, 2800);
  }, 200);
}
 
/* ── OJITO ── */
function tp(id, btn) {
  const i  = document.getElementById(id);
  const eo = btn.querySelector('.eo');
  const ec = btn.querySelector('.ec');
  if (i.type === 'password') { i.type='text'; eo.classList.add('hidden'); ec.classList.remove('hidden'); }
  else { i.type='password'; eo.classList.remove('hidden'); ec.classList.add('hidden'); }
}
 
/* ═══════════════════════════════════════════
   CONTADORES
═══════════════════════════════════════════ */
async function refreshCounters() {
  try {
    const files = await dbGet('files');
    let total = 0;
    for (let i = 1; i <= 4; i++) {
      const n = files.filter(f => f.unit == i).length;
      total += n;
      const el = document.getElementById('c' + i);
      if (el) el.textContent = n + ' archivo' + (n !== 1 ? 's' : '');
    }
    const st = document.getElementById('stat-total');
    if (st) st.textContent = total;
  } catch {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById('c' + i);
      if (el) el.textContent = '—';
    }
  }
}
 
/* ═══════════════════════════════════════════
   INFO CARDS
═══════════════════════════════════════════ */
function toggleCard(id) {
  const body = document.getElementById('icb-' + id);
  const card = document.getElementById('ic-' + id);
  const tog  = document.getElementById('ict-' + id);
  const isOpen = body.classList.contains('visible');
  if (!isOpen && id === 'progreso') renderProgress();
  body.classList.toggle('visible', !isOpen);
  card.classList.toggle('open', !isOpen);
}
 
async function renderProgress() {
  const bars  = document.getElementById('prog-bars');
  const alert = document.getElementById('prog-alert');
  bars.innerHTML = '<p class="prog-loading">Calculando…</p>';
  let files = [];
  try { files = await dbGet('files'); }
  catch { bars.innerHTML = '<p class="prog-loading">Error de conexión.</p>'; return; }
 
  let missingUnit = null, html = '';
  const clrs = ['','','','u3','u4'];
  const bg   = ['','#6366f1','#8b5cf6','#06b6d4','#10b981'];
 
  for (let u = 1; u <= 4; u++) {
    const count = files.filter(f => f.unit == u).length;
    const pct   = Math.min(100, Math.round(count / MAX_FILES * 100));
    if (count === 0 && missingUnit === null) missingUnit = u;
    html += `
      <div class="prog-unit">
        <div class="prog-head">
          <span class="prog-label">${unitNames[u]}</span>
          <span class="prog-pct">${pct}% · ${count}/${MAX_FILES}</span>
        </div>
        <div class="prog-track">
          <div class="prog-fill" id="pf${u}" style="background:${bg[u]}"></div>
        </div>
      </div>`;
  }
  bars.innerHTML = html;
  requestAnimationFrame(() => {
    for (let u = 1; u <= 4; u++) {
      const count = files.filter(f => f.unit == u).length;
      const pct   = Math.min(100, Math.round(count / MAX_FILES * 100));
      setTimeout(() => {
        const el = document.getElementById('pf' + u);
        if (el) el.style.width = pct + '%';
      }, u * 100);
    }
  });
 
  if (missingUnit) {
    alert.textContent = `⚠️ La ${unitNames[missingUnit]} no tiene archivos aún. ¡Es momento de subir!`;
    alert.classList.remove('hidden');
  } else {
    alert.classList.add('hidden');
  }
}
 
/* ═══════════════════════════════════════════
   MODAL UNIDAD
═══════════════════════════════════════════ */
function openUnit(u) {
  unitActive = u; weekActive = null;
  document.getElementById('u-num').textContent   = '0' + u;
  document.getElementById('u-title').textContent = unitNames[u];
  document.querySelectorAll('.wtab').forEach(b => b.classList.remove('active'));
  document.getElementById('u-body').innerHTML    = '<p class="u-hint">Selecciona una semana</p>';
  document.getElementById('ov-unit').classList.add('open');
}
function closeUnit() { document.getElementById('ov-unit').classList.remove('open'); }
 
function selWeek(w) {
  weekActive = w;
  document.querySelectorAll('.wtab').forEach((b,i) => b.classList.toggle('active', i+1===w));
  renderFiles();
}
 
/* ═══════════════════════════════════════════
   RENDER ARCHIVOS
═══════════════════════════════════════════ */
async function renderFiles() {
  const body = document.getElementById('u-body');
  body.innerHTML = '<div class="load-row"><div class="spin"></div> Cargando…</div>';
  let files = [];
  try {
    files = await dbGet('files', [['unit','==',unitActive],['week','==',weekActive]]);
  } catch {
    body.innerHTML = '<p class="u-hint">Error de conexión.</p>';
    return;
  }
 
  let html = '';
 
  // Zona de subida — solo ADMIN con sesión iniciada
  if (user?.role === 'ADMIN') {
    html += `
      <div class="upload-box">
        <span class="upload-label-top">Agregar contenido</span>
        <div class="upload-mode-tabs">
          <button class="umtab ${uploadMode==='file'?'active':''}" onclick="setMode('file')">📄 Archivo</button>
          <button class="umtab ${uploadMode==='link'?'active':''}" onclick="setMode('link')">🔗 Vínculo</button>
        </div>
        <div class="upload-row">
          <input type="text" id="ft" placeholder="Título del trabajo académico">
        </div>
        <div id="zone-file" class="upload-row-file" style="display:${uploadMode==='file'?'flex':'none'}">
          <input type="file" id="ff">
          <button class="btn-upload" onclick="doUploadFile()">Subir</button>
        </div>
        <div id="zone-link" class="upload-row" style="display:${uploadMode==='link'?'block':'none'}">
          <input type="text" id="fu" placeholder="https://...">
          <button class="btn-upload" style="margin-top:6px;width:100%;text-align:center;" onclick="doUploadLink()">Guardar vínculo</button>
        </div>
      </div>`;
  }
 
  if (files.length === 0) {
    html += '<p class="empty-hint">Sin archivos en esta semana.</p>';
  } else {
    html += '<div class="file-list">';
    files.forEach(f => {
      const isLink = f.type === 'link';
      const canDel = user?.role === 'ADMIN';
      html += `
        <div class="fitem ${isLink?'is-link':''}">
          <div class="fi-info">
            <div class="fi-name">${isLink?'🔗 ':'📄 '}${f.title}</div>
            <div class="fi-meta">${isLink ? f.url : f.filename}</div>
          </div>
          <div class="fi-acts">
            ${isLink
              ? `<button class="btn-link" onclick="window.open('${f.url}','_blank','noopener')">↗ Abrir</button>`
              : `<button class="btn-dl" onclick="doDownload('${f.id}')">↓ Descargar</button>`
            }
            ${canDel ? `<button class="btn-del" onclick="doDelete('${f.id}')">✕</button>` : ''}
          </div>
        </div>`;
    });
    html += '</div>';
  }
  body.innerHTML = html;
}
 
function setMode(m) {
  uploadMode = m;
  const zf = document.getElementById('zone-file');
  const zl = document.getElementById('zone-link');
  if (zf) zf.style.display = m==='file' ? 'flex' : 'none';
  if (zl) zl.style.display = m==='link' ? 'block' : 'none';
  document.querySelectorAll('.umtab').forEach((t,i) => {
    t.classList.toggle('active', (i===0&&m==='file')||(i===1&&m==='link'));
  });
}
 
/* ── CRUD ── */
async function doUploadFile() {
  const title = document.getElementById('ft')?.value.trim() || '';
  const file  = document.getElementById('ff')?.files[0];
  if (!title || !file) return alert('Escribe un título y selecciona un archivo.');
  const btn = document.querySelector('.btn-upload');
  if (btn) { btn.textContent = 'Subiendo…'; btn.disabled = true; }
  const r = new FileReader();
  r.onload = async () => {
    try {
      await dbAdd('files', {
        type:'file', unit:unitActive, week:weekActive,
        title, filename:file.name, data:r.result, ts:Date.now()
      });
      await refreshCounters();
      renderFiles();
      robotSpeak(rnd(UPLOAD_PHRASES), false);
    } catch { alert('Error al subir.'); if(btn){btn.textContent='Subir';btn.disabled=false;} }
  };
  r.readAsDataURL(file);
}
 
async function doUploadLink() {
  const title = document.getElementById('ft')?.value.trim() || '';
  const url   = document.getElementById('fu')?.value.trim() || '';
  if (!title || !url) return alert('Escribe un título y la URL.');
  if (!url.startsWith('http')) return alert('La URL debe empezar con http(s)://');
  const btn = document.querySelector('.btn-upload:last-child');
  if (btn) { btn.textContent = 'Guardando…'; btn.disabled = true; }
  try {
    await dbAdd('files', { type:'link', unit:unitActive, week:weekActive, title, url, ts:Date.now() });
    await refreshCounters();
    renderFiles();
    robotSpeak(rnd(UPLOAD_PHRASES), false);
  } catch { alert('Error al guardar.'); if(btn){btn.textContent='Guardar vínculo';btn.disabled=false;} }
}
 
async function doDownload(id) {
  try {
    const files = await dbGet('files');
    const f = files.find(x => x.id === id);
    if (!f) return alert('No encontrado.');
    const a = document.createElement('a');
    a.href = f.data; a.download = f.filename; a.click();
  } catch { alert('Error al descargar.'); }
}
 
async function doDelete(id) {
  if (!confirm('¿Eliminar permanentemente?')) return;
  try { await dbDel('files', id); await refreshCounters(); renderFiles(); }
  catch { alert('Error al eliminar.'); }
}
 
