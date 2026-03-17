package com.simulador.backend.domain.entity;

import com.simulador.backend.domain.enums.TrackStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tracks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O título é obrigatório")
    @Size(max = 255, message = "Título deve ter no máximo 255 caracteres")
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Size(max = 255)
    @Column(name = "title_hebrew", length = 255)
    private String titleHebrew;

    @Column(name = "audio_file_name", length = 500)
    private String audioFileName;

    @Column(name = "duration_ms")
    private Long durationMs;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TrackStatus status = TrackStatus.DRAFT;

    @OneToMany(
            mappedBy = "track",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @OrderBy("startTimeMs ASC") // Sempre retorna na ordem cronológica
    @Builder.Default
    private List<LyricLine> lyricLines = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void addLyricLine(LyricLine line) {
        lyricLines.add(line);
        line.setTrack(this);
    }

    public void removeLyricLine(LyricLine line) {
        lyricLines.remove(line);
        line.setTrack(null);
    }
}
