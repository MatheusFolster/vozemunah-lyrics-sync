package com.simulador.backend.service;

import com.simulador.backend.domain.entity.Track;
import com.simulador.backend.domain.enums.TrackStatus;
import com.simulador.backend.domain.repository.TrackRepository;
import com.simulador.backend.dto.request.TrackCreateRequest;
import com.simulador.backend.dto.response.TrackDTO;
import com.simulador.backend.exception.ResourceNotFoundException;
import com.simulador.backend.mapper.TrackMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrackService {

    private final TrackRepository trackRepository;
    private final TrackMapper trackMapper;

    public TrackService(TrackRepository trackRepository, TrackMapper trackMapper) {
        this.trackRepository = trackRepository;
        this.trackMapper = trackMapper;
    }

    @Transactional(readOnly = true)
    public Page<TrackDTO> findAll(Pageable pageable, TrackStatus status) {
        Page<Track> page = (status != null)
                ? trackRepository.findByStatus(status, pageable)
                : trackRepository.findAll(pageable);

        return page.map(trackMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public TrackDTO findById(Long id) {
        Track track = trackRepository.findByIdWithLyricLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Track", "id", id));

        return trackMapper.toDTOWithLines(track);
    }

    @Transactional
    public TrackDTO create(TrackCreateRequest request) {
        Track track = trackMapper.toEntity(request);
        Track saved = trackRepository.save(track);
        return trackMapper.toDTO(saved);
    }

    @Transactional
    public TrackDTO update(Long id, TrackCreateRequest request) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Track", "id", id));

        trackMapper.updateEntity(track, request);

        Track updated = trackRepository.save(track);
        return trackMapper.toDTO(updated);
    }

    //DELETE

    @Transactional
    public void delete(Long id) {

        if (!trackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Track", "id", id);
        }
        trackRepository.deleteById(id);
    }

    @Transactional
    public TrackDTO updateAudioFile(Long id, String audioFileName, Long durationMs) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Track", "id", id));

        track.setAudioFileName(audioFileName);
        track.setDurationMs(durationMs);

        return trackMapper.toDTO(trackRepository.save(track));
    }
}
