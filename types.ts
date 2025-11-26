export interface GeneratedImage {
  imageUrl: string;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GenerationConfig {
  prompt: string;
  originalImage: string | null; // base64
}