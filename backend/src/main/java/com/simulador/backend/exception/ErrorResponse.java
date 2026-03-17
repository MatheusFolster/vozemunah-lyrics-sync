package com.simulador.backend.exception;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        List<String> messages,
        String path
) {
    // Factory method para erros de campo único — atalho para o Handler
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(LocalDateTime.now(), status, error, List.of(message), path);
    }

    // Factory method para erros de validação — recebe lista de mensagens
    public static ErrorResponse of(int status, String error, List<String> messages, String path) {
        return new ErrorResponse(LocalDateTime.now(), status, error, messages, path);
    }
}
