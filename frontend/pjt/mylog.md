# 작업 기록

- 2026-01-28: 작업 시작
- 2026-01-28: 면접 환경 체크 → 인터뷰 생성 흐름 설계 계획 중
- 2026-01-28: `/api/interviews` 호출 위치 확인, EnvironmentCheck에서 시작 버튼 연동 내용 기록
- 2026-01-28: 화면에서 장비 체크 성공 시 `handleStartInterview` 호출, `interviewService.createInterview`로 POST /api/interviews 요청 후 `interviewId`를 Redux에 저장하는 흐름 점검 및 로그 기록 강화 안내
- 2026-01-28: PracticeMode의 `ActionButton`은 `currentQuestion`이 없으면 disabled 처리되고, 페이지 초기에 질문 로딩 실패/`interviewId` 누락이면 버튼이 눌리지 않는다는 상태도 함께 기록
- 2026-01-28: PracticeMode 첫 질문 요청/녹화 시작 로직에 `console.log` 추가하여 `/next-question` 응답/버튼 비활성화/stream/turnId 부족과 같은 조건을 자세히 추적할 수 있도록 함
- 2026-01-28: EnvironmentCheck face 감지 캔버스에서 프레임마다 `getContext('2d', { willReadFrequently: true })`를 호출해 리사이즈로 초기화된 컨텍스트에도 옵션을 묶어줌으로써 Canvas2D 경고를 제거하도록 처리
- 2026-01-28: PracticeMode side effect 추가하여 `modelsLoaded`, `stream`, `currentQuestion`, `isFetchingQuestion`, `isUploading`, `isAnalyzing`, `isRecording` 상태를 1초마다 로그해 버튼 조건을 지속 추적할 수 있도록 설정
- 2026-01-28: PracticeMode 답변 시작 버튼에 `onMouseEnter` 로그 추가하여 Hover 시점에 버튼 활성 조건(모델, 스트림, 질문, 플래그)을 출력하게 함
- 2026-01-28: PracticeMode/RealMode audioLevel 루프를 100ms로 스로틀하고 `setAudioLevel` 호출을 유지하여 클릭 방해하는 60fps 렌더링을 제거함
- 2026-01-28: EnvironmentCheck에 `CATEGORY_TO_ID` 매핑 추가, navigation state에서 카테고리 문자열→숫자 ID 변환하여 `createInterview`에 정확한 `categoryId` 전달하도록 처리함
- 2026-01-28: EnvironmentCheck 카테고리 ID 매핑을 최신 DB 값(프론트엔드=5, 백엔드=6)으로 수정하여 실전 모드/연습 모드 구분 없이 올바른 카테고리 전송 보장함
- 2026-01-28: RealMode에서 analyseAudio 결과 중 `finished=true` 여부를 받아야 종료하도록 조건을 더 엄격히 해서 마지막 질문 답변+분석이 완전히 끝나야 인터뷰가 종료되게 조정함
