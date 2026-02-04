package com.mx.money.service;

import com.mx.money.entity.RecurrenceType;
import com.mx.money.entity.Transaction;
import com.mx.money.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Serviço responsável por gerar transações a partir de recorrências
 */
@Service
@RequiredArgsConstructor
public class RecurringTransactionService {

    private static final Logger log = LoggerFactory.getLogger(RecurringTransactionService.class);

    private final TransactionRepository transactionRepository;

    /**
     * Executa diariamente à meia-noite para gerar transações recorrentes
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduledGeneration() {
        log.info("Starting scheduled recurring transaction generation...");
        int count = generateRecurringTransactions();
        log.info("Generated {} recurring transactions", count);
    }

    /**
     * Gera transações para todas as recorrências que já venceram
     * 
     * @return Número de transações geradas
     */
    @Transactional
    public int generateRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<Transaction> recurring = transactionRepository.findAll().stream()
                .filter(t -> t.getRecurrence() != RecurrenceType.NONE)
                .toList();

        List<Transaction> toCreate = new ArrayList<>();

        for (Transaction template : recurring) {
            List<LocalDate> newDates = getNewOccurrences(template, today);

            for (LocalDate date : newDates) {
                Transaction generated = Transaction.builder()
                        .description(template.getDescription())
                        .amount(template.getAmount())
                        .effectiveDate(date)
                        .type(template.getType())
                        .recurrence(RecurrenceType.NONE) // Transação gerada não é recorrente
                        .category(template.getCategory())
                        .parentRecurringId(template.getId())
                        .build();
                toCreate.add(generated);
            }

            // Atualiza lastGeneratedDate no template
            if (!newDates.isEmpty()) {
                template.setLastGeneratedDate(newDates.getLast());
                transactionRepository.save(template);
            }
        }

        if (!toCreate.isEmpty()) {
            transactionRepository.saveAll(toCreate);
            log.info("Generated {} transactions from recurring templates", toCreate.size());
        }

        return toCreate.size();
    }

    /**
     * Calcula as datas de ocorrência que precisam ser geradas
     */
    private List<LocalDate> getNewOccurrences(Transaction template, LocalDate upToDate) {
        List<LocalDate> occurrences = new ArrayList<>();

        // Se a recorrência já expirou, não gera nada
        if (template.getEndDate() != null && template.getEndDate().isBefore(upToDate)) {
            upToDate = template.getEndDate();
        }

        // Começar de onde paramos, ou da PRÓXIMA ocorrência se nunca geramos
        // (a effectiveDate já é coberta pelo próprio template)
        LocalDate startFrom = template.getLastGeneratedDate() != null
                ? getNextOccurrence(template.getLastGeneratedDate(), template.getRecurrence())
                : getNextOccurrence(template.getEffectiveDate(), template.getRecurrence());

        LocalDate current = startFrom;

        // Gera ocorrências até a data limite (inclusive)
        while (!current.isAfter(upToDate)) {
            // Verifica se está dentro do período válido
            if (template.getEndDate() == null || !current.isAfter(template.getEndDate())) {
                occurrences.add(current);
            }
            current = getNextOccurrence(current, template.getRecurrence());
        }

        return occurrences;
    }

    /**
     * Calcula a próxima data de ocorrência baseado no tipo de recorrência
     */
    private LocalDate getNextOccurrence(LocalDate from, RecurrenceType recurrence) {
        return switch (recurrence) {
            case DAILY -> from.plusDays(1);
            case WEEKLY -> from.plusWeeks(1);
            case MONTHLY -> from.plusMonths(1);
            case YEARLY -> from.plusYears(1);
            default -> from.plusYears(100); // Nunca ocorre
        };
    }
}
