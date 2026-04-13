<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portafolio Académico - Jose Moori Zegarra</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>

    <header id="mainHeader">
        <div class="container nav-container">
            <h1 class="logo">UPLA <span>BD II</span></h1>
            <nav>
                <ul class="nav-links">
                    <li><a href="#inicio" class="nav-link">Inicio</a></li>
                    <li class="dropdown">
                        <a href="javascript:void(0)" class="nav-link dropbtn">Semanas <i class="fas fa-caret-down"></i></a>
                        <ul class="dropdown-content">
                            <li><a href="javascript:void(0)" onclick="openWeekModal(1)">Semana 1</a></li>
                            <li><a href="javascript:void(0)" onclick="openWeekModal(2)">Semana 2</a></li>
                        </ul>
                    </li>
                    <li><a href="#proyectos" class="nav-link">Proyectos</a></li>
                    <li><a href="javascript:void(0)" class="nav-link" onclick="openContactModal()">Contacto</a></li>
                    <li><a href="javascript:void(0)" class="btn-login" onclick="openLoginModal()">Login <i class="fas fa-user-circle"></i></a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main>
        <section id="inicio" class="hero fade-in section-dark">
            <div class="container hero-content">
                <div class="profile-circle">
                    <img src="tu-foto.jpg" alt="Jose Andres Moori Zegarra">
                </div>
                <h2>Jose Andres Moori Zegarra</h2>
                <p>Estudiante de Ingeniería en la <span class="highlight">UPLA</span></p>
                <p class="specialization">Especialización: <span class="highlight">Base de Datos II</span></p>
                <div class="welcome-box">
                    <p>Bienvenido a mi portafolio académico. Aquí registro mi progreso en la materia.</p>
                </div>
            </div>
        </section>

        <section id="proyectos" class="projects section-light">
            <div class="container">
                <h2 class="section-title">Proyectos Destacados</h2>
                <div class="projects-grid" id="projectsGrid">
                    
                    <div class="project-card" id="project1Card" onclick="toggleProjectDetail('project1Card', 'project1Detail')">
                        <div class="card-icon"><i class="fas fa-code"></i></div>
                        <h3>Sistema de Ventas</h3>
                        <p>Click para detalles</p>
                    </div>

                    <div class="project-card" id="project2Card" onclick="toggleProjectDetail('project2Card', 'project2Detail')">
                        <div class="card-icon"><i class="fas fa-database"></i></div>
                        <h3>Gestión de BD</h3>
                        <p>Click para detalles</p>
                    </div>

                    <div class="project-detail-panel hidden" id="project1Detail">
                        <span class="close-detail" onclick="closeProjectDetail('project1Card', 'project1Detail')">&times;</span>
                        <h3>Detalle del Proyecto 1</h3>
                        <p>Descripción detallada, diagramas y capturas...</p>
                    </div>

                    <div class="project-detail-panel hidden" id="project2Detail">
                        <span class="close-detail" onclick="closeProjectDetail('project2Card', 'project2Detail')">&times;</span>
                        <h3>Detalle del Proyecto 2</h3>
                        <p>Información técnica y estructura de la base de datos...</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <div id="weekModal" class="modal">
        <div class="modal-content large-modal">
            <span class="close-modal corner-x" onclick="closeModal('weekModal')">&times;</span>
            <h2 id="weekModalTitle" class="modal-main-title">Semana 1</h2>
            
            <div class="week-modal-body">
                <div class="modal-welcome">Contenido y recursos.</div>
                
                <div class="modal-actions-container">
                    <a href="#" class="btn-action download"><i class="fas fa-file-pdf"></i> PDF Clase</a>
                    <label class="btn-action upload coral-bg">
                        <i class="fas fa-cloud-upload-alt"></i> Subir Tarea
                        <input type="file" style="display: none;" onchange="simularSubida(this)">
                    </label>
                </div>

                <div class="management-section">
                    <h3><i class="fas fa-tasks"></i> Gestión de Recursos</h3>
                    <ul class="resource-list" id="resourceList">
                        <li class="resource-item">
                            <span><i class="fas fa-file-pdf"></i> PDF_Clase1.pdf</span>
                            <span class="upload-stamp invisible-stamp">Subido: 20/05/2024 10:15</span>
                            <div class="item-controls">
                                <button class="btn-icon delete" onclick="eliminarRecurso(this)"><i class="fas fa-trash-alt"></i></button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <div id="contactModal" class="modal">
        <div class="modal-content floating-bubble">
            <span class="close-modal corner-x" onclick="closeModal('contactModal')">&times;</span>
            <h2><i class="fas fa-envelope"></i> Contáctame</h2>
            <div class="contact-links">
                <a href="mailto:jose.moori@upla.edu.pe"><i class="fas fa-at"></i> Correo UPLA</a>
                <a href="#"><i class="fab fa-linkedin"></i> LinkedIn</a>
            </div>
        </div>
    </div>

    <div id="authContainer" class="modal auth-modal">
        
        <div id="loginPanel" class="auth-panel auth-active">
            <span class="close-modal corner-x" onclick="closeAuth()">&times;</span>
            <h2>Iniciar Sesión</h2>
            <form class="auth-form" onsubmit="intentarLogin(event)">
                <div class="input-group">
                    <input type="email" id="loginEmail" placeholder="Correo Electrónico" required>
                </div>
                <div class="input-group">
                    <input type="password" id="loginPass" placeholder="Contraseña" required>
                </div>
                <a href="#" class="auth-link">¿Olvidaste tu contraseña?</a>
                <button type="submit" class="btn-coral full-width">Entrar</button>
            </form>
            <p class="auth-switch">¿No tienes cuenta? <a href="javascript:void(0)" onclick="toggleAuth('register')">Regístrate</a></p>
        </div>

        <div id="registerPanel" class="auth-panel auth-hidden">
            <span class="close-modal corner-x" onclick="closeAuth()">&times;</span>
            <div class="register-header">
                <h2>Crea tu Cuenta</h2>
                <p class="muted-text">Todos los campos son obligatorios</p>
            </div>
            <form class="auth-form" onsubmit="intentarRegistro(event)">
                <div class="form-row">
                    <input type="text" id="regNames" placeholder="Nombres" required>
                    <input type="text" id="regSurnames" placeholder="Apellidos" required>
                </div>
                <div class="input-group">
                    <input type="text" id="regDni" placeholder="DNI (8 dígitos)" required maxlength="8">
                    <span class="error-msg" id="dniError">Debe tener 8 dígitos numéricos.</span>
                </div>
                <div class="input-group">
                    <input type="text" id="regPhone" placeholder="Teléfono (9 dígitos)" required maxlength="9">
                    <span class="error-msg" id="phoneError">Debe tener 9 dígitos numéricos.</span>
                </div>
                <div class="input-group">
                    <input type="email" id="regEmail" placeholder="Correo (@xn8.com)" required>
                    <span class="error-msg" id="emailError">Debe terminar en @xn8.com</span>
                </div>
                <div class="input-group">
                    <input type="password" id="regPass1" placeholder="Contraseña" required>
                </div>
                <button type="submit" class="btn-coral full-width">Registrarte</button>
            </form>
            <p class="auth-switch">¿Ya tienes cuenta? <a href="javascript:void(0)" onclick="toggleAuth('login')">Inicia Sesión</a></p>
        </div>

    </div>

    <script src="script.js"></script>
</body>
</html>
