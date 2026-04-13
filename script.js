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

// --- GESTIÓN DE ARCHIVOS (SEMANAS) ---

function downloadMaterial() {
    alert("Iniciando descarga del material de clase...");
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const list = document.getElementById('resourceList');
        const id = 'file-' + Date.now();
        
        const item = document.createElement('div');
        item.className = 'resource-item';
        item.id = id;
        item.innerHTML = `
            <span>${file.name}</span>
            <button class="btn-delete" onclick="deleteResource('${id}')">🗑️</button>
        `;
        
        list.appendChild(item);
        event.target.value = ''; // Reset para permitir re-subir
    }
}

function deleteResource(id) {
    if (confirm("¿Deseas eliminar este recurso?")) {
        document.getElementById(id).remove();
    }
}

// Login Simple
function doLogin() {
    const email = document.getElementById('loginEmail').value;
    if (email) {
        alert("Bienvenido: " + email);
        closeModal('loginModal');
    } else {
        alert("Ingresa un correo");
    }
}
