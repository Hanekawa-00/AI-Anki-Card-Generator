export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags: string[];
}

export interface GeneratedCardData {
  front: string;
  back: string;
  tags: string[];
}

export interface AnkiDeck {
  name: string;
}

export interface AnkiConnectResponse<T> {
  result: T;
  error: string | null;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  REVIEW = 'REVIEW',
}

export enum AnkiConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}
