import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LyricLine, LyricLineRequest } from '../models/lyric-line.model';

@Injectable({ providedIn: 'root' })
export class LyricLineService {

  private readonly http = inject(HttpClient);

  // Rota aninhada — espelha /api/tracks/{trackId}/lyric-lines do backend
  private url(trackId: number): string {
    return `http://localhost:8080/api/tracks/${trackId}/lyric-lines`;
  }

  // ── READ ──────────────────────────────────────────────────────────────────
  getByTrackId(trackId: number): Observable<LyricLine[]> {
    return this.http.get<LyricLine[]>(this.url(trackId));
  }

  // ── CREATE ────────────────────────────────────────────────────────────────
  create(trackId: number, payload: LyricLineRequest): Observable<LyricLine> {
    return this.http.post<LyricLine>(this.url(trackId), payload);
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────
  update(trackId: number, lineId: number, payload: LyricLineRequest): Observable<LyricLine> {
    return this.http.put<LyricLine>(`${this.url(trackId)}/${lineId}`, payload);
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  delete(trackId: number, lineId: number): Observable<void> {
    return this.http.delete<void>(`${this.url(trackId)}/${lineId}`);
  }

  // ── BATCH SAVE ────────────────────────────────────────────────────────────
  // Envia todas as linhas de uma vez — substitui o estado completo no backend
  batchSave(trackId: number, lines: LyricLineRequest[]): Observable<LyricLine[]> {
    return this.http.put<LyricLine[]>(`${this.url(trackId)}/batch`, lines);
  }
}