package com.simulador.backend.mapper;

import com.simulador.backend.domain.entity.Track;
import com.simulador.backend.dto.request.TrackCreateRequest;
import com.simulador.backend.dto.response.LyricLineDTO;
import com.simulador.backend.dto.response.TrackDTO;
import com.simulador.backend.domain.enums.TrackStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TrackMapper {

    private final LyricLineMapper lyricLineMapper;

    public TrackMapper(LyricLineMapper lyricLineMapper) {
        this.lyricLineMapper = lyricLineMapper;
    }

    public TrackDTO toDTO(Track track) {
        return toDTO(track, false);
    }

    public TrackDTO toDTOWithLines(Track track) {
        return toDTO(track, true);
    }

    private TrackDTO toDTO(Track track, boolean includeLyricLines) {
        List<LyricLineDTO> lines = null;

        if (includeLyricLines && track.getLyricLines() != null) {
            lines = track.getLyricLines()
                    .stream()
                    .map(lyricLineMapper::toDTO)
                    .toList(); // Java 16+ — imutável e sem boilerplate
        }

        return new TrackDTO(
                track.getId(),
                track.getTitle(),
                track.getTitleHebrew(),
                track.getAudioFileName(),
                track.getDurationMs(),
                track.getStatus(),
                track.getLyricLines() != null ? track.getLyricLines().size() : 0,
                lines,
                track.getCreatedAt(),
                track.getUpdatedAt()
        );
    }

    public Track toEntity(TrackCreateRequest request) {
        return Track.builder()
                .title(request.title())
                .titleHebrew(request.titleHebrew())
                .audioFileName(request.audioFileName())
                .durationMs(request.durationMs())
                .status(TrackStatus.DRAFT) // Status inicial sempre DRAFT
                .build();
    }

    public void updateEntity(Track track, TrackCreateRequest request) {
        track.setTitle(request.title());
        track.setTitleHebrew(request.titleHebrew());
        track.setAudioFileName(request.audioFileName());
        track.setDurationMs(request.durationMs());
    }
}
