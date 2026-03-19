export type TrackStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPORTED';

export interface Track {
  id: number;
  title: string;
  titleHebrew: string | null;
  audioFileName: string | null;
  durationMs: number | null;
  status: TrackStatus;
  lyricLineCount: number;
  createdAt: string;
  updatedAt: string;
}

// Envelope de paginação que o Spring Page<T> retorna
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // página atual (0-indexed)
}