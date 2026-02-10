package com.mx.money.config;

import com.mx.money.entity.Category;
import com.mx.money.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Inicializa as categorias no banco de dados a partir do arquivo categories.md.
 * Atribui cores únicas para cada nova categoria, evitando conflitos com cores
 * já existentes.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Value("classpath:categories.md")
    private Resource categoriesResource;

    /**
     * Paleta de cores distintas e harmoniosas para categorias
     */
    private static final String[] COLOR_PALETTE = {
            "#6366F1", // Indigo
            "#EC4899", // Pink
            "#F59E0B", // Amber
            "#10B981", // Emerald
            "#3B82F6", // Blue
            "#EF4444", // Red
            "#8B5CF6", // Violet
            "#14B8A6", // Teal
            "#F97316", // Orange
            "#06B6D4", // Cyan
            "#84CC16", // Lime
            "#A855F7", // Purple
            "#E11D48", // Rose
            "#0EA5E9", // Sky
            "#D946EF", // Fuchsia
            "#22C55E", // Green
            "#FB923C", // Light Orange
            "#64748B", // Slate
            "#FACC15", // Yellow
            "#2DD4BF", // Teal Light
    };

    @Override
    public void run(String... args) throws Exception {
        String content = categoriesResource.getContentAsString(StandardCharsets.UTF_8);
        Pattern headerPattern = Pattern.compile("^#\\s+(.+)$", Pattern.MULTILINE);
        Matcher matcher = headerPattern.matcher(content);

        // Coleta cores já em uso no banco
        Set<String> usedColors = categoryRepository.findAll().stream()
                .map(Category::getColor)
                .filter(c -> c != null && !c.isBlank())
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        int colorIndex = 0;
        int created = 0;

        while (matcher.find()) {
            String categoryName = matcher.group(1).strip();
            if (!categoryRepository.existsByName(categoryName)) {
                // Encontra a próxima cor que não está em uso
                String color = findNextAvailableColor(usedColors, colorIndex);
                colorIndex++;

                Category category = Category.builder()
                        .name(categoryName)
                        .color(color)
                        .build();
                categoryRepository.save(category);
                usedColors.add(color.toUpperCase());
                created++;
                log.info("Created category '{}' with color {}", categoryName, color);
            }
        }

        if (created > 0) {
            log.info("CategoryInitializer: {} new categories created from categories.md", created);
        } else {
            log.info("CategoryInitializer: all categories already exist");
        }
    }

    private String findNextAvailableColor(Set<String> usedColors, int startIndex) {
        for (int i = 0; i < COLOR_PALETTE.length; i++) {
            String candidate = COLOR_PALETTE[(startIndex + i) % COLOR_PALETTE.length];
            if (!usedColors.contains(candidate.toUpperCase())) {
                return candidate;
            }
        }
        // Se todas estão em uso, usa a cor do índice atual
        return COLOR_PALETTE[startIndex % COLOR_PALETTE.length];
    }
}
