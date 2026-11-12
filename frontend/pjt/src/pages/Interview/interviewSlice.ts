import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// 질문 객체의 타입 정의 (API 응답과 프론트엔드 사용을 고려)
interface Question {
  id: number;
  text: string;
  turnId: number; // 백엔드 turnId와 매핑
  keywords: string[];
  hint: string;
}

// 답변 객체의 타입 정의
interface Answer {
  questionId: number; // 프론트엔드 질문 인덱스
  content: string;
  duration: number;
  videoUrl?: string; // 로컬 Blob URL
  answerText?: string; // 백엔드에서 받은 답변 텍스트
  videoKey?: string; // 서버에 저장된 영상 키 (Presigned URL)
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

// 인터뷰 상태의 타입 정의
interface InterviewState {
  interviewId: number | null;
  questions: Question[];
  currentIndex: number;
  answers: Answer[];
  analysisResult: AnalysisResult | null;
  isInterviewFinished: boolean;
}

const initialState: InterviewState = {
  interviewId: null,
  questions: [], // 초기에는 비어있음
  currentIndex: 0,
  answers: [],
  analysisResult: null,
  isInterviewFinished: false,
};

export const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setInterviewId: (state, action: PayloadAction<number>) => {
      state.interviewId = action.payload;
    },
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    nextQuestion: (state) => {
      state.currentIndex += 1;
    },
    saveAnswer: (state, action: PayloadAction<Answer>) => {
      state.answers.push(action.payload);
    },
    finishInterview: (state) => {
      state.isInterviewFinished = true;
    },
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },
    addQuestion: (state, action: PayloadAction<Question>) => {
      console.log('[Redux] new question added:', action.payload);
      state.questions.push(action.payload);
    },
  },
});

export const { setInterviewId, setQuestions, nextQuestion, saveAnswer, finishInterview, setCurrentIndex, addQuestion } = interviewSlice.actions;

export const selectInterviewState = (state: RootState) => state.interview;

export default interviewSlice.reducer;