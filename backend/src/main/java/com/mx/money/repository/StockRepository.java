package com.mx.money.repository;

import com.mx.money.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByTickerIgnoreCase(String ticker);
    boolean existsByTickerIgnoreCaseAndIdNot(String ticker, Long id);
}
