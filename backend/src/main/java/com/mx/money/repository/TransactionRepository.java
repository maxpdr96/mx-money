package com.mx.money.repository;

import com.mx.money.entity.Transaction;
import com.mx.money.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Busca transações por período
     */
    List<Transaction> findByEffectiveDateBetweenOrderByEffectiveDateDesc(
            LocalDate startDate, LocalDate endDate);

    /**
     * Busca transações por tipo
     */
    List<Transaction> findByTypeOrderByEffectiveDateDesc(TransactionType type);

    /**
     * Busca transações por categoria
     */
    List<Transaction> findByCategoryIdOrderByEffectiveDateDesc(Long categoryId);

    /**
     * Busca transações até uma determinada data (para cálculo de saldo)
     */
    List<Transaction> findByEffectiveDateLessThanEqual(LocalDate date);

    /**
     * Busca transações em um período específico
     */
    @Query("SELECT t FROM Transaction t WHERE t.effectiveDate >= :startDate AND t.effectiveDate <= :endDate ORDER BY t.effectiveDate ASC")
    List<Transaction> findTransactionsInPeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Soma de receitas até uma data
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = 'INCOME' AND t.effectiveDate <= :date")
    BigDecimal sumIncomeUntilDate(@Param("date") LocalDate date);

    /**
     * Soma de despesas até uma data
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = 'EXPENSE' AND t.effectiveDate <= :date")
    BigDecimal sumExpenseUntilDate(@Param("date") LocalDate date);

    /**
     * Lista todas as transações ordenadas por data
     */
    List<Transaction> findAllByOrderByEffectiveDateDesc();
}
