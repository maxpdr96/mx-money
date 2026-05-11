package com.mx.money.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupJsonStock {
    private String ticker;
    private String name;
    private String sector;
    private String cnpj;
    private String notes;
    private LocalDateTime createdAt;
    private List<BackupJsonStockEvent> events;
}
