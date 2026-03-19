package com.simulador.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Origem do frontend Angular em desenvolvimento
        config.addAllowedOrigin("http://localhost:4200");

        // Todos os métodos — incluindo OPTIONS (preflight) e PUT (upload)
        config.addAllowedMethod("*");

        // Todos os headers — incluindo Content-Type multipart e os custom headers
        config.addAllowedHeader("*");

        // Necessário se o frontend enviar cookies ou Authorization header
        config.setAllowCredentials(true);

        // Quanto tempo o browser pode cachear a resposta do preflight (em segundos)
        // 3600 = 1 hora — evita um OPTIONS a cada requisição durante desenvolvimento
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // Aplica para todas as rotas da API
        source.registerCorsConfiguration("/api/**", config); // endpoints REST
        source.registerCorsConfiguration("/uploads/**", config); // arquivos estáticos

        // CorsFilter atua na camada de Servlet — ANTES de qualquer interceptor
        // ou DispatcherServlet, garantindo que o OPTIONS seja respondido corretamente
        return new CorsFilter(source);
    }
}
