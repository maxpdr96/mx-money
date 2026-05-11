package com.mx.money.repository;

import com.mx.money.entity.StockSector;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockSectorRepository extends JpaRepository<StockSector, Long> {
    Optional<StockSector> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    List<StockSector> findAllByOrderByNameAsc();
}
