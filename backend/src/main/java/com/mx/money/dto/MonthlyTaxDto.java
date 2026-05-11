package com.mx.money.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyTaxDto {
    private int month;
    private String monthLabel;

    private BigDecimal grossSales;       // total de vendas no mês (todos os tickers)
    private BigDecimal totalCostBasis;   // custo médio total das ações vendidas
    private BigDecimal grossResult;      // resultado bruto (positivo = lucro, negativo = prejuízo)

    // true quando grossSales <= R$ 20.000 → lucro isento, prejuízo não compensa
    private boolean exempt;

    // Prejuízo de meses tributáveis anteriores usado para abater o lucro deste mês
    private BigDecimal lossOffset;

    // Base tributável após compensação de perdas
    private BigDecimal taxableResult;

    // IR devido = 15% × taxableResult
    private BigDecimal taxDue;

    // Novo prejuízo gerado neste mês (só em meses tributáveis) a carregar para frente
    private BigDecimal newLossGenerated;

    // Prazo para pagar o DARF (último dia útil do mês seguinte)
    private String darfDueMonth;
}
