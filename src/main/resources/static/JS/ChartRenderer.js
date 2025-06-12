class ChartRenderer {
    constructor(data, chartSelector) {
        this.data = data;
        this.chartCanvas = document.getElementById('hourlyEnergyChart');
        this.chartDate = $(chartSelector).find('#chartDate');
        this.chartInstance = null;
        this.startRenderButton = $(chartSelector).find('.startRender');

        this.startRenderButton.on('click', () => this.fetchAndRenderChart());
    }

    convertToIsoDate(ukDateStr) {
        const [d, m, y] = ukDateStr.split('.');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    fetchAndRenderChart() {
        fetch('/api/electricity-accounting')
            .then(response => response.json())
            .then(freshData => {
                this.data = freshData;
                this.renderChart();
            })
            .catch(error => console.error("Помилка оновлення даних для графіка:", error));
    }

    renderChart() {
        const chartDateStr = this.chartDate.val();
        if (!chartDateStr) {
            alert("Введіть дату для графіка.");
            return;
        }

        const isoDate = this.convertToIsoDate(chartDateStr);
        const record = this.data.find(r => r.recordDate === isoDate);

        if (!record) {
            alert("Даних за обрану дату не знайдено.");
            return;
        }

        const labels = Array.from({ length: 24 }, (_, i) => `${i + 1}:00`);
        const values = Array.from({ length: 24 }, (_, i) => record[`hour${i + 1}`] ?? 0);

        if (this.chartInstance) this.chartInstance.destroy();

        const ctx = this.chartCanvas.getContext('2d');
        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Виробіток енергії за ${chartDateStr}`,
                    data: values,
                    backgroundColor: 'rgba(54, 162, 235, 0.3)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Година' } },
                    y: { title: { display: true, text: 'Потужність (Вт)' }, beginAtZero: true }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Графік електровироблення по годинах'
                    }
                }
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    fetch('/api/electricity-accounting')
        .then(response => response.json())
        .then(data => {
            new ChartRenderer(data, '.userInformation');
        })
        .catch(error => {
            console.error("Сталася помилка при завантаженні даних для графіка:", error.message);
        });

    flatpickr("#chartDate", { locale: "uk", dateFormat: "d.m.Y" });
});