package com.mx.money.controller;

import com.mx.money.dto.BalanceProjection;
import com.mx.money.dto.BalanceResponse;
import com.mx.money.dto.SimulationResponse;
import com.mx.money.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    /**
     * Simula o impacto de uma compra hipotética no saldo futuro
     * 
     * @param amount      Valor da compra
     * @param days        Dias de projeção
     * @param recurrence  Tipo de recorrência (NONE, MONTHLY, WEEKLY, etc.)
     * @param occurrences Número de ocorrências (ex: 12 para 12 meses)
     */
    @GetMapping("/simulate")
    public ResponseEntity<SimulationResponse> simulate(
            @RequestParam Double amount,
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "NONE") String recurrence,
            @RequestParam(defaultValue = "1") int occurrences) {
        return ResponseEntity.ok(balanceService.simulatePurchase(
                BigDecimal.valueOf(amount), days, recurrence, occurrences));
    }
}
