package com.mx.money.service;

import com.mx.money.dto.CsvImportRequest;
import com.mx.money.dto.CsvImportResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Serviço de categorização de transações CSV usando Spring AI + Ollama.
 * Usa o arquivo categories.md como base de conhecimento (RAG) para
 * ajudar o LLM a identificar categorias corretas.
 */
@Service
@Slf4j
public class CsvCategorizationService {

    private final ChatClient.Builder chatClientBuilder;
    private final String categoriesKnowledge;

    public CsvCategorizationService(
            ChatClient.Builder chatClientBuilder,
            @Value("classpath:categories.md") Resource categoriesResource) throws IOException {
        this.chatClientBuilder = chatClientBuilder;
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

        log.info("Categorizing {} transactions with AI...", items.size());

        // Monta a lista de descrições numeradas
        StringBuilder descriptions = new StringBuilder();
        for (int i = 0; i < items.size(); i++) {
            descriptions.append(i + 1).append(". ").append(items.get(i).getDescription()).append("\n");
        }

        String prompt = buildPrompt(descriptions.toString());
        log.debug("Prompt sent to LLM:\n{}", prompt);

        try {
            ChatClient chatClient = chatClientBuilder.build();
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            log.debug("LLM raw response:\n{}", response);
            return parseResponse(response, items);
        } catch (Exception e) {
            log.error("Error calling Ollama for categorization", e);
            // Fallback: retorna todos como "Outros"
            return items.stream()
                    .map(item -> CsvImportResponse.builder()
                            .date(item.getDate())
                            .description(item.getDescription())
                            .amount(item.getAmount())
                            .category("Outros")
                            .build())
                    .toList();
        }
    }

    private String buildPrompt(String descriptions) {
        return """
                # TAREFA
                Você é um classificador de transações financeiras. Classifique cada transação abaixo em UMA das categorias listadas na base de conhecimento.

                # BASE DE CONHECIMENTO (categorias e palavras-chave)
                %s

                # REGRAS
                1. Responda SOMENTE com o número da transação seguido da categoria, uma por linha
                2. Use EXATAMENTE o nome da categoria como aparece nos títulos (# Título) da base de conhecimento
                3. Se a descrição não se encaixar em nenhuma categoria, use "Outros"
                4. Considere partes das palavras (substrings). Exemplo: se "autoposto" está na categoria Transporte, então "Rxfautoposto" ou "Pgto Autoposto" também é Transporte.
                5. Ignore prefixos comuns como "Pgto", "Compra", "Debito", "Pix", etc.
                6. NÃO adicione explicações, comentários ou texto extra
                7. NÃO use markdown, aspas, ou qualquer formatação

                # FORMATO DA RESPOSTA (exatamente assim)
                1. Alimentação
                2. Transporte
                3. Saúde

                # TRANSAÇÕES PARA CLASSIFICAR
                %s
                """
                .formatted(categoriesKnowledge, descriptions);
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
            for (String line : lines) {
                String trimmed = line.strip();
                // Formato esperado: "1. Categoria" ou "1 - Categoria" ou "1: Categoria"
                if (trimmed.startsWith((i + 1) + ".") ||
                        trimmed.startsWith((i + 1) + " ") ||
                        trimmed.startsWith((i + 1) + "-") ||
                        trimmed.startsWith((i + 1) + ":")) {

                    // Remove o número e o delimitador
                    category = trimmed.replaceFirst("^\\d+[.:\\-\\s]+\\s*", "").strip();
                    if (category.isEmpty()) {
                        category = "Outros";
                    }
                    break;
                }
            }

            results.add(CsvImportResponse.builder()
                    .date(item.getDate())
                    .description(item.getDescription())
                    .amount(item.getAmount())
                    .category(category)
                    .build());
        }

        log.info("Categorization complete: {} items processed", results.size());
        return results;
    }
}
