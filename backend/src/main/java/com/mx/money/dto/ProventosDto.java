package com.mx.money.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProventosDto {
    private String ticker;
    private String name;
    private String cnpj;

    // Dividendos — isentos de IR para PF (Rendimentos Isentos, código 09)
    private BigDecimal dividends;

    // JCP — tributação exclusiva 15% IRRF retido na fonte (código 10)
    private BigDecimal jcpGross;    // valor bruto (o que a empresa pagou)
    private BigDecimal jcpIrrf;     // 15% retido na fonte (já pago pela empresa)
    private BigDecimal jcpNet;      // valor líquido recebido na conta

    // Amortização — devolução de capital (reduz custo médio, não tributada)
    private BigDecimal amortization;
}
