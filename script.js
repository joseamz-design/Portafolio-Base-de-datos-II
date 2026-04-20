// ─────────────────────────────────────────────
//  MOORI_OS — script.js
//  Almacenamiento: localStorage
//  Para compartir entre dispositivos debes subir
//  los 3 archivos a un hosting (GitHub Pages,
//  Netlify, Vercel, etc.)
// ─────────────────────────────────────────────

const USERS_KEY = 'moorios_users';
const FILES_KEY  = 'moorios_files';

let currentUser = null;
let activeUnit  = null;
let activeWeek  = null;

// ── HELPERS ──────────────────────────────────

function loadUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}
function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}
function loadFiles() {
  return JSON.parse(localStorage.getItem(FILES_KEY)) || [];
}
function saveFiles(list) {
  localStorage.setItem(FILES_KEY, JSON.stringify(list));
}

// ── AUTH ──────────────────────────────────────

function switchTab(tab) {
  document.getElementById('auth-error').textContent = '';
  if (tab === 'login') {
    document.getElementById('login-form').style.display = '';
    document.getElementById('reg-form').style.display   = 'none';
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-reg').classList.remove('active');
  } else {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('reg-form').style.display   = '';
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-reg').classList.add('active');
  }
}

function showError(msg) {
  document.getElementById('auth-error').textContent = msg;
}

function doLogin() {
  const user = document.getElementById('l-user').value.trim();
  const pass = document.getElementById('l-pass').value.trim();
  if (!user || !pass) return showError('Completa todos los campos.');
  const users = loadUsers();
  const found  = users.find(u => u.user === user && u.pass === pass);
  if (!found) return showError('Usuario o contraseña incorrectos.');
  loginSuccess(found);
}

function doRegister() {
  const user = document.getElementById('r-user').value.trim();
  const pass = document.getElementById('r-pass').value.trim();
  const name = document.getElementById('r-name').value.trim();
  const role = document.getElementById('r-role').value;
  if (!user || !pass || !name) return showError('Completa todos los campos.');
  const users = loadUsers();
  if (users.find(u => u.user === user)) return showError('Ese usuario ya existe.');
  users.push({ user, pass, name, role });
  saveUsers(users);
  showError('¡Cuenta creada! Ahora inicia sesión.');
  switchTab('login');
  document.getElementById('l-user').value = user;
}

function loginSuccess(u) {
  currentUser = u;
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('main-screen').classList.add('active');
  document.getElementById('nav-user').textContent = u.name.toUpperCase();
  const roleEl = document.getElementById('nav-role');
  roleEl.textContent = u.role === 'ADMIN' ? 'ADMIN' : 'VIEWER';
  roleEl.className   = 'role-tag ' + (u.role === 'ADMIN' ? 'admin' : 'viewer');
  updateCounters();
}

function doLogout() {
  currentUser = null;
  document.getElementById('main-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('l-user').value = '';
  document.getElementById('l-pass').value = '';
}

// ── CONTADORES ────────────────────────────────

function updateCounters() {
  const files = loadFiles();
  for (let i = 1; i <= 4; i++) {
    const count = files.filter(f => f.unit == i).length;
    document.getElementById('c' + i).textContent = count;
  }
}

// ── MODAL ─────────────────────────────────────

const unitNames = ['', 'Análisis de Datos', 'Diseño Relacional', 'Sentencias SQL', 'Protocolos de Seguridad'];

function openUnit(u) {
  activeUnit = u;
  activeWeek = null;
  document.getElementById('modal-title').textContent = 'Unidad 0' + u + ' — ' + unitNames[u];
  document.getElementById('modal-sub').textContent   = 'Selecciona una semana para ver los archivos';
  document.querySelectorAll('.btn-week').forEach(b => b.classList.remove('active'));
  document.getElementById('modal-body').innerHTML    = '<div class="choose-week"><p>← Selecciona una semana para continuar</p></div>';
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function selectWeek(w) {
  activeWeek = w;
  document.querySelectorAll('.btn-week').forEach((b, i) => b.classList.toggle('active', i + 1 === w));
  document.getElementById('modal-sub').textContent = 'Semana ' + w;
  renderFiles();
}

// ── RENDER ────────────────────────────────────

function renderFiles() {
  const body     = document.getElementById('modal-body');
  const files    = loadFiles();
  const filtered = files.filter(f => f.unit == activeUnit && f.week == activeWeek);

  let html = '';

  if (currentUser.role === 'ADMIN') {
    html += `
      <div class="upload-zone">
        <span class="upload-label">Subir nuevo archivo</span>
        <div class="row1">
          <input type="text" id="f-title" placeholder="Título del trabajo académico">
        </div>
        <div class="row2">
          <input type="file" id="f-file">
          <button class="btn-upload" onclick="uploadFile()">Subir</button>
        </div>
      </div>`;
  }

  if (filtered.length === 0) {
    html += `<div class="empty-state"><p>Sin archivos en esta semana.</p></div>`;
  } else {
    html += '<div class="file-list">';
    filtered.forEach(f => {
      html += `
        <div class="file-item">
          <div class="file-info">
            <div class="file-name">${f.title}</div>
            <div class="file-meta">${f.filename}</div>
          </div>
          <div class="file-actions">
            <button class="btn-dl" onclick="downloadFile(${f.id})">↓ Descargar</button>
            ${currentUser.role === 'ADMIN' ? `<button class="btn-del" onclick="deleteFile(${f.id})">✕</button>` : ''}
          </div>
        </div>`;
    });
    html += '</div>';
  }

  body.innerHTML = html;
}

// ── CRUD ──────────────────────────────────────

function uploadFile() {
  const title     = document.getElementById('f-title').value.trim();
  const fileInput = document.getElementById('f-file');
  const file      = fileInput.files[0];
  if (!title || !file) return alert('Completa el título y selecciona un archivo.');

  const reader = new FileReader();
  reader.onload = function () {
    const files = loadFiles();
    files.push({
      id: Date.now(),
      unit: activeUnit,
      week: activeWeek,
      title,
      filename: file.name,
      data: reader.result
    });
    saveFiles(files);
    updateCounters();
    renderFiles();
  };
  reader.readAsDataURL(file);
}

function downloadFile(id) {
  const files = loadFiles();
  const f = files.find(x => x.id === id);
  if (!f) return;
  const a = document.createElement('a');
  a.href     = f.data;
  a.download = f.filename;
  a.click();
}

function deleteFile(id) {
  if (!confirm('¿Eliminar este archivo?')) return;
  let files = loadFiles();
  files = files.filter(x => x.id !== id);
  saveFiles(files);
  updateCounters();
  renderFiles();
}
