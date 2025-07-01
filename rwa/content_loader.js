export async function loadContent() {
    try {
        const response = await fetch('rwa_tutorial.md');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdownText = await response.text();
        const sections = markdownText.split(new RegExp('^---$', 'm'));
        
        const sectionIds = [
            'intro',
            'chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5', 
            'chapter6', 'chapter7', 'chapter8', 'chapter9', 'chapter10',
            'chapter11', 'chapter12'
        ];
        
        sections.forEach((sectionContent, index) => {
            if (index < sectionIds.length) {
                const containerId = sectionIds[index];
                const container = document.getElementById(containerId);
                if (container) {
                    const htmlContent = marked.parse(sectionContent.trim());
                    if (container.classList.contains('accordion-section')) {
                        const titleMatch = htmlContent.match(new RegExp('<h3[^>]*>(.*?)</h3>'));
                        const title = titleMatch ? titleMatch[1] : `Chapter ${index}`;
                        const restContent = titleMatch ? htmlContent.substring(titleMatch[0].length) : htmlContent;
                        
                        container.innerHTML = `
                            <button class="accordion-trigger">
                                <span class="text-left">${title}</span>
                                <i data-lucide="chevron-down" class="accordion-icon"></i>
                            </button>
                            <div class="accordion-content">
                                <div class="prose max-w-none p-6">${restContent}</div>
                            </div>
                        `;
                    } else {
                        container.innerHTML = `<div class="prose max-w-none">${htmlContent}</div>`;
                    }
                }
            }
        });

        lucide.createIcons();

    } catch (error) {
        console.error("Failed to load or parse markdown content:", error);
        document.getElementById('content-container').innerHTML = '<p class=\"text-center text-red-400\">教程内容加载失败，请刷新页面重试。</p>';
    }
}
