package com.mx.money.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTaxReportResponse {
    private int year;

    // Seção 1: Bens e Direitos — código 31
    private List<YearEndPositionDto> yearEndPositions;

    // Seção 2: Dividendos (Rendimentos Isentos — código 09) e JCP (Tributação Exclusiva — código 10)
    private List<ProventosDto> proventos;

    // Seção 3: Renda Variável — operações comuns mês a mês
    private List<MonthlyTaxDto> monthlyResults;

    // Totais do ano
    private BigDecimal totalTaxDue;          // IR total a pagar via DARF
    private BigDecimal lossCarriedForward;   // prejuízo acumulado a compensar em anos futuros
    private BigDecimal totalDividends;       // soma de todos os dividendos isentos
    private BigDecimal totalJcpGross;        // soma do JCP bruto
    private BigDecimal totalJcpIrrf;         // IRRF total retido no JCP (15%)
    private BigDecimal totalAmortization;    // amortização total recebida
}
