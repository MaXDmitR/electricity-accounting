package org.Accounting.controllers;

import org.Accounting.models.*;
import org.Accounting.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
public class HomeController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DiapasonRepository diapasonRepository;

    @Autowired
    private ElectricityProductionRepository electricityProductionRepository;

    @Autowired
    private ElectricityTableRepository electricityTableRepository;

    @Autowired
    private ElectricityAccountingRepository electricityAccountingRepository;

    @GetMapping({"/", "/index"})
    public String index(HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("user");

        List<ElectricityAccounting> electricityacc = Collections.emptyList();
        List<ElectricityProduction> userProductionRecords = Collections.emptyList();
        List<Diapason> userDiapasonRecords = Collections.emptyList();
        List <ElectricityTable> table = Collections.emptyList();
        String notLoginText = "You are not registered";
        model.addAttribute("isLoggedIn", loggedInUser != null);
        model.addAttribute("user", loggedInUser);
        model.addAttribute("notLogin", notLoginText);

        if (loggedInUser != null) {
            electricityacc = electricityAccountingRepository.findByUser(loggedInUser);
            userProductionRecords = electricityProductionRepository.findByUser(loggedInUser);
            userDiapasonRecords = diapasonRepository.findByUser(loggedInUser);
            table = electricityTableRepository.findAll();
        }
        model.addAttribute("electricityacc", electricityacc);
        model.addAttribute("userProductionRecords", userProductionRecords);
        model.addAttribute("userDiapasonRecords", userDiapasonRecords);
        model.addAttribute("table", table);

        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password,
                        HttpSession session) {
        User user = userRepository.findByEmail(email);
        if (user != null && user.getPassword().equals(password)) {
            session.setAttribute("user", user);
            return "redirect:/index";
        }
        return "login";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/index";
    }

    @PostMapping("/add-production-data")
    @ResponseBody
    public String addProductionData(
            @RequestParam("date") String dateString,
            @RequestParam("information") Integer information,
            @RequestParam("interval") String intervalString,
            HttpSession session) {

        User loggedInUser = (User) session.getAttribute("user");

        if (loggedInUser == null) {
            return "Error: User not logged in";
        }

        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
            LocalDate productionDate = LocalDate.parse(dateString, dateFormatter);

            LocalTime measurementTime;
            try {
                measurementTime = LocalTime.parse(intervalString, DateTimeFormatter.ofPattern("HH:mm"));
            } catch (DateTimeParseException e) {
                return "Error: Invalid time format for interval. Please use HH:mm.";
            }

            if (electricityProductionRepository.existsByProductionDataAndMeasurementTimeAndUser(productionDate, measurementTime, loggedInUser)) {
                return "Error: A record for this date and time already exists for the current user.";
            }

            ElectricityProduction electricityProduction = new ElectricityProduction();
            electricityProduction.setUser(loggedInUser);
            electricityProduction.setProductionData(productionDate); // ВИПРАВЛЕНО: на setProductionData
            electricityProduction.setProductionValue(information); // ВИПРАВЛЕНО: на setProductionValue
            electricityProduction.setMeasurementTime(measurementTime); // ВИПРАВЛЕНО: на setMeasurementTime

            electricityProductionRepository.save(electricityProduction);

            return "Success";
        } catch (DateTimeParseException e) {
            System.err.println("Error parsing date/time in addProductionData: " + e.getMessage());
            e.printStackTrace();
            return "Error: Invalid date format. Please use dd.MM.yyyy for date.";
        } catch (Exception e) {
            System.err.println("Error in addProductionData: " + e.getMessage());
            e.printStackTrace();
            return "Error: An unexpected error occurred: " + e.getMessage();
        }
    }
    @PostMapping("/api/filtration")
    public String filtrationData(
            @RequestParam("startDate") String startDateString,
            @RequestParam("endDate") String endDateString,
            Model model,
            HttpSession session // <-- Додаємо HttpSession для доступу до сесії
    ) {
        // Форматтер для парсингу дати "дд.мм.рррр" з HTML-форми
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");

        // Отримуємо користувача з сесії
        User loggedInUser = (User) session.getAttribute("user");
        model.addAttribute("user", loggedInUser); // <-- ДОДАЄМО user ДО МОДЕЛІ
        model.addAttribute("isLoggedIn", loggedInUser != null); // Оновлюємо isLoggedIn

        try {
            LocalDate startDate = LocalDate.parse(startDateString, formatter);
            LocalDate endDate = LocalDate.parse(endDateString, formatter);

            List<ElectricityTable> allRecords = electricityTableRepository.findAll();


            List<ElectricityTable> filteredTable = allRecords.stream()
                    .filter(record -> {
                        LocalDate recordDate = record.getRecordDate();
                        return !recordDate.isBefore(startDate) && !recordDate.isAfter(endDate);
                    })
                    .collect(Collectors.toList());

            model.addAttribute("table", filteredTable);

            return "index";
        } catch (DateTimeParseException e) {
            model.addAttribute("errorMessage", "Невірний формат дати. Будь ласка, використовуйте дд.мм.рррр.");
            System.err.println("Помилка парсингу дати, введеної користувачем: " + e.getMessage());

            model.addAttribute("table", electricityTableRepository.findAll());

            return "index";
        }
    }


    @GetMapping("/table")
    public String table(Model model) {
        List<ElectricityTable> electricityRecords = electricityTableRepository.findAll();
        model.addAttribute("table", electricityRecords);
        return "table";
    }

    @GetMapping("/registry")
    public String register() {
        return "registry";
    }

    @PostMapping("/registry")
    public String reg(@RequestParam String email, @RequestParam String password, @RequestParam String name, Model model) {
        if (userRepository.findByEmail(email) != null) {
            model.addAttribute("errorMessage", "Email already exists. Please choose a different one.");
            return "registry";
        }
        User user = new User(email, password, name);
        userRepository.save(user);
        return "redirect:/index";
    }

    @PostMapping("/add-electricity-record")
    @ResponseBody
    public String addElectricityRecord(
            @RequestParam("date") @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate recordDate,
            @RequestParam("hour1") Integer hour1,
            @RequestParam("hour2") Integer hour2,
            @RequestParam("hour3") Integer hour3,
            @RequestParam("hour4") Integer hour4,
            @RequestParam("hour5") Integer hour5,
            @RequestParam("hour6") Integer hour6,
            @RequestParam("hour7") Integer hour7,
            @RequestParam("hour8") Integer hour8,
            @RequestParam("hour9") Integer hour9,
            @RequestParam("hour10") Integer hour10,
            @RequestParam("hour11") Integer hour11,
            @RequestParam("hour12") Integer hour12,
            @RequestParam("hour13") Integer hour13,
            @RequestParam("hour14") Integer hour14,
            @RequestParam("hour15") Integer hour15,
            @RequestParam("hour16") Integer hour16,
            @RequestParam("hour17") Integer hour17,
            @RequestParam("hour18") Integer hour18,
            @RequestParam("hour19") Integer hour19,
            @RequestParam("hour20") Integer hour20,
            @RequestParam("hour21") Integer hour21,
            @RequestParam("hour22") Integer hour22,
            @RequestParam("hour23") Integer hour23,
            @RequestParam("hour24") Integer hour24,
            HttpSession session) {

        User loggedInUserFromSession = (User) session.getAttribute("user");
        if (loggedInUserFromSession == null) {
            return "Error: User not logged in";
        }

        try {
            User managedUser = userRepository.findById(loggedInUserFromSession.getId())
                    .orElseThrow(() -> new RuntimeException("Logged in user not found in database."));

            Optional<ElectricityAccounting> existingRecord = electricityAccountingRepository.findByRecordDateAndUser(recordDate, managedUser);

            ElectricityAccounting electricityRecord;
            if (existingRecord.isPresent()) {
                electricityRecord = existingRecord.get();
            } else {
                electricityRecord = new ElectricityAccounting();
                electricityRecord.setRecordDate(recordDate);
                electricityRecord.setUser(managedUser);
            }

            electricityRecord.setHour1(hour1);
            electricityRecord.setHour2(hour2);
            electricityRecord.setHour3(hour3);
            electricityRecord.setHour4(hour4);
            electricityRecord.setHour5(hour5);
            electricityRecord.setHour6(hour6);
            electricityRecord.setHour7(hour7);
            electricityRecord.setHour8(hour8);
            electricityRecord.setHour9(hour9);
            electricityRecord.setHour10(hour10);
            electricityRecord.setHour11(hour11);
            electricityRecord.setHour12(hour12);
            electricityRecord.setHour13(hour13);
            electricityRecord.setHour14(hour14);
            electricityRecord.setHour15(hour15);
            electricityRecord.setHour16(hour16);
            electricityRecord.setHour17(hour17);
            electricityRecord.setHour18(hour18);
            electricityRecord.setHour19(hour19);
            electricityRecord.setHour20(hour20);
            electricityRecord.setHour21(hour21);
            electricityRecord.setHour22(hour22);
            electricityRecord.setHour23(hour23);
            electricityRecord.setHour24(hour24);

            electricityAccountingRepository.save(electricityRecord);

            return "Success";
        } catch (Exception e) {
            System.err.println("Error saving electricity record: " + e.getMessage());
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    @PostMapping("/add-diapason_data")
    @ResponseBody
    public String addSalesRange(
            @RequestParam("date") String dateString,
            @RequestParam("startTime") String startTimeString,
            @RequestParam("endTime") String endTimeString,
            @RequestParam("sellPercent") int sellPercent,
            @RequestParam("reservePercent") int reservePercent,
            @RequestParam("energy")  int energy,
            HttpSession session) {

        User loggedInUser = (User) session.getAttribute("user");

        if (loggedInUser == null) {
            return "Error: User not logged in";
        }

        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
            LocalDate salesDate = LocalDate.parse(dateString, dateFormatter);

            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            LocalTime startTime = LocalTime.parse(startTimeString, timeFormatter);
            LocalTime endTime = LocalTime.parse(endTimeString, timeFormatter);

            if (diapasonRepository.findBySalesDateAndStartTimeAndEndTimeAndUser(salesDate, startTime, endTime, loggedInUser).isPresent()) {
                return "Error: A diapason record for this date and time range already exists for the current user.";
            }

            Diapason diapason = new Diapason();
            diapason.setUser(loggedInUser);
            diapason.setSalesDate(salesDate);
            diapason.setStartTime(startTime);
            diapason.setEndTime(endTime);
            diapason.setSalePercentage(sellPercent);
            diapason.setReservePercentage(reservePercent);
            diapason.setAmountEnergySpent(energy);

            diapasonRepository.save(diapason);

            return "Success";
        } catch (DateTimeParseException e) {
            System.err.println("Error parsing date/time in addSalesRange: " + e.getMessage());
            e.printStackTrace();
            return "Error: Invalid date/time format. Please use dd.MM.yyyy for date and HH:mm for time.";
        } catch (Exception e) {
            System.out.println("Error in addSalesRange: " + e.getMessage());
            e.printStackTrace();
            return "Error: An unexpected error occurred: " + e.getMessage();
        }
    }
}