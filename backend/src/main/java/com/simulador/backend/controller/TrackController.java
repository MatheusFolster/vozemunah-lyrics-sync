package com.simulador.backend.controller;

import com.simulador.backend.domain.enums.TrackStatus;
import com.simulador.backend.dto.request.TrackCreateRequest;
import com.simulador.backend.dto.response.TrackDTO;
import com.simulador.backend.exception.ResourceNotFoundException;
import com.simulador.backend.service.SrtExportService;
import com.simulador.backend.service.TrackService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/tracks")
public class TrackController {

    private final TrackService trackService;
    private final SrtExportService srtExportService;

    public TrackController(TrackService trackService, SrtExportService srtExportService) {
        this.trackService = trackService;
        this.srtExportService = srtExportService;
    }

    // ── GET /api/tracks ───────────────────────────────────────────────────────
    // Listagem paginada. Exemplo: GET /api/tracks?page=0&size=10&status=IN_PROGRESS
    @GetMapping
    public ResponseEntity<Page<TrackDTO>> findAll(
            @RequestParam(required = false) TrackStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        return ResponseEntity.ok(trackService.findAll(pageable, status));
    }

    // ── GET /api/tracks/{id} ──────────────────────────────────────────────────
    // Retorna a track com todas as LyricLines (para o editor)
    @GetMapping("/{id}")
    public ResponseEntity<TrackDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(trackService.findById(id));
        // ResourceNotFoundException → capturada pelo GlobalExceptionHandler → 404
    }

    // ── POST /api/tracks ──────────────────────────────────────────────────────
    // Cria nova track. Retorna 201 com Location header apontando para o novo recurso.
    @PostMapping
    public ResponseEntity<TrackDTO> create(@RequestBody @Valid TrackCreateRequest request) {
        TrackDTO created = trackService.create(request);

        // Location: /api/tracks/42  — boa prática REST para 201 Created
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    // ── PUT /api/tracks/{id} ──────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<TrackDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid TrackCreateRequest request) {

        return ResponseEntity.ok(trackService.update(id, request));
    }

    // ── DELETE /api/tracks/{id} ───────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        trackService.delete(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // ── POST /api/tracks/{id}/audio ───────────────────────────────────────────
    // Upload de arquivo de áudio. Salva em disco e atualiza a track.
    @PutMapping("/{id}/audio")
    public ResponseEntity<TrackDTO> uploadAudio(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        // Valida content-type — rejeita uploads que não sejam áudio
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("audio/")) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        }

        // Gera nome único para evitar colisões entre arquivos com mesmo nome
        String originalName = file.getOriginalFilename() != null
                ? file.getOriginalFilename()
                : "audio";
        String uniqueFileName = UUID.randomUUID() + "_" + originalName;

        // Salva o arquivo no diretório configurado
        Path uploadDir = Paths.get("uploads/audio");
        Files.createDirectories(uploadDir); // cria o diretório se não existir
        Path destination = uploadDir.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        // Duração não pode ser extraída server-side sem FFmpeg — o frontend
        // deve enviar via campo extra se necessário (simplificação intencional)
        TrackDTO updated = trackService.updateAudioFile(id, uniqueFileName, null);
        return ResponseEntity.ok(updated);
    }

    // ── GET /api/tracks/{id}/export-srt ───────────────────────────────────────
    // ENDPOINT CRÍTICO: gera e força o download do arquivo .srt
    @GetMapping("/{id}/export-srt")
    public ResponseEntity<byte[]> exportSrt(@PathVariable Long id) {

        // Busca a track para montar o nome do arquivo de download
        TrackDTO track = trackService.findById(id);

        // Gera o conteúdo SRT com BOM UTF-8 (lógica centralizada no Service)
        byte[] srtBytes = srtExportService.generateSrt(id);

        // Sanitiza o título para uso como nome de arquivo
        // Remove caracteres inválidos em filesystems Windows/Linux
        String safeTitle = track.title()
                .replaceAll("[^a-zA-Z0-9\\-_\\s]", "")
                .trim()
                .replace(" ", "_");
        String fileName = safeTitle + ".srt";

        HttpHeaders headers = new HttpHeaders();

        // Content-Disposition: attachment → força download (não exibição inline)
        // ContentDisposition.builder garante encoding correto do nome do arquivo
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename(fileName, StandardCharsets.UTF_8)
                        .build()
        );

        // application/x-subrip é o MIME type oficial para .srt
        // Fallback: application/octet-stream (download genérico) também funciona
        headers.setContentType(new MediaType("application", "x-subrip",  StandardCharsets.UTF_8));

        // Content-Length evita chunked transfer e melhora a barra de progresso do browser
        headers.setContentLength(srtBytes.length);

        return new ResponseEntity<>(srtBytes, headers, HttpStatus.OK);
    }
}
