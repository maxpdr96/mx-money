package com.mx.money.controller;

import com.mx.money.dto.StockSectorRequest;
import com.mx.money.dto.StockSectorResponse;
import com.mx.money.service.StockSectorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-sectors")
@RequiredArgsConstructor
public class StockSectorController {

    private final StockSectorService stockSectorService;

    @GetMapping
    public ResponseEntity<List<StockSectorResponse>> findAll() {
        return ResponseEntity.ok(stockSectorService.findAll());
    }

    @PostMapping
    public ResponseEntity<StockSectorResponse> create(@Valid @RequestBody StockSectorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockSectorService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StockSectorResponse> update(@PathVariable Long id, @Valid @RequestBody StockSectorRequest request) {
        return ResponseEntity.ok(stockSectorService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        stockSectorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
