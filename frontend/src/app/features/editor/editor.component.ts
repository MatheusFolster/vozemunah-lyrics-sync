import {
  Component, OnInit, OnDestroy,
  inject, signal, computed,
  ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TrackService }     from '../../core/services/track.service';
import { LyricLineService } from '../../core/services/lyric-line.service';
import { Track }            from '../../core/models/track.model';
import { LyricLine }        from '../../core/models/lyric-line.model';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="editor">

      <!-- ── Cabeçalho ─────────────────────────────────────────────────── -->
      <header class="editor-header">
        <a routerLink="/" class="btn btn--ghost">← Voltar</a>

        @if (track()) {
          <div class="editor-header__titles">
            <span class="editor-header__title">{{ track()!.title }}</span>
            @if (track()!.titleHebrew) {
              <span class="editor-header__hebrew"
                    dir="rtl" lang="he">{{ track()!.titleHebrew }}</span>
            }
          </div>
        }

        <div class="editor-header__actions">
          <button class="btn btn--secondary"
                  (click)="addLine()"
                  title="Adicionar nova linha de legenda">
            + Linha
          </button>
          <button class="btn btn--primary"
                  [disabled]="saving()"
                  (click)="saveAll()">
            {{ saving() ? 'Salvando...' : '💾 Salvar Tudo' }}
          </button>
          <button class="btn btn--export"
                  [disabled]="!track()"
                  (click)="downloadSrt()"
                  title="Baixar arquivo .srt">
            ⬇ SRT
          </button>
        </div>
      </header>

      <!-- ── Mensagem de feedback ──────────────────────────────────────── -->
      @if (feedbackMsg()) {
        <div class="feedback" [class.feedback--error]="feedbackIsError()">
          {{ feedbackMsg() }}
        </div>
      }

    <!-- ── Player de Áudio ───────────────────────────────────────────────────── -->
<section class="player-section">

  <audio
    #audioRef
    [src]="audioSrc()"
    (timeupdate)="onTimeUpdate()"
    (loadedmetadata)="onMetadataLoaded()"
    (ended)="isPlaying.set(false)">
  </audio>

  <!-- Input de arquivo oculto — acionado pelo botão estilizado abaixo -->
  <input
    #fileInput
    type="file"
    accept="audio/*"
    style="display:none"
    (change)="onFileSelected($event)"/>

  <!-- Painel de upload: visível APENAS quando não há áudio vinculado -->
  @if (!track()?.audioFileName) {
    <div class="upload-panel">
      <span class="upload-panel__icon">🎵</span>
      <p class="upload-panel__text">Nenhum áudio vinculado a esta track.</p>
      <button
        class="btn btn--upload"
        [disabled]="uploading()"
        (click)="fileInput.click()">
        {{ uploading() ? 'Enviando...' : '⬆ Selecionar Arquivo de Áudio' }}
      </button>
      <span class="upload-panel__hint">MP3 · WAV · OGG · AAC — máx. 50MB</span>
    </div>
  }

  <!-- Player: visível APENAS quando há áudio vinculado -->
  @if (track()?.audioFileName) {
    <div class="player">

      <div class="player__controls">
        <button class="player__btn player__btn--rewind"
                (click)="skip(-5)" title="Voltar 5s">⏪</button>
        <button class="player__btn player__btn--play"
                (click)="togglePlay()">
          {{ isPlaying() ? '⏸' : '▶' }}
        </button>
        <button class="player__btn player__btn--forward"
                (click)="skip(5)" title="Avançar 5s">⏩</button>
      </div>

      <div class="player__progress-group">
        <span class="player__time">{{ formatMs(currentMs()) }}</span>
        <input
          class="player__seek"
          type="range"
          [min]="0"
          [max]="durationMs()"
          [value]="currentMs()"
          step="100"
          (input)="onSeek($event)"/>
        <span class="player__time">{{ formatMs(durationMs()) }}</span>
      </div>

      <div class="player__speed-group">
        <label class="player__speed-label">Velocidade</label>
        <select class="player__speed" (change)="onSpeedChange($event)">
          <option value="0.5">0.5×</option>
          <option value="0.75">0.75×</option>
          <option value="1" selected>1×</option>
          <option value="1.25">1.25×</option>
          <option value="1.5">1.5×</option>
        </select>
      </div>

      <!-- Botão de trocar áudio — visível mesmo com áudio já carregado -->
      <button
        class="btn btn--ghost btn--swap"
        [disabled]="uploading()"
        (click)="fileInput.click()"
        title="Substituir arquivo de áudio">
        {{ uploading() ? '...' : '⬆' }}
      </button>

    </div>
  }

</section>

      <!-- ── Editor Split-View ─────────────────────────────────────────── -->
      @if (loading()) {
        <div class="state-msg">Carregando linhas...</div>
      } @else {

        <div class="split-view">

          <!-- Painel Esquerdo: Hebraico (RTL) -->
          <div class="panel panel--hebrew" dir="rtl" lang="he">
            <div class="panel__header">עברית — Hebraico</div>

            <div class="panel__body" #hebrewPanel>
              @for (line of lines(); track line.lineOrder; let i = $index) {
                <div
                  [id]="'line-' + i"
                  class="lyric-row"
                  [class.lyric-row--active]="activeLine() === i">

                  <!-- Texto hebraico — readonly, vem do backend ou é digitado -->
                  <div class="lyric-row__text lyric-row__text--hebrew">
                    <textarea
                      class="lyric-textarea lyric-textarea--hebrew"
                      [(ngModel)]="lines()[i].textHebrew"
                      placeholder="טקסט עברי..."
                      rows="2"
                      dir="rtl">
                    </textarea>
                  </div>

                  <!-- Timestamps como botões clicáveis -->
                  <!-- Clicar captura o tempo ATUAL do player para aquela linha -->
                  <div class="lyric-row__timestamps">
                    <button
                      class="ts-btn"
                      (click)="setStart(i)"
                      [title]="'Definir início como ' + formatMs(currentMs())">
                      {{ formatMs(line.startTimeMs) }}
                    </button>
                    <span class="ts-arrow">→</span>
                    <button
                      class="ts-btn"
                      (click)="setEnd(i)"
                      [title]="'Definir fim como ' + formatMs(currentMs())">
                      {{ formatMs(line.endTimeMs) }}
                    </button>
                  </div>

                </div>
              }

              @if (lines().length === 0) {
                <p class="panel__empty">Clique em "+ Linha" para começar.</p>
              }
            </div>
          </div>

          <!-- Painel Direito: Português (LTR) -->
          <div class="panel panel--portuguese" dir="ltr" lang="pt-BR">
            <div class="panel__header">Português</div>

            <div class="panel__body">
              @for (line of lines(); track line.lineOrder; let i = $index) {
                <div
                  class="lyric-row"
                  [class.lyric-row--active]="activeLine() === i">

                  <div class="lyric-row__text">
                    <textarea
                      class="lyric-textarea"
                      [(ngModel)]="lines()[i].textPortuguese"
                      placeholder="Tradução em português..."
                      rows="2">
                    </textarea>
                  </div>

                  <!-- Botão remover linha -->
                  <div class="lyric-row__remove">
                    <button
                      class="btn btn--remove"
                      (click)="removeLine(i)"
                      title="Remover esta linha">
                      ✕
                    </button>
                  </div>

                </div>
              }

              @if (lines().length === 0) {
                <p class="panel__empty">As traduções aparecerão aqui.</p>
              }
            </div>
          </div>

        </div>
      }

    </div>
  `,
  styles: [`
    /* ── Layout base ──────────────────────────────────────────────────── */
    .editor {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f0f2f5;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      overflow: hidden;
    }

    /* ── Cabeçalho ────────────────────────────────────────────────────── */
    .editor-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: #1a1a2e;
      color: white;
      flex-shrink: 0;
      gap: 16px;
    }
    .editor-header__titles {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      text-align: center;
    }
    .editor-header__title {
      font-size: 1rem;
      font-weight: 600;
    }
    .editor-header__hebrew {
      font-family: 'David Libre', serif;
      font-size: 1rem;
      color: #7fb3e8;
      direction: rtl;
    }
    .editor-header__actions {
      display: flex;
      gap: 8px;
    }

    /* ── Feedback ─────────────────────────────────────────────────────── */
    .feedback {
      padding: 10px 24px;
      background: #d1fae5;
      color: #065f46;
      font-size: 0.85rem;
      text-align: center;
      flex-shrink: 0;
    }
    .feedback--error { background: #fdecea; color: #c0392b; }

    /* ── Player ───────────────────────────────────────────────────────── */
    .player-section {
      background: #16213e;
      padding: 12px 24px;
      flex-shrink: 0;
    }
    .player {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .player__controls {
      display: flex;
      gap: 4px;
    }
    .player__btn {
      background: rgba(255,255,255,0.1);
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      padding: 8px 12px;
      transition: background 0.15s;
    }
    .player__btn:hover   { background: rgba(255,255,255,0.2); }
    .player__btn--play   { font-size: 1.3rem; padding: 8px 16px;
                           background: #4a90d9; }
    .player__progress-group {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 200px;
    }
    .player__time {
      font-family: monospace;
      font-size: 0.82rem;
      color: #ccc;
      white-space: nowrap;
    }
    .player__seek {
      flex: 1;
      accent-color: #4a90d9;
      cursor: pointer;
    }
    .player__speed-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .player__speed-label { font-size: 0.78rem; color: #aaa; }
    .player__speed {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      color: white;
      padding: 4px 8px;
      font-size: 0.82rem;
      cursor: pointer;
    }

    /* ── Split View ───────────────────────────────────────────────────── */
    .split-view {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .panel--hebrew    { border-right: 3px solid #4a90d9; }
    .panel--portuguese{ border-left:  3px solid #27ae60; }
    .panel__header {
      padding: 10px 16px;
      font-weight: 600;
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
    .panel--hebrew .panel__header    { color: #4a90d9; text-align: right;
                                       direction: rtl; }
    .panel--portuguese .panel__header{ color: #27ae60; }
    .panel__body {
      overflow-y: auto;
      flex: 1;
      scroll-behavior: smooth;
    }
    .panel__empty {
      padding: 40px 16px;
      text-align: center;
      color: #aaa;
      font-size: 0.9rem;
    }

    /* ── Linhas de legenda ────────────────────────────────────────────── */
    .lyric-row {
      padding: 10px 14px;
      border-bottom: 1px solid #f0f0f0;
      background: white;
      transition: background 0.2s ease;
    }
    .lyric-row--active {
      background: #fff3cd;
      border-left: 4px solid #f39c12;
    }
    .panel--hebrew .lyric-row--active {
      border-left: none;
      border-right: 4px solid #f39c12;
    }
    .lyric-row__text { margin-bottom: 6px; }
    .lyric-textarea {
      width: 100%;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 0.9rem;
      resize: vertical;
      font-family: inherit;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }
    .lyric-textarea:focus {
      outline: none;
      border-color: #4a90d9;
    }
    .lyric-textarea--hebrew {
      font-family: 'David Libre', serif;
      font-size: 1.05rem;
      line-height: 1.8;
      direction: rtl;
      text-align: right;
    }
    .lyric-row__timestamps {
      display: flex;
      align-items: center;
      gap: 6px;
      /* Timestamps sempre LTR mesmo dentro do painel RTL */
      direction: ltr;
      unicode-bidi: embed;
    }
    .ts-arrow { color: #999; font-size: 0.8rem; }
    .ts-btn {
      font-family: monospace;
      font-size: 0.75rem;
      background: #e8f4f8;
      border: 1px solid #b0d0e0;
      border-radius: 4px;
      padding: 3px 8px;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .ts-btn:hover { background: #c0e0f0; }
    .lyric-row__remove {
      display: flex;
      justify-content: flex-end;
      margin-top: 4px;
    }

    /* ── Botões globais ───────────────────────────────────────────────── */
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: opacity 0.15s, transform 0.1s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
    .btn:hover           { opacity: 0.85; }
    .btn:active          { transform: scale(0.97); }
    .btn:disabled        { opacity: 0.5; cursor: not-allowed; }
    .btn--primary        { background: #4a90d9; color: white; }
    .btn--secondary      { background: rgba(255,255,255,0.15); color: white; }
    .btn--export         { background: #27ae60; color: white; }
    .btn--ghost          { background: rgba(255,255,255,0.08); color: #aaa;
                           border: 1px solid rgba(255,255,255,0.2); }
    .btn--remove         { background: #fdecea; color: #c0392b;
                           padding: 4px 10px; font-size: 0.8rem; }

    /* ── Estado de loading ────────────────────────────────────────────── */
    .state-msg {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #888;
      font-size: 1rem;
    }

    /* ── Upload panel ─────────────────────────────────────────────────────────── */
    .upload-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 24px;
    }
    .upload-panel__icon { font-size: 2rem; }
    .upload-panel__text {
      color: #aaa;
      font-size: 0.85rem;
      margin: 0;
    }
    .upload-panel__hint {
      color: #666;
      font-size: 0.75rem;
    }
    .btn--upload {
      background: #4a90d9;
      color: white;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
    }
    .btn--swap {
      padding: 8px 10px;
      font-size: 0.85rem;
      flex-shrink: 0;
    }
  `]
})
export class EditorComponent implements OnInit, OnDestroy {

  // ── Injeções ───────────────────────────────────────────────────────────────
  private readonly route           = inject(ActivatedRoute);
  private readonly trackService    = inject(TrackService);
  private readonly lyricLineService = inject(LyricLineService);

  // ── Referência ao elemento <audio> do template ────────────────────────────
  @ViewChild('audioRef') audioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // ── Estado reativo ─────────────────────────────────────────────────────────
  track      = signal<Track | null>(null);
  lines      = signal<LyricLine[]>([]);
  loading    = signal(false);
  saving     = signal(false);
  isPlaying  = signal(false);
  currentMs  = signal(0);
  durationMs = signal(0);
  feedbackMsg      = signal<string | null>(null);
  feedbackIsError  = signal(false);
  uploading    = signal(false);
  uploadError  = signal<string | null>(null);
  private feedbackTimer?: ReturnType<typeof setTimeout>;

  // ── Computed: índice da linha ativa no momento atual do player ────────────
  activeLine = computed(() => {
    const ms    = this.currentMs();
    const found = this.lines().findIndex(
      l => ms >= l.startTimeMs && ms < l.endTimeMs
    );
    return found; // -1 se nenhuma linha cobre o timestamp atual
  });

  // ── URL de áudio baseada no nome do arquivo da track ──────────────────────
  audioSrc = computed(() => {
    const fileName = this.track()?.audioFileName;
    return fileName
      ? `http://localhost:8080/uploads/audio/${fileName}`
      : '';
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(id);
  }

  ngOnDestroy(): void {
    // Pausa o áudio ao sair da rota — evita continuar tocando em background
    this.audioRef?.nativeElement.pause();
    clearTimeout(this.feedbackTimer);
  }

  // ── Carregamento ───────────────────────────────────────────────────────────
  private loadData(trackId: number): void {
    this.loading.set(true);

    this.trackService.getTrackById(trackId).subscribe({
      next: (track) => {
        this.track.set(track);
        this.loadLines(trackId);
      },
      error: () => {
        this.showFeedback('Erro ao carregar a track.', true);
        this.loading.set(false);
      }
    });
  }

  private loadLines(trackId: number): void {
    this.lyricLineService.getByTrackId(trackId).subscribe({
      next: (lines) => {
        this.lines.set(lines);
        this.loading.set(false);
      },
      error: () => {
        this.showFeedback('Erro ao carregar as linhas.', true);
        this.loading.set(false);
      }
    });
  }

  // ── Player ─────────────────────────────────────────────────────────────────

  // Chamado pelo evento (timeupdate) do <audio> — dispara ~4× por segundo
  onTimeUpdate(): void {
    const ms = Math.round(this.audioRef.nativeElement.currentTime * 1000);
    this.currentMs.set(ms);

    // Auto-scroll: rola o painel para manter a linha ativa visível
    const idx = this.activeLine();
    if (idx >= 0) {
      requestAnimationFrame(() => {
        document.getElementById(`line-${idx}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  // Chamado pelo evento (loadedmetadata) — disponível quando o áudio carrega
  onMetadataLoaded(): void {
    const ms = Math.round(this.audioRef.nativeElement.duration * 1000);
    this.durationMs.set(ms);
  }

  togglePlay(): void {
    const audio = this.audioRef.nativeElement;
    if (audio.paused) {
      audio.play();
      this.isPlaying.set(true);
    } else {
      audio.pause();
      this.isPlaying.set(false);
    }
  }

  // Avança ou volta N segundos mantendo o estado de play/pause
  skip(seconds: number): void {
    const audio = this.audioRef.nativeElement;
    audio.currentTime = Math.max(0, audio.currentTime + seconds);
  }

  onSeek(event: Event): void {
    const ms = Number((event.target as HTMLInputElement).value);
    this.audioRef.nativeElement.currentTime = ms / 1000;
    this.currentMs.set(ms);
  }

  onSpeedChange(event: Event): void {
    const rate = Number((event.target as HTMLSelectElement).value);
    this.audioRef.nativeElement.playbackRate = rate;
  }

  // ── Sincronização: captura de timestamps ──────────────────────────────────

  // Captura o tempo ATUAL do player como início desta linha
  setStart(index: number): void {
    const updated = [...this.lines()];
    updated[index] = { ...updated[index], startTimeMs: this.currentMs() };
    this.lines.set(updated);
  }

  // Captura o tempo ATUAL do player como fim desta linha
  setEnd(index: number): void {
    const updated = [...this.lines()];
    updated[index] = { ...updated[index], endTimeMs: this.currentMs() };
    this.lines.set(updated);
  }

  // ── Gerenciamento de linhas ────────────────────────────────────────────────
  addLine(): void {
    const current = this.lines();
    const lastEnd = current.length > 0
      ? current[current.length - 1].endTimeMs
      : 0;

    const newLine: LyricLine = {
      trackId:        this.track()!.id,
      textHebrew:     '',
      textPortuguese: null,
      startTimeMs:    lastEnd,       // começa onde a anterior terminou
      endTimeMs:      lastEnd + 3000, // 3 segundos de duração padrão
      lineOrder:      current.length
    };

    this.lines.update(l => [...l, newLine]);
  }

  removeLine(index: number): void {
    this.lines.update(current => {
      const updated = current.filter((_, i) => i !== index);
      // Recalcula lineOrder para manter sequência contínua
      return updated.map((l, i) => ({ ...l, lineOrder: i }));
    });
  }

  // ── Persistência ──────────────────────────────────────────────────────────
  saveAll(): void {
    const trackId = this.track()?.id;
    if (!trackId) return;

    // Valida que nenhuma linha tem endTimeMs <= startTimeMs
    const invalid = this.lines().find(l => l.endTimeMs <= l.startTimeMs);
    if (invalid) {
      this.showFeedback(
        `Linha "${invalid.textHebrew || '(vazia)'}" tem tempo de fim ≤ tempo de início.`,
        true
      );
      return;
    }

    this.saving.set(true);

    // Mapeia para o payload que o backend espera (sem id, trackId, isActive)
    const payload = this.lines().map(l => ({
      textHebrew:     l.textHebrew,
      textPortuguese: l.textPortuguese,
      startTimeMs:    l.startTimeMs,
      endTimeMs:      l.endTimeMs,
      lineOrder:      l.lineOrder
    }));

    this.lyricLineService.batchSave(trackId, payload).subscribe({
      next: (saved) => {
        this.lines.set(saved);          // atualiza com IDs gerados pelo banco
        this.saving.set(false);
        this.showFeedback('✅ Salvo com sucesso!', false);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.messages?.[0] ?? 'Erro ao salvar. Tente novamente.';
        this.showFeedback(msg, true);
      }
    });
  }

  downloadSrt(): void {
    const t = this.track();
    if (t) this.trackService.downloadSrt(t.id, t.title);
  }

  // ── Upload de áudio ─────────────────────────────────────────────────────────
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file  = input.files?.[0];
  if (!file || !this.track()) return;

  // Valida tipo antes de enviar — rejeita arquivos que não sejam áudio
  if (!file.type.startsWith('audio/')) {
    this.showFeedback('Selecione um arquivo de áudio (.mp3, .wav, .ogg, .aac).', true);
    return;
  }

  this.uploading.set(true);
  this.uploadError.set(null);

  this.trackService.uploadAudio(this.track()!.id, file).subscribe({
    next: (updatedTrack) => {
      // Atualiza o signal track — o computed audioSrc recalcula automaticamente
      // e o elemento <audio> recarrega sem nenhuma ação adicional
      this.track.set(updatedTrack);
      this.uploading.set(false);
      this.showFeedback('🎵 Áudio carregado com sucesso!', false);

      // Limpa o input para permitir novo upload do mesmo arquivo se necessário
      this.fileInput.nativeElement.value = '';
    },
    error: (err) => {
      this.uploading.set(false);
      const msg = err?.error?.messages?.[0]
        ?? 'Erro ao enviar o áudio. Verifique o formato e tente novamente.';
      this.showFeedback(msg, true);
      this.uploadError.set(msg);
    }
  });
}

  // ── Utilitários ───────────────────────────────────────────────────────────

  // Converte milissegundos para "HH:MM:SS,mmm" — mesmo algoritmo do backend
  formatMs(ms: number): string {
    if (!ms && ms !== 0) return '00:00:00,000';
    const h  = Math.floor(ms / 3_600_000);
    const m  = Math.floor((ms % 3_600_000) / 60_000);
    const s  = Math.floor((ms % 60_000) / 1_000);
    const ms3 = ms % 1_000;
    const p2 = (n: number) => String(n).padStart(2, '0');
    const p3 = (n: number) => String(n).padStart(3, '0');
    return `${p2(h)}:${p2(m)}:${p2(s)},${p3(ms3)}`;
  }

  // Exibe mensagem de feedback e a apaga automaticamente após 4 segundos
  private showFeedback(msg: string, isError: boolean): void {
    clearTimeout(this.feedbackTimer);
    this.feedbackMsg.set(msg);
    this.feedbackIsError.set(isError);
    this.feedbackTimer = setTimeout(() => this.feedbackMsg.set(null), 4000);
  }
}