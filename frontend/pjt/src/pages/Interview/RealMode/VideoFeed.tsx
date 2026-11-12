import React, { LegacyRef } from 'react';
import { Play } from 'lucide-react';

interface VideoFeedProps {
  stream: MediaStream | null;
  isRecording: boolean;
  isProcessing: boolean;
  lastRecordedVideoUrl: string | null;
  debugMsg: string;
  videoRef: LegacyRef<HTMLVideoElement> | undefined;
  canvasRef: LegacyRef<HTMLCanvasElement> | undefined;
  onVideoPlay: () => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({
  stream,
  isRecording,
  isProcessing,
  lastRecordedVideoUrl,
  debugMsg,
  videoRef,
  canvasRef,
  onVideoPlay,
}) => {
  return (
    <div className="flex-1 relative bg-zinc-900 border-r border-white/5 p-6 flex flex-col justify-center">
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-red-900/20">
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
                <p className="text-red-400 font-bold animate-pulse">{debugMsg}</p>
              </div>
            )}

            {stream && (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  onPlay={onVideoPlay}
                  className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </>
        )}

        {isRecording && (
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-red-500/50 z-10 animate-pulse">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_15px_red]" />
            <span className="text-xs font-bold text-white tracking-wider">REC</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
