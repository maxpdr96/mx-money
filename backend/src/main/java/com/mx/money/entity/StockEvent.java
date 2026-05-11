package com.mx.money.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockEventType type;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    // BUY/SELL: número de ações; BONUS: ações bonificadas recebidas
    @Column(precision = 15, scale = 4)
    private BigDecimal quantity;

    // BUY/SELL: preço por ação; BONUS: valor patrimonial declarado por ação
    @Column(name = "unit_price", precision = 15, scale = 6)
    private BigDecimal unitPrice;

    // BUY/SELL: corretagem e taxas
    @Column(precision = 15, scale = 2)
    private BigDecimal fees;

    // SPLIT: fator de desdobramento (ex: 2.0 = 1 ação vira 2)
    @Column(name = "split_ratio", precision = 15, scale = 8)
    private BigDecimal splitRatio;

    // DIVIDEND/JCP: valor total recebido (bruto para JCP)
    @Column(name = "total_value", precision = 15, scale = 2)
    private BigDecimal totalValue;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
