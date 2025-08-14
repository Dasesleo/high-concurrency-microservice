package com.example.app.controller;

import com.example.app.service.TransferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class TransferController {
    private final TransferService service;

    public TransferController(TransferService service) {
        this.service = service;
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transfer(@RequestBody @Valid Dto.TransferRequest body) {
        service.transfer(body.from, body.to, body.amount, body.key);
        return ResponseEntity.ok().build();
    }
}
