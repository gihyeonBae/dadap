import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// import type { RootState } from '../store'; // Circular dependency avoidance

// 질문 객체의 타입 정의 (API 응답과 프론트엔드 사용을 고려)
export interface InterviewQuestion {
  id: number;
  // ★ API 명세에 따라 turnId는 Long 타입이므로 number로 변경
  // turnId: Long;
  text: string;
  turnId: number; // 백엔드 turnId와 매핑
  keywords: string[];
  hint: string;
}

// 답변 객체의 타입 정의
interface Answer {
  questionId: number; // 프론트엔드 질문 인덱스
  turnId: number; // 백엔드 turnId와 매핑
  content: string;
  duration: number;
  videoUrl?: string; // 로컬 Blob URL
  answerText?: string; // 백엔드에서 받은 답변 텍스트
  feedbackText?: string; // 백엔드에서 받은 피드백 텍스트
  videoKey?: string; // 서버에 저장된 영상 키 (Presigned URL)
  sttScore?: number; // STT 점수
  videoAnalyses?: any[]; // 영상 분석 결과 리스트
}

// 분석 결과 타입 정의 (백엔드 API 응답과 매핑)
interface AnalysisResult {
  overallScore?: number;
  totalScore?: number; // 백엔드 totalScore
  eyeContactScore: number;
  voiceStabilityScore: number;
  logicScore: number;
  expressionScore: number;
  strengths?: string;
  totalFeedback?: string; // 백엔드 totalFeedback
  improvements?: string;
}

// 장비 체크 상태 타입 정의
export type CheckStatus = 'pending' | 'loading' | 'success' | 'error';

// 인터뷰 상태의 타입 정의
interface InterviewState {
  interviewId: number | null;
  // ★ 장비 체크 상태 추가
  deviceStatus: {
    webcam: CheckStatus;
    mic: CheckStatus;
    face: CheckStatus;
    voice: CheckStatus;
  };
  isReady: boolean;
  questions: InterviewQuestion[];
  currentIndex: number;
  answers: Answer[];
  analysisResult: AnalysisResult | null;
  isInterviewFinished: boolean;
  runMode: 'PRACTICE' | 'REAL' | null;
  targetQuestionCount: number;
}

const initialState: InterviewState = {
  interviewId: null,
  // ★ 장비 체크 초기 상태 설정
  deviceStatus: {
    webcam: 'loading',
    mic: 'loading',
    face: 'loading',
    voice: 'loading',
  },
  isReady: false,
  questions: [], // 초기에는 비어있음
  currentIndex: 0,
  answers: [],
  analysisResult: null,
  isInterviewFinished: false,
  runMode: null,
  targetQuestionCount: 5, // 기본 목표 질문 개수
};

export const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    // ★ 장비 체크 리듀서 추가
    updateDeviceStatus: (state, action: PayloadAction<Partial<InterviewState['deviceStatus']>>) => {
      // console.log('[Redux] Updating device status:', action.payload);
      state.deviceStatus = { ...state.deviceStatus, ...action.payload };
      state.isReady = Object.values(state.deviceStatus).every((s) => s === 'success');
    },
    resetDeviceCheck: (state) => {
      // console.log('[Redux] Resetting device check status.');
      state.deviceStatus = initialState.deviceStatus;
      state.isReady = false;
    },
    setInterviewId: (state, action: PayloadAction<number>) => {
      console.log(`[Redux] Setting interviewId: ${action.payload}`);
      state.interviewId = action.payload;
    },
    setInterviewConfig: (state, action: PayloadAction<{ targetQuestionCount: number; runMode: 'PRACTICE' | 'REAL' }>) => {
      console.log(`[Redux] Setting interview config:`, action.payload);
      state.targetQuestionCount = action.payload.targetQuestionCount;
      state.runMode = action.payload.runMode;
    },
    setQuestions: (state, action: PayloadAction<InterviewQuestion[]>) => {
      console.log(`[Redux] Setting ${action.payload.length} questions.`);
      state.questions = action.payload;
    },
    nextQuestion: (state) => {
      console.log(`[Redux] Moving to next question. Current index: ${state.currentIndex}, Next index: ${state.currentIndex + 1}`);
      state.currentIndex += 1;
    },
    saveAnswer: (state, action: PayloadAction<Answer>) => {
      console.log(`[Redux] Saving answer for question index: ${action.payload.questionId}`);
      state.answers.push(action.payload);
    },
    finishInterview: (state) => {
      console.log('[Redux] Finishing interview.');
      state.isInterviewFinished = true;
    },
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      console.log(`[Redux] Setting current index to: ${action.payload}`);
      state.currentIndex = action.payload;
    },
    addQuestion: (state, action: PayloadAction<InterviewQuestion>) => {
      console.log('[Redux] new question added:', action.payload);
      state.questions.push(action.payload);
    },
    updateAnswer: (state, action: PayloadAction<Partial<Answer> & { turnId: number }>) => {
      const { turnId, ...updates } = action.payload;
      const answerIndex = state.answers.findIndex(a => a.turnId === turnId);
      if (answerIndex !== -1) {
        state.answers[answerIndex] = { ...state.answers[answerIndex], ...updates };
        console.log(`[Redux] Updated answer for turnId: ${turnId} with`, updates);
      } else {
        console.warn(`[Redux] updateAnswer failed: No answer found for turnId: ${turnId}`);
      }
    },
    // 면접 상태를 초기화하는 리듀서 추가
    // ★ 새로운 면접 시작 전, 장비 체크 상태를 포함한 모든 관련 상태를 초기화합니다.
    resetInterview: (state) => {
      console.log('[Redux] Resetting entire interview state.');
      state.interviewId = initialState.interviewId;
      state.questions = initialState.questions;
      state.currentIndex = initialState.currentIndex;
      state.answers = initialState.answers;
      state.analysisResult = initialState.analysisResult;
      state.isInterviewFinished = initialState.isInterviewFinished;
      // 장비 체크 상태도 함께 초기화하여 완전한 새 시작을 보장합니다.
      state.deviceStatus = initialState.deviceStatus;
      state.isReady = initialState.isReady;
      state.runMode = initialState.runMode;
      state.targetQuestionCount = initialState.targetQuestionCount;
    },
    startNewAnswer: (state, action: PayloadAction<{ turnId: number }>) => {
      const { turnId } = action.payload;
      if (!state.answers.find(a => a.turnId === turnId)) {
        state.answers.push({
          turnId: turnId,
          questionId: state.currentIndex,
          content: '',
          duration: 0,
        });
        console.log(`[Redux] Initialized new answer for turnId: ${turnId}`);
      }
    },
  },
});

export const {
  updateDeviceStatus, resetDeviceCheck, // ★ 추가된 액션
  setInterviewId, setInterviewConfig, setQuestions, nextQuestion, saveAnswer, updateAnswer, finishInterview, setCurrentIndex, addQuestion,
  resetInterview, // ★ 추가된 액션
  startNewAnswer, // ★ 추가된 액션 (PracticeMode 호환성)
} = interviewSlice.actions;

export const selectInterviewState = (state: any) => state.interview;
export const selectDeviceStatus = (state: any) => state.interview.deviceStatus; // ★ 추가된 셀렉터
export const selectIsReady = (state: any) => state.interview.isReady; // ★ 추가된 셀렉터

export default interviewSlice.reducer;