package com.mx.money.dto;

import com.mx.money.entity.StockEventType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockEventRequest {

    @NotNull(message = "Tipo é obrigatório")
    private StockEventType type;

    @NotNull(message = "Data é obrigatória")
    private LocalDate eventDate;

    // BUY/SELL: quantidade de ações; BONUS: ações bonificadas
    private BigDecimal quantity;

    // BUY/SELL: preço por ação; BONUS: valor patrimonial por ação
    private BigDecimal unitPrice;

    // BUY/SELL: corretagem e taxas
    private BigDecimal fees;

    // SPLIT: fator (ex: 2.0 para desdobramento 1:2)
    private BigDecimal splitRatio;

    // DIVIDEND/JCP: valor total recebido (sempre armazenado como bruto)
    private BigDecimal totalValue;

    // JCP: se true, totalValue é o valor líquido recebido — backend converte para bruto (÷ 0.825)
    private Boolean jcpValueIsNet;

    private String notes;
}
