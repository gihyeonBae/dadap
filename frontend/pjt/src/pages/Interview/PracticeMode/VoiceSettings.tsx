import React from 'react';
import { Play } from 'lucide-react';
import type { VoiceOption } from './PracticeMode.types';
import { VOICE_PRESETS } from './PracticeMode.constants';
import { VOICE_DROPDOWN } from './PracticeMode.constants';
import type { InterviewQuestion } from '../../../redux/slices/interviewSlice';

type Props = {
  isOpen: boolean;
  voiceOptions: VoiceOption[];
  selectedVoice: VoiceOption | null;
  setSelectedVoice: (v: VoiceOption) => void;
  isPanelMode: boolean;
  setIsPanelMode: (b: boolean) => void;
  rate: number;
  setRate: (n: number) => void;
  pitch: number;
  setPitch: (n: number) => void;
  handleTestVoice: () => void;
  currentQuestion?: InterviewQuestion | null;
  isTransitioning?: boolean;
};

const VoiceSettings: React.FC<Props> = ({
  isOpen,
  voiceOptions,
  selectedVoice,
  setSelectedVoice,
  isPanelMode,
  setIsPanelMode,
  rate,
  setRate,
  pitch,
  setPitch,
  handleTestVoice,
  currentQuestion,
  isTransitioning = false,
}) => {
  // HEAMI 기본 목소리 설정
  const hasSetDefaultVoice = React.useRef(false);
  React.useEffect(() => {
    if (!hasSetDefaultVoice.current && voiceOptions.length > 0) {
      const heami = voiceOptions.find(v => v.name.includes('Heami'));
      if (heami) {
        setSelectedVoice(heami);
        hasSetDefaultVoice.current = true;
      }
    }
  }, [voiceOptions, setSelectedVoice]);

  // 질문 변경 시 딩동 효과음 재생
  const playedQuestionTextRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (currentQuestion && !isTransitioning) {
      if (playedQuestionTextRef.current === currentQuestion.text) return;
      playedQuestionTextRef.current = currentQuestion.text;

      // TTS와 겹치지 않도록 잠시 일시정지 (딩동 소리 후 재생)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const t = ctx.currentTime;

        // '딩' (E5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, t);
        gain1.gain.setValueAtTime(0.05, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc1.start(t);
        osc1.stop(t + 0.6);

        // '동' (C5)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(523.25, t + 0.5);
        gain2.gain.setValueAtTime(0.05, t + 0.5);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        osc2.start(t + 0.5);
        osc2.stop(t + 1.5);

        setTimeout(() => {
          ctx.close();
          // 딩동(1.5초) + 여유 텀(1.0초) = 2.5초 후 TTS 재개
          if ('speechSynthesis' in window) {
            window.speechSynthesis.resume();
          }
        }, 2500);
      } catch (e) {
        console.warn("AudioContext 효과음 재생 실패:", e);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
      }
    }
  }, [currentQuestion, isTransitioning]);

  return (
    <div className={`${VOICE_DROPDOWN} ${!isOpen ? 'hidden' : ''}`}>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">면접관 목소리</span>
        <select
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const voice = voiceOptions.find(v => v.name === e.target.value);
            if (voice) setSelectedVoice(voice);
          }}
        >
          {voiceOptions.map(v => (
            <option key={v.name} value={v.name}>
              {v.name} {v.type === 'google' ? '(Online)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 pb-2 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">다대일 면접 모드</span>
          <button
            onClick={() => setIsPanelMode(!isPanelMode)}
            className={`w-10 h-5 rounded-full transition-colors relative ${isPanelMode ? 'bg-blue-500' : 'bg-zinc-700'}`}
            aria-label="Toggle panel mode"
          >
            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isPanelMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        <p className="text-[10px] text-zinc-500 leading-tight">매 질문마다 목소리와 톤이 무작위로 변경되어 여러 면접관이 있는 듯한 효과를 줍니다.</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">스타일 프리셋</span>
        <div className="grid grid-cols-4 gap-2">
          {VOICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setRate(preset.rate);
                setPitch(preset.pitch);
              }}
              className={`px-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                rate === preset.rate && pitch === preset.pitch
                  ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <span>말하기 속도</span>
          <span className="text-blue-400">{rate.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <span>목소리 톤</span>
          <span className="text-blue-400">{pitch.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={pitch}
          onChange={(e) => setPitch(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <button
        onClick={handleTestVoice}
        className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-bold text-blue-400 transition-colors flex items-center justify-center gap-2"
      >
        <Play className="w-3 h-3" /> 테스트 듣기
      </button>

      <div className="text-[10px] text-zinc-500 mt-1 p-2 bg-zinc-800 rounded-lg leading-relaxed">
        * 원하는 목소리가 없다면 PC 설정의 <strong>[언어 및 음성]</strong>에서 음성 패키지를 추가 설치해주세요.
      </div>
    </div>
  );
};

export default VoiceSettings;
