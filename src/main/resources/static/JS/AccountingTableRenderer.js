class AccountingTableRenderer {
    constructor(infoSelector) {
        this.data = [];
        this.userInfo = $(infoSelector);
        this.firstUserDate = this.userInfo.find('#firstUserDate');
        this.secondUserDate = this.userInfo.find('#secondUserDate');
        this.tableContainer = this.userInfo.find('#table-responsive');
        this.startRenderButton = this.userInfo.find('.startRender');


        this.startRenderButton.on('click', () => this.fetchAndRenderTable());
    }

    convertToIsoDate(ukDateStr) {
        const [d, m, y] = ukDateStr.split('.');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    convertToUaDate(isoDateStr) {
        const [y, m, d] = isoDateStr.split('-');
        return `${d}.${m}.${y}`;
    }


    fetchAndRenderTable() {

        this.tableContainer.html("<p class='text-info'>Завантаження даних...</p>");

        fetch('/api/electricity-accounting')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(freshData => {
                this.data = freshData;
                this.renderTable();
            })
            .catch(error => {
                console.error("Помилка оновлення даних для таблиці обліку:", error);
                this.tableContainer.html(`<p class='text-danger'>Помилка завантаження даних: ${error.message}</p>`);
            });
    }

    renderTable() {
        const firstStr = this.firstUserDate.val();
        const secondStr = this.secondUserDate.val();

        if (!firstStr || !secondStr) {
            this.tableContainer.html("<p class='text-warning'>Будь ласка, заповніть обидві дати для таблиці.</p>");
            return;
        }

        const firstIso = this.convertToIsoDate(firstStr);
        const secondIso = this.convertToIsoDate(secondStr);

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

document.addEventListener("DOMContentLoaded", function () {

    new AccountingTableRenderer('.userInformation');


    ["#firstUserDate", "#secondUserDate"].forEach(id => {
        flatpickr(id, { locale: "uk", dateFormat: "d.m.Y" });
    });
});