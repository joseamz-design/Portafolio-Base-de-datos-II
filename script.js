
const dropdownContent = document.querySelector('.dropdown-content');
const weekCards = document.querySelectorAll('.week-card');

dropdownContent.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        const selectedWeek = event.target.dataset.week;

        if (selectedWeek === 'all') {
            weekCards.forEach(card => card.style.display = 'block');
        } else {
            weekCards.forEach(card => {
                if (card.dataset.week === selectedWeek) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
});

// Panel Sobre Mí
const aboutMeBtn = document.getElementById('about-me-btn');
const aboutMePanel = document.getElementById('about-me-panel');
const closeBtn = document.querySelector('.close-btn');

aboutMeBtn.addEventListener('click', () => {
    aboutMePanel.classList.add('open');
});

closeBtn.addEventListener('click', () => {
    aboutMePanel.classList.remove('open');
});

// Animación de Barras de Progreso al Desplazarse
window.addEventListener('scroll', () => {
    const progressBars = document.querySelectorAll('.progress');
    const skillsSection = document.getElementById('skills');

    const sectionTop = skillsSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight * 0.8) {
        progressBars.forEach(bar => {
            bar.style.width = bar.parentElement.getAttribute('data-progress') + '%';
        });
    }
});
