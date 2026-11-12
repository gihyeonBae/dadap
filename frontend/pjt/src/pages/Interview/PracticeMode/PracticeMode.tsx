import React from 'react';
import { Loader, Lightbulb, Settings, Play } from 'lucide-react';
import ConfirmModal from '../../../components/Common/ConfirmModal';

import { usePracticeMode } from './usePracticeMode';
import VoiceSettings from './VoiceSettings';
import RecorderControls from './RecorderControls';
import { PRIMARY_BUTTON, RECORDING_BADGE, VOICE_DROPDOWN, TIMER_BADGE } from './PracticeMode.constants';

const PracticeMode: React.FC = () => {
  const {
    // refs
    videoRef,
    canvasRef,
    // state
    stream,
    isMicOn,
    audioLevel,
    answerTime,
    isRecording,
    isProcessing,
    isTransitioning,
    modelsLoaded,
    debugMsg,
    isFetchingQuestion,
    isFinishModalOpen,
    isExitModalOpen,
    showHint,
    voiceOptions,
    selectedVoice,
    isVoiceDropdownOpen,
    rate,
    pitch,
    isPanelMode,

    // interview data
    questions,
    currentIndex,
    currentQuestion,

    // actions
    setShowHint,
    setIsVoiceDropdownOpen,
    setSelectedVoice,
    setRate,
    setPitch,
    setIsPanelMode,

    stopMedia,
    setVideoRef,
    handleVideoOnPlay,
    handleStartRecording,
    handleStopRecording,
    toggleMic,
    handleTestVoice,
    handleFinish,
    onConfirmFinish,
    handleExit,
    onConfirmExit,
    formatTime,

    // last recorded video + skip-next
    lastRecordedVideoUrl,
    nextQuestionForSkip,
    handleSkipToNextQuestion,

    // modal setters
    setIsFinishModalOpen,
    setIsExitModalOpen,
  } = usePracticeMode();

  return (
    <div className="h-screen w-full bg-[#121212] text-white overflow-hidden flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between bg-[#121212] border-b border-white/5 z-10 shrink-0">
          <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold italic text-blue-500 tracking-wider">Practice Mode</h1>
              <div className="ml-4 px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400 font-mono">
                  Question {currentIndex + 1} / 5
              </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
                <button 
                  onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                  className="p-2 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded-lg transition-all text-zinc-400 hover:text-white"
                  title="면접관 목소리 설정"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                <VoiceSettings
                  isOpen={isVoiceDropdownOpen}
                  voiceOptions={voiceOptions}
                  selectedVoice={selectedVoice}
                  setSelectedVoice={setSelectedVoice}
                  isPanelMode={isPanelMode}
                  setIsPanelMode={setIsPanelMode}
                  rate={rate}
                  setRate={setRate}
                  pitch={pitch}
                  setPitch={setPitch}
                  handleTestVoice={handleTestVoice}
                  currentQuestion={currentQuestion}
                  isTransitioning={isTransitioning}
                />
            </div>
            <button onClick={handleExit} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold transition-colors text-zinc-400 hover:text-white">
                나가기
            </button>
          </div>
      </header>

      <div className="flex-1 flex min-h-0">
          <div className="flex-1 relative bg-zinc-900 border-r border-white/5 p-6 flex flex-col justify-center">
             <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-blue-900/20">
                 {isProcessing && lastRecordedVideoUrl ? (
                    <>
                      <video
                        src={lastRecordedVideoUrl}
                        autoPlay
                        loop
                        className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
                      />
                      <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-blue-500/50 z-10">
                        <Play className="w-3 h-3 fill-blue-500 text-blue-500" />
                        <span className="text-xs font-bold text-white tracking-wider">답변 영상 재생 중</span>
                      </div>
                    </>
                  ) : (
                  <>
                    {!stream && (
                      <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/90">
                        <p className="text-blue-400 font-bold animate-pulse">{debugMsg}</p>
                      </div>
                    )}

                    {stream && (
                      <div className="relative w-full h-full">
                        <video
                          ref={setVideoRef}
                          autoPlay
                          muted
                          playsInline
                          onPlay={handleVideoOnPlay}
                          className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    )}
                  </>
                )}
                
                {isRecording && (
                  <div className={RECORDING_BADGE}>
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_blue]" />
                      <span className="text-xs font-bold text-white tracking-wider">REC</span>
                  </div>
                )}
             </div>
          </div>

          <div className="w-100 bg-[#121212] flex flex-col p-8 justify-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500" 
                    style={{ width: `${((currentIndex + 1) / Math.max(1, questions.length)) * 100}%` }}
                  />
              </div>

              <div className={`flex-1 flex flex-col justify-center transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                  <span className="text-blue-500 font-bold tracking-wider text-sm mb-4">QUESTION {currentIndex + 1}</span>
                  <div className="min-h-30 mb-8">
                    {isFetchingQuestion ? (
                      <div className="flex items-center gap-4 text-zinc-400">
                        <Loader className="w-8 h-8 animate-spin" />
                        <span className="text-2xl font-bold">질문을 가져오는 중...</span>
                      </div>
                    ) : (
                      <h2 className="text-3xl font-bold text-white leading-snug break-keep">{currentQuestion?.text || "질문이 없습니다."}</h2>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                      <button 
                        onClick={() => setShowHint(!showHint)}
                        className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-yellow-400 transition-colors mb-2"
                      >
                        <Lightbulb className={`w-4 h-4 ${showHint ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        {showHint ? '힌트 숨기기' : '힌트 보기'}
                      </button>
                      
                      {showHint && (
                        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                            {currentQuestion?.keywords && currentQuestion.keywords.length > 0 ? (
                                currentQuestion.keywords.map((k: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-sm rounded-lg border border-zinc-700"># {k}</span>
                                ))
                            ) : (
                                <span className="text-zinc-600 text-xs">제공된 힌트가 없습니다.</span>
                            )}
                        </div>
                      )}
                  </div>
              </div>
          </div>
      </div>

      <div className="h-24 bg-[#1A1A1A] border-t border-white/5 flex items-center px-8 gap-8 shrink-0 z-20">
          <RecorderControls
            isProcessing={isProcessing}
            isRecording={isRecording}
            answerTime={answerTime}
            audioLevel={audioLevel}
            isMicOn={isMicOn}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
            onToggleMic={toggleMic}
            formatTime={formatTime}
            primaryClass={PRIMARY_BUTTON}
            timerBadgeClass={TIMER_BADGE}
            nextQuestionForSkip={nextQuestionForSkip}
            onSkipToNextQuestion={handleSkipToNextQuestion}
          />
      </div>


      <ConfirmModal 
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirm={onConfirmFinish}
        title="면접 종료"
        description="모든 질문이 완료되었습니다. 결과를 제출하고 분석을 시작하시겠습니까?"
        confirmText="결과 분석 요청"
        cancelText="돌아가기"
        theme="blue"
      />

      <ConfirmModal 
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onConfirmExit}
        title="인터뷰 중단"
        description={`인터뷰를 중단하고 나가시겠습니까?\n진행 중인 내용은 저장되지 않습니다.`}
        confirmText="나가기"
        cancelText="취소"
        theme="blue"
      />
    </div>
  );
};

export default PracticeMode;
