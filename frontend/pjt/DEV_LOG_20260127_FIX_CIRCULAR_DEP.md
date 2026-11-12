# 개발 로그 - Redux Slice 순환 참조 수정

**작업 일시:** 2026-01-27
**작업자:** Gemini Code Assist
**이슈:** `Uncaught SyntaxError: The requested module ... does not provide an export named 'saveAnswer'`

## 1. 문제 분석
- `RealMode.tsx`에서 `interviewSlice.ts`의 `saveAnswer` 액션을 import 하려다 실패함.
- 소스 코드상에는 `saveAnswer`가 명확히 export 되고 있음.
- `interviewSlice.ts`가 `store.ts`의 `RootState` 타입을 import 하고, `store.ts`가 다시 `interviewSlice`의 리듀서를 import 하는 **순환 참조(Circular Dependency)**가 발생했을 가능성이 높음.
- Vite/Rollup 환경에서 순환 참조 발생 시, 모듈이 완전히 평가되기 전에 참조되어 export 객체가 비어있거나 누락되는 현상이 발생할 수 있음.

## 2. 해결 방안
- `interviewSlice.ts`에서 `store.ts`에 대한 의존성을 제거.
- `RootState` 타입 import를 주석 처리하고, Selector 함수들의 state 타입을 `any`로 임시 변경하여 순환 고리를 끊음.
- (추후 `RootState` 타입을 별도 파일로 분리하거나 `types.ts`를 통해 관리하는 것이 권장됨)

## 3. 변경 파일
- `src/redux/slices/interviewSlice.ts`

---
**Status:** Fixed