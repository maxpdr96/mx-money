package com.mx.money.dto;

import lombok.*;

/**
 * DTO para resposta de análise de relatório financeiro
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportAnalysisResponse {

    private String analysis;
    private String generatedAt;
    private boolean success;
    private String errorMessage;
}
