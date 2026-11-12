import axiosInstance from '../axiosInstance';
import type { GlobalApiResponse } from '../../types/api/common';
import type { LoginRequest, LoginResponse, SignupRequest } from '../../types/api/auth';

/**
 * 인증 관련 API 서비스입니다.
 */
export const authService = {
  // 회원가입
  signup: (data: SignupRequest) => 
    axiosInstance.post<any, GlobalApiResponse<null>>('/auth/signup', data),

  // 로그인
  login: (data: LoginRequest) => 
    axiosInstance.post<any, GlobalApiResponse<LoginResponse>>('/auth/login', data),

  // 토큰 재발급
  reissue: () => 
    axiosInstance.post<any, GlobalApiResponse<null>>('/auth/reissue'),

  // 로그아웃
  logout: () => 
    axiosInstance.post<any, GlobalApiResponse<null>>('/auth/logout'),

  // 비밀번호 초기화 요청
  requestPasswordReset: (email: string) => 
    axiosInstance.post<any, GlobalApiResponse<null>>('/auth/password/reset', { email }),

  // 비밀번호 초기화 확인 (임시 비밀번호 발송)
  confirmPasswordReset: (email: string, code: string) => 
    axiosInstance.post<any, GlobalApiResponse<null>>('/auth/password/reset-confirm', { email, code }),

  // 소셜 로그인 (Github)
  githubLogin: (code: string) => 
    axiosInstance.post<any, GlobalApiResponse<LoginResponse>>('/auth/github/doLogin', { code }),

  // 소셜 로그인 (Google)
  googleLogin: (code: string) => 
    axiosInstance.post<any, GlobalApiResponse<LoginResponse>>('/auth/google/doLogin', { code }),
};
