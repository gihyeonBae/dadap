import React from 'react';

import ConfirmModal from '../../../components/Common/ConfirmModal';
import { useRealMode } from './useRealMode';
import InterviewHeader from './InterviewHeader';
import VideoFeed from './VideoFeed';
import QuestionDisplay from './QuestionDisplay';
import ControlBar from './ControlBar';

const RealMode: React.FC = () => {
  const {
    stream,
    isMicOn,
    audioLevel,
    answerTime,
    isRecording,
    isProcessing,
    isTransitioning,
    debugMsg,
    countdown,
    isFetchingQuestion,
    isFinishModalOpen,
    isExitModalOpen,
    currentQuestion,
    currentIndex,
    targetQuestionCount,
    
    voiceOptions,
    selectedVoice,
    isVoiceDropdownOpen,
    rate,
    pitch,
    isPanelMode,

    canvasRef,
    setVideoRef,
    handleVideoOnPlay,
    
    lastRecordedVideoUrl,
    nextQuestionForSkip,

    handleStartRecording,
    handleStopRecording,
    toggleMic,
    handleFinish,
    onConfirmFinish,
    handleExit,
    onConfirmExit,
    handleSkipToNextQuestion,
    
    setIsFinishModalOpen,
    setIsExitModalOpen,
    setSelectedVoice,
    setIsVoiceDropdownOpen,
    setRate,
    setPitch,
    setIsPanelMode,
    handleTestVoice,
  } = useRealMode();

  return (
    <div className="h-screen w-full bg-[#121212] text-white overflow-hidden flex flex-col">
      <InterviewHeader
        currentIndex={currentIndex}
        targetQuestionCount={targetQuestionCount}
        onExit={handleExit}
        isVoiceDropdownOpen={isVoiceDropdownOpen}
        onVoiceDropdownToggle={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
        voiceOptions={voiceOptions}
        selectedVoice={selectedVoice}
        rate={rate}
        pitch={pitch}
        isPanelMode={isPanelMode}
        onSelectedVoiceChange={setSelectedVoice}
        onRateChange={setRate}
        onPitchChange={setPitch}
        onIsPanelModeChange={setIsPanelMode}
        onTestVoice={handleTestVoice}
        currentQuestion={currentQuestion}
        isTransitioning={isTransitioning}
      />

      <div className="flex-1 flex min-h-0">
        <div className="relative flex-1 flex flex-col">
          <VideoFeed
            stream={stream}
            isRecording={isRecording}
            isProcessing={isProcessing}
            lastRecordedVideoUrl={lastRecordedVideoUrl}
            debugMsg={debugMsg}
            videoRef={setVideoRef}
            canvasRef={canvasRef}
            onVideoPlay={handleVideoOnPlay}
          />
          {countdown !== null && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
              <div className="flex flex-col items-center gap-4">
                <span className="text-white/80 text-2xl font-bold tracking-widest uppercase">
                  Recording starts in
                </span>
                <span className="text-9xl font-black text-white tabular-nums animate-pulse drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                  {countdown}
                </span>
              </div>
            </div>
          )}
        </div>
        <QuestionDisplay
          currentQuestion={currentQuestion}
          currentIndex={currentIndex}
          isFetchingQuestion={isFetchingQuestion}
          isTransitioning={isTransitioning}
          targetQuestionCount={targetQuestionCount}
        />
      </div>

      <ControlBar
        countdown={countdown}
        isRecording={isRecording}
        isProcessing={isProcessing}
        isMicOn={isMicOn}
        answerTime={answerTime}
        audioLevel={audioLevel}
        isReadyForRecording={!!currentQuestion && !isFetchingQuestion && !!stream}
        nextQuestionForSkip={nextQuestionForSkip}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onToggleMic={toggleMic}
        onSkipToNextQuestion={handleSkipToNextQuestion}
      />

      <ConfirmModal 
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirm={onConfirmFinish}
        title="면접 종료"
        description="모든 질문이 완료되었습니다. 결과를 제출하고 분석을 시작하시겠습니까?"
        confirmText="결과 분석 요청"
        cancelText="돌아가기"
        theme="red"
      />

      <ConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onConfirmExit}
        title="면접 종료 확인"
        description="정말로 면접을 종료하시겠습니까? 진행 상황은 저장되지 않습니다."
        confirmText="종료"
        cancelText="취소"
        theme="red"
      />
    </div>
  );
};

export default RealMode;