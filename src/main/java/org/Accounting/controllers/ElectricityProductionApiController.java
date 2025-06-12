package org.Accounting.controllers;
import jakarta.servlet.http.HttpSession;
import org.Accounting.models.ElectricityProduction;
import org.Accounting.models.User;
import org.Accounting.repository.ElectricityProductionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/electricity-production")
public class ElectricityProductionApiController {
    @Autowired
    private ElectricityProductionRepository  electricityProductionRepository;

    @GetMapping
    public ResponseEntity<List<ElectricityProduction>> getUserElectricityProduction(HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");

        if (loggedInUser == null) {
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.UNAUTHORIZED);
        }

        List<ElectricityProduction> records = electricityProductionRepository.findByUser(loggedInUser);
        return new ResponseEntity<>(records, HttpStatus.OK);
    }
}
