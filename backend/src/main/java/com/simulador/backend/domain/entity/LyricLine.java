package com.simulador.backend.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(
        name = "lyric_lines",
        indexes = {
                @Index(name = "idx_lyric_line_track_id",   columnList = "track_id"),
                @Index(name = "idx_lyric_line_start_time",  columnList = "start_time_ms")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LyricLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @NotBlank(message = "O texto em hebraico é obrigatório")
    @Column(name = "text_hebrew", nullable = false, columnDefinition = "TEXT")
    private String textHebrew;

    @Column(name = "text_portuguese", columnDefinition = "TEXT")
    private String textPortuguese;

    @NotNull(message = "O tempo de início é obrigatório")
    @Min(value = 0, message = "O tempo de início não pode ser negativo")
    @Column(name = "start_time_ms", nullable = false)
    private Long startTimeMs;

    @NotNull(message = "O tempo de fim é obrigatório")
    @Min(value = 1, message = "O tempo de fim deve ser positivo")
    @Column(name = "end_time_ms", nullable = false)
    private Long endTimeMs;

    @NotNull
    @Min(0)
    @Column(name = "line_order", nullable = false)
    private Integer lineOrder;

    @PrePersist
    @PreUpdate
    private void validateTimestamps() {
        if (endTimeMs <= startTimeMs) {
            throw new IllegalStateException(
                    String.format(
                            "endTimeMs (%d) deve ser maior que startTimeMs (%d)",
                            endTimeMs, startTimeMs
                    )
            );
        }
    }
}
