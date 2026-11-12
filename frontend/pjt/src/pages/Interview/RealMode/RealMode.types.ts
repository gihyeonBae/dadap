import * as faceapi from 'face-api.js';

/**
 * 면접 중 수집되는 개별 표정 및 얼굴 분석 데이터 구조
 */
export interface ExpressionData {
  timestamp: number;
  expressions: faceapi.FaceExpressions;
  score: number;
  eyeContactScore: number;
  poseStabilityScore: number;
  movementScore: number;
  questionId?: number;
}

/**
 * SpeechSynthesis API 또는 Google Translate TTS의 음성 옵션 구조
 */
export interface VoiceOption {
  name: string;
  lang: string;
  type: 'native' | 'google';
  voice?: SpeechSynthesisVoice;
}

/**
 * 음성 속도 및 톤 프리셋 구조
 */
export interface VoicePreset {
  label: string;
  rate: number;
  pitch: number;
}
