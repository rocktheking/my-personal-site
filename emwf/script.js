import { spectrumData } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    const markersContainer = document.getElementById('spectrum-markers');
    const labelsContainer = document.getElementById('spectrum-labels');
    const calloutsContainer = document.getElementById('spectrum-callouts');
    const legendContainer = document.getElementById('legend');
    const filterContainer = document.getElementById('filter-container');
    const modalContainer = document.getElementById('modal-container');
    const modalOverlay = document.getElementById('modal-overlay');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    let allMarkerElements = [];
    let activeCallouts = [];
    const MIN_FREQ_HZ = 100 * 1000 * 1000;
    const MAX_FREQ_HZ = 1 * 1000 * 1000 * 1000 * 1000;

    const LOG_MIN = Math.log10(MIN_FREQ_HZ);
    const LOG_MAX = Math.log10(MAX_FREQ_HZ);
    const LOG_RANGE = LOG_MAX - LOG_MIN;

    const freqToPercent = (hz) => {
        if (hz < MIN_FREQ_HZ) return 0;
        if (hz > MAX_FREQ_HZ) return 100;
        return ((Math.log10(hz) - LOG_MIN) / LOG_RANGE) * 100;
    };

    const applyFilter = (category) => {
        const activeBtn = filterContainer.querySelector('.filter-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        const newActiveBtn = filterContainer.querySelector(`.filter-btn[data-category="${category}"]`);
        if (newActiveBtn) newActiveBtn.classList.add('active');

        const activeLegend = legendContainer.querySelector('.legend-item.active');
        if (activeLegend) activeLegend.classList.remove('active');
        if (category !== 'all') {
            const newActiveLegend = legendContainer.querySelector(`.legend-item[data-category="${category}"]`);
            if (newActiveLegend) newActiveLegend.classList.add('active');
        }

        filterMarkersOnly(category);
        
        if (category === 'all') {
            displayCallouts(spectrumData, true);
        } else {
            const items = spectrumData.filter(item => item.category === category);
            displayCallouts(items, false);
        }

        if (searchInput.value.trim()) {
            handleSearch();
        }
    };
    
    const renderAxisLabels = () => {
        const labels = [
            { freq: 300e6, label: '300 MHz' }, { freq: 1e9, label: '1 GHz' },
            { freq: 3e9, label: '3 GHz' }, { freq: 10e9, label: '10 GHz' },
            { freq: 30e9, label: '30 GHz' }, { freq: 100e9, label: '100 GHz' },
            { freq: 300e9, label: '300 GHz' }, { freq: 1e12, label: '1 THz' },
            { freq: 100e12, label: '100 THz' }
        ];

        labels.forEach(({ freq, label }) => {
            const percent = freqToPercent(freq);
            if (percent >= 0 && percent <= 100) {
                const labelEl = document.createElement('div');
                labelEl.className = 'axis-label';
                labelEl.style.left = `${percent}%`;
                labelEl.innerHTML = `<div class="tick"></div>${label}`;
                labelsContainer.appendChild(labelEl);
            }
        });
    };

    const renderMarkers = () => {
        const categories = new Map();
        markersContainer.innerHTML = '';
        allMarkerElements = [];

        spectrumData.forEach(item => {
            const centerFreq = Math.sqrt(item.frequency_min_hz * item.frequency_max_hz);
            const position = freqToPercent(centerFreq);
            if (position < 0 || position > 100) return;

            const categorySlug = item.category.replace(new RegExp(' ', 'g'), '-');
            const categoryClass = `category-${categorySlug}`;
            if (!categories.has(item.category)) {
                categories.set(item.category, categoryClass);
            }

            const markerWrapper = document.createElement('div');
            markerWrapper.className = 'marker-wrapper';
            markerWrapper.style.left = `${position}%`;
            markerWrapper.dataset.category = item.category;
            markerWrapper.dataset.id = item.id;

            const markerEl = document.createElement('div');
            markerEl.className = `marker ${categoryClass}`;
            
            markerWrapper.appendChild(markerEl);
            markersContainer.appendChild(markerWrapper);
            allMarkerElements.push(markerWrapper);
        });

        renderLegend(categories);
        generateFilters(categories);
        applyFilter('all');
    };

    const renderLegend = (categories) => {
        legendContainer.innerHTML = '';
        const sortedCategories = [...categories.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'));
        
        for (const [name, className] of sortedCategories) {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.dataset.category = name;
            legendItem.innerHTML = `<div class="legend-color-box ${className}"></div><span class="text-sm text-slate-300 pointer-events-none">${name}</span>`;
            legendContainer.appendChild(legendItem);
        }

        legendContainer.addEventListener('click', (e) => {
            const legendItem = e.target.closest('.legend-item');
            if (legendItem) {
                const category = legendItem.dataset.category;
                if (legendItem.classList.contains('active')) {
                    applyFilter('all');
                } else {
                    applyFilter(category);
                }
            }
        });
    };

    const generateFilters = (categories) => {
        filterContainer.innerHTML = '';
        const sortedCategoryNames = [...categories.keys()].sort((a, b) => a.localeCompare(b, 'zh-CN'));
        const categoryIcons = {
            '显示全部': 'list',
            '短距离通信': 'bluetooth',
            'ISM频段': 'radio-tower',
            '卫星通信': 'satellite',
            '导航': 'compass',
            '雷达': 'radar',
            '移动通信': 'smartphone',
            '通用': 'globe'
        };

        const createButton = (name, cat) => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn flex items-center gap-2';
            btn.textContent = name;
            btn.dataset.category = cat;
            const iconName = categoryIcons[name] || 'tag';
            btn.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4"></i><span>${name}</span>`;
            return btn;
        };
        
        filterContainer.appendChild(createButton('显示全部', 'all'));
        sortedCategoryNames.forEach(cat => {
            filterContainer.appendChild(createButton(cat, cat));
        });

        lucide.createIcons();

        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (btn) {
                applyFilter(btn.dataset.category);
            }
        });
    };

    const filterMarkersOnly = (category) => {
        allMarkerElements.forEach(marker => {
            if (category === 'all' || marker.dataset.category === category) {
                marker.classList.remove('inactive');
            } else {
                marker.classList.add('inactive');
            }
        });
    };

    const clearCallouts = () => {
        calloutsContainer.innerHTML = '';
        activeCallouts = [];
    };

    const calculateLabelPositions = (markers) => {
        const containerWidth = calloutsContainer.offsetWidth;
        const yLevels = [20, 65, 110, 155, 200];
        const minXGap = 100;
        let lastXPos = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity];

        const sortedMarkers = markers
            .map(marker => ({
                el: marker,
                id: marker.dataset.id,
                x: (parseFloat(marker.style.left) / 100) * containerWidth
            }))
            .sort((a, b) => a.x - b.x);

        const assignedPositions = {};

        sortedMarkers.forEach(markerInfo => {
            let placed = false;
            for (let i = 0; i < yLevels.length && !placed; i++) {
                if (markerInfo.x >= lastXPos[i] + minXGap) {
                    assignedPositions[markerInfo.id] = { x: markerInfo.x, y: yLevels[i] };
                    lastXPos[i] = markerInfo.x;
                    placed = true;
                }
            }
            if(!placed) { 
                 assignedPositions[markerInfo.id] = { x: markerInfo.x, y: yLevels[0] };
                 lastXPos[0] = markerInfo.x;
            }
        });
        return markers.map(m => assignedPositions[m.dataset.id]);
    };

    const calculateLabelPositionsWithOverlapAvoidance = (markers, items) => {
        const containerWidth = calloutsContainer.offsetWidth;
        const sortedMarkers = markers
            .map(marker => {
                const item = items.find(i => i.id == marker.dataset.id);
                return {
                    el: marker,
                    id: marker.dataset.id,
                    item: item,
                    x: (parseFloat(marker.style.left) / 100) * containerWidth,
                };
            })
            .sort((a, b) => a.x - b.x);
    
        const placedRects = [];
        const positions = {};
        const verticalGap = 5;
        const initialY = 20;
    
        sortedMarkers.forEach(markerInfo => {
            const tempLabel = document.createElement('div');
            tempLabel.className = 'callout-label';
            tempLabel.textContent = markerInfo.item.name;
            tempLabel.style.visibility = 'hidden';
            tempLabel.style.position = 'absolute';
            calloutsContainer.appendChild(tempLabel);
            const labelWidth = tempLabel.offsetWidth + 10;
            const labelHeight = tempLabel.offsetHeight;
            calloutsContainer.removeChild(tempLabel);
    
            let currentY = initialY;
            let placed = false;
    
            while (!placed) {
                let overlaps = false;
                const currentRect = {
                    x: markerInfo.x - labelWidth / 2,
                    y: currentY,
                    width: labelWidth,
                    height: labelHeight,
                };
    
                for (const rect of placedRects) {
                    if (
                        currentRect.x < rect.x + rect.width &&
                        currentRect.x + currentRect.width > rect.x &&
                        currentRect.y < rect.y + rect.height &&
                        currentRect.y + currentRect.height > rect.y
                    ) {
                        overlaps = true;
                        break;
                    }
                }
    
                if (!overlaps) {
                    placedRects.push(currentRect);
                    positions[markerInfo.id] = { x: markerInfo.x, y: currentY };
                    placed = true;
                } else {
                    currentY += labelHeight + verticalGap;
                }
            }
        });
    
        return markers.map(m => positions[m.dataset.id]);
    };

    const displayCallouts = (itemsToShow, avoidOverlap = false) => {
        clearCallouts();
        
        const itemsWithMarkers = itemsToShow.map(item => {
            const marker = document.querySelector(`.marker-wrapper[data-id='${item.id}']`);
            return { item, marker };
        }).filter(({ marker }) => marker && !marker.classList.contains('inactive'));
        
        if (itemsWithMarkers.length === 0) return;
        
        const markerElements = itemsWithMarkers.map(({ marker }) => marker);
        const itemsForMarkers = itemsWithMarkers.map(({ item }) => item);
    
        let labelPositions;
        if (avoidOverlap && itemsWithMarkers.length > 10) {
            labelPositions = calculateLabelPositionsWithOverlapAvoidance(markerElements, itemsForMarkers);
        } else {
            labelPositions = calculateLabelPositions(markerElements);
        }
    
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'absolute w-full h-full top-0 left-0');
    
        itemsWithMarkers.forEach(({ item, marker }, index) => {
            const markerPosPercent = parseFloat(marker.style.left);
            const labelPos = labelPositions[index];
    
            if (!labelPos) return;
    
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'callout-line');
            line.setAttribute('x1', `${markerPosPercent}%`);
            line.setAttribute('y1', `calc(100% - 100px)`);
            line.setAttribute('x2', `${labelPos.x}px`);
            line.setAttribute('y2', `${labelPos.y}px`);
            svg.appendChild(line);
    
            const label = document.createElement('div');
            label.className = 'callout-label';
            label.textContent = item.name;
            label.style.left = `${labelPos.x}px`;
            label.style.top = `${labelPos.y}px`;
            label.dataset.id = item.id;
            label.addEventListener('click', () => showModal(item));
    
            calloutsContainer.appendChild(label);
            activeCallouts.push({ item, label, line });
        });
        calloutsContainer.appendChild(svg);
    };
    
    const clearHighlights = () => {
        allMarkerElements.forEach(marker => marker.classList.remove('highlight'));
        activeCallouts.forEach(({ label }) => label.classList.remove('highlight'));
    };

    const handleSearch = () => {
        const query = searchInput.value.trim().toLowerCase();
        
        clearHighlights();
        if (!query) {
             return;
        }

        allMarkerElements.forEach(marker => {
            const item = spectrumData.find(d => d.id === parseInt(marker.dataset.id));
            if (!item) return;

            const name = item.name.toLowerCase();
            const characteristics = item.characteristics.toLowerCase();
            const applications = item.applications.join(' ').toLowerCase();
            const isMatch = name.includes(query) || characteristics.includes(query) || applications.includes(query);

            if (isMatch) marker.classList.add('highlight');
        });

        activeCallouts.forEach(({ item, label }) => {
            const name = item.name.toLowerCase();
            const characteristics = item.characteristics.toLowerCase();
            const applications = item.applications.join(' ').toLowerCase();
            const isMatch = name.includes(query) || characteristics.includes(query) || applications.includes(query);

            if (isMatch) label.classList.add('highlight');
        });
    };

    const showModal = (item) => {
        const categoryClass = `category-${item.category.replace(new RegExp(' ', 'g'), '-')}`;
        const applicationsHtml = item.applications.map(app => `<li class="flex items-start gap-2"><span class="text-slate-400 mt-1.5">&#8226;</span><span>${app}</span></li>`).join('');

        modalContainer.innerHTML = `
            <div class="modal-content-wrapper bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button id="modal-close-btn" class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
                <div class="p-6 sm:p-8">
                    <div class="border-b border-slate-700 pb-4 mb-4">
                        <h2 class="text-2xl sm:text-3xl font-bold text-white">${item.name}</h2>
                        <p class="text-lg font-medium mt-1 ${categoryClass} text-opacity-100 bg-transparent">${item.frequency_range_str}</p>
                    </div>
                    <div class="space-y-6 text-slate-300 text-base leading-relaxed">
                        <div>
                            <h3 class="font-semibold text-lg text-slate-100 mb-2">特性</h3>
                            <p class="prose prose-invert prose-slate max-w-none">${item.characteristics}</p>
                        </div>
                         <div>
                            <h3 class="font-semibold text-lg text-slate-100 mb-2">主要应用</h3>
                            <ul class="space-y-1.5">${applicationsHtml}</ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modalOverlay.classList.remove('hidden');
        modalContainer.classList.remove('hidden');
        lucide.createIcons();

        document.getElementById('modal-close-btn').addEventListener('click', hideModal);
        modalOverlay.addEventListener('click', hideModal);
    };

    const hideModal = () => {
        modalOverlay.classList.add('hidden');
        modalContainer.classList.add('hidden');
        modalContainer.innerHTML = '';
    };

    renderAxisLabels();
    renderMarkers();
    lucide.createIcons();
    
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
});
