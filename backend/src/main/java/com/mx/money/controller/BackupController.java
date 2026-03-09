package com.mx.money.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mx.money.dto.BackupJsonData;
import com.mx.money.service.BackupService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final BackupService backupService;
    private final ObjectMapper objectMapper;

    public BackupController(BackupService backupService, ObjectMapper objectMapper) {
        this.backupService = backupService;
        this.objectMapper = objectMapper;
    }

    /**
     * List all backups
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listBackups() throws IOException {
        return ResponseEntity.ok(backupService.listBackups());
    }

    /**
     * Create a new backup
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> createBackup() throws IOException {
        String backupName = backupService.createBackup();
        return ResponseEntity.ok(Map.of("name", backupName, "message", "Backup created successfully"));
    }

    /**
     * Delete a backup
     */
    @DeleteMapping("/{backupName}")
    public ResponseEntity<Void> deleteBackup(@PathVariable String backupName) throws IOException {
        backupService.deleteBackup(backupName);
        return ResponseEntity.noContent().build();
    }

    /**
     * Restore from a backup
     */
    @PostMapping("/restore/{backupName}")
    public ResponseEntity<Map<String, String>> restoreBackup(@PathVariable String backupName) throws IOException {
        backupService.restoreBackup(backupName);
        return ResponseEntity.ok(Map.of("message", "Database restored from " + backupName));
    }

    /**
     * Export database as downloadable file
     */
    @GetMapping("/export")
    public ResponseEntity<Resource> exportDatabase() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        backupService.exportDatabase(baos);

        String filename = "mxmoney_export_" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss")) + ".db";

        InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(baos.toByteArray()));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(baos.size())
                .body(resource);
    }

    /**
     * Export data as JSON (categories + transactions)
     */
    @GetMapping("/export/json")
    public ResponseEntity<Resource> exportDatabaseAsJson() throws IOException {
        BackupJsonData data = backupService.exportDatabaseAsJson();
        byte[] bytes = objectMapper.writeValueAsBytes(data);

        String filename = "mxmoney_export_" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss")) + ".json";

        InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(bytes));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_JSON)
                .contentLength(bytes.length)
                .body(resource);
    }

    /**
     * Import database from uploaded file
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, String>> importDatabase(@RequestParam("file") MultipartFile file)
            throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        backupService.importDatabase(file.getInputStream());
        return ResponseEntity.ok(Map.of("message", "Database imported successfully. Please restart the application."));
    }

    /**
     * Import data from JSON (categories + transactions)
     */
    @PostMapping("/import/json")
    public ResponseEntity<Map<String, String>> importDatabaseFromJson(@RequestParam("file") MultipartFile file)
            throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        BackupJsonData backupJsonData;
        try {
            backupJsonData = objectMapper.readValue(file.getInputStream(), BackupJsonData.class);
        } catch (IOException e) {
            throw new IllegalArgumentException("Invalid JSON file.");
        }

        backupService.importDatabaseFromJson(backupJsonData);
        return ResponseEntity.ok(Map.of("message", "JSON data imported successfully."));
    }

    /**
     * Get backup settings
     */
    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        return ResponseEntity.ok(backupService.getSettings());
    }

    /**
     * Update auto backup setting
     */
    @PutMapping("/settings/auto-backup")
    public ResponseEntity<Map<String, Object>> setAutoBackup(@RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", true);
        backupService.setAutoBackupEnabled(enabled);
        return ResponseEntity.ok(backupService.getSettings());
    }

    /**
     * Update backup directory
     */
    @PutMapping("/settings/directory")
    public ResponseEntity<Map<String, Object>> setBackupDirectory(@RequestBody Map<String, String> body)
            throws IOException {
        String directory = body.get("directory");
        if (directory == null || directory.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Directory is required"));
        }
        backupService.setBackupDirectory(directory);
        return ResponseEntity.ok(backupService.getSettings());
    }

    /**
     * Update backup interval
     */
    @PutMapping("/settings/interval")
    public ResponseEntity<Map<String, Object>> setBackupInterval(@RequestBody Map<String, Integer> body) {
        Integer hours = body.get("hours");
        if (hours == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Hours is required"));
        }
        backupService.setBackupInterval(hours);
        return ResponseEntity.ok(backupService.getSettings());
    }
}
