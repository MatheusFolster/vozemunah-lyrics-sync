package com.simulador.backend.domain.repository;

import com.simulador.backend.domain.entity.Track;
import com.simulador.backend.domain.enums.TrackStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrackRepository extends JpaRepository<Track, Long> {

    Page<Track> findByStatus(TrackStatus status, Pageable pageable);

    @Query("SELECT t FROM Track t LEFT JOIN FETCH t.lyricLines WHERE t.id = :id")
    Optional<Track> findByIdWithLyricLines(@Param("id") Long id);
}
