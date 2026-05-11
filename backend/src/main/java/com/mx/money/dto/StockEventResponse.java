package com.mx.money.dto;

import com.mx.money.entity.StockEventType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockEventResponse {
    private Long id;
    private Long stockId;
    private String ticker;
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
