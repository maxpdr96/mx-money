package com.mx.money.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupJsonCategory {
    private String name;
    private String color;
    private String icon;
    private BigDecimal monthlyBudget;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
