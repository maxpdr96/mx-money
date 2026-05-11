package com.mx.money.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockResponse {
    private Long id;
    private String ticker;
    private String name;
    private String sector;
    private String cnpj;
    private String notes;
    private LocalDateTime createdAt;
}
