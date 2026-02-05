package com.mx.money.service;

import com.mx.money.dto.BalanceProjection;
import com.mx.money.dto.BalanceResponse;
import com.mx.money.dto.SimulationResponse;

import com.mx.money.entity.RecurrenceType;
import com.mx.money.entity.Transaction;
import com.mx.money.entity.TransactionType;
import com.mx.money.mapper.TransactionMapper;
import com.mx.money.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BalanceService Tests")
class BalanceServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private TransactionMapper transactionMapper;

    @InjectMocks
    private BalanceService balanceService;

    private Transaction incomeTransaction;
    private Transaction expenseTransaction;
    private Transaction recurringExpense;

    @BeforeEach
    void setUp() {
        incomeTransaction = new Transaction();
        incomeTransaction.setId(1L);
        incomeTransaction.setDescription("Salário");
        incomeTransaction.setAmount(new BigDecimal("5000.00"));
        incomeTransaction.setType(TransactionType.INCOME);
        incomeTransaction.setEffectiveDate(LocalDate.now());
        incomeTransaction.setRecurrence(RecurrenceType.NONE);

        expenseTransaction = new Transaction();
        expenseTransaction.setId(2L);
        expenseTransaction.setDescription("Aluguel");
        expenseTransaction.setAmount(new BigDecimal("1500.00"));
        expenseTransaction.setType(TransactionType.EXPENSE);
        expenseTransaction.setEffectiveDate(LocalDate.now());
        expenseTransaction.setRecurrence(RecurrenceType.NONE);

        recurringExpense = new Transaction();
        recurringExpense.setId(3L);
        recurringExpense.setDescription("Netflix");
        recurringExpense.setAmount(new BigDecimal("50.00"));
        recurringExpense.setType(TransactionType.EXPENSE);
        recurringExpense.setEffectiveDate(LocalDate.now().minusMonths(6));
        recurringExpense.setRecurrence(RecurrenceType.MONTHLY);
    }

    @Nested
    @DisplayName("getCurrentBalance")
    class GetCurrentBalanceTests {

        @Test
        @DisplayName("should calculate current balance correctly")
        void shouldCalculateCurrentBalance() {
            // Given
            LocalDate today = LocalDate.now();
            when(transactionRepository.sumIncomeUntilDate(today)).thenReturn(new BigDecimal("10000.00"));
            when(transactionRepository.sumExpenseUntilDate(today)).thenReturn(new BigDecimal("3000.00"));

            // When
            BalanceResponse result = balanceService.getCurrentBalance();

            // Then
            assertThat(result.getCurrentBalance()).isEqualByComparingTo("7000.00");
            assertThat(result.getTotalIncome()).isEqualByComparingTo("10000.00");
            assertThat(result.getTotalExpense()).isEqualByComparingTo("3000.00");
            assertThat(result.getAsOfDate()).isEqualTo(today);
        }

        @Test
        @DisplayName("should return zero balance when no transactions exist")
        void shouldReturnZeroWhenNoTransactions() {
            // Given
            LocalDate today = LocalDate.now();
            when(transactionRepository.sumIncomeUntilDate(today)).thenReturn(BigDecimal.ZERO);
            when(transactionRepository.sumExpenseUntilDate(today)).thenReturn(BigDecimal.ZERO);

            // When
            BalanceResponse result = balanceService.getCurrentBalance();

            // Then
            assertThat(result.getCurrentBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("should return negative balance when expenses exceed income")
        void shouldReturnNegativeBalance() {
            // Given
            LocalDate today = LocalDate.now();
            when(transactionRepository.sumIncomeUntilDate(today)).thenReturn(new BigDecimal("1000.00"));
            when(transactionRepository.sumExpenseUntilDate(today)).thenReturn(new BigDecimal("2500.00"));

            // When
            BalanceResponse result = balanceService.getCurrentBalance();

            // Then
            assertThat(result.getCurrentBalance()).isEqualByComparingTo("-1500.00");
        }
    }

    @Nested
    @DisplayName("getBalanceAsOf")
    class GetBalanceAsOfTests {

        @Test
        @DisplayName("should calculate balance as of specific date")
        void shouldCalculateBalanceAsOfDate() {
            // Given
            LocalDate pastDate = LocalDate.of(2024, 6, 15);
            when(transactionRepository.sumIncomeUntilDate(pastDate)).thenReturn(new BigDecimal("8000.00"));
            when(transactionRepository.sumExpenseUntilDate(pastDate)).thenReturn(new BigDecimal("5000.00"));

            // When
            BalanceResponse result = balanceService.getBalanceAsOf(pastDate);

            // Then
            assertThat(result.getCurrentBalance()).isEqualByComparingTo("3000.00");
            assertThat(result.getAsOfDate()).isEqualTo(pastDate);
        }
    }

    @Nested
    @DisplayName("getProjection")
    class GetProjectionTests {

        @Test
        @DisplayName("should generate projection for specified days")
        void shouldGenerateProjection() {
            // Given
            int days = 30;
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            LocalDate endDate = today.plusDays(days);

            when(transactionRepository.sumIncomeUntilDate(yesterday)).thenReturn(new BigDecimal("5000.00"));
            when(transactionRepository.sumExpenseUntilDate(yesterday)).thenReturn(new BigDecimal("2000.00"));
            when(transactionRepository.findTransactionsInPeriod(today, endDate)).thenReturn(List.of());
            when(transactionRepository.findAll()).thenReturn(List.of());
            when(transactionMapper.toResponseList(anyList())).thenReturn(List.of());

            // When
            List<BalanceProjection> result = balanceService.getProjection(days);

            // Then
            assertThat(result).hasSize(days + 1);
            assertThat(result.get(0).getDate()).isEqualTo(today);
            assertThat(result.get(0).getBalance()).isEqualByComparingTo("3000.00");
        }

        @Test
        @DisplayName("should include future transactions in projection")
        void shouldIncludeFutureTransactions() {
            // Given
            int days = 30;
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            LocalDate endDate = today.plusDays(days);

            Transaction futureIncome = new Transaction();
            futureIncome.setId(10L);
            futureIncome.setDescription("Bônus");
            futureIncome.setAmount(new BigDecimal("2000.00"));
            futureIncome.setType(TransactionType.INCOME);
            futureIncome.setEffectiveDate(today.plusDays(5));
            futureIncome.setRecurrence(RecurrenceType.NONE);

            when(transactionRepository.sumIncomeUntilDate(yesterday)).thenReturn(new BigDecimal("5000.00"));
            when(transactionRepository.sumExpenseUntilDate(yesterday)).thenReturn(new BigDecimal("2000.00"));
            when(transactionRepository.findTransactionsInPeriod(today, endDate)).thenReturn(List.of(futureIncome));
            when(transactionRepository.findAll()).thenReturn(List.of());
            when(transactionMapper.toResponseList(anyList())).thenReturn(List.of());

            // When
            List<BalanceProjection> result = balanceService.getProjection(days);

            // Then
            assertThat(result).isNotEmpty();
            // Balance on day 5 should include the bonus
            BalanceProjection day5 = result.stream()
                    .filter(p -> p.getDate().equals(today.plusDays(5)))
                    .findFirst()
                    .orElseThrow();
            assertThat(day5.getBalance()).isEqualByComparingTo("5000.00");
        }

        @Test
        @DisplayName("should expand recurring transactions in projection")
        void shouldExpandRecurringTransactions() {
            // Given
            int days = 60;
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            LocalDate endDate = today.plusDays(days);

            when(transactionRepository.sumIncomeUntilDate(yesterday)).thenReturn(new BigDecimal("10000.00"));
            when(transactionRepository.sumExpenseUntilDate(yesterday)).thenReturn(new BigDecimal("5000.00"));
            when(transactionRepository.findTransactionsInPeriod(today, endDate)).thenReturn(List.of());
            when(transactionRepository.findAll()).thenReturn(List.of(recurringExpense));
            when(transactionMapper.toResponseList(anyList())).thenReturn(List.of());

            // When
            List<BalanceProjection> result = balanceService.getProjection(days);

            // Then
            assertThat(result).isNotEmpty();
            // Initial balance is 5000, recurring expense should reduce it over time
            BalanceProjection lastDay = result.get(result.size() - 1);
            assertThat(lastDay.getBalance()).isLessThan(new BigDecimal("5000.00"));
        }
    }

    @Nested
    @DisplayName("simulatePurchase")
    class SimulatePurchaseTests {

        @Test
        @DisplayName("should simulate one-time purchase")
        void shouldSimulateOneTimePurchase() {
            // Given
            int days = 30;
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            LocalDate endDate = today.plusDays(days);
            BigDecimal purchaseAmount = new BigDecimal("1000.00");

            when(transactionRepository.sumIncomeUntilDate(yesterday)).thenReturn(new BigDecimal("5000.00"));
            when(transactionRepository.sumExpenseUntilDate(yesterday)).thenReturn(new BigDecimal("2000.00"));
            when(transactionRepository.findTransactionsInPeriod(today, endDate)).thenReturn(List.of());
            when(transactionRepository.findAll()).thenReturn(List.of());
            when(transactionMapper.toResponseList(anyList())).thenReturn(List.of());

            // When
            SimulationResponse result = balanceService.simulatePurchase(purchaseAmount, days, "NONE", 1);

            // Then
            assertThat(result.getSimulatedAmount()).isEqualByComparingTo("1000.00");
            assertThat(result.isGoesNegative()).isFalse();
            assertThat(result.getProjections()).hasSize(days + 1);
            // Balance should be reduced by purchase amount (3000 - 1000 = 2000)
            assertThat(result.getProjections().get(0).getBalance()).isEqualByComparingTo("2000.00");
        }

        @Test
        @DisplayName("should detect when balance goes negative")
        void shouldDetectNegativeBalance() {
            // Given
            int days = 30;
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            LocalDate endDate = today.plusDays(days);
            BigDecimal purchaseAmount = new BigDecimal("4000.00");

            when(transactionRepository.sumIncomeUntilDate(yesterday)).thenReturn(new BigDecimal("5000.00"));
            when(transactionRepository.sumExpenseUntilDate(yesterday)).thenReturn(new BigDecimal("2000.00"));
            when(transactionRepository.findTransactionsInPeriod(today, endDate)).thenReturn(List.of());
            when(transactionRepository.findAll()).thenReturn(List.of());
            when(transactionMapper.toResponseList(anyList())).thenReturn(List.of());

            // When
            SimulationResponse result = balanceService.simulatePurchase(purchaseAmount, days, "NONE", 1);

            // Then
            assertThat(result.isGoesNegative()).isTrue();
            assertThat(result.getNegativeDate()).isNotNull();
            assertThat(result.getNegativeReason()).isEqualTo("Compra simulada");
        }

        @ParameterizedTest
        @DisplayName("should simulate recurring purchases")
        @CsvSource({
                "MONTHLY, 12, 1200.00",
                "WEEKLY, 4, 400.00",
                "DAILY, 10, 1000.00"
        })
        void shouldSimulateRecurringPurchases(String recurrence, int occurrences, String expectedTotal) {
            // Given
            int days = 365;
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            LocalDate endDate = today.plusDays(days);
            BigDecimal purchaseAmount = new BigDecimal("100.00");

            when(transactionRepository.sumIncomeUntilDate(yesterday)).thenReturn(new BigDecimal("50000.00"));
            when(transactionRepository.sumExpenseUntilDate(yesterday)).thenReturn(new BigDecimal("10000.00"));
            when(transactionRepository.findTransactionsInPeriod(today, endDate)).thenReturn(List.of());
            when(transactionRepository.findAll()).thenReturn(List.of());
            when(transactionMapper.toResponseList(anyList())).thenReturn(List.of());

            // When
            SimulationResponse result = balanceService.simulatePurchase(purchaseAmount, days, recurrence, occurrences);

            // Then
            assertThat(result.getSimulatedAmount()).isEqualByComparingTo(expectedTotal);
        }

        @Test
        @DisplayName("should track minimum balance correctly")
        void shouldTrackMinimumBalance() {
            // Given
            int days = 30;
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            LocalDate endDate = today.plusDays(days);
            BigDecimal purchaseAmount = new BigDecimal("500.00");

            when(transactionRepository.sumIncomeUntilDate(yesterday)).thenReturn(new BigDecimal("3000.00"));
            when(transactionRepository.sumExpenseUntilDate(yesterday)).thenReturn(new BigDecimal("1000.00"));
            when(transactionRepository.findTransactionsInPeriod(today, endDate)).thenReturn(List.of());
            when(transactionRepository.findAll()).thenReturn(List.of());
            when(transactionMapper.toResponseList(anyList())).thenReturn(List.of());

            // When
            SimulationResponse result = balanceService.simulatePurchase(purchaseAmount, days, "NONE", 1);

            // Then
            assertThat(result.getMinimumBalance()).isNotNull();
            assertThat(result.getMinimumBalanceDate()).isNotNull();
            // Minimum balance should be 2000 - 500 = 1500
            assertThat(result.getMinimumBalance()).isEqualByComparingTo("1500.00");
        }

        @Test
        @DisplayName("should simulate monthly recurring expense correctly")
        void shouldSimulateMonthlyRecurringExpenseCorrectly() {
            // Given
            int days = 365;
            LocalDate today = LocalDate.now();
            LocalDate yesterday = today.minusDays(1);
            LocalDate endDate = today.plusDays(days);
            BigDecimal monthlyAmount = new BigDecimal("500.00");
            int months = 12;

            when(transactionRepository.sumIncomeUntilDate(yesterday)).thenReturn(new BigDecimal("10000.00"));
            when(transactionRepository.sumExpenseUntilDate(yesterday)).thenReturn(new BigDecimal("2000.00"));
            when(transactionRepository.findTransactionsInPeriod(today, endDate)).thenReturn(List.of());
            when(transactionRepository.findAll()).thenReturn(List.of());
            when(transactionMapper.toResponseList(anyList())).thenReturn(List.of());

            // When
            SimulationResponse result = balanceService.simulatePurchase(monthlyAmount, days, "MONTHLY", months);

            // Then
            assertThat(result.getSimulatedAmount()).isEqualByComparingTo("6000.00"); // 500 * 12
            // After 12 months: 8000 (initial) - 6000 (total simulated) = 2000
            BalanceProjection lastMonth = result.getProjections().get(result.getProjections().size() - 1);
            assertThat(lastMonth.getBalance()).isEqualByComparingTo("2000.00");
        }
    }
}
