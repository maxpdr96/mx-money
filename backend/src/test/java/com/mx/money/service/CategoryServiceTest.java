package com.mx.money.service;

import com.mx.money.dto.CategoryRequest;
import com.mx.money.dto.CategoryResponse;
import com.mx.money.entity.Category;
import com.mx.money.mapper.CategoryMapper;
import com.mx.money.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryService Tests")
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryService categoryService;

    private Category category;
    private CategoryRequest categoryRequest;
    private CategoryResponse categoryResponse;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Alimentação");
        category.setColor("#FF5733");
        category.setIcon("utensils");

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
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("should return all categories")
        void shouldReturnAllCategories() {
            // Given
            List<Category> categories = List.of(category);
            List<CategoryResponse> responses = List.of(categoryResponse);
            when(categoryRepository.findAll()).thenReturn(categories);
            when(categoryMapper.toResponseList(anyList())).thenReturn(responses);

            // When
            List<CategoryResponse> result = categoryService.findAll();

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Alimentação");
            verify(categoryRepository).findAll();
        }

        @Test
        @DisplayName("should return empty list when no categories exist")
        void shouldReturnEmptyList() {
            // Given
            when(categoryRepository.findAll()).thenReturn(List.of());
            when(categoryMapper.toResponseList(anyList())).thenReturn(List.of());

            // When
            List<CategoryResponse> result = categoryService.findAll();

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("should return category when found")
        void shouldReturnCategoryWhenFound() {
            // Given
            when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
            when(categoryMapper.toResponse(category)).thenReturn(categoryResponse);

            // When
            CategoryResponse result = categoryService.findById(1L);

            // Then
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getName()).isEqualTo("Alimentação");
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when not found")
        void shouldThrowExceptionWhenNotFound() {
            // Given
            when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> categoryService.findById(99L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("should create category successfully")
        void shouldCreateCategorySuccessfully() {
            // Given
            when(categoryRepository.existsByName("Alimentação")).thenReturn(false);
            when(categoryMapper.toEntity(categoryRequest)).thenReturn(category);
            when(categoryRepository.save(any(Category.class))).thenReturn(category);
            when(categoryMapper.toResponse(category)).thenReturn(categoryResponse);

            // When
            CategoryResponse result = categoryService.create(categoryRequest);

            // Then
            assertThat(result.getName()).isEqualTo("Alimentação");
            verify(categoryRepository).save(any(Category.class));
        }

        @Test
        @DisplayName("should throw IllegalArgumentException when category name already exists")
        void shouldThrowExceptionWhenNameExists() {
            // Given
            when(categoryRepository.existsByName("Alimentação")).thenReturn(true);

            // When/Then
            assertThatThrownBy(() -> categoryService.create(categoryRequest))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Alimentação");
            verify(categoryRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("should update existing category")
        void shouldUpdateExistingCategory() {
            // Given
            when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
            when(categoryRepository.save(any(Category.class))).thenReturn(category);
            when(categoryMapper.toResponse(category)).thenReturn(categoryResponse);

            // When
            CategoryResponse result = categoryService.update(1L, categoryRequest);

            // Then
            assertThat(result).isNotNull();
            verify(categoryMapper).updateEntity(categoryRequest, category);
            verify(categoryRepository).save(category);
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when updating non-existent category")
        void shouldThrowExceptionWhenUpdatingNonExistent() {
            // Given
            when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> categoryService.update(99L, categoryRequest))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete")
    class DeleteTests {

        @Test
        @DisplayName("should delete existing category")
        void shouldDeleteExistingCategory() {
            // Given
            when(categoryRepository.existsById(1L)).thenReturn(true);

            // When
            categoryService.delete(1L);

            // Then
            verify(categoryRepository).deleteById(1L);
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when deleting non-existent category")
        void shouldThrowExceptionWhenDeletingNonExistent() {
            // Given
            when(categoryRepository.existsById(99L)).thenReturn(false);

            // When/Then
            assertThatThrownBy(() -> categoryService.delete(99L))
                    .isInstanceOf(EntityNotFoundException.class);
            verify(categoryRepository, never()).deleteById(anyLong());
        }
    }

    @Nested
    @DisplayName("findEntityById")
    class FindEntityByIdTests {

        @Test
        @DisplayName("should return entity when found")
        void shouldReturnEntityWhenFound() {
            // Given
            when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

            // When
            Category result = categoryService.findEntityById(1L);

            // Then
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getName()).isEqualTo("Alimentação");
        }

        @Test
        @DisplayName("should throw EntityNotFoundException when entity not found")
        void shouldThrowExceptionWhenEntityNotFound() {
            // Given
            when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> categoryService.findEntityById(99L))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }
}
