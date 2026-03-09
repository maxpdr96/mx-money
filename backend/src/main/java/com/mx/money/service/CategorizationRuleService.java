package com.mx.money.service;

import com.mx.money.dto.CategorizationRuleRequest;
import com.mx.money.dto.CategorizationRuleResponse;
import com.mx.money.entity.CategorizationRule;
import com.mx.money.repository.CategorizationRuleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class CategorizationRuleService {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");

    private final CategorizationRuleRepository categorizationRuleRepository;

    @Transactional(readOnly = true)
    public List<CategorizationRuleResponse> findAll() {
        return categorizationRuleRepository.findAll().stream()
                .sorted((a, b) -> {
                    int byPriority = Integer.compare(a.getPriority(), b.getPriority());
                    if (byPriority != 0) {
                        return byPriority;
                    }
                    return Long.compare(a.getId(), b.getId());
                })
                .map(this::toResponse)
                .toList();
    }

    public CategorizationRuleResponse create(CategorizationRuleRequest request) {
        String keyword = normalizeInput(request.getKeyword());
        String categoryName = normalizeInput(request.getCategoryName());

        if (categorizationRuleRepository.existsByKeywordIgnoreCaseAndCategoryNameIgnoreCase(keyword, categoryName)) {
            throw new IllegalArgumentException("Regra já existe para esta palavra-chave e categoria.");
        }

        CategorizationRule rule = CategorizationRule.builder()
                .keyword(keyword)
                .categoryName(categoryName)
                .priority(request.getPriority() == null ? 100 : request.getPriority())
                .enabled(request.getEnabled() == null || request.getEnabled())
                .build();

        return toResponse(categorizationRuleRepository.save(rule));
    }

    public CategorizationRuleResponse update(Long id, CategorizationRuleRequest request) {
        CategorizationRule rule = categorizationRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Regra não encontrada: " + id));

        rule.setKeyword(normalizeInput(request.getKeyword()));
        rule.setCategoryName(normalizeInput(request.getCategoryName()));
        rule.setPriority(request.getPriority() == null ? rule.getPriority() : request.getPriority());
        rule.setEnabled(request.getEnabled() == null ? rule.getEnabled() : request.getEnabled());

        return toResponse(categorizationRuleRepository.save(rule));
    }

    public void delete(Long id) {
        if (!categorizationRuleRepository.existsById(id)) {
            throw new EntityNotFoundException("Regra não encontrada: " + id);
        }
        categorizationRuleRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<String> findCategoryByDescription(String description) {
        if (description == null || description.isBlank()) {
            return Optional.empty();
        }

        String normalizedDescription = normalizeForMatch(description);
        return categorizationRuleRepository.findByEnabledTrueOrderByPriorityAscIdAsc().stream()
                .filter(rule -> normalizedDescription.contains(normalizeForMatch(rule.getKeyword())))
                .map(CategorizationRule::getCategoryName)
                .findFirst();
    }

    private CategorizationRuleResponse toResponse(CategorizationRule rule) {
        return CategorizationRuleResponse.builder()
                .id(rule.getId())
                .keyword(rule.getKeyword())
                .categoryName(rule.getCategoryName())
                .priority(rule.getPriority())
                .enabled(rule.getEnabled())
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }

    private String normalizeInput(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeForMatch(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD);
        normalized = DIACRITICS.matcher(normalized).replaceAll("");
        return normalized.toLowerCase(Locale.ROOT).trim();
    }
}
