/**
 * 로그인 성공 시 내려오는 데이터 구조입니다.
 */
export interface LoginResponse {
  userId: number;
  email: string;
  nickname: string;
  role: string;
  accessToken: string;
  profileImageUrl: string | null;
  socialType: string | null;
}

/**
 * 회원가입 요청 데이터 구조입니다.
 */
export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

/**
 * 로그인 요청 데이터 구조입니다.
 */
export interface LoginRequest {
  email: string;
  password: string;
}
