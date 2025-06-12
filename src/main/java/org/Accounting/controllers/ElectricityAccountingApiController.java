package org.Accounting.controllers;

import org.Accounting.models.ElectricityAccounting;
import org.Accounting.models.User;
import org.Accounting.repository.ElectricityAccountingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpSession;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/electricity-accounting")
public class ElectricityAccountingApiController {

    @Autowired
    private ElectricityAccountingRepository electricityAccountingRepository;


    @GetMapping
    public ResponseEntity<List<ElectricityAccounting>> getUserElectricityAccounting(HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");

        if (loggedInUser == null) {
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.UNAUTHORIZED);
        }

        List<ElectricityAccounting> records = electricityAccountingRepository.findByUser(loggedInUser);
        return new ResponseEntity<>(records, HttpStatus.OK);
    }
}