package com.mx.money.controller;

import com.mx.money.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportController Tests")
class ReportControllerTest {

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reportController).build();
    }

    @Nested
    @DisplayName("GET /api/reports/analysis")
    class GenerateAnalysisTests {

        @Test
        @DisplayName("should generate analysis in Portuguese")
        void shouldGenerateAnalysisInPortuguese() throws Exception {
            // Given
            String analysis = "## 📊 Diagnóstico Financeiro\nSua saúde financeira está saudável...";
            when(reportService.generateFinancialAnalysis("pt-BR")).thenReturn(analysis);

            // When/Then
            mockMvc.perform(get("/api/reports/analysis")
                    .param("language", "pt-BR"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.analysis", containsString("Diagnóstico")))
                    .andExpect(jsonPath("$.generatedAt", notNullValue()));

            verify(reportService).generateFinancialAnalysis("pt-BR");
        }

        @Test
        @DisplayName("should generate analysis in English")
        void shouldGenerateAnalysisInEnglish() throws Exception {
            // Given
            String analysis = "## 📊 Financial Diagnosis\nYour financial health is excellent...";
            when(reportService.generateFinancialAnalysis("en")).thenReturn(analysis);

            // When/Then
            mockMvc.perform(get("/api/reports/analysis")
                    .param("language", "en"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.analysis", containsString("Financial")));

            verify(reportService).generateFinancialAnalysis("en");
        }

        @Test
        @DisplayName("should use default language when not specified")
        void shouldUseDefaultLanguage() throws Exception {
            // Given
            when(reportService.generateFinancialAnalysis("pt-BR")).thenReturn("Análise...");

            // When/Then
            mockMvc.perform(get("/api/reports/analysis"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)));

            verify(reportService).generateFinancialAnalysis("pt-BR");
        }

        @Test
        @DisplayName("should handle error gracefully")
        void shouldHandleErrorGracefully() throws Exception {
            // Given
            when(reportService.generateFinancialAnalysis(anyString()))
                    .thenThrow(new RuntimeException("Ollama connection failed"));

            // When/Then
            mockMvc.perform(get("/api/reports/analysis"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(false)))
                    .andExpect(jsonPath("$.errorMessage", containsString("Ollama")));
        }

        @Test
        @DisplayName("should return error message in Portuguese on failure")
        void shouldReturnErrorInPortuguese() throws Exception {
            // Given
            when(reportService.generateFinancialAnalysis("pt-BR"))
                    .thenThrow(new RuntimeException("Connection timeout"));

            // When/Then
            mockMvc.perform(get("/api/reports/analysis")
                    .param("language", "pt-BR"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(false)))
                    .andExpect(jsonPath("$.errorMessage", containsString("Erro ao gerar análise")));
        }

        @Test
        @DisplayName("should return error message in English on failure")
        void shouldReturnErrorInEnglish() throws Exception {
            // Given
            when(reportService.generateFinancialAnalysis("en"))
                    .thenThrow(new RuntimeException("Connection timeout"));

            // When/Then
            mockMvc.perform(get("/api/reports/analysis")
                    .param("language", "en"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(false)))
                    .andExpect(jsonPath("$.errorMessage", containsString("Error generating analysis")));
        }
    }
}
