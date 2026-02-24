
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

export type ViewMode = '3-VIEW' | '4-VIEW';
export type SubjectType = 'HUMANOID' | 'CREATURE_PROP';
export type AspectRatioType = '16:9' | '4:3' | '1:1' | '3:4' | '9:16';
export type ModelType = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';
export type ImageSizeType = '1K' | '2K' | '4K';
export type PoseType = 'ORIGINAL' | 'A-POSE' | 'T-POSE';

export interface GenerationConfig {
  customInstruction: string;
  poseType: PoseType;
  backgroundColor: string;
  viewMode: ViewMode;
  subjectType: SubjectType;
  aspectRatio: AspectRatioType;
  imageSize: ImageSizeType;
  removeProps: boolean;
  modelId: ModelType;
  baseUrl?: string;
}

declare global {
  const __BUILD_DATE__: string;
}
