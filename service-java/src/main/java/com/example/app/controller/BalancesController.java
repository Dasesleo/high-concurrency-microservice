package com.example.app.controller;

import com.example.app.service.TransferService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
public class BalancesController {
    private final TransferService service;

    public BalancesController(TransferService service) {
        this.service = service;
    }

    @GetMapping("/balances")
    public ResponseEntity<Map<String, Long>> balances() {
        return ResponseEntity.ok(service.balances());
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> reset(@RequestBody(required = false) @Valid Dto.ResetRequest body) {
        if (body == null)
            body = new Dto.ResetRequest();
        service.reset(body.accounts, body.initialBalance);
        return ResponseEntity.ok().build();
    }
}
