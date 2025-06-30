export function initCharts() {
    createEfficiencyTimelineChart();
    createMarketSizeChart();
    createInvestmentPieChart();
    createFinancialForecastChart();
}

function createEfficiencyTimelineChart() {
    const ctx = document.getElementById('efficiency-timeline-chart')?.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(20, 184, 166, 0.6)');
    gradient.addColorStop(1, 'rgba(20, 184, 166, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2009', '2020', '2022', '2024', '2025 (叠层)', '华柔 (20cm²)'],
            datasets: [{
                label: '光电转换效率 (%)',
                data: [3.8, 25.5, 25.7, 27.3, 34.85, 20.5],
                borderColor: 'rgb(20, 184, 166)',
                backgroundColor: gradient,
                tension: 0.4,
                pointBackgroundColor: 'rgb(20, 184, 166)',
                pointBorderColor: '#fff',
                pointHoverBorderColor: 'rgb(20, 184, 166)',
                pointHoverBackgroundColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 8,
                fill: true,
            }]
        },
        options: chartOptions('光电转换效率发展历程', '%'),
    });
}

function createMarketSizeChart() {
    const ctx = document.getElementById('market-size-chart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2024', '2030 (预测)'],
            datasets: [
                {
                    label: '设备新增市场 (亿元)',
                    data: [10, 830.6],
                    backgroundColor: 'rgba(20, 184, 166, 0.7)',
                    borderColor: 'rgb(20, 184, 166)',
                    borderWidth: 1,
                },
                {
                    label: '组件市场 (亿元)',
                    data: [15, 1816],
                    backgroundColor: 'rgba(96, 165, 250, 0.7)',
                    borderColor: 'rgb(96, 165, 250)',
                    borderWidth: 1,
                }
            ]
        },
        options: chartOptions('全球钙钛矿市场空间预测 (亿元)', '亿元'),
    });
}

function createInvestmentPieChart() {
    const ctx = document.getElementById('investment-pie-chart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['设备购置', '厂房建设/改造', '原材料采购', '人员与培训', '研发投入', '其他费用'],
            datasets: [{
                label: '投资构成 (万元)',
                data: [9000, 2000, 1000, 700, 2000, 1300],
                backgroundColor: [
                    'rgba(20, 184, 166, 0.8)',
                    'rgba(96, 165, 250, 0.8)',
                    'rgba(250, 204, 21, 0.8)',
                    'rgba(52, 211, 153, 0.8)',
                    'rgba(192, 132, 252, 0.8)',
                    'rgba(156, 163, 175, 0.8)'
                ],
                borderColor: '#1f2937',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#d1d5db' }
                },
                title: {
                    display: true,
                    text: '1.6亿元总投资构成',
                    color: '#fff',
                    font: { size: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('zh-CN').format(context.parsed) + ' 万元';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function createFinancialForecastChart() {
    const ctx = document.getElementById('financial-forecast-chart')?.getContext('2d');
    if (!ctx) return;

    const labels = ['第1年', '第2年', '第3年', '第4年', '第5年'];
    const revenue = [10000, 16000, 20000, 20000, 20000];
    const cumNetProfit = [375, 2370, 6345, 10320, 14295];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: '营业收入 (万元)',
                    data: revenue,
                    backgroundColor: 'rgba(96, 165, 250, 0.5)',
                    borderColor: 'rgb(96, 165, 250)',
                    yAxisID: 'y',
                },
                {
                    type: 'line',
                    label: '累计净利润 (万元)',
                    data: cumNetProfit,
                    borderColor: 'rgb(52, 211, 153)',
                    backgroundColor: 'rgba(52, 211, 153, 0.5)',
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'y',
                    pointRadius: 5,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: '前5年财务预测 (单位：万元)',
                    color: '#fff',
                    font: { size: 18 }
                },
                legend: {
                    position: 'top',
                    labels: { color: '#d1d5db' }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    padding: 10,
                },
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#d1d5db' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { 
                        color: '#d1d5db',
                        callback: function(value) {
                             return value.toLocaleString('zh-CN');
                        }
                    },
                    title: {
                        display: true,
                        text: '金额 (万元)',
                        color: '#d1d5db'
                    }
                }
            }
        }
    });
}

function chartOptions(titleText, unit) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: false,
                text: titleText,
                color: '#fff',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y + ' ' + unit;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#d1d5db' },
            },
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#d1d5db' }
            }
        }
    };
}
