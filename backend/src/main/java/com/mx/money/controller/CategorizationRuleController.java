package com.mx.money.controller;

import com.mx.money.dto.CategorizationRuleRequest;
import com.mx.money.dto.CategorizationRuleResponse;
import com.mx.money.service.CategorizationRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorization-rules")
@RequiredArgsConstructor
public class CategorizationRuleController {

    private final CategorizationRuleService categorizationRuleService;

    @GetMapping
    public ResponseEntity<List<CategorizationRuleResponse>> findAll() {
        return ResponseEntity.ok(categorizationRuleService.findAll());
    }

    @PostMapping
    public ResponseEntity<CategorizationRuleResponse> create(@Valid @RequestBody CategorizationRuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categorizationRuleService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategorizationRuleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CategorizationRuleRequest request) {
        return ResponseEntity.ok(categorizationRuleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categorizationRuleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
