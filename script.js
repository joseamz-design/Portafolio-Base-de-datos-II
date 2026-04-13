
// Funciones para Paneles Laterales
document.getElementById('about-me-btn').addEventListener('click', () => {
    document.getElementById('about-me-panel').classList.add('active');
});

document.getElementById('testimonials-btn').addEventListener('click', () => {
    document.getElementById('testimonials-panel').classList.add('active');
});

function closePanel(id) {
    document.getElementById(id).classList.remove('active');
}

// Funciones para el Modal de Semanas
function openWeek(num) {
    const modal = document.getElementById('week-modal');
    document.getElementById('modal-title').innerText = "Semana " + num;
    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById('week-modal').style.display = "none";
}

// Lógica de Proyectos (Simular cambio de pantalla)
function viewProject(id) {
    const list = document.getElementById('projects-list');
    const detail = document.getElementById('project-detail');
    const content = document.getElementById('project-content');

    list.classList.add('hidden');
    detail.classList.remove('hidden');

    if(id === 'p1') {
        content.innerHTML = "<h2>Detalle del Proyecto 1</h2><p>Aquí va toda la info extendida...</p>";
    } else {
        content.innerHTML = "<h2>Detalle del Proyecto 2</h2><p>Información de la base de datos...</p>";
    }
}

function hideProject() {
    document.getElementById('projects-list').classList.remove('hidden');
    document.getElementById('project-detail').classList.add('hidden');
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('week-modal');
    if (event.target == modal) closeModal();
}
