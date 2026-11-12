import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ★ [Redux] 임포트
import { useDispatch, useSelector } from 'react-redux';
import { updateDeviceStatus, selectDeviceStatus, type CheckStatus, setInterviewId, resetInterview, setInterviewConfig } from '../../redux/slices/interviewSlice';
import { resetInterview as resetSession } from '../../redux/slices/interviewSessionSlice';
import { resetInterviewUI } from '../../redux/slices/interviewUISlice';

import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  X, 
  ChevronRight, 
  PanelRightOpen,
  ScanFace
} from 'lucide-react';
import { interviewService } from '../../api/interviewService';

interface FaceDetection {
  boundingBox: DOMRectReadOnly;
  landmarks: any[];
}
declare class FaceDetector {
  constructor(options?: any);
  detect(image: ImageBitmapSource): Promise<FaceDetection[]>;
}

type CategoryKey = 'os' | 'network' | 'ds' | 'db' | 'backend' | 'frontend';

type InterviewLaunchState = {
  mode?: 'practice' | 'real';
  category?: CategoryKey;
  categoryId?: number;
  portfolioId?: number;
  interviewType?: 'CS' | 'PORTFOLIO';
  targetQuestionCount?: number;
  interviewId?: number; // Starter.tsx에서 전달될 수 있는 값
  docName?: string;     // Starter.tsx에서 전달될 수 있는 값
  docType?: 'RESUME' | 'PORTFOLIO'; // Starter.tsx에서 전달될 수 있는 값
};

const CATEGORY_TO_ID: Record<CategoryKey, number> = {
  os: 1,
  network: 2,
  ds: 3,
  db: 4,
  backend: 6,
  frontend: 5,
};

const EnvironmentCheck: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as InterviewLaunchState) || {};
  const mode = locationState.mode || 'practice';
  const targetQuestionCount = locationState.targetQuestionCount || 5;
  const categoryKey: CategoryKey = locationState.category || 'os';
  const categoryId = locationState.categoryId ?? CATEGORY_TO_ID[categoryKey];

  // ★ [Redux] 연결
  const dispatch = useDispatch();
  const status = useSelector(selectDeviceStatus);
  // Keep track of whether an interview is already active to avoid unintended mid-session resets
  const currentInterviewId = useSelector((s: any) => s.interview?.interviewId ?? null);
  const lastStatusRef = useRef(status);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); 
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const lastFaceDetectedTime = useRef<number>(0);
  const lastVoiceDetectedTime = useRef<number>(0);
  const isSpeakingRef = useRef(false);

  // State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [faceMessage, setFaceMessage] = useState("카메라를 응시해주세요");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string>("장치 연결 오류");

  // 미디어 정리 함수
  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (statusCheckIntervalRef.current) clearInterval(statusCheckIntervalRef.current);
  };

  // 1. 초기화 및 감지 시작
  useEffect(() => {
    let isMounted = true; // 마운트 상태 추적용 플래그

    // Only reset when there is no active interview to avoid accidental mid-session resets
    if (!currentInterviewId) {
      // ★ 수정: 모든 면접 관련 상태를 초기화하여 새 면접이 깨끗한 상태에서 시작되도록 보장합니다.
      dispatch(resetInterview());      // interviewSlice 초기화
      dispatch(resetSession());         // interviewSessionSlice 초기화
      dispatch(resetInterviewUI());     // interviewUISlice 초기화

      // [Fix] 리덕스 상태를 초기화했으므로, 중복 디스패치 방지용 Ref도 초기 상태로 동기화해야 합니다.
      // 그렇지 않으면 이전 상태(모두 success)를 기억하고 있어서, 실제 장비가 준비되어도 상태 업데이트를 건너뛸 수 있습니다.
      lastStatusRef.current = {
        webcam: 'loading',
        mic: 'loading',
        face: 'loading',
        voice: 'loading'
      };
    }

    const initDevices = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720, frameRate: { ideal: 30 } }, 
          audio: true 
        });
        
        // ★ 추가: 비동기 요청 완료 후 컴포넌트가 언마운트 상태라면 스트림을 즉시 닫고 중단
        if (!isMounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;

        startAudioAnalysis(mediaStream);
        startMonitoringLoop(); 

      } catch (err) {
        if (!isMounted) return; // 언마운트 상태면 에러 처리도 생략
        console.error("장치 접근 실패:", err);
        let message = "알 수 없는 오류로 장치에 접근할 수 없습니다. 브라우저 주소창의 카메라/마이크 아이콘을 확인해주세요.";
        if (err instanceof Error) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                message = "카메라와 마이크 접근 권한이 거부되었습니다. 브라우저 설정에서 이 사이트의 권한을 '허용'으로 변경해주세요.";
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                message = "연결된 카메라나 마이크를 찾을 수 없습니다. 장치가 올바르게 연결되었는지 확인해주세요.";
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                message = "하드웨어 오류로 인해 카메라나 마이크를 사용할 수 없습니다. 다른 프로그램에서 사용 중인지 확인하거나 장치를 재연결해주세요.";
            }
        }
        setErrorMessage(message);
        setErrorTitle("장치 연결 오류");
        dispatch(updateDeviceStatus({ webcam: 'error', mic: 'error', face: 'error', voice: 'error' }));
      }
    };

    initDevices();
    return () => {
      isMounted = false; // 클린업 시 플래그 false 설정
      stopMedia();
    };
  }, [dispatch]);

  // ★ [수정됨] 화면 이동 로직을 useEffect로 분리 (렌더링 충돌 해결)
  useEffect(() => {
    if (isTransitioning && countdown === 0) {
        stopMedia();
        if (mode === 'real') navigate('/interview/real');
        else navigate('/interview/practice');
    }
  }, [isTransitioning, countdown, mode, navigate]);

  const startMonitoringLoop = () => {
    statusCheckIntervalRef.current = setInterval(async () => {
      if (!streamRef.current || !streamRef.current.active) {
        dispatch(updateDeviceStatus({ webcam: 'error', mic: 'error', face: 'error', voice: 'error' }));
        return;
      }

      const videoTrack = streamRef.current.getVideoTracks()[0];
      const audioTrack = streamRef.current.getAudioTracks()[0];

      const isWebcamLive = videoTrack && videoTrack.readyState === 'live' && videoTrack.enabled;
      const isMicLive = audioTrack && audioTrack.readyState === 'live' && audioTrack.enabled;

      const webcamStatus: CheckStatus = isWebcamLive ? 'success' : 'error';
      const micStatus: CheckStatus = isMicLive ? 'success' : 'error';

      // --- [얼굴 인식 판별] ---
      let isLiveFace = false;
      
      if (isWebcamLive && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.readyState === 4) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const structuralCheck = analyzeFaceStructure(ctx, canvas.width, canvas.height);
          
          let apiDetected = false;
          if ('FaceDetector' in window) {
             try {
               // @ts-ignore
               const faceDetector = new FaceDetector();
               // @ts-ignore
               const faces = await faceDetector.detect(video);
               if (faces.length > 0) apiDetected = true; 
             } catch (e) { /* API 무시 */ }
          }

          if (structuralCheck) {
              isLiveFace = true;
          } else {
              isLiveFace = false;
          }
        }
      }

      // 상태 업데이트
      if (isLiveFace) {
          lastFaceDetectedTime.current = Date.now();
      }

      let faceStatus: CheckStatus = 'loading';
      if (!isWebcamLive) {
          faceStatus = 'error';
          setFaceMessage("카메라 꺼짐");
      } else if (Date.now() - lastFaceDetectedTime.current < 500) { 
          faceStatus = 'success';
          setFaceMessage("인식 완료");
      } else {
          faceStatus = 'loading';
          setFaceMessage("중앙에 맞춰주세요");
      }

      // --- [음성 인식 판별] ---
      if (isSpeakingRef.current) {
          lastVoiceDetectedTime.current = Date.now();
      }

      let voiceStatus: CheckStatus = 'loading';
      if (!isMicLive) {
          voiceStatus = 'error';
      } else if (Date.now() - lastVoiceDetectedTime.current < 2000) {
          voiceStatus = 'success';
      } else {
          voiceStatus = 'loading';
      }

      // [Redux] 상태 비교 및 Dispatch
      const newStatus = {
        webcam: webcamStatus,
        mic: micStatus,
        face: faceStatus,
        voice: voiceStatus
      };

      if (JSON.stringify(lastStatusRef.current) !== JSON.stringify(newStatus)) {
          dispatch(updateDeviceStatus(newStatus));
          lastStatusRef.current = newStatus;
      }

    }, 500);
  };

  const analyzeFaceStructure = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 220; 
    const half = size / 2;
    const startX = centerX - half;
    const startY = centerY - half;

    const imageData = ctx.getImageData(startX, startY, size, size);
    const data = imageData.data;
    
    let leftEyeLuma = 0, leftEyeCount = 0;
    let rightEyeLuma = 0, rightEyeCount = 0;
    let noseCheekLuma = 0, noseCheekCount = 0;
    let skinPixelCount = 0; 

    for (let y = 0; y < size; y += 4) {
        for (let x = 0; x < size; x += 4) {
            const index = (y * size + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;

            if (r > 60 && g > 40 && b > 20 && r > b) {
                skinPixelCount++;
            }

            if (x > size * 0.15 && x < size * 0.40 && y > size * 0.25 && y < size * 0.45) {
                leftEyeLuma += luma;
                leftEyeCount++;
            }
            else if (x > size * 0.60 && x < size * 0.85 && y > size * 0.25 && y < size * 0.45) {
                rightEyeLuma += luma;
                rightEyeCount++;
            }
            else if (x > size * 0.30 && x < size * 0.70 && y > size * 0.50 && y < size * 0.75) {
                noseCheekLuma += luma;
                noseCheekCount++;
            }
        }
    }

    const avgLeftEye = leftEyeCount > 0 ? leftEyeLuma / leftEyeCount : 0;
    const avgRightEye = rightEyeCount > 0 ? rightEyeLuma / rightEyeCount : 0;
    const avgNoseCheek = noseCheekCount > 0 ? noseCheekLuma / noseCheekCount : 0;
    const avgEyes = (avgLeftEye + avgRightEye) / 2;

    const totalSampled = (size/4) * (size/4);
    if (skinPixelCount / totalSampled < 0.2) return false;

    if (avgNoseCheek - avgEyes < 15) {
        return false; 
    }

    const symmetryDiff = Math.abs(avgLeftEye - avgRightEye);
    if (symmetryDiff > 30) {
        return false; 
    }

    return true;
  };

  const startAudioAnalysis = (currentStream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(currentStream);

      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const draw = () => {
        if (!analyserRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        const barCount = 24;
        const effectiveRange = Math.floor(bufferLength * 0.6); 

        for (let i = 0; i < barCount; i++) {
          const index = Math.floor(i * (effectiveRange / barCount));
          const value = dataArray[index];
          sum += value;
          
          const height = Math.max(4, (value / 255) * 100);
          if (barsRef.current[i]) {
              barsRef.current[i]!.style.height = `${height}%`;
              barsRef.current[i]!.style.opacity = height > 5 ? '1' : '0.3';
          }
        }

        const average = sum / barCount;
        const isSpeakingNow = average > 10;
        
        setIsSpeaking(isSpeakingNow);
        isSpeakingRef.current = isSpeakingNow;

        animationFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch (e) { console.error(e); }
  };

  const isAllReady = Object.values(status).every(s => s === 'success');

  // ★ [수정됨] navigate 제거, 상태만 변경
  const handleStartInterview = async () => {
    if (!isAllReady || isCreatingSession) return;
    setIsCreatingSession(true);

    // Explicitly clear any prior interview state to avoid carrying over previous questions/answers
    dispatch(resetInterview());
    dispatch(resetSession());
    dispatch(resetInterviewUI());
    console.log('[EnvironmentCheck] Cleared previous interview state before creating a new session.');

    try {
      const interviewType = (locationState.interviewType as 'CS' | 'PORTFOLIO') || 'CS';
      const payload: Parameters<typeof interviewService.createInterview>[0] = {
        interviewType,
        runMode: mode.toUpperCase() as 'PRACTICE' | 'REAL',
        targetQuestionCount,
        optionJson: "{}",
      };

      if (interviewType === 'CS') {
        payload.categoryId = categoryId;
      } else if (locationState.portfolioId) {
        payload.portfolioId = locationState.portfolioId;
      }

      const response = await interviewService.createInterview(payload);

      const newInterviewId = response.interviewId; // API 응답 구조에 맞춰 수정
      if (!newInterviewId) {
        throw new Error('API 응답에서 interviewId를 받지 못했습니다.');
      }

      dispatch(setInterviewId(newInterviewId));
      dispatch(setInterviewConfig({ targetQuestionCount, runMode: mode.toUpperCase() as 'PRACTICE' | 'REAL' }));
      
      // 성공 시 카운트다운 시작
      setIsTransitioning(true);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error("면접 세션 생성 실패:", error);

      if (error.response?.status === 401) {
        alert("로그인이 필요하거나 세션이 만료되었습니다. 메인 화면으로 이동합니다.");
        navigate('/');
        return;
      }

      setErrorTitle("세션 생성 실패");
      const msg = error?.response?.data?.message || "면접 세션을 생성하는데 실패했습니다. 잠시 후 다시 시도해주세요.";
      setErrorMessage(msg);
      setIsCreatingSession(false);
    }
  };

  const handleGoBack = () => {
      stopMedia();
      navigate('/');
  };

  return (
    <div className="relative h-screen w-full bg-black text-white overflow-hidden flex">
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 z-0">
        <video 
             ref={videoRef}
             autoPlay 
             muted 
             playsInline
             className="h-full w-full object-cover transform scale-x-[-1]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] rounded-[40px] border-2 transition-all duration-300 z-10 flex items-center justify-center
            ${status.face === 'success' 
                ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] bg-green-500/5' 
                : 'border-white/30 border-dashed bg-black/20'
            }`}
        >
            {status.face !== 'success' && (
              <>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/50 rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/50 rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/50 rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/50 rounded-br-3xl" />
                
                <div className="text-center animate-pulse">
                    <ScanFace className="w-12 h-12 text-white/50 mx-auto mb-3" />
                    <p className="text-sm font-bold text-white bg-black/60 px-4 py-2 rounded-full backdrop-blur-md whitespace-nowrap">
                        {faceMessage}
                    </p>
                </div>
              </>
            )}
        </div>
      </div>

      <header className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-center pointer-events-none">
        <button 
            onClick={handleGoBack}
            className="pointer-events-auto group flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all"
        >
            <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            <span className="font-bold text-zinc-200 group-hover:text-white">나가기</span>
        </button>
        
        <div className={`pointer-events-auto transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full hover:bg-blue-600 hover:border-blue-500 transition-all shadow-lg"
            >
                <PanelRightOpen className="w-5 h-5" />
                <span className="text-sm font-bold">환경 설정</span>
            </button>
        </div>
      </header>

      <div 
        className={`
            fixed top-0 right-0 bottom-0 z-40 w-full max-w-md 
            bg-black/80 backdrop-blur-2xl border-l border-white/10 shadow-2xl
            transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">응시 환경 체크</h2>
                    <p className="text-zinc-400 text-xs mt-1">
                        {mode === 'real' ? '⚔️ 실전 모드 준비 중' : '✨ 연습 모드 준비 중'}
                    </p>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 space-y-4">
                {errorMessage && (
                    <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 text-sm animate-in fade-in">
                        <p className="font-bold mb-2">{errorTitle}</p>
                        <p className="text-xs leading-relaxed">{errorMessage}</p>
                    </div>
                )}

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-200 text-sm">
                    <p className="font-bold flex items-center gap-2 mb-1">
                        📢 안내
                    </p>
                    <p className="text-xs leading-relaxed opacity-90">
                        정확한 분석을 위해, 소음이 없는 <strong>조용한 곳</strong>에서 진행해주세요.
                    </p>
                </div>

                <CheckRow label="웹캠 연결" status={status.webcam} />
                <CheckRow label="얼굴 인식" status={status.face} subText={status.face !== 'success' ? faceMessage : '중앙 인식 완료'} />
                <CheckRow label="마이크 설정" status={status.mic} />
                <CheckRow label="음성 인식" status={status.voice} />
                
                <div className="mt-6 flex flex-col items-center justify-center gap-3 h-24 bg-white/5 rounded-2xl border border-white/5 p-4 transition-colors duration-300">
                    <div className="flex items-center gap-[3px] h-10 w-full justify-center">
                        {[...Array(24)].map((_, i) => (
                        <div 
                            key={i}
                            ref={el => barsRef.current[i] = el}
                            className={`w-1 rounded-full transition-[height] duration-75 ease-linear ${isSpeaking ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'bg-zinc-700'}`}
                            style={{ height: '4px', opacity: 0.5 }} 
                        />
                        ))}
                    </div>
                    <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${isSpeaking ? 'text-green-400' : 'text-zinc-600'}`}>
                        {isSpeaking ? "Voice Detected" : "소리를 내보세요"}
                    </span>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
                 <button 
                    disabled={!isAllReady || isCreatingSession}
                    onClick={handleStartInterview}
                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden
                        ${isAllReady && !isCreatingSession
                            ? 'text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98]' 
                            : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                        }
                    `}
                 >
                    {isAllReady && !isCreatingSession && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${mode === 'real' ? 'from-red-600 to-orange-600' : 'from-blue-600 to-indigo-600'} opacity-100 transition-opacity`} />
                    )}
                    
                    <span className="relative z-10 flex items-center gap-2">
                    {isCreatingSession ? (
                        <>INITIALIZING... <Loader2 className="w-5 h-5 animate-spin" /></>
                    )
                    : isAllReady ? (
                        <>START INTERVIEW <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    ) : (
                        <>WAITING FOR DEVICES...</>
                    )}
                    </span>
                 </button>
            </div>
        </div>
      </div>

      {isTransitioning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black animate-in fade-in duration-700">
            {/* Ambient Background */}
            <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${mode === 'real' ? 'from-red-900 via-black to-black' : 'from-blue-900 via-black to-black'}`} />
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                    {/* Ring Animation */}
                    <svg className="w-64 h-64 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90">
                        <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="2" fill="none" className="text-zinc-900" />
                        <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="4" fill="none" 
                            className={`${mode === 'real' ? 'text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]'} transition-all duration-1000 ease-linear`}
                            strokeDasharray="754"
                            strokeDashoffset={754 - (754 * (3 - countdown) / 3)}
                            strokeLinecap="round"
                        />
                    </svg>
                    
                    <span className="relative text-8xl font-black text-white tabular-nums tracking-tighter flex items-center justify-center w-64 h-64">
                        {countdown > 0 ? countdown : "GO"}
                    </span>
                </div>

                <h2 className={`mt-12 text-sm font-bold tracking-[0.5em] uppercase animate-pulse ${mode === 'real' ? 'text-red-500' : 'text-blue-500'}`}>
                    {mode === 'real' ? 'Initializing Real Mode...' : 'Loading Practice Environment...'}
                </h2>
            </div>
        </div>
      )}
    </div>
  );
};

// --- 서브 컴포넌트 ---
const CheckRow = ({ label, status, subText }: { label: string, status: CheckStatus, subText?: string }) => {
    const isSuccess = status === 'success';
    const isError = status === 'error';
    const isLoading = status === 'loading';
  
    return (
      <div className={`
        relative overflow-hidden
        flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 group
        ${isSuccess ? 'bg-zinc-900/80 border-green-500/20' : 'bg-zinc-900/50 border-white/5'}
        ${isError ? 'bg-red-900/10 border-red-500/20' : ''}
      `}>
        {/* Success Glow Background */}
        {isSuccess && <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
        
        <div className="relative z-10 flex flex-col">
            <div className="flex items-center gap-3">
                <span className={`text-sm font-bold tracking-wide ${isSuccess ? 'text-white' : 'text-zinc-400'}`}>
                    {label}
                </span>
            </div>
            {subText && (
                <span className={`text-[10px] mt-1.5 font-medium tracking-wider uppercase ${isSuccess ? 'text-green-400' : 'text-zinc-600'}`}>
                    {subText}
                </span>
            )}
        </div>
  
        <div className={`
            relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500
            ${isSuccess ? 'bg-green-500 text-black scale-110 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-zinc-800 text-zinc-600'}
            ${isError ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}
        `}>
            {isSuccess && <CheckCircle2 className="w-4 h-4" />}
            {isError && <X className="w-4 h-4" />}
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
            {status === 'pending' && <div className="w-2 h-2 rounded-full bg-zinc-600" />}
        </div>
      </div>
    );
  };

export default EnvironmentCheck;