import { Router } from '@angular/router';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackService } from '../../core/services/track.service';
import { Track, TrackStatus } from '../../core/models/track.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">

      <!-- Cabeçalho -->
      <header class="dash-header">
        <div class="dash-header__title">
          <span class="dash-header__icon">🎵</span>
          <h1>Gerenciador de Sincronização</h1>
          <span class="dash-header__sub">Hebraico → Português</span>
        </div>
        <button class="btn btn--primary" (click)="openCreateDialog()">
          + Nova Track
        </button>
      </header>

      <!-- Estado: carregando -->
      @if (loading()) {
        <div class="state-message">
          <span class="spinner"></span> Carregando tracks...
        </div>
      }

      <!-- Estado: erro -->
      @if (error()) {
        <div class="state-message state-message--error">
          ⚠️ {{ error() }}
          <button class="btn btn--ghost" (click)="loadTracks()">Tentar novamente</button>
        </div>
      }

      <!-- Estado: lista vazia -->
      @if (!loading() && !error() && tracks().length === 0) {
        <div class="state-message state-message--empty">
          <span style="font-size:3rem">🎼</span>
          <p>Nenhuma track encontrada.</p>
          <button class="btn btn--primary" (click)="openCreateDialog()">
            Criar a primeira track
          </button>
        </div>
      }

      <!-- Grid de cards -->
      @if (tracks().length > 0) {
        <div class="track-grid">
          @for (track of tracks(); track track.id) {
            <div class="track-card">

              <!-- Status badge -->
              <span class="badge badge--{{ track.status.toLowerCase() }}">
                {{ statusLabel[track.status] }}
              </span>

              <!-- Títulos -->
              <h2 class="track-card__title">{{ track.title }}</h2>
              @if (track.titleHebrew) {
                <p class="track-card__hebrew" dir="rtl" lang="he">
                  {{ track.titleHebrew }}
                </p>
              }

              <!-- Metadados -->
              <div class="track-card__meta">
                <span>🎵 {{ track.lyricLineCount }} linhas</span>
                <span>📅 {{ track.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>

              <!-- Ações -->
              <div class="track-card__actions">
                <button class="btn btn--secondary" (click)="downloadSrt(track)">
                  ⬇ SRT
                </button>
                <button
                  class="btn btn--danger"
                  (click)="deleteTrack(track.id, track.title)">
                  🗑
                </button>
                <button class="btn btn--edit" (click)="editTrack(track.id)">
                ✏️ Editar
                </button>
              </div>

            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    /* Layout geral */
    .dashboard {
      min-height: 100vh;
      background: #f0f2f5;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      padding: 0 0 40px;
    }

    /* Cabeçalho */
    .dash-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 32px;
      background: #1a1a2e;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .dash-header__title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .dash-header__icon { font-size: 1.8rem; }
    .dash-header__title h1 { margin: 0; font-size: 1.4rem; font-weight: 600; }
    .dash-header__sub { font-size: 0.8rem; opacity: 0.6; }

    /* Estados (loading / erro / vazio) */
    .state-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 80px 24px;
      color: #555;
      font-size: 1rem;
      text-align: center;
    }
    .state-message--error { color: #c0392b; }
    .state-message--empty { color: #888; }

    /* Spinner simples */
    .spinner {
      display: inline-block;
      width: 24px; height: 24px;
      border: 3px solid #ddd;
      border-top-color: #4a90d9;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Grid de cards */
    .track-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 32px;
    }

    /* Card individual */
    .track-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .track-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.13);
    }
    .track-card__title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #1a1a2e;
    }
    .track-card__hebrew {
      margin: 0;
      font-family: 'David Libre', serif;
      font-size: 1.1rem;
      color: #4a90d9;
      line-height: 1.8;
    }
    .track-card__meta {
      display: flex;
      gap: 12px;
      font-size: 0.8rem;
      color: #888;
    }
    .track-card__actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    /* Badges de status */
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      width: fit-content;
    }
    .badge--draft       { background: #eee;    color: #666; }
    .badge--in_progress { background: #fff3cd; color: #856404; }
    .badge--completed   { background: #d1fae5; color: #065f46; }
    .badge--exported    { background: #dbeafe; color: #1e40af; }

    /* Botões */
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: opacity 0.15s, transform 0.1s;
    }
    .btn:hover  { opacity: 0.88; }
    .btn:active { transform: scale(0.97); }
    .btn--primary   { background: #4a90d9; color: white; }
    .btn--secondary { background: #e8f4f8; color: #1a5276; }
    .btn--danger    { background: #fdecea; color: #c0392b; }
    .btn--ghost     { background: transparent; color: #4a90d9;
                      border: 1px solid #4a90d9; }
  `]
})
export class DashboardComponent implements OnInit {

  private readonly trackService = inject(TrackService);

  private readonly router = inject(Router);

  editTrack(id: number): void {
    this.router.navigate(['/tracks', id, 'edit']);
  }

  // ── Estado reativo com Signals ────────────────────────────────────────────
  tracks  = signal<Track[]>([]);
  loading = signal(false);
  error   = signal<string | null>(null);

  // Mapa de rótulos amigáveis para cada status
  readonly statusLabel: Record<TrackStatus, string> = {
    DRAFT:       'Rascunho',
    IN_PROGRESS: 'Em progresso',
    COMPLETED:   'Concluído',
    EXPORTED:    'Exportado'
  };

  ngOnInit(): void {
    this.loadTracks();
  }

  loadTracks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.trackService.getTracks().subscribe({
      next: (page) => {
        this.tracks.set(page.content);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        this.loading.set(false);
        console.error('[Dashboard] Erro ao carregar tracks:', err);
      }
    });
  }

  openCreateDialog(): void {
    const title = window.prompt('Nome da nova track (ex: Shabbat Shalom):');
    if (!title?.trim()) return;

    const titleHebrew = window.prompt('Título em Hebraico (opcional):') ?? undefined;

    this.trackService.createTrack({ title: title.trim(), titleHebrew }).subscribe({
      next: (created) => {
        // Insere no topo da lista sem recarregar tudo
        this.tracks.update(current => [created, ...current]);
      },
      error: () => this.error.set('Erro ao criar a track. Tente novamente.')
    });
  }

  deleteTrack(id: number, title: string): void {
    if (!window.confirm(`Excluir "${title}"? Esta ação remove todas as linhas sincronizadas.`)) {
      return;
    }

    this.trackService.deleteTrack(id).subscribe({
      next: () => {
        // Remove localmente — sem nova chamada ao backend
        this.tracks.update(current => current.filter(t => t.id !== id));
      },
      error: () => this.error.set(`Erro ao excluir "${title}". Tente novamente.`)
    });
  }

  downloadSrt(track: Track): void {
    this.trackService.downloadSrt(track.id, track.title);
  }
}