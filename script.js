let selectedUnit = null;
let selectedWeek = null;

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', loadFiles);

function openUnitModal(unit) {
    selectedUnit = unit;
    document.getElementById('unitTitle').innerText = "Unidad " + unit;
    document.getElementById('unitModal').style.display = 'flex';
}

function openTaskZone(week) {
    selectedWeek = week;
    document.getElementById('taskTitle').innerText = `Unidad ${selectedUnit} - Semana ${week}`;
    document.getElementById('taskModal').style.display = 'flex';
    renderFileList();
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

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

        let files = JSON.parse(localStorage.getItem('portafolio_files')) || [];
        files.push(fileData);
        localStorage.setItem('portafolio_files', JSON.stringify(files));
        renderFileList();
    };
    reader.readAsDataURL(file);
}

function renderFileList() {
    const listContainer = document.getElementById('fileList');
    listContainer.innerHTML = "";
    
    let files = JSON.parse(localStorage.getItem('portafolio_files')) || [];
    // Filtrar para mostrar solo los de la unidad y semana actual
    const filtered = files.filter(f => f.unit === selectedUnit && f.week === selectedWeek);

    filtered.forEach(f => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <span class="file-link" onclick="downloadFile(${f.id})">${f.name}</span>
            <button onclick="deleteFile(${f.id})" style="background:none; border:none; cursor:pointer">🗑️</button>
        `;
        listContainer.appendChild(div);
    });
}

function downloadFile(id) {
    let files = JSON.parse(localStorage.getItem('portafolio_files')) || [];
    const f = files.find(file => file.id === id);
    if (f) {
        const link = document.createElement('a');
        link.href = f.content;
        link.download = f.name;
        link.click();
    }
}

function deleteFile(id) {
    if(confirm("¿Eliminar archivo?")) {
        let files = JSON.parse(localStorage.getItem('portafolio_files')) || [];
        files = files.filter(f => f.id !== id);
        localStorage.setItem('portafolio_files', JSON.stringify(files));
        renderFileList();
    }
}

function loadFiles() {
    // Solo carga la lista cuando se abre la zona de tareas específica
}
