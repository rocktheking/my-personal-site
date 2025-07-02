function createFundStructureChart(ctx) {
    if (!ctx) return;
    const data = {
        labels: ['江城基金 (40%)', 'GP (华科天使投资) (10%)', '市场化募集 (50%)'],
        datasets: [{
            label: '基金出资结构',
            data: [40, 10, 50],
            backgroundColor: [
                '#5A2A84',
                '#FFC107',
                '#03A9F4'
            ],
            borderColor: '#1F2937',
            borderWidth: 3,
            hoverOffset: 4
        }]
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#F3F4F6',
                        font: {
                            size: 14,
                            family: "'Inter', sans-serif"
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            cutout: '60%',
        }
    });
}

function createCarrySplitChart(ctx) {
    if (!ctx) return;
    const data = {
        labels: ['LP (出资人)', 'GP (管理人)'],
        datasets: [{
            data: [90, 10],
            backgroundColor: [
                '#03A9F4',
                '#FFC107'
            ],
            borderColor: [
                '#03A9F4',
                '#FFC107'
            ],
            borderWidth: 1,
            barPercentage: 0.5,
            categoryPercentage: 0.7
        }]
    };

    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw + '%';
                        }
                    }
                },
                title: {
                    display: true,
                    text: '超额收益 (Carry) 分配比例',
                    color: '#F3F4F6',
                    font: {
                        size: 16
                    },
                    padding: {
                        bottom: 20
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#9CA3AF',
                        callback: function(value) {
                            return value + '%'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#F3F4F6',
                        font: {
                            size: 14
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

export {
    createFundStructureChart,
    createCarrySplitChart
};
