import type { GlobalApiResponse } from './common';

// 2.1 Interview Creation
export interface InterviewCreateRequest {
  interviewType: 'CS' | 'PORTFOLIO';
  runMode: 'PRACTICE' | 'REAL';
  categoryId?: number;
  portfolioId?: number;
  targetQuestionCount: number;
  optionJson?: string;
}

export interface InterviewCreateResponse {
  interviewId: number;
}

// 2.2 Next Question
export interface NextQuestionResponse {
  interviewId: number;
  turnId: number | null;
  turnIndex: number;
  questionText: string | null;
  followUp: boolean;
  parentTurnId: number | null;
}

// 2.3 & 2.4 Upload
export interface UploadResponse {
  interviewId: number;
  turnId: number;
  turnIndex: number;
  mediaType: 'AUDIO' | 'VIDEO';
  key: string;
  size: number;
  contentType: string;
}

// 2.5 Analyze Audio
export interface NextTurnInfo {
  interviewId: number;
  turnId: number;
  turnIndex: number;
  questionText: string;
  followUp: boolean;
  parentTurnId: number;
}

export interface AnalyzeAudioResponse {
  finished: boolean;
  interviewId: number;
  turnId: number;
  turnIndex: number;
  questionText: string;
  answerText: string | null;
  feedbackText: string | null;
  followUpTurn: boolean;
  nextTurn: NextTurnInfo | null;
}

// 2.6 Analyze Video
export interface AnalyzeVideoResponse {
  interviewId: number;
  turnId: number;
  jobId: number;
  status: string;
}

// 3.1 Get Turns
export interface TurnItem {
  turnId: number;
  turnIndex: number;
  followUp: boolean;
  parentTurnId: number | null;
  questionText: string;
  answerText: string | null;
  feedbackText: string | null;
  sttScore: number | null;
  analysisStatus: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  audioKey: string | null;
  videoKey: string | null;
}

export interface InterviewTurnsResponse {
  interviewId: number;
  status: 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  targetQuestionCount: number;
  askedCount: number;
  turns: TurnItem[];
}

// 4.1 Interview List
export interface InterviewListItem {
  interviewId: number;
  title: string | null;
  interviewType: 'CS' | 'PORTFOLIO';
  runMode: 'PRACTICE' | 'REAL';
  status: 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  targetQuestionCount: number;
  askedCount: number;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
}

export interface InterviewListResponse {
  interviews: InterviewListItem[];
}

// 4.1 & 4.2 Report
export interface ReportResponse {
  interviewId: number;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  totalScore: number;
  totalFeedback: string;
  summaryJson: string | null;
  fullVideoKey: string | null;
  fullAudioKey: string | null;
}

// 5.1 Analysis Job
export interface AnalysisJobResponse {
  jobId: number;
  type: string;
  status: string;
  resultJson: string | null;
  score: number | null;
  errorMessage: string | null;
}

export interface InterviewResultResponse {
  interviewId: number;
  status: 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  overallScore?: number;
  totalScore?: number;
  eyeContactScore?: number;
  voiceStabilityScore?: number;
  logicScore?: number;
  expressionScore?: number;
  strengths?: string;
  improvements?: string;
  totalFeedback?: string;
  turns?: TurnItem[];
}

// 7.1 & 7.2 Learning (Questions)
// Note: Learning API responses are NOT wrapped in GlobalApiResponse per spec
export interface QuestionItem {
  questionId: number;
  title: string;
  difficulty: number;
  parentId: number | null;
  categoryId?: number;
}

export interface QuestionListResponse {
  items: QuestionItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface QuestionDetailResponse {
  questionId: number;
  difficulty: number;
  parentId: number | null;
  content: string;
  modelAnswer: string;
  followUpQuestions?: {
    questionId: number;
    content: string;
    modelAnswer: string;
  }[];
}