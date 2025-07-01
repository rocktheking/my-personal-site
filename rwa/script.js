import { loadContent } from './content_loader.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    setupStickyNav();
    setupSmoothScroll();
    setupMobileNav();

    loadContent().then(() => {
        setupAccordion();
    });
});

function setupStickyNav() {
    const navbar = document.getElementById('navbar');
    const header = document.getElementById('page-header');
    const stickyPoint = header.offsetHeight;

    window.addEventListener('scroll', () => {
        if (window.scrollY > stickyPoint) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    mobileNav.addEventListener('change', (e) => {
        const targetId = e.target.value;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

function setupAccordion() {
    const sections = document.querySelectorAll('.accordion-section');
    sections.forEach((section, index) => {
        const trigger = section.querySelector('.accordion-trigger');
        const content = section.querySelector('.accordion-content');

        if (trigger) {
            trigger.addEventListener('click', () => {
                const isActive = section.classList.contains('active');
                
                sections.forEach(s => {
                    s.classList.remove('active');
                    const c = s.querySelector('.accordion-content');
                    if (c) c.style.maxHeight = '0px';
                });

                if (!isActive) {
                    section.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        }
        

        if (index === 0 && trigger) {
             setTimeout(() => {
                section.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
             }, 300);
        }
    });
}
