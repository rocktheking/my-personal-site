function createFundStructureChart() {
    const ctx = document.getElementById('fundStructureChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['江城基金 (40%)', 'GP: 华科天使投资 (10%)', '市场化募集LP (50%)'],
            datasets: [{
                data: [40, 10, 50],
                backgroundColor: ['#004B84', '#D20B17', '#6B7280'],
                borderColor: '#111827',
                borderWidth: 3
            }]
        },
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
                    titleFont: { family: "'Inter', sans-serif" },
                    bodyFont: { family: "'Inter', sans-serif" }
                }
            }
        }
    });
}

function createCarrySplitChart() {
    const ctx = document.getElementById('carrySplitChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['LP (出资人)', 'GP (华科天使投资)'],
            datasets: [{
                data: [90, 10],
                backgroundColor: ['#004B84', '#D20B17'],
                borderColor: '#111827',
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
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
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    createFundStructureChart();
    createCarrySplitChart();
});
