document.addEventListener('DOMContentLoaded', () => {
    const loadMarkdownFile = async (filePath, containerId) => {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdownText = await response.text();
            const container = document.getElementById(containerId);
            container.innerHTML = `<div class="markdown-body">${marked.parse(markdownText)}</div>`;
        } catch (error) {
            console.error('Error loading markdown file:', error);
            document.getElementById(containerId).innerHTML = `<div class="text-center text-red-500">无法加载文章内容，请检查文件路径或网络连接。</div>`;
        }
    };

    loadMarkdownFile('tiantian_shulian_pioneer_of_china_ai_open_source_ecosystem.md', 'content-container');
    
    lucide.createIcons();
});
