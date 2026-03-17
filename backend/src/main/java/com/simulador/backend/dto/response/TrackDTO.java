package com.simulador.backend.dto.response;

import com.simulador.backend.domain.enums.TrackStatus;

import java.time.LocalDateTime;
import java.util.List;

public record TrackDTO(

        Long id,
        String title,
        String titleHebrew,
        String audioFileName,
        Long durationMs,
        TrackStatus status,

        // Contagem rápida para exibir no card da listagem
        int lyricLineCount,

        // Presente apenas quando a track é carregada com JOIN FETCH (editor/exportação)
        List<LyricLineDTO> lyricLines,

        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}

