package com.mx.money.service;

import com.mx.money.dto.TransactionRequest;
import com.mx.money.dto.TransactionResponse;
import com.mx.money.entity.Category;
import com.mx.money.entity.RecurrenceType;
import com.mx.money.entity.Transaction;
import com.mx.money.mapper.TransactionMapper;
import com.mx.money.repository.TransactionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final CategoryService categoryService;

    @Transactional(readOnly = true)
    public List<TransactionResponse> findAll() {
        return transactionMapper.toResponseList(
                transactionRepository.findAllByOrderByEffectiveDateDesc());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> findByPeriod(LocalDate startDate, LocalDate endDate) {
        return transactionMapper.toResponseList(
                transactionRepository.findByEffectiveDateBetweenOrderByEffectiveDateDesc(startDate, endDate));
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transação não encontrada: " + id));
        return transactionMapper.toResponse(transaction);
    }

    public TransactionResponse create(TransactionRequest request) {
        Transaction transaction = transactionMapper.toEntity(request);

        if (request.getRecurrence() == null) {
            transaction.setRecurrence(RecurrenceType.NONE);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryService.findEntityById(request.getCategoryId());
            transaction.setCategory(category);
        }

        transaction = transactionRepository.save(transaction);
        return transactionMapper.toResponse(transaction);
    }

    public TransactionResponse update(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transação não encontrada: " + id));

        transactionMapper.updateEntity(request, transaction);

        if (request.getCategoryId() != null) {
            Category category = categoryService.findEntityById(request.getCategoryId());
            transaction.setCategory(category);
        } else {
            transaction.setCategory(null);
        }

        transaction = transactionRepository.save(transaction);
        return transactionMapper.toResponse(transaction);
    }

    public void delete(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new EntityNotFoundException("Transação não encontrada: " + id);
        }
        transactionRepository.deleteById(id);
    }
}
