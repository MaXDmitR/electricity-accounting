// Базовий клас для рендерингу таблиць
class BaseTableRenderer {
    constructor(infoSelector, tableContainerSelector, renderButtonSelector) {
        this.userInfo = $(infoSelector);
        this.firstUserDate = this.userInfo.find('#firstUserDate');
        this.secondUserDate = this.userInfo.find('#secondUserDate');
        this.tableContainer = $(tableContainerSelector);
        this.startRenderButton = this.userInfo.find(renderButtonSelector);


        this.startRenderButton.on('click', () => this.fetchAndRenderData());
    }


    convertToIsoDate(ukDateStr) {
        const [d, m, y] = ukDateStr.split('.');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    convertToUaDate(isoDateStr) {
        const [y, m, d] = isoDateStr.split('-');
        return `${d}.${m}.${y}`;
    }


    fetchAndRenderData() {
        throw new Error("Метод 'fetchAndRenderData()' має бути реалізований дочірнім класом.");
    }


    getAndValidateDates() {
        const firstStr = this.firstUserDate.val();
        const secondStr = this.secondUserDate.val();

        if (!firstStr || !secondStr) {
            this.tableContainer.html("<p class='text-warning'>Будь ласка, заповніть обидві дати для таблиці.</p>");
            return null;
        }

        const firstIso = this.convertToIsoDate(firstStr);
        const secondIso = this.convertToIsoDate(secondStr);

        return { firstIso, secondIso };
    }
}

class AccountingTableRenderer extends BaseTableRenderer {
    constructor(infoSelector) {
        super(infoSelector, '#table-responsive', '.startRender');
        this.data = [];
    }

    fetchAndRenderData() {
        const dates = this.getAndValidateDates();
        if (!dates) return;


        fetch('/api/electricity-accounting')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(freshData => {
                this.data = freshData;
                this.renderAccountingTable(dates.firstIso, dates.secondIso);
            })
            .catch(error => {
                console.error("Помилка оновлення даних для таблиці обліку:", error);
                this.tableContainer.html(`<p class='text-danger'>Помилка завантаження даних: ${error.message}</p>`);
            });
    }

    renderAccountingTable(firstIso, secondIso) {
        const filtered = this.data
            .filter(r => r.recordDate >= firstIso && r.recordDate <= secondIso)
            .sort((a, b) => a.recordDate.localeCompare(b.recordDate));

        if (filtered.length === 0) {
            this.tableContainer.html("<p class='text-warning'>Даних у вибраному діапазоні не знайдено.</p>");
            return;
        }

        let html = `<table class="table table-dark table-striped table-sm text-center">
                <thead><tr><th>Дата</th>`;
        for (let i = 1; i <= 24; i++) html += `<th>${i}:00</th>`;
        html += `</tr></thead><tbody>`;

        filtered.forEach(r => {
            html += `<tr><td>${this.convertToUaDate(r.recordDate)}</td>`;
            for (let i = 1; i <= 24; i++) {
                html += `<td>${r[`hour${i}`] ?? '-'}</td>`;
            }
            html += `</tr>`;
        });

        html += `</tbody></table>`;
        this.tableContainer.html(html);
    }
}

class ProductionTableRenderer extends BaseTableRenderer {
    constructor(infoSelector) {
        super(infoSelector, '#productionApiTable', '.startRender');
    }

    fetchAndRenderData() {
        const dates = this.getAndValidateDates();
        if (!dates) return;



        fetch('/api/electricity-production')
            .then(response => {
                if (!response.ok) throw new Error("Статус: " + response.status);
                return response.json();
            })
            .then(data => {
                this.renderProductionTable(data, dates.firstIso, dates.secondIso);
            })
            .catch(error => {
                console.error("Помилка завантаження фільтрованих даних:", error.message);
                this.tableContainer.html("<p class='text-danger'>Помилка при завантаженні даних про виробіток.</p>");
            });
    }

    renderProductionTable(data, firstIso, secondIso) {
        const filtered = data
            .filter(r => (r.production_data || r.productionData) >= firstIso && (r.production_data || r.productionData) <= secondIso)
            .sort((a, b) => (a.production_data || a.productionData).localeCompare(b.production_data || b.productionData) || (a.measurement_time || a.measurementTime).localeCompare(b.measurement_time || b.measurementTime));

        if (filtered.length === 0) {
            this.tableContainer.html("<p class='text-warning'>Немає даних у вибраному діапазоні.</p>");
            return;
        }


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
        this.tableContainer.html(html);
    }
}

// ---

document.addEventListener("DOMContentLoaded", function () {
    // Ініціалізуємо Flatpickr для полів дат
    ["#firstUserDate", "#secondUserDate"].forEach(id => {
        flatpickr(id, { locale: "uk", dateFormat: "d.m.Y" });
    });

    new AccountingTableRenderer('.userInformation'); // Цей клас буде використовувати .startRender
    new ProductionTableRenderer('.userInformation'); // Цей клас також буде використовувати .startRender
});