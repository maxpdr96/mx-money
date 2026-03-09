package com.mx.money.dto;

import com.mx.money.entity.RecurrenceType;
import com.mx.money.entity.TransactionType;
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
public class BackupJsonTransaction {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate effectiveDate;
    private TransactionType type;
    private RecurrenceType recurrence;
    private String categoryName;
    private LocalDate lastGeneratedDate;
    private LocalDate endDate;
    private Long parentRecurringId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
