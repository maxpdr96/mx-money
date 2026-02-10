package com.mx.money.controller;

import com.mx.money.dto.CsvImportRequest;
import com.mx.money.dto.CsvImportResponse;
import com.mx.money.dto.TransactionResponse;
import com.mx.money.entity.Category;
import com.mx.money.entity.TransactionType;
import com.mx.money.dto.TransactionRequest;
import com.mx.money.repository.CategoryRepository;
import com.mx.money.service.CsvCategorizationService;
import com.mx.money.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Controller para importação de CSV com categorização por IA
 */
@RestController
@RequestMapping("/api/csv")
@RequiredArgsConstructor
@Slf4j
public class CsvImportController {

    private final CsvCategorizationService csvCategorizationService;
    private final TransactionService transactionService;
    private final CategoryRepository categoryRepository;

    /**
     * Importa e categoriza um arquivo CSV.
     * O CSV deve ter colunas: date, title, amount (separadas por tab ou múltiplos
     * espaços)
     */
    @PostMapping("/import")
    public ResponseEntity<List<CsvImportResponse>> importCsv(@RequestParam("file") MultipartFile file) {
        log.info("Receiving CSV file: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

        try {
            List<CsvImportRequest> rows = parseCsv(file);
            log.info("Parsed {} rows from CSV", rows.size());

            if (rows.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            List<CsvImportResponse> categorized = csvCategorizationService.categorize(rows);
            return ResponseEntity.ok(categorized);

        } catch (Exception e) {
            log.error("Error processing CSV file", e);
            throw new RuntimeException("Erro ao processar arquivo CSV: " + e.getMessage(), e);
        }
    }

    /**
     * Paleta de cores para novas categorias criadas durante o import
     */
    private static final String[] COLOR_PALETTE = {
            "#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6",
            "#EF4444", "#8B5CF6", "#14B8A6", "#F97316", "#06B6D4",
            "#84CC16", "#A855F7", "#E11D48", "#0EA5E9", "#D946EF",
            "#22C55E", "#FB923C", "#64748B", "#FACC15", "#2DD4BF",
    };

    /**
     * Salva as transações categorizadas (confirmadas pelo usuário)
     */
    @PostMapping("/import/save")
    public ResponseEntity<List<TransactionResponse>> saveImported(@RequestBody List<CsvImportResponse> items) {
        log.info("Saving {} imported transactions", items.size());

        // Coleta cores já em uso
        java.util.Set<String> usedColors = categoryRepository.findAll().stream()
                .map(Category::getColor)
                .filter(c -> c != null && !c.isBlank())
                .map(String::toUpperCase)
                .collect(java.util.stream.Collectors.toSet());

        int colorIndex = 0;
        List<TransactionResponse> saved = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (CsvImportResponse item : items) {
            // Encontra ou cria a categoria
            Long categoryId = null;
            if (item.getCategory() != null && !item.getCategory().isBlank() && !item.getCategory().equals("Outros")) {
                final int ci = colorIndex;
                final java.util.Set<String> uc = usedColors;
                Category category = categoryRepository.findByNameIgnoreCase(item.getCategory())
                        .orElseGet(() -> {
                            String color = findNextAvailableColor(uc, ci);
                            log.info("Creating new category '{}' with color {}", item.getCategory(), color);
                            Category newCat = Category.builder()
                                    .name(item.getCategory())
                                    .color(color)
                                    .build();
                            Category savedCat = categoryRepository.save(newCat);
                            uc.add(color.toUpperCase());
                            return savedCat;
                        });
                categoryId = category.getId();
                colorIndex++;
            }

            // Cria a transação
            TransactionRequest request = TransactionRequest.builder()
                    .description(item.getDescription())
                    .amount(item.getAmount().abs())
                    .effectiveDate(LocalDate.parse(item.getDate(), fmt))
                    .type(item.getAmount().compareTo(BigDecimal.ZERO) >= 0 ? TransactionType.EXPENSE
                            : TransactionType.INCOME)
                    .categoryId(categoryId)
                    .build();

            saved.add(transactionService.create(request));
        }

        log.info("Successfully saved {} transactions", saved.size());
        return ResponseEntity.ok(saved);
    }

    private String findNextAvailableColor(java.util.Set<String> usedColors, int startIndex) {
        for (int i = 0; i < COLOR_PALETTE.length; i++) {
            String candidate = COLOR_PALETTE[(startIndex + i) % COLOR_PALETTE.length];
            if (!usedColors.contains(candidate.toUpperCase())) {
                return candidate;
            }
        }
        return COLOR_PALETTE[startIndex % COLOR_PALETTE.length];
    }

    /**
     * Parseia o CSV.
     * Suporta formatos separados por vírgula (CSV padrão), ponto-e-vírgula, tab ou
     * múltiplos espaços.
     * Espera colunas: date, description, amount (em qualquer ordem se tiver header,
     * ou nessa ordem se não tiver)
     * Pula a primeira linha se for header.
     */
    private List<CsvImportRequest> parseCsv(MultipartFile file) throws Exception {
        List<CsvImportRequest> rows = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {
                line = line.strip();
                if (line.isEmpty())
                    continue;

                // Tenta detectar o delimitador
                String delimiter = null;
                if (line.contains(","))
                    delimiter = ",";
                else if (line.contains(";"))
                    delimiter = ";";
                else if (line.contains("\t"))
                    delimiter = "\t";

                // Pula o header
                if (firstLine) {
                    firstLine = false;
                    String lower = line.toLowerCase();
                    if (lower.contains("date") || lower.contains("title") || lower.contains("amount")
                            || lower.contains("data") || lower.contains("valor") || lower.contains("descri")) {
                        continue;
                    }
                }

                String[] parts;
                if (delimiter != null) {
                    // Divide pelo delimitador
                    parts = line.split(Pattern.quote(delimiter));
                } else {
                    // Fallback: separa por 2+ espaços
                    parts = line.split("\\s{2,}");
                }

                if (parts.length >= 3) {
                    // Assume ordem: Data, Descrição, Valor (padrão Nubank/bancos)
                    // Ou tenta inferir:
                    // Data = contem traços ou barras
                    // Valor = contem números e separadores

                    String date = parts[0].strip();
                    String description = parts[1].strip();
                    // Assume que o valor é a última coluna não vazia
                    String amountStr = parts[parts.length - 1].strip();

                    // Limpa caracteres de moeda (R$) e espaços
                    amountStr = amountStr.replace("R$", "").strip();

                    // Trata formatação de número:
                    // Se tiver vírgula e ponto, assume que vírgula é decimal se estiver no final
                    // Ex: 1.000,00 -> 1000.00
                    // Ex: 69.79 -> 69.79
                    if (amountStr.contains(",") && amountStr.contains(".")) {
                        if (amountStr.lastIndexOf(",") > amountStr.lastIndexOf(".")) {
                            // 1.000,00 -> remove ponto, troca virgula por ponto
                            amountStr = amountStr.replace(".", "").replace(",", ".");
                        } else {
                            // 1,000.00 -> remove virgula
                            amountStr = amountStr.replace(",", "");
                        }
                    } else if (amountStr.contains(",")) {
                        // Apenas virgula (69,79) -> troca por ponto
                        amountStr = amountStr.replace(",", ".");
                    }

                    try {
                        BigDecimal amount = new BigDecimal(amountStr);
                        rows.add(CsvImportRequest.builder()
                                .date(date)
                                .description(description)
                                .amount(amount)
                                .build());
                    } catch (NumberFormatException e) {
                        log.warn("Skipping invalid row (bad amount: {}): {}", amountStr, line);
                    }
                } else {
                    log.warn("Skipping invalid row (not enough columns): {}", line);
                }
            }
        }

        return rows;
    }
}
