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
public class BackupJsonData {
    private int version;
    private LocalDateTime exportedAt;
    private List<BackupJsonCategory> categories;
    private List<BackupJsonTransaction> transactions;
    private List<BackupJsonCategorizationRule> categorizationRules;
    private List<BackupJsonStock> stocks;
    private List<BackupJsonSector> stockSectors;
}
