import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Download, ChevronLeft, ChevronRight, PlayCircle, Edit3, Video, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

// Redux 연결
import { useSelector } from 'react-redux';
import { selectInterviewState } from '../../redux/slices/interviewSlice';
import { interviewService } from '../../api/interviewService';
import axiosInstance from '../../api/axiosInstance';
// RootState 타입을 가져오기 위해 import (경로가 다를 경우 본인 프로젝트에 맞게 수정해주세요)
import type { RootState } from '../../redux/store';

import Logo from '../../components/Header/Logo';
import SaveReportModal from '../../components/Interview/SaveReportModal';

const InterviewReport: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reportRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Redux에서 데이터 가져오기
  // ★ 상태 관리를 interviewSlice로 통합하여 단일 소스로부터 데이터를 가져옵니다.
  const reduxData = useSelector(selectInterviewState);
  // 유저 정보 가져오기 (auth.user 우선, 없으면 user 슬라이스 확인)
  const user = useSelector((state: RootState) => 
    (state.auth as any)?.user || 
    (state.auth as any)?.userInfo ||
    (state as any).user?.user || 
    (state as any).user
  ) || JSON.parse(localStorage.getItem('user') || localStorage.getItem('userInfo') || 'null'); //
  const { interviewId, runMode } = reduxData;

  // 2. State 설정
  const [apiReport, setApiReport] = useState<any>(null);
  // 리포트 제목 상태 추가
  const [title, setTitle] = useState('');
  const [apiTurns, setApiTurns] = useState<any[]>([]);
  const [serverVideoUrls, setServerVideoUrls] = useState<Record<number, string>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataSource, setDataSource] = useState<'local' | 'server'>('local');
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 제목 PATCH 및 저장 완료 처리 (컴포넌트 함수 상단에서 정의)
  // 서버 턴 데이터와 비디오 URL 매핑 함수 (컴포넌트 함수 내 최상단에 위치해야 함)
  const hydrateServerTurns = async (turns: any[]) => {
    setApiTurns(turns);
    setDataSource('server');
    console.log('[InterviewReport] Loaded server turn data:', turns);

      const videoUrlPromises = turns
      .filter((turn: any) => turn.videoKey)
      .map(async (turn: any) => {
        try {
          const presignedUrlRes = await axiosInstance.post('/api/storage/test/presign-download', { key: turn.videoKey });
          // axiosInstance interceptor returns response.data. Depending on backend wrapper,
          // the URL may be at response.url or response.data.url. Handle both.
          const url = (presignedUrlRes && (presignedUrlRes.url ?? (presignedUrlRes.data && presignedUrlRes.data.url))) ?? undefined;
          return { turnId: turn.turnId, url };
        } catch (e) {
          console.error(`Failed to get presigned URL for turn ${turn.turnId}`, e);
          return null;
        }
      });
      const resolvedUrls = (await Promise.all(videoUrlPromises)).filter(Boolean) as { turnId: number, url: string }[];
    const urlMap = resolvedUrls.reduce((acc, { turnId, url }) => {
      acc[turnId] = url;
      return acc;
    }, {} as Record<number, string>);
    setServerVideoUrls(urlMap);
      console.log('[InterviewReport] Presigned video URL map:', urlMap);
  };

  // 리포트 데이터 새로고침 함수 외부로 분리
  const loadReportData = async () => {
    if (!interviewId) {
      setDataSource('local');
      return;
    }

    // Prefer server data for both PRACTICE and REAL modes; fallback to local if server data unavailable
    console.log(`[InterviewReport] Loading server report for interviewId ${interviewId} (runMode=${runMode})`);

    setIsLoadingData(true);
    let hasServerTurns = false;

    try {
      const resultRes = await interviewService.getInterviewResult(Number(interviewId));
      setApiReport(resultRes);
      // 제목 상태도 갱신 (없으면 인터뷰 목록에서 보조로 찾기)
      let foundTitle = '';
      if (resultRes?.title) foundTitle = resultRes.title;
      else if (resultRes?.data?.title) foundTitle = resultRes.data.title;
      if (!foundTitle) {
        try {
          const interviewList = await interviewService.getInterviews();
          const found = interviewList?.interviews?.find((i: any) => i.interviewId === Number(interviewId));
          if (found?.title) foundTitle = found.title;
        } catch (e) {
          console.warn('인터뷰 목록에서 제목 보조 조회 실패', e);
        }
      }
      if (foundTitle) setTitle(foundTitle);
      // title이 없으면 setTitle을 호출하지 않음 (초기화 방지)
      if (resultRes?.turns?.length) {
        await hydrateServerTurns(resultRes.turns);
        hasServerTurns = true;
      }
    } catch (resultErr) {
      console.error('Failed to load interview result:', resultErr);
    }

    if (!hasServerTurns) {
      try {
        const turnsRes = await interviewService.getInterviewTurns(Number(interviewId));
        if (turnsRes?.turns) {
          await hydrateServerTurns(turnsRes.turns);
          hasServerTurns = true;
        }
      } catch (turnsErr) {
        console.error("Failed to load turn details:", turnsErr);
        setDataSource('local');
      }
    }

    if (!hasServerTurns) {
      setDataSource('local');
    }
    setIsLoadingData(false);
  };

  const handleSaveTitleAndReport = async (newTitle: string) => {
    if (!interviewId) {
      alert('면접 세션 ID를 찾을 수 없습니다.');
      return;
    }
    setIsSaving(true);
    try {
      const url = `/api/interviews/${interviewId}/title`;
      console.log('[PATCH 인터뷰 제목] URL:', url);
      console.log('[PATCH 인터뷰 제목] interviewId:', interviewId);
      console.log('[PATCH 인터뷰 제목] title:', newTitle);
      const response = await axiosInstance.patch(url, { title: newTitle });
      console.log('[PATCH 인터뷰 제목] 응답:', response);
      setTitle(response.data?.data?.title || newTitle); // PATCH 응답의 title을 바로 반영
      alert('제목이 성공적으로 저장되었습니다.');
      setIsSaveModalOpen(false);
      // loadReportData()는 호출하지 않음 (title이 빈 값으로 덮어써지는 문제 방지)
    } catch (e: any) {
      console.error('제목 저장 실패:', e, e?.response);
      if (e?.response) {
        console.error('서버 응답 data:', e.response.data);
        alert('제목 저장 실패: ' + (e.response.data?.message || ''));
      } else {
        alert('제목 저장 실패');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 3. 백엔드 API로부터 실제 리포트 및 턴 데이터 로드
  // hydrateServerTurns 함수는 기존대로 유지
  useEffect(() => {
    loadReportData();
  }, [interviewId, runMode]);

  // 백엔드 데이터(apiTurns)를 우선으로 하되, 로컬 영상(videoUrl)을 보강합니다.
  // 백엔드 데이터가 없으면(예: 면접 직후 미리보기) Redux 데이터를 사용합니다.
  const { displayTurns, displayQuestions } = useMemo(() => {
    if (apiTurns.length > 0) {
      // Merge server turns with any local redux answers so recent local updates (answerText, videoUrl)
      // are visible even if the server-side record hasn't been updated yet.
      const turns = apiTurns.map((apiTurn, idx) => {
        const localTurn = reduxData.answers.find((a: any) => a.turnId === apiTurn.turnId || a.questionId === idx);
        const merged = {
          ...apiTurn,
          // prefer server's stored answerText, fallback to local saved answer or content
          answerText: apiTurn.answerText ?? localTurn?.answerText ?? localTurn?.content ?? null,
          feedbackText: apiTurn.feedbackText ?? localTurn?.feedbackText ?? null,
          sttScore: apiTurn.sttScore ?? localTurn?.sttScore ?? null,
          videoAnalyses: apiTurn.videoAnalyses ?? localTurn?.videoAnalyses ?? [],
          // 안전하게 서버 영상 URL 우선, 없으면 로컬 preview 사용
          videoUrl: apiTurn.videoUrl ?? localTurn?.videoUrl ?? undefined,
        } as any;
        // Debug logging to help trace merging
        console.log('[InterviewReport] Merged turn mapping', { turnId: apiTurn.turnId, idx, serverAnswerText: apiTurn.answerText, localAnswerText: localTurn?.answerText, localContent: localTurn?.content, videoKey: apiTurn.videoKey, localVideoUrl: localTurn?.videoUrl });
        // Warn when truly missing
        if (!merged.answerText && (!merged.videoAnalyses || merged.videoAnalyses.length === 0) && !merged.videoUrl) {
          console.warn('[InterviewReport] Turn missing content:', { turnId: apiTurn.turnId, idx, apiTurn, localTurn });
        }
        return merged;
      });
      const questions = apiTurns.map((t: any) => ({ text: t.questionText }));
      return { displayTurns: turns, displayQuestions: questions };
    }
    return { displayTurns: reduxData.answers || [], displayQuestions: reduxData.questions || [] };
  }, [apiTurns, reduxData.answers, reduxData.questions]);

  // 질문 목록 생성
  const questionCount = displayQuestions.length > 0 ? displayQuestions.length : 1;
  const questionList = Array.from({ length: questionCount }, (_, i) => i + 1);

  const aggregatedScores = useMemo(() => {
    const turns = displayTurns ?? [];
    if (!turns.length) return null;

    const videoAnalyses = turns.flatMap((turn: any) => turn?.videoAnalyses ?? []);
    const sttValues = turns
      .map((turn: any) => (typeof turn?.sttScore === 'number' ? turn.sttScore : null))
      .filter((score): score is number => score !== null);

    const average = (numbers: number[]) =>
      numbers.length ? Math.round(numbers.reduce((sum, value) => sum + value, 0) / numbers.length) : undefined;

    const averageFromVideo = (picker: (entry: any) => number | undefined) => {
      const values = videoAnalyses
        .map(picker)
        .filter((value): value is number => typeof value === 'number');
      return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : undefined;
    };

    const eyeContactScore = averageFromVideo(entry => entry?.inputSummary?.eyeContactScore ?? entry?.inputSummary?.eyeContact ?? entry?.score);
    const poseStabilityScore = averageFromVideo(entry => entry?.inputSummary?.poseStabilityScore);
    const movementScore = averageFromVideo(entry => entry?.inputSummary?.movementScore);
    const videoScore = averageFromVideo(entry => entry?.score);
    const voiceStabilityScore = average(sttValues);

    const availableScores = [eyeContactScore, poseStabilityScore, movementScore, videoScore, voiceStabilityScore].filter(
      (value): value is number => typeof value === 'number'
    );

    const overallScore = voiceStabilityScore ?? videoScore;

    return {
      overallScore,
      eyeContactScore,
      poseStabilityScore,
      movementScore,
      logicScore: videoScore,
      expressionScore: movementScore ?? videoScore,
      voiceStabilityScore,
      videoAnalysisCount: videoAnalyses.length,
      voiceAnalysisCount: sttValues.length,
    };
  }, [displayTurns]);

  // ★ [핵심 수정] 현재 보여줄 데이터 추출
  const currentQuestionItem = displayQuestions[currentQuestion - 1];
  const currentQuestionText = currentQuestionItem 
    ? (typeof currentQuestionItem === 'object' ? (currentQuestionItem.text || currentQuestionItem.questionText) : currentQuestionItem)
    : "질문 데이터가 없습니다.";
    
  // Determine current answer by preferring a match on turnId from local Redux answers,
  // then fall back to server turn index or array position.
  const localAnswerForQuestion = reduxData.answers?.[currentQuestion - 1];
  let currentAnswerData: any = null;
  if (localAnswerForQuestion && localAnswerForQuestion.turnId) {
    currentAnswerData = displayTurns?.find((t: any) => t.turnId === localAnswerForQuestion.turnId) || null;
  }
  // If not found by turnId, try to use server-provided turnIndex or array index
  if (!currentAnswerData && displayTurns && displayTurns.length >= currentQuestion) {
    currentAnswerData = displayTurns[currentQuestion - 1] || null;
  }

  // As a last resort, pick any turn that has matching questionId stored locally
  if (!currentAnswerData && reduxData.answers && reduxData.answers.length > 0) {
    const possible = reduxData.answers.find((a: any) => a.questionId === (currentQuestion - 1));
    if (possible && possible.turnId) currentAnswerData = displayTurns?.find((t: any) => t.turnId === possible.turnId) || possible;
  }

  const currentAnswerText = currentAnswerData?.answerText || currentAnswerData?.content || "답변 내용이 없습니다.";
  const videoSource = currentAnswerData ? (serverVideoUrls[currentAnswerData.turnId] || currentAnswerData.videoUrl) : undefined;
  console.log('[InterviewReport] Selected currentAnswerData', { currentQuestion, currentAnswerData, localAnswerForQuestion, videoSource });

  const currentTurn = useMemo(() => {
    if (!displayTurns?.length) return null;
    return (
      displayTurns.find((turn: any) => turn.turnIndex === currentQuestion) ||
      displayTurns[currentQuestion - 1] ||
      null
    );
  }, [displayTurns, currentQuestion]);

  const questionScore = useMemo(() => {
    if (!currentTurn) return null;
    const videoAnalysis = currentTurn.videoAnalyses?.[0];
    const summary = videoAnalysis?.inputSummary;
    const sttScore = typeof currentTurn?.sttScore === 'number' ? currentTurn.sttScore : undefined;
    const computeAverage = (values: Array<number | undefined>) => {
      const filtered = values.filter((value): value is number => typeof value === 'number');
      return filtered.length ? Math.round(filtered.reduce((sum, value) => sum + value, 0) / filtered.length) : undefined;
    };
    const eyeContactScore = summary?.eyeContactScore;
    const poseStabilityScore = summary?.poseStabilityScore;
    const movementScore = summary?.movementScore;
    const logicScore = videoAnalysis?.score ?? computeAverage([eyeContactScore, poseStabilityScore, movementScore]);
    const expressionScore = movementScore ?? logicScore;
    const overallScore = sttScore ?? videoAnalysis?.score ?? logicScore;
    return {
      overallScore,
      eyeContactScore,
      poseStabilityScore,
      movementScore,
      logicScore,
      expressionScore,
      voiceStabilityScore: sttScore,
      mainEmotion: summary?.mainEmotion,
      strengths: currentTurn.feedbackText || videoAnalysis?.feedbackTitle,
      improvements: videoAnalysis?.coachingMessage,
    };
  }, [currentTurn]);

  const charsPerMin = useMemo(() => {
    if (!currentTurn) return null;
    if (typeof (currentTurn as any).charsPerMin === 'number') return (currentTurn as any).charsPerMin;
    if (typeof (currentTurn as any).chars_per_min === 'number') return (currentTurn as any).chars_per_min;
    return null;
  }, [currentTurn]);

  const charsPerMinStatus = useMemo(() => {
    if (typeof charsPerMin !== 'number') return null;
    if (charsPerMin > 350) return { label: '빠름', tone: 'text-rose-600', bg: 'bg-rose-50' };
    if (charsPerMin < 200) return { label: '느림', tone: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: '보통', tone: 'text-emerald-600', bg: 'bg-emerald-50' };
  }, [charsPerMin]);

  // 날짜 포맷팅
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // 분석 데이터가 없을 경우를 대비한 기본값
  const defaultResult = {
    overallScore: 0,
    eyeContactScore: 0,
    voiceStabilityScore: 0,
    logicScore: 0,
    expressionScore: 0,
    strengths: "분석 결과가 없습니다.",
    improvements: "분석 결과가 없습니다."
  };

  // 최종 결과 매핑 (API 리포트 우선)
  // Redux의 analysisResult는 초기 Mock 데이터일 가능성이 크므로, 
  // 답변을 하지 않았을 때 점수가 나오는 현상을 방지하기 위해 API 데이터만 사용합니다.
  // 만약 서버 분석이 완료되지 않았다면 0점(defaultResult)이 표시됩니다.
  const finalAnalysis = apiReport?.data ?? apiReport;
  const result = {
    overallScore:
      questionScore?.overallScore ??
      finalAnalysis?.totalScore ??
      finalAnalysis?.overallScore ??
      aggregatedScores?.overallScore ??
      defaultResult.overallScore,
    eyeContactScore:
      questionScore?.eyeContactScore ??
      finalAnalysis?.eyeContactScore ??
      aggregatedScores?.eyeContactScore ??
      defaultResult.eyeContactScore,
    voiceStabilityScore:
      questionScore?.voiceStabilityScore ??
      finalAnalysis?.voiceStabilityScore ??
      aggregatedScores?.voiceStabilityScore ??
      defaultResult.voiceStabilityScore,
    logicScore:
      questionScore?.logicScore ??
      finalAnalysis?.logicScore ??
      aggregatedScores?.logicScore ??
      defaultResult.logicScore,
    expressionScore:
      questionScore?.expressionScore ??
      finalAnalysis?.expressionScore ??
      aggregatedScores?.expressionScore ??
      aggregatedScores?.movementScore ??
      defaultResult.expressionScore,
    strengths:
      questionScore?.strengths ??
      finalAnalysis?.totalFeedback ??
      finalAnalysis?.strengths ??
      defaultResult.strengths,
    improvements:
      questionScore?.improvements ??
      finalAnalysis?.improvements ??
      defaultResult.improvements,
  };

  const detailedScoreItems = useMemo(() => {
    const mainEmotion = questionScore?.mainEmotion ?? (currentTurn?.videoAnalyses?.[0]?.inputSummary?.mainEmotion);
    const getNumericValue = (value?: number | null) => (typeof value === 'number' ? value : undefined);
    return [
      { label: 'EYE CONTACT', value: getNumericValue(questionScore?.eyeContactScore ?? aggregatedScores?.eyeContactScore ?? result.eyeContactScore ?? 0) },
      { label: 'POSE STABILITY', value: getNumericValue(questionScore?.poseStabilityScore ?? aggregatedScores?.poseStabilityScore) },
      { label: 'MOVEMENT', value: getNumericValue(questionScore?.movementScore ?? aggregatedScores?.movementScore) },
      { label: 'EXPRESSION', meta: mainEmotion ?? 'neutral' },
    ];
  }, [aggregatedScores, currentTurn, questionScore, result]);

  const handleDownloadPDF = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Interview_Report_${user?.nickname || user?.name || 'User'}_${today}`,
  });

  const handleFinalSave = async (title: string) => {
    if (!apiReport) {
      alert("AI 분석이 완료되지 않아 리포트를 저장할 수 없습니다.");
      setIsSaveModalOpen(false);
      return;
    }

    if (!interviewId) {
      alert('면접 세션 ID를 찾을 수 없습니다. 다시 시도해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Title과 함께 저장 시도
      await interviewService.generateReport(Number(interviewId), title);
      alert('리포트가 성공적으로 저장되었습니다.');
      navigate('/mypage/ai-interview-log');
    } catch (error: any) {
      // 2. 400 에러 발생 시 Fallback 처리
      if (error.response && error.response.status === 400) {
        console.warn('Backend might not support saving with a title. Retrying without title...', error);
        try {
          // 2.1. Title 없이 재시도
          await interviewService.generateReport(Number(interviewId));
          alert('리포트가 저장되었습니다. (서버 버전 문제로 제목은 제외됨)');
          navigate('/mypage/ai-interview-log');
        } catch (retryError) {
          console.error('리포트 저장 재시도에 실패했습니다:', retryError);
          alert('리포트 저장 중 오류가 발생했습니다.');
        }
      } else {
        // 3. 그 외 에러 처리
        console.error('리포트 저장에 실패했습니다:', error);
        alert('리포트 저장 중 오류가 발생했습니다.');
      }
    } finally {
      // 4. 로딩 상태 해제
      setIsSaving(false);
      setIsSaveModalOpen(false);
    }
  };

  useEffect(() => {
    const activeBtn = scrollRef.current?.querySelector(`[data-question="${currentQuestion}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentQuestion]);

  return (
    <div className="absolute inset-0 z-[50] bg-[#050505] overflow-y-auto font-sans text-zinc-100 scrollbar-hide pb-20">
      <div className="relative w-full">
        <div className="h-24 w-full flex-shrink-0 print:hidden" />

        {/* 상단 버튼 영역 */}
        <div className="max-w-[90%] xl:max-w-[1600px] mx-auto my-8 flex justify-between items-center print:hidden w-full">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold transition-all group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 메인으로 가기
            </button>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsSaveModalOpen(true)}
              disabled={!apiReport || isSaving}
              title={!apiReport ? "AI 분석이 완료되지 않아 제목을 설정할 수 없습니다." : "제목 설정"}
              className={`group relative flex items-center gap-2 px-6 py-3 rounded-xl font-black overflow-hidden transition-all active:scale-95 shadow-lg border-none outline-none ${
                !apiReport || isSaving
                  ? 'text-zinc-500 bg-zinc-800 cursor-not-allowed'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <div className="absolute inset-0 bg-white/5 transition-opacity group-hover:opacity-0" />
              {!(!apiReport || isSaving) && (
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]" />
              )}
              <div className="relative z-10 flex items-center gap-2 transition-colors">
                {isSaving ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Edit3 className="w-5 h-5" />
                )}
                <span>{isSaving ? '저장 중...' : '제목 설정'}</span>
              </div>
            </button>
            <button 
              onClick={() => handleDownloadPDF()}            
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-600/40 via-cyan-600/40 to-sky-600/40 backdrop-blur-xl border border-white/20 text-white rounded-xl font-black shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all active:scale-95"
              >
              <Download className="w-5 h-5" /> PDF 저장
            </button>
          </div>
        </div>

        {/* 리포트 본문 */}
        <div 
          ref={reportRef}
          className="print-root max-w-[90%] xl:max-w-[1600px] mx-auto bg-white shadow-[0_0_80px_rgba(0,0,0,0.9)] rounded-[3rem] p-10 border border-white/5 print:shadow-none print:border-none print:m-0 print:p-8 text-slate-900"
        >
          <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-slate-900 pb-6 mb-8 gap-6">
            <div>
              <h1 className="text-5xl font-black tracking-tighter mb-2 italic text-slate-900 uppercase">{title || 'Interview Report'}</h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs font-mono">AI Performance Analysis & Feedback</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl print:hidden shadow-inner">
              <button onClick={() => setCurrentQuestion(prev => Math.max(1, prev - 1))} className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div ref={scrollRef} className="flex gap-2 overflow-x-auto max-w-[180px] scroll-smooth scrollbar-hide py-1 px-1">
                {questionList.map(q => (
                  <button
                    key={q}
                    data-question={q}
                    onClick={() => setCurrentQuestion(q)}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl font-black text-xs transition-all ${
                      currentQuestion === q ? 'bg-blue-600 text-white shadow-lg scale-110' : 'text-slate-400 hover:bg-white'
                    }`}
                  >
                    {String(q).padStart(2, '0')}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentQuestion(prev => Math.min(questionCount, prev + 1))} className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* --- Left Column: Video, User, Overall Score --- */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* Video & User Info */}
                <div className="flex flex-col items-center">
                  {/* 비디오 영역 */}
                  <div className="w-full relative aspect-video bg-black rounded-[2rem] overflow-hidden group shadow-2xl mb-4">
                    {videoSource ? (
                      <video className="w-full h-full object-cover" controls src={videoSource} key={videoSource} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                        <PlayCircle className="w-16 h-16 mb-2 opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Video Recorded</p>
                      </div>
                    )}
                  </div>

                  <div className="relative w-full print:hidden">
                    <button 
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={() => {
                        if (videoSource) {
                          const link = document.createElement('a');
                          link.href = videoSource;
                          link.download = `Interview_Q${currentQuestion}_${user?.nickname || 'User'}.webm`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      disabled={!videoSource}
                      className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 border border-white/5 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all shadow-lg overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Video className="w-4 h-4 group-hover/btn:animate-bounce" /> 인터뷰 영상 PC 저장
                    </button>
                    {showTooltip && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-800/95 backdrop-blur-md text-white text-[10px] leading-relaxed rounded-xl shadow-2xl z-20 animate-in fade-in zoom-in-95 origin-bottom border border-white/10 text-center">
                        모바일·PC 모두 다운로드 가능합니다.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 text-center">
                    <h2 className="text-3xl font-black italic text-slate-900">
                      {user?.nickname || user?.name || '게스트'} <span className="text-sm not-italic text-slate-400 font-bold">님</span>
                    </h2>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase font-mono italic">
                        {today}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        dataSource === 'server' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {dataSource === 'server' ? '서버 데이터' : '로컬 미리보기'}
                      </span>
                    </div>
                  </div>
                </div>

              {/* Overall Score Card */}
              <div className="w-full py-5 px-4 bg-slate-50 rounded-[2rem] border border-slate-100 text-center shadow-sm flex flex-col justify-center items-center gap-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Overall Score</p>
                  <p className="text-4xl font-black text-blue-600 tracking-tighter flex items-baseline justify-center">
                    {isLoadingData ? (
                      <Loader className="w-8 h-8 animate-spin text-blue-300" />
                    ) : (
                      finalAnalysis ? result.overallScore : 0
                    )}
                    <span className="text-lg text-blue-300 ml-1 italic font-light">/100</span>
                  </p>
              </div>

              {/* Detailed Scores (Moved to Left Column) */}
              <section className="space-y-4 mt-2">
                  <p className="text-xl font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2 font-mono">Detailed Scores</p>
                  <div className="space-y-4 py-2">
                    {detailedScoreItems.filter(item => item.label !== 'EXPRESSION').map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <p className="text-lg font-black text-slate-800 tracking-wider uppercase font-mono">
                            {item.label}
                          </p>
                          <span className="text-lg font-black text-blue-600 italic font-mono tracking-tighter">
                            {typeof item.value === 'number' ? `${item.value}/100` : '-'}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${item.value ?? 0}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                    {typeof charsPerMin === 'number' && charsPerMinStatus && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <p className="text-lg font-black text-slate-800 tracking-wider uppercase font-mono">
                            CHARS PER MIN
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-blue-600 italic font-mono tracking-tighter">
                              {charsPerMin}/min
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${charsPerMinStatus.bg} ${charsPerMinStatus.tone}`}>
                              {charsPerMinStatus.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {detailedScoreItems.filter(item => item.label === 'EXPRESSION').map((item, idx) => (
                      <div key={`expr-${idx}`} className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <p className="text-lg font-black text-slate-800 tracking-wider uppercase font-mono">
                            {item.label}
                          </p>
                          <span className="text-lg font-black text-blue-600 italic font-mono tracking-tighter">
                            {item.meta ?? 'neutral'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
            </div>

            {/* --- Right Column: Q&A, Details, Feedback --- */}
            <div className="lg:col-span-9 flex flex-col gap-8">
              {/* Question & Answer */}
              <section className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3 px-2">
                    <p className="text-lg font-black text-slate-600 uppercase tracking-widest font-mono">
                      Question #{currentQuestion}
                    </p>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest font-mono">Status</p>
                      <p className="text-xs font-black text-blue-900 tracking-tight font-mono uppercase">
                        {currentAnswerData && (currentAnswerData.content || currentAnswerData.answerText) ? "ANSWERED" : "SKIPPED"}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-900 text-white rounded-[2rem] font-bold leading-snug italic shadow-xl text-lg min-h-[80px] flex items-center justify-center text-center">
                    "{currentQuestionText}"
                  </div>
                </div>

                <div>
                  <p className="text-center text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest font-mono">Your Answer</p>
                  <div className="p-6 bg-slate-50/90 border border-slate-200 rounded-[2rem] text-2xl font-medium leading-loose text-slate-800 min-h-[120px] flex items-center justify-center text-center whitespace-pre-wrap shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4),0_10px_30px_rgba(15,23,42,0.08)]">
                    {currentAnswerText}
                  </div>
                </div>
              </section>

              <div className="border-b-2 border-slate-100" />

              {/* Analysis Grid: Detailed Scores + Feedback */}
              <div>
                {/* Feedback */}
                <section className="w-full p-12 bg-blue-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col min-h-[400px]">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
                  <div className="flex items-start justify-between gap-6 mb-12">
                    <h4 className="text-3xl font-black italic underline decoration-blue-400 underline-offset-8 uppercase">AI Feedback</h4>
                    {currentTurn?.questionId && (
                      <button
                        onClick={() => navigate(`/study/post/${currentTurn.questionId}`)}
                        className="group inline-flex items-center gap-2 px-1 py-1 text-sm md:text-base font-black tracking-tight text-white/90 hover:text-white transition-colors border-b-2 border-white/30 hover:border-white/70 whitespace-nowrap"
                      >
                        <span className="text-white/60 group-hover:text-white transition-colors">모범 답안 보기</span>
                        <span className="text-white/50 group-hover:text-white transition-colors">→</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-10 text-sm leading-relaxed font-medium">
                <div className="space-y-4">
                  <p className="text-blue-300 text-xl font-black mb-2 uppercase tracking-widest opacity-70">Evaluation</p>
                  <p className="opacity-90 font-bold leading-loose text-xl">{result.strengths}</p>
                </div>
                <div className="space-y-4">
                  <p className="text-blue-300 text-xl font-black mb-2 uppercase tracking-widest opacity-70">Improvement</p>
                  <p className="opacity-90 font-bold leading-loose text-xl">{result.improvements}</p>
                </div>
              </div>
            </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SaveReportModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onSave={handleSaveTitleAndReport}
        isSaving={isSaving}
      />
    </div>
  );
};

export default InterviewReport;
