// class CalculateAllData {
//     constructor() {
//         this.input = document.getElementById('calculateAllData');   // Поле вибору дати
//         this.button = document.querySelector('.calculateAllData');  // Кнопка для розрахунку
//         this.result = document.getElementById('result');            // Поле для виводу результату
//
//         // userId можна брати, наприклад, з прихованого поля у DOM
//         this.userId = document.getElementById('userId') ? document.getElementById('userId').value : null;
//
//         if (!this.userId) {
//             console.error("User ID не знайдено у DOM (елемент з id='userId')");
//         }
//
//         this.button.addEventListener('click', () => this.handleClick());
//     }
//
//     async handleClick() {
//         const date = this.input.value.trim();
//         if (!date) {
//             this.showResult("❌ Будь ласка, введіть дату.", "error");
//             return;
//         }
//
//         if (!this.userId) {
//             this.showResult("❌ User ID не визначено.", "error");
//             return;
//         }
//
// // Додати на початку класу (можна після constructor або в середині handleClick)
//         const MAX_RESERVATION_ENERGY = 15000;
//         try {
//             const data = await this.loadAllData(date, this.userId);
//
//             if (!data.diapason || !data.electricity_calculated || !data.hourly_prices) {
//                 this.showResult("⚠️ Неповні дані для розрахунку.", "warning");
//                 return;
//             }
//
//             // Припустимо, electricity_calculated — об'єкт з ключами hour1..hour24
//             // Формуємо масив потужностей по годинах (0..23)
//             const calculatedArray = [];
//             for(let h=1; h<=24; h++) {
//                 const key = 'hour' + h;
//                 calculatedArray.push(data.electricity_calculated[key] || 0);
//             }
//
//             // Масив цін за годинами (24 елементи)
//             const hourlyPrices = data.hourly_prices; // очікуємо масив з 24 чисел
//             if (hourlyPrices.length !== 24) {
//                 this.showResult("❌ Неправильна кількість погодинних цін (має бути 24).", "error");
//                 return;
//             }
//
//             // Інтерполяція потужності по хвилинах для 24 годин
//             const dataPoints = calculatedArray.map((power, idx) => ({
//                 timeMinutes: idx * 60,
//                 power
//             }));
//
//             const energyPerMinute = this.calculateEnergyPerMinuteArray(dataPoints);
//             const totalEnergy = energyPerMinute.reduce((sum, e) => sum + e, 0);
//
//             // Параметри із diapason
//             const diapason = data.diapason;
//
//             // Відсотки беремо з diapason або ставимо дефолтні
//             const salePercentage = diapason.salePercentage ?? 50;
//             const reservationPercentage = diapason.reservePercentage ?? 50;
//
//             if (salePercentage + reservationPercentage !== 100) {
//                 this.showResult("❌ Сума відсотків (продаж + резерв) має бути 100%.", "error");
//                 return;
//             }
//
//             // Витрачена енергія (припустимо, amount_energy_spent у кВт·год)
//             const spentEnergy = diapason.amountEnergySpent / 1000 ?? 0;
//
//             // Розрахунок вартості продажу
//             const saleEnergyPerMinute = energyPerMinute.map(e => e * (salePercentage / 100));
//             const saleIncome = saleEnergyPerMinute.reduce((sum, energy, minute) => {
//                 const hour = Math.floor(minute / 60);
//                 const pricePerKWh = hourlyPrices[hour] / 1000; // ціна за 1 кВт·год
//                 return sum + (energy * pricePerKWh);
//             }, 0);
//
//             const saleEnergy = totalEnergy * (salePercentage / 100);
//             const reservationEnergy = totalEnergy * (reservationPercentage / 100);
//             const reservationPricePerKWh = 2.3; // фіксована ціна резервування
//             const reservationCost = reservationEnergy * reservationPricePerKWh;
//
//             this.showResult(`
//                 ✅ <b>Дата:</b> ${date} <br>
//                 📊 <b>Загальна енергія:</b> ${totalEnergy.toFixed(3)} кВт·год <br>
//                 🔋 <b>Витрачено:</b> ${spentEnergy.toFixed(3)} Вт·год <br>
//                 💰 <b>Продаж (${salePercentage}%):</b> ${saleEnergy.toFixed(3)} кВт·год <br>
//                 💵 <b>Вартість продажу:</b> ${saleIncome.toFixed(2)} грн <br>
//                 🛑 <b>Резервування (${reservationPercentage}%):</b> ${reservationEnergy.toFixed(3)} кВт·год <br>
//                 💸 <b>Вартість резерву:</b> ${reservationCost.toFixed(2)} грн <br>
//             `, "success");
//
//         } catch (error) {
//             console.error('Помилка при завантаженні чи обробці даних:', error);
//             this.showResult("❌ Помилка при виконанні розрахунків.", "error");
//         }
//     }
//
//     async loadAllData(date, userId) {
//         console.log("Завантаження даних для дати:", date);
//         const response = await fetch(`/api/calculate-data?date=${encodeURIComponent(date)}&user_id=${encodeURIComponent(userId)}`);
//         if (!response.ok) throw new Error(`HTTP помилка: ${response.status}`);
//
//         return await response.json();
//     }
//
//     interpolatePowerAtMinute(dataPoints, targetMinute) {
//         if (dataPoints.length === 0) return 0;
//
//         const exact = dataPoints.find(({ timeMinutes }) => timeMinutes === targetMinute);
//         if (exact) return exact.power;
//
//         const before = [...dataPoints].reverse().find(({ timeMinutes }) => timeMinutes < targetMinute);
//         const after = dataPoints.find(({ timeMinutes }) => timeMinutes > targetMinute);
//
//         if (!before && !after) return 0;
//         if (!before) return after.power;
//         if (!after) return before.power;
//
//         const ratio = (targetMinute - before.timeMinutes) / (after.timeMinutes - before.timeMinutes);
//         return before.power + ratio * (after.power - before.power);
//     }
//
//     calculateEnergyPerMinuteArray(dataPoints) {
//         const energyPerMinute = [];
//         for (let minute = 0; minute < 1440; minute++) {
//             const interpolatedPower = this.interpolatePowerAtMinute(dataPoints, minute);
//             energyPerMinute.push(interpolatedPower / 60); // кВт·год на хвилину
//         }
//         return energyPerMinute;
//     }
//
//     showResult(message, type) {
//         let color = "#f1f1f1";
//         if (type === "error") color = "red";
//         else if (type === "success") color = "green";
//         else if (type === "warning") color = "orange";
//
//         this.result.style.color = color;
//         this.result.innerHTML = message;
//     }
// }
//
// document.addEventListener("DOMContentLoaded", function () {
//     // Ініціалізуємо календарі
//     ["#calculateAllData", "#firstUserDate", "#secondUserDate"].forEach(selector => {
//         flatpickr(selector, { locale: "uk", dateFormat: "d.m.Y" });
//     });
//
//     // Створюємо і запускаємо клас розрахунків
//     new CalculateAllData();
// });

class CalculateAllData {
    constructor() {
        this.input = document.getElementById('calculateAllData');
        this.button = document.querySelector('.calculateAllData');
        this.result = document.getElementById('result');
        this.userId = document.getElementById('userId') ? document.getElementById('userId').value : null;

        if (!this.userId) {
            console.error("User ID не знайдено у DOM (елемент з id='userId')");
        }

        this.button.addEventListener('click', () => this.handleClick());
    }

    async handleClick() {
        const MAX_RESERVATION_ENERGY = 15000;

        const date = this.input.value.trim();
        if (!date) {
            this.showResult("❌ Будь ласка, введіть дату.", "error");
            return;
        }

        if (!this.userId) {
            this.showResult("❌ User ID не визначено.", "error");
            return;
        }

        try {
            const data = await this.loadAllData(date, this.userId);

            if (!data.diapasons || !Array.isArray(data.diapasons) || !data.electricity_calculated || !data.hourly_prices) {
                this.showResult("⚠️ Неповні або некоректні дані для розрахунку.", "warning");
                return;
            }

            const calculatedArray = [];
            for (let h = 1; h <= 24; h++) {
                const key = 'hour' + h;
                calculatedArray.push(data.electricity_calculated[key] || 0);
            }

            const hourlyPrices = data.hourly_prices;
            if (hourlyPrices.length !== 24) {
                this.showResult("❌ Неправильна кількість погодинних цін (має бути 24).", "error");
                return;
            }

            const dataPoints = calculatedArray.map((power, idx) => ({
                timeMinutes: idx * 60,
                power
            }));

            const energyPerMinute = this.calculateEnergyPerMinuteArray(dataPoints);
            const totalEnergy = energyPerMinute.reduce((sum, e) => sum + e, 0);

            let totalSaleEnergy = 0;
            let totalReservationEnergy = 0;
            let totalSaleIncome = 0;
            let totalReservationCost = 0;

            const reserveLimitPerMinute = MAX_RESERVATION_ENERGY / 1440;

            let diapasonsSpentEnergyInfo = '';

            for (const diapason of data.diapasons) {
                const salePercentage = diapason.salePercentage ?? 50;
                const reservationPercentage = diapason.reservePercentage ?? 50;

                if (salePercentage + reservationPercentage !== 100) {
                    this.showResult("❌ У одному з діапазонів сума відсотків ≠ 100%.", "error");
                    return;
                }

                const diapasonSpentEnergy = (diapason.amountEnergySpent ?? 0) / 1000; // В кВт·год

                diapasonsSpentEnergyInfo += `📉 <b>Витрачена енергія діапазону:</b> ${diapasonSpentEnergy.toFixed(3)} кВт·год<br>`;

                let saleEnergy = totalEnergy * (salePercentage / 100);
                let reservationEnergy = totalEnergy * (reservationPercentage / 100);

                // Ось тут ключове обмеження загального резерву:
                const remainingReservation = MAX_RESERVATION_ENERGY - totalReservationEnergy;
                const allowedReservation = Math.min(reservationEnergy, remainingReservation);

                const excess = reservationEnergy - allowedReservation;
                reservationEnergy = allowedReservation;
                saleEnergy += excess;

                const saleEnergyPerMinute = energyPerMinute.map(e => {
                    const baseSale = e * (salePercentage / 100);
                    const reserve = e * (reservationPercentage / 100);
                    const excessReserve = Math.max(0, reserve - reserveLimitPerMinute);
                    return baseSale + excessReserve;
                });

                const saleIncome = saleEnergyPerMinute.reduce((sum, energy, minute) => {
                    const hour = Math.floor(minute / 60);
                    const pricePerKWh = hourlyPrices[hour] / 1000;
                    return sum + (energy * pricePerKWh);
                }, 0);

                const reservationPricePerKWh = 2.3;
                const reservationCost = reservationEnergy * reservationPricePerKWh;

                totalSaleEnergy += saleEnergy;
                totalReservationEnergy += reservationEnergy;
                totalSaleIncome += saleIncome;
                totalReservationCost += reservationCost;
            }

            this.showResult(`
                ✅ <b>Дата:</b> ${date} <br>
                📊 <b>Загальна енергія:</b> ${totalEnergy.toFixed(3)} кВт·год <br>
                ${diapasonsSpentEnergyInfo}
                💰 <b>Загальний продаж:</b> ${totalSaleEnergy.toFixed(3)} кВт·год <br>
                💵 <b>Доходи від продажу:</b> ${totalSaleIncome.toFixed(2)} грн <br>
                🛑 <b>Загальне резервування:</b> ${totalReservationEnergy.toFixed(3)} кВт·год <br>
                💸 <b>Вартість резерву:</b> ${totalReservationCost.toFixed(2)} грн <br>
            `, "success");

        } catch (error) {
            console.error('Помилка при завантаженні чи обробці даних:', error);
            this.showResult("❌ Помилка при виконанні розрахунків.", "error");
        }
    }

    async loadAllData(date, userId) {
        console.log("Завантаження даних для дати:", date);
        const response = await fetch(`/api/calculate-data?date=${encodeURIComponent(date)}&user_id=${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error(`HTTP помилка: ${response.status}`);
        return await response.json();
    }

    interpolatePowerAtMinute(dataPoints, targetMinute) {
        if (dataPoints.length === 0) return 0;

        const exact = dataPoints.find(({ timeMinutes }) => timeMinutes === targetMinute);
        if (exact) return exact.power;

        const before = [...dataPoints].reverse().find(({ timeMinutes }) => timeMinutes < targetMinute);
        const after = dataPoints.find(({ timeMinutes }) => timeMinutes > targetMinute);

        if (!before && !after) return 0;
        if (!before) return after.power;
        if (!after) return before.power;

        const ratio = (targetMinute - before.timeMinutes) / (after.timeMinutes - before.timeMinutes);
        return before.power + ratio * (after.power - before.power);
    }

    calculateEnergyPerMinuteArray(dataPoints) {
        const energyPerMinute = [];
        for (let minute = 0; minute < 1440; minute++) {
            const interpolatedPower = this.interpolatePowerAtMinute(dataPoints, minute);
            energyPerMinute.push(interpolatedPower / 60);
        }
        return energyPerMinute;
    }

    showResult(message, type) {
        let color = "#f1f1f1";
        if (type === "error") color = "red";
        else if (type === "success") color = "green";
        else if (type === "warning") color = "orange";

        this.result.style.color = color;
        this.result.innerHTML = message;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    ["#calculateAllData", "#firstUserDate", "#secondUserDate"].forEach(selector => {
        flatpickr(selector, { locale: "uk", dateFormat: "d.m.Y" });
    });

    new CalculateAllData();
});
