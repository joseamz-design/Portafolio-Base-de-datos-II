// Navegación Profesional
function smoothScroll(e, id) {
    e.preventDefault();
    const element = document.getElementById(id);
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Control de Proyectos
function showProject(num) {
    const detail = document.getElementById('projectDetail');
    const title = document.getElementById('detailTitle');
    const text = document.getElementById('detailText');
    
    detail.classList.remove('hidden');
    title.innerText = num === 1 ? "Sistema de Ventas" : "Gestión de BD";
    text.innerText = "Detalle extendido del proyecto " + num + ". Este recuadro te seguirá mientras bajes en esta sección.";
    
    // Animación rápida de tarjetas
    document.querySelectorAll('.project-card').forEach(c => c.style.opacity = '0.3');
    document.getElementById('card' + num).style.opacity = '1';
}

function hideProject() {
    document.getElementById('projectDetail').classList.add('hidden');
    document.querySelectorAll('.project-card').forEach(c => c.style.opacity = '1');
}

// Modales
function openWeekModal(n) { document.getElementById('weekModal').style.display = 'flex'; }
function openLoginModal() { document.getElementById('loginModal').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// Auth: Login / Registro
function toggleAuth() {
    document.getElementById('registerCard').classList.toggle('hidden');
}

function deleteResource(id) {
    if(confirm("¿Eliminar recurso?")) document.getElementById(id).remove();
}

// VALIDACIÓN Y REGISTRO
function doRegister() {
    const dni = document.getElementById('regDni').value;
    const tel = document.getElementById('regTel').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;

    if (dni.length !== 8) return alert("DNI debe tener 8 dígitos");
    if (tel.length !== 9) return alert("Teléfono debe tener 9 dígitos");
    if (!email.endsWith("@xn8.com")) return alert("El correo debe ser @xn8.com");
    if (!pass) return alert("La contraseña es obligatoria");

    // Guardar en LocalStorage
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPass', pass);

    alert("¡Registrado con éxito!");
    toggleAuth(); // Se "oculta" volviendo al login
}

function doLogin() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    const savedEmail = localStorage.getItem('userEmail');
    const savedPass = localStorage.getItem('userPass');

    if (email === savedEmail && pass === savedPass) {
        alert("Bienvenido, José.");
        closeModal('loginModal');
    } else {
        alert("Datos incorrectos. ¿Ya te registraste?");
    }
}
