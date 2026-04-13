// Al abrir la web, cargar lo guardado
document.addEventListener('DOMContentLoaded', loadTasks);

function openWeekModal(n) {
    document.getElementById('modalTitle').innerText = "Semana " + n;
    document.getElementById('weekModal').style.display = 'flex';
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function openLoginModal() { document.getElementById('loginModal').style.display = 'flex'; }

// --- PERSISTENCIA DE TAREAS ---

function uploadTask(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const newTask = {
            id: "task-" + Date.now(),
            name: file.name,
            content: e.target.result // Datos reales del archivo
        };

        let tasks = JSON.parse(localStorage.getItem('tasks_moori')) || [];
        tasks.push(newTask);
        localStorage.setItem('tasks_moori', JSON.stringify(tasks));

        renderTask(newTask);
        alert("Tarea guardada en memoria.");
    };
    reader.readAsDataURL(file);
}

function loadTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = "";
    const tasks = JSON.parse(localStorage.getItem('tasks_moori')) || [];
    tasks.forEach(renderTask);
}

function renderTask(task) {
    const list = document.getElementById('taskList');
    const div = document.createElement('div');
    div.className = 'task-item';
    div.id = task.id;
    div.innerHTML = `
        <div onclick="downloadTask('${task.id}')" class="task-name">📄 ${task.name}</div>
        <button onclick="deleteTask('${task.id}')" style="background:none; border:none; cursor:pointer">🗑️</button>
    `;
    list.appendChild(div);
}

function downloadTask(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks_moori')) || [];
    const t = tasks.find(x => x.id === id);
    if (t) {
        const link = document.createElement('a');
        link.href = t.content;
        link.download = t.name;
        link.click();
    }
}

function deleteTask(id) {
    if(confirm("¿Borrar tarea?")) {
        let tasks = JSON.parse(localStorage.getItem('tasks_moori')) || [];
        tasks = tasks.filter(x => x.id !== id);
        localStorage.setItem('tasks_moori', JSON.stringify(tasks));
        document.getElementById(id).remove();
    }
}

// Proyectos
function showProject(n) {
    const panel = document.getElementById('projectDetail');
    panel.classList.remove('hidden');
    document.getElementById('detailTitle').innerText = n === 1 ? "Sistema de Ventas" : "Gestión de BD";
    document.getElementById('detailText').innerText = "Este proyecto está guardado en el recuadro que baja contigo para que no pierdas la información de vista mientras navegas.";
}

function hideProject() { document.getElementById('projectDetail').classList.add('hidden'); }

function doLogin() {
    alert("¡Hola José! Sesión iniciada.");
    closeModal('loginModal');
}
