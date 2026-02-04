package com.mx.money.service;

import com.mx.money.entity.Transaction;
import com.mx.money.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service para geração de relatórios financeiros com IA
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final ChatClient.Builder chatClientBuilder;

    /**
     * Gera uma análise financeira usando IA com base nas transações
     */
    public String generateFinancialAnalysis(String language) {
        log.info("Generating financial analysis report...");

        List<Transaction> transactions = transactionRepository.findAll();

        if (transactions.isEmpty()) {
            return language.equals("pt-BR")
                    ? "Não há transações suficientes para gerar uma análise. Adicione algumas transações primeiro."
                    : "Not enough transactions to generate an analysis. Add some transactions first.";
        }

        // Agrupa dados para análise
        String financialSummary = buildFinancialSummary(transactions, language);
        String prompt = buildAnalysisPrompt(financialSummary, language);

        log.debug("Sending prompt to LLM: {}", prompt);

        try {
            ChatClient chatClient = chatClientBuilder.build();
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            log.info("Financial analysis generated successfully");
            return response;
        } catch (Exception e) {
            log.error("Error generating financial analysis", e);
            throw new RuntimeException("Failed to generate analysis: " + e.getMessage(), e);
        }
    }

    private String buildFinancialSummary(List<Transaction> transactions, String language) {
        // Calcula totais
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "INCOME".equals(t.getType().name()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType().name()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Agrupa despesas por categoria
        Map<String, BigDecimal> expensesByCategory = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType().name()))
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory().getName() : "Sem categoria",
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        // Agrupa receitas por categoria
        Map<String, BigDecimal> incomeByCategory = transactions.stream()
                .filter(t -> "INCOME".equals(t.getType().name()))
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory().getName() : "Sem categoria",
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        // Transações recorrentes
        long recurringCount = transactions.stream()
                .filter(t -> !"NONE".equals(t.getRecurrence().name()))
                .count();

        // Período analisado
        LocalDate minDate = transactions.stream()
                .map(Transaction::getEffectiveDate)
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());
        LocalDate maxDate = transactions.stream()
                .map(Transaction::getEffectiveDate)
                .max(LocalDate::compareTo)
                .orElse(LocalDate.now());

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        StringBuilder sb = new StringBuilder();

        if (language.equals("pt-BR")) {
            sb.append("=== RESUMO FINANCEIRO ===\n\n");
            sb.append("Período analisado: ").append(minDate.format(fmt)).append(" a ").append(maxDate.format(fmt))
                    .append("\n");
            sb.append("Total de transações: ").append(transactions.size()).append("\n");
            sb.append("Transações recorrentes: ").append(recurringCount).append("\n\n");
            sb.append("RECEITAS TOTAIS: R$ ").append(totalIncome).append("\n");
            sb.append("DESPESAS TOTAIS: R$ ").append(totalExpense).append("\n");
            sb.append("SALDO: R$ ").append(totalIncome.subtract(totalExpense)).append("\n\n");

            sb.append("--- Despesas por Categoria ---\n");
            expensesByCategory.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .forEach(e -> sb.append("• ").append(e.getKey()).append(": R$ ").append(e.getValue()).append("\n"));

            sb.append("\n--- Receitas por Categoria ---\n");
            incomeByCategory.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .forEach(e -> sb.append("• ").append(e.getKey()).append(": R$ ").append(e.getValue()).append("\n"));
        } else {
            sb.append("=== FINANCIAL SUMMARY ===\n\n");
            sb.append("Analyzed period: ").append(minDate.format(fmt)).append(" to ").append(maxDate.format(fmt))
                    .append("\n");
            sb.append("Total transactions: ").append(transactions.size()).append("\n");
            sb.append("Recurring transactions: ").append(recurringCount).append("\n\n");
            sb.append("TOTAL INCOME: $ ").append(totalIncome).append("\n");
            sb.append("TOTAL EXPENSES: $ ").append(totalExpense).append("\n");
            sb.append("BALANCE: $ ").append(totalIncome.subtract(totalExpense)).append("\n\n");

            sb.append("--- Expenses by Category ---\n");
            expensesByCategory.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .forEach(e -> sb.append("• ").append(e.getKey()).append(": $ ").append(e.getValue()).append("\n"));

            sb.append("\n--- Income by Category ---\n");
            incomeByCategory.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .forEach(e -> sb.append("• ").append(e.getKey()).append(": $ ").append(e.getValue()).append("\n"));
        }

        return sb.toString();
    }

    private String buildAnalysisPrompt(String financialSummary, String language) {
        if (language.equals("pt-BR")) {
            return """
                    Você é um consultor financeiro pessoal especializado em análise de gastos e receitas.

                    Analise os seguintes dados financeiros e forneça:
                    1. Uma visão geral da saúde financeira
                    2. Pontos positivos identificados
                    3. Áreas de preocupação ou atenção
                    4. Sugestões concretas para melhorar os gastos
                    5. Sugestões para aumentar ou diversificar receitas
                    6. Dicas práticas de economia

                    Seja específico e baseie suas recomendações nos dados apresentados.
                    Formate a resposta em Markdown para melhor leitura.
                    Responda em português brasileiro.

                    DADOS FINANCEIROS:
                    %s
                    """.formatted(financialSummary);
        } else {
            return """
                    You are a personal financial consultant specialized in expense and income analysis.

                    Analyze the following financial data and provide:
                    1. An overview of financial health
                    2. Identified positive points
                    3. Areas of concern or attention
                    4. Concrete suggestions to improve spending
                    5. Suggestions to increase or diversify income
                    6. Practical savings tips

                    Be specific and base your recommendations on the presented data.
                    Format the response in Markdown for better readability.
                    Respond in English.

                    FINANCIAL DATA:
                    %s
                    """.formatted(financialSummary);
        }
    }
}
