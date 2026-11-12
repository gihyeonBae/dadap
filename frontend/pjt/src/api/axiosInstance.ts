import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 개발 환경에서 VITE_API_BASE_URL이 비어있으면 경고 로그 남김
if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('[axiosInstance] VITE_API_BASE_URL is not set. API requests will go to the dev server origin (e.g., http://localhost:5173).\nPlease set VITE_API_BASE_URL in your .env (e.g., VITE_API_BASE_URL=http://localhost:8080)');
}

// 요청 인터셉터: 로컬 스토리지의 토큰 자동 주입
axiosInstance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      try {
        console.debug('[axios] request:', { url: config.url, method: config.method, params: config.params, data: config.data });
      } catch (e) {}
    }
    const token = localStorage.getItem('accessToken');
    // VITE_API_KEY 환경변수에 설정된 경우 모든 요청에 x-api-key 헤더로 추가
    const apiKey = import.meta.env.VITE_API_KEY;
    const isAuthRoute = config.url?.startsWith('/auth/');

    // Only attach the token if it exists and the request is not for a public auth route
    if (config.headers && !isAuthRoute) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (apiKey) {
        // API key 헤더 이름은 서버와 합의된 명칭(x-api-key) 사용
        config.headers['x-api-key'] = apiKey;
      }
    }

    // If the request body is FormData, remove forced Content-Type so browser can set boundary
    try {
      if ((config as any).data instanceof FormData && config.headers) {
        delete (config.headers as any)['Content-Type'];
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 데이터 추출 및 공통 에러 처리
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      try {
        console.debug('[axios] response:', response);
      } catch (e) {}
    }
    // 백엔드 응답의 data 필드(실제 데이터)만 반환
    return response.data;
  },
  async (error) => {
    // 여기서 추후 401 에러(토큰 만료) 발생 시 갱신 로직을 추가할 수 있습니다.
    return Promise.reject(error);
  }
);

export default axiosInstance;
