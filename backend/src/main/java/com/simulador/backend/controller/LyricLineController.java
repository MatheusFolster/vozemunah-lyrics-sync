package com.simulador.backend.controller;

import com.simulador.backend.dto.request.LyricLineCreateRequest;
import com.simulador.backend.dto.response.LyricLineDTO;
import com.simulador.backend.service.LyricLineService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Todos os endpoints são aninhados sob /api/tracks/{trackId}/lyric-lines
 * — reflete a relação de pertencimento: uma LyricLine sempre pertence a uma Track.
 */
@RestController
@RequestMapping("/api/tracks/{trackId}/lyric-lines")
@CrossOrigin(origins = "http://localhost:4200")
public class LyricLineController {

    private final LyricLineService lyricLineService;

    public LyricLineController(LyricLineService lyricLineService) {
        this.lyricLineService = lyricLineService;
    }

    // ── GET /api/tracks/{trackId}/lyric-lines ─────────────────────────────────
    // Retorna todas as linhas da track, ordenadas por startTimeMs ASC
    @GetMapping
    public ResponseEntity<List<LyricLineDTO>> findAll(@PathVariable Long trackId) {
        return ResponseEntity.ok(lyricLineService.findByTrackId(trackId));
    }

    // ── POST /api/tracks/{trackId}/lyric-lines ────────────────────────────────
    // Cria uma nova linha. Retorna 201 com Location apontando para a linha criada.
    @PostMapping
    public ResponseEntity<LyricLineDTO> create(
            @PathVariable Long trackId,
            @RequestBody @Valid LyricLineCreateRequest request) {

        LyricLineDTO created = lyricLineService.create(trackId, request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();

        return ResponseEntity.created(location).body(created);
        // IllegalStateException (endTimeMs <= startTimeMs) → Handler → 400
        // ResourceNotFoundException (trackId inválido) → Handler → 404
    }

    // ── PUT /api/tracks/{trackId}/lyric-lines/{lineId} ────────────────────────
    // Atualiza timestamps e/ou texto de uma linha existente (sincronização)
    @PutMapping("/{lineId}")
    public ResponseEntity<LyricLineDTO> update(
            @PathVariable Long trackId,
            @PathVariable Long lineId,
            @RequestBody @Valid LyricLineCreateRequest request) {

        return ResponseEntity.ok(lyricLineService.update(trackId, lineId, request));
    }

    // ── DELETE /api/tracks/{trackId}/lyric-lines/{lineId} ────────────────────
    @DeleteMapping("/{lineId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long trackId,
            @PathVariable Long lineId) {

        lyricLineService.delete(trackId, lineId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // ── PUT /api/tracks/{trackId}/lyric-lines/batch ───────────────────────────
    // Endpoint de performance: substitui TODAS as linhas da track em 1 transação.
    // Usado pelo editor ao clicar em "Salvar tudo" — evita N chamadas individuais.
    @PutMapping("/batch")
    public ResponseEntity<List<LyricLineDTO>> batchSave(
            @PathVariable Long trackId,
            @RequestBody @Valid List<LyricLineCreateRequest> requests) {

        return ResponseEntity.ok(lyricLineService.batchSave(trackId, requests));
    }
}
