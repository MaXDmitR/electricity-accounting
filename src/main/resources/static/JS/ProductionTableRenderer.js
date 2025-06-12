class ProductionTableRenderer {
    constructor(infoSelector) {
        this.userInfo = $(infoSelector);
        this.firstUserDate = this.userInfo.find('#firstUserDate');
        this.secondUserDate = this.userInfo.find('#secondUserDate');
        this.productionApiTableContainer = $('#productionApiTable');
        this.startRenderButton = this.userInfo.find('.startRender');

        this.startRenderButton.on('click', () => this.renderApiProductionTableByDateRange());
    }

    convertToIsoDate(ukDateStr) {
        const [d, m, y] = ukDateStr.split('.');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    convertToUaDate(isoDateStr) {
        const [y, m, d] = isoDateStr.split('-');
        return `${d}.${m}.${y}`;
    }

    renderApiProductionTableByDateRange() {
        const firstStr = this.firstUserDate.val();
        const secondStr = this.secondUserDate.val();

        if (!firstStr || !secondStr) {
            this.productionApiTableContainer.html("<p class='text-warning'>Будь ласка, виберіть обидві дати для фільтрації вироблення енергії.</p>");
            return;
        }

        const firstIso = this.convertToIsoDate(firstStr);
        const secondIso = this.convertToIsoDate(secondStr);

        fetch('/api/electricity-production')
            .then(response => {
                if (!response.ok) throw new Error("Статус: " + response.status);
                return response.json();
            })
            .then(data => {
                const filtered = data
                    .filter(r => r.production_data >= firstIso && r.production_data <= secondIso)
                    .sort((a, b) => a.production_data.localeCompare(b.production_data) || (a.measurement_time || a.measurementTime).localeCompare(b.measurement_time || b.measurementTime));

                if (filtered.length === 0) {
                    this.productionApiTableContainer.html("<p class='text-warning'>Немає даних у вибраному діапазоні.</p>");
                    return;
                }

                // Group data by date
                const groupedData = filtered.reduce((acc, item) => {
                    const date = item.production_data || item.productionData;
                    if (!acc[date]) {
                        acc[date] = [];
                    }
                    acc[date].push(item);
                    return acc;
                }, {});

                let html = '';

                for (const dateIso in groupedData) {
                    const dateUa = this.convertToUaDate(dateIso);
                    const items = groupedData[dateIso];

                    html += `<h5 class="text-center mt-4">Дані про виробіток за ${dateUa}</h5>`;
                    html += `<table class="table table-bordered table-striped table-sm text-center">`;
                    html += `<thead><tr><th>Дата</th>`;

                    // Dynamic header based on the number of items for THIS specific date
                    for (let i = 0; i < items.length; i++) {
                        html += `<th>Час</th><th>Потужність (Вт)</th>`;
                    }
                    html += `</tr></thead><tbody>`;

                    html += `<tr><td>${dateUa}</td>`;
                    items.forEach(item => {
                        const time = item.measurement_time || item.measurementTime;
                        const power = item.production_value;
                        html += `<td>${time}</td><td>${power}</td>`;
                    });
                    html += `</tr>`;
                    html += `</tbody></table>`;
                }

                this.productionApiTableContainer.html(html);

                // Re-apply Flatpickr for date inputs if they are being used by other parts of the application
                flatpickr("#firstUserDate", { locale: "uk", dateFormat: "d.m.Y" });
                flatpickr("#secondUserDate", { locale: "uk", dateFormat: "d.m.Y" });
            })
            .catch(error => {
                console.error("Помилка завантаження фільтрованих даних:", error.message);
                this.productionApiTableContainer.html("<p class='text-danger'>Помилка при завантаженні.</p>");
            });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    new ProductionTableRenderer('.userInformation');
});