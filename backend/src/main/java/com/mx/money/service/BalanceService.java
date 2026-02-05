package com.mx.money.service;

import com.mx.money.dto.BalanceProjection;
import com.mx.money.dto.BalanceResponse;
import com.mx.money.dto.SimulationResponse;
import com.mx.money.entity.RecurrenceType;
import com.mx.money.entity.Transaction;
import com.mx.money.entity.TransactionType;
import com.mx.money.mapper.TransactionMapper;
import com.mx.money.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BalanceService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;

    /**
     * Calcula o saldo atual (considerando transações até hoje)
     */
    public BalanceResponse getCurrentBalance() {
        LocalDate today = LocalDate.now();
        return getBalanceAsOf(today);
    }

    /**
     * Calcula o saldo em uma data específica
     */
    public BalanceResponse getBalanceAsOf(LocalDate date) {
        BigDecimal totalIncome = transactionRepository.sumIncomeUntilDate(date);
        BigDecimal totalExpense = transactionRepository.sumExpenseUntilDate(date);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        return BalanceResponse.builder()
                .currentBalance(balance)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .asOfDate(date)
                .build();
    }

    /**
     * Projeta o saldo para os próximos N dias
     */
    public List<BalanceProjection> getProjection(int days) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(days);

        // Saldo inicial (até ontem, para começar a projeção de hoje)
        BigDecimal currentBalance = getBalanceAsOf(today.minusDays(1)).getCurrentBalance();

        // Busca transações futuras
        List<Transaction> futureTransactions = transactionRepository
                .findTransactionsInPeriod(today, endDate);

        // Busca transações recorrentes que podem gerar ocorrências futuras
        List<Transaction> recurringTransactions = transactionRepository.findAll().stream()
                .filter(t -> t.getRecurrence() != RecurrenceType.NONE)
                .filter(t -> t.getEffectiveDate().isBefore(endDate) || t.getEffectiveDate().isEqual(endDate))
                .toList();

        // Agrupa transações por data (incluindo recorrências expandidas)
        Map<LocalDate, List<Transaction>> transactionsByDate = new TreeMap<>();

        // Adiciona transações únicas futuras
        for (Transaction t : futureTransactions) {
            if (t.getRecurrence() == RecurrenceType.NONE) {
                transactionsByDate.computeIfAbsent(t.getEffectiveDate(), k -> new ArrayList<>()).add(t);
            }
        }

        // Expande transações recorrentes
        for (Transaction t : recurringTransactions) {
            List<LocalDate> occurrences = expandRecurrence(t, today, endDate);
            for (LocalDate occDate : occurrences) {
                transactionsByDate.computeIfAbsent(occDate, k -> new ArrayList<>()).add(t);
            }
        }

        // Gera projeção dia a dia
        List<BalanceProjection> projections = new ArrayList<>();
        BigDecimal runningBalance = currentBalance;

        for (LocalDate date = today; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<Transaction> dayTransactions = transactionsByDate.getOrDefault(date, Collections.emptyList());

            for (Transaction t : dayTransactions) {
                if (t.getType() == TransactionType.INCOME) {
                    runningBalance = runningBalance.add(t.getAmount());
                } else {
                    runningBalance = runningBalance.subtract(t.getAmount());
                }
            }

            BalanceProjection projection = BalanceProjection.builder()
                    .date(date)
                    .balance(runningBalance)
                    .transactions(transactionMapper.toResponseList(dayTransactions))
                    .build();

            projections.add(projection);
        }

        return projections;
    }

    /**
     * Expande uma transação recorrente para múltiplas ocorrências em um período
     */
    private List<LocalDate> expandRecurrence(Transaction transaction, LocalDate startDate, LocalDate endDate) {
        List<LocalDate> occurrences = new ArrayList<>();
        LocalDate currentDate = transaction.getEffectiveDate();

        // Limita ao endDate da transação se definido
        LocalDate effectiveEndDate = endDate;
        if (transaction.getEndDate() != null && transaction.getEndDate().isBefore(endDate)) {
            effectiveEndDate = transaction.getEndDate();
        }

        while (!currentDate.isAfter(effectiveEndDate)) {
            if (!currentDate.isBefore(startDate)) {
                occurrences.add(currentDate);
            }

            currentDate = switch (transaction.getRecurrence()) {
                case DAILY -> currentDate.plusDays(1);
                case WEEKLY -> currentDate.plusWeeks(1);
                case MONTHLY -> currentDate.plusMonths(1);
                case YEARLY -> currentDate.plusYears(1);
                default -> effectiveEndDate.plusDays(1); // Sai do loop para NONE
            };
        }

        return occurrences;
    }

    /**
     * Simula o impacto de uma compra hipotética no saldo futuro
     * 
     * @param amount      Valor da compra/despesa
     * @param days        Dias de projeção
     * @param recurrence  Tipo de recorrência (NONE, MONTHLY, WEEKLY, DAILY, YEARLY)
     * @param occurrences Número de ocorrências
     */
    public SimulationResponse simulatePurchase(BigDecimal amount, int days, String recurrence, int occurrences) {
        // Obtém projeção normal
        List<BalanceProjection> originalProjections = getProjection(days);
        LocalDate today = LocalDate.now();

        // Calcula as datas de dedução baseado na recorrência
        List<LocalDate> deductionDates = new ArrayList<>();
        RecurrenceType recType = RecurrenceType.valueOf(recurrence.toUpperCase());

        if (recType == RecurrenceType.NONE) {
            // Dedução única no dia de hoje
            deductionDates.add(today);
        } else {
            // Múltiplas deduções conforme recorrência
            LocalDate currentDate = today;
            for (int i = 0; i < occurrences; i++) {
                deductionDates.add(currentDate);
                currentDate = switch (recType) {
                    case DAILY -> currentDate.plusDays(1);
                    case WEEKLY -> currentDate.plusWeeks(1);
                    case MONTHLY -> currentDate.plusMonths(1);
                    case YEARLY -> currentDate.plusYears(1);
                    default -> currentDate;
                };
            }
        }

        // Aplica as deduções cumulativas por data
        List<BalanceProjection> adjustedProjections = new ArrayList<>();

        for (BalanceProjection p : originalProjections) {
            // Conta quantas deduções ocorreram até esta data (inclusive)
            long deductionsUntilDate = deductionDates.stream()
                    .filter(d -> !d.isAfter(p.getDate()))
                    .count();
            BigDecimal cumulativeDeduction = amount.multiply(BigDecimal.valueOf(deductionsUntilDate));

            adjustedProjections.add(BalanceProjection.builder()
                    .date(p.getDate())
                    .balance(p.getBalance().subtract(cumulativeDeduction))
                    .transactions(p.getTransactions())
                    .build());
        }

        // Encontra o primeiro dia com saldo negativo
        boolean goesNegative = false;
        LocalDate negativeDate = null;
        String negativeReason = null;
        BigDecimal minimumBalance = null;
        LocalDate minimumBalanceDate = null;

        for (BalanceProjection projection : adjustedProjections) {
            // Track minimum balance
            if (minimumBalance == null || projection.getBalance().compareTo(minimumBalance) < 0) {
                minimumBalance = projection.getBalance();
                minimumBalanceDate = projection.getDate();
            }

            // Track first negative day
            if (!goesNegative && projection.getBalance().compareTo(BigDecimal.ZERO) < 0) {
                goesNegative = true;
                negativeDate = projection.getDate();

                // Identify the transaction that caused the negative balance
                if (projection.getTransactions() != null && !projection.getTransactions().isEmpty()) {
                    negativeReason = projection.getTransactions().stream()
                            .filter(t -> "EXPENSE".equals(t.getType()))
                            .findFirst()
                            .map(t -> t.getDescription())
                            .orElse(null);
                }

                // If no expense on that day, it's the simulated purchase itself
                if (negativeReason == null) {
                    negativeReason = "Compra simulada";
                }
            }
        }

        // Calcula o valor total simulado
        BigDecimal totalSimulated = amount.multiply(BigDecimal.valueOf(
                recType == RecurrenceType.NONE ? 1 : occurrences));

        return SimulationResponse.builder()
                .simulatedAmount(totalSimulated)
                .projections(adjustedProjections)
                .goesNegative(goesNegative)
                .negativeDate(negativeDate)
                .negativeReason(negativeReason)
                .minimumBalance(minimumBalance)
                .minimumBalanceDate(minimumBalanceDate)
                .build();
    }
}
