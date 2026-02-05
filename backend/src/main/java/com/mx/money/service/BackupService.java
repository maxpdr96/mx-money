package com.mx.money.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.*;
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

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    private Path backupDir;
    private boolean autoBackupEnabled = true;
    private int backupIntervalHours = 24;

    public BackupService() {
        loadSettings();
        try {
            Files.createDirectories(backupDir);
        } catch (IOException e) {
            log.error("Failed to create backup directory", e);
        }
    }

    /**
     * Loads settings from file or uses defaults
     */
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

    /**
     * Saves settings to file
     */
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
     * Returns the path to the SQLite database file
     */
    private Path getDatabasePath() {
        // jdbc:sqlite:./data/mxmoney.db -> ./data/mxmoney.db
        String path = datasourceUrl.replace("jdbc:sqlite:", "");
        return Paths.get(path);
    }

    /**
     * Creates a backup of the database
     */
    public String createBackup() throws IOException {
        Path dbPath = getDatabasePath();
        if (!Files.exists(dbPath)) {
            throw new IOException("Database file not found: " + dbPath);
        }

        // Ensure backup directory exists
        Files.createDirectories(backupDir);

        String backupName = "backup_" + LocalDateTime.now().format(BACKUP_DATE_FORMAT) + ".db";
        Path backupPath = backupDir.resolve(backupName);

        Files.copy(dbPath, backupPath, StandardCopyOption.REPLACE_EXISTING);
        log.info("Backup created: {}", backupName);

        // Clean old backups
        cleanOldBackups();

        return backupName;
    }

    /**
     * Lists all existing backups
     */
    public List<Map<String, Object>> listBackups() throws IOException {
        if (!Files.exists(backupDir)) {
            return Collections.emptyList();
        }

        try (Stream<Path> paths = Files.list(backupDir)) {
            return paths
                    .filter(p -> p.getFileName().toString().endsWith(".db"))
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

    /**
     * Deletes a specific backup
     */
    public void deleteBackup(String backupName) throws IOException {
        Path backupPath = backupDir.resolve(backupName);
        if (!Files.exists(backupPath)) {
            throw new IOException("Backup not found: " + backupName);
        }
        Files.delete(backupPath);
        log.info("Backup deleted: {}", backupName);
    }

    /**
     * Exports the database to an output stream
     */
    public void exportDatabase(OutputStream outputStream) throws IOException {
        Path dbPath = getDatabasePath();
        Files.copy(dbPath, outputStream);
    }

    /**
     * Imports database from an input stream
     */
    public void importDatabase(InputStream inputStream) throws IOException {
        // First, create a backup before import
        createBackup();

        Path dbPath = getDatabasePath();
        Files.copy(inputStream, dbPath, StandardCopyOption.REPLACE_EXISTING);
        log.info("Database imported successfully");
    }

    /**
     * Restores from a specific backup
     */
    public void restoreBackup(String backupName) throws IOException {
        Path backupPath = backupDir.resolve(backupName);
        if (!Files.exists(backupPath)) {
            throw new IOException("Backup not found: " + backupName);
        }

        // Create a backup before restore
        createBackup();

        Path dbPath = getDatabasePath();
        Files.copy(backupPath, dbPath, StandardCopyOption.REPLACE_EXISTING);
        log.info("Database restored from: {}", backupName);
    }

    /**
     * Removes backups older than MAX_BACKUPS
     */
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

    /**
     * Gets backup settings
     */
    public Map<String, Object> getSettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("autoBackupEnabled", autoBackupEnabled);
        settings.put("maxBackups", MAX_BACKUPS);
        settings.put("backupDirectory", backupDir.toAbsolutePath().toString());
        settings.put("backupIntervalHours", backupIntervalHours);
        return settings;
    }

    /**
     * Updates auto backup setting
     */
    public void setAutoBackupEnabled(boolean enabled) {
        this.autoBackupEnabled = enabled;
        saveSettings();
        log.info("Auto backup enabled: {}", enabled);
    }

    /**
     * Updates backup directory
     */
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

    /**
     * Updates backup interval
     */
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

    /**
     * Scheduled backup - runs once per day at midnight
     */
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
