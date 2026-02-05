package com.mx.money.controller;

import com.mx.money.dto.BalanceProjection;
import com.mx.money.dto.BalanceResponse;
import com.mx.money.dto.SimulationResponse;
import com.mx.money.service.BalanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BalanceController Tests")
class BalanceControllerTest {

    @Mock
    private BalanceService balanceService;

    @InjectMocks
    private BalanceController balanceController;

    private MockMvc mockMvc;
    private BalanceResponse balanceResponse;
    private BalanceProjection balanceProjection;
    private SimulationResponse simulationResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(balanceController).build();

        balanceResponse = BalanceResponse.builder()
                .currentBalance(new BigDecimal("5000.00"))
                .totalIncome(new BigDecimal("10000.00"))
                .totalExpense(new BigDecimal("5000.00"))
                .asOfDate(LocalDate.now())
                .build();

        balanceProjection = BalanceProjection.builder()
                .date(LocalDate.now())
                .balance(new BigDecimal("5000.00"))
                .transactions(List.of())
                .build();

        simulationResponse = SimulationResponse.builder()
                .simulatedAmount(new BigDecimal("1000.00"))
                .projections(List.of(balanceProjection))
                .goesNegative(false)
                .minimumBalance(new BigDecimal("4000.00"))
                .minimumBalanceDate(LocalDate.now().plusDays(5))
                .build();
    }

    @Nested
    @DisplayName("GET /api/balance")
    class GetCurrentBalanceTests {

        @Test
        @DisplayName("should return current balance")
        void shouldReturnCurrentBalance() throws Exception {
            // Given
            when(balanceService.getCurrentBalance()).thenReturn(balanceResponse);

            // When/Then
            mockMvc.perform(get("/api/balance"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.currentBalance", is(5000.0)))
                    .andExpect(jsonPath("$.totalIncome", is(10000.0)))
                    .andExpect(jsonPath("$.totalExpense", is(5000.0)));

            verify(balanceService).getCurrentBalance();
        }

        @Test
        @DisplayName("should return zero balance when no transactions")
        void shouldReturnZeroBalance() throws Exception {
            // Given
            BalanceResponse zeroBalance = BalanceResponse.builder()
                    .currentBalance(BigDecimal.ZERO)
                    .totalIncome(BigDecimal.ZERO)
                    .totalExpense(BigDecimal.ZERO)
                    .asOfDate(LocalDate.now())
                    .build();
            when(balanceService.getCurrentBalance()).thenReturn(zeroBalance);

            // When/Then
            mockMvc.perform(get("/api/balance"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.currentBalance", is(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/balance/as-of")
    class GetBalanceAsOfTests {

        @Test
        @DisplayName("should return balance as of specific date")
        void shouldReturnBalanceAsOfDate() throws Exception {
            // Given
            LocalDate date = LocalDate.of(2024, 6, 15);
            when(balanceService.getBalanceAsOf(date)).thenReturn(balanceResponse);

            // When/Then
            mockMvc.perform(get("/api/balance/as-of")
                    .param("date", "2024-06-15"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.currentBalance", is(5000.0)));

            verify(balanceService).getBalanceAsOf(date);
        }

        @Test
        @DisplayName("should return 400 when date param is missing")
        void shouldReturn400WhenDateMissing() throws Exception {
            // When/Then
            mockMvc.perform(get("/api/balance/as-of"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/balance/projection")
    class GetProjectionTests {

        @Test
        @DisplayName("should return projection for default 30 days")
        void shouldReturnProjectionDefault() throws Exception {
            // Given
            when(balanceService.getProjection(30)).thenReturn(List.of(balanceProjection));

            // When/Then
            mockMvc.perform(get("/api/balance/projection"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].balance", is(5000.0)));

            verify(balanceService).getProjection(30);
        }

        @Test
        @DisplayName("should return projection for custom days")
        void shouldReturnProjectionCustomDays() throws Exception {
            // Given
            when(balanceService.getProjection(60)).thenReturn(List.of(balanceProjection));

            // When/Then
            mockMvc.perform(get("/api/balance/projection")
                    .param("days", "60"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));

            verify(balanceService).getProjection(60);
        }
    }

    @Nested
    @DisplayName("GET /api/balance/simulate")
    class SimulateTests {

        @Test
        @DisplayName("should simulate one-time purchase")
        void shouldSimulateOneTimePurchase() throws Exception {
            // Given
            when(balanceService.simulatePurchase(any(BigDecimal.class), anyInt(), anyString(), anyInt()))
                    .thenReturn(simulationResponse);

            // When/Then
            mockMvc.perform(get("/api/balance/simulate")
                    .param("amount", "1000"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.simulatedAmount", is(1000.0)))
                    .andExpect(jsonPath("$.goesNegative", is(false)));

            verify(balanceService).simulatePurchase(
                    eq(BigDecimal.valueOf(1000.0)),
                    eq(30),
                    eq("NONE"),
                    eq(1));
        }

        @Test
        @DisplayName("should simulate with custom parameters")
        void shouldSimulateWithCustomParams() throws Exception {
            // Given
            when(balanceService.simulatePurchase(any(BigDecimal.class), anyInt(), anyString(), anyInt()))
                    .thenReturn(simulationResponse);

            // When/Then
            mockMvc.perform(get("/api/balance/simulate")
                    .param("amount", "500")
                    .param("days", "365")
                    .param("recurrence", "MONTHLY")
                    .param("occurrences", "12"))
                    .andExpect(status().isOk());

            verify(balanceService).simulatePurchase(
                    eq(BigDecimal.valueOf(500.0)),
                    eq(365),
                    eq("MONTHLY"),
                    eq(12));
        }

        @Test
        @DisplayName("should return simulation showing negative balance")
        void shouldReturnNegativeSimulation() throws Exception {
            // Given
            SimulationResponse negativeResponse = SimulationResponse.builder()
                    .simulatedAmount(new BigDecimal("10000.00"))
                    .projections(List.of())
                    .goesNegative(true)
                    .negativeDate(LocalDate.now().plusDays(5))
                    .negativeReason("Compra simulada")
                    .minimumBalance(new BigDecimal("-2000.00"))
                    .minimumBalanceDate(LocalDate.now().plusDays(10))
                    .build();
            when(balanceService.simulatePurchase(any(BigDecimal.class), anyInt(), anyString(), anyInt()))
                    .thenReturn(negativeResponse);

            // When/Then
            mockMvc.perform(get("/api/balance/simulate")
                    .param("amount", "10000"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.goesNegative", is(true)))
                    .andExpect(jsonPath("$.negativeReason", is("Compra simulada")))
                    .andExpect(jsonPath("$.minimumBalance", is(-2000.0)));
        }

        @Test
        @DisplayName("should return 400 when amount param is missing")
        void shouldReturn400WhenAmountMissing() throws Exception {
            // When/Then
            mockMvc.perform(get("/api/balance/simulate"))
                    .andExpect(status().isBadRequest());
        }
    }
}
