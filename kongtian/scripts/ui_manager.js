let allCards = [];
let originalTexts = new Map();

export function renderContent(data) {
    const contentContainer = document.getElementById('report-content');
    const sidebarNav = document.getElementById('sidebar-nav');
    const mainNav = document.getElementById('nav-links');

    if (!contentContainer || !sidebarNav || !mainNav) return;

    let contentHtml = '';
    let sidebarHtml = '<ul>';
    let mainNavHtml = `<a href=\"#introduction\" class=\"nav-link\">引言</a>`;

    contentHtml += `<div id=\"introduction\" class=\"mb-16\">${markdownToHtml(data.introduction)}</div>`;
    
    const vizId = "data-visualization";
    contentHtml += `
        <h2 id=\"${vizId}\">数据洞察：行业趋势与潜力</h2>
        <p>通过对行业数据的深度挖掘，我们可以更直观地把握空天经济的发展脉搏与未来潜力。以下图表展示了关键领域的增长趋势、技术成熟度、市场格局与重要里程碑。</p>
        
        <div class="chart-container">
            <h3 class="text-xl font-semibold text-white mb-4">主要公司近期融资对比 (亿元)</h3>
            <div class="h-[400px]"><canvas id="financing-chart"></canvas></div>
        </div>
        <div class="chart-container">
            <h3 class="text-xl font-semibold text-white mb-4">关键技术成熟度曲线 (TRL)</h3>
            <div id="trl-chart-container"></div>
        </div>
        <div class="chart-container">
            <h3 class="text-xl font-semibold text-white mb-4">国家级卫星星座规划</h3>
            <div class="h-[400px]"><canvas id="satellite-launch-chart"></canvas></div>
        </div>
         <div class="chart-container">
            <h3 class="text-xl font-semibold text-white mb-4">低空经济细分市场规模预测</h3>
             <div class="h-[400px]"><canvas id="market-forecast-chart"></canvas></div>
        </div>
        <hr class="my-12 border-gray-700">
        <h2 id=\"original-charts-title\">原始数据图表</h2>
        <div class="chart-container">
            <h3 class="text-xl font-semibold text-white mb-4">中国商业航天投融资趋势 (2020-2024)</h3>
            <div class="h-[400px]"><canvas id="funding-chart"></canvas></div>
        </div>
        <div class="chart-container">
            <h3 class="text-xl font-semibold text-white mb-4">中国低空经济市场规模预测 (万亿)</h3>
            <div class="h-[400px]"><canvas id="market-size-chart"></canvas></div>
        </div>
        <div class="chart-container">
            <h3 class="text-xl font-semibold text-white mb-4">关键技术发展里程碑时间线</h3>
            <div id="timeline-chart-container" class="timeline-container"></div>
        </div>
         <div class="chart-container">
            <h3 class="text-xl font-semibold text-white mb-4">产业政策支持框架示意图</h3>
            <div id="policy-chart-container"></div>
        </div>
    `;

    sidebarHtml += `<li><a href=\"#${vizId}\">数据洞察</a></li>`;
    mainNavHtml += `<a href=\"#${vizId}\" class=\"nav-link\">数据洞察</a>`;


    data.sections.forEach(section => {
        contentHtml += `<h2 id=\"${section.id}\" class=\"mt-16\">${section.title}</h2>`;
        sidebarHtml += `<li><h3 class="section-title">${section.title}</h3><ul>`;
        mainNavHtml += `<a href=\"#${section.id}\" class=\"nav-link\">${section.title}</a>`;

        section.chapters.forEach(chapter => {
            contentHtml += `<div class=\"chapter-block\" id=\"${chapter.id}\">`;
            contentHtml += `<h3 class="text-2xl font-bold text-amber-400 mt-12 mb-6\">${chapter.title}</h3>`;
            contentHtml += `<div class=\"prose-p:my-4 prose-p:leading-relaxed\">${markdownToHtml(chapter.intro_text)}</div>`;
            sidebarHtml += `<li><a href=\"#${chapter.id}\">${chapter.title}</a></li>`;

            chapter.rebuttals.forEach(rebuttal => {
                const cardId = `card-${rebuttal.id}`;
                contentHtml += `
                    <div id=\"${cardId}\" class=\"rebuttal-card\" data-searchable-content=\"${rebuttal.id} ${rebuttal.original_title.toLowerCase()} ${rebuttal.original_desc.toLowerCase()} ${rebuttal.rebuttal_text.toLowerCase()}\">\n                        <div class=\"card-header\">\n                            <h4 class=\"text-lg font-semibold text-white flex-1\">\n                                <span class=\"text-blue-400 mr-2\">#${rebuttal.id}</span>\n                                ${rebuttal.original_title}\n                            </h4>\n                            <i data-lucide=\"chevron-down\" class=\"chevron text-gray-400\"></i>\n                        </div>
                        <div class=\"card-content\">\n                            <blockquote class=\"border-l-4 border-yellow-500 pl-4 py-2 my-4 bg-gray-800 rounded-r-lg\">\n                                <p class=\"font-medium text-yellow-300\">原始质疑:</p>\n                                <p class=\"text-gray-300\">${rebuttal.original_desc}</p>\n                            </blockquote>
                            <div class=\"rebuttal-body prose prose-invert max-w-none\">${markdownToHtml(rebuttal.rebuttal_text)}</div>
                        </div>
                    </div>
                `;
            });

            contentHtml += `</div>`;
        });
        sidebarHtml += `</ul></li>`;
    });

    contentHtml += `<div id=\"conclusion\" class=\"mt-16\">${markdownToHtml(data.conclusion)}</div>`;
    sidebarHtml += `<li><a href=\"#conclusion\">总结陈词</a></li>`;
    mainNavHtml += `<a href=\"#conclusion\" class=\"nav-link\">总结陈词</a>`;

    contentContainer.innerHTML = contentHtml;
    sidebarNav.innerHTML = sidebarHtml + '</ul>';
    mainNav.innerHTML = mainNavHtml;

    lucide.createIcons();
    allCards = document.querySelectorAll('.rebuttal-card');
    allCards.forEach(card => {
        const body = card.querySelector('.rebuttal-body');
        if (body) {
            originalTexts.set(card.id, body.innerHTML);
        }
    });
}

export function setupInteractions() {
    const cards = document.querySelectorAll('.rebuttal-card .card-header');
    cards.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const chevron = header.querySelector('.chevron');
            content.classList.toggle('expanded');
            chevron.classList.toggle('expanded');
        });
    });

    const backToTopButton = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            backToTopButton.classList.add('opacity-0', 'pointer-events-none');
        }
        updateSidebarActiveLink();
        updateNavbarActiveLink();
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.querySelectorAll('#sidebar-nav a, #main-nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const header = document.getElementById('main-header');
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                     top: offsetPosition,
                     behavior: "smooth"
                });
            }
        });
    });
}

function updateSidebarActiveLink() {
    let current = '';
    const sections = document.querySelectorAll('div.chapter-block, #introduction, #data-visualization, #conclusion');
    const sidebarLinks = document.querySelectorAll('#sidebar-nav a');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });

    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').substring(1);
        if (href === current) {
            link.classList.add('active');
        }
    });
}

function updateNavbarActiveLink() {
    let current = '';
    const sections = document.querySelectorAll('#introduction, #data-visualization, #commercial_aerospace, #low_altitude_economy, #conclusion');
    const navLinks = document.querySelectorAll('#main-nav a');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

export function handleSearch(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const keywords = normalizedQuery.split(' ').filter(k => k.length > 0);

    allCards.forEach(card => {
        const content = card.dataset.searchableContent;
        const body = card.querySelector('.rebuttal-body');
        const originalHtml = originalTexts.get(card.id);

        if (!originalHtml || !body) return;

        if (keywords.length === 0) {
            card.style.display = '';
            body.innerHTML = originalHtml;
            card.classList.remove('highlight-card');
            return;
        }

        const isMatch = keywords.every(keyword => content.includes(keyword));

        if (isMatch) {
            card.style.display = '';
            card.classList.add('highlight-card');
            const regex = new RegExp(keywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'), 'gi');
            body.innerHTML = originalHtml.replace(regex, match => `<span class="highlight">${match}</span>`);
        } else {
            card.style.display = 'none';
            card.classList.remove('highlight-card');
            body.innerHTML = originalHtml;
        }
    });
}


function markdownToHtml(markdown) {
    if(!markdown) return '';
    let html = markdown.replace(/\\n/g, '\n');
    
    html = html.replace(/^### (.*$)/gim, '<h3 class=\"text-xl font-bold mt-6 mb-3\">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class=\"text-2xl font-bold mt-10 mb-4\">$1</h2>');
    
    html = html.replace(/\n> (.*)/g, (match, content) => {
        return `\n<blockquote class=\"border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-800 rounded-r-lg\"><p>${content.replace(/\n> /g, '<br>')}</p></blockquote>`;
    });
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(\n<li>.*<\/li>)+/g, '<ul>$&</ul>');

    html = html.replace(/`([^`]+)`/g, '<code class=\"bg-gray-700 text-yellow-300 px-1.5 py-0.5 rounded-md text-sm\">$1</code>');


    html = html.replace(/\|(.+)\|\n\|( *:?-+:? *\|)+/g, (match, header) => {
        let headerHtml = '<thead><tr>' + header.split('|').slice(1, -1).map(h => `<th class=\"px-4 py-2 border border-gray-600\">${h.trim()}</th>`).join('') + '</tr></thead>';
        return '<table>' + headerHtml;
    });
    html = html.replace(/\|(.+)\|/g, (match, row) => {
        if (match.includes('---')) return match; 
        if (match.includes('</th')) return match;
        return '<tr>' + row.split('|').slice(1, -1).map(c => `<td class=\"px-4 py-2 border border-gray-600\">${c.trim()}</td>`).join('') + '</tr>';
    });
    html = html.replace(/<\/thead>(<tr>.+<\/tr>)+/g, '</thead><tbody>$&</tbody>');
    html = html.replace(/<\/tr>(\n)*<\/table>/g, '</tr></tbody></table>');
    
    const paragraphs = html.split('\n').filter(p => p.trim() !== '');
    return paragraphs.map(p => {
        if (p.startsWith('<ul') || p.startsWith('<li') || p.startsWith('<h') || p.startsWith('<table') || p.startsWith('<thead') || p.startsWith('<tbody') || p.startsWith('<tr') || p.startsWith('<blockquote')) {
            return p;
        }
        return `<p>${p}</p>`;
    }).join('');
}
