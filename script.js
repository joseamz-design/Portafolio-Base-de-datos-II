// Funciones Generales de Modales
function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// Lógica de Semanas y Burbuja de Contacto
function openWeekModal(num) {
    const modal = document.getElementById('weekModal');
    document.getElementById('weekModalTitle').innerText = "Semana " + num;
    modal.style.display = "flex";
}

function openContactModal() {
    document.getElementById('contactModal').style.display = "flex";
}

// --- Lógica Avanzada de Proyectos (Más Rápida) ---
function toggleProjectDetail(cardId, detailId) {
    const card = document.getElementById(cardId);
    const detail = document.getElementById(detailId);
    const otherCardId = (cardId === 'project1Card') ? 'project2Card' : 'project1Card';
    const otherCard = document.getElementById(otherCardId);

    // 1. Ocultar el otro proyecto MÁS RÁPIDO (fade-out en CSS es 0.3s)
    if (cardId === 'project1Card') {
        otherCard.classList.add('fade-out-right');
    } else {
        otherCard.classList.add('fade-out-left');
    }

    // 2. Esperar 0.2s, luego mostrar detalle
    setTimeout(() => {
        otherCard.classList.add('hidden');
        detail.classList.remove('hidden');
    }, 200); 
}

function closeProjectDetail(cardId, detailId) {
    const detail = document.getElementById(detailId);
    const otherCardId = (cardId === 'project1Card') ? 'project2Card' : 'project1Card';
    const otherCard = document.getElementById(otherCardId);

    detail.classList.add('hidden');
    otherCard.classList.remove('hidden');
    
    setTimeout(() => {
        otherCard.classList.remove('fade-out-left', 'fade-out-right');
    }, 20); // Reaparece casi al instante
}

// --- Navegación Animada Profesional (Scroll smooth) ---
document.querySelectorAll('.nav-link[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - document.getElementById('mainHeader').offsetHeight - 20, // Ajuste para el header sticky
                behavior: 'smooth'
            });
        }
    });
});

// --- SISTEMA DE AUTENTICACIÓN Y REGISTRO (Guardado en localStorage) ---

// Abrir Login (el principal)
function openLoginModal() {
    document.getElementById('authContainer').style.display = "flex";
    showLoginPanel(); // Asegurar que Login esté visible
}

function closeAuth() {
    document.getElementById('authContainer').style.display = "none";
}

// Intercambio entre Login y Registro (Deslizamiento)
function toggleAuth(type) {
    if (type === 'register') {
        document.getElementById('loginPanel').classList.remove('auth-active');
        document.getElementById('loginPanel').classList.add('auth-hidden');
        document.getElementById('registerPanel').classList.remove('auth-hidden');
        document.getElementById('registerPanel').classList.add('auth-active');
    } else {
        showLoginPanel();
    }
}

function showLoginPanel() {
    document.getElementById('registerPanel').classList.remove('auth-active');
    document.getElementById('registerPanel').classList.add('auth-hidden');
    document.getElementById('loginPanel').classList.remove('auth-hidden');
    document.getElementById('loginPanel').classList.add('auth-active');
}

// Lógica de Registro con Validaciones (8 DNI, 9 Telf, @xn8.com)
function intentarRegistro(event) {
    event.preventDefault(); // No recargar

    // Obtener valores
    const names = document.getElementById('regNames').value;
    const surnames = document.getElementById('regSurnames').value;
    const dni = document.getElementById('regDni').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass1').value;

    let valid = true;

    // Resetear errores
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = "none");

    // Validar DNI: 8 dígitos numéricos
    if (!/^\d{8}$/.test(dni)) {
        document.getElementById('dniError').style.display = "block";
        valid = false;
    }

    // Validar Teléfono: 9 dígitos numéricos
    if (!/^\d{9}$/.test(phone)) {
        document.getElementById('phoneError').style.display = "block";
        valid = false;
    }

    // Validar Correo: debe terminar en @xn8.com
    if (!email.endsWith('@xn8.com')) {
        document.getElementById('emailError').style.display = "block";
        valid = false;
    }

    if (valid) {
        // --- GUARDADO DE DATOS (localStorage) ---
        // Tus datos se están guardando en el navegador del usuario.
        const userData = { names, surnames, dni, phone, email, pass };
        // Guardar por correo (clave única)
        localStorage.setItem('user_' + email, JSON.stringify(userData));

        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        event.target.reset(); // Limpiar formulario
        toggleAuth('login'); // Volver al login ocultándose atrás
    }
}

// Lógica de Login: Verificar contra localStorage
function intentarLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    // Recuperar datos guardados
    const savedUserDataJson = localStorage.getItem('user_' + email);
    
    if (savedUserDataJson) {
        const userData = JSON.parse(savedUserDataJson);
        // Verificar contraseña
        if (userData.pass === pass) {
            alert(`¡Bienvenido de nuevo, ${userData.names}!`);
            closeAuth();
            // Aquí puedes redirigir o desbloquear zonas protegidas
        } else {
            alert("Contraseña incorrecta.");
        }
    } else {
        alert("El correo electrónico no está registrado.");
    }
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}
