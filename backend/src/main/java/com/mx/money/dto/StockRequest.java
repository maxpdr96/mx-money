package com.mx.money.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockRequest {

    @NotBlank(message = "Ticker é obrigatório")
    @Size(max = 10, message = "Ticker deve ter no máximo 10 caracteres")
    private String ticker;

    @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
    private String name;

    @Size(max = 100, message = "Setor deve ter no máximo 100 caracteres")
    private String sector;

    @Size(max = 20, message = "CNPJ deve ter no máximo 20 caracteres")
    private String cnpj;

    @Size(max = 500, message = "Observações devem ter no máximo 500 caracteres")
    private String notes;
}
