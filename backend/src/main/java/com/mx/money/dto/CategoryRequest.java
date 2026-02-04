package com.mx.money.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO para criação e atualização de categorias
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    private String name;

    @Size(max = 7, message = "Cor deve ter no máximo 7 caracteres (hex)")
    private String color;

    @Size(max = 50, message = "Ícone deve ter no máximo 50 caracteres")
    private String icon;
}
