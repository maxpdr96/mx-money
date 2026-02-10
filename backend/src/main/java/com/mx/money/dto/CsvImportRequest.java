package com.mx.money.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Representa uma linha do CSV importado
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CsvImportRequest {

    private String date;
    private String description;
    private BigDecimal amount;
}
