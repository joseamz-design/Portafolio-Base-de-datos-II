let selectedUnit = null;
let selectedWeek = null;

// Funciones de apertura/cierre básica
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

// Lógica de archivos (Guardado y descarga)
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
        let files = JSON.parse(localStorage.getItem('tasks_jose')) || [];
        files.push(fileData);
        localStorage.setItem('tasks_jose', JSON.stringify(files));
        renderFileList();
    };
    reader.readAsDataURL(file);
    event.target.value = ''; 
}

function renderFileList() {
    const list = document.getElementById('fileList');
    list.innerHTML = "";
    let files = JSON.parse(localStorage.getItem('tasks_jose')) || [];
    const filtered = files.filter(f => f.unit === selectedUnit && f.week === selectedWeek);

    filtered.forEach(f => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <span class="file-link" onclick="downloadFile(${f.id})">${f.name}</span>
            <button onclick="deleteFile(${f.id})" style="background:none; border:none; cursor:pointer; color:white;">🗑️</button>
        `;
        list.appendChild(div);
    });
}

function downloadFile(id) {
    const files = JSON.parse(localStorage.getItem('tasks_jose')) || [];
    const f = files.find(x => x.id === id);
    if (f) {
        const link = document.createElement('a');
        link.href = f.content;
        link.download = f.name;
        link.click();
    }
}

function deleteFile(id) {
    if(confirm("¿Borrar tarea?")) {
        let files = JSON.parse(localStorage.getItem('tasks_jose')) || [];
        files = files.filter(x => x.id !== id);
        localStorage.setItem('tasks_jose', JSON.stringify(files));
        renderFileList();
    }
}

// Cerrar modales si se hace clic fuera de la caja
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}
