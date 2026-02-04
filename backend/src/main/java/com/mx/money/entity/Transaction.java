package com.mx.money.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Representa uma transação financeira (receita ou despesa)
 */
@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    /**
     * Valor da transação.
     * Positivo = receita, Negativo = despesa (internamente sempre armazenado como
     * positivo)
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    /**
     * Data em que a transação afeta o saldo
     */
    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RecurrenceType recurrence = RecurrenceType.NONE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    /**
     * Para transações recorrentes: última data em que ocorrências foram geradas
     */
    @Column(name = "last_generated_date")
    private LocalDate lastGeneratedDate;

    /**
     * Data final para transações recorrentes (após esta data, não gera mais
     * ocorrências).
     * Se null, a recorrência é infinita.
     */
    @Column(name = "end_date")
    private LocalDate endDate;

    /**
     * ID da transação recorrente que originou esta transação (se gerada
     * automaticamente)
     */
    @Column(name = "parent_recurring_id")
    private Long parentRecurringId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Retorna o valor com sinal: positivo para receita, negativo para despesa
     */
    public BigDecimal getSignedAmount() {
        return type == TransactionType.INCOME ? amount : amount.negate();
    }
}
