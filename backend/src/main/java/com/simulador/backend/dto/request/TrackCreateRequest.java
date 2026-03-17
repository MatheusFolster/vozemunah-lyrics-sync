package com.simulador.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TrackCreateRequest(

        @NotBlank(message = "O título é obrigatório")
        @Size(max = 255, message = "Título deve ter no máximo 255 caracteres")
        String title,

        @Size(max = 255, message = "Título hebraico deve ter no máximo 255 caracteres")
        String titleHebrew,

        String audioFileName,

        Long durationMs

) {}
