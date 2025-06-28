import { data } from './content_data.js';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupMobileMenu();
    renderContent();
    renderCharts();
    setupProjectModal();
    lucide.createIcons();
}

function setupMobileMenu() {
    const toggleButton = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuLinks = mobileMenu.querySelectorAll('a');

    toggleButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

function renderContent() {
    document.getElementById('background-content').innerHTML = data.fundBackground;
    document.getElementById('partner-content').innerHTML = data.partners;
    renderTeam();
    renderProjects();
}

function renderTeam() {
    const container = document.getElementById('team-content-container');
    const manager = data.fundManager;
    container.innerHTML = `
        <div class="bg-gray-800/50 p-6 sm:p-8 lg:p-10 rounded-2xl border border-gray-700/50">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div class="flex justify-center md:col-span-1">
                    <img src="${manager.imageUrl}" alt="${manager.name}" class="manager-profile-image shadow-lg">
                </div>
                <div class="md:col-span-2 prose prose-invert prose-lg max-w-none">
                     <h3>${manager.name}</h3>
                     ${manager.description}
                </div>
            </div>
        </div>
    `;
}

function renderProjects() {
    const grid = document.getElementById('project-grid');
    grid.innerHTML = data.projects.map(project => `
        <div class="project-card" data-id="${project.id}">
            <div class="project-card-image-container">
                <img src="${project.imageUrl}" alt="${project.name}" class="project-card-image">
            </div>
            <div class="project-card-content">
                <h3 class="project-card-title">${project.name}</h3>
                <p class="project-card-summary">${project.summary}</p>
            </div>
            <div class="project-card-footer">
                <span>查看详情</span>
                <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function renderCharts() {
    const patientCtx = document.getElementById('patientDistributionChart').getContext('2d');
    new Chart(patientCtx, {
        type: 'doughnut',
        data: data.charts.patientDistribution,
        options: getChartOptions('患病人数 (百万)')
    });

    const burdenCtx = document.getElementById('economicBurdenChart').getContext('2d');
    new Chart(burdenCtx, {
        type: 'bar',
        data: data.charts.economicBurden,
        options: getChartOptions('经济负担 (万亿美元)')
    });
}

function getChartOptions(tooltipLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#d1d5db',
                    font: { size: 12 }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += `${context.parsed} ${tooltipLabel.split(' ')[1]}`;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#9ca3af' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af' }
            }
        }
    };
}


function setupProjectModal() {
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    const closeBtn = document.getElementById('modal-close-btn');
    const projectGrid = document.getElementById('project-grid');

    projectGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (card) {
            const projectId = card.dataset.id;
            const project = data.projects.find(p => p.id === projectId);
            if (project) {
                openModal(project);
            }
        }
    });

    const openModal = (project) => {
        document.getElementById('modal-title').textContent = project.name;
        document.getElementById('modal-body').innerHTML = project.details;
        const imageContainer = document.getElementById('modal-image-container');
        imageContainer.innerHTML = `<img src="${project.imageUrl}" alt="${project.name}" class="rounded-lg">`;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}
