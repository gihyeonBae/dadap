# 개발 로그 - API 명세 정합성 수정

**작업 일시:** 2026-01-27
**작업자:** Gemini Code Assist
**참고 문서:** `명세서.md` (Section 3, 5)

## 1. 개요
제공된 백엔드 API 명세서(`명세서.md`)를 기준으로 프론트엔드 코드의 API 호출부에서 발견된 불일치 사항과 잠재적 오류를 수정했습니다.

## 2. 수정 사항

### 2.1 인터뷰 생성 (EnvironmentCheck.tsx)
- **문제점:** `POST /api/interviews` 호출 시 필수 필드인 `optionJson`이 누락되어 있었습니다.
- **수정:** 요청 본문에 `optionJson: "{}"`를 추가하여 명세를 준수하도록 수정했습니다.

### 2.2 실전 모드 영상 처리 (RealMode.tsx)
- **문제점 1 (업로드):** 명세서에 존재하지 않는 청크 업로드(Chunked Upload) 로직이 구현되어 있어, 명세서에 정의된 표준 업로드 방식(`POST .../upload-video`)과 충돌할 가능성이 있었습니다.
- **수정 1:** 청크 업로드 로직을 비활성화하고, 명세서 3.4항에 따른 단일 파일 업로드 방식을 강제했습니다.
- **문제점 2 (분석 요청):** 영상 분석 요청(`POST .../video-analysis`) 시 명세서는 "MediaPipe 분석 결과 JSON 업로드"를 요구하지만, 데이터 전송이 누락되어 있었습니다.
- **수정 2:** `face-api.js`를 통해 수집된 표정 데이터(`expressionHistoryRef`)를 분석 요청의 바디로 함께 전송하도록 수정했습니다.

### 2.3 리포트 생성 (InterviewReport.tsx)
- **문제점:** `POST /api/interviews/{interviewId}/report/generate` 호출 시 명세서에 정의되지 않은 `title` 필드를 전송하고 있었습니다.
- **수정:** `generateReport` 함수 호출 시 불필요한 인자(`{ title }`)를 제거하여 명세서 5.1항을 준수하도록 했습니다.

## 3. 향후 점검 사항
- **영상 분석 데이터 포맷:** 현재 `face-api.js`의 결과를 전송하고 있으나, 백엔드가 정확히 "MediaPipe" 포맷만을 요구하는지 확인이 필요합니다. (현재는 가용한 데이터를 전송하는 것으로 조치)
- **대용량 업로드:** 명세서에는 대용량 파일 처리에 대한 언급이 없으므로, 5MB 이상의 영상 업로드 시 타임아웃이나 용량 제한 이슈가 발생할 수 있습니다. 추후 백엔드 팀과 협의가 필요합니다.

---

## 4. 변경 파일 목록
- `src/pages/Interview/EnvironmentCheck.tsx`
- `src/pages/Interview/RealMode.tsx`
- `src/pages/Interview/InterviewReport.tsx`

---
**Status:** Completed