let currentWeek = null;
let editingTaskId = null;

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', loadAllTasks);

function triggerInput(week) {
    currentWeek = week;
    document.getElementById('globalInput').click();
}

// SUBIR Y GUARDAR
function uploadTask(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const newTask = {
            id: "task-" + Date.now(),
            week: currentWeek,
            name: file.name,
            content: e.target.result
        };

        let tasks = JSON.parse(localStorage.getItem('tasks_pro')) || [];
        tasks.push(newTask);
        localStorage.setItem('tasks_pro', JSON.stringify(tasks));

        renderTask(newTask);
    };
    reader.readAsDataURL(file);
    event.target.value = ''; 
}

// DIBUJAR EN PANTALLA
function renderTask(task) {
    const list = document.getElementById(`list-${task.week}`);
    const div = document.createElement('div');
    div.className = 'task-item';
    div.id = task.id;
    div.innerHTML = `
        <span class="task-name" onclick="downloadTask('${task.id}')" title="Descargar">${task.name}</span>
        <div class="task-actions">
            <button onclick="openEditModal('${task.id}', '${task.name}')">✏️</button>
            <button onclick="deleteTask('${task.id}')">🗑️</button>
        </div>
    `;
    list.appendChild(div);
}

function loadAllTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks_pro')) || [];
    tasks.forEach(renderTask);
}

// DESCARGAR
function downloadTask(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks_pro')) || [];
    const t = tasks.find(x => x.id === id);
    if (t) {
        const link = document.createElement('a');
        link.href = t.content;
        link.download = t.name;
        link.click();
    }
}

// BORRAR
function deleteTask(id) {
    if (confirm("¿Borrar este archivo?")) {
        let tasks = JSON.parse(localStorage.getItem('tasks_pro')) || [];
        tasks = tasks.filter(x => x.id !== id);
        localStorage.setItem('tasks_pro', JSON.stringify(tasks));
        document.getElementById(id).remove();
    }
}

// EDITAR
function openEditModal(id, name) {
    editingTaskId = id;
    document.getElementById('editNameInput').value = name;
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() { document.getElementById('editModal').style.display = 'none'; }

function saveEdit() {
    const newName = document.getElementById('editNameInput').value;
    let tasks = JSON.parse(localStorage.getItem('tasks_pro')) || [];
    const task = tasks.find(x => x.id === editingTaskId);
    
    if (task) {
        task.name = newName;
        localStorage.setItem('tasks_pro', JSON.stringify(tasks));
        // Recargar pantalla para ver cambios
        location.reload(); 
    }
}
