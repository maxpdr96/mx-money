package com.mx.money.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO de resposta para categorias
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String color;
    private String icon;
    private LocalDateTime createdAt;
}
