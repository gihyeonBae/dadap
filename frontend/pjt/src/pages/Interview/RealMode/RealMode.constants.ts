import type { VoicePreset } from './RealMode.types';

/**
 * 면접관 목소리 스타일 프리셋
 * @description 라벨, 속도(rate), 톤(pitch)으로 구성됩니다.
 */
export const VOICE_PRESETS: VoicePreset[] = [
  { label: '표준', rate: 1.0, pitch: 1.0 },
  { label: '차분', rate: 0.8, pitch: 0.9 },
  { label: '신속', rate: 1.4, pitch: 1.0 },
  { label: '무게', rate: 0.9, pitch: 0.7 },
];

/**
 * 답변 시작 전 카운트다운 시간 (초)
 */
export const COUNTDOWN_DURATION = 3;
