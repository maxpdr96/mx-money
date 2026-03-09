package com.mx.money.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mx.money.dto.BackupJsonCategory;
import com.mx.money.dto.BackupJsonData;
import com.mx.money.dto.BackupJsonTransaction;
import com.mx.money.entity.TransactionType;
import com.mx.money.service.BackupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BackupController Tests")
class BackupControllerTest {

    @Mock
    private BackupService backupService;

    private BackupController backupController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        backupController = new BackupController(backupService, objectMapper);
        mockMvc = MockMvcBuilders.standaloneSetup(backupController).build();
    }

    @Nested
    @DisplayName("GET /api/backup")
    class ListBackupsTests {

        @Test
        @DisplayName("should return list of backups")
        void shouldReturnListOfBackups() throws Exception {
            List<Map<String, Object>> backups = List.of(
                    Map.of("name", "backup_2026-03-09_17-00-00.json", "size", 1024L),
                    Map.of("name", "backup_2026-03-08_17-00-00.json", "size", 980L));
            when(backupService.listBackups()).thenReturn(backups);

            mockMvc.perform(get("/api/backup"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].name", is("backup_2026-03-09_17-00-00.json")));

            verify(backupService).listBackups();
        }
    }

    @Nested
    @DisplayName("POST /api/backup")
    class CreateBackupTests {

        @Test
        @DisplayName("should create backup successfully")
        void shouldCreateBackup() throws Exception {
            when(backupService.createBackup()).thenReturn("backup_2026-03-09_17-00-00.json");

            mockMvc.perform(post("/api/backup"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name", is("backup_2026-03-09_17-00-00.json")))
                    .andExpect(jsonPath("$.message", containsString("successfully")));

            verify(backupService).createBackup();
        }
    }

    @Nested
    @DisplayName("DELETE /api/backup/{backupName}")
    class DeleteBackupTests {

        @Test
        @DisplayName("should delete backup successfully")
        void shouldDeleteBackup() throws Exception {
            doNothing().when(backupService).deleteBackup("backup_2026-03-09_17-00-00.json");

            mockMvc.perform(delete("/api/backup/backup_2026-03-09_17-00-00.json"))
                    .andExpect(status().isNoContent());

            verify(backupService).deleteBackup("backup_2026-03-09_17-00-00.json");
        }
    }

    @Nested
    @DisplayName("POST /api/backup/restore/{backupName}")
    class RestoreBackupTests {

        @Test
        @DisplayName("should restore backup successfully")
        void shouldRestoreBackup() throws Exception {
            doNothing().when(backupService).restoreBackup("backup_2026-03-09_17-00-00.json");

            mockMvc.perform(post("/api/backup/restore/backup_2026-03-09_17-00-00.json"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message", containsString("restored")));

            verify(backupService).restoreBackup("backup_2026-03-09_17-00-00.json");
        }
    }

    @Nested
    @DisplayName("GET /api/backup/export")
    class ExportJsonTests {

        @Test
        @DisplayName("should export data as json file")
        void shouldExportJson() throws Exception {
            BackupJsonData data = BackupJsonData.builder()
                    .version(1)
                    .exportedAt(LocalDateTime.now())
                    .categories(List.of(
                            BackupJsonCategory.builder().name("Moradia").color("#123456").icon("home").build()))
                    .transactions(List.of(
                            BackupJsonTransaction.builder()
                                    .description("Aluguel")
                                    .amount(new BigDecimal("1500.00"))
                                    .effectiveDate(LocalDate.of(2026, 3, 1))
                                    .type(TransactionType.EXPENSE)
                                    .categoryName("Moradia")
                                    .build()))
                    .build();

            when(backupService.exportDatabaseAsJson()).thenReturn(data);

            mockMvc.perform(get("/api/backup/export"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Disposition", containsString(".json")))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON));

            verify(backupService).exportDatabaseAsJson();
        }
    }

    @Nested
    @DisplayName("POST /api/backup/import")
    class ImportJsonTests {

        @Test
        @DisplayName("should import json data from file")
        void shouldImportJson() throws Exception {
            String json = """
                    {
                      "version": 1,
                      "categories": [
                        { "name": "Moradia", "color": "#123456", "icon": "home" }
                      ],
                      "transactions": [
                        {
                          "description": "Aluguel",
                          "amount": 1500.00,
                          "effectiveDate": "2026-03-01",
                          "type": "EXPENSE",
                          "recurrence": "MONTHLY",
                          "categoryName": "Moradia"
                        }
                      ]
                    }
                    """;

            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "backup.json",
                    MediaType.APPLICATION_JSON_VALUE,
                    json.getBytes());

            doNothing().when(backupService).importDatabaseFromJson(any(BackupJsonData.class));

            mockMvc.perform(multipart("/api/backup/import").file(file))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message", containsString("imported")));

            verify(backupService).importDatabaseFromJson(any(BackupJsonData.class));
        }

        @Test
        @DisplayName("should return 400 when file is empty")
        void shouldReturn400WhenFileEmpty() throws Exception {
            MockMultipartFile emptyFile = new MockMultipartFile(
                    "file",
                    "empty.json",
                    MediaType.APPLICATION_JSON_VALUE,
                    new byte[0]);

            mockMvc.perform(multipart("/api/backup/import").file(emptyFile))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error", containsString("empty")));

            verify(backupService, never()).importDatabaseFromJson(any());
        }
    }

    @Nested
    @DisplayName("GET /api/backup/settings")
    class GetSettingsTests {

        @Test
        @DisplayName("should return backup settings")
        void shouldReturnSettings() throws Exception {
            Map<String, Object> settings = Map.of(
                    "autoBackupEnabled", true,
                    "backupDirectory", "/home/user/backups");
            when(backupService.getSettings()).thenReturn(settings);

            mockMvc.perform(get("/api/backup/settings"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.autoBackupEnabled", is(true)))
                    .andExpect(jsonPath("$.backupDirectory", is("/home/user/backups")));
        }
    }

    @Nested
    @DisplayName("PUT /api/backup/settings/auto-backup")
    class SetAutoBackupTests {

        @Test
        @DisplayName("should enable auto backup")
        void shouldEnableAutoBackup() throws Exception {
            when(backupService.getSettings()).thenReturn(Map.of("autoBackupEnabled", true));

            mockMvc.perform(put("/api/backup/settings/auto-backup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"enabled\": true}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.autoBackupEnabled", is(true)));

            verify(backupService).setAutoBackupEnabled(true);
        }
    }

    @Nested
    @DisplayName("PUT /api/backup/settings/directory")
    class SetBackupDirectoryTests {

        @Test
        @DisplayName("should update backup directory")
        void shouldUpdateDirectory() throws Exception {
            when(backupService.getSettings()).thenReturn(Map.of("backupDirectory", "/new/path"));

            mockMvc.perform(put("/api/backup/settings/directory")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"directory\": \"/new/path\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.backupDirectory", is("/new/path")));

            verify(backupService).setBackupDirectory("/new/path");
        }

        @Test
        @DisplayName("should return 400 when directory is blank")
        void shouldReturn400WhenDirectoryBlank() throws Exception {
            mockMvc.perform(put("/api/backup/settings/directory")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"directory\": \"\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error", containsString("required")));

            verify(backupService, never()).setBackupDirectory(anyString());
        }
    }
}
