// Al cargar la página, recuperamos las tareas guardadas
document.addEventListener('DOMContentLoaded', () => {
    loadResources();
});

// Abrir y Cerrar Modales
function openWeekModal(n) {
    document.getElementById('modalWeekTitle').innerText = `Semana ${n}`;
    document.getElementById('weekModal').style.display = 'flex';
}

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Lógica de Proyectos
function showProject(n) {
    const detail = document.getElementById('projectDetail');
    detail.classList.remove('hidden');
    document.getElementById('detailTitle').innerText = n === 1 ? "Sistema de Ventas" : "Gestión de BD";
    document.getElementById('detailText').innerText = "Este proyecto trata sobre el desarrollo de una solución integral de bases de datos para el ciclo actual.";
}

function hideProject() {
    document.getElementById('projectDetail').classList.add('hidden');
}

// --- GESTIÓN DE ARCHIVOS CON GUARDADO (LOCALSTORAGE) ---

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const id = 'file-' + Date.now();
        const newResource = {
            id: id,
            name: file.name,
            date: new Date().toLocaleString()
        };

        // Guardar en la lista del navegador
        saveResourceToLocal(newResource);
        
        // Dibujar en pantalla
        renderResource(newResource);

        event.target.value = ''; // Limpiar input
    }
}

// Función para dibujar el recurso en el HTML
function renderResource(res) {
    const list = document.getElementById('resourceList');
    const item = document.createElement('div');
    item.className = 'resource-item';
    item.id = res.id;
    item.innerHTML = `
        <span>${res.name} <small style="color: #666; font-size: 0.7rem; display: block;">${res.date}</small></span>
        <button class="btn-delete" onclick="deleteResource('${res.id}')">🗑️</button>
    `;
    list.appendChild(item);
}

// Guardar en LocalStorage
function saveResourceToLocal(resource) {
    let resources = JSON.parse(localStorage.getItem('myTasks')) || [];
    resources.push(resource);
    localStorage.setItem('myTasks', JSON.stringify(resources));
}

// Cargar desde LocalStorage
function loadResources() {
    const list = document.getElementById('resourceList');
    list.innerHTML = ""; // Limpiar antes de cargar
    let resources = JSON.parse(localStorage.getItem('myTasks')) || [];
    resources.forEach(res => renderResource(res));
}

// Eliminar y actualizar LocalStorage
function deleteResource(id) {
    if (confirm("¿Deseas eliminar este recurso permanentemente?")) {
        // Eliminar del HTML
        document.getElementById(id).remove();

        // Eliminar del LocalStorage
        let resources = JSON.parse(localStorage.getItem('myTasks')) || [];
        resources = resources.filter(res => res.id !== id);
        localStorage.setItem('myTasks', JSON.stringify(resources));
    }
}

function downloadMaterial() {
    alert("Iniciando descarga del material de clase...");
}

function doLogin() {
    const email = document.getElementById('loginEmail').value;
    if (email) {
        alert("Bienvenido: " + email);
        closeModal('loginModal');
    } else {
        alert("Ingresa un correo");
    }
}
