package com.mx.money.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mx.money.dto.BackupJsonCategory;
import com.mx.money.dto.BackupJsonCategorizationRule;
import com.mx.money.dto.BackupJsonData;
import com.mx.money.dto.BackupJsonTransaction;
import com.mx.money.entity.Category;
import com.mx.money.entity.CategorizationRule;
import com.mx.money.entity.RecurrenceType;
import com.mx.money.entity.Transaction;
import com.mx.money.repository.CategorizationRuleRepository;
import com.mx.money.repository.CategoryRepository;
import com.mx.money.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);
    private static final DateTimeFormatter BACKUP_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");
    private static final int MAX_BACKUPS = 5;
    private static final Path SETTINGS_FILE = Paths.get("./data/backup-settings.properties");
    private static final Path DEFAULT_BACKUP_DIR = Paths.get("./data/backups");

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final CategorizationRuleRepository categorizationRuleRepository;
    private final ObjectMapper objectMapper;

    private Path backupDir;
    private boolean autoBackupEnabled = true;
    private int backupIntervalHours = 24;

    public BackupService(
            CategoryRepository categoryRepository,
            TransactionRepository transactionRepository,
            CategorizationRuleRepository categorizationRuleRepository,
            ObjectMapper objectMapper) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.categorizationRuleRepository = categorizationRuleRepository;
        this.objectMapper = objectMapper;
        loadSettings();
        try {
            Files.createDirectories(backupDir);
        } catch (IOException e) {
            log.error("Failed to create backup directory", e);
        }
    }

    private void loadSettings() {
        this.backupDir = DEFAULT_BACKUP_DIR;
        this.autoBackupEnabled = true;

        if (Files.exists(SETTINGS_FILE)) {
            try {
                Properties props = new Properties();
                props.load(Files.newInputStream(SETTINGS_FILE));

                String dir = props.getProperty("backupDirectory");
                if (dir != null && !dir.isBlank()) {
                    this.backupDir = Paths.get(dir);
                }

                String auto = props.getProperty("autoBackupEnabled");
                if (auto != null) {
                    this.autoBackupEnabled = Boolean.parseBoolean(auto);
                }

                String interval = props.getProperty("backupIntervalHours");
                if (interval != null) {
                    try {
                        this.backupIntervalHours = Integer.parseInt(interval);
                    } catch (NumberFormatException e) {
                        log.warn("Invalid backup interval, using default");
                    }
                }
            } catch (IOException e) {
                log.warn("Failed to load backup settings, using defaults", e);
            }
        }
    }

    private void saveSettings() {
        try {
            Files.createDirectories(SETTINGS_FILE.getParent());
            Properties props = new Properties();
            props.setProperty("backupDirectory", backupDir.toAbsolutePath().toString());
            props.setProperty("autoBackupEnabled", String.valueOf(autoBackupEnabled));
            props.setProperty("backupIntervalHours", String.valueOf(backupIntervalHours));
            props.store(Files.newOutputStream(SETTINGS_FILE), "MX-Money Backup Settings");
        } catch (IOException e) {
            log.error("Failed to save backup settings", e);
        }
    }

    /**
     * Creates a JSON backup file with all categories + transactions.
     */
    public String createBackup() throws IOException {
        Files.createDirectories(backupDir);

        String backupName = "backup_" + LocalDateTime.now().format(BACKUP_DATE_FORMAT) + ".json";
        Path backupPath = backupDir.resolve(backupName);

        BackupJsonData data = exportDatabaseAsJson();
        objectMapper.writeValue(backupPath.toFile(), data);
        log.info("JSON backup created: {}", backupName);

        cleanOldBackups();
        return backupName;
    }

    public List<Map<String, Object>> listBackups() throws IOException {
        if (!Files.exists(backupDir)) {
            return Collections.emptyList();
        }

        try (Stream<Path> paths = Files.list(backupDir)) {
            return paths
                    .filter(p -> p.getFileName().toString().endsWith(".json"))
                    .sorted(Comparator.comparing(Path::getFileName).reversed())
                    .map(p -> {
                        Map<String, Object> backup = new HashMap<>();
                        backup.put("name", p.getFileName().toString());
                        try {
                            backup.put("size", Files.size(p));
                            backup.put("created", Files.getLastModifiedTime(p).toMillis());
                        } catch (IOException e) {
                            backup.put("size", 0L);
                            backup.put("created", 0L);
                        }
                        return backup;
                    })
                    .collect(Collectors.toList());
        }
    }

    public void deleteBackup(String backupName) throws IOException {
        Path backupPath = backupDir.resolve(backupName);
        if (!Files.exists(backupPath)) {
            throw new IOException("Backup not found: " + backupName);
        }
        Files.delete(backupPath);
        log.info("Backup deleted: {}", backupName);
    }

    public BackupJsonData exportDatabaseAsJson() {
        List<BackupJsonCategory> categories = categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(Category::getName, String.CASE_INSENSITIVE_ORDER))
                .map(category -> BackupJsonCategory.builder()
                        .name(category.getName())
                        .color(category.getColor())
                        .icon(category.getIcon())
                        .createdAt(category.getCreatedAt())
                        .updatedAt(category.getUpdatedAt())
                        .build())
                .toList();

        List<BackupJsonTransaction> transactions = transactionRepository.findAll().stream()
                .sorted(Comparator.comparing(Transaction::getEffectiveDate).thenComparing(Transaction::getId))
                .map(transaction -> BackupJsonTransaction.builder()
                        .id(transaction.getId())
                        .description(transaction.getDescription())
                        .amount(transaction.getAmount())
                        .effectiveDate(transaction.getEffectiveDate())
                        .type(transaction.getType())
                        .recurrence(transaction.getRecurrence())
                        .categoryName(transaction.getCategory() != null ? transaction.getCategory().getName() : null)
                        .lastGeneratedDate(transaction.getLastGeneratedDate())
                        .endDate(transaction.getEndDate())
                        .parentRecurringId(transaction.getParentRecurringId())
                        .createdAt(transaction.getCreatedAt())
                        .updatedAt(transaction.getUpdatedAt())
                        .build())
                .toList();

        List<BackupJsonCategorizationRule> categorizationRules = categorizationRuleRepository.findAll().stream()
                .sorted(Comparator.comparing(CategorizationRule::getPriority).thenComparing(CategorizationRule::getId))
                .map(rule -> BackupJsonCategorizationRule.builder()
                        .keyword(rule.getKeyword())
                        .categoryName(rule.getCategoryName())
                        .priority(rule.getPriority())
                        .enabled(rule.getEnabled())
                        .createdAt(rule.getCreatedAt())
                        .updatedAt(rule.getUpdatedAt())
                        .build())
                .toList();

        return BackupJsonData.builder()
                .version(1)
                .exportedAt(LocalDateTime.now())
                .categories(categories)
                .transactions(transactions)
                .categorizationRules(categorizationRules)
                .build();
    }

    @Transactional
    public void importDatabaseFromJson(BackupJsonData data) throws IOException {
        doImportFromJson(data, true);
    }

    /**
     * Restores data from a JSON backup file.
     */
    @Transactional
    public void restoreBackup(String backupName) throws IOException {
        Path backupPath = backupDir.resolve(backupName);
        if (!Files.exists(backupPath)) {
            throw new IOException("Backup not found: " + backupName);
        }

        // Safety backup before restore
        createBackup();

        BackupJsonData backupData;
        try {
            backupData = objectMapper.readValue(backupPath.toFile(), BackupJsonData.class);
        } catch (IOException e) {
            throw new IllegalArgumentException("Invalid backup JSON: " + backupName);
        }

        doImportFromJson(backupData, false);
        log.info("Database restored from JSON backup: {}", backupName);
    }

    private void doImportFromJson(BackupJsonData data, boolean createBackupBeforeImport) throws IOException {
        if (data == null) {
            throw new IllegalArgumentException("JSON de importacao invalido.");
        }

        List<BackupJsonCategory> categories = Optional.ofNullable(data.getCategories()).orElse(List.of());
        List<BackupJsonTransaction> transactions = Optional.ofNullable(data.getTransactions()).orElse(List.of());
        List<BackupJsonCategorizationRule> categorizationRules = Optional.ofNullable(data.getCategorizationRules()).orElse(List.of());

        if (createBackupBeforeImport) {
            createBackup();
        }

        transactionRepository.deleteAllInBatch();
        categorizationRuleRepository.deleteAllInBatch();
        categoryRepository.deleteAllInBatch();

        Map<String, Category> categoriesByName = new HashMap<>();

        for (BackupJsonCategory categoryJson : categories) {
            String name = categoryJson.getName() == null ? "" : categoryJson.getName().trim();
            if (name.isBlank()) {
                continue;
            }

            Category category = Category.builder()
                    .name(name)
                    .color(categoryJson.getColor())
                    .icon(categoryJson.getIcon())
                    .createdAt(categoryJson.getCreatedAt())
                    .updatedAt(categoryJson.getUpdatedAt())
                    .build();
            Category saved = categoryRepository.save(category);
            categoriesByName.put(saved.getName().toLowerCase(Locale.ROOT), saved);
        }

        Map<Long, Long> transactionIdMap = new HashMap<>();
        List<Map.Entry<Long, Long>> parentLinks = new ArrayList<>();

        for (BackupJsonTransaction transactionJson : transactions) {
            if (transactionJson.getDescription() == null || transactionJson.getDescription().isBlank()) {
                throw new IllegalArgumentException("Transacao sem descricao encontrada no JSON.");
            }
            if (transactionJson.getAmount() == null) {
                throw new IllegalArgumentException("Transacao sem valor encontrada no JSON.");
            }
            if (transactionJson.getEffectiveDate() == null) {
                throw new IllegalArgumentException("Transacao sem data efetiva encontrada no JSON.");
            }
            if (transactionJson.getType() == null) {
                throw new IllegalArgumentException("Transacao sem tipo encontrada no JSON.");
            }

            Category category = resolveCategory(categoriesByName, transactionJson.getCategoryName());

            Transaction transaction = Transaction.builder()
                    .description(transactionJson.getDescription().trim())
                    .amount(transactionJson.getAmount().abs())
                    .effectiveDate(transactionJson.getEffectiveDate())
                    .type(transactionJson.getType())
                    .recurrence(transactionJson.getRecurrence() == null ? RecurrenceType.NONE : transactionJson.getRecurrence())
                    .category(category)
                    .lastGeneratedDate(transactionJson.getLastGeneratedDate())
                    .endDate(transactionJson.getEndDate())
                    .parentRecurringId(null)
                    .createdAt(transactionJson.getCreatedAt())
                    .updatedAt(transactionJson.getUpdatedAt())
                    .build();

            Transaction saved = transactionRepository.save(transaction);
            if (transactionJson.getId() != null) {
                transactionIdMap.put(transactionJson.getId(), saved.getId());
            }
            if (transactionJson.getParentRecurringId() != null) {
                parentLinks.add(Map.entry(saved.getId(), transactionJson.getParentRecurringId()));
            }
        }

        for (Map.Entry<Long, Long> link : parentLinks) {
            Transaction child = transactionRepository.findById(link.getKey())
                    .orElseThrow(() -> new IllegalArgumentException("Transacao importada nao encontrada para vinculo de recorrencia."));
            Long newParentId = transactionIdMap.get(link.getValue());
            child.setParentRecurringId(newParentId);
            transactionRepository.save(child);
        }

        for (BackupJsonCategorizationRule ruleJson : categorizationRules) {
            String keyword = ruleJson.getKeyword() == null ? "" : ruleJson.getKeyword().trim();
            String categoryName = ruleJson.getCategoryName() == null ? "" : ruleJson.getCategoryName().trim();

            if (keyword.isBlank() || categoryName.isBlank()) {
                continue;
            }

            CategorizationRule rule = CategorizationRule.builder()
                    .keyword(keyword)
                    .categoryName(categoryName)
                    .priority(ruleJson.getPriority() == null ? 100 : ruleJson.getPriority())
                    .enabled(ruleJson.getEnabled() == null || ruleJson.getEnabled())
                    .createdAt(ruleJson.getCreatedAt())
                    .updatedAt(ruleJson.getUpdatedAt())
                    .build();
            categorizationRuleRepository.save(rule);
        }

        log.info("JSON import completed with {} categories, {} transactions and {} categorization rules",
                categoriesByName.size(), transactions.size(), categorizationRules.size());
    }

    private Category resolveCategory(Map<String, Category> categoriesByName, String categoryName) {
        if (categoryName == null || categoryName.isBlank()) {
            return null;
        }

        String normalizedName = categoryName.trim().toLowerCase(Locale.ROOT);
        Category existing = categoriesByName.get(normalizedName);
        if (existing != null) {
            return existing;
        }

        Category created = categoryRepository.save(Category.builder()
                .name(categoryName.trim())
                .build());
        categoriesByName.put(normalizedName, created);
        return created;
    }

    private void cleanOldBackups() throws IOException {
        List<Map<String, Object>> backups = listBackups();
        if (backups.size() > MAX_BACKUPS) {
            for (int i = MAX_BACKUPS; i < backups.size(); i++) {
                String name = (String) backups.get(i).get("name");
                deleteBackup(name);
                log.info("Removed old backup: {}", name);
            }
        }
    }

    public Map<String, Object> getSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("autoBackupEnabled", autoBackupEnabled);
        settings.put("maxBackups", MAX_BACKUPS);
        settings.put("backupDirectory", backupDir.toAbsolutePath().toString());
        settings.put("backupIntervalHours", backupIntervalHours);
        return settings;
    }

    public void setAutoBackupEnabled(boolean enabled) {
        this.autoBackupEnabled = enabled;
        saveSettings();
        log.info("Auto backup enabled: {}", enabled);
    }

    public void setBackupDirectory(String directory) throws IOException {
        Path newDir = Paths.get(directory);
        Files.createDirectories(newDir);
        this.backupDir = newDir;
        saveSettings();
        log.info("Backup directory changed to: {}", directory);
    }

    public boolean isAutoBackupEnabled() {
        return autoBackupEnabled;
    }

    public void setBackupInterval(int hours) {
        if (hours != 1 && hours != 4 && hours != 24) {
            throw new IllegalArgumentException("Invalid interval. Must be 1, 4, or 24 hours.");
        }
        this.backupIntervalHours = hours;
        saveSettings();
        log.info("Backup interval changed to: {} hours", hours);
    }

    public int getBackupIntervalHours() {
        return backupIntervalHours;
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduledBackup() {
        if (!autoBackupEnabled) {
            log.info("Scheduled backup skipped (disabled)");
            return;
        }

        try {
            String backupName = createBackup();
            log.info("Scheduled backup completed: {}", backupName);
        } catch (IOException e) {
            log.error("Scheduled backup failed", e);
        }
    }
}
