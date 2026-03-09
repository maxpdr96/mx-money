package com.mx.money.service;

import com.mx.money.dto.CategorizationRuleRequest;
import com.mx.money.dto.CategorizationRuleResponse;
import com.mx.money.entity.CategorizationRule;
import com.mx.money.repository.CategorizationRuleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategorizationRuleService Tests")
class CategorizationRuleServiceTest {

    @Mock
    private CategorizationRuleRepository repository;

    @InjectMocks
    private CategorizationRuleService service;

    @Test
    @DisplayName("should match category ignoring accents and case")
    void shouldMatchIgnoringAccentsAndCase() {
        CategorizationRule rule = CategorizationRule.builder()
                .id(1L)
                .keyword("farmacia")
                .categoryName("Saúde")
                .priority(1)
                .enabled(true)
                .build();

        when(repository.findByEnabledTrueOrderByPriorityAscIdAsc()).thenReturn(List.of(rule));

        Optional<String> result = service.findCategoryByDescription("PAGTO FARMÁCIA SAO JOSE");

        assertThat(result).contains("Saúde");
    }

    @Test
    @DisplayName("should return first category by priority")
    void shouldUsePriorityOrder() {
        CategorizationRule lowPriority = CategorizationRule.builder()
                .id(2L)
                .keyword("uber")
                .categoryName("Lazer")
                .priority(100)
                .enabled(true)
                .build();

        CategorizationRule highPriority = CategorizationRule.builder()
                .id(1L)
                .keyword("uber")
                .categoryName("Transporte")
                .priority(1)
                .enabled(true)
                .build();

        when(repository.findByEnabledTrueOrderByPriorityAscIdAsc()).thenReturn(List.of(highPriority, lowPriority));

        Optional<String> result = service.findCategoryByDescription("Uber Trip");

        assertThat(result).contains("Transporte");
    }

    @Test
    @DisplayName("should create rule")
    void shouldCreateRule() {
        CategorizationRuleRequest request = CategorizationRuleRequest.builder()
                .keyword("ifood")
                .categoryName("Alimentação")
                .priority(10)
                .enabled(true)
                .build();

        CategorizationRule saved = CategorizationRule.builder()
                .id(1L)
                .keyword("ifood")
                .categoryName("Alimentação")
                .priority(10)
                .enabled(true)
                .build();

        when(repository.existsByKeywordIgnoreCaseAndCategoryNameIgnoreCase("ifood", "Alimentação")).thenReturn(false);
        when(repository.save(any(CategorizationRule.class))).thenReturn(saved);

        CategorizationRuleResponse response = service.create(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getKeyword()).isEqualTo("ifood");
        assertThat(response.getCategoryName()).isEqualTo("Alimentação");
    }

    @Test
    @DisplayName("should throw when updating missing rule")
    void shouldThrowWhenUpdatingMissingRule() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, CategorizationRuleRequest.builder()
                .keyword("x")
                .categoryName("y")
                .build()))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Regra não encontrada");

        verify(repository, never()).save(any());
    }
}
