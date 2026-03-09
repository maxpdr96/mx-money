package com.mx.money.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mx.money.dto.CategorizationRuleRequest;
import com.mx.money.dto.CategorizationRuleResponse;
import com.mx.money.service.CategorizationRuleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategorizationRuleController Tests")
class CategorizationRuleControllerTest {

    @Mock
    private CategorizationRuleService categorizationRuleService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        CategorizationRuleController controller = new CategorizationRuleController(categorizationRuleService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("should list rules")
    void shouldListRules() throws Exception {
        when(categorizationRuleService.findAll()).thenReturn(List.of(
                CategorizationRuleResponse.builder().id(1L).keyword("ifood").categoryName("Alimentação").priority(10).enabled(true).build()
        ));

        mockMvc.perform(get("/api/categorization-rules"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].keyword", is("ifood")));
    }

    @Test
    @DisplayName("should create rule")
    void shouldCreateRule() throws Exception {
        CategorizationRuleRequest request = CategorizationRuleRequest.builder()
                .keyword("uber")
                .categoryName("Transporte")
                .priority(5)
                .enabled(true)
                .build();

        when(categorizationRuleService.create(any(CategorizationRuleRequest.class))).thenReturn(
                CategorizationRuleResponse.builder().id(2L).keyword("uber").categoryName("Transporte").priority(5).enabled(true).build()
        );

        mockMvc.perform(post("/api/categorization-rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(2)))
                .andExpect(jsonPath("$.categoryName", is("Transporte")));
    }

    @Test
    @DisplayName("should update rule")
    void shouldUpdateRule() throws Exception {
        CategorizationRuleRequest request = CategorizationRuleRequest.builder()
                .keyword("farmacia")
                .categoryName("Saúde")
                .priority(1)
                .enabled(true)
                .build();

        when(categorizationRuleService.update(eq(1L), any(CategorizationRuleRequest.class))).thenReturn(
                CategorizationRuleResponse.builder().id(1L).keyword("farmacia").categoryName("Saúde").priority(1).enabled(true).build()
        );

        mockMvc.perform(put("/api/categorization-rules/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priority", is(1)));
    }

    @Test
    @DisplayName("should delete rule")
    void shouldDeleteRule() throws Exception {
        mockMvc.perform(delete("/api/categorization-rules/1"))
                .andExpect(status().isNoContent());

        verify(categorizationRuleService).delete(1L);
    }
}
