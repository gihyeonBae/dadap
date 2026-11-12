import axiosInstance from '../axiosInstance';
import type { GlobalApiResponse } from '../../types/api/common';
import type { MyPageData } from '../../types/api/mypage';

export interface PortfolioFile {
  fileId: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  fileType: 'RESUME' | 'PORTFOLIO'; // 파일 타입 추가
}

/**
 * 마이페이지 관련 API 서비스
 */
export const mypageService = {
  // 내 정보 조회
  getUserMe: async (): Promise<GlobalApiResponse<any>> => {
    return axiosInstance.get('/users/me');
  },

  // 요약(마이페이지) 정보 조회
  getUserSummary: async (): Promise<GlobalApiResponse<{
    averageSttScore: number | null;
    totalInterviewCount: number;
    currentStreakDays: number;
    scrapCount: number;
  }>> => {
    return axiosInstance.get('/users/me/summary');
  },

  // 마이페이지 전체 데이터 조회
  getMyPageData: async (): Promise<GlobalApiResponse<MyPageData>> => {
    // 실제 API 부재로 인한 Mock 데이터 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          message: "OK",
          data: {
            stats: {
              successRate: "92%",
              mockCount: 24,
              streak: 12,
              savedCount: 156,
            },
            aiLogs: [
              { id: 1, title: "AI Interview Log", description: "Deep-learning based behavioral analysis data.", path: "/mypage/ai-log", createdAt: "2026.01.25" }
            ],
            csLogs: [
              { id: 2, title: "CS Knowledge Log", description: "Hierarchical retrieval performance records.", path: "/mypage/cs-log", createdAt: "2026.01.24" }
            ]
          }
        });
      }, 500);
    });
  },

  // 포트폴리오 파일 목록 조회
  getPortfolioFiles: async (): Promise<GlobalApiResponse<PortfolioFile[]>> => {
    // Mock 데이터 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          message: "OK",
          data: [
            { fileId: 1, fileName: "2026_상반기_자기소개서_최종.pdf", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedAt: "2026-01-10", fileType: 'RESUME' },
            { fileId: 2, fileName: "FE_개발자_포트폴리오_v2.pdf", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedAt: "2026-01-15", fileType: 'PORTFOLIO' },
            { fileId: 3, fileName: "경력기술서_백엔드.pdf", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedAt: "2026-01-20", fileType: 'RESUME' },
          ]
        });
      }, 500);
    });
  },

  // 포트폴리오 파일 업로드 (Multipart/form-data)
  uploadPortfolioFile: async (file: File, type: 'RESUME' | 'PORTFOLIO'): Promise<GlobalApiResponse<PortfolioFile>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    // 실제 연동 시:
    // const response = await axiosInstance.post('/users/me/portfolio', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
    // return response.data;

    // Mock 응답
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          message: "파일이 성공적으로 업로드되었습니다.",
          data: {
            fileId: Date.now(),
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString().split('T')[0],
            fileType: type
          }
        });
      }, 1000);
    });
  },

  // 프로필 이미지 업로드
  uploadProfileImage: async (file: File): Promise<GlobalApiResponse<{ profileImageUrl: string; updatedAt: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/users/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 프로필 이미지 삭제
  deleteProfileImage: async (): Promise<GlobalApiResponse<{ profileImageUrl: null; updatedAt: string }>> => {
    return axiosInstance.delete('/users/me/profile-image');
  },

  // 닉네임 중복 체크 (마이페이지)
  checkNicknameAvailability: async (nickname: string): Promise<GlobalApiResponse<{ available: boolean }>> => {
    return axiosInstance.get('/users/me/nickname-available', {
      params: { nickname }
    });
  },

  // 프로필 정보 업데이트 (닉네임, 직무, 소개)
  updateProfile: async (data: { nickname?: string; jobTitle?: string; bio?: string }): Promise<GlobalApiResponse<any>> => {
    return axiosInstance.patch('/users/me', data);
  },

  // 비밀번호 변경
  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<GlobalApiResponse<{ success: boolean }>> => {
    return axiosInstance.patch('/users/me/password', data);
  }
};
