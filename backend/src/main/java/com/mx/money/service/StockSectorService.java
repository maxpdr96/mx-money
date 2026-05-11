package com.mx.money.service;

import com.mx.money.dto.StockSectorRequest;
import com.mx.money.dto.StockSectorResponse;
import com.mx.money.entity.StockSector;
import com.mx.money.repository.StockSectorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class StockSectorService {

    private final StockSectorRepository stockSectorRepository;

    public List<StockSectorResponse> findAll() {
        return stockSectorRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public StockSectorResponse create(StockSectorRequest request) {
        String name = request.getName().trim();
        if (stockSectorRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new IllegalArgumentException("Setor '" + name + "' já cadastrado");
        }
        StockSector sector = StockSector.builder()
                .name(name)
                .color(request.getColor())
                .build();
        return toResponse(stockSectorRepository.save(sector));
    }

    @Transactional
    public StockSectorResponse update(Long id, StockSectorRequest request) {
        StockSector sector = get(id);
        String name = request.getName().trim();
        if (stockSectorRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new IllegalArgumentException("Setor '" + name + "' já cadastrado");
        }
        sector.setName(name);
        sector.setColor(request.getColor());
        return toResponse(stockSectorRepository.save(sector));
    }

    @Transactional
    public void delete(Long id) {
        get(id);
        stockSectorRepository.deleteById(id);
    }

    private StockSector get(Long id) {
        return stockSectorRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Setor não encontrado: " + id));
    }

    private StockSectorResponse toResponse(StockSector s) {
        return StockSectorResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .color(s.getColor())
                .build();
    }
}
