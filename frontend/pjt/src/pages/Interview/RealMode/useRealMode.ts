import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { useDispatch, useSelector } from 'react-redux';

import { interviewService } from '../../../api/interviewService';
import type { RootState } from '../../../redux/store';
import {
  addQuestion,
  updateAnswer,
  saveAnswer,
  selectInterviewState,
  setQuestions,
  setCurrentIndex,
  nextQuestion,
  finishInterview,
} from '../../../redux/slices/interviewSlice';

import {
  calculateEyeContactScore,
  calculateMovementScore,
  calculatePoseStabilityScore,
} from '../../../utils/faceScore';

import type { ExpressionData, VoiceOption } from './RealMode.types';
import { VOICE_PRESETS, COUNTDOWN_DURATION } from './RealMode.constants';
import { buildVideoSummaryPayload } from '../shared/videoAnalysis';

/**
 * 실전 면접 모드(Real Mode)의 비즈니스 로직을 관리하는 커스텀 훅
 * - 웹캠/마이크 스트림 관리 및 녹화
 * - Face-api.js를 이용한 실시간 표정/시선/자세 분석
 * - TTS(Text-to-Speech)를 이용한 질문 읽기
 * - 백엔드 API 연동 (질문 조회, 답변 제출, 분석 요청)
 */
export const useRealMode = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux Store에서 면접 상태 조회
  const { questions, currentIndex, interviewId, targetQuestionCount } = useSelector(selectInterviewState);
  const currentQuestion = questions[currentIndex];

  // Refs: 렌더링 없이 유지되어야 하는 변수들 (DOM 요소, 미디어 스트림, 분석 데이터 등)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const expressionHistoryRef = useRef<ExpressionData[]>([]);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioThrottleRef = useRef(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const prevNoseRef = useRef<faceapi.Point | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const answerTimeRef = useRef(0);

  // State: UI 렌더링에 영향을 주는 상태들
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0); 
  const [answerTime, setAnswerTime] = useState(0); 
  const [isRecording, setIsRecording] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRecordedVideoUrl, setLastRecordedVideoUrl] = useState<string | null>(null);
  const [nextQuestionForSkip, setNextQuestionForSkip] = useState<any | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [debugMsg, setDebugMsg] = useState<string>("초기화 중...");
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [voiceOptions, setVoiceOptions] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [rate, setRate] = useState(() => {
    const saved = localStorage.getItem('interview_voice_settings');
    return saved ? (JSON.parse(saved).rate ?? 1.0) : 1.0;
  });
  const [pitch, setPitch] = useState(() => {
    const saved = localStorage.getItem('interview_voice_settings');
    return saved ? (JSON.parse(saved).pitch ?? 1.0) : 1.0;
  });
  const [isPanelMode, setIsPanelMode] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // 미디어 스트림 및 타이머 정리 (Cleanup)
  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(e => console.log("Audio close error:", e));
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    setStream(null);
  };

  // Effect: face-api.js 모델 로드
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        console.log(`[face-api] 모델 로딩 시작: ${MODEL_URL}`);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        setDebugMsg("준비 완료");
        console.log('[face-api] 모델 로딩 성공');
      } catch (err) {
        console.error('[face-api] 모델 로딩 실패:', err);
        setDebugMsg(`모델 로드 실패: ${err.message}`);
      }
    };
    loadModels();
  }, []);

  // 초기 진입 시 TTS 시작 지연 (사용자 준비 시간 확보)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReadyToStart(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Effect: 웹캠 스트림 및 오디오 분석기(AudioContext) 초기화
  useEffect(() => {
    if (!modelsLoaded) return;
    const getWebcamStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: true 
        });
        streamRef.current = mediaStream;
        setStream(mediaStream);

        // 오디오 레벨 시각화를 위한 분석기 설정
        const audioOnlyStream = new MediaStream(mediaStream.getAudioTracks());
        audioStreamRef.current = audioOnlyStream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        analyser.fftSize = 32;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const updateAudioLevel = (timestamp: number) => {
          if (timestamp - audioThrottleRef.current >= 100) {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setAudioLevel(Math.max(5, avg * 0.8));
            audioThrottleRef.current = timestamp;
          }
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      } catch (err) {
        setDebugMsg("웹캠 권한 오류");
      }
    };
    getWebcamStream();
    return () => stopMedia();
  }, [modelsLoaded]);

  // Video Element에 스트림 연결
  const setVideoRef = useCallback((videoElement: HTMLVideoElement | null) => {
    videoRef.current = videoElement;
    if (videoElement && stream) {
        videoElement.srcObject = stream;
        videoElement.play().catch(() => {}); 
    }
  }, [stream]);

  // 비디오 재생 시 얼굴 인식 및 분석 루프 시작 (100ms 간격)
  const handleVideoOnPlay = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.videoWidth === 0) return;
      try {
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks().withFaceExpressions();
        if (detections.length > 0) {
          const detection = detections[0];
          const expressions = detection.expressions;
          const landmarks = detection.landmarks;
          const faceBox = detection.detection.box;
          const score = 50 + (expressions.happy * 50) + (expressions.neutral * 10) - (expressions.sad * 25) - (expressions.angry * 25);
          
          // 유틸리티 함수로 세부 점수 계산
          const eyeContactScore = calculateEyeContactScore(landmarks, faceBox);
          const poseStabilityScore = calculatePoseStabilityScore(landmarks, faceBox);
          const movementResult = calculateMovementScore(landmarks, faceBox, prevNoseRef.current);
          prevNoseRef.current = movementResult.noseCenter;
          expressionHistoryRef.current.push({
              timestamp: Date.now(),
              expressions,
              score: Math.round(Math.min(100, Math.max(0, score))),
              eyeContactScore,
              poseStabilityScore,
              movementScore: movementResult.score,
          });
        }
      } catch (error) {}
    }, 100);
  };

  // 답변 시간 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setAnswerTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => { answerTimeRef.current = answerTime; }, [answerTime]);

  // 브라우저에서 사용 가능한 TTS 목소리 목록 로드
  useEffect(() => {
    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const krVoices = allVoices.filter(v => v.lang.includes('ko') || v.lang.includes('KR'));
      
      const options: VoiceOption[] = krVoices.map(v => ({
        name: v.name,
        lang: v.lang,
        type: 'native',
        voice: v
      }));

      options.unshift({
        name: 'Google Translate (Online)',
        lang: 'ko-KR',
        type: 'google'
      });

      setVoiceOptions(options);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // 저장된 목소리 설정 불러오기
  useEffect(() => {
    if (voiceOptions.length > 0 && !selectedVoice) {
      const saved = localStorage.getItem('interview_voice_settings');
      let savedVoiceName = null;
      if (saved) {
        try { savedVoiceName = JSON.parse(saved).voiceName; } catch {}
      }

      let targetVoice = voiceOptions.find(v => v.name === savedVoiceName);
      if (!targetVoice) {
        targetVoice = voiceOptions.find(v => v.name.match(/Heami/i)) || 
                      voiceOptions.find(v => v.type === 'google') || 
                      voiceOptions[0];
      }
      if (targetVoice) setSelectedVoice(targetVoice);
    }
  }, [voiceOptions, selectedVoice]);

  // 목소리 설정 변경 시 로컬 스토리지 저장
  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('interview_voice_settings', JSON.stringify({
        voiceName: selectedVoice.name,
        rate,
        pitch
      }));
    }
  }, [selectedVoice, rate, pitch]);

  // 초기 질문이 없을 경우 서버에서 첫 질문 가져오기
  useEffect(() => {
    const fetchInitialQuestion = async () => {
      if (questions.length === 0 && interviewId && modelsLoaded) {
        setIsFetchingQuestion(true);
        try {
          const response = await interviewService.getNextQuestion(Number(interviewId));
          if (response && response.questionText) {
            const formattedQuestion = {
              id: response.turnId,
              text: response.questionText,
              turnId: response.turnId,
              keywords: [],
              hint: ''
            };
            dispatch(setQuestions([formattedQuestion]));
            dispatch(setCurrentIndex(0));
          }
        } catch (error) {
          console.error("질문 로드 실패:", error);
        } finally {
          setIsFetchingQuestion(false);
        }
      }
    };
    fetchInitialQuestion();
  }, [modelsLoaded, questions.length, interviewId, dispatch]);

  const handleTTSComplete = useCallback(() => {
    setCountdown(COUNTDOWN_DURATION);
  }, []);

  // 알림음 재생 함수 (딩동)
  const playAttentionSound = useCallback(() => {
    return new Promise<void>((resolve) => {
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
          resolve();
        }, 1000);
      } catch (e) {
        resolve();
      }
    });
  }, []);

  // 질문 텍스트가 변경되면 TTS로 읽어주기
  useEffect(() => {
    let isCancelled = false;

    const playSequence = async () => {
      if (isReadyToStart && currentQuestion?.text && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
        setCountdown(null); // 질문 변경 시 카운트다운 초기화

        // 알림음 재생 (비동기 대기)
        await playAttentionSound();

        if (isCancelled) return;

        let targetVoice = selectedVoice;
        let targetRate = rate;
        let targetPitch = pitch;

        // 패널 모드일 경우 랜덤 목소리/톤 적용
        if (isPanelMode && voiceOptions.length > 0) {
          const randomVoiceIdx = Math.floor(Math.random() * voiceOptions.length);
          const randomPresetIdx = Math.floor(Math.random() * VOICE_PRESETS.length);
          targetVoice = voiceOptions[randomVoiceIdx];
          targetRate = VOICE_PRESETS[randomPresetIdx].rate;
          targetPitch = VOICE_PRESETS[randomPresetIdx].pitch;
        }

        // Google Translate TTS (비공식 API) 사용 시
        if (targetVoice?.type === 'google') {
          const sentences = currentQuestion.text.match(/[^.?!]+[.?!]+|[^.?!]+$/g) || [currentQuestion.text];
          let index = 0;

          const playNext = () => {
            if (isCancelled) return;
            if (index >= sentences.length) return;
            if (index >= sentences.length) {
              handleTTSComplete();
              return;
            }

            const sentence = sentences[index].trim();
            if (!sentence) {
              index++;
              playNext();
              return;
            }

            const textToPlay = sentence.length > 200 ? sentence.substring(0, 200) : sentence;
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ko&q=${encodeURIComponent(textToPlay)}`;
            
            const audio = new Audio(url);
            audio.playbackRate = targetRate;
            
            audio.onended = () => { index++; playNext(); };
            audio.onerror = () => { 
              index++; 
              if (index >= sentences.length) {
                handleTTSComplete();
              } else {
                playNext(); 
              }
            };

            audio.play().catch(e => console.error("Google TTS Error:", e));
            audioPlayerRef.current = audio;
          };

          playNext();
        } else {
          // 브라우저 내장 Web Speech API 사용 시
          const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
          utterance.lang = 'ko-KR';
          if (targetVoice?.voice) {
            utterance.voice = targetVoice.voice;
          }
          utterance.rate = targetRate;
          utterance.pitch = targetPitch;
          utterance.onend = () => handleTTSComplete();
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    playSequence();

    return () => {
      isCancelled = true;
      window.speechSynthesis.cancel();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setCountdown(null);
    };
  }, [currentQuestion?.text, selectedVoice, rate, pitch, isPanelMode, voiceOptions, handleTTSComplete, isReadyToStart, playAttentionSound]);

  // 목소리 테스트 버튼 핸들러
  const handleTestVoice = () => {
    if (!selectedVoice) return;
    window.speechSynthesis.cancel();
    if (audioPlayerRef.current) audioPlayerRef.current.pause();

    const text = "현재 설정된 목소리입니다. 면접을 시작해볼까요?";

    if (selectedVoice.type === 'google') {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ko&q=${encodeURIComponent(text)}`;
      const audio = new Audio(url);
      audio.playbackRate = rate;
      audio.play().catch(e => console.error("Google TTS Error:", e));
      audioPlayerRef.current = audio;
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice.voice) utterance.voice = selectedVoice.voice;
      utterance.rate = rate;
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 마이크 토글 핸들러
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  // 영상 분석 작업 상태 폴링 (비동기 분석 결과 확인)
  const pollVideoAnalysis = (turnId: number, jobId: number) => {
    const interval = setInterval(async () => {
      try {
        const jobResult = await interviewService.getAnalysisJob(jobId);
        if (jobResult.status === 'DONE') {
          clearInterval(interval);
          console.log(`[Turn ${turnId}] 영상 분석 완료:`, jobResult);
        } else if (jobResult.status === 'FAILED') {
          clearInterval(interval);
          console.error(`[Turn ${turnId}] 영상 분석 실패:`, jobResult.errorMessage);
        }
      } catch (error) {
        clearInterval(interval);
        console.error(`[Turn ${turnId}] 영상 분석 폴링 오류:`, error);
      }
    }, 3000);
  };

  // 영상 분석 요약 데이터(표정 등) 전송
  const sendVideoAnalysisSummary = async (turnId: number, duration: number) => {
    if (!interviewId) return;
    const numericInterviewId = Number(interviewId);
    const payload = buildVideoSummaryPayload(turnId, numericInterviewId, duration, [...expressionHistoryRef.current]);
    try {
      const videoAnalysisResponse = await interviewService.analyzeVideo(numericInterviewId, turnId, payload);
      if (videoAnalysisResponse?.jobId) {
        pollVideoAnalysis(turnId, videoAnalysisResponse.jobId);
      }
    } catch (error) {
      console.error(`[Turn ${turnId}] 영상 분석 업로드 실패:`, error);
    }
  };

  // '다음 질문으로' 건너뛰기 핸들러 (답변 영상 확인 후 이동)
  const handleSkipToNextQuestion = () => {
    if (nextQuestionForSkip) {
      setIsTransitioning(true);
      // Faking transition time
      setTimeout(() => {
        dispatch(addQuestion(nextQuestionForSkip));
        dispatch(nextQuestion());
        setAnswerTime(0);
        setIsTransitioning(false);
        setLastRecordedVideoUrl(null);
        setNextQuestionForSkip(null);
        setIsProcessing(false);
        expressionHistoryRef.current = [];
        prevNoseRef.current = null;
      }, 500);
    }
  };

  // 답변 업로드 및 AI 분석 요청 로직
  const uploadAndAnalyze = async (videoBlob: Blob, audioBlob: Blob, turnId: number, duration: number) => {
    try {
      const videoFile = new File([videoBlob], `v_${turnId}.webm`, { type: 'video/webm' });
      const audioFile = new File([audioBlob], `a_${turnId}.webm`, { type: 'audio/webm' });

      await interviewService.uploadVideo(Number(interviewId), turnId, videoFile);
      await sendVideoAnalysisSummary(turnId, duration);
      await interviewService.uploadAudio(Number(interviewId), turnId, audioFile);
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 오디오 분석 요청 (STT 및 꼬리질문 생성)
      let analyzeResponse;
      try {
        analyzeResponse = await interviewService.analyzeAudio(Number(interviewId), turnId);
      } catch (audioError) {
        console.error("음성 분석 실패 (AI 서버 문제로 추정):", audioError);
        analyzeResponse = { 
          finished: false, 
          nextTurn: null, 
          answerText: "[음성 분석에 실패했습니다. AI 서버 상태를 확인해주세요.]" 
        };
      }
      
      const { finished, nextTurn, answerText } = analyzeResponse;

      if (answerText) dispatch(updateAnswer({ turnId: Number(turnId), answerText }));

      // 면접 종료 조건 확인
      if (finished) {
        handleFinish();
        setIsProcessing(false);
        return;
      }

      // 다음 질문 결정 (꼬리질문 or 메인질문)
      const hasNextTurn = !!nextTurn?.questionText;
      const questionCountReached = questions.length >= targetQuestionCount;
      
      if (!hasNextTurn && questionCountReached) {
        handleFinish();
        setIsProcessing(false);
        return;
      }

      const canFetchMain = questions.length < targetQuestionCount;

      if (!hasNextTurn && !canFetchMain) {
        handleFinish();
        setIsProcessing(false);
        return;
      }
      
      let nextQ = null;

      if (hasNextTurn) {
        nextQ = { id: nextTurn.turnId, text: nextTurn.questionText, turnId: nextTurn.turnId, keywords: [], hint: '' };
      } else {
        const nextMain = await interviewService.getNextQuestion(Number(interviewId));
        if (nextMain?.questionText) {
          nextQ = { id: nextMain.turnId, text: nextMain.questionText, turnId: nextMain.turnId, keywords: [], hint: '' };
        }
      }

      if (nextQ) {
        // 다음 질문을 바로 띄우지 않고, 사용자가 스킵할 수 있도록 상태에 저장
        setNextQuestionForSkip(nextQ);
      } else {
        handleFinish();
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("전송 오류:", error);
      alert('답변 전송 중 오류가 발생했습니다.');
      handleFinish();
      setIsProcessing(false);
    }
  };

  // 녹화 종료 후 데이터 처리 및 업로드 시작
  const processAndAdvance = useCallback(async (videoBlob: Blob, audioBlob: Blob, duration: number) => {
    if (audioBlob.size === 0) {
      console.error("[RealMode] 오디오 데이터가 비어있습니다.");
      alert("음성 녹음 데이터가 정상적으로 생성되지 않았습니다. 다시 시도해주세요.");
      setIsProcessing(false);
      return;
    }

    // 로컬 미리보기용 URL 생성
    const videoUrl = URL.createObjectURL(videoBlob);
    setLastRecordedVideoUrl(videoUrl);
    const turnId = Number((currentQuestion as any)?.turnId);

    if (!interviewId || !turnId) {
      alert('세션 정보가 부족합니다.');
      setIsProcessing(false);
      return;
    }

    // Redux에 임시 저장 (업로드 전 UI 반영용)
    dispatch(saveAnswer({
      questionId: currentIndex,
      content: `[녹화 완료]`,
      duration: duration,
      videoUrl: videoUrl,
      turnId: turnId
    }));
    
    uploadAndAnalyze(videoBlob, audioBlob, turnId, duration);
  }, [currentQuestion, interviewId, currentIndex, dispatch]);

  // 녹화 시작 핸들러
  const handleStartRecording = useCallback(() => {
    if (!streamRef.current || !audioStreamRef.current) {
      alert("장비 권한을 확인해주세요.");
      return;
    }

    recordedChunksRef.current = [];
    audioChunksRef.current = [];
    setAnswerTime(0);
    expressionHistoryRef.current = [];
    prevNoseRef.current = null;

    const videoMime = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm';
    const audioMime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';

    const vRecorder = new MediaRecorder(streamRef.current, { mimeType: videoMime });
    const aRecorder = new MediaRecorder(audioStreamRef.current, { mimeType: audioMime });

    vRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
    aRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

    mediaRecorderRef.current = vRecorder;
    audioRecorderRef.current = aRecorder;

    vRecorder.start();
    aRecorder.start();
    setIsRecording(true);
  }, []);



  // 카운트다운 및 자동 녹화 시작 이펙트
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      handleStartRecording();
      setCountdown(null);
    }
  }, [countdown, handleStartRecording]);

  // 녹화 종료 핸들러
  const handleStopRecording = () => {
    setIsProcessing(true);
    if (isRecording) {
      const waitForStop = () => {
        let stoppedCount = 0;
        const checkAndProcess = () => {
          stoppedCount++;
          if (stoppedCount === 2) {
             const videoMime = mediaRecorderRef.current?.mimeType || 'video/webm';
             const audioMime = audioRecorderRef.current?.mimeType || 'audio/webm';
             processAndAdvance(
              new Blob(recordedChunksRef.current, { type: videoMime }),
              new Blob(audioChunksRef.current, { type: audioMime }),
              answerTimeRef.current
            );
          }
        };
        if (mediaRecorderRef.current) mediaRecorderRef.current.onstop = checkAndProcess;
        if (audioRecorderRef.current) audioRecorderRef.current.onstop = checkAndProcess;
      };

      waitForStop();
      mediaRecorderRef.current?.stop();
      audioRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  const handleFinish = () => setIsFinishModalOpen(true);

  // 면접 종료 확인 및 리포트 페이지 이동
  const onConfirmFinish = () => {
    dispatch(finishInterview());
    stopMedia();
    navigate('/interview/report');
    setIsFinishModalOpen(false);
  };

  const handleExit = () => {
    setIsExitModalOpen(true);
  };

  const onConfirmExit = () => {
    stopMedia();
    dispatch(finishInterview());
    navigate('/');
    setIsExitModalOpen(false);
  };

  return {
    // State & Data
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
    questions,
    currentQuestion,
    currentIndex,
    targetQuestionCount,
    
    // Voice Settings
    voiceOptions,
    selectedVoice,
    isVoiceDropdownOpen,
    rate,
    pitch,
    isPanelMode,

    // Refs
    videoRef,
    canvasRef,

    // Newly added for playback and skip
    lastRecordedVideoUrl,
    nextQuestionForSkip,

    // Handlers & Setters
    setVideoRef,
    handleVideoOnPlay,
    handleStartRecording,
    handleStopRecording,
    toggleMic,
    handleFinish,
    onConfirmFinish,
    handleExit,
    onConfirmExit,
    handleSkipToNextQuestion, // Newly added
    setIsFinishModalOpen,
    setIsExitModalOpen,
    setSelectedVoice,
    setIsVoiceDropdownOpen,
    setRate,
    setPitch,
    setIsPanelMode,
    handleTestVoice,
  };
};
