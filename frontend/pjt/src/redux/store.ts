import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import interviewReducer from './slices/interviewSlice';
// ★ 1. studyReducer 임포트 (새로 만든 파일)
import studyReducer from './slices/studySlice';

// Redux 스토어 설정s
export const store = configureStore({
  // combineReducers를 직접 호출할 필요 없이, reducer 객체에 슬라이스 리듀서를 전달합니다.
  reducer: {
    auth: authReducer,           // 인증 관련
    interview: interviewReducer, // 면접 관련
    study: studyReducer,         // ★ 2. 스터디 관련 리듀서 등록
  },
  // 미들웨어, 개발 도구 등 추가 설정이 필요할 경우 여기에 추가합니다.
});

// RootState 타입 정의: 스토어의 전체 상태 타입을 나타냅니다.
// useSelector 사용 시 이 타입을 참조합니다.
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch 타입 정의: 스토어의 dispatch 함수 타입을 나타냅니다.
// useDispatch 사용 시 이 타입을 참조합니다.
export type AppDispatch = typeof store.dispatch;
