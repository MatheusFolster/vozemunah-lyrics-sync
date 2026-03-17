package com.simulador.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    // Construtor genérico: ResourceNotFoundException("Track não encontrada com id: 5")
    public ResourceNotFoundException(String message) {
        super(message);
    }

    // Construtor semântico: ResourceNotFoundException("Track", "id", 5)
    // Gera: "Track não encontrada com id: '5'"
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s não encontrada com %s: '%s'", resourceName, fieldName, fieldValue));
    }
}