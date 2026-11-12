import React from 'react';
import { Timer, Mic, MicOff, Square, Loader, SkipForward, Volume2 } from 'lucide-react';

interface ControlBarProps {
  isRecording: boolean;
  isProcessing: boolean;
  countdown: number | null;
  isMicOn: boolean;
  answerTime: number;
  audioLevel: number;
  isReadyForRecording: boolean;
  nextQuestionForSkip: any | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleMic: () => void;
  onSkipToNextQuestion: () => void;
  mode?: 'real' | 'practice';
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ControlBar: React.FC<ControlBarProps> = ({
  isRecording,
  isProcessing,
  countdown,
  isMicOn,
  answerTime,
  audioLevel,
  isReadyForRecording,
  nextQuestionForSkip,
  onStartRecording,
  onStopRecording,
  onToggleMic,
  onSkipToNextQuestion,
  mode = 'real',
}) => {
  return (
    <div className="h-24 bg-[#1A1A1A] border-t border-white/5 flex items-center px-8 gap-8 flex-shrink-0 z-20">
      <div className="flex items-center gap-4 min-w-[140px]">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isRecording ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
          <Timer className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Time</span>
          <span className={`text-2xl font-mono font-bold leading-none ${isRecording ? 'text-white' : 'text-zinc-500'}`}>
            {formatTime(answerTime)}
          </span>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        {countdown !== null ? (
          <div className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-zinc-900/50 text-zinc-500 font-bold text-lg border border-zinc-800 animate-pulse">
            <Timer className="w-5 h-5" />
            <span>녹화 준비 중... {countdown}</span>
          </div>
        ) : isProcessing ? (
          nextQuestionForSkip ? (
            <button
              onClick={onSkipToNextQuestion}
              className={`group flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all ${
                mode === 'practice' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
                  : 'bg-gradient-to-r from-red-600 to-red-500'
              }`}
            >
              <SkipForward className="w-5 h-5" /> 다음 질문으로
            </button>
          ) : (
            <button disabled className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-bold text-lg border border-zinc-700 cursor-not-allowed">
              <Loader className="w-6 h-6 animate-spin" />
              제출 및 분석 중...
            </button>
          )
        ) : !isRecording ? (
          <div className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-zinc-900/50 text-zinc-500 font-bold text-lg border border-zinc-800">
            {isReadyForRecording ? (
              <>
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span>질문 낭독 중...</span>
              </>
            ) : (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>준비 중...</span>
              </>
            )}
          </div>
        ) : (
          <button onClick={onStopRecording} className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-zinc-800 text-white font-bold text-lg border border-zinc-600 hover:scale-105 active:scale-95 transition-all">
            <Square className="w-4 h-4 fill-current text-red-500" /> 답변 완료
          </button>
        )}
      </div>

      <div className="w-48 flex flex-col gap-2">
        <div className="flex justify-between text-[10px] font-bold text-zinc-500">
          <span>MIC STATUS</span>
          <span className={isMicOn ? "text-red-400" : "text-zinc-600"}>{isMicOn ? "ACTIVE" : "MUTED"}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 transition-all duration-75" style={{ width: `${audioLevel}%` }} />
        </div>
      </div>

      <button onClick={onToggleMic} className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${isMicOn ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-red-900/20 border-red-500/50 text-red-500'}`}>
        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default ControlBar;
