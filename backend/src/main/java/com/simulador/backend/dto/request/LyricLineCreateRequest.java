package com.simulador.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LyricLineCreateRequest(

        @NotBlank(message = "O texto em hebraico é obrigatório")
        String textHebrew,

        String textPortuguese,

        @NotNull(message = "O tempo de início é obrigatório")
        @Min(value = 0, message = "O tempo de início não pode ser negativo")
        Long startTimeMs,

        @NotNull(message = "O tempo de fim é obrigatório")
        @Min(value = 1, message = "O tempo de fim deve ser positivo")
        Long endTimeMs,

        @NotNull(message = "A ordem da linha é obrigatória")
        @Min(value = 0, message = "A ordem não pode ser negativa")
        Integer lineOrder

) {}
