package com.mx.money.repository;

import com.mx.money.entity.StockEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockEventRepository extends JpaRepository<StockEvent, Long> {
    List<StockEvent> findByStockIdOrderByEventDateAscIdAsc(Long stockId);
    void deleteAllByStockId(Long stockId);
}
