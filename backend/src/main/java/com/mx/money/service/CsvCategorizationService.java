package com.mx.money.service;

import com.mx.money.dto.CsvImportRequest;
import com.mx.money.dto.CsvImportResponse;
import com.mx.money.repository.TransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Serviço de categorização de transações CSV usando Spring AI + Ollama.
 * Usa o arquivo categories.md como base de conhecimento (RAG) estática
 * E o histórico de transações do usuário como aprendizado dinâmico (Few-Shot).
 */
@Service
@Slf4j
public class CsvCategorizationService {

    private final ChatClient.Builder chatClientBuilder;
    private final TransactionRepository transactionRepository;
    private final CategorizationRuleService categorizationRuleService;
    private final String categoriesKnowledge;

    public CsvCategorizationService(
            ChatClient.Builder chatClientBuilder,
            TransactionRepository transactionRepository,
            CategorizationRuleService categorizationRuleService,
            @Value("classpath:categories.md") Resource categoriesResource) throws IOException {
        this.chatClientBuilder = chatClientBuilder;
        this.transactionRepository = transactionRepository;
        this.categorizationRuleService = categorizationRuleService;
        this.categoriesKnowledge = categoriesResource.getContentAsString(StandardCharsets.UTF_8);
        log.info("Categories knowledge base loaded ({} chars)", categoriesKnowledge.length());
    }

    /**
     * Categoriza uma lista de transações CSV usando a IA.
     * Envia todas as descrições em um único prompt para eficiência.
     */
    public List<CsvImportResponse> categorize(List<CsvImportRequest> items) {
        if (items.isEmpty()) {
            return List.of();
        }

        log.info("Categorizing {} transactions with rules + AI...", items.size());

        List<CsvImportResponse> results = new ArrayList<>();
        List<CsvImportRequest> itemsForAi = new ArrayList<>();
        List<Integer> aiIndexes = new ArrayList<>();

        for (int i = 0; i < items.size(); i++) {
            CsvImportRequest item = items.get(i);
            String matchedCategory = categorizationRuleService.findCategoryByDescription(item.getDescription())
                    .orElse(null);

            if (matchedCategory != null) {
                results.add(new CsvImportResponse(
                        item.getDate(),
                        item.getDescription(),
                        item.getAmount(),
                        matchedCategory));
            } else {
                results.add(null);
                itemsForAi.add(item);
                aiIndexes.add(i);
            }
        }

        if (itemsForAi.isEmpty()) {
            log.info("All {} transactions categorized by rules. AI call skipped.", items.size());
            return results;
        }

        // Busca histórico recente para aprendizado (últimos 6 meses)
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Object[]> recentHistory = transactionRepository.findRecentCategorizations(sixMonthsAgo);

        String userExamples = formatUserExamples(recentHistory);
        log.info("Loaded {} recent user examples for context", recentHistory.size());

        // Monta a lista de descrições numeradas para classificar
        StringBuilder descriptionsToClassify = new StringBuilder();
        for (int i = 0; i < itemsForAi.size(); i++) {
            descriptionsToClassify.append(i + 1).append(". ").append(itemsForAi.get(i).getDescription()).append("\n");
        }

        String prompt = buildPrompt(descriptionsToClassify.toString(), userExamples);
        log.debug("Prompt sent to LLM:\n{}", prompt);

        try {
            ChatClient chatClient = chatClientBuilder.build();
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            log.debug("LLM raw response:\n{}", response);
            List<CsvImportResponse> aiResponses = parseResponse(response, itemsForAi);
            for (int i = 0; i < aiResponses.size(); i++) {
                results.set(aiIndexes.get(i), aiResponses.get(i));
            }
            return results;
        } catch (Exception e) {
            log.error("Error calling Ollama for categorization", e);
            // Fallback: retorna todos como "Outros" em caso de erro
            for (int index : aiIndexes) {
                CsvImportRequest item = items.get(index);
                results.set(index, new CsvImportResponse(
                        item.getDate(),
                        item.getDescription(),
                        item.getAmount(),
                        "Outros"));
            }
            return results;
        }
    }

    private String formatUserExamples(List<Object[]> history) {
        if (history.isEmpty())
            return "";

        StringBuilder sb = new StringBuilder();
        sb.append("# EXEMPLOS DO HISTÓRICO DO USUÁRIO (Prioridade Alta)\n");
        sb.append(
                "Use estes exemplos como referência principal. Se uma descrição for similar, use a mesma categoria.\n\n");

        for (Object[] row : history) {
            String desc = (String) row[0];
            String cat = (String) row[1];
            sb.append("- \"").append(desc).append("\" -> ").append(cat).append("\n");
        }
        return sb.toString();
    }

    private String buildPrompt(String descriptionsToClassify, String userExamples) {
        return """
                # TAREFA
                Você é um classificador de transações financeiras. Classifique cada transação abaixo em UMA das categorias listadas na base de conhecimento ou nos exemplos do usuário.

                # BASE DE CONHECIMENTO (categorias e palavras-chave)
                %s

                %s

                # REGRAS
                1. Responda SOMENTE com o número da transação seguido da categoria, uma por linha
                2. Use EXATAMENTE o nome da categoria como aparece nos títulos (# Título) da base de conhecimento
                3. Se a descrição não se encaixar em nenhuma categoria, use "Outros"
                4. Considere partes das palavras (substrings). Exemplo: se "autoposto" está na categoria Transporte, então "Rxfautoposto" ou "Pgto Autoposto" também é Transporte.
                5. Ignore prefixos comuns como "Pgto", "Compra", "Debito", "Pix", etc.
                6. PRIORIDADE: Se a descrição for similar a um exemplo do histórico do usuário, use a categoria do histórico.
                7. NÃO adicione explicações, comentários ou texto extra
                8. NÃO use markdown, aspas, ou qualquer formatação

                # FORMATO DA RESPOSTA (exatamente assim)
                1. Alimentação
                2. Transporte
                3. Saúde

                # TRANSAÇÕES PARA CLASSIFICAR
                %s
                """
                .formatted(categoriesKnowledge, userExamples, descriptionsToClassify);
    }

    /**
     * Parseia a resposta do LLM no formato "1. Categoria\n2. Categoria\n..."
     */
    private List<CsvImportResponse> parseResponse(String response, List<CsvImportRequest> items) {
        List<CsvImportResponse> results = new ArrayList<>();
        String[] lines = response.strip().split("\n");

        for (int i = 0; i < items.size(); i++) {
            CsvImportRequest item = items.get(i);
            String category = "Outros";

            // Tenta encontrar a linha correspondente na resposta
            // Procura por "1. ", "1 - ", "1: "
            String prefix = (i + 1) + "";

            for (String line : lines) {
                String trimmed = line.strip();
                // Verifica se começa com o número seguido de pontuação
                if (trimmed.startsWith(prefix + ".") ||
                        trimmed.startsWith(prefix + " ") ||
                        trimmed.startsWith(prefix + "-") ||
                        trimmed.startsWith(prefix + ":")) {

                    // Remove o número e o delimitador
                    category = trimmed.replaceFirst("^\\d+[.:\\-\\s]+\\s*", "").strip();
                    // Remove aspas extras se houver
                    category = category.replaceAll("^\"|\"$", "");

                    if (category.isEmpty()) {
                        category = "Outros";
                    }
                    break;
                }
            }

            results.add(new CsvImportResponse(
                    item.getDate(),
                    item.getDescription(),
                    item.getAmount(),
                    category));
        }

        log.info("Categorization complete: {} items processed", results.size());
        return results;
    }
}
