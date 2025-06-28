import { projectsData } from './data.js';

const modal = document.getElementById('project-modal');
const modalContent = document.getElementById('modal-content');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('modal-close-btn');

function showProjectModal(project) {
    if (!modalTitle || !modalBody || !modal) return;
    
    modalTitle.textContent = project.name;
    modalBody.innerHTML = project.details;
    modal.classList.add('active');
}

function hideProjectModal() {
    if (!modal) return;
    modal.classList.remove('active');
}

export function initProjectCards() {
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) return;

    projectGrid.innerHTML = projectsData.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <h3 class="project-card-title">${project.name}</h3>
            <p class="project-card-summary">${project.summary}</p>
            <div class="project-card-footer">
                <span>查看详情</span>
                <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();

    projectGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (card) {
            const projectId = card.dataset.projectId;
            const project = projectsData.find(
p => p.id === projectId);
            if (project) {
                showProjectModal(project);
            }
        }
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideProjectModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideProjectModal();
            }
        });
    }
}
