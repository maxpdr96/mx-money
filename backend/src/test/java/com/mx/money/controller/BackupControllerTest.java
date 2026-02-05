package com.mx.money.controller;

import com.mx.money.service.BackupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.OutputStream;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BackupController Tests")
class BackupControllerTest {

    @Mock
    private BackupService backupService;

    @InjectMocks
    private BackupController backupController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(backupController).build();
    }

    @Nested
    @DisplayName("GET /api/backup")
    class ListBackupsTests {

        @Test
        @DisplayName("should return list of backups")
        void shouldReturnListOfBackups() throws Exception {
            // Given
            List<Map<String, Object>> backups = List.of(
                    Map.of("name", "backup_2024-01-15.db", "size", 1024L),
                    Map.of("name", "backup_2024-01-14.db", "size", 1020L));
            when(backupService.listBackups()).thenReturn(backups);

            // When/Then
            mockMvc.perform(get("/api/backup"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].name", is("backup_2024-01-15.db")));

            verify(backupService).listBackups();
        }

        @Test
        @DisplayName("should return empty list when no backups exist")
        void shouldReturnEmptyList() throws Exception {
            // Given
            when(backupService.listBackups()).thenReturn(List.of());

            // When/Then
            mockMvc.perform(get("/api/backup"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("POST /api/backup")
    class CreateBackupTests {

        @Test
        @DisplayName("should create backup successfully")
        void shouldCreateBackup() throws Exception {
            // Given
            when(backupService.createBackup()).thenReturn("backup_2024-01-15_12-00-00.db");

            // When/Then
            mockMvc.perform(post("/api/backup"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name", is("backup_2024-01-15_12-00-00.db")))
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
            // Given
            doNothing().when(backupService).deleteBackup("backup_2024-01-15.db");

            // When/Then
            mockMvc.perform(delete("/api/backup/backup_2024-01-15.db"))
                    .andExpect(status().isNoContent());

            verify(backupService).deleteBackup("backup_2024-01-15.db");
        }
    }

    @Nested
    @DisplayName("POST /api/backup/restore/{backupName}")
    class RestoreBackupTests {

        @Test
        @DisplayName("should restore backup successfully")
        void shouldRestoreBackup() throws Exception {
            // Given
            doNothing().when(backupService).restoreBackup("backup_2024-01-15.db");

            // When/Then
            mockMvc.perform(post("/api/backup/restore/backup_2024-01-15.db"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message", containsString("restored")));

            verify(backupService).restoreBackup("backup_2024-01-15.db");
        }
    }

    @Nested
    @DisplayName("GET /api/backup/export")
    class ExportDatabaseTests {

        @Test
        @DisplayName("should export database as file")
        void shouldExportDatabase() throws Exception {
            // Given
            doAnswer(invocation -> {
                OutputStream os = invocation.getArgument(0);
                os.write("mock database content".getBytes());
                return null;
            }).when(backupService).exportDatabase(any(OutputStream.class));

            // When/Then
            mockMvc.perform(get("/api/backup/export"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Disposition", containsString("attachment")))
                    .andExpect(header().string("Content-Disposition", containsString(".db")));

            verify(backupService).exportDatabase(any(OutputStream.class));
        }
    }

    @Nested
    @DisplayName("POST /api/backup/import")
    class ImportDatabaseTests {

        @Test
        @DisplayName("should import database from file")
        void shouldImportDatabase() throws Exception {
            // Given
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "backup.db",
                    MediaType.APPLICATION_OCTET_STREAM_VALUE,
                    "mock database content".getBytes());
            doNothing().when(backupService).importDatabase(any());

            // When/Then
            mockMvc.perform(multipart("/api/backup/import").file(file))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message", containsString("imported")));

            verify(backupService).importDatabase(any());
        }

        @Test
        @DisplayName("should return 400 when file is empty")
        void shouldReturn400WhenFileEmpty() throws Exception {
            // Given
            MockMultipartFile emptyFile = new MockMultipartFile(
                    "file",
                    "empty.db",
                    MediaType.APPLICATION_OCTET_STREAM_VALUE,
                    new byte[0]);

            // When/Then
            mockMvc.perform(multipart("/api/backup/import").file(emptyFile))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error", containsString("empty")));

            verify(backupService, never()).importDatabase(any());
        }
    }

    @Nested
    @DisplayName("GET /api/backup/settings")
    class GetSettingsTests {

        @Test
        @DisplayName("should return backup settings")
        void shouldReturnSettings() throws Exception {
            // Given
            Map<String, Object> settings = Map.of(
                    "autoBackupEnabled", true,
                    "backupDirectory", "/home/user/backups");
            when(backupService.getSettings()).thenReturn(settings);

            // When/Then
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
            // Given
            when(backupService.getSettings()).thenReturn(Map.of("autoBackupEnabled", true));

            // When/Then
            mockMvc.perform(put("/api/backup/settings/auto-backup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"enabled\": true}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.autoBackupEnabled", is(true)));

            verify(backupService).setAutoBackupEnabled(true);
        }

        @Test
        @DisplayName("should disable auto backup")
        void shouldDisableAutoBackup() throws Exception {
            // Given
            when(backupService.getSettings()).thenReturn(Map.of("autoBackupEnabled", false));

            // When/Then
            mockMvc.perform(put("/api/backup/settings/auto-backup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"enabled\": false}"))
                    .andExpect(status().isOk());

            verify(backupService).setAutoBackupEnabled(false);
        }
    }

    @Nested
    @DisplayName("PUT /api/backup/settings/directory")
    class SetBackupDirectoryTests {

        @Test
        @DisplayName("should update backup directory")
        void shouldUpdateDirectory() throws Exception {
            // Given
            when(backupService.getSettings()).thenReturn(Map.of("backupDirectory", "/new/path"));

            // When/Then
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
            // When/Then
            mockMvc.perform(put("/api/backup/settings/directory")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"directory\": \"\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error", containsString("required")));

            verify(backupService, never()).setBackupDirectory(anyString());
        }
    }
}
