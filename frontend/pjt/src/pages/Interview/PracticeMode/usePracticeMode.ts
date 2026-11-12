import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { useDispatch, useSelector } from 'react-redux';

import { interviewService } from '../../../api/interviewService';
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

import type { ExpressionData, VoiceOption } from './PracticeMode.types';
import { VOICE_PRESETS, MODEL_URL, AUDIO_THROTTLE_MS, DETECTION_INTERVAL_MS } from './PracticeMode.constants';
import { buildVideoSummaryPayload } from '../shared/videoAnalysis';

export const usePracticeMode = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { questions, currentIndex, interviewId, targetQuestionCount } = useSelector(selectInterviewState);
  const currentQuestion = questions[currentIndex];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0); 
  const [answerTime, setAnswerTime] = useState(0); 
  const [isRecording, setIsRecording] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [debugMsg, setDebugMsg] = useState<string>('초기화 중...');
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
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

  // Last recorded video + skip-next state (match RealMode behavior)
  const [lastRecordedVideoUrl, setLastRecordedVideoUrl] = useState<string | null>(null);
  const [nextQuestionForSkip, setNextQuestionForSkip] = useState<any | null>(null);
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

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
      audioContextRef.current.close().catch(e => console.log('Audio close error:', e));
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    setStream(null);
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setDebugMsg('준비 완료');
      } catch (err) {
        setDebugMsg('모델 로드 실패');
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

  useEffect(() => {
    if (!modelsLoaded) return;
    const getWebcamStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
        streamRef.current = mediaStream;
        setStream(mediaStream);

        console.log('[usePracticeMode] getUserMedia OK, tracks:', mediaStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled }))); 
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
          if (timestamp - audioThrottleRef.current >= AUDIO_THROTTLE_MS) {
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
        setDebugMsg('웹캠 권한 오류');
      }
    };
    getWebcamStream();
    return () => stopMedia();
  }, [modelsLoaded]);

  const setVideoRef = useCallback((videoElement: HTMLVideoElement | null) => {
    videoRef.current = videoElement;
    if (videoElement && stream) {
      videoElement.srcObject = stream;
      videoElement.play().catch(() => {});
    }
  }, [stream]);

  const handleVideoOnPlay = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.videoWidth === 0) return;
      try {
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        if (detections.length > 0) {
          const detection = detections[0];
          const expressions = detection.expressions;
          const landmarks = detection.landmarks;
          const faceBox = detection.detection.box;
          const score = 50 + (expressions.happy * 50) + (expressions.neutral * 10) - (expressions.sad * 25) - (expressions.angry * 25);
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
    }, DETECTION_INTERVAL_MS);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setAnswerTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => { answerTimeRef.current = answerTime; }, [answerTime]);

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

      options.unshift({ name: 'Google Translate (Online)', lang: 'ko-KR', type: 'google' });

      setVoiceOptions(options);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  useEffect(() => {
    if (voiceOptions.length > 0 && !selectedVoice) {
      const saved = localStorage.getItem('interview_voice_settings');
      let savedVoiceName = null;
      if (saved) {
        try { savedVoiceName = JSON.parse(saved).voiceName; } catch {}
      }

      let targetVoice = voiceOptions.find(v => v.name === savedVoiceName);
      if (!targetVoice) {
        targetVoice = voiceOptions.find(v => v.name.includes('Heami')) || 
                      voiceOptions.find(v => v.type === 'google') || 
                      voiceOptions[0];
      }
      if (targetVoice) setSelectedVoice(targetVoice);
    }
  }, [voiceOptions, selectedVoice]);

  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('interview_voice_settings', JSON.stringify({ voiceName: selectedVoice.name, rate, pitch }));
    }
  }, [selectedVoice, rate, pitch]);

  useEffect(() => {
    const fetchInitialQuestion = async () => {
      if (questions.length === 0 && interviewId && modelsLoaded) {
        setIsFetchingQuestion(true);
        try {
          const response = await interviewService.getNextQuestion(Number(interviewId));
          if (response && response.questionText) {
            const formattedQuestion = { id: Number(response.turnId), text: response.questionText, turnId: Number(response.turnId), keywords: (response as any).keywords || [], hint: '' };
            dispatch(setQuestions([formattedQuestion]));
            dispatch(setCurrentIndex(0));
          }
        } catch (error) {
          console.error('질문 로드 실패:', error);
        } finally {
          setIsFetchingQuestion(false);
        }
      }
    };
    fetchInitialQuestion();
  }, [modelsLoaded, questions.length, interviewId, dispatch]);

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

  useEffect(() => {
    let isCancelled = false;

    const playSequence = async () => {
      if (isReadyToStart && currentQuestion?.text && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }

        await playAttentionSound();

        if (isCancelled) return;

        let targetVoice = selectedVoice;
        let targetRate = rate;
        let targetPitch = pitch;

        if (isPanelMode && voiceOptions.length > 0) {
          const randomVoiceIdx = Math.floor(Math.random() * voiceOptions.length);
          const randomPresetIdx = Math.floor(Math.random() * VOICE_PRESETS.length);
          targetVoice = voiceOptions[randomVoiceIdx];
          targetRate = VOICE_PRESETS[randomPresetIdx].rate;
          targetPitch = VOICE_PRESETS[randomPresetIdx].pitch;
        }

        if (targetVoice?.type === 'google') {
          const sentences = currentQuestion.text.match(/[^.?!]+[.?!]+|[^.?!]+$/g) || [currentQuestion.text];
          let index = 0;

          const playNext = () => {
            if (isCancelled) return;
            if (index >= sentences.length) {
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
            audio.onerror = () => { index++; playNext(); };

            audio.play().catch(e => console.error('Google TTS Error:', e));
            audioPlayerRef.current = audio;
          };

          playNext();
        } else {
          const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
          utterance.lang = 'ko-KR';
          if (targetVoice?.voice) {
            utterance.voice = targetVoice.voice;
          }
          utterance.rate = targetRate;
          utterance.pitch = targetPitch;
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
    };
  }, [currentQuestion?.text, selectedVoice, rate, pitch, isPanelMode, voiceOptions, isReadyToStart, playAttentionSound]);

  const handleTestVoice = () => {
    if (!selectedVoice) return;
    window.speechSynthesis.cancel();
    if (audioPlayerRef.current) audioPlayerRef.current.pause();

    const text = '현재 설정된 목소리입니다. 면접을 시작해볼까요?';

    if (selectedVoice.type === 'google') {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ko&q=${encodeURIComponent(text)}`;
      const audio = new Audio(url);
      audio.playbackRate = rate;
      audio.play().catch(e => console.error('Google TTS Error:', e));
      audioPlayerRef.current = audio;
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice.voice) utterance.voice = selectedVoice.voice;
      utterance.rate = rate;
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Skip-to-next handler (mirror RealMode behavior)
  const handleSkipToNextQuestion = () => {
    if (nextQuestionForSkip) {
      setIsTransitioning(true);
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


  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const pollVideoAnalysis = (turnId: number, jobId: number, clientSummary: any) => {
    const interval = setInterval(async () => {
      try {
        const jobResult = await interviewService.getAnalysisJob(jobId);
        if (jobResult.status === 'DONE') {
          clearInterval(interval);
          console.log(`[Turn ${turnId}] 영상 분석 완료:`, jobResult);

          let resultData: any = {};
          try {
            if (jobResult.resultJson) resultData = JSON.parse(jobResult.resultJson);
          } catch (e) {
            console.error('영상 분석 결과 파싱 실패:', e);
          }

          dispatch(updateAnswer({
            turnId,
            videoAnalyses: [{
              jobId: jobResult.jobId,
              status: jobResult.status,
              score: jobResult.score,
              inputSummary: clientSummary,
              feedbackTitle: resultData.feedback_title,
              detailedFeedback: resultData.detailed_feedback,
              coachingMessage: resultData.coaching_message,
            }]
          }));
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

  const sendVideoAnalysisSummary = async (turnId: number, duration: number) => {
    if (!interviewId) return;
    const numericInterviewId = Number(interviewId);
    const payload = buildVideoSummaryPayload(turnId, numericInterviewId, duration, [...expressionHistoryRef.current]);
    try {
      const videoAnalysisResponse = await interviewService.analyzeVideo(numericInterviewId, turnId, payload);
      if (videoAnalysisResponse?.jobId) {
        pollVideoAnalysis(turnId, videoAnalysisResponse.jobId, payload.summary);
      }
    } catch (error) {
      console.error(`[Turn ${turnId}] 영상 분석 업로드 실패:`, error);
    }
  };

  const uploadAndAnalyze = async (videoBlob: Blob, audioBlob: Blob, turnId: number, duration: number) => {
    try {
      const videoFile = new File([videoBlob], `v_${turnId}.webm`, { type: 'video/webm' });
      const audioFile = new File([audioBlob], `a_${turnId}.webm`, { type: 'audio/webm' });

      const videoUploadRes = await interviewService.uploadVideo(Number(interviewId), turnId, videoFile);
      // If server returns a key for the uploaded video, persist it to the saved answer
      if (videoUploadRes?.key) {
        console.log(`[Turn ${turnId}] uploaded video key:`, videoUploadRes.key);
        dispatch(updateAnswer({ turnId: Number(turnId), videoKey: videoUploadRes.key }));
      }
      await sendVideoAnalysisSummary(turnId, duration);
      await interviewService.uploadAudio(Number(interviewId), turnId, audioFile);

      await new Promise(resolve => setTimeout(resolve, 3000));

      let analyzeResponse;
      try {
        analyzeResponse = await interviewService.analyzeAudio(Number(interviewId), turnId);
      } catch (audioError) {
        console.error('음성 분석 실패 (AI 서버 문제로 추정):', audioError);
        analyzeResponse = { finished: false, nextTurn: null, answerText: '[음성 분석에 실패했습니다. AI 서버 상태를 확인해주세요.]' };
      }

      let finalSttScore = (analyzeResponse as any).sttScore;
      if (finalSttScore === undefined && analyzeResponse.answerText && !analyzeResponse.answerText.startsWith('[')) {
        try {
          const turnsRes = await interviewService.getInterviewTurns(Number(interviewId));
          const turnData = turnsRes.turns.find((t: any) => t.turnId === turnId);
          if (turnData && typeof turnData.sttScore === 'number') {
            finalSttScore = turnData.sttScore;
          }
        } catch (e) {
          console.error('점수 데이터 조회 실패:', e);
        }
      }

      const { finished, nextTurn, answerText, feedbackText } = analyzeResponse;

      if (answerText) dispatch(updateAnswer({ turnId: Number(turnId), answerText: answerText ?? undefined, feedbackText: feedbackText ?? undefined, sttScore: finalSttScore }));

      if (finished) {
        handleFinish();
        return;
      }

      const hasNextTurn = !!nextTurn?.questionText;
      const questionCountReached = questions.length >= targetQuestionCount;

      if (!hasNextTurn && questionCountReached) {
        return;
      }

      const canFetchMain = questions.length < targetQuestionCount;

      if (!hasNextTurn && !canFetchMain) {
        return;
      }

      setIsTransitioning(true);
      const fadeOutPromise = new Promise(resolve => setTimeout(resolve, 500));

      let nextQ = null;

      if (hasNextTurn) {
        nextQ = { id: Number(nextTurn.turnId), text: nextTurn.questionText, turnId: Number(nextTurn.turnId), keywords: (nextTurn as any).keywords || [], hint: '' };
        await fadeOutPromise;
      } else {
        const [nextMain] = await Promise.all([ interviewService.getNextQuestion(Number(interviewId)), fadeOutPromise ]);
        if (nextMain?.questionText) {
          nextQ = { id: Number(nextMain.turnId), text: nextMain.questionText, turnId: Number(nextMain.turnId), keywords: (nextMain as any).keywords || [], hint: '' };
        }
      }

      if (nextQ) {
        // Defer advancing to user action (show Next button) — match RealMode behavior
        setNextQuestionForSkip(nextQ);
        setIsTransitioning(false);
      } else {
        handleFinish();
        setIsTransitioning(false);
      }
    } catch (error) {
      console.error('전송 오류:', error);
      alert('답변 전송 중 오류가 발생했습니다.');
      handleFinish();
    } finally {
      setIsRecording(false);
      // Keep isProcessing true when next question is set so the "다음 질문으로" button can appear
      setIsTransitioning(false);
      expressionHistoryRef.current = [];
      prevNoseRef.current = null;
    }
  };

  const processAndAdvance = useCallback(async (videoBlob: Blob, audioBlob: Blob, duration: number) => {
    if (audioBlob.size === 0) {
      console.error('[PracticeMode] 오디오 데이터가 비어있습니다.');
      alert('음성 녹음 데이터가 정상적으로 생성되지 않았습니다. 다시 시도해주세요.');
      setIsProcessing(false);
      return;
    }

    const videoUrl = URL.createObjectURL(videoBlob);
    setLastRecordedVideoUrl(videoUrl);
    const turnId = Number((currentQuestion as any)?.turnId);

    if (!interviewId || !turnId) {
      alert('세션 정보가 부족합니다.');
      setIsProcessing(false);
      return;
    }

    console.log(`[Turn ${turnId}] saveAnswer local preview url:`, videoUrl);
    console.log(`[usePracticeMode] Dispatching saveAnswer for turnId=${turnId}, questionIndex=${currentIndex}, previewUrl=${videoUrl}`);
    dispatch(saveAnswer({ questionId: currentIndex, content: '[녹화 완료]', duration: duration, videoUrl: videoUrl, turnId: turnId }));
    // Ensure upload step logs turnId and file sizes
    console.log(`[usePracticeMode] Starting uploadAndAnalyze for turnId=${turnId} (videoBlob=${videoBlob.size} bytes, audioBlob=${audioBlob.size} bytes)`);
    uploadAndAnalyze(videoBlob, audioBlob, turnId, duration);
  }, [currentQuestion, interviewId, currentIndex, dispatch]);

  const handleStartRecording = () => {
    if (!streamRef.current || !audioStreamRef.current) {
      alert('장비 권한을 확인해주세요.');
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

    vRecorder.ondataavailable = (e) => {
      console.log('[usePracticeMode] video ondataavailable, size=', e.data?.size);
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    aRecorder.ondataavailable = (e) => {
      console.log('[usePracticeMode] audio ondataavailable, size=', e.data?.size);
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    vRecorder.onerror = (ev) => console.error('[usePracticeMode] video recorder error:', ev);
    aRecorder.onerror = (ev) => console.error('[usePracticeMode] audio recorder error:', ev);

    mediaRecorderRef.current = vRecorder;
    audioRecorderRef.current = aRecorder;

    vRecorder.start();
    aRecorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsProcessing(true);
    if (isRecording) {
      const waitForStop = () => {
        let stoppedCount = 0;
        const checkAndProcess = () => {
          stoppedCount++;
          if (stoppedCount === 2) {
            const videoSize = recordedChunksRef.current.reduce((s, b) => s + (b.size || 0), 0);
            const audioSize = audioChunksRef.current.reduce((s, b) => s + (b.size || 0), 0);
            console.log('[usePracticeMode] stop detected for both recorders — videoBytes=', videoSize, 'audioBytes=', audioSize, 'chunks:', recordedChunksRef.current.length, audioChunksRef.current.length);
            const videoMime = mediaRecorderRef.current?.mimeType || 'video/webm';
            const audioMime = audioRecorderRef.current?.mimeType || 'audio/webm';
            processAndAdvance(new Blob(recordedChunksRef.current, { type: videoMime }), new Blob(audioChunksRef.current, { type: audioMime }), answerTimeRef.current);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
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
  } as const;
};