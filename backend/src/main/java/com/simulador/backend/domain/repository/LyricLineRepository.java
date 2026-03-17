package com.simulador.backend.domain.repository;

import com.simulador.backend.domain.entity.LyricLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface LyricLineRepository extends JpaRepository<LyricLine, Long> {

    List<LyricLine> findByTrackIdOrderByStartTimeMsAsc(Long trackId);

    @Modifying
    @Transactional
    @Query("DELETE FROM LyricLine l WHERE l.track.id = :trackId")
    void deleteByTrackId(@Param("trackId") Long trackId);
}
