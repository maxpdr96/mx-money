package com.mx.money.service;

import com.mx.money.dto.TransactionRequest;
import com.mx.money.dto.TransactionResponse;
import com.mx.money.entity.Category;
import com.mx.money.entity.RecurrenceType;
import com.mx.money.entity.Transaction;
import com.mx.money.entity.TransactionType;
import com.mx.money.mapper.TransactionMapper;
import com.mx.money.repository.TransactionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionService Tests")
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private TransactionMapper transactionMapper;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private TransactionService transactionService;

    private Transaction transaction;
    private TransactionRequest transactionRequest;
    private TransactionResponse transactionResponse;
    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Alimentação");

        transaction = new Transaction();
        transaction.setId(1L);
        transaction.setDescription("Almoço");
        transaction.setAmount(new BigDecimal("50.00"));
        transaction.setType(TransactionType.EXPENSE);
        transaction.setEffectiveDate(LocalDate.now());
        transaction.setRecurrence(RecurrenceType.NONE);
        transaction.setCategory(category);

        transactionRequest = new TransactionRequest();
        transactionRequest.setDescription("Almoço");
        transactionRequest.setAmount(new BigDecimal("50.00"));
        transactionRequest.setType(TransactionType.EXPENSE);
        transactionRequest.setEffectiveDate(LocalDate.now());
        transactionRequest.setCategoryId(1L);

        transactionResponse = new TransactionResponse();
        transactionResponse.setId(1L);
        transactionResponse.setDescription("Almoço");
        transactionResponse.setAmount(new BigDecimal("50.00"));
        transactionResponse.setType(TransactionType.EXPENSE);
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("should return all transactions ordered by date")
        void shouldReturnAllTransactions() {
            // Given
            List<Transaction> transactions = List.of(transaction);
            List<TransactionResponse> responses = List.of(transactionResponse);
            when(transactionRepository.findAllByOrderByEffectiveDateDesc()).thenReturn(transactions);
            when(transactionMapper.toResponseList(anyList())).thenReturn(responses);

            // When
            List<TransactionResponse> result = transactionService.findAll();

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getDescription()).isEqualTo("Almoço");
            verify(transactionRepository).findAllByOrderByEffectiveDateDesc();
            verify(transactionMapper).toResponseList(transactions);
        }

        @Test
        @DisplayName("should return empty list when no transactions exist")
        void shouldReturnEmptyList() {
            // Given
            when(transactionRepository.findAllByOrderByEffectiveDateDesc()).thenReturn(List.of());
            when(transactionMapper.toResponseList(anyList())).thenReturn(List.of());

            // When
            List<TransactionResponse> result = transactionService.findAll();

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findByPeriod")
    class FindByPeriodTests {

        @Test
        @DisplayName("should return transactions within period")
        void shouldReturnTransactionsWithinPeriod() {
            // Given
            LocalDate startDate = LocalDate.of(2024, 1, 1);
            LocalDate endDate = LocalDate.of(2024, 1, 31);
            List<Transaction> transactions = List.of(transaction);
            List<TransactionResponse> responses = List.of(transactionResponse);

            when(transactionRepository.findByEffectiveDateBetweenOrderByEffectiveDateDesc(startDate, endDate))
                    .thenReturn(transactions);
            when(transactionMapper.toResponseList(anyList())).thenReturn(responses);

            // When
            List<TransactionResponse> result = transactionService.findByPeriod(startDate, endDate);

            // Then
            assertThat(result).hasSize(1);
            verify(transactionRepository).findByEffectiveDateBetweenOrderByEffectiveDateDesc(startDate, endDate);
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("should return transaction when found")
        void shouldReturnTransactionWhenFound() {
            // Given
            when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
            when(transactionMapper.toResponse(transaction)).thenReturn(transactionResponse);

            // When
            TransactionResponse result = transactionService.findById(1L);

            // Then
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getDescription()).isEqualTo("Almoço");
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when not found")
        void shouldThrowExceptionWhenNotFound() {
            // Given
            when(transactionRepository.findById(99L)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> transactionService.findById(99L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("should create transaction with category")
        void shouldCreateTransactionWithCategory() {
            // Given
            when(transactionMapper.toEntity(transactionRequest)).thenReturn(transaction);
            when(categoryService.findEntityById(1L)).thenReturn(category);
            when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);
            when(transactionMapper.toResponse(transaction)).thenReturn(transactionResponse);

            // When
            TransactionResponse result = transactionService.create(transactionRequest);

            // Then
            assertThat(result.getDescription()).isEqualTo("Almoço");
            verify(categoryService).findEntityById(1L);
            verify(transactionRepository).save(any(Transaction.class));
        }

        @Test
        @DisplayName("should create transaction without category")
        void shouldCreateTransactionWithoutCategory() {
            // Given
            transactionRequest.setCategoryId(null);
            when(transactionMapper.toEntity(transactionRequest)).thenReturn(transaction);
            when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);
            when(transactionMapper.toResponse(transaction)).thenReturn(transactionResponse);

            // When
            TransactionResponse result = transactionService.create(transactionRequest);

            // Then
            assertThat(result).isNotNull();
            verify(categoryService, never()).findEntityById(anyLong());
        }

        @Test
        @DisplayName("should set default recurrence to NONE when null")
        void shouldSetDefaultRecurrenceWhenNull() {
            // Given
            transactionRequest.setRecurrence(null);
            transaction.setRecurrence(null);
            when(transactionMapper.toEntity(transactionRequest)).thenReturn(transaction);
            when(categoryService.findEntityById(1L)).thenReturn(category);
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
                Transaction t = inv.getArgument(0);
                assertThat(t.getRecurrence()).isEqualTo(RecurrenceType.NONE);
                return t;
            });
            when(transactionMapper.toResponse(any(Transaction.class))).thenReturn(transactionResponse);

            // When
            transactionService.create(transactionRequest);

            // Then
            verify(transactionRepository).save(argThat(t -> t.getRecurrence() == RecurrenceType.NONE));
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("should update existing transaction")
        void shouldUpdateExistingTransaction() {
            // Given
            when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
            when(categoryService.findEntityById(1L)).thenReturn(category);
            when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);
            when(transactionMapper.toResponse(transaction)).thenReturn(transactionResponse);

            // When
            TransactionResponse result = transactionService.update(1L, transactionRequest);

            // Then
            assertThat(result).isNotNull();
            verify(transactionMapper).updateEntity(transactionRequest, transaction);
            verify(transactionRepository).save(transaction);
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when updating non-existent transaction")
        void shouldThrowExceptionWhenUpdatingNonExistent() {
            // Given
            when(transactionRepository.findById(99L)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> transactionService.update(99L, transactionRequest))
                    .isInstanceOf(EntityNotFoundException.class);
        }

        @Test
        @DisplayName("should remove category when categoryId is null")
        void shouldRemoveCategoryWhenNull() {
            // Given
            transactionRequest.setCategoryId(null);
            when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
                Transaction t = inv.getArgument(0);
                assertThat(t.getCategory()).isNull();
                return t;
            });
            when(transactionMapper.toResponse(any(Transaction.class))).thenReturn(transactionResponse);

            // When
            transactionService.update(1L, transactionRequest);

            // Then
            verify(categoryService, never()).findEntityById(anyLong());
        }
    }

    @Nested
    @DisplayName("delete")
    class DeleteTests {

        @Test
        @DisplayName("should delete existing transaction")
        void shouldDeleteExistingTransaction() {
            // Given
            when(transactionRepository.existsById(1L)).thenReturn(true);

            // When
            transactionService.delete(1L);

            // Then
            verify(transactionRepository).deleteById(1L);
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when deleting non-existent transaction")
        void shouldThrowExceptionWhenDeletingNonExistent() {
            // Given
            when(transactionRepository.existsById(99L)).thenReturn(false);

            // When/Then
            assertThatThrownBy(() -> transactionService.delete(99L))
                    .isInstanceOf(EntityNotFoundException.class);
            verify(transactionRepository, never()).deleteById(anyLong());
        }
    }
}
