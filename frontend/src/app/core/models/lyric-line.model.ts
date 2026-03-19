export interface LyricLine {
  id?: number;           // undefined para linhas novas ainda não salvas no banco
  trackId: number;
  textHebrew: string;
  textPortuguese: string | null;
  startTimeMs: number;
  endTimeMs: number;
  lineOrder: number;

  // Campo local — nunca enviado ao backend
  // true quando o player está reproduzindo dentro deste intervalo
  isActive?: boolean;
}

// Payload enviado no POST e PUT ao LyricLineController
export interface LyricLineRequest {
  textHebrew: string;
  textPortuguese: string | null;
  startTimeMs: number;
  endTimeMs: number;
  lineOrder: number;
}