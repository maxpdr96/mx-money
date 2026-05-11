package com.mx.money.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YearEndPositionDto {
    private String ticker;
    private String name;
    private String cnpj;

    // Posição em 31/12 do ano declarado
    private BigDecimal quantity;
    private BigDecimal averageCost;
    private BigDecimal totalCost;       // custo total = qtd × PM (valor para Bens e Direitos)

    // Posição em 31/12 do ano anterior (campo "situação anterior" da ficha)
    private BigDecimal prevQuantity;
    private BigDecimal prevTotalCost;
}
