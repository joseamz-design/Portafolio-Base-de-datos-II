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

    // 1. Ocultar el otro proyecto con animación lateral RÁPIDA
    if (cardId === 'project1Card') {
        otherCard.classList.add('fade-out-right'); // El 2 se va a la derecha
    } else {
        otherCard.classList.add('fade-out-left'); // El 1 se va a la izquierda
    }

    // 2. Esperar a que la animación termine, luego mostrar el detalle
    setTimeout(() => {
        otherCard.classList.add('hidden'); // Ocultar completamente
        detail.classList.remove('hidden'); // Mostrar detalle grande
    }, 200); // Mismo tiempo que la transición CSS (0.2s)
}

function closeProjectDetail(cardId, detailId) {
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

// --- Gestión de Semanas (Solo tachito funciona, Editar no) ---

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
        <span class="upload-stamp invisible-stamp">Subido: ${stampText}</span>
        <div class="item-controls">
            <button class="btn-icon delete" onclick="simularEliminacion(this)"><i class="fas fa-trash-alt"></i></button>
        </div>
    `;
    
    list.appendChild(newItem);
    alert(`Archivo "${file.name}" subido simuladamente.`);
    input.value = ''; // Resetear input
}

function simularEliminacion(btn) {
    if (confirm("¿Estás seguro de eliminar este recurso?")) {
        btn.closest('.resource-item').remove();
    }
}

// --- Lógica de AUTENTICACIÓN Avanzada ---

// Abrir Modal de Login
function openLoginModal() {
    document.getElementById('loginModal').style.display = "flex";
    document.getElementById('registerPanel').classList.add('hidden'); // Asegurar registro oculto
}

// Abrir Panel de Registro
function openRegisterPanel() {
    document.getElementById('registerPanel').classList.remove('hidden');
}

// Cerrar Panel de Registro (como ocultándose atrás)
function closeRegisterPanel() {
    const panel = document.getElementById('registerPanel');
    panel.style.animation = "fadeIn 0.3s reverse forwards"; // Animación rápida de desaparición
    setTimeout(() => {
        panel.classList.add('hidden');
        panel.style.animation = ""; // Resetear animación
    }, 300);
}

// Validaciones de Registro
const validateField = (id, errorId, isValid) => {
    const field = document.getElementById(id);
    const errorSpan = document.getElementById(errorId);
    if (!isValid) {
        errorSpan.classList.remove('hidden');
        return false;
    } else {
        errorSpan.classList.add('hidden');
        return true;
    }
};

const dniRegex = /^\d{8}$/;
const phoneRegex = /^\d{9}$/;
const emailRegex = /^[a-zA-Z0-9._-]+@xn8\.com$/;

// Manejar Registro
function handleRegister(event) {
    event.preventDefault();

    const dni = document.getElementById('regDni').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;

    let isAllValid = true;
    isAllValid &= validateField('regDni', 'errDni', dniRegex.test(dni));
    isAllValid &= validateField('regPhone', 'errPhone', phoneRegex.test(phone));
    isAllValid &= validateField('regEmail', 'errEmail', emailRegex.test(email));

    if (!isAllValid) return; // Detener si hay errores

    // Guardar datos en localStorage (en el navegador del usuario)
    localStorage.setItem('auth_email', email);
    localStorage.setItem('auth_pass', pass);

    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    closeRegisterPanel();
}

// Manejar Login
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    // Obtener datos guardados
    const savedEmail = localStorage.getItem('auth_email');
    const savedPass = localStorage.getItem('auth_pass');

    if (email === savedEmail && pass === savedPass) {
        alert("Inicio de sesión exitoso. ¡Bienvenido!");
        closeModal('loginModal');
        // Aquí podrías habilitar secciones protegidas, etc.
        document.body.classList.add('authenticated'); 
    } else {
        alert("Correo o contraseña incorrectos. Regístrate primero.");
    }
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}
