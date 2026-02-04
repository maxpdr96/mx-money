package com.mx.money.controller;

import com.mx.money.dto.BalanceProjection;
import com.mx.money.dto.BalanceResponse;
import com.mx.money.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/balance")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;

    /**
     * Retorna o saldo atual
     */
    @GetMapping
    public ResponseEntity<BalanceResponse> getCurrentBalance() {
        return ResponseEntity.ok(balanceService.getCurrentBalance());
    }

    /**
     * Retorna o saldo em uma data específica
     */
    @GetMapping("/as-of")
    public ResponseEntity<BalanceResponse> getBalanceAsOf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(balanceService.getBalanceAsOf(date));
    }

    /**
     * Retorna a projeção de saldo para os próximos N dias
     */
    @GetMapping("/projection")
    public ResponseEntity<List<BalanceProjection>> getProjection(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(balanceService.getProjection(days));
    }
}
