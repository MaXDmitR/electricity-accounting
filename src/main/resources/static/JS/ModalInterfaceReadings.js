class ModalInterfaceReadings {
    constructor(modalSelector) {
        this.modal = $(modalSelector);

        this.dateInput = this.modal.find("#dateInputReadings");
        this.modalBody = this.modal.find(".modal-body");
        this.addDate = this.modal.find(".add_hour");
        this.sendEntry = this.modal.find(".sendEntry");
        this.calculateEntry = this.modal.find(".calculate");

        this.modal.on('hidden.bs.modal', () => this.hideModal());
        this.addDate.on('click', () => this.createInput());
        this.sendEntry.on('click', () => this.push());

        this.dataPoints = [];
        this.hourlyProduction = [];
    }

    // Допоміжна функція для інтерполяції потужності на заданий час у хвилинах
    interpolatePowerAtMinute(targetMinute) {
        if (this.dataPoints.length === 0) return 0;

        const exact = this.dataPoints.find(p => p.timeMinutes === targetMinute);
        if (exact) return exact.power;

        if (targetMinute < this.dataPoints[0].timeMinutes) {
            const firstPoint = this.dataPoints[0];
            if (firstPoint.timeMinutes === 0) return firstPoint.power;
            return (targetMinute / firstPoint.timeMinutes) * firstPoint.power;
        }

        if (targetMinute > this.dataPoints[this.dataPoints.length - 1].timeMinutes) {
            const lastPoint = this.dataPoints[this.dataPoints.length - 1];
            const totalMinutesInDay = 24 * 60;
            if (lastPoint.timeMinutes === totalMinutesInDay) return lastPoint.power;

            if (targetMinute >= totalMinutesInDay) return 0;

            const ratio = (totalMinutesInDay - targetMinute) / (totalMinutesInDay - lastPoint.timeMinutes);
            return Math.max(0, ratio * lastPoint.power);
        }

        let before = null;
        let after = null;

        for (let i = 0; i < this.dataPoints.length - 1; i++) {
            const a = this.dataPoints[i];
            const b = this.dataPoints[i + 1];
            if (a.timeMinutes <= targetMinute && targetMinute <= b.timeMinutes) {
                before = a;
                after = b;
                break;
            }
        }

        if (!before || !after) return 0;

        const ratio = (targetMinute - before.timeMinutes) / (after.timeMinutes - before.timeMinutes);
        return before.power + ratio * (after.power - before.power);
    }

    calculateHourly() {
        this.hourlyProduction = [];

        this.dataPoints.sort((a, b) => a.timeMinutes - b.timeMinutes);

        const augmentedDataPoints = [...this.dataPoints];

        if (augmentedDataPoints[0] && augmentedDataPoints[0].timeMinutes > 0) {
            augmentedDataPoints.unshift({ timeMinutes: 0, power: 0 });
        }
        if (augmentedDataPoints[augmentedDataPoints.length - 1] && augmentedDataPoints[augmentedDataPoints.length - 1].timeMinutes < 24 * 60) {
            augmentedDataPoints.push({ timeMinutes: 24 * 60, power: 0 });
        }

        augmentedDataPoints.sort((a, b) => a.timeMinutes - b.timeMinutes);

        for (let h = 0; h < 24; h++) {
            const startOfHourInMinutes = h * 60;
            const powerAtMidHour = this.interpolatePowerAtMinuteForAugmented(augmentedDataPoints, startOfHourInMinutes + 30);

            this.hourlyProduction.push({ hour: h + 1, power: parseFloat(powerAtMidHour.toFixed(2)) });
        }
    }

    interpolatePowerAtMinuteForAugmented(augmentedDataPoints, targetMinute) {
        if (augmentedDataPoints.length === 0) return 0;

        const exact = augmentedDataPoints.find(p => p.timeMinutes === targetMinute);
        if (exact) return exact.power;

        if (targetMinute < augmentedDataPoints[0].timeMinutes) return 0;
        if (targetMinute > augmentedDataPoints[augmentedDataPoints.length - 1].timeMinutes) return 0;

        let before = null;
        let after = null;

        for (let i = 0; i < augmentedDataPoints.length - 1; i++) {
            const a = augmentedDataPoints[i];
            const b = augmentedDataPoints[i + 1];
            if (a.timeMinutes <= targetMinute && targetMinute <= b.timeMinutes) {
                before = a;
                after = b;
                break;
            }
        }

        if (!before || !after || (after.timeMinutes - before.timeMinutes === 0)) return 0;

        const ratio = (targetMinute - before.timeMinutes) / (after.timeMinutes - before.timeMinutes);
        return before.power + ratio * (after.power - before.power);
    }


    hideModal() {
        document.activeElement.blur();
        this.dateInput[0]._flatpickr.clear();
        this.modal.find(".input-data").val("");
        this.modal.find(".time-picker").val("");
        this.modal.find(".info-body").remove();
    }

    createInput() {
        const new_hour = document.createElement("div");
        new_hour.className = 'info-body mb-3';

        new_hour.innerHTML = `
            <div class="body-info">
                <label class="me-2">Час (год:хв): <input type="time" class="form-control time-picker" step="60"></label>
                <label class="me-2">Показник: <input type="text" placeholder="Вкажіть кількість енергії" class="form-control input-data " />
            </div>`;

        this.modalBody.append(new_hour);
    }

    push() {
        const readingsData = {
            date: this.dateInput.val(),
            records: [],
            calculated: []
        };

        const tempRecords = [];
        this.dataPoints = [];
        let isValid = true;
        let prevTimeMinutes = -1;

        this.modal.find(".info-body").each((_, el) => {
            const time = el.querySelector(".time-picker").value.trim();
            const energy = el.querySelector(".input-data").value.trim();

            if (!/^\d{2}:\d{2}$/.test(time)) {
                isValid = false;
                el.classList.add("invalid-block");
                return;
            }

            const [hourStr, minuteStr] = time.split(":");
            const hour = parseInt(hourStr);
            const minute = parseInt(minuteStr);
            const power = parseFloat(energy);

            if (
                isNaN(hour) || isNaN(minute) || isNaN(power) ||
                power < 0 ||
                energy === ''
            ) {
                isValid = false;
                el.classList.add("invalid-block");
                return;
            }

            const currentTimeMinutes = hour * 60 + minute;
            if (currentTimeMinutes <= prevTimeMinutes) {
                isValid = false;
                el.classList.add("invalid-block");
                alert("Час повинен бути у зростаючому порядку.");
                return;
            } else {
                el.classList.remove("invalid-block");
            }

            tempRecords.push({
                time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                energy: energy,
            });

            this.dataPoints.push({ timeMinutes: currentTimeMinutes, power: power });
            prevTimeMinutes = currentTimeMinutes;
        });

        if (isValid && readingsData.date) {
            this.dataPoints.sort((a, b) => a.timeMinutes - b.timeMinutes);

            this.calculateHourly();

            readingsData.records = tempRecords;
            readingsData.calculated = this.hourlyProduction;

            console.log("Надіслано з модального вікна показників:", readingsData);
            document.activeElement.blur();
            this.modal.modal('hide');
            this.send(readingsData);
        } else {
            alert("Будь ласка, заповніть правильно усі поля.");
        }
    }

    send(data) {
        const electricityRecordData = {
            date: data.date
        };

        for (let i = 0; i < 24; i++) {
            // ЗМІНЕНО ТУТ: перетворення на ціле число та значення за замовчуванням 0
            electricityRecordData[`hour${i + 1}`] = data.calculated[i] && data.calculated[i].power !== undefined ? parseInt(data.calculated[i].power) : 0;
        }

        const electricityRecordPromise = fetch('/add-electricity-record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(electricityRecordData)
        }).then(response => response.text());

        const indicatorPromises = data.records.map(record => {
            return fetch('/add-production-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    'date': data.date,
                    // ЗМІНЕНО ТУТ: production_value на information відповідно до очікувань бекенду
                    'information': record.energy,
                    'interval': record.time,
                })
            }).then(response => response.text());
        });

        Promise.all([...indicatorPromises, electricityRecordPromise])
            .then(results => {
                const allSuccess = results.every(result => result === 'Success');

                if (allSuccess) {
                    console.log('Усі дані (показники, погодинні записи) збережено на сервері');
                    alert('Дані успішно збережено!');

                } else {
                    const errorMessage = results.find(result => result !== 'Success');
                    alert('Помилка збереження: ' + errorMessage);
                }
            })
            .catch(error => {
                console.error('Помилка відправки:', error);
                alert('Помилка відправки: ' + error);
            });
    }
}

$(document).ready(function () {
    flatpickr("#dateInputReadings", {
        locale: "uk",
        dateFormat: "d.m.Y"
    });
    const readingsModal = new ModalInterfaceReadings('#modalReadings');

});