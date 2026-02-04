package com.mx.money.controller;

import com.mx.money.dto.ReportAnalysisResponse;
import com.mx.money.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Controller para relatórios financeiros com IA
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    /**
     * Gera análise financeira usando IA
     * 
     * @param language Idioma da análise (pt-BR ou en)
     */
    @GetMapping("/analysis")
    public ResponseEntity<ReportAnalysisResponse> generateAnalysis(
            @RequestParam(defaultValue = "pt-BR") String language) {

        log.info("Generating financial analysis in language: {}", language);

        try {
            String analysis = reportService.generateFinancialAnalysis(language);

            return ResponseEntity.ok(ReportAnalysisResponse.builder()
                    .analysis(analysis)
                    .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .success(true)
                    .build());

        } catch (Exception e) {
            log.error("Error generating analysis", e);

            String errorMsg = language.equals("pt-BR")
                    ? "Erro ao gerar análise. Verifique se o Ollama está rodando."
                    : "Error generating analysis. Check if Ollama is running.";

            return ResponseEntity.ok(ReportAnalysisResponse.builder()
                    .success(false)
                    .errorMessage(errorMsg + " - " + e.getMessage())
                    .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build());
        }
    }
}
