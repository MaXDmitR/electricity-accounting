package org.Accounting.controllers;

import org.Accounting.models.*;
import org.Accounting.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpSession;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
 class CalculateDataApiController {

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

    @GetMapping("/calculate-data")
    public ResponseEntity<Map<String, Object>> getCalculationData(
            @RequestParam("date") String dateString,
            @RequestParam("user_id") Long userId,
            HttpSession session) {

        Map<String, Object> responseData = new HashMap<>();
        User loggedInUser = (User) session.getAttribute("user");

        if (loggedInUser == null || !loggedInUser.getId().equals(userId)) {
            responseData.put("error", "Unauthorized or invalid user ID.");
            return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
        }

        LocalDate date;
        try {
            date = LocalDate.parse(dateString, DateTimeFormatter.ofPattern("dd.MM.yyyy"));
        } catch (DateTimeParseException e) {
            responseData.put("error", "Invalid date format. Please use dd.MM.yyyy.");
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        }

        try {
            List<Diapason> diapasonRecords = diapasonRepository.findBySalesDateAndUser(date, loggedInUser);
            if (diapasonRecords.isEmpty()) {
                responseData.put("error", "Diapason data not found for this date.");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            responseData.put("diapasons", diapasonRecords);

            Optional<ElectricityAccounting> electricityAccountingOptional = electricityAccountingRepository.findByRecordDateAndUser(date, loggedInUser);
            if (electricityAccountingOptional.isEmpty()) {
                responseData.put("error", "Electricity accounting data not found for this date.");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            ElectricityAccounting ea = electricityAccountingOptional.get();
            Map<String, Integer> calculatedHours = new HashMap<>();
            for (int i = 1; i <= 24; i++) {
                try {
                    java.lang.reflect.Method method = ElectricityAccounting.class.getMethod("getHour" + i);
                    calculatedHours.put("hour" + i, (Integer) method.invoke(ea));
                } catch (Exception e) {
                    calculatedHours.put("hour" + i, 0);
                    System.err.println("Error getting hour value for hour" + i + ": " + e.getMessage());
                }
            }
            responseData.put("electricity_calculated", calculatedHours);

            Optional<ElectricityTable> hourlyPricesOptional = electricityTableRepository.findByRecordDate(date);
            if (hourlyPricesOptional.isEmpty()) {
                responseData.put("error", "Hourly prices data not found for this date.");
                return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
            }
            ElectricityTable ht = hourlyPricesOptional.get();
            List<Double> hourlyPrices = new ArrayList<>();
            for (int i = 1; i <= 24; i++) {
                try {
                    java.lang.reflect.Method method = ElectricityTable.class.getMethod("getHour" + i);
                    Object value = method.invoke(ht);
                    if (value instanceof Number) {
                        hourlyPrices.add(((Number) value).doubleValue());
                    } else {
                        hourlyPrices.add(0.0);
                        System.err.println("Unsupported value type for hour" + i);
                    }
                } catch (Exception e) {
                    hourlyPrices.add(0.0);
                    System.err.println("Error getting hourly price for hour" + i + ": " + e.getMessage());
                }
            }
            responseData.put("hourly_prices", hourlyPrices);

            return new ResponseEntity<>(responseData, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("Error in getCalculationData API: " + e.getMessage());
            e.printStackTrace();
            responseData.put("error", "Internal server error: " + e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}