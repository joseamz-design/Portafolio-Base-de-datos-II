let isLogin = true;
let currentUser = null;
let activeUnit = null;
let activeWeek = null;

// GESTIÓN DE ACCESO
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('reg-fields').classList.toggle('d-none');
    document.getElementById('auth-title').innerText = isLogin ? "SYSTEM_INIT" : "NEW_HUNTER";
    document.getElementById('main-btn').innerText = isLogin ? "INITIATE GATE SEQUENCE" : "REGISTER_SYSTEM";
}

function ejecutarAccion() {
    const user = document.getElementById('user').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const db = JSON.parse(localStorage.getItem('void_hunter_db')) || [];

    if (!user || !pass) return alert("CRITICAL ERROR: ACCESS DENIED");

    if (isLogin) {
        const found = db.find(u => u.user === user && u.pass === pass);
        if (found) loginExitoso(found);
        else alert("DENIED: INVALID GATE PASS");
    } else {
        const nombre = document.getElementById('full-name').value.trim();
        const rol = document.getElementById('reg-role').value;
        if (!nombre) return alert("IDENTITY REQUIRED");
        db.push({ user, pass, nombre, rol });
        localStorage.setItem('void_hunter_db', JSON.stringify(db));
        alert("¡Hunter Registrado!"); toggleAuth();
    }
}

function loginExitoso(u) {
    currentUser = u;
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('portfolio-section').classList.remove('d-none');
    document.getElementById('nav-username').innerText = "ID: " + u.nombre.toUpperCase();
    actualizarContadores();
}

// GESTIÓN DE PORTAFOLIO
function abrirUnidad(u) {
    activeUnit = u; activeWeek = null;
    document.getElementById('modal-unit-title').innerText = "ARCHIVE: UNIT_0" + u;
    document.getElementById('unit-modal').classList.remove('d-none');
    document.getElementById('week-content').classList.add('d-none');
    document.getElementById('select-prompt').classList.remove('d-none');
    document.querySelectorAll('.btn-week').forEach(b => b.classList.remove('active'));
}

function seleccionarSemana(s) {
    activeWeek = s;
    document.getElementById('week-content').classList.remove('d-none');
    document.getElementById('select-prompt').classList.add('d-none');
    document.querySelectorAll('.btn-week').forEach((b, i) => b.classList.toggle('active', (i+1) === s));

    if (currentUser.rol === "ADMIN") document.getElementById('admin-zone').classList.remove('d-none');
    actualizarLista();
}

// CRUD
function guardarArchivo() {
    const title = document.getElementById('file-title').value.trim();
    const input = document.getElementById('file-input');
    const file = input.files[0];

    if (!title || !file) return alert("ERROR: SELECT_DATA_ERROR");

    const reader = new FileReader();
    reader.onload = function() {
        const files = JSON.parse(localStorage.getItem('void_files_db')) || [];
        files.push({
            id: Date.now(), unidad: activeUnit, semana: activeWeek,
            titulo: title, nombreArc: file.name, data: reader.result
        });
        localStorage.setItem('void_files_db', JSON.stringify(files));
        actualizarLista(); actualizarContadores();
        document.getElementById('file-title').value = ""; input.value = "";
    };
    reader.readAsDataURL(file);
}

function actualizarLista() {
    const files = JSON.parse(localStorage.getItem('void_files_db')) || [];
    const filtrados = files.filter(f => f.unidad == activeUnit && f.semana == activeWeek);
    const body = document.getElementById('unit-files-body');
    body.innerHTML = "";

    filtrados.forEach(f => {
        body.innerHTML += `
            <tr class="animate-fade">
                <td>
                    <div class="text-purpura fw-bold">${f.titulo}</div>
                    <small class="opacity-50 text-white-50">${f.nombreArc}</small>
                </td>
                <td class="text-end">
                    <button onclick="descargar(${f.id})" class="btn btn-sm btn-outline-info"><i class="fa fa-download"></i></button>
                    ${currentUser.rol === 'ADMIN' ? `
                        <button onclick="eliminar(${f.id})" class="btn btn-sm btn-outline-danger ms-1"><i class="fa fa-trash"></i></button>
                    ` : ""}
                </td>
            </tr>`;
    });
}

function descargar(id) {
    const files = JSON.parse(localStorage.getItem('void_files_db'));
    const f = files.find(x => x.id === id);
    const a = document.createElement('a');
    a.href = f.data; a.download = f.nombreArc;
    a.click();
}

function eliminar(id) {
    if(!confirm("CONFIRM_ERASE_COMMAND?")) return;
    let files = JSON.parse(localStorage.getItem('void_files_db'));
    files = files.filter(x => x.id !== id);
    localStorage.setItem('void_files_db', JSON.stringify(files));
    actualizarLista(); actualizarContadores();
}

function actualizarContadores() {
    const files = JSON.parse(localStorage.getItem('void_files_db')) || [];
    for(let i=1; i<=4; i++) {
        const total = files.filter(x => x.unidad == i).length;
        document.getElementById('cnt-' + i).innerText = "STATUS: " + total + " RECORDS";
    }
}

function cerrarUnidad() { document.getElementById('unit-modal').classList.add('d-none'); }
function logout() { location.reload(); }
