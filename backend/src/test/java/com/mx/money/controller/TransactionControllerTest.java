package com.mx.money.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mx.money.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mx.money.dto.TransactionRequest;
import com.mx.money.dto.TransactionResponse;
import com.mx.money.entity.RecurrenceType;
import com.mx.money.entity.TransactionType;
import com.mx.money.service.RecurringTransactionService;
import com.mx.money.service.TransactionService;
import jakarta.persistence.EntityNotFoundException;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionController Tests")
class TransactionControllerTest {

    @Mock
    private TransactionService transactionService;

    @Mock
    private RecurringTransactionService recurringTransactionService;

    @InjectMocks
    private TransactionController transactionController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private TransactionRequest transactionRequest;
    private TransactionResponse transactionResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(transactionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        transactionRequest = new TransactionRequest();
        transactionRequest.setDescription("Almoço");
        transactionRequest.setAmount(new BigDecimal("50.00"));
        transactionRequest.setType(TransactionType.EXPENSE);
        transactionRequest.setEffectiveDate(LocalDate.now());
        transactionRequest.setRecurrence(RecurrenceType.NONE);

        transactionResponse = new TransactionResponse();
        transactionResponse.setId(1L);
        transactionResponse.setDescription("Almoço");
        transactionResponse.setAmount(new BigDecimal("50.00"));
        transactionResponse.setType(TransactionType.EXPENSE);
        transactionResponse.setEffectiveDate(LocalDate.now());
    }

    @Nested
    @DisplayName("GET /api/transactions")
    class FindAllTests {

        @Test
        @DisplayName("should return all transactions")
        void shouldReturnAllTransactions() throws Exception {
            // Given
            when(transactionService.findAll()).thenReturn(List.of(transactionResponse));

            // When/Then
            mockMvc.perform(get("/api/transactions"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].description", is("Almoço")));

            verify(transactionService).findAll();
        }

        @Test
        @DisplayName("should return transactions by period when dates provided")
        void shouldReturnTransactionsByPeriod() throws Exception {
            // Given
            LocalDate startDate = LocalDate.of(2024, 1, 1);
            LocalDate endDate = LocalDate.of(2024, 1, 31);
            when(transactionService.findByPeriod(startDate, endDate)).thenReturn(List.of(transactionResponse));

            // When/Then
            mockMvc.perform(get("/api/transactions")
                    .param("startDate", "2024-01-01")
                    .param("endDate", "2024-01-31"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));

            verify(transactionService).findByPeriod(startDate, endDate);
        }

        @Test
        @DisplayName("should return empty list when no transactions exist")
        void shouldReturnEmptyList() throws Exception {
            // Given
            when(transactionService.findAll()).thenReturn(List.of());

            // When/Then
            mockMvc.perform(get("/api/transactions"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/transactions/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("should return transaction when found")
        void shouldReturnTransaction() throws Exception {
            // Given
            when(transactionService.findById(1L)).thenReturn(transactionResponse);

            // When/Then
            mockMvc.perform(get("/api/transactions/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.description", is("Almoço")));
        }

        @Test
        @DisplayName("should return 404 when transaction not found")
        void shouldReturn404WhenNotFound() throws Exception {
            // Given
            when(transactionService.findById(99L)).thenThrow(new EntityNotFoundException("Transação não encontrada"));

            // When/Then
            mockMvc.perform(get("/api/transactions/99"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/transactions")
    class CreateTests {

        @Test
        @DisplayName("should create transaction successfully")
        void shouldCreateTransaction() throws Exception {
            // Given
            when(transactionService.create(any(TransactionRequest.class))).thenReturn(transactionResponse);

            // When/Then
            mockMvc.perform(post("/api/transactions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(transactionRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.description", is("Almoço")));

            verify(transactionService).create(any(TransactionRequest.class));
        }
    }

    @Nested
    @DisplayName("PUT /api/transactions/{id}")
    class UpdateTests {

        @Test
        @DisplayName("should update transaction successfully")
        void shouldUpdateTransaction() throws Exception {
            // Given
            when(transactionService.update(anyLong(), any(TransactionRequest.class))).thenReturn(transactionResponse);

            // When/Then
            mockMvc.perform(put("/api/transactions/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(transactionRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(1)));

            verify(transactionService).update(eq(1L), any(TransactionRequest.class));
        }
    }

    @Nested
    @DisplayName("DELETE /api/transactions/{id}")
    class DeleteTests {

        @Test
        @DisplayName("should delete transaction successfully")
        void shouldDeleteTransaction() throws Exception {
            // Given
            doNothing().when(transactionService).delete(1L);

            // When/Then
            mockMvc.perform(delete("/api/transactions/1"))
                    .andExpect(status().isNoContent());

            verify(transactionService).delete(1L);
        }

        @Test
        @DisplayName("should return 404 when deleting non-existent transaction")
        void shouldReturn404WhenDeletingNonExistent() throws Exception {
            // Given
            doThrow(new EntityNotFoundException("Transação não encontrada")).when(transactionService).delete(99L);

            // When/Then
            mockMvc.perform(delete("/api/transactions/99"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/transactions/generate-recurring")
    class GenerateRecurringTests {

        @Test
        @DisplayName("should generate recurring transactions")
        void shouldGenerateRecurringTransactions() throws Exception {
            // Given
            when(recurringTransactionService.generateRecurringTransactions()).thenReturn(5);

            // When/Then
            mockMvc.perform(post("/api/transactions/generate-recurring"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.generated", is(5)))
                    .andExpect(jsonPath("$.message", containsString("5 transações geradas")));
        }

        @Test
        @DisplayName("should return zero when no pending recurring transactions")
        void shouldReturnZeroWhenNoPending() throws Exception {
            // Given
            when(recurringTransactionService.generateRecurringTransactions()).thenReturn(0);

            // When/Then
            mockMvc.perform(post("/api/transactions/generate-recurring"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.generated", is(0)))
                    .andExpect(jsonPath("$.message", containsString("Nenhuma transação pendente")));
        }
    }
}
