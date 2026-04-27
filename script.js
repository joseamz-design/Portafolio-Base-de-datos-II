/* ═══════════════════════════════════════════════
   MOORI_OS — script.js v5
   ─────────────────────────────────────────────
   ✅ Cursor = cabeza del muñeco
   ✅ Cuerpo aparece solo tras 2.5s estático en data-tip
   ✅ Animaciones: sorpresa (login), cocinando, colgando
   ✅ Al encogerse → se transforma en cursor
   ✅ Registro: VIEWER / ADMIN con código 999600911
   ✅ Campos se limpian al cerrar sesión
   ✅ Info cards expandibles horizontales
   ✅ Progreso por unidad + aviso si falta subir
   ✅ Subir archivos Y vínculos/URLs
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
  let currentUser  = null;
  let activeUnit   = null;
  let activeWeek   = null;
  let fbReady      = false;
  let uploadMode   = 'file'; // 'file' | 'link'
  const unitNames  = ['','Unidad I','Unidad II','Unidad III','Unidad IV'];
  const WEEKS_PER_UNIT = 4; // semanas por unidad
  const FILES_PER_WEEK = 2; // archivos esperados por semana
   
  /* ══════ INIT ══════ */
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('user-pill').classList.add('hidden');
    document.getElementById('btn-login-nav').classList.remove('hidden');
    initCursorMascot();
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
     CURSOR MASCOTA
     - La cabeza siempre sigue el cursor
     - El cuerpo + tip aparecen solo tras 2.5s estático en data-tip
  ══════════════════════════════════════════════ */
  let cursorX = 200, cursorY = 200;
  let tipTimer  = null;
  let bodyShown = false;
   
  function initCursorMascot() {
    const cm     = document.getElementById('cursor-mascot');
    const tipEl  = document.getElementById('cursor-tip');
   
    // Mover cabeza con el cursor
    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cm.style.left = (cursorX - 18) + 'px';
      cm.style.top  = (cursorY - 18) + 'px';
   
      // Si el cuerpo está mostrándose, reiniciar el timer
      if (tipTimer) {
        clearTimeout(tipTimer);
        tipTimer = null;
      }
      // Si ya estaba el cuerpo visible, ocultarlo al mover
      if (bodyShown) {
        hideCursorBody();
      }
    });
   
    // Hover en elementos con data-tip
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[data-tip]');
      if (!el) return;
      const tip = el.getAttribute('data-tip');
      if (!tip) return;
   
      cm.classList.add('hover');
   
      // Iniciar timer de 2.5s
      if (tipTimer) clearTimeout(tipTimer);
      tipTimer = setTimeout(() => {
        tipEl.textContent = tip;
        cm.classList.add('tip-active');
        bodyShown = true;
        tipTimer = null;
      }, 2500);
    });
   
    document.addEventListener('mouseout', (e) => {
      const el = e.target.closest('[data-tip]');
      if (!el) return;
      const to = e.relatedTarget;
      if (to && el.contains(to)) return;
   
      cm.classList.remove('hover');
      if (tipTimer) { clearTimeout(tipTimer); tipTimer = null; }
      if (bodyShown) hideCursorBody();
    });
   
    // Click = pequeña reacción
    document.addEventListener('mousedown', () => {
      cm.style.transition = 'transform 0.1s';
      cm.querySelector('.cursor-head').style.transform = 'scale(0.85)';
      setTimeout(() => {
        cm.querySelector('.cursor-head').style.transform = '';
      }, 150);
    });
  }
   
  function hideCursorBody() {
    const cm = document.getElementById('cursor-mascot');
    cm.classList.remove('tip-active');
    bodyShown = false;
  }
   
  /* ══════════════════════════════════════════════
     MASCOTA ESCENA GRANDE
     Animaciones disponibles: peek | surprise | cook | hang
  ══════════════════════════════════════════════ */
  const FRASES_BIENVENIDA = [
    "¡Volviste, señorón! 👑",
    "Eso es responsabilidad, campeón 💪",
    "El que no falla, no para de crecer 🚀",
    "Tus tareas no se van a subir solas... ¡dale! 😄",
    "Presencia confirmada en el sistema ✅",
    "El estudiante ha regresado. El profe tiembla 😎",
    "La constancia hace al maestro 🏆",
    "Eres de los que sí llegan 💯",
  ];
  const FRASES_SUBIDA = [
    "¡Lo hiciste a tiempo, buen trabajo campeón! 🎉",
    "Tarea entregada. La responsabilidad te define 💼",
    "Así se hace, sin excusas ni pretextos 🔥",
    "¡Eso es disciplina pura! Sigue adelante 💪",
    "Archivo guardado. Eres un ejemplo a seguir 🏅",
    "La entrega puntual es el primer paso del éxito 📚",
  ];
  const ANIMACIONES = ['peek','cook','hang'];
   
  let sceneTimer = null;
  let sceneActive = false;
   
  function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
   
  function mostrarMascotaEscena(frase, forcedAnim) {
    if (sceneTimer) { clearTimeout(sceneTimer); sceneTimer = null; }
   
    const mascot = document.getElementById('scene-mascot');
    const bubble = document.getElementById('scene-bubble');
   
    // Resetear
    mascot.className = 'scene-mascot scene-hidden';
    mascot.style.cssText = '';
    bubble.classList.remove('show');
    bubble.textContent = '';
   
    // Pequeño delay para que el reset se aplique
    setTimeout(() => {
      const anim = forcedAnim || rnd(ANIMACIONES);
   
      // Resetear posición según animación
      if (anim === 'hang') {
        mascot.style.bottom = 'auto';
        mascot.style.top = '80px';
        mascot.style.right = '60px';
      } else {
        mascot.style.top = '';
        mascot.style.bottom = '0';
        mascot.style.right = '40px';
      }
   
      mascot.className = 'scene-mascot anim-' + anim;
      sceneActive = true;
   
      // Mostrar burbuja después de que la animación de entrada termine
      const bubbleDelay = anim === 'cook' ? 1400 : anim === 'hang' ? 1200 : 900;
      setTimeout(() => {
        // Si es cook: primero gira como mirando, luego habla
        bubble.textContent = frase;
        bubble.classList.add('show');
   
        // Después de la frase, encoger hacia el cursor
        sceneTimer = setTimeout(() => {
          bubble.classList.remove('show');
          setTimeout(() => encogerseHaciaCursor(), 400);
        }, 4500);
      }, bubbleDelay);
    }, 80);
  }
   
  function encogerseHaciaCursor() {
    const mascot = document.getElementById('scene-mascot');
    const rect   = mascot.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = cursorX - cx;
    const dy = cursorY - cy;
   
    mascot.style.transition = 'transform 0.85s cubic-bezier(0.55,0,1,0.45), opacity 0.6s ease';
    mascot.style.transform  = `translate(${dx}px,${dy}px) scale(0.03)`;
    mascot.style.opacity    = '0';
   
    setTimeout(() => {
      mascot.style.transition = '';
      mascot.style.transform  = '';
      mascot.style.opacity    = '';
      mascot.className = 'scene-mascot scene-hidden';
      sceneActive = false;
    }, 900);
  }
   
  function ocultarMascotaEscena() {
    const mascot = document.getElementById('scene-mascot');
    const bubble = document.getElementById('scene-bubble');
    bubble.classList.remove('show');
    mascot.className = 'scene-mascot scene-hidden';
    if (sceneTimer) { clearTimeout(sceneTimer); sceneTimer = null; }
    sceneActive = false;
  }
   
  /* ══════ BYE ══════ */
  function mostrarBye() {
    generarParticulas();
    const overlay  = document.getElementById('bye-overlay');
    const zone     = document.getElementById('bye-mascot-zone');
    const svg      = document.getElementById('scene-svg').cloneNode(true);
    svg.style.cssText = 'width:200px;height:350px;';
    zone.innerHTML = '';
    zone.appendChild(svg);
    overlay.classList.remove('bye-hidden');
   
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.8s ease';
      overlay.style.opacity    = '0';
      setTimeout(() => {
        overlay.style.opacity    = '';
        overlay.style.transition = '';
        overlay.classList.add('bye-hidden');
        document.getElementById('btn-login-nav').classList.remove('hidden');
        document.getElementById('user-pill').classList.add('hidden');
      }, 850);
    }, 3200);
  }
   
  function generarParticulas() {
    const c = document.getElementById('bye-particles');
    c.innerHTML = '';
    for (let i = 0; i < 35; i++) {
      const p = document.createElement('div');
      p.className = 'bye-particle';
      const angle = Math.random() * 360;
      const dist  = 80 + Math.random() * 220;
      p.style.cssText = `
        left:${15+Math.random()*70}%;top:${15+Math.random()*70}%;
        width:${3+Math.random()*8}px;height:${3+Math.random()*8}px;
        background:${Math.random()>0.5?'#f97316':Math.random()>0.5?'#fff':'#ffb347'};
        border-radius:${Math.random()>0.4?'50%':'3px'};
        --tx:${Math.cos(angle*Math.PI/180)*dist}px;
        --ty:${Math.sin(angle*Math.PI/180)*dist}px;
        --dur:${1.5+Math.random()*1.8}s;
        --delay:${Math.random()*0.4}s;
      `;
      c.appendChild(p);
    }
  }
   
  /* ══════ OJITO ══════ */
  function togglePass(inputId, btn) {
    const input  = document.getElementById(inputId);
    const open   = btn.querySelector('.eye-open');
    const closed = btn.querySelector('.eye-closed');
    if (input.type === 'password') {
      input.type = 'text'; open.classList.add('hidden'); closed.classList.remove('hidden');
    } else {
      input.type = 'password'; open.classList.remove('hidden'); closed.classList.add('hidden');
    }
  }
   
  /* ══════ ADMIN TOGGLE ══════ */
  let adminFieldVisible = false;
  function toggleAdminField() {
    adminFieldVisible = !adminFieldVisible;
    document.getElementById('admin-code-field').style.display = adminFieldVisible ? '' : 'none';
    const btn = document.getElementById('admin-toggle-btn');
    btn.style.cssText = adminFieldVisible ? 'border-color:var(--orange);color:var(--orange);' : '';
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
    if (!isL) { adminFieldVisible = false; document.getElementById('admin-code-field').style.display = 'none'; }
  }
   
  async function doLogin() {
    const user = document.getElementById('l-user').value.trim();
    const pass = document.getElementById('l-pass').value.trim();
    if (!user || !pass) return showErr('Completa todos los campos.');
    try {
      const users = await fbGetAll('users', [['user','==',user],['pass','==',pass]]);
      if (!users.length) return showErr('Usuario o contraseña incorrectos.');
      loginSuccess(users[0]);
    } catch(e) { showErr('Error de conexión. Verifica Firebase.'); console.error(e); }
  }
   
  async function doRegister() {
    const user = document.getElementById('r-user').value.trim();
    const pass = document.getElementById('r-pass').value.trim();
    const name = document.getElementById('r-name').value.trim();
    const code = (document.getElementById('r-code')?.value || '').trim();
    if (!user || !pass || !name) return showErr('Completa todos los campos.');
    const role = code === ADMIN_SECRET ? 'ADMIN' : 'VIEWER';
    try {
      const existing = await fbGetAll('users', [['user','==',user]]);
      if (existing.length) return showErr('Ese usuario ya existe.');
      await fbAdd('users', { user, pass, name, role });
      showErr(role === 'ADMIN' ? '✅ Cuenta ADMIN creada. Inicia sesión.' : '✅ Cuenta Viewer creada. Inicia sesión.');
      switchTab('login');
      document.getElementById('l-user').value = user;
    } catch(e) { showErr('Error al registrar. Verifica Firebase.'); }
  }
   
  function loginSuccess(u) {
    currentUser = u;
    cerrarLogin();
    // Limpiar campos ✅
    document.getElementById('l-user').value = '';
    document.getElementById('l-pass').value = '';
   
    document.getElementById('btn-login-nav').classList.add('hidden');
    const pill = document.getElementById('user-pill');
    pill.classList.remove('hidden');
    const initials = u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    document.getElementById('pill-avatar').textContent = initials;
    document.getElementById('pill-name').textContent   = u.name.toUpperCase();
    const roleEl = document.getElementById('pill-role');
    roleEl.textContent = u.role;
    roleEl.style.cssText = u.role === 'ADMIN'
      ? 'background:rgba(249,115,22,0.15);color:#f97316;border:1px solid rgba(249,115,22,0.3);font-family:var(--mono);font-size:9px;font-weight:600;padding:2px 6px;border-radius:3px;letter-spacing:1px;width:fit-content;'
      : 'background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.25);font-family:var(--mono);font-size:9px;font-weight:600;padding:2px 6px;border-radius:3px;letter-spacing:1px;width:fit-content;';
   
    // Animación sorpresa al login, luego las otras aleatoriamente
    mostrarMascotaEscena(rnd(FRASES_BIENVENIDA), 'surprise');
  }
   
  function doLogout() {
    currentUser = null;
    // Limpiar campos también al cerrar sesión ✅
    document.getElementById('l-user').value = '';
    document.getElementById('l-pass').value = '';
    ocultarMascotaEscena();
    setTimeout(() => mostrarBye(), 100);
  }
   
  /* ══════ CONTADORES ══════ */
  async function updateCounters() {
    try {
      const files = await fbGetAll('files');
      for (let i = 1; i <= 4; i++) {
        const n = files.filter(f => f.unit == i).length;
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
   
  /* ══════════════════════════════════════════════
     INFO CARDS
  ══════════════════════════════════════════════ */
  function toggleInfoCard(id) {
    const body  = document.getElementById('icb-' + id);
    const card  = document.getElementById('ic-' + id);
    const isOpen = !body.classList.contains('hidden');
   
    if (id === 'progreso' && !isOpen) {
      // Cargar progreso dinámicamente
      renderProgress();
    }
   
    body.classList.toggle('hidden', isOpen);
    card.classList.toggle('open', !isOpen);
  }
   
  async function renderProgress() {
    const bars   = document.getElementById('progress-bars');
    const tipMsg = document.getElementById('ic-tip-msg');
    bars.innerHTML = '<div class="prog-loading">Calculando…</div>';
   
    let allFiles = [];
    try { allFiles = await fbGetAll('files'); } catch { bars.innerHTML = '<div class="prog-loading">Error de conexión</div>'; return; }
   
    const colors = ['','','u2','u3','u4'];
    const MAX = WEEKS_PER_UNIT * FILES_PER_WEEK; // 4 semanas * 2 archivos = 8 por unidad
    let missingUnit = null;
    let html = '';
   
    for (let u = 1; u <= 4; u++) {
      const count = allFiles.filter(f => f.unit == u).length;
      const pct   = Math.min(100, Math.round((count / MAX) * 100));
      if (count === 0 && missingUnit === null) missingUnit = u;
      html += `
        <div class="prog-unit">
          <div class="prog-head">
            <span class="prog-label">${unitNames[u]}</span>
            <span class="prog-pct">${pct}% · ${count}/${MAX}</span>
          </div>
          <div class="prog-bar-bg">
            <div class="prog-bar-fill ${colors[u]}" id="pb${u}" style="width:0%"></div>
          </div>
        </div>`;
    }
   
    bars.innerHTML = html;
   
    // Animar barras
    requestAnimationFrame(() => {
      for (let u = 1; u <= 4; u++) {
        const count = allFiles.filter(f => f.unit == u).length;
        const pct   = Math.min(100, Math.round((count / MAX) * 100));
        setTimeout(() => {
          const bar = document.getElementById('pb' + u);
          if (bar) bar.style.width = pct + '%';
        }, u * 120);
      }
    });
   
    // Aviso si hay unidad vacía
    if (missingUnit !== null) {
      tipMsg.textContent = `⚠️ La ${unitNames[missingUnit]} aún no tiene archivos. ¡Es momento de subir tus tareas!`;
      tipMsg.classList.add('show');
    } else {
      tipMsg.classList.remove('show');
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
    document.getElementById('um-sub').textContent = 'Semana ' + w;
    renderFiles();
  }
   
  /* ══════════════════════════════════════════════
     RENDER ARCHIVOS + OPCIÓN VÍNCULO/URL
  ══════════════════════════════════════════════ */
  async function renderFiles() {
    const body = document.getElementById('unit-body');
    body.innerHTML = '<div class="loading-row"><div class="spin"></div> Cargando archivos…</div>';
   
    let files = [];
    try { files = await fbGetAll('files',[['unit','==',activeUnit],['week','==',activeWeek]]); }
    catch { body.innerHTML = '<div class="empty-msg">Error al conectar con Firebase.</div>'; return; }
   
    let html = '';
   
    if (currentUser !== null && currentUser.role === 'ADMIN') {
      html += `
        <div class="upload-zone">
          <span class="upload-label">↑ Agregar contenido</span>
          <div class="upload-tabs">
            <button class="utab ${uploadMode==='file'?'active':''}" onclick="setUploadMode('file')">📄 Archivo</button>
            <button class="utab ${uploadMode==='link'?'active':''}" onclick="setUploadMode('link')">🔗 Vínculo / URL</button>
          </div>
          <div class="upload-row1">
            <input type="text" id="f-title" placeholder="Título del contenido">
          </div>
          <div id="upload-file-zone" class="upload-row2" style="display:${uploadMode==='file'?'flex':'none'}">
            <input type="file" id="f-file">
            <button class="btn-upload" onclick="uploadFile()">Subir</button>
          </div>
          <div id="upload-link-zone" class="upload-row3" style="display:${uploadMode==='link'?'flex':'none'}">
            <input type="text" id="f-url" placeholder="https://...">
            <button class="btn-upload" onclick="uploadLink()">Guardar</button>
          </div>
        </div>`;
    }
   
    if (files.length === 0) {
      html += '<div class="empty-msg">Sin archivos en esta semana.</div>';
    } else {
      html += '<div class="file-list">';
      files.forEach(f => {
        const isLink   = f.type === 'link';
        const canAdmin = currentUser?.role === 'ADMIN';
        html += `
          <div class="fitem ${isLink ? 'is-link' : ''}">
            <div class="finfo">
              <div class="fname">${isLink ? '🔗 ' : '📄 '}${f.title}</div>
              <div class="fmeta">${isLink ? f.url : f.filename}</div>
            </div>
            <div class="factions">
              ${isLink
                ? `<button class="btn-open-link" onclick="openLink('${f.url}')">↗ Abrir</button>`
                : `<button class="btn-dl" onclick="downloadFile('${f.id}')">↓ Descargar</button>`
              }
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
    // Re-render zona de subida sin recargar toda la lista
    const fileZ = document.getElementById('upload-file-zone');
    const linkZ = document.getElementById('upload-link-zone');
    if (fileZ) fileZ.style.display = mode === 'file' ? 'flex' : 'none';
    if (linkZ) linkZ.style.display = mode === 'link' ? 'flex' : 'none';
    document.querySelectorAll('.utab').forEach((t,i) => {
      t.classList.toggle('active', (i===0 && mode==='file') || (i===1 && mode==='link'));
    });
  }
   
  /* ══════ CRUD ══════ */
  async function uploadFile() {
    const title = document.getElementById('f-title')?.value.trim() || '';
    const file  = document.getElementById('f-file')?.files[0];
    if (!title || !file) return alert('Escribe un título y selecciona un archivo.');
   
    const btn = document.querySelector('.btn-upload');
    if (btn) { btn.textContent = 'Subiendo…'; btn.disabled = true; }
   
    const reader = new FileReader();
    reader.onload = async function () {
      try {
        await fbAdd('files',{
          type:'file', unit:activeUnit, week:activeWeek,
          title, filename:file.name, data:reader.result, ts:Date.now()
        });
        await updateCounters();
        renderFiles();
        mostrarMascotaEscena(rnd(FRASES_SUBIDA));
      } catch(e) {
        alert('Error al subir. Revisa Firebase.');
        if (btn) { btn.textContent = 'Subir'; btn.disabled = false; }
      }
    };
    reader.readAsDataURL(file);
  }
   
  async function uploadLink() {
    const title = document.getElementById('f-title')?.value.trim() || '';
    const url   = document.getElementById('f-url')?.value.trim() || '';
    if (!title || !url) return alert('Escribe un título y la URL.');
    if (!url.startsWith('http')) return alert('La URL debe empezar con http:// o https://');
   
    const btn = document.querySelector('.btn-upload');
    if (btn) { btn.textContent = 'Guardando…'; btn.disabled = true; }
    try {
      await fbAdd('files',{
        type:'link', unit:activeUnit, week:activeWeek,
        title, url, ts:Date.now()
      });
      await updateCounters();
      renderFiles();
      mostrarMascotaEscena(rnd(FRASES_SUBIDA));
    } catch(e) {
      alert('Error al guardar. Revisa Firebase.');
      if (btn) { btn.textContent = 'Guardar'; btn.disabled = false; }
    }
  }
   
  function openLink(url) {
    window.open(url, '_blank', 'noopener');
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
    if (!confirm('¿Eliminar este contenido permanentemente?')) return;
    try {
      await fbDelete('files', id);
      await updateCounters();
      renderFiles();
    } catch { alert('Error al eliminar.'); }
  }
  
