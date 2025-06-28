import { scroll, animate } from "https://esm.run/framer-motion";

export function initInteractions() {
    initUI();
    createModalContainer();
    initScrollAnimations();
    initABX3Diagram();
    initWorkingPrincipleDiagram();
    initProjectArchitectureDiagram();
    initApplicationScenarios();
}

export function initUI() {
    initMobileMenu();
    initHeaderScroll();
    initActiveNavOnScroll();
}

function initMobileMenu() {
    const button = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    const openIcon = document.getElementById('menu-icon-open');
    const closeIcon = document.getElementById('menu-icon-close');
    const body = document.body;

    if (button && menu && openIcon && closeIcon) {
        button.addEventListener('click', () => {
            menu.classList.toggle('-translate-x-full');
            openIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
            body.classList.toggle('overflow-hidden'); 
        });

        menu.querySelectorAll('a.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.add('-translate-x-full');
                openIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
                body.classList.remove('overflow-hidden');
            });
        });
    }
}

function initHeaderScroll() {
    const header = document.getElementById('header');
    if(header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
    }
}

function initActiveNavOnScroll() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: "-30% 0px -70% 0px" });

    sections.forEach(section => {
        observer.observe(section);
    });
}

function initScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('.fade-in-up');
    
    elementsToAnimate.forEach(el => {
        el.style.opacity = 0;
        scroll(animate(el, { opacity: 1, y: [20, 0] }, { duration: 0.6 }), {
            target: el,
            offset: ["start end", "start 0.85"]
        });
    });
}

function initABX3Diagram() {
    const container = document.getElementById('interactive-abx3');
    if (!container) return;

    container.innerHTML = `
        <div class="relative w-56 h-56 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center bg-gray-800/30" id="abx3-diagram">
            <div class="atom b-site w-12 h-12 bg-cyan-400 border-2 border-cyan-200 rounded-full cursor-pointer transition-transform duration-200 hover:scale-125" style="z-index: 1;" data-info="<strong>B位: 金属阳离子 (如Pb²⁺)</strong><br>位于晶格中心，与X离子形成八面体骨架，是决定钙钛矿基本光电特性的核心。"></div>
            <div class="atom a-site w-8 h-8 bg-green-400 border-2 border-green-200 absolute rounded-full cursor-pointer transition-transform duration-200 hover:scale-125" style="top: 0; left: 0;" data-info="<strong>A位: 有机或无机阳离子 (如CH₃NH₃⁺)</strong><br>位于立方体顶点，填充于八面体间隙，影响结构稳定性和带隙宽度。"></div>
            <div class="atom a-site w-8 h-8 bg-green-400 border-2 border-green-200 absolute rounded-full cursor-pointer transition-transform duration-200 hover:scale-125" style="top: 0; right: 0;"></div>
            <div class="atom a-site w-8 h-8 bg-green-400 border-2 border-green-200 absolute rounded-full cursor-pointer transition-transform duration-200 hover:scale-125" style="bottom: 0; left: 0;"></div>
            <div class="atom a-site w-8 h-8 bg-green-400 border-2 border-green-200 absolute rounded-full cursor-pointer transition-transform duration-200 hover:scale-125" style="bottom: 0; right: 0;"></div>
            <div class="atom x-site w-6 h-6 bg-amber-400 border-2 border-amber-200 absolute rounded-full cursor-pointer transition-transform duration-200 hover:scale-125" style="top: 50%; left: -12px; transform: translateY(-50%);" data-info="<strong>X位: 卤族阴离子 (I⁻, Cl⁻, Br⁻)</strong><br>位于面心，桥接B位离子，形成BX₆八面体，对载流子传输至关重要。"></div>
            <div class="atom x-site w-6 h-6 bg-amber-400 border-2 border-amber-200 absolute rounded-full cursor-pointer transition-transform duration-200 hover:scale-125" style="top: 50%; right: -12px; transform: translateY(-50%);"></div>
            <div class="atom x-site w-6 h-6 bg-amber-400 border-2 border-amber-200 absolute rounded-full cursor-pointer transition-transform duration-200 hover:scale-125" style="top: -12px; left: 50%; transform: translateX(-50%);"></div>
            <div class="atom x-site w-6 h-6 bg-amber-400 border-2 border-amber-200 absolute rounded-full cursor-pointer transition-transform duration-200 hover:scale-125" style="bottom: -12px; left: 50%; transform: translateX(-50%);"></div>
            <div id="abx3-tooltip" class="absolute hidden bg-gray-950 p-3 rounded-lg text-sm border border-cyan-400 z-10 shadow-lg max-w-xs" style="pointer-events: none; transition: opacity 0.2s;"></div>
        </div>
    `;

    const tooltip = document.getElementById('abx3-tooltip');
    const atoms = container.querySelectorAll('.atom');
    const body = document.body;
    atoms.forEach(atom => {
        atom.addEventListener('mouseover', (e) => {
            const info = e.currentTarget.dataset.info;
            if (info) {
                tooltip.innerHTML = info;
                tooltip.style.display = 'block';
            }
        });
        atom.addEventListener('mousemove', (e) => {
            tooltip.style.left = `${e.clientX - body.getBoundingClientRect().left + 15}px`;
            tooltip.style.top = `${e.clientY - body.getBoundingClientRect().top + 15}px`;
        });
        atom.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
        });
    });
}


function initWorkingPrincipleDiagram() {
    const container = document.getElementById('working-principle-diagram');
    if (!container) return;

    const layerClasses = "border-b-2 p-2 text-center text-sm transition-all duration-500 opacity-20 border-gray-700";

    container.innerHTML = `
        <div class="h-full flex flex-col justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div id="wp-step-4" class="${layerClasses}">电荷收集: 金属电极</div>
            <div id="wp-step-3b" class="${layerClasses}">载流子分离: 空穴传输层 (HTL)</div>
            <div id="wp-step-2" class="${layerClasses} py-6 font-bold text-lg text-white relative">
                光子吸收 & 激子扩散 (钙钛矿层)
                <span class="absolute top-1/2 left-2 -translate-y-1/2 text-yellow-300 text-2xl">☀️</span>
            </div>
            <div id="wp-step-3a" class="${layerClasses}">载流子分离: 电子传输层 (ETL)</div>
            <div id="wp-step-1" class="${layerClasses}">光子入射: 透明导电玻璃</div>
        </div>
        <div class="mt-4 flex justify-center space-x-4">
            <button id="wp-next-btn" class="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors">下一步</button>
            <button id="wp-reset-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors">重置</button>
        </div>
    `;

    let currentStep = 0;
    const steps = [
        document.getElementById('wp-step-1'),
        document.getElementById('wp-step-2'),
        [document.getElementById('wp-step-3a'), document.getElementById('wp-step-3b')],
        document.getElementById('wp-step-4')
    ];
    
    const highlightStep = (stepIndex) => {
        if (!steps[stepIndex]) return;
        const step = steps[stepIndex];
        const activeClasses = "opacity-100 border-cyan-400 bg-cyan-900/30 scale-105";
        if (Array.isArray(step)) {
            step.forEach(el => el.classList.add(...activeClasses.split(' ')));
        } else {
            step.classList.add(...activeClasses.split(' '));
        }
    };

    const reset = () => {
        currentStep = 0;
        const activeClasses = "opacity-100 border-cyan-400 bg-cyan-900/30 scale-105";
        steps.flat().forEach(el => el.classList.remove(...activeClasses.split(' ')));
        highlightStep(0);
    };

    document.getElementById('wp-next-btn').addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            highlightStep(currentStep);
        } else {
            reset();
        }
    });

    document.getElementById('wp-reset-btn').addEventListener('click', reset);

    highlightStep(0);
}


function initProjectArchitectureDiagram() {
    const container = document.getElementById('project-architecture-diagram');
    if (!container) return;
    
    const nodeClasses = "bg-gray-800 p-4 rounded-lg shadow-lg text-center cursor-pointer transition-all duration-300 hover:shadow-cyan-500/20 hover:shadow-lg hover:-translate-y-1";

    container.innerHTML = `
        <div class="flex flex-col items-center">
            <div class="${nodeClasses} border border-cyan-400 mb-4" data-title="战略投资方：福建钛柔" data-details="由华柔光电 (30%)、锆辉太阳能 (50%)、新欧亚科技 (20%) 共同组建。负责项目发起、核心技术注入、运营管理及未来的股权回购。">
                <h4 class="font-bold text-lg text-white">福建钛柔科技发展有限公司</h4>
                <p class="text-sm text-gray-400">项目发起与运营管理主体</p>
            </div>
            
            <div class="h-12 w-px bg-gray-600 relative">
                <i data-lucide="arrow-down" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-cyan-400"></i>
                <span class="absolute -right-24 top-1/2 -translate-y-1/2 text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">控股 35%</span>
            </div>

            <div class="${nodeClasses} border border-green-400 mt-4" data-title="项目公司：东山钛柔" data-details="由福建钛柔 (35%) 与东山岛政府 (65%) 合资成立。作为项目建设与运营的实体，负责100MW生产线的建设、生产与销售。">
                 <h4 class="font-bold text-lg text-white">东山岛钛柔科技发展有限公司</h4>
                 <p class="text-sm text-gray-400">项目建设与运营主体</p>
            </div>
        </div>
    `;
    lucide.createIcons();

    container.querySelectorAll('[data-title]').forEach(node => {
        node.addEventListener('click', () => {
            const title = node.dataset.title;
            const details = node.dataset.details;
            showModal(title, details);
        });
    });
}

function initApplicationScenarios() {
    const container = document.getElementById('application-scenarios');
    if (!container) return;

    const scenarios = [
        { title: '消费品集成光伏 (CIPV)', desc: '无缝集成于背包、衣物、手机壳等，为移动设备提供持续便携电力。', img: 'https://images.unsplash.com/photo-1553503332-b39702a07c13?q=80&w=1964&auto=format&fit=crop' },
        { title: '建筑一体化光伏 (BIPV)', desc: '轻薄柔性可贴附于曲面、幕墙，结合定制化外观，完美融入现代建筑美学。', img: 'https://images.unsplash.com/photo-1599249234369-07248b94083a?q=80&w=1974&auto=format&fit=crop' },
        { title: '车载光伏', desc: '集成于车顶、天窗或车身，为电动汽车提供辅助电力，延长续航里程。', img: 'https://images.unsplash.com/photo-1613953532948-93454b397444?q=80&w=1974&auto=format&fit=crop' },
        { title: '轻质化应用', desc: '在老旧屋顶、便携电源、航空航天等对重量敏感的领域具有不可替代的优势。', img: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=1760&auto=format&fit=crop' },
        { title: '物联网与室内供电', desc: '凭借出色的弱光发电性能，为室内物联网设备、传感器提供理想的自供电方案。', img: 'https://images.unsplash.com/photo-1581432025806-96a83f2538b7?q=80&w=2070&auto=format&fit=crop' },
        { title: '户外及应急电源', desc: '制成便携式发电毯、光伏帐篷等，满足户外活动及应急场景的电力需求。', img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop' }
    ];

    const cardClasses = "fade-in-up bg-gray-800/50 rounded-xl border border-gray-700/50 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/10 hover:shadow-lg hover:-translate-y-2 overflow-hidden";

    container.innerHTML = scenarios.map(s => `
        <div class="${cardClasses} flex flex-col">
            <div class="h-48 bg-cover bg-center" style="background-image: url('${s.img}')"></div>
            <div class="p-6 flex-grow flex flex-col">
                <h4 class="font-bold text-xl text-white mb-2">${s.title}</h4>
                <p class="text-gray-400 text-sm flex-grow">${s.desc}</p>
            </div>
        </div>
    `).join('');
}


function createModalContainer() {
    const modal = document.createElement('div');
    modal.id = 'details-modal';
    modal.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none';
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 max-w-2xl w-full transform transition-all duration-300 scale-95" role="dialog" aria-modal="true">
            <div class="flex justify-between items-center mb-4">
                <h3 id="modal-title" class="text-xl font-bold text-white"></h3>
                <button id="modal-close-btn" class="text-gray-400 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            <p id="modal-details" class="text-gray-300"></p>
        </div>
    `;
    document.body.appendChild(modal);

    const overlay = document.getElementById('details-modal');
    const content = overlay.querySelector('[role="dialog"]');

    const closeModal = () => {
        overlay.classList.remove('opacity-100', 'pointer-events-auto');
        content.classList.remove('scale-100');
    };
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    lucide.createIcons();
}

function showModal(title, details) {
    document.getElementById('modal-title').innerHTML = title;
    document.getElementById('modal-details').innerHTML = details;
    const overlay = document.getElementById('details-modal');
    const content = overlay.querySelector('[role="dialog"]');
    overlay.classList.add('opacity-100', 'pointer-events-auto');
    content.classList.add('scale-100');
}
