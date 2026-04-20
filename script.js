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

async function ejecutarAccion() {
    const user = document.getElementById('user').value.trim();
    const pass = document.getElementById('pass').value.trim();

    if (!user || !pass) return alert("CRITICAL ERROR: ACCESS DENIED");

    if (isLogin) {
        // Login desde Firebase
        const docRef = window.fStore.doc(window.db, "usuarios", user);
        const docSnap = await window.fStore.getDoc(docRef);

        if (docSnap.exists() && docSnap.data().pass === pass) {
            loginExitoso(docSnap.data());
        } else {
            alert("DENIED: INVALID GATE PASS");
        }
    } else {
        const nombre = document.getElementById('full-name').value.trim();
        const rol = document.getElementById('reg-role').value;
        if (!nombre) return alert("IDENTITY REQUIRED");

        // Registro en Firebase
        await window.fStore.setDoc(window.fStore.doc(window.db, "usuarios", user), {
            user, pass, nombre, rol
        });
        alert("¡Hunter Registrado en la Nube!"); 
        toggleAuth();
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

// SUBIDA DE ARCHIVOS A CLOUD STORAGE
async function guardarArchivo() {
    const title = document.getElementById('file-title').value.trim();
    const input = document.getElementById('file-input');
    const file = input.files[0];

    if (!title || !file) return alert("ERROR: SELECT_DATA_ERROR");

    try {
        const storageRef = window.fStore.ref(window.storage, `tareas/${Date.now()}_${file.name}`);
        const snapshot = await window.fStore.uploadBytes(storageRef, file);
        const downloadURL = await window.fStore.getDownloadURL(snapshot.ref);

        await window.fStore.addDoc(window.fStore.collection(window.db, "archivos"), {
            unidad: activeUnit,
            semana: activeWeek,
            titulo: title,
            nombreArc: file.name,
            url: downloadURL,
            storagePath: storageRef.fullPath
        });

        actualizarLista(); 
        actualizarContadores();
        document.getElementById('file-title').value = ""; 
        input.value = "";
        alert("DATA UPLOADED TO CLOUD");
    } catch (e) {
        alert("CRITICAL UPLOAD ERROR");
        console.error(e);
    }
}

async function actualizarLista() {
    const q = window.fStore.query(
        window.fStore.collection(window.db, "archivos"), 
        window.fStore.where("unidad", "==", activeUnit),
        window.fStore.where("semana", "==", activeWeek)
    );

    const querySnapshot = await window.fStore.getDocs(q);
    const body = document.getElementById('unit-files-body');
    body.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const f = doc.data();
        const id = doc.id;
        body.innerHTML += `
            <tr class="animate-fade">
                <td>
                    <div class="text-purpura fw-bold">${f.titulo}</div>
                    <small class="opacity-50 text-white-50">${f.nombreArc}</small>
                </td>
                <td class="text-end">
                    <a href="${f.url}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fa fa-download"></i></a>
                    ${currentUser.rol === 'ADMIN' ? `
                        <button onclick="eliminar('${id}', '${f.storagePath}')" class="btn btn-sm btn-outline-danger ms-1"><i class="fa fa-trash"></i></button>
                    ` : ""}
                </td>
            </tr>`;
    });
}

async function eliminar(id, path) {
    if(!confirm("CONFIRM_ERASE_COMMAND?")) return;
    await window.fStore.deleteDoc(window.fStore.doc(window.db, "archivos", id));
    const desertRef = window.fStore.ref(window.storage, path);
    await window.fStore.deleteObject(desertRef);
    actualizarLista(); actualizarContadores();
}

async function actualizarContadores() {
    const q = window.fStore.collection(window.db, "archivos");
    const querySnapshot = await window.fStore.getDocs(q);
    const allFiles = [];
    querySnapshot.forEach(doc => allFiles.push(doc.data()));

    for(let i=1; i<=4; i++) {
        const total = allFiles.filter(x => x.unidad == i).length;
        document.getElementById('cnt-' + i).innerText = "STATUS: " + total + " RECORDS";
    }
}

function cerrarUnidad() { document.getElementById('unit-modal').classList.add('d-none'); }
function logout() { location.reload(); }
