package com.mx.money.dto;

import com.mx.money.entity.RecurrenceType;
import com.mx.money.entity.TransactionType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para criação e atualização de transações
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequest {

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    private String description;

    @NotNull(message = "Valor é obrigatório")
    @Positive(message = "Valor deve ser positivo")
    private BigDecimal amount;

    @NotNull(message = "Data efetiva é obrigatória")
    private LocalDate effectiveDate;

    @NotNull(message = "Tipo é obrigatório")
    private TransactionType type;

    private RecurrenceType recurrence;

    private Long categoryId;

    /**
     * Data final para recorrências (opcional, null = infinita)
     */
    private LocalDate endDate;
}
