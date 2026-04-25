import Chart from 'chart.js/auto';

export function initializeHomeCharts() {
    setupChart('cocauthuchiChart', 'pie', ['Doanh thu', 'Chi phí'], [152, 45], ['#4e73df', '#1cc88a']);
    setupChart('tangtruongdoanhthuChart', 'bar', ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'], [120, 135, 125, 145, 155, 180], ['#36b9cc']);
    setupChart('tangtruongloinhuanChart', 'line', ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'], [60, 65, 75, 80, 95, 110], ['#f6c23e']);
    setupChart('tangtruonghocvienChart', 'line', ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'], [80, 95, 110, 125, 135, 149], ['#e74a3b']);
    setupChart('cocaudoanhthulopChart', 'doughnut', ['Lớp A', 'Lớp B', 'Lớp C'], [40, 35, 25], ['#4e73df', '#1cc88a', '#36b9cc']);
    setupChart('thongkenolopChart', 'bar', ['Lớp A', 'Lớp B', 'Lớp C'], [5, 12, 3], ['#e74a3b', '#f6c23e', '#1cc88a']);
    setupChart('sisotunglopChart', 'bar', ['Mầm non', 'Tiểu học', 'THCS'], [45, 60, 44], ['#858796', '#4e73df', '#1cc88a']);
}

function setupChart(canvasId, type, labels, data, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Destroy existing chart to avoid "Canvas is already in use" errors on React re-renders
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(canvas, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Dữ liệu',
                data: data,
                backgroundColor: colors || ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'],
                borderColor: type === 'line' ? colors[0] : 'transparent',
                tension: 0.3,
                fill: type !== 'line'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: type === 'pie' || type === 'doughnut'
                }
            }
        }
    });
}
