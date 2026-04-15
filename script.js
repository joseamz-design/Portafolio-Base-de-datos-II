let selectedUnit = null;
let selectedWeek = null;

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', () => {
    console.log("Portafolio de José Moori listo.");
});

// MODALES DE NAVEGACIÓN
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function openUnitModal(unit) {
    selectedUnit = unit;
    document.getElementById('unitTitle').innerText = "Unidad " + unit;
    document.getElementById('unitModal').style.display = 'flex';
}

function openTaskZone(week) {
    selectedWeek = week;
    document.getElementById('taskTitle').innerText = `U${selectedUnit} - Semana ${week}`;
    document.getElementById('taskModal').style.display = 'flex';
    renderFileList();
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// CERRAR MODALES AL HACER CLIC FUERA
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = "none";
    }
}

// LÓGICA DE ARCHIVOS
function uploadFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = {
            id: Date.now(),
            unit: selectedUnit,
            week: selectedWeek,
            name: file.name,
            content: e.target.result
        };

        let files = JSON.parse(localStorage.getItem('portafolio_jose')) || [];
        files.push(fileData);
        localStorage.setItem('portafolio_jose', JSON.stringify(files));
        renderFileList();
    };
    reader.readAsDataURL(file);
    event.target.value = ''; 
}

function renderFileList() {
    const listContainer = document.getElementById('fileList');
    listContainer.innerHTML = "";
    
    let files = JSON.parse(localStorage.getItem('portafolio_jose')) || [];
    const filtered = files.filter(f => f.unit === selectedUnit && f.week === selectedWeek);

    if (filtered.length === 0) {
        listContainer.innerHTML = "<p style='color:#666; font-size:0.9rem;'>No hay archivos subidos todavía.</p>";
        return;
    }

    filtered.forEach(f => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <span class="file-link" onclick="downloadFile(${f.id})" title="Clic para descargar">${f.name}</span>
            <button onclick="deleteFile(${f.id})" style="background:none; border:none; cursor:pointer; font-size:1.2rem;">🗑️</button>
        `;
        listContainer.appendChild(div);
    });
}

function downloadFile(id) {
    let files = JSON.parse(localStorage.getItem('portafolio_jose')) || [];
    const f = files.find(file => file.id === id);
    if (f) {
        const link = document.createElement('a');
        link.href = f.content;
        link.download = f.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function deleteFile(id) {
    if(confirm("¿Seguro que quieres borrar esta tarea?")) {
        let files = JSON.parse(localStorage.getItem('portafolio_jose')) || [];
        files = files.filter(f => f.id !== id);
        localStorage.setItem('portafolio_jose', JSON.stringify(files));
        renderFileList();
    }
}
