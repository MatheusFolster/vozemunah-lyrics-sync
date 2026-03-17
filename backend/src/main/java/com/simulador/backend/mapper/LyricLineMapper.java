package com.simulador.backend.mapper;

import com.simulador.backend.domain.entity.LyricLine;
import com.simulador.backend.domain.entity.Track;
import com.simulador.backend.dto.request.LyricLineCreateRequest;
import com.simulador.backend.dto.response.LyricLineDTO;
import org.springframework.stereotype.Component;

@Component
public class LyricLineMapper {

    public LyricLineDTO toDTO(LyricLine line) {
        return new LyricLineDTO(
                line.getId(),
                line.getTrack().getId(),
                line.getTextHebrew(),
                line.getTextPortuguese(),
                line.getStartTimeMs(),
                line.getEndTimeMs(),
                line.getLineOrder()
        );
    }

    public LyricLine toEntity(LyricLineCreateRequest request, Track track) {
        return LyricLine.builder()
                .track(track)
                .textHebrew(request.textHebrew())
                .textPortuguese(request.textPortuguese())
                .startTimeMs(request.startTimeMs())
                .endTimeMs(request.endTimeMs())
                .lineOrder(request.lineOrder())
                .build();
    }

    public void updateEntity(LyricLine line, LyricLineCreateRequest request) {
        line.setTextHebrew(request.textHebrew());
        line.setTextPortuguese(request.textPortuguese());
        line.setStartTimeMs(request.startTimeMs());
        line.setEndTimeMs(request.endTimeMs());
        line.setLineOrder(request.lineOrder());

    }
}
