import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Track, PageResponse, TrackStatus } from '../models/track.model';

@Injectable({ providedIn: 'root' })
export class TrackService {

  private readonly http = inject(HttpClient);

  // Centraliza a base URL — troque por environment.apiUrl quando configurar environments
  private readonly baseUrl = 'http://localhost:8080/api/tracks';

  // ── Listagem paginada ───────────────────────────────────────────────────────
  getTracks(page = 0, size = 20, status?: TrackStatus): Observable<PageResponse<Track>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'createdAt,desc');

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PageResponse<Track>>(this.baseUrl, { params });
  }

  // ── Busca por ID (com lyricLines — para o editor) ──────────────────────────
  getTrackById(id: number): Observable<Track> {
    return this.http.get<Track>(`${this.baseUrl}/${id}`);
  }

  // ── Criação ─────────────────────────────────────────────────────────────────
  createTrack(payload: { title: string; titleHebrew?: string }): Observable<Track> {
    return this.http.post<Track>(this.baseUrl, payload);
  }

  // ── Remoção ─────────────────────────────────────────────────────────────────
  deleteTrack(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ── Download do SRT ─────────────────────────────────────────────────────────
  // Não usa HttpClient — cria um link temporário e dispara o download no browser
  downloadSrt(id: number, trackTitle: string): void {
    const url = `${this.baseUrl}/${id}/export-srt`;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${trackTitle}.srt`;
    anchor.click();
    anchor.remove();
  }

  // ── Upload de áudio ────────────────────────────────────────────────────────
  uploadAudio(id: number, file: File): Observable<Track> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.put<Track>(`${this.baseUrl}/${id}/audio`, form);
  }
}