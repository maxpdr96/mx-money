package com.mx.money.dto;

import com.mx.money.entity.StockEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupJsonStockEvent {
    private StockEventType type;
    private LocalDate eventDate;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal fees;
    private BigDecimal splitRatio;
    private BigDecimal totalValue;
    private String notes;
    private LocalDateTime createdAt;
}
