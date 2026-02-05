package com.mx.money.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResponse {

    /**
     * Valor simulado da compra
     */
    private BigDecimal simulatedAmount;

    /**
     * Projeção de saldo dia-a-dia após a compra simulada
     */
    private List<BalanceProjection> projections;

    /**
     * Se o saldo ficará negativo em algum momento
     */
    private boolean goesNegative;

    /**
     * Data em que o saldo fica negativo pela primeira vez (se aplicável)
     */
    private LocalDate negativeDate;

    /**
     * Descrição da transação que causa o saldo negativo
     */
    private String negativeReason;

    /**
     * Saldo mínimo projetado durante o período
     */
    private BigDecimal minimumBalance;

    /**
     * Data do saldo mínimo
     */
    private LocalDate minimumBalanceDate;
}
