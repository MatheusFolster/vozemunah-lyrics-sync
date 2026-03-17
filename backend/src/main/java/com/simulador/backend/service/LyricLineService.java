package com.simulador.backend.service;

import com.simulador.backend.domain.entity.LyricLine;
import com.simulador.backend.domain.entity.Track;
import com.simulador.backend.domain.enums.TrackStatus;
import com.simulador.backend.domain.repository.LyricLineRepository;
import com.simulador.backend.domain.repository.TrackRepository;
import com.simulador.backend.dto.request.LyricLineCreateRequest;
import com.simulador.backend.dto.response.LyricLineDTO;
import com.simulador.backend.exception.ResourceNotFoundException;
import com.simulador.backend.mapper.LyricLineMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LyricLineService {

    private final LyricLineRepository lyricLineRepository;
    private final TrackRepository trackRepository;
    private final LyricLineMapper lyricLineMapper;

    public LyricLineService(
            LyricLineRepository lyricLineRepository,
            TrackRepository trackRepository,
            LyricLineMapper lyricLineMapper) {
        this.lyricLineRepository = lyricLineRepository;
        this.trackRepository = trackRepository;
        this.lyricLineMapper = lyricLineMapper;
    }

    // ── READ: Busca todas as linhas de uma track ──────────────────────────────

    /**
     * Retorna todas as LyricLines de uma track, ordenadas por startTimeMs ASC.
     * A ordenação é garantida pelo nome do método no Repository — sem @Query.
     *
     * @throws ResourceNotFoundException se a track não existir
     */
    @Transactional(readOnly = true)
    public List<LyricLineDTO> findByTrackId(Long trackId) {
        // Valida que a track existe antes de buscar as linhas
        // Evita retornar lista vazia silenciosa para um trackId inválido
        if (!trackRepository.existsById(trackId)) {
            throw new ResourceNotFoundException("Track", "id", trackId);
        }

        return lyricLineRepository
                .findByTrackIdOrderByStartTimeMsAsc(trackId)
                .stream()
                .map(lyricLineMapper::toDTO)
                .toList();
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    /**
     * Cria uma nova LyricLine vinculada à track informada.
     * A validação de timestamps (endTimeMs > startTimeMs) é disparada
     * automaticamente pelo @PrePersist da entidade LyricLine.
     *
     * @throws ResourceNotFoundException se a track não existir
     * @throws IllegalStateException     se endTimeMs <= startTimeMs (via @PrePersist)
     */
    @Transactional
    public LyricLineDTO create(Long trackId, LyricLineCreateRequest request) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track", "id", trackId));

        LyricLine newLine = lyricLineMapper.toEntity(request, track);
        LyricLine saved = lyricLineRepository.save(newLine);

        return lyricLineMapper.toDTO(saved);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    /**
     * Atualiza uma LyricLine existente.
     * Valida que a linha pertence à track informada — impede atualização
     * cruzada entre tracks via URL manipulation (ex: PUT /tracks/2/lyric-lines/99
     * onde a linha 99 pertence à track 1).
     *
     * @throws ResourceNotFoundException se a track ou a linha não existirem
     * @throws IllegalStateException     se endTimeMs <= startTimeMs (via @PreUpdate)
     */
    @Transactional
    public LyricLineDTO update(Long trackId, Long lineId, LyricLineCreateRequest request) {
        // Valida existência da track
        if (!trackRepository.existsById(trackId)) {
            throw new ResourceNotFoundException("Track", "id", trackId);
        }

        // Busca a linha e valida que ela pertence à track informada
        LyricLine line = lyricLineRepository.findById(lineId)
                .orElseThrow(() -> new ResourceNotFoundException("LyricLine", "id", lineId));

        if (!line.getTrack().getId().equals(trackId)) {
            throw new ResourceNotFoundException(
                    "LyricLine", "id", lineId + " na Track " + trackId
            );
        }

        lyricLineMapper.updateEntity(line, request);
        LyricLine updated = lyricLineRepository.save(line);

        return lyricLineMapper.toDTO(updated);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    /**
     * Remove uma LyricLine específica.
     * Aplica a mesma validação de pertencimento do update
     * para evitar deleção cruzada entre tracks.
     *
     * @throws ResourceNotFoundException se a track ou a linha não existirem
     */
    @Transactional
    public void delete(Long trackId, Long lineId) {
        if (!trackRepository.existsById(trackId)) {
            throw new ResourceNotFoundException("Track", "id", trackId);
        }

        LyricLine line = lyricLineRepository.findById(lineId)
                .orElseThrow(() -> new ResourceNotFoundException("LyricLine", "id", lineId));

        if (!line.getTrack().getId().equals(trackId)) {
            throw new ResourceNotFoundException(
                    "LyricLine", "id", lineId + " na Track " + trackId
            );
        }

        lyricLineRepository.delete(line);
    }

    // ── BATCH SAVE ────────────────────────────────────────────────────────────

    /**
     * Substitui TODAS as linhas de uma track em uma única transação atômica.
     * Estratégia: delete-all + insert-all (mais simples e seguro que diff/merge).
     *
     * Fluxo:
     *   1. Valida existência da track
     *   2. Deleta todas as linhas existentes via @Modifying query (uma única DELETE)
     *   3. Persiste a nova lista
     *   4. Atualiza o status da track automaticamente:
     *      - Todas com textPortuguese preenchido → COMPLETED
     *      - Pelo menos uma linha presente       → IN_PROGRESS
     *      - Lista vazia                         → DRAFT
     *
     * @throws ResourceNotFoundException se a track não existir
     * @throws IllegalStateException     se qualquer linha tiver endTimeMs <= startTimeMs
     */
    @Transactional
    public List<LyricLineDTO> batchSave(Long trackId, List<LyricLineCreateRequest> requests) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track", "id", trackId));

        // Passo 1: remove todas as linhas existentes em uma única query DELETE
        lyricLineRepository.deleteByTrackId(trackId);

        // Passo 2: flush garante que o DELETE é enviado ao banco ANTES dos INSERTs
        // Sem isso, o Hibernate pode reordenar as operações e violar constraints de unicidade
        lyricLineRepository.flush();

        // Passo 3: constrói e persiste todas as novas linhas
        // @PrePersist de cada entidade valida endTimeMs > startTimeMs automaticamente
        List<LyricLine> newLines = requests.stream()
                .map(req -> lyricLineMapper.toEntity(req, track))
                .toList();

        List<LyricLine> saved = lyricLineRepository.saveAll(newLines);

        // Passo 4: atualiza o status da track com base no estado das linhas
        track.setStatus(resolveTrackStatus(requests));
        trackRepository.save(track);

        return saved.stream()
                .map(lyricLineMapper::toDTO)
                .toList();
    }

    // ── Helper: calcula o status da track após batchSave ─────────────────────

    private TrackStatus resolveTrackStatus(List<LyricLineCreateRequest> requests) {
        if (requests.isEmpty()) {
            return TrackStatus.DRAFT;
        }

        boolean allTranslated = requests.stream()
                .allMatch(req ->
                        req.textPortuguese() != null && !req.textPortuguese().isBlank()
                );

        return allTranslated ? TrackStatus.COMPLETED : TrackStatus.IN_PROGRESS;
    }
}
