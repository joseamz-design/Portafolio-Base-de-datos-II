// Funciones Generales de Modales
function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// Lógica de Semanas
function openWeekModal(num) {
    const modal = document.getElementById('weekModal');
    document.getElementById('weekModalTitle').innerText = "Semana " + num;
    modal.style.display = "flex";
}

// Lógica de Login
function openLoginModal() {
    document.getElementById('loginModal').style.display = "flex";
}

// --- Lógica Avanzada de Proyectos (José Moori Zegarra) ---

function toggleProjectDetail(cardId, detailId) {
    const grid = document.getElementById('projectsGrid');
    const card = document.getElementById(cardId);
    const detail = document.getElementById(detailId);
    
    // Identificar la otra tarjeta
    const otherCardId = (cardId === 'project1Card') ? 'project2Card' : 'project1Card';
    const otherCard = document.getElementById(otherCardId);

    // Si el detalle ya está abierto, cerrarlo (comportamiento opcional)
    if (!detail.classList.contains('hidden')) {
        closeProjectDetail(cardId, detailId);
        return;
    }

    // 1. Ocultar el otro proyecto con animación lateral
    if (cardId === 'project1Card') {
        otherCard.classList.add('fade-out-right'); // El 2 se va a la derecha
    } else {
        otherCard.classList.add('fade-out-left'); // El 1 se va a la izquierda
    }

    // 2. Esperar a que la animación termine, luego mostrar el detalle
    setTimeout(() => {
        otherCard.classList.add('hidden'); // Ocultar completamente
        detail.classList.remove('hidden'); // Mostrar detalle grande
    }, 400); // Mismo tiempo que la transición CSS
}

function closeProjectDetail(cardId, detailId) {
    const card = document.getElementById(cardId);
    const detail = document.getElementById(detailId);
    
    const otherCardId = (cardId === 'project1Card') ? 'project2Card' : 'project1Card';
    const otherCard = document.getElementById(otherCardId);

    // 1. Ocultar detalle
    detail.classList.add('hidden');

    // 2. Reaparecer el otro proyecto
    otherCard.classList.remove('hidden');
    
    // Quitar clases de animación para que se vea estático de nuevo
    setTimeout(() => {
        otherCard.classList.remove('fade-out-left', 'fade-out-right');
    }, 50);
}

// --- Simulación de Gestión (Semanas) ---

function simularSubida(input, tipo) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    
    // Obtener fecha y hora exacta
    const ahora = new Date();
    const stampText = ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString();

    // Crear item en la lista
    const list = document.getElementById('resourceList');
    const newItem = document.createElement('li');
    newItem.className = "resource-item";
    
    newItem.innerHTML = `
        <span><i class="fas fa-file-alt"></i> ${file.name}</span>
        <span class="upload-stamp invisible-stamp">Subido: <span class="date-now">${stampText}</span></span>
        <div class="item-controls">
            <button class="btn-icon edit" onclick="simularEdicion(this)"><i class="fas fa-edit"></i></button>
            <button class="btn-icon delete" onclick="simularEliminacion(this)"><i class="fas fa-trash-alt"></i></button>
        </div>
    `;
    
    list.appendChild(newItem);
    alert(`Archivo "${file.name}" subido simuladamente a ${tipo}.`);
    input.value = ''; // Resetear input
}

function simularEdicion(btn) {
    const itemName = btn.closest('.resource-item').querySelector('span:first-child');
    const nuevoNombre = prompt("Nuevo nombre para el archivo:", itemName.innerText.trim());
    
    if (nuevoNombre && nuevoNombre.trim() !== "") {
        itemName.innerHTML = `<i class="fas fa-file-alt"></i> ${nuevoNombre.trim()}`;
        
        // Actualizar la fecha de "Edición" (usando el stamp invisible)
        const ahora = new Date();
        btn.closest('.resource-item').querySelector('.upload-stamp').innerText = 'Editado: ' + ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString();
        
        alert("Archivo editado.");
    }
}

function simularEliminacion(btn) {
    if (confirm("¿Estás seguro de eliminar este recurso?")) {
        btn.closest('.resource-item').remove();
        alert("Archivo eliminado.");
    }
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}
