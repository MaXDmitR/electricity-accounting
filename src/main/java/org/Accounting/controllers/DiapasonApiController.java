package org.Accounting.controllers;

import jakarta.servlet.http.HttpSession;
import org.Accounting.models.Diapason;
import org.Accounting.models.User;
import org.Accounting.repository.DiapasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/diapason")
public class DiapasonApiController {
    @Autowired
    private DiapasonRepository  diapasonRepository;

    @GetMapping
    public ResponseEntity<List<Diapason>> getDiapason(HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.UNAUTHORIZED);
        }

        List<Diapason> diapasonsRecords = diapasonRepository.findByUser(loggedInUser);
        return new  ResponseEntity<>(diapasonsRecords, HttpStatus.OK);
    }
}
