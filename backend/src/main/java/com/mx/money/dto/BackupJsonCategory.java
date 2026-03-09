package com.mx.money.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupJsonCategory {
    private String name;
    private String color;
    private String icon;
}
