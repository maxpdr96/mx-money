package com.mx.money.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO para projeção de saldo futuro
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BalanceProjection {

    private LocalDate date;
    private BigDecimal balance;
    private List<TransactionResponse> transactions;

    public BalanceProjection(LocalDate date, BigDecimal balance) {
        this.date = date;
        this.balance = balance;
    }
}
