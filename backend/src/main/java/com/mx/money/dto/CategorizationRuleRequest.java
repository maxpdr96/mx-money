package com.mx.money.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorizationRuleRequest {

    @NotBlank(message = "Palavra-chave é obrigatória")
    @Size(max = 120, message = "Palavra-chave deve ter no máximo 120 caracteres")
    private String keyword;

    @NotBlank(message = "Categoria é obrigatória")
    @Size(max = 100, message = "Categoria deve ter no máximo 100 caracteres")
    private String categoryName;

    @Min(value = 1, message = "Prioridade deve ser maior que zero")
    @Max(value = 10000, message = "Prioridade deve ser no máximo 10000")
    @Builder.Default
    private Integer priority = 100;

    @Builder.Default
    private Boolean enabled = true;
}
