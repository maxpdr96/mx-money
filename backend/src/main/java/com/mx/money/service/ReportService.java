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
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
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

        long months = ChronoUnit.MONTHS.between(minDate.withDayOfMonth(1), maxDate.withDayOfMonth(1)) + 1;
        if (months < 1)
            months = 1;
        BigDecimal monthsBd = BigDecimal.valueOf(months);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        StringBuilder sb = new StringBuilder();

        if (language.equals("pt-BR")) {
            sb.append("=== RESUMO FINANCEIRO ===\n\n");
            sb.append("Período analisado: ").append(minDate.format(fmt)).append(" a ").append(maxDate.format(fmt))
                    .append(" (").append(months).append(" meses)\n");
            sb.append("Total de transações: ").append(transactions.size()).append("\n");
            sb.append("Transações recorrentes: ").append(recurringCount).append("\n\n");

            sb.append("RECEITAS TOTAIS: R$ ").append(totalIncome).append("\n");
            sb.append("DESPESAS TOTAIS: R$ ").append(totalExpense).append("\n");
            sb.append("SALDO: R$ ").append(totalIncome.subtract(totalExpense)).append("\n");
            sb.append("MÉDIA MENSAL DE DESPESAS: R$ ").append(totalExpense.divide(monthsBd, 2, RoundingMode.HALF_UP))
                    .append("\n\n");

            sb.append("--- Despesas por Categoria ---\n");
            expensesByCategory.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .forEach(e -> {
                        BigDecimal monthlyAvg = e.getValue().divide(monthsBd, 2, RoundingMode.HALF_UP);
                        sb.append("• ").append(e.getKey())
                                .append(": R$ ").append(e.getValue())
                                .append(" (Média mensal: R$ ").append(monthlyAvg).append(")\n");
                    });

            sb.append("\n--- Receitas por Categoria ---\n");
            incomeByCategory.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .forEach(e -> sb.append("• ").append(e.getKey()).append(": R$ ").append(e.getValue()).append("\n"));
        } else {
            sb.append("=== FINANCIAL SUMMARY ===\n\n");
            sb.append("Analyzed period: ").append(minDate.format(fmt)).append(" to ").append(maxDate.format(fmt))
                    .append(" (").append(months).append(" months)\n");
            sb.append("Total transactions: ").append(transactions.size()).append("\n");
            sb.append("Recurring transactions: ").append(recurringCount).append("\n\n");

            sb.append("TOTAL INCOME: $ ").append(totalIncome).append("\n");
            sb.append("TOTAL EXPENSES: $ ").append(totalExpense).append("\n");
            sb.append("BALANCE: $ ").append(totalIncome.subtract(totalExpense)).append("\n");
            sb.append("MONTHLY AVERAGE EXPENSES: $ ").append(totalExpense.divide(monthsBd, 2, RoundingMode.HALF_UP))
                    .append("\n\n");

            sb.append("--- Expenses by Category ---\n");
            expensesByCategory.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .forEach(e -> {
                        BigDecimal monthlyAvg = e.getValue().divide(monthsBd, 2, RoundingMode.HALF_UP);
                        sb.append("• ").append(e.getKey())
                                .append(": $ ").append(e.getValue())
                                .append(" (Monthly avg: $ ").append(monthlyAvg).append(")\n");
                    });

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
                    # PAPEL
                    Você é um consultor financeiro pessoal experiente, especializado em finanças comportamentais e otimização de orçamento doméstico. Você tem 15 anos de experiência ajudando pessoas a transformar seus hábitos de gastos.

                    # TAREFA
                    Analise os dados financeiros fornecidos e gere um relatório personalizado e acionável.

                    # PROCESSO DE ANÁLISE (siga esses passos mentalmente antes de responder)
                    1. Calcule a porcentagem de cada categoria de despesa em relação ao total de despesas
                    2. Identifique quais categorias consomem mais de 30%% do total (gastos excessivos potenciais)
                    3. Compare o saldo (receitas - despesas) com as receitas totais para avaliar a taxa de poupança
                    4. Identifique padrões de gastos recorrentes que podem ser otimizados
                    5. Formule dicas específicas baseadas nas categorias identificadas

                    # FORMATO DA RESPOSTA (use exatamente essa estrutura em Markdown)

                    ## 📊 Diagnóstico Financeiro
                    Apresente uma avaliação geral da saúde financeira (Crítico, Preocupante, Equilibrado, Saudável ou Excelente) e interprete a taxa de poupança.

                    ## 🚨 Alertas de Gastos Excessivos
                    Liste as 3 categorias com maior percentual de gastos.
                    Para cada uma, mostre:
                    - Categoria
                    - Valor Médio Mensal (baseado nos dados fornecidos)
                    - Porcentagem do total

                    ## ✅ Pontos Positivos
                    Identifique 2-3 aspectos positivos nos dados.

                    ## 💡 Dicas Personalizadas para Reduzir Gastos
                    Para CADA categoria com gastos significativos, dê UMA dica prática e específica.
                    Use o formato: **Categoria**: Dica específica com valor estimado de economia.
                    Exemplo: **Alimentação**: Substituir 2 refeições fora por semana por marmita pode economizar até R$ 200/mês.

                    ## 🎯 Plano de Ação Imediato
                    Liste 3 ações concretas que a pessoa pode fazer ESTA SEMANA.
                    Cada ação deve ser específica, mensurável e baseada nos dados.

                    ## 📈 Meta Sugerida para o Próximo Mês
                    Sugira uma meta realista de economia baseada nos dados, com valor específico.

                    # REGRAS IMPORTANTES
                    - NÃO use frases genéricas como "reduza seus gastos"
                    - SEMPRE cite valores e categorias específicas dos dados
                    - Calcule e mostre as porcentagens
                    - Seja direto e objetivo
                    - Use emojis para melhor visualização
                    - Responda em português brasileiro

                    # DADOS FINANCEIROS PARA ANÁLISE
                    %s
                    """
                    .formatted(financialSummary);
        } else {
            return """
                    # ROLE
                    You are an experienced personal financial consultant, specialized in behavioral finance and household budget optimization. You have 15 years of experience helping people transform their spending habits.

                    # TASK
                    Analyze the provided financial data and generate a personalized, actionable report.

                    # ANALYSIS PROCESS (follow these steps mentally before responding)
                    1. Calculate the percentage of each expense category relative to total expenses
                    2. Identify which categories consume more than 30%% of the total (potential excessive spending)
                    3. Compare the balance (income - expenses) with total income to assess savings rate
                    4. Identify recurring spending patterns that can be optimized
                    5. Formulate specific tips based on identified categories

                    # RESPONSE FORMAT (use exactly this structure in Markdown)

                    ## 📊 Financial Diagnosis
                    Provide an overall assessment of financial health (Critical, Concerning, Balanced, Healthy, or Excellent) and interpret the savings rate.

                    ## 🚨 Excessive Spending Alerts
                    List the TOP 3 categories with highest spending percentage.
                    For each, show:
                    - Category
                    - Monthly Average Amount (based on provided data)
                    - Percentage of total

                    ## ✅ Positive Points
                    [Identify 2-3 positive aspects in the data]

                    ## 💡 Personalized Tips to Reduce Spending
                    [For EACH category with significant spending, give ONE practical and specific tip]
                    [Use format: "**Category**: Specific tip with estimated savings value"]
                    [Example: "**Food**: Replacing 2 meals out per week with packed lunch can save up to $200/month"]

                    ## 🎯 Immediate Action Plan
                    [List 3 concrete actions the person can take THIS WEEK]
                    [Each action must be specific, measurable, and based on the data]

                    ## 📈 Suggested Goal for Next Month
                    [Suggest a realistic savings goal based on the data, with specific value]

                    # IMPORTANT RULES
                    - DO NOT use generic phrases like "reduce your spending"
                    - ALWAYS cite specific values and categories from the data
                    - Calculate and show percentages
                    - Be direct and objective
                    - Use emojis for better visualization
                    - Respond in English

                    # FINANCIAL DATA FOR ANALYSIS
                    %s
                    """
                    .formatted(financialSummary);
        }
    }
}
