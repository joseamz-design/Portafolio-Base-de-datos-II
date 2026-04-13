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
