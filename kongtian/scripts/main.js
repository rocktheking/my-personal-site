import { loadContentData, loadChartData } from './data_manager.js';
import { renderContent, setupInteractions, handleSearch } from './ui_manager.js';
import { renderCharts } from './chart_manager.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        lucide.createIcons();

        const [contentData, chartData] = await Promise.all([
            loadContentData(),
            loadChartData()
        ]);
        
        renderContent(contentData);
        setupInteractions();
        renderCharts(chartData);
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
        }

    } catch (error) {
        console.error('Initialization failed:', error);
        const contentContainer = document.getElementById('report-content');
        if (contentContainer) {
            contentContainer.innerHTML = `<p class="text-red-400">Error loading report content. Please check the console for details.</p>`;
        }
    }
});
