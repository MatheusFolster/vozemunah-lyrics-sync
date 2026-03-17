package com.simulador.backend.service;

import com.simulador.backend.domain.entity.LyricLine;
import com.simulador.backend.domain.entity.Track;
import com.simulador.backend.domain.repository.TrackRepository;
import com.simulador.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class SrtExportService {

    private final TrackRepository trackRepository;

    public SrtExportService(TrackRepository trackRepository) {
        this.trackRepository = trackRepository;
    }

    @Transactional(readOnly = true)
    public byte[] generateSrt(Long trackId) {

        Track track = trackRepository.findByIdWithLyricLines(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track", "id", trackId));

        List<LyricLine> lines = track.getLyricLines();

        String srtContent = buildSrtContent(lines);

        return srtContent.getBytes(StandardCharsets.UTF_8);
    }

    private String buildSrtContent(List<LyricLine> lines) {
        StringBuilder srt = new StringBuilder();

        srt.append('\uFEFF');

        for (int i = 0; i < lines.size(); i++) {
            LyricLine line = lines.get(i);

            srt.append(i + 1).append('\n');

            srt.append(toSrtTimestamp(line.getStartTimeMs()))
                    .append(" --> ")
                    .append(toSrtTimestamp(line.getEndTimeMs()))
                    .append('\n');

            srt.append(line.getTextHebrew()).append('\n');

            if (line.getTextPortuguese() != null && !line.getTextPortuguese().isBlank()) {
                srt.append(line.getTextPortuguese()).append('\n');
            }

            srt.append('\n');
        }

        return srt.toString();
    }

    private String toSrtTimestamp(long ms) {

        long hours   = ms / 3_600_000L;
        long minutes = (ms % 3_600_000L) / 60_000L;
        long seconds = (ms % 60_000L)    / 1_000L;
        long millis  = ms % 1_000L;

        return String.format("%02d:%02d:%02d,%03d", hours, minutes, seconds, millis);
    }
}
