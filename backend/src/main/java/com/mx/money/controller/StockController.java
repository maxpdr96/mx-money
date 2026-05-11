package com.mx.money.controller;

import com.mx.money.dto.*;
import com.mx.money.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    // ---- Stocks ----

    @GetMapping
    public ResponseEntity<List<StockResponse>> findAll() {
        return ResponseEntity.ok(stockService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.findById(id));
    }

    @GetMapping("/portfolio")
    public ResponseEntity<List<StockPositionResponse>> getPortfolio() {
        return ResponseEntity.ok(stockService.getAllPositions());
    }

    @GetMapping("/{id}/position")
    public ResponseEntity<StockPositionResponse> getPosition(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.getPosition(id));
    }

    @PostMapping
    public ResponseEntity<StockResponse> create(@Valid @RequestBody StockRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StockResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody StockRequest request) {
        return ResponseEntity.ok(stockService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        stockService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Events ----

    @GetMapping("/{stockId}/events")
    public ResponseEntity<List<StockEventResponse>> findEvents(@PathVariable Long stockId) {
        return ResponseEntity.ok(stockService.findEvents(stockId));
    }

    @PostMapping("/{stockId}/events")
    public ResponseEntity<StockEventResponse> addEvent(@PathVariable Long stockId,
                                                        @Valid @RequestBody StockEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.addEvent(stockId, request));
    }

    @PutMapping("/{stockId}/events/{eventId}")
    public ResponseEntity<StockEventResponse> updateEvent(@PathVariable Long stockId,
                                                           @PathVariable Long eventId,
                                                           @Valid @RequestBody StockEventRequest request) {
        return ResponseEntity.ok(stockService.updateEvent(stockId, eventId, request));
    }

    @DeleteMapping("/{stockId}/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long stockId,
                                             @PathVariable Long eventId) {
        stockService.deleteEvent(stockId, eventId);
        return ResponseEntity.noContent().build();
    }

    // ---- Tax Report ----

    @GetMapping("/tax-report/{year}")
    public ResponseEntity<StockTaxReportResponse> getTaxReport(@PathVariable int year) {
        return ResponseEntity.ok(stockService.generateTaxReport(year));
    }
}
