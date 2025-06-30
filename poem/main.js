import { animate, inView } from "https://esm.run/framer-motion";

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initPoetryPage();
});

function initPoetryPage() {
    loadAndRenderPoems();
    initParallax();
    lazyLoadBackground();
    initBackToTopButton();
}

async function loadAndRenderPoems() {
    try {
        const response = await fetch('poems.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const poems = await response.json();
        
        const mainTitleEl = document.getElementById('main-title');
        mainTitleEl.textContent = '罗博士的诗集';
        document.title = '罗博士的诗集';

        renderPoems(poems);
    } catch (error) {
        console.error("Failed to load or render poems:", error);
        const container = document.getElementById('poetry-container');
        container.innerHTML = `<p class="text-center text-red-400">诗集加载失败，请刷新页面重试。</p>`;
    }
}

function renderPoems(poems) {
    const container = document.getElementById('poetry-container');
    container.innerHTML = '';

    poems.forEach((poem, index) => {
        const poemEl = document.createElement('section');
        poemEl.className = 'poem-section mb-16 md:mb-20';
        const titleId = `poem-title-${index}`;
        
        poemEl.setAttribute('role', 'article');
        poemEl.setAttribute('aria-labelledby', titleId);

        const bodyHtml = poem.body.map(line => `<p>${line || '&nbsp;'}</p>`).join('');

        let prefaceHtml = '';
        if (poem.preface) {
            prefaceHtml = `<p class="poem-preface mb-6 text-justify">${poem.preface}</p>`;
        }

        poemEl.innerHTML = `
            <div class="poem-card rounded-lg shadow-lg overflow-hidden p-8 md:p-12">
                <h2 id="${titleId}" class="text-3xl md:text-4xl font-handwriting text-center text-gray-100 mb-4 tracking-wide">${poem.title}</h2>
                <div class="poem-title-divider w-24 mx-auto mb-8"></div>
                ${prefaceHtml}
                <div class="poem-body font-handwriting text-2xl md:text-3xl text-gray-200 leading-loose text-center">${bodyHtml}</div>
            </div>
        `;
        container.appendChild(poemEl);
    });
    
    initAnimations();
}

function lazyLoadBackground() {
    const backgroundEl = document.getElementById('parallax-background');
    if (!backgroundEl) return;
    
    const imageUrl = 'https://images.unsplash.com/photo-1533690124907-6f519657b5c8?q=80&w=2070&auto=format&fit=crop';
    const img = new Image();
    img.onload = () => {
        backgroundEl.style.backgroundImage = `url(${imageUrl})`;
        backgroundEl.classList.add('loaded');
    };
    img.src = imageUrl;
}

function initBackToTopButton() {
    const button = document.getElementById('back-to-top');
    if (!button) return;

    const scrollContainer = window;

    scrollContainer.addEventListener('scroll', () => {
        if (scrollContainer.scrollY > window.innerHeight) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    }, { passive: true });

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function initAnimations() {
    document.querySelectorAll('.poem-section').forEach(el => {
        inView(el, () => {
            animate(
                el,
                { opacity: 1, y: 0 },
                { duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.1 }
            );
        });
    });
}

function initParallax() {
    const background = document.getElementById('parallax-background');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        background.style.transform = `translateY(${scrollY * 0.4}px)`;
    });
}
