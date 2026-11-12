import React from 'react';
import { Settings } from 'lucide-react';

import VoiceSettings from './VoiceSettings';
import type { VoiceOption } from './RealMode.types';
import type { InterviewQuestion } from '../../../redux/slices/interviewSlice';

interface InterviewHeaderProps {
  currentIndex: number;
  targetQuestionCount: number; // targetQuestionCount를 props로 받도록 수정
  onExit: () => void;
  
  // VoiceSettings 관련 props
  isVoiceDropdownOpen: boolean;
  onVoiceDropdownToggle: () => void;
  voiceOptions: VoiceOption[];
  selectedVoice: VoiceOption | null;
  rate: number;
  pitch: number;
  isPanelMode: boolean;
  onSelectedVoiceChange: (voice: VoiceOption | null) => void;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onIsPanelModeChange: (isPanelMode: boolean) => void;
  onTestVoice: () => void;
  currentQuestion?: InterviewQuestion | null;
  isTransitioning?: boolean;
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  currentIndex,
  targetQuestionCount,
  onExit,
  isVoiceDropdownOpen,
  onVoiceDropdownToggle,
  ...voiceSettingsProps
}) => {
  return (
    <header className="px-6 py-4 flex items-center justify-between bg-[#121212] border-b border-white/5 z-10 flex-shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold italic text-red-500 tracking-wider">Real Mode</h1>
        <div className="ml-4 px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400 font-mono">
          Question {currentIndex + 1} / {targetQuestionCount}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={onVoiceDropdownToggle}
            className="p-2 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded-lg transition-all text-zinc-400 hover:text-white"
            title="면접관 목소리 설정"
          >
            <Settings className="w-5 h-5" />
          </button>
          <VoiceSettings 
            isOpen={isVoiceDropdownOpen}
            {...voiceSettingsProps}
          />
        </div>
        <button onClick={onExit} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold transition-colors text-zinc-400 hover:text-white">
          나가기
        </button>
      </div>
    </header>
  );
};

export default InterviewHeader;
