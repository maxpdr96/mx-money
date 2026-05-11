package com.mx.money.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockSectorResponse {
    private Long id;
    private String name;
    private String color;
}
