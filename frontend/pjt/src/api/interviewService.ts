import axiosInstance from './axiosInstance';
import type { GlobalApiResponse } from '../types/api/common';
import type {
  InterviewCreateRequest,
  InterviewCreateResponse,
  NextQuestionResponse,
  UploadResponse,
  AnalyzeAudioResponse,
  AnalyzeVideoResponse,
  InterviewTurnsResponse,
  ReportResponse,
  AnalysisJobResponse,
  InterviewResultResponse,
  QuestionListResponse,
  QuestionDetailResponse,
  InterviewListResponse,
  // ...existing code...
} from './interview';

// 10.1 Streak (연속 면접 일수)
export type StreakResponse = {
  currentStreak: number;
  streakDates: string[]; // YYYY-MM-DD
  streakDateCounts?: { date: string; count: number }[];
}

// 10.2 Daily Category Averages
export interface DailyCategoryAverage {
  categoryId: number | null;
  categoryName: string;
  sessions: {
    interviewId: number;
    avgScore: number;
    turnCount: number;
  }[];
}

export interface DailyCategoryAveragesItem {
  date: string;
  categories: DailyCategoryAverage[];
}

export interface DailyCategoryAveragesResponse {
  daily: DailyCategoryAveragesItem[];
}

/**
 * Axios 인터셉터가 GlobalApiResponse를 반환하므로, 각 서비스 함수는 이 응답에서 '.data'를 추출하여 실제 데이터를 반환해야 합니다.
 */
export const interviewService = {
  // 2.1 Create Interview
  createInterview: async (data: InterviewCreateRequest): Promise<InterviewCreateResponse> => {
    const response = await axiosInstance.post<GlobalApiResponse<InterviewCreateResponse>>('/api/interviews', data);
    return response.data;
  },

  // 2.2 Next Question
  getNextQuestion: async (interviewId: number): Promise<NextQuestionResponse> => {
    const response = await axiosInstance.post<GlobalApiResponse<NextQuestionResponse>>(`/api/interviews/${interviewId}/next-question`, {});
    return response.data;
  },

  // 2.3 Upload Audio
  uploadAudio: async (interviewId: number, turnId: number, audioFile: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    const response = await axiosInstance.post<GlobalApiResponse<UploadResponse>>(
      `/api/interviews/${interviewId}/turns/${turnId}/upload-audio`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // 2.4 Upload Video
  uploadVideo: async (interviewId: number, turnId: number, videoFile: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('videoFile', videoFile);
    const response = await axiosInstance.post<GlobalApiResponse<UploadResponse>>(
      `/api/interviews/${interviewId}/turns/${turnId}/upload-video`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // 2.5 Analyze Audio (Sync)
  analyzeAudio: async (interviewId: number, turnId: number): Promise<AnalyzeAudioResponse> => {
    const response = await axiosInstance.post<GlobalApiResponse<AnalyzeAudioResponse>>(`/api/interviews/${interviewId}/turns/${turnId}/analyze-audio`);
    return response.data;
  },

  // 2.6 Analyze Video (Async)
  analyzeVideo: async (interviewId: number, turnId: number, mediapipeData: any): Promise<AnalyzeVideoResponse> => {
    const response = await axiosInstance.post<GlobalApiResponse<AnalyzeVideoResponse>>(
      `/api/interviews/${interviewId}/turns/${turnId}/video-analysis`,
      mediapipeData // Spec: "MediaPipe 분석 결과 JSON을 업로드"
    );
    return response.data;
  },
  
  // 2.7 Get Video Analysis Result
  getVideoAnalysis: async (interviewId: number, turnId: number): Promise<any> => {
    const response = await axiosInstance.get(`/api/interviews/${interviewId}/turns/${turnId}/video-analysis`);
    return response.data;
  },


  // 3.1 Get Turns
  getInterviewTurns: async (interviewId: number): Promise<InterviewTurnsResponse> => {
    const response = await axiosInstance.get<GlobalApiResponse<InterviewTurnsResponse>>(`/api/interviews/${interviewId}/turns`);
    return response.data;
  },

  // 4.1 Generate Report
  generateReport: async (interviewId: number, title?: string): Promise<ReportResponse> => {
    const payload = title ? { title } : {};
    const response = await axiosInstance.post<GlobalApiResponse<ReportResponse>>(
      `/api/interviews/${interviewId}/report/generate`,
      payload,
    );
    return response.data;
  },

  // 4.1 Get Interview List
  getInterviews: async (): Promise<InterviewListResponse> => {
    const response = await axiosInstance.get<GlobalApiResponse<InterviewListResponse>>('/api/interviews');
    return response.data;
  },

  // 4.2 Get Report
  getReport: async (interviewId: number): Promise<ReportResponse> => {
    const response = await axiosInstance.get<GlobalApiResponse<ReportResponse>>(`/api/interviews/${interviewId}/report`);
    return response.data;
  },

  // 5.1 Get Job Status
  getAnalysisJob: async (jobId: number): Promise<AnalysisJobResponse> => {
    const response = await axiosInstance.get<GlobalApiResponse<AnalysisJobResponse>>(`/api/analysis-jobs/${jobId}`);
    return response.data;
  },

  // 4.3 Interview Result
  getInterviewResult: async (interviewId: number): Promise<InterviewResultResponse> => {
    const response = await axiosInstance.get<GlobalApiResponse<InterviewResultResponse>>(`/api/interviews/${interviewId}/result`);
    return response.data;
  },

    // 6.1 인터뷰 소프트 딜리트
    /**
     * 인터뷰를 소프트 딜리트합니다. (목록/조회에서 제외)
     * @param interviewId 인터뷰 ID
     * @returns 삭제 성공 여부
     */
    deleteInterview: async (interviewId: number): Promise<void> => {
      await axiosInstance.delete(`/api/interviews/${interviewId}`);
    },
  // 7.1 Get Question List (Learning)
  getQuestions: async (params?: { categoryId?: number; page?: number; size?: number }): Promise<QuestionListResponse> => {
    const response = await axiosInstance.get<QuestionListResponse>('/learning/questions', { params });
    return response; // axiosInstance response interceptor already returns response.data
  },

  // 7.2 Get Question Detail (Learning)
  getQuestionDetail: async (questionId: number): Promise<QuestionDetailResponse> => {
    const response = await axiosInstance.get<QuestionDetailResponse>(`/learning/questions/${questionId}`);
    return response; // Not wrapped in GlobalApiResponse
  },

  // 7.3 Scrap (save) a question
  addQuestionScrap: async (questionId: number): Promise<void> => {
    // POST /learning/questions/{questionId}/scrap  (Auth required)
    await axiosInstance.post<GlobalApiResponse<null>>(`/learning/questions/${questionId}/scrap`);
  },

  // 7.4 Remove scrap (unsave) a question
  removeQuestionScrap: async (questionId: number): Promise<void> => {
    // DELETE /learning/questions/{questionId}/scrap  (Auth required)
    await axiosInstance.delete(`/learning/questions/${questionId}/scrap`);
  },

  // 7.5 Get scrapped questions (user's saved questions)
  getScrappedQuestions: async (params?: { page?: number; size?: number }) => {
    // GET /learning/questions/scrap (Auth required)
    const response = await axiosInstance.get('/learning/questions/scrap', { params });
    return response; // caller handles response.data vs wrapper
  },

  // 10.1 내 연속 면접 일수(스트릭) 조회
  getStreak: async (): Promise<StreakResponse> => {
    const response = await axiosInstance.get<GlobalApiResponse<StreakResponse>>('/api/interviews/me/streak');
    // axiosInstance의 응답 인터셉터가 이미 response.data(서버 바디)를 반환할 수 있으므로,
    // 서버가 GlobalApiResponse로 래핑해서 반환했는지 여부를 모두 처리합니다.
    // (서버가 { data: {...} } 형태로 반환하면 response.data, 아니면 response 자체가 데이터)
    return (response as any).data ?? response as any;
  },

  // 10.2 날짜별 카테고리 평균 (스터디 로그)
  getDailyCategoryAverages: async (date: string): Promise<DailyCategoryAveragesResponse> => {
    const response = await axiosInstance.get<GlobalApiResponse<DailyCategoryAveragesResponse>>('/api/interviews/me/daily-category-averages', { params: { date } });
    return (response as any).data ?? response as any;
  },
};
