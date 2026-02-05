package com.mx.money.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mx.money.exception.GlobalExceptionHandler;
import com.mx.money.dto.CategoryRequest;
import com.mx.money.dto.CategoryResponse;
import com.mx.money.service.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryController Tests")
class CategoryControllerTest {

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private CategoryRequest categoryRequest;
    private CategoryResponse categoryResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(categoryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();

        categoryRequest = new CategoryRequest();
        categoryRequest.setName("Alimentação");
        categoryRequest.setColor("#FF5733");
        categoryRequest.setIcon("utensils");

        categoryResponse = new CategoryResponse();
        categoryResponse.setId(1L);
        categoryResponse.setName("Alimentação");
        categoryResponse.setColor("#FF5733");
        categoryResponse.setIcon("utensils");
    }

    @Nested
    @DisplayName("GET /api/categories")
    class FindAllTests {

        @Test
        @DisplayName("should return all categories")
        void shouldReturnAllCategories() throws Exception {
            // Given
            when(categoryService.findAll()).thenReturn(List.of(categoryResponse));

            // When/Then
            mockMvc.perform(get("/api/categories"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].name", is("Alimentação")));

            verify(categoryService).findAll();
        }

        @Test
        @DisplayName("should return empty list when no categories exist")
        void shouldReturnEmptyList() throws Exception {
            // Given
            when(categoryService.findAll()).thenReturn(List.of());

            // When/Then
            mockMvc.perform(get("/api/categories"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/categories/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("should return category when found")
        void shouldReturnCategory() throws Exception {
            // Given
            when(categoryService.findById(1L)).thenReturn(categoryResponse);

            // When/Then
            mockMvc.perform(get("/api/categories/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.name", is("Alimentação")))
                    .andExpect(jsonPath("$.color", is("#FF5733")));
        }

        @Test
        @DisplayName("should return 404 when category not found")
        void shouldReturn404WhenNotFound() throws Exception {
            // Given
            when(categoryService.findById(99L)).thenThrow(new EntityNotFoundException("Categoria não encontrada"));

            // When/Then
            mockMvc.perform(get("/api/categories/99"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/categories")
    class CreateTests {

        @Test
        @DisplayName("should create category successfully")
        void shouldCreateCategory() throws Exception {
            // Given
            when(categoryService.create(any(CategoryRequest.class))).thenReturn(categoryResponse);

            // When/Then
            mockMvc.perform(post("/api/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(categoryRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.name", is("Alimentação")));

            verify(categoryService).create(any(CategoryRequest.class));
        }

        @Test
        @DisplayName("should return 400 when category name already exists")
        void shouldReturn400WhenNameExists() throws Exception {
            // Given
            when(categoryService.create(any(CategoryRequest.class)))
                    .thenThrow(new IllegalArgumentException("Categoria já existe"));

            // When/Then
            mockMvc.perform(post("/api/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(categoryRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/categories/{id}")
    class UpdateTests {

        @Test
        @DisplayName("should update category successfully")
        void shouldUpdateCategory() throws Exception {
            // Given
            when(categoryService.update(anyLong(), any(CategoryRequest.class))).thenReturn(categoryResponse);

            // When/Then
            mockMvc.perform(put("/api/categories/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(categoryRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(1)));

            verify(categoryService).update(eq(1L), any(CategoryRequest.class));
        }

        @Test
        @DisplayName("should return 404 when updating non-existent category")
        void shouldReturn404WhenUpdatingNonExistent() throws Exception {
            // Given
            when(categoryService.update(anyLong(), any(CategoryRequest.class)))
                    .thenThrow(new EntityNotFoundException("Categoria não encontrada"));

            // When/Then
            mockMvc.perform(put("/api/categories/99")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(categoryRequest)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/categories/{id}")
    class DeleteTests {

        @Test
        @DisplayName("should delete category successfully")
        void shouldDeleteCategory() throws Exception {
            // Given
            doNothing().when(categoryService).delete(1L);

            // When/Then
            mockMvc.perform(delete("/api/categories/1"))
                    .andExpect(status().isNoContent());

            verify(categoryService).delete(1L);
        }

        @Test
        @DisplayName("should return 404 when deleting non-existent category")
        void shouldReturn404WhenDeletingNonExistent() throws Exception {
            // Given
            doThrow(new EntityNotFoundException("Categoria não encontrada")).when(categoryService).delete(99L);

            // When/Then
            mockMvc.perform(delete("/api/categories/99"))
                    .andExpect(status().isNotFound());
        }
    }
}
