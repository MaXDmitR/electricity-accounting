class ModalInterfaceSales {
    constructor(modalSelector) {
        this.modal = $(modalSelector);

        this.dateInput = this.modal.find("#dateInputSales");
        this.modalBody = this.modal.find(".modal-body");
        this.addDate = this.modal.find(".add_hour");
        this.sendEntry = this.modal.find(".sendEntry");
        this.calculateEntry = this.modal.find(".calculate");

        this.modal.on('hidden.bs.modal', () => this.hideModal());
        this.addDate.on('click', () => this.createInput());
        this.sendEntry.on('click', () => this.push());
        this.calculateEntry.on('click', () => this.calculate());
    }

    hideModal() {
        document.activeElement.blur();
        this.dateInput[0]._flatpickr.clear();
        this.modal.find(".info-body").remove();
    }

    createInput() {
        let prevLastTime = "00:00";

        const inputs = this.modal.find(".info-body");

        if (inputs.length) {
            const lastBlock = inputs.last()[0];
            const first = lastBlock.querySelector(".start-time").value;
            const last = lastBlock.querySelector(".end-time").value;

            if (!first || !last || first >= last) {
                lastBlock.classList.add("invalid-block");
                return;
            } else {
                lastBlock.classList.remove("invalid-block");
                prevLastTime = last;
            }
        }

        const new_hour = document.createElement("div");
        new_hour.className = 'info-body mb-3';

        new_hour.innerHTML = `
            <div class="body-info">
                <label>Час з:
                    <input type="time" class="form-control start-time" value="${prevLastTime}" ${inputs.length ? 'readonly' : ''}>
                </label>
                <label>Час до:
                    <input type="time" class="form-control end-time">
                </label>
            </div>
            <div class="slider-wrapper">
                <div class="label-group">
                    <label>ПРОДАЖ</label>
                    <span id="sellValue">50%</span>
                </div>
                <input type="range" id="splitSlider" min="0" max="100" value="50">
                <div class="label-group">
                    <label>РЕЗЕРВУВАННЯ</label>
                    <span id="reserveValue">50%</span>
                </div>
            </div>
            <div class="mt-3">
                <label>Кількість витраченої енергії (Вт·год):</label>
                <input type="number" class="form-control energy-input mt-3" placeholder="Введіть значення" min="0" step="1">
            </div>`;

        this.modalBody.append(new_hour);

        const slider = new_hour.querySelector("#splitSlider");
        const sellValue = new_hour.querySelector("#sellValue");
        const reserveValue = new_hour.querySelector("#reserveValue");

        slider.addEventListener("input", function () {
            sellValue.textContent = `${this.value}%`;
            reserveValue.textContent = `${100 - this.value}%`;
        });

        const endTimeInput = new_hour.querySelector(".end-time");
        endTimeInput.addEventListener("change", () => {
            const blocks = this.modal.find(".info-body");
            blocks.each((i, el) => {
                if (i < blocks.length - 1) {
                    const currentEnd = el.querySelector(".end-time").value;
                    const nextStart = blocks[i + 1].querySelector(".start-time");
                    const nextEnd = blocks[i + 1].querySelector(".end-time");

                    if (currentEnd > nextEnd.value) {
                        blocks[i + 1].classList.add("invalid-block");
                    } else {
                        blocks[i + 1].classList.remove("invalid-block");
                    }

                    nextStart.value = currentEnd;
                }
            });
        });
    }

    push() {
        const salesData = {
            date: this.dateInput.val(),
            sales: []
        };

        let isValid = true;

        this.modal.find(".info-body").each((_, el) => {
            const startTime = el.querySelector(".start-time").value;
            const endTime = el.querySelector(".end-time").value;
            const sellValue = el.querySelector("#sellValue").textContent.trim();
            const reserveValue = el.querySelector("#reserveValue").textContent.trim();
            const energy = el.querySelector(".energy-input").value;

            if (!startTime || !endTime || startTime >= endTime || isNaN(energy) || energy <= 0) {
                isValid = false;
                el.classList.add("invalid-block");
                return;
            } else {
                el.classList.remove("invalid-block");
            }

            salesData.sales.push({
                firstTime: startTime,
                lastTime: endTime,
                sell: sellValue,
                reserve: reserveValue,
                energy: parseFloat(energy)
            });
        });

        if (isValid && salesData.date) {
            console.log("Надіслано з модального вікна продажу:", salesData);
            document.activeElement.blur();
            this.modal.modal('hide');
            this.send(salesData);
        } else {
            alert("Будь ласка, заповніть правильно усі поля.");
        }
    }

    send(data) {
        const promises = data.sales.map(sale => {
            const sellPercent = parseInt(sale.sell.replace('%', ''));
            const reservePercent = parseInt(sale.reserve.replace('%', ''));
            const energy = sale.energy;

            return fetch('/add-diapason_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    'date': data.date,
                    'startTime': sale.firstTime,
                    'endTime': sale.lastTime,
                    'sellPercent': sellPercent,
                    'reservePercent': reservePercent,
                    'energy': energy
                })
            }).then(response => response.text());
        });

        Promise.all(promises)
            .then(results => {
                const allSuccess = results.every(result => result === 'Success');

                if (allSuccess) {
                    console.log('Дані діапазонів продажу збережено на сервері');
                    alert('Дані успішно збережено!');
                    location.reload();
                } else {
                    alert('Помилка збереження: ' + results.filter(r => r !== 'Success').join(', '));
                }
            })
            .catch(error => {
                console.error('Помилка відправки:', error);
                alert('Помилка відправки: ' + error);
            });
    }
}

$(document).ready(function () {
    flatpickr("#dateInputSales", {
        locale: "uk",
        dateFormat: "d.m.Y"
    });

    new ModalInterfaceSales('#modalSales');
});
