// Cargar recursos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadResources();
});

// --- GESTIÓN DE ARCHIVOS CON DESCARGA REAL ---

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        // Convertimos el archivo a una cadena de texto (Base64) para poder guardarlo
        reader.onload = function(e) {
            const id = 'file-' + Date.now();
            const newResource = {
                id: id,
                name: file.name,
                date: new Date().toLocaleString(),
                content: e.target.result // Aquí se guarda el contenido real del archivo
            };

            saveResourceToLocal(newResource);
            renderResource(newResource);
        };

        reader.readAsDataURL(file);
        event.target.value = ''; 
    }
}

// Función para dibujar el recurso con enlace de descarga
function renderResource(res) {
    const list = document.getElementById('resourceList');
    const item = document.createElement('div');
    item.className = 'resource-item';
    item.id = res.id;

    // El nombre del archivo ahora tiene un estilo de enlace y la función de descargar
    item.innerHTML = `
        <div style="cursor: pointer; flex-grow: 1;" onclick="downloadFile('${res.id}')">
            <span style="color: #f43f5e; font-weight: 600; text-decoration: underline;">
                📄 ${res.name}
            </span>
            <small style="color: #a0aec0; font-size: 0.7rem; display: block;">
                Subido el: ${res.date} (Clic para descargar)
            </small>
        </div>
        <button class="btn-delete" onclick="deleteResource('${res.id}')" style="margin-left: 10px;">🗑️</button>
    `;
    list.appendChild(item);
}

// Función mágica para descargar el archivo guardado
function downloadFile(id) {
    const resources = JSON.parse(localStorage.getItem('myTasks')) || [];
    const fileData = resources.find(res => res.id === id);

    if (fileData) {
        const link = document.createElement('a');
        link.href = fileData.content; // El contenido Base64
        link.download = fileData.name; // El nombre original
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("Error: No se encontró el contenido del archivo.");
    }
}

// --- PERSISTENCIA (LOCALSTORAGE) ---

function saveResourceToLocal(resource) {
    let resources = JSON.parse(localStorage.getItem('myTasks')) || [];
    resources.push(resource);
    // Nota: El contenido Base64 puede ser pesado, esto funciona bien para PDFs y fotos pequeñas.
    try {
        localStorage.setItem('myTasks', JSON.stringify(resources));
    } catch (e) {
        alert("¡Cuidado! El archivo es muy grande para la memoria del navegador. Intenta con archivos más pequeños.");
    }
}

function loadResources() {
    const list = document.getElementById('resourceList');
    list.innerHTML = "";
    let resources = JSON.parse(localStorage.getItem('myTasks')) || [];
    resources.forEach(res => renderResource(res));
}

function deleteResource(id) {
    if (confirm("¿Deseas eliminar este archivo de la memoria?")) {
        document.getElementById(id).remove();
        let resources = JSON.parse(localStorage.getItem('myTasks')) || [];
        resources = resources.filter(res => res.id !== id);
        localStorage.setItem('myTasks', JSON.stringify(resources));
    }
}

// Las demás funciones (openModal, showProject, etc.) se mantienen igual...
