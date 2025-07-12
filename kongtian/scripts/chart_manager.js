export function renderCharts(data) {
    renderFundingChart(data.commercialAerospaceFunding);
    renderMarketSizeChart(data.lowAltitudeEconomyMarketSize);
    renderTimelineChart(data.techMilestones);
    renderPolicyChart(data.policyFramework);


    renderFinancingRoundsChart(data.financingRounds);
    renderTRLCurve(data.trlCurve);
    renderSatelliteLaunchChart(data.satelliteLaunches);
    renderMarketForecastChart(data.marketForecast);
}

const chartDefaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: '#d1d5db', boxWidth: 12, padding: 20 }
        },
        tooltip: {
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#d1d5db',
            borderColor: '#4b5563',
            borderWidth: 1
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: '#9ca3af' }
        },
        x: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: '#9ca3af' }
        }
    }
};

function renderFundingChart(fundingData) {
    const ctx = document.getElementById('funding-chart');
    if (!ctx) return;
    ctx.parentElement.style.height = '400px';
    new Chart(ctx, {
        type: 'line',
        data: fundingData,
        options: {
            ...chartDefaultOptions,
            plugins: { ...chartDefaultOptions.plugins, tooltip: { ...chartDefaultOptions.plugins.tooltip, callbacks: {
                label: (c) => `${c.dataset.label}: ${c.parsed.y} 亿元`
            }}},
            scales: { ...chartDefaultOptions.scales, y: { ...chartDefaultOptions.scales.y, ticks: { ...chartDefaultOptions.scales.y.ticks, callback: (v) => v + ' 亿' }}}
        }
    });
}

function renderMarketSizeChart(marketData) {
    const ctx = document.getElementById('market-size-chart');
    if (!ctx) return;
    ctx.parentElement.style.height = '400px';
    new Chart(ctx, {
        type: 'bar',
        data: marketData,
        options: {
            ...chartDefaultOptions,
            plugins: { ...chartDefaultOptions.plugins, legend: { display: false }, tooltip: { ...chartDefaultOptions.plugins.tooltip, callbacks: {
                label: (c) => `${c.dataset.label}: ${c.parsed.y} 万亿元`
            }}},
            scales: { ...chartDefaultOptions.scales, y: { ...chartDefaultOptions.scales.y, ticks: { ...chartDefaultOptions.scales.y.ticks, callback: (v) => v + ' 万亿' }}}
        }
    });
}

function renderTimelineChart(milestones) {
    const container = document.getElementById('timeline-chart-container');
    if (!container) return;
    container.innerHTML = milestones.map(item => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">${item.date}</div>
                <p>${item.event}</p>
            </div>
        </div>
    `).join('');
}

function renderPolicyChart(policyData) {
    const container = document.getElementById('policy-chart-container');
    if (!container) return;
    container.innerHTML = `
        <div class="text-center mb-6">
            <h4 class="text-lg font-bold text-white">${policyData.title}</h4>
            <p class="text-gray-400 max-w-2xl mx-auto">${policyData.description}</p>
        </div>
        <div class="flex flex-col items-center">
            <div class="policy-node level-0">${policyData.nodes.find(n => n.level === 0).label}</div>
            <div class="flex justify-center my-4"><div class="connector-down"></div></div>
            <div class="flex justify-around w-full max-w-md">
                 <div class="policy-node level-1">${policyData.nodes.find(n => n.id === 'commercial_aerospace').label}</div>
                 <div class="policy-node level-1">${policyData.nodes.find(n => n.id === 'low_altitude').label}</div>
            </div>
            <div class="flex justify-around w-full mt-4">
                 <div class="w-full md:w-1/2 px-2">${policyData.nodes.filter(n => n.level === 2 && n.id.startsWith('ca_')).map(node => `<div class="policy-node level-2">${node.label}</div>`).join('')}</div>
                 <div class="w-full md:w-1/2 px-2">${policyData.nodes.filter(n => n.level === 2 && n.id.startsWith('la_')).map(node => `<div class="policy-node level-2">${node.label}</div>`).join('')}</div>
            </div>
        </div>
        <style>
            .policy-node { padding: 0.75rem 1.25rem; border-radius: 8px; text-align: center; font-weight: 500; }
            .level-0 { background-color: #ca8a04; color: white; }
            .level-1 { background-color: #2563eb; color: white; }
            .level-2 { background-color: #1f2937; color: #d1d5db; border: 1px solid #4b5563; margin-top: 0.75rem;}
            .connector-down { width: 2px; height: 2rem; background-color: #4b5563; }
        </style>`;
}


function renderFinancingRoundsChart(data) {
    const ctx = document.getElementById('financing-chart');
    if (!ctx) return;
    ctx.parentElement.style.height = '400px';
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: { ...chartDefaultOptions,
            plugins: { ...chartDefaultOptions.plugins, legend: { display: false }, tooltip: { ...chartDefaultOptions.plugins.tooltip, callbacks: {
                label: (c) => ` ${c.raw.toLocaleString()} 亿元`,
                afterLabel: (c) => `公司: ${c.label}\n轮次: ${c.chart.data.datasets[0].notes[c.label]}`
            }}},
            scales: { x: { ...chartDefaultOptions.scales.x }, y: { ...chartDefaultOptions.scales.y, ticks: { ...chartDefaultOptions.scales.y.ticks, callback: (v) => `${v} 亿`}}}
        }
    });
}

function renderTRLCurve(trlData) {
    const container = document.getElementById('trl-chart-container');
    if (!container) return;
    const getTrlColor = (trl) => {
      if (trl >= 8) return 'bg-green-500/20 text-green-300';
      if (trl >= 7) return 'bg-yellow-500/20 text-yellow-300';
      return 'bg-blue-500/20 text-blue-300';
    };
    const renderCategory = (title, items) => `
        <div class="w-full md:w-1/2 p-2">
            <h4 class="text-xl font-semibold text-white text-center mb-4">${title}</h4>
            <div class="space-y-4">
                ${items.map(item => `
                    <div class="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-bold text-blue-400 flex-1 pr-2">${item.name}</span>
                            <span class="text-xs text-center font-semibold px-2 py-1 rounded-full ${getTrlColor(item.trl)}">${item.status}</span>
                        </div>
                        <p class="text-sm text-gray-400 mb-3">${item.detail}</p>
                        <div class="w-full bg-gray-700 rounded-full h-2.5">
                            <div class="bg-blue-500 h-2.5 rounded-full" style="width: ${(item.trl / 9) * 100}%"></div>
                        </div>
                        <div class="text-xs text-right text-gray-500 mt-1">技术成熟度 (TRL) ${item.trl} / 9</div>
                    </div>`).join('')}
            </div>
        </div>`;
    container.innerHTML = `<div class="flex flex-col md:flex-row -m-2">${renderCategory('商业航天', trlData.commercialAerospace)}${renderCategory('低空经济', trlData.lowAltitudeEconomy)}</div>`;
}

function renderSatelliteLaunchChart(data) {
    const ctx = document.getElementById('satellite-launch-chart');
    if (!ctx) return;
    ctx.parentElement.style.height = '400px';
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: { ...chartDefaultOptions,
            indexAxis: 'y',
            plugins: { ...chartDefaultOptions.plugins, legend: { display: false }, tooltip: { ...chartDefaultOptions.plugins.tooltip, callbacks: {
                label: (c) => ` ${c.raw.toLocaleString()} 颗`
            }}},
            scales: { x: { ...chartDefaultOptions.scales.x, ticks: { ...chartDefaultOptions.scales.x.ticks, callback: (v) => `${(v/1000)}k` }}, y: { ...chartDefaultOptions.scales.y } }
        }
    });
}

function renderMarketForecastChart(data) {
    const ctx = document.getElementById('market-forecast-chart');
    if (!ctx) return;
    ctx.parentElement.style.height = '400px';
    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: { ...chartDefaultOptions,
            plugins: { ...chartDefaultOptions.plugins, legend: { position: 'right' }, tooltip: { ...chartDefaultOptions.plugins.tooltip, callbacks: {
                label: (c) => ` ${c.label}: ${c.raw.toLocaleString()} 亿元`
            }}}
        }
    });
}
