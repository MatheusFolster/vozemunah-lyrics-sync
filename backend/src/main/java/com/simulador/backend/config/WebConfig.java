package com.simulador.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Lê o diretório de upload do application.properties
    // Padrão: ./uploads/audio — relativo à raiz do projeto
    @Value("${app.upload.dir:./uploads/audio}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // Converte o path relativo para absoluto
        // Ex: ./uploads/audio → /home/user/projeto/uploads/audio
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        // Mapeamento:
        // URL:  GET http://localhost:8080/uploads/audio/nome.mp3
        //         ↓
        // Disco: {raiz_do_projeto}/uploads/audio/nome.mp3
        registry.addResourceHandler("/uploads/audio/**")
                .addResourceLocations("file:" + uploadPath + "/")

                // Cache de 1 hora no browser — evita re-download durante a sessão
                // de sincronização onde o mesmo arquivo é ouvido várias vezes
                .setCachePeriod(3600);
    }
}