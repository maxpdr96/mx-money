package com.mx.money.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Resultado da categorização de uma linha do CSV pela IA
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CsvImportResponse {

    private String date;
    private String description;
    private BigDecimal amount;
    private String category;
}
