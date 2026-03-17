package com.simulador.backend.dto.response;

public record LyricLineDTO(

        Long id,

        // Referência ao pai — útil para o frontend montar requests de update
        Long trackId,

        // Texto original em Hebraico (UTF-8, pode conter nikud/vogais)
        String textHebrew,

        // Tradução em Português — pode ser null se ainda não traduzida
        String textPortuguese,

        // Timestamps em milissegundos: ex: 1500 → "00:00:01,500" no SRT
        Long startTimeMs,
        Long endTimeMs,

        // Desempate de ordenação quando dois startTimeMs são idênticos
        Integer lineOrder

) {}

