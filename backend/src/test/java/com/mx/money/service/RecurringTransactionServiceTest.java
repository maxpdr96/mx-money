package com.mx.money.service;

import com.mx.money.entity.RecurrenceType;
import com.mx.money.entity.Transaction;
import com.mx.money.entity.TransactionType;
import com.mx.money.repository.TransactionRepository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecurringTransactionService Tests")
class RecurringTransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private RecurringTransactionService recurringTransactionService;

    @Captor
    private ArgumentCaptor<List<Transaction>> transactionsCaptor;

    @Nested
    @DisplayName("generateRecurringTransactions")
    class GenerateRecurringTransactionsTests {

        @Test
        @DisplayName("should return zero when no recurring transactions exist")
        void shouldReturnZeroWhenNoRecurring() {
            // Given
            when(transactionRepository.findAll()).thenReturn(List.of());

            // When
            int count = recurringTransactionService.generateRecurringTransactions();

            // Then
            assertThat(count).isZero();
            verify(transactionRepository, never()).saveAll(anyList());
        }

        @Test
        @DisplayName("should return zero when no pending occurrences")
        void shouldReturnZeroWhenNoPending() {
            // Given - transaction with lastGeneratedDate = today (nothing pending)
            Transaction upToDate = Transaction.builder()
                    .id(1L)
                    .description("Monthly")
                    .amount(new BigDecimal("100.00"))
                    .type(TransactionType.EXPENSE)
                    .effectiveDate(LocalDate.now().minusMonths(1))
                    .recurrence(RecurrenceType.MONTHLY)
                    .lastGeneratedDate(LocalDate.now()) // Already generated today
                    .build();
            when(transactionRepository.findAll()).thenReturn(List.of(upToDate));

            // When
            int count = recurringTransactionService.generateRecurringTransactions();

            // Then
            assertThat(count).isZero();
        }

        @Test
        @DisplayName("should generate monthly recurring transaction")
        void shouldGenerateMonthlyRecurring() {
            // Given - monthly that should generate today
            Transaction monthly = Transaction.builder()
                    .id(1L)
                    .description("Netflix")
                    .amount(new BigDecimal("50.00"))
                    .type(TransactionType.EXPENSE)
                    .effectiveDate(LocalDate.now().minusMonths(2))
                    .recurrence(RecurrenceType.MONTHLY)
                    .lastGeneratedDate(LocalDate.now().minusMonths(1).minusDays(1))
                    .build();
            when(transactionRepository.findAll()).thenReturn(List.of(monthly));

            // When
            int count = recurringTransactionService.generateRecurringTransactions();

            // Then
            assertThat(count).isGreaterThanOrEqualTo(1);
            verify(transactionRepository).saveAll(transactionsCaptor.capture());
            List<Transaction> savedTransactions = transactionsCaptor.getValue();
            assertThat(savedTransactions).isNotEmpty();
            assertThat(savedTransactions.get(0).getDescription()).isEqualTo("Netflix");
            assertThat(savedTransactions.get(0).getRecurrence()).isEqualTo(RecurrenceType.NONE);
        }

        @Test
        @DisplayName("should set parentRecurringId on generated transactions")
        void shouldSetParentRecurringId() {
            // Given
            Transaction recurring = Transaction.builder()
                    .id(99L)
                    .description("Salário")
                    .amount(new BigDecimal("5000.00"))
                    .type(TransactionType.INCOME)
                    .effectiveDate(LocalDate.now().minusMonths(2))
                    .recurrence(RecurrenceType.MONTHLY)
                    .lastGeneratedDate(LocalDate.now().minusMonths(1).minusDays(1))
                    .build();
            when(transactionRepository.findAll()).thenReturn(List.of(recurring));

            // When
            recurringTransactionService.generateRecurringTransactions();

            // Then
            verify(transactionRepository).saveAll(transactionsCaptor.capture());
            List<Transaction> savedTransactions = transactionsCaptor.getValue();
            if (!savedTransactions.isEmpty()) {
                assertThat(savedTransactions.get(0).getParentRecurringId()).isEqualTo(99L);
            }
        }

        @Test
        @DisplayName("should not generate transactions past end date")
        void shouldNotGeneratePastEndDate() {
            // Given - recurring that ended yesterday
            Transaction expired = Transaction.builder()
                    .id(1L)
                    .description("Expired")
                    .amount(new BigDecimal("100.00"))
                    .type(TransactionType.EXPENSE)
                    .effectiveDate(LocalDate.now().minusMonths(3))
                    .recurrence(RecurrenceType.MONTHLY)
                    .endDate(LocalDate.now().minusDays(1)) // Expired yesterday
                    .lastGeneratedDate(LocalDate.now().minusMonths(1))
                    .build();
            when(transactionRepository.findAll()).thenReturn(List.of(expired));

            // When
            int count = recurringTransactionService.generateRecurringTransactions();

            // Then
            assertThat(count).isZero();
        }

        @Test
        @DisplayName("should update lastGeneratedDate on template after generation")
        void shouldUpdateLastGeneratedDate() {
            // Given
            Transaction recurring = Transaction.builder()
                    .id(1L)
                    .description("Monthly")
                    .amount(new BigDecimal("100.00"))
                    .type(TransactionType.EXPENSE)
                    .effectiveDate(LocalDate.now().minusMonths(2))
                    .recurrence(RecurrenceType.MONTHLY)
                    .lastGeneratedDate(LocalDate.now().minusMonths(1).minusDays(1))
                    .build();
            when(transactionRepository.findAll()).thenReturn(List.of(recurring));

            // When
            recurringTransactionService.generateRecurringTransactions();

            // Then
            verify(transactionRepository).save(any(Transaction.class));
        }

        @Test
        @DisplayName("should skip non-recurring transactions")
        void shouldSkipNonRecurring() {
            // Given
            Transaction oneTime = Transaction.builder()
                    .id(1L)
                    .description("One-time purchase")
                    .amount(new BigDecimal("50.00"))
                    .type(TransactionType.EXPENSE)
                    .effectiveDate(LocalDate.now())
                    .recurrence(RecurrenceType.NONE)
                    .build();
            when(transactionRepository.findAll()).thenReturn(List.of(oneTime));

            // When
            int count = recurringTransactionService.generateRecurringTransactions();

            // Then
            assertThat(count).isZero();
            verify(transactionRepository, never()).saveAll(anyList());
        }
    }
}
