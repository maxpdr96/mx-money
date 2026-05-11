package com.mx.money.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockPositionResponse {
    private Long stockId;
    private String ticker;
    private String name;
    private String sector;

    // Quantidade atual de ações em carteira
    private BigDecimal quantity;

    // Preço médio de compra (custo médio ponderado, método obrigatório pela RF)
    private BigDecimal averageCost;

    // Custo total de compras + subscrições + bonificações (base de custo original)
    private BigDecimal totalInvested;

    // Receita total de vendas (líquido de taxas)
    private BigDecimal totalSales;

    // Lucro/Prejuízo realizado das vendas (descontado custo médio)
    private BigDecimal realizedPL;

    // Total recebido em dividendos (isento de IR para PF)
    private BigDecimal totalDividends;

    // Total bruto recebido em JCP (15% IRRF retido na fonte)
    private BigDecimal totalJcp;

    // Total devolvido via amortização (reduz custo médio; comum em FIIs)
    private BigDecimal totalAmortization;
}
