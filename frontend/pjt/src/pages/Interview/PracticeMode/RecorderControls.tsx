import React from 'react';
import { Timer, Mic, MicOff, Play, Square, Loader, SkipForward } from 'lucide-react';

type Props = {
  isProcessing: boolean;
  isRecording: boolean;
  answerTime: number;
  audioLevel: number;
  isMicOn: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleMic: () => void;
  formatTime: (seconds: number) => string;
  primaryClass?: string;
  timerBadgeClass?: string;
  // Skip-next props to match RealMode behavior
  nextQuestionForSkip?: any | null;
  onSkipToNextQuestion?: () => void;
};

const RecorderControls: React.FC<Props> = ({
  isProcessing,
  isRecording,
  answerTime,
  audioLevel,
  isMicOn,
  onStart,
  onStop,
  onToggleMic,
  formatTime,
  primaryClass,
  timerBadgeClass,
  nextQuestionForSkip,
  onSkipToNextQuestion,
}) => {
  return (
    <div className="w-full flex items-center justify-between">
      <div className={timerBadgeClass || 'w-12 h-12 rounded-2xl flex items-center justify-center border bg-zinc-800 border-zinc-700 text-zinc-500'}>
        <Timer className="w-6 h-6" />
      </div>

      <div className="flex flex-col px-4">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Time</span>
        <span className={`text-2xl font-mono font-bold leading-none ${isRecording ? 'text-white' : 'text-zinc-500'}`}>
          {formatTime(answerTime)}
        </span>
      </div>

      <div className="flex-1 flex justify-center">
        {isProcessing ? (
          nextQuestionForSkip ? (
            <button
              onClick={onSkipToNextQuestion}
              className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-blue-500 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
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
          <button onClick={onStart} className={primaryClass || 'group flex items-center gap-3 px-10 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-blue-500 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed'}>
            <Play className="w-4 h-4" /> 답변 시작하기
          </button>
        ) : (
          <button onClick={onStop} className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-zinc-800 text-white font-bold text-lg border border-zinc-600 hover:scale-105 active:scale-95 transition-all">
            <Square className="w-4 h-4 text-blue-500" /> 답변 완료
          </button>
        )}
      </div>

      <div className="w-48 flex flex-col gap-2">
        <div className="flex justify-between text-[10px] font-bold text-zinc-500">
          <span>MIC STATUS</span>
          <span className={isMicOn ? 'text-blue-400' : 'text-zinc-600'}>{isMicOn ? 'ACTIVE' : 'MUTED'}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${audioLevel}%` }} />
        </div>
      </div>

      <button onClick={onToggleMic} className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${isMicOn ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-blue-900/20 border-blue-500/50 text-blue-500'}`}>
        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default RecorderControls;
