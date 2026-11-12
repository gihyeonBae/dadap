# SCREENING.md - 팀원 A 작업 로그

## 1. 개요

이 문서는 팀원 A가 수행한 작업 내용을 상세히 기록하고, 팀원 B와 C가 이어받을 작업을 명확히 안내하기 위해 작성되었습니다.

## 2. 완료된 작업 (팀원 A)

### 2.1. 라우팅 구조 리팩토링 및 보호된 경로(Protected Routes) 구현

-   **작업 내용:**
    -   `pjt/src/App.tsx` 파일에 분산되어 있던 `/mypage` 관련 라우트 정의를 하나로 통합하여 코드의 중복을 제거하고 일관성을 확보했습니다.
    -   로그인한 사용자만 접근할 수 있는 페이지(마이페이지, 인터뷰 관련 페이지 등)를 보호하기 위해 `ProtectedRoute` 컴포넌트를 생성하고 적용했습니다.
-   **변경 이유:**
    -   기존 코드에서는 동일한 `/mypage` 경로가 두 번 정의되어 있어 레이아웃 충돌 및 유지보수의 어려움이 예상되었습니다.
    -   사용자 인증 상태에 따라 페이지 접근 권한을 제어하는 로직은 서비스의 필수적인 보안 요소입니다. `ProtectedRoute`를 통해 이를 중앙에서 관리할 수 있습니다.
-   **변경된 파일:**
    -   `pjt/src/App.tsx`: 라우팅 구조 변경 및 `ProtectedRoute` 적용
    -   `pjt/src/components/Common/ProtectedRoute.tsx`: `ProtectedRoute` 컴포넌트 신규 생성

### 2.2. Redux `authSlice` 활용

-   **작업 내용:**
    -   `ProtectedRoute` 컴포넌트는 Redux 스토어의 `authSlice` 상태(`isLoggedIn`)를 구독하여 현재 사용자 로그인 상태를 확인합니다.
    -   로그인하지 않은 사용자가 보호된 경로에 접근 시, `/login` 페이지로 리디렉션됩니다.
-   **코드 상세:**
    -   `ProtectedRoute.tsx`에서는 `useSelector` 훅을 사용하여 `state.auth.isLoggedIn` 값을 가져옵니다.
    -   `react-router-dom`의 `<Outlet />`과 `<Navigate />` 컴포넌트를 사용하여 조건부 렌더링을 구현했습니다.

## 3. 다음 단계 (To-Do for Team B & C)

팀원 A는 애플리케이션의 핵심 라우팅 및 인증 기반을 마련했습니다. 이제 팀원 B와 C는 각각 담당 기능 개발에 집중할 수 있습니다.

### 👤 **팀원 B (마이페이지 담당) 에게:**

-   **작업 목표:** 마이페이지 관련 기능 전체를 완성합니다.
-   **시작 지점:**
    -   `/mypage` 경로는 이미 `ProtectedRoute`로 보호되고 있으므로, 로그인된 사용자만 접근 가능합니다.
    -   `pjt/src/pages/MyPage/` 하위의 컴포넌트들(`AiInterviewLog`, `MyPortfolio` 등)이 작업 대상입니다.
-   **수행할 작업:**
    1.  **Redux 상태 관리:**
        -   필요하다면 마이페이지 각 섹션(`AI 면접 로그`, `포트폴리오`, `좋아요한 게시글` 등)의 데이터를 관리하기 위한 새로운 Redux 슬라이스(예: `myPageSlice`)를 설계하고 `pjt/src/redux/slices/`에 추가하세요.
        -   기존 `userSlice`와 연계하여 사용자 정보를 가져오는 로직을 구현해야 할 수 있습니다.
    2.  **API 연동:**
        -   각 페이지에 필요한 데이터를 백엔드 API로부터 가져오는 비동기 로직(thunk)을 Redux 슬라이스에 구현하세요.
        -   `pjt/src/api/axiosInstance.ts`를 활용하여 API 요청을 보냅니다.
    3.  **컴포넌트 개발:**
        -   API를 통해 가져온 데이터를 각 컴포넌트에 연결하여 UI를 완성합니다.
        -   `AccountSettings` 페이지에서 사용자 정보 수정 기능을 구현하고, API 요청 및 Redux 상태 업데이트 로직을 연동하세요.

### 👤 **팀원 C (핵심 기능 - 인터뷰/스터디 담당) 에게:**

-   **작업 목표:** '인터뷰 연습'과 'CS 스터디' 핵심 기능 플로우를 완성합니다.
-   **시작 지점:**
    -   `/interview` 관련 경로는 이미 `ProtectedRoute`로 보호되고 있습니다.
    -   `pjt/src/pages/Interview/`, `pjt/src/pages/Study/`, 그리고 면접 시작 전 모달(`pjt/src/components/starter-modals/`)이 주요 작업 대상입니다.
-   **수행할 작업:**
    1.  **Redux 상태 관리 리팩토링/확장:**
        -   기존 `interviewSessionSlice`와 `interviewUISlice`의 구조를 검토하고, 실제 면접 플로우(환경 설정 → 질문/답변 → 결과 저장)에 맞게 상태 로직을 리팩토링하거나 확장하세요.
        -   CS 스터디(`StudyList`, `StudyDetail`) 기능에 필요한 상태(예: 문제 목록, 선택된 카테고리 등)를 관리할 `studySlice`를 `pjt/src/redux/slices/`에 새로 생성하는 것을 권장합니다.
    2.  **API 연동:**
        -   면접 질문을 가져오거나, 면접 결과를 서버에 저장하는 API 연동 로직을 구현하세요.
        -   스터디 문제 목록을 가져오고, 상세 내용을 조회하는 API 연동 로직을 구현하세요.
    3.  **컴포넌트 로직 완성:**
        -   `starter-modals`에서 사용자가 선택한 옵션(예: 면접 유형, 문제 카테고리)을 Redux 상태에 저장하고, 해당 상태에 따라 면접/스터디 페이지로 올바르게 라우팅되도록 로직을 완성하세요.
        -   `RealMode`/`PracticeMode`에서 면접 진행 로직(예: 타이머, 다음 질문으로 넘어가기)을 Redux와 연동하여 구현합니다.

## 4. 트러블슈팅

### 4.1. `RootState` 타입 import 에러

-   **문제 발생:**
    -   `ProtectedRoute` 컴포넌트에서 Redux 스토어의 `RootState` 타입을 import 할 때, "The requested module '/src/redux/store.ts' does not provide an export named 'RootState'"라는 에러가 발생했습니다.
-   **진행 과정:**
    1.  처음에는 `pjt/src/redux/store.ts` 파일의 `export type RootState = ...` 구문이 타입스크립트 모듈 시스템에서 제대로 인식되지 않는 문제로 추측했습니다.
    2.  `export { RootState }` 와 같이 `export` 구문을 변경해보았으나 문제가 해결되지 않았습니다.
    3.  문제의 원인이 Vite와 같은 모던 빌드 툴에서 ES 모듈의 `type-only` import/export를 처리하는 방식과 관련이 있을 수 있다고 판단했습니다.
-   **해결 방안:**
    -   타입스크립트에서 타입을 가져올 때, 값(value)이 아닌 타입(type)임을 명시적으로 알려주는 것이 가장 안전하고 권장되는 방법입니다.
    -   `pjt/src/components/Common/ProtectedRoute.tsx` 파일의 import 구문을 다음과 같이 수정하여 문제를 해결했습니다.
        ```typescript
        // 기존
        import { RootState } from '../../redux/store';
        
        // 변경 후
        import type { RootState } from '../../redux/store';
        ```
-   **결론:**
    -   이슈는 타입스크립트의 타입(type)과 값(value)이 같은 구문으로 import/export 될 때 발생할 수 있는 혼동 때문이었습니다. `import type`을 사용하여 명확하게 타입을 가져오도록 지정함으로써 이 문제를 해결했습니다.

### 4.2. 개발 편의를 위한 인증 기능 임시 비활성화

-   **문제 발생:**
    -   팀원 B가 마이페이지 기능 개발을 시작하려 했으나, 현재 백엔드 서버가 없어 로그인 기능을 사용할 수 없었습니다.
    -   이로 인해 `ProtectedRoute`에 의해 마이페이지 접근이 차단되는 문제가 발생했습니다.
-   **해결 방안:**
    -   개발 기간 동안 일시적으로 모든 사용자가 로그인된 것으로 간주하도록 `authSlice`의 초기 상태를 수정했습니다.
    -   `pjt/src/redux/slices/authSlice.ts` 파일의 `initialState` 객체에서 `isLoggedIn` 값을 `false`에서 `true`로 변경했습니다.
        ```typescript
        // 기존
        const initialState: AuthState = {
          isLoggedIn: false,
          // ...
        };

        // 변경 후
        const initialState: AuthState = {
          isLoggedIn: true, // 임시로 true로 설정
          // ...
        };
        ```
-   **주의사항:**
    -   **이것은 개발을 위한 임시 조치입니다.** 백엔드 연동 및 실제 로그인 기능 구현이 완료되면, 반드시 이 값을 다시 `false`로 되돌려야 합니다. 이 작업은 팀원 A 또는 최종 통합 단계에서 진행할 예정입니다.

## 5. 협업 가이드

-   작업 시작 전, `main` 브랜치에서 최신 변경사항을 pull 받아주세요.
-   각자 `feature/mypage` (팀원 B), `feature/interview-study` (팀원 C) 와 같은 브랜치를 생성하여 작업해주세요.
-   공통으로 사용되는 컴포넌트나 Redux 상태에 변경이 필요할 경우, 서로 논의하여 충돌을 최소화해주세요.
-   작업 완료 후 Pull Request(PR)를 생성하고, 다른 팀원의 코드 리뷰를 거친 후 `main` 브랜치에 머지합니다.

## 26.01.27

### 1. 인터뷰 API 타입 정의 수정 및 구조 개선

#### 변경 사항

-   `interviewService.ts`에서 참조하던 API 응답 타입의 import 경로를 수정했습니다.
-   내용이 비어 있고 사용되지 않는 `pjt/src/types/api/interview.ts` 파일을 삭제하여 프로젝트 구조를 정리했습니다.

#### 상세 내용 및 사유

-   **문제점**: `pjt/src/api/interviewService.ts` 파일은 인터뷰 관련 API 함수들을 모아놓은 서비스 레이어입니다. 이 파일은 각 함수의 요청/응답 타입을 `../../types/api/interview` 경로에서 가져오고 있었습니다. 하지만 실제 프로젝트를 분석한 결과, 해당 `interview.ts` 파일은 비어 있었고, 실제 타입 정의는 `pjt/src/api/interview.ts` 파일 내에 존재했습니다.
-   **원인**: 이전 리팩토링 과정에서 타입 정의 파일의 위치가 변경되었으나, 이를 사용하는 서비스 파일의 import 경로는 수정되지 않은 것으로 추정됩니다. 이로 인해 타입스크립트의 타입 추론이 정상적으로 동작하지 않아 잠재적인 버그 발생 가능성이 있었습니다.
-   **해결**: `interviewService.ts`의 import 경로를 `../../types/api/interview`에서 `./interview`로 바로잡았습니다. 이를 통해 서비스 함수들이 올바른 타입 정의를 참조하게 되어 코드의 안정성과 예측 가능성을 높였습니다. 또한, 더 이상 사용되지 않는 빈 파일(`pjt/src/types/api/interview.ts`)을 삭제하여 프로젝트의 혼란을 줄이고 구조를 명확히 했습니다.

#### 트러블 슈팅

-   **현상**: 사용자의 초기 요청("API_SPECIFICATION를 참고해서 2번 명세서들을 프론트에 적용")을 수행하기 위해 관련 파일(`pjt/src/api/interview.ts`, `pjt/src/api/interviewService.ts`)을 읽으려 했으나, `read_file` 도구에서 "File not found" 에러가 간헐적으로 발생했습니다.
-   **과정**:
    1.  파일 시스템 목록에는 파일이 분명히 존재했기 때문에, 경로 문제나 파일명 오타를 의심했습니다.
    2.  `list_directory` 도구를 사용해 `pjt/src/api` 디렉토리의 파일 목록을 다시 한번 명시적으로 확인하여 파일이 실제로 존재함을 증명했습니다.
    3.  재확인 후 `read_file`을 실행했을 때는 정상적으로 파일 내용을 읽어올 수 있었습니다. 이는 일시적인 파일 시스템 접근 문제였을 가능성이 있습니다.
-   **결론**: 파일 읽기 실패 후, 다른 도구(`list_directory`)를 통해 파일 존재 여부를 교차 검증하는 절차가 문제 해결에 유효했습니다.

#### 코드 변경

**파일**: `pjt/src/api/interviewService.ts`

```diff
- import type {
-   InterviewCreateRequest,
-   InterviewCreateResponse,
-   NextQuestionResponse,
-   UploadResponse,
-   AnalyzeAudioResponse,
-   AnalyzeVideoResponse,
-   InterviewTurnsResponse,
-   ReportResponse,
-   AnalysisJobResponse,
-   QuestionListResponse,
-   QuestionDetailResponse,
- } from '../../types/api/interview';
+ import type {
+   InterviewCreateRequest,
+   InterviewCreateResponse,
+   NextQuestionResponse,
+   UploadResponse,
+   AnalyzeAudioResponse,
+   AnalyzeVideoResponse,
+   InterviewTurnsResponse,
+   ReportResponse,
+   AnalysisJobResponse,
+   QuestionListResponse,
+   QuestionDetailResponse,
+ } from './interview';

```

#### 파일 삭제

-   `pjt/src/types/api/interview.ts`

---

### 3. 인터뷰 리포트 유저 정보 반영 및 영상 녹화 기능 구현

#### 변경 사항
-   `InterviewReport` 페이지에서 유저 정보(닉네임), 답변 내용, 점수가 정상적으로 표시되도록 로직을 수정했습니다.
-   **백엔드 API 연동**: `getReport`와 `getInterviewTurns` API를 호출하여 서버의 실제 분석 데이터를 리포트에 바인딩했습니다.
-   `PracticeMode` 및 `RealMode`에 실제 브라우저 `MediaRecorder` API를 이용한 영상 녹화 기능을 구현했습니다.
-   리포트 페이지에서 녹화된 영상을 확인하고 PC에 직접 저장(.webm)할 수 있는 기능을 추가했습니다.
-   **데이터 로딩 상태 구현**: API 호출 중 로딩 스피너를 표시하여 사용자 경험을 개선했습니다.

#### 상세 내용 및 사유
-   **유저 정보 동기화**: Redux 상태(`auth.user`)뿐만 아니라 새로고침 시에도 정보가 유지되도록 `localStorage`를 참조하는 복합 셀렉터 로직을 적용했습니다. 또한 백엔드 명세에 맞춰 `name` 대신 `nickname`을 우선 출력하도록 변경했습니다.
-   **실제 영상 녹화 도입**: 기존에는 영상 UI만 존재하고 실제 데이터가 생성되지 않았습니다. `MediaRecorder`를 통해 답변 시작 시 녹화를 시작하고, 종료 시 `Blob URL`을 생성하여 Redux에 저장하도록 구현했습니다.
-   **데이터 매핑 최적화**: 로컬 상태(0-based index)와 API 응답(1-based index) 간의 차이를 고려하여 답변 데이터를 정확히 찾아오도록 `find` 로직을 개선했습니다.

#### 트러블 슈팅

##### 4.3. 리포트 페이지 유저 정보 및 세션 ID 누락
-   **현상**: 리포트 진입 시 유저 이름이 '게스트'로 표시되거나, 저장 시 '면접 세션 ID를 찾을 수 없습니다'라는 에러가 발생했습니다.
-   **원인**: 
    1. 유저 정보가 `state.auth.user` 외에 `state.user.user` 등 여러 경로에 흩어져 있었고, 새로고침 시 Redux 초기화로 인해 데이터가 유실되었습니다.
    2. `interviewId`가 `interviewSession` 슬라이스에만 존재하여, 다른 경로로 진입 시 참조가 불가능했습니다.
-   **해결**: 
    - `useSelector`에서 여러 상태 경로를 체크하고 최종적으로 `localStorage`를 확인하는 방어적 로직을 작성했습니다.
    - `interviewId`를 `interviewSession`과 `interviewSlice` 양쪽에서 모두 찾을 수 있도록 수정했습니다.

##### 4.4. 영상 녹화 기능 부재 및 "영상 없음" 표시
-   **현상**: 리포트 페이지의 비디오 플레이어에 영상이 나오지 않고 "No Video Recorded" 메시지만 출력되었습니다.
-   **원인**: 면접 모드(`PracticeMode`, `RealMode`)에서 카메라 스트림만 보여줄 뿐, 실제 데이터를 캡처하여 저장하는 `MediaRecorder` 로직이 누락되어 있었습니다.
-   **해결**: 
    - `MediaRecorder` API를 사용하여 `recordedChunks`를 수집하고, 답변 완료 시 `URL.createObjectURL`을 통해 임시 URL을 생성했습니다.
    - 생성된 URL을 Redux의 `answers` 배열에 `videoUrl` 필드로 저장하여 리포트에서 참조할 수 있게 했습니다.

##### 4.5. JSX 문법 오류 (Unexpected Token)
-   **현상**: 빌드 중 `InterviewReport.tsx`에서 `Unexpected token` 에러가 발생하며 페이지가 렌더링되지 않았습니다.
-   **원인**: 이전 코드 수정 과정에서 비디오 태그(`video`)가 정상적으로 닫히지 않았고, 삼항 연산자 내부에 잘못된 구문이 포함되어 있었습니다.
-   **해결**: JSX 구조를 재검토하여 조건부 렌더링(`{condition ? <A/> : <B/>}`)과 태그 닫기 상태를 올바르게 수정했습니다.

##### 4.6. ReferenceError: analysisResult is not defined
-   **현상**: 리포트 페이지 진입 시 화면이 하얗게 변하며 `ReferenceError`가 발생했습니다.
-   **원인**: API 연동 과정에서 변수명을 `finalAnalysis`로 통합했으나, JSX 내부에서 선언되지 않은 기존 변수명(`analysisResult`)을 참조하고 있었습니다.
-   **해결**: 모든 점수 및 피드백 출력 로직을 `finalAnalysis`와 `result` 객체로 통일하여 참조 오류를 해결했습니다.

##### 4.7. 답변 부재 시 하드코딩된 점수 노출 문제
-   **현상**: 답변을 하지 않았음에도 Redux 초기 상태의 Mock 데이터(85점 등)가 리포트에 표시되었습니다.
-   **원인**: API 응답이 오기 전이나 실패했을 때 Redux의 임시 데이터를 Fallback으로 사용하도록 설정되어 있었습니다.
-   **해결**: `finalAnalysis` 계산 시 오직 API 응답(`apiReport`)만 신뢰하도록 수정하고, 데이터가 없을 경우 강제로 0점 처리하여 데이터 신뢰성을 확보했습니다.

#### 코드 변경 요약

**파일**: `pjt/src/pages/Interview/InterviewReport.tsx`
```typescript
// API 연동 및 데이터 통합
const [apiReport, setApiReport] = useState<any>(null);
const finalAnalysis = apiReport; // Mock 데이터 배제

const user = useSelector((state: RootState) => 
  state.auth?.user || (state as any).user?.user
) || JSON.parse(localStorage.getItem('user') || 'null');

const interviewId = useSelector((state: RootState) => state.interviewSession?.interviewId) 
                 || (useSelector(selectInterviewState) as any).interviewId;

// 영상 다운로드 기능
const handleDownload = () => {
  const link = document.createElement('a');
  link.href = currentAnswerData.videoUrl;
  link.download = `Interview_Q${currentQuestion}.webm`;
  link.click();
};
```

**파일**: `pjt/src/pages/Interview/PracticeMode.tsx` / `RealMode.tsx`
```typescript
// MediaRecorder 구현
const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => {
  const url = URL.createObjectURL(new Blob(chunks));
  dispatch(saveAnswer({ ..., videoUrl: url }));
};
```

---

### 4. 인터뷰 리포트 데이터 로딩 방식 개선 (백엔드 우선)

#### 변경 사항
-   `InterviewReport.tsx`에서 Redux의 로컬 데이터와 백엔드 API 데이터를 병합하여 표시하는 방식으로 로직을 개선했습니다.
-   백엔드에 저장된 텍스트/점수 데이터가 있을 경우 이를 우선적으로 표시하고, 아직 서버에 업로드되지 않은 로컬 녹화 영상(`Blob URL`)이 있다면 이를 보강하여 함께 보여줍니다.
-   화면에 '서버 데이터' 또는 '로컬 미리보기' 배지를 표시하여 현재 보고 있는 데이터의 출처를 명확히 했습니다.

#### 상세 내용 및 사유
-   **문제점**: 기존에는 API 응답이 없으면 Redux의 로컬 데이터로 대체(fallback)하는 방식이어서, 저장된 리포트를 조회할 때 이전에 진행했던 다른 면접의 내용(특히 영상)이 잘못 표시될 수 있었습니다. 반대로, 로컬 데이터 대체를 완전히 제거하면 면접 직후 아직 서버에 업로드되지 않은 영상을 볼 수 없는 문제가 있었습니다.
-   **해결**: `useMemo`를 사용하여 데이터 처리 로직을 최적화했습니다.
    1.  백엔드 API로부터 `apiTurns` 데이터를 성공적으로 불러오면, 이를 주 데이터 소스로 사용합니다.
    2.  불러온 `apiTurns`의 각 항목(turn)에 대해, Redux에 저장된 로컬 데이터(`reduxData.answers`)에서 동일한 질문의 `videoUrl`을 찾아 보강(augment)합니다.
    3.  이를 통해, 텍스트와 점수는 항상 서버의 최신 데이터를 따르면서도, 사용자가 방금 녹화한 영상(아직 서버에 없을 수 있는)도 리포트에서 바로 확인할 수 있게 하여 데이터 정합성과 사용자 경험을 모두 개선했습니다.
-   **데이터 출처 시각화**: `dataSource`라는 state를 추가하여 API 호출 성공 여부에 따라 'server' 또는 'local'로 상태를 관리하고, 이를 UI에 배지로 표시하여 사용자가 데이터의 신뢰도를 직관적으로 파악할 수 있도록 했습니다.
-   **기대 효과**:
    -   **데이터 정합성**: 저장된 리포트 조회 시, 다른 면접의 데이터가 섞여 보이는 현상을 방지합니다.
    -   **사용자 경험**: 면접 종료 직후에도 녹화된 영상을 끊김 없이 확인할 수 있습니다.
    -   **영속성**: 서버에서 받아온 `videoKey`(Presigned URL)가 있다면 이를 우선적으로 사용하므로, 새로고침 후에도 영상을 볼 수 있습니다.

#### 코드 변경 요약

**파일**: `pjt/src/pages/Interview/InterviewReport.tsx`
```typescript
const { displayTurns, displayQuestions } = useMemo(() => {
  if (apiTurns.length > 0) {
    const turns = apiTurns.map(apiTurn => {
      const localTurn = reduxData.answers.find((a: any) => a.questionId === (apiTurn.turnIndex - 1));
      return {
        ...apiTurn, // 서버 데이터 (텍스트, 점수 등)
        videoUrl: localTurn?.videoUrl, // 로컬 영상 데이터 보강
      };
    });
    const questions = apiTurns.map((t: any) => ({ text: t.questionText }));
    return { displayTurns: turns, displayQuestions: questions };
  }
  // API 데이터가 없으면 (면접 직후 등) 로컬 데이터 사용
  return { displayTurns: reduxData.answers || [], displayQuestions: reduxData.questions || [] };
}, [apiTurns, reduxData.answers, reduxData.questions]);
```

---

### 5. 향후 계획 (To-Do)

#### 👤 팀원 B (마이페이지)
- [ ] `AiInterviewLog` 컴포넌트에서 `interviewService.getInterviewTurns`를 호출하여 실제 저장된 면접 목록을 불러오는 기능을 구현하세요.
- [ ] 리포트 저장 성공 후 이동되는 경로가 올바른지 확인하고, 목록 갱신 로직을 추가하세요.

#### 👤 팀원 C (인터뷰/스터디)
- [ ] 녹화된 영상의 용량 최적화를 위해 `MediaRecorder`의 비트레이트 옵션을 조정하는 기능을 검토하세요.
- [ ] 실전 모드에서 영상 업로드 API(`uploadVideo`)를 연동하여 서버에도 영상을 저장할지 여부를 결정하고 구현하세요. (현재는 로컬 저장만 지원)

---

## 6. 협업 가이드 (업데이트)

- **영상 데이터 주의**: 현재 영상은 브라우저 메모리(`Blob URL`)에 저장되므로, 페이지를 완전히 새로고침하면 사라집니다. 영구 저장이 필요한 경우 서버 업로드 로직을 활성화해야 합니다.
- **닉네임 사용**: 유저의 이름 표시 시 `user.name` 대신 `user.nickname`을 사용하는 것이 백엔드 명세와 일치합니다.

---
**최종 업데이트:** 2026-01-27
**작성자:** 팀원 A (통합 및 인프라 고도화)

### 2. 인터뷰 리포트 저장 기능 구현

#### 변경 사항

-   `InterviewReport` 페이지에 면접 결과를 서버에 저장하는 기능을 구현했습니다.
-   '기록에 저장' 버튼 클릭 시, `SaveReportModal` 모달이 나타나며, 제목 입력 후 'Save Report' 버튼을 누르면 `generateReport` API가 호출됩니다.
-   API 호출 중에는 로딩 상태(스피너 및 버튼 비활성화)가 표시되며, 완료 후에는 사용자에게 성공/실패 알림을 보여줍니다.
-   성공적으로 저장되면 마이페이지의 'AI 면뷰 기록'(`/mypage/ai-interview-log`) 페이지로 자동 이동됩니다.

#### 상세 내용 및 사유

-   **요구사항**: 사용자가 면접을 마친 후, 생성된 분석 리포트를 '마이페이지'에 영구적으로 저장할 수 있어야 합니다.
-   **구현 과정**:
    1.  **API 확인**: `API_SPECIFICATION.md`의 4.1 항목 `POST /api/interviews/{interviewId}/report/generate`가 리포트 생성/저장 역할을 하는 것을 확인했습니다. 해당 API는 `pjt/src/api/interviewService.ts`에 `generateReport` 함수로 이미 구현되어 있었습니다.
    2.  **UI 흐름 분석**: 사용자는 `InterviewReport` 페이지에서 리포트 내용을 확인한 후, '기록에 저장' 버튼을 통해 저장을 시작합니다. 이 버튼은 `SaveReportModal`을 엽니다.
    3.  **상태 관리**:
        -   API 호출에 필요한 `interviewId`를 Redux 스토어에서 가져와야 했습니다. `interviewSlice`에는 관련 정보가 없어, `interviewSessionSlice`를 확인하여 `interviewId` 상태가 관리되고 있음을 파악했습니다.
        -   `InterviewReport` 컴포넌트에서 `useSelector`를 통해 `interviewId`를 가져왔습니다.
        -   API 호출 동안의 로딩 상태를 관리하기 위해 `isSaving`이라는 새로운 `useState`를 추가했습니다.
    4.  **API 연동 로직 구현**:
        -   `InterviewReport` 컴포넌트의 `handleFinalSave` 함수를 `async` 함수로 변경했습니다.
        -   이 함수 내에서 `interviewId`의 유효성을 검사하고, `interviewService.generateReport`를 호출합니다.
        -   `try...catch...finally` 구문을 사용하여 API 요청의 성공, 실패, 그리고 완료 시의 로직(로딩 상태 해제)을 명확하게 처리했습니다.
    5.  **사용자 피드백 강화**:
        -   `SaveReportModal` 컴포넌트를 수정하여, `isSaving` prop을 받도록 했습니다.
        -   `isSaving`이 `true`일 때, 모달 내의 모든 버튼과 입력 필드를 비활성화하고, 저장 버튼에는 `Loader` 아이콘과 "Saving..." 텍스트를 표시하여 사용자가 시스템이 작동 중임을 인지할 수 있도록 개선했습니다.

#### 코드 변경

**파일**: `pjt/src/pages/Interview/InterviewReport.tsx`

```diff
- import React, { useRef, useState, useEffect } from 'react';
- import { Download, ChevronLeft, ChevronRight, PlayCircle, Save, Video } from 'lucide-react';
+ import React, { useRef, useState, useEffect } from 'react';
+ import { Download, ChevronLeft, ChevronRight, PlayCircle, Save, Video, Loader } from 'lucide-react';
- import { useSelector } from 'react-redux';
- import { selectInterviewState } from '../../redux/slices/interviewSlice';
+ import { useSelector } from 'react-redux';
+ import { selectInterviewState } from '../../redux/slices/interviewSlice';
+ import { interviewService } from '../../api/interviewService';
...
- const { questions, answers, analysisResult } = useSelector(selectInterviewState);
- const user = useSelector((state: RootState) => state.auth.user); // 로그인한 사용자 정보
+ const { questions, answers, analysisResult } = useSelector(selectInterviewState);
+ const user = useSelector((state: RootState) => state.auth.user); // 로그인한 사용자 정보
+ const interviewId = useSelector((state: RootState) => state.interviewSession.interviewId); // interviewId 가져오기

...
- const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
+ const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
+ const [isSaving, setIsSaving] = useState(false);
...
- const handleFinalSave = (title: string) => {
-   console.log("Saving report:", { title, user, analysisResult });
-   alert(`"${title}" 리포트가 저장되었습니다.`);
-   setIsSaveModalOpen(false);
- };
+ const handleFinalSave = async (title: string) => {
+   if (!interviewId) {
+     alert('면접 세션 ID를 찾을 수 없습니다. 다시 시도해주세요.');
+     return;
+   }
+
+   setIsSaving(true);
+   console.log("Saving report with title:", title, "for interviewId:", interviewId);
+
+   try {
+     await interviewService.generateReport(Number(interviewId));
+     alert('리포트가 성공적으로 저장되었습니다. 마이페이지로 이동합니다.');
+     setIsSaveModalOpen(false);
+     navigate('/mypage/ai-interview-log'); // 저장 후 AI 면접 기록 페이지로 이동
+   } catch (error) {
+     console.error('리포트 저장에 실패했습니다:', error);
+     alert('리포트 저장 중 오류가 발생했습니다.');
+   } finally {
+     setIsSaving(false);
+   }
+ };
...
- <SaveReportModal 
-   isOpen={isSaveModalOpen} 
-   onClose={() => setIsSaveModalOpen(false)} 
-   onSave={handleFinalSave}
- />
+ <SaveReportModal 
+   isOpen={isSaveModalOpen} 
+   onClose={() => setIsSaveModalOpen(false)} 
+   onSave={handleFinalSave}
+   isSaving={isSaving}
+ />

```

**파일**: `pjt/src/components/Interview/SaveReportModal.tsx`

```diff
- import React, { useState } from 'react';
- import { Save, X, Edit3 } from 'lucide-react';
+ import React, { useState } from 'react';
+ import { Save, X, Edit3, Loader } from 'lucide-react';
- interface SaveReportModalProps {
-   isOpen: boolean;
-   onClose: () => void;
-   onSave: (title: string) => void;
- }
+ interface SaveReportModalProps {
-   isOpen: boolean;
-   onClose: () => void;
-   onSave: (title: string) => void;
+   isSaving: boolean;
+ }
- const SaveReportModal: React.FC<SaveReportModalProps> = ({ isOpen, onClose, onSave }) => {
+ const SaveReportModal: React.FC<SaveReportModalProps> = ({ isOpen, onClose, onSave, isSaving }) => {
...
-   onSave(title);
-   setTitle(''); // 초기화
+   onSave(title);
...
- <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
+ <button onClick={onClose} disabled={isSaving} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white disabled:opacity-50">
...
- <input 
-   type="text"
-   value={title}
-   onChange={(e) => setTitle(e.target.value)}
-   ...
-   autoFocus
- />
+ <input 
+   type="text"
+   value={title}
+   onChange={(e) => setTitle(e.target.value)}
+   ...
+   autoFocus
+   disabled={isSaving}
+ />
...
- <button 
-   onClick={onClose}
-   className="py-4 rounded-2xl font-black text-zinc-500 hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
- >
-   Cancel
- </button>
+ <button 
+   onClick={onClose}
+   disabled={isSaving}
+   className="py-4 rounded-2xl font-black text-zinc-500 hover:bg-white/5 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
+ >
+   Cancel
+ </button>
- <button 
-   onClick={handleSave}
-   className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all active:scale-95 uppercase tracking-widest text-xs"
- >
-   Save Report
- </button>
+ <button 
+   onClick={handleSave}
+   disabled={isSaving}
+   className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:bg-indigo-800"
+ >
+   {isSaving ? (
+     <>
+       <Loader size={14} className="animate-spin" />
+       Saving...
+     </>
+   ) : (
+     'Save Report'
+   )}
+ </button>

---

## 2026-01-26: API Infrastructure & Auth (Reference)

### 1. 인프라 설정 및 인증 구현 (Namju's Log)

-   **Axios & Proxy**:
    -   `axiosInstance.ts`에 Interceptor를 설정하여 JWT 토큰 자동 주입 및 응답 파싱 로직을 구현했습니다.
    -   `vite.config.ts`에 Proxy 설정을 추가하여 로컬 개발 시 CORS 문제를 해결했습니다 (`/api`, `/auth` -> `localhost:8080`).
-   **인증 서비스**:
    -   `authService.ts`를 통해 로그인, 회원가입, 소셜 로그인(OAuth2), 토큰 재발급 API를 연동했습니다.
    -   `EmailLogin`, `EmailSignUp` 컴포넌트에서 실제 API를 호출하도록 연결했습니다.
-   **전역 상태 관리**:
    -   `authSlice`와 `userSlice`를 연동하여 로그인 상태와 유저 프로필 정보를 관리합니다.
    -   새로고침 시 `localStorage`에서 상태를 복구하는 Hydration 로직을 구현했습니다.

---

## 2026-01-27: 추가 수정 및 트러블슈팅 (API 정합성 & UX 개선)

### 1. API 명세 정합성 수정 (Spec Alignment V1 & V2)

#### 변경 사항
-   **EnvironmentCheck.tsx**: 
    -   인터뷰 생성 API (`POST /api/interviews`) 호출 시 필수 필드인 `optionJson: "{}"`가 누락되어 400 에러가 발생하는 문제를 수정했습니다.
-   **RealMode.tsx**:
    -   **청크 업로드 제거**: 명세서에 없는 `uploadInChunks` 로직을 제거하고, 표준 `uploadVideo` API를 사용하도록 통일했습니다.
    -   **표정 데이터 전송**: 영상 분석 요청 시 `face-api.js`로 수집한 표정 데이터(`expressionHistoryRef`)를 함께 전송하도록 수정했습니다.
-   **InterviewReport.tsx**:
    -   리포트 생성 API 호출 시 불필요한 `title` 필드를 제거하여 명세서(5.1항)를 준수하도록 했습니다.
    -   `interviewId` 조회 로직을 `selectInterviewState`로 단순화하여 중복 코드를 제거했습니다.

### 2. Redux 액션 및 순환 참조 수정

#### 변경 사항
-   **액션 누락 수정 (`FIX_MISSING_EXPORT`)**:
    -   `PracticeMode`에서 `startNewAnswer` 액션을 호출하려 했으나 `interviewSlice`에 정의되어 있지 않아 빌드 에러가 발생했습니다.
    -   `interviewSlice.ts`에 `startNewAnswer` 리듀서를 추가하고 export 하여 에러를 해결했습니다.
-   **순환 참조 해결 (`FIX_CIRCULAR_DEP`)**:
    -   `interviewSlice.ts`가 `store.ts`를 임포트하고, `store.ts`가 다시 `interviewSlice`를 임포트하는 순환 참조로 인해 `saveAnswer` 액션이 `undefined`로 인식되는 문제가 있었습니다.
    -   `interviewSlice.ts`에서 `RootState` 임포트를 제거하고 타입을 `any`로 임시 처리하여 순환 고리를 끊었습니다.

### 3. 실전 모드(RealMode) 및 환경 체크(EnvironmentCheck) UX 개선

#### 3.1. EnvironmentCheck: 준비 상태 동기화 및 버튼 활성화 버그
-   **현상**:
    -   장비 점검이 완료되지 않았음에도 '면접 시작' 버튼이 활성화되는 경우가 있었습니다.
    -   면접을 마치고 다시 환경 체크 페이지로 돌아왔을 때, 장비 상태가 갱신되지 않고 멈춰있는 현상이 발생했습니다.
-   **원인**:
    -   `lastStatusRef`가 컴포넌트 마운트 시점의 Redux 상태(이전 면접의 'success' 상태)로 초기화되어, 실제 감지 루프에서 상태 변화를 감지하지 못했습니다 (`prev === current`).
-   **해결**:
    -   `useEffect` 초기화 로직에서 `lastStatusRef.current`를 강제로 'loading' 상태로 리셋하여 감지 루프가 정상 동작하도록 수정했습니다.
    -   버튼의 `disabled` 조건에 `!isAllReady`를 명시적으로 추가하여 유효성 검사를 강화했습니다.

#### 3.2. RealMode: 답변 제출 UX 및 AI 분석 실패 예외 처리
-   **로딩 상태 시각화**:
    -   답변 완료 버튼 클릭 시 `isProcessing` 상태를 `true`로 설정하여, "제출 및 분석 중..."이라는 로딩 버튼을 표시하도록 UI를 개선했습니다.
-   **화면 전환 애니메이션**:
    -   다음 질문으로 넘어갈 때 `isTransitioning` 상태를 이용하여 질문 텍스트에 페이드 인/아웃 효과(Opacity Transition)를 적용했습니다.
-   **AI 분석 실패 시 예외 처리 (Fallback)**:
    -   **현상**: AI 서버 오류(500) 발생 시 `analyzeAudio`에서 에러가 throw되어 인터뷰 흐름이 중단되는 문제가 있었습니다.
    -   **해결**: `try-catch` 블록을 추가하여 AI 분석 실패 시에도 "음성 분석에 실패했습니다."라는 대체 텍스트를 저장하고, 다음 질문으로 정상적으로 넘어가도록 로직을 수정했습니다.
-   **데이터 정합성 수정**:
    -   `saveAnswer` 액션 호출 시 `turnId`가 누락되어 `updateAnswer`가 올바른 답변을 찾지 못하는 문제를 수정했습니다.

### 4. 코드 정리 및 최적화

-   **불필요한 코드 제거**: `RealMode.tsx`에서 사용하지 않는 `uploadInChunks` 함수를 삭제했습니다.
-   **타입 정의 정리**: `interviewService.ts`의 import 경로를 수정하고, 빈 파일이었던 `types/api/interview.ts`를 삭제했습니다.

---

## 7. 트러블슈팅 로그 (상세)

### 7.1. [Redux] Resetting entire interview state 로그 반복 및 상태 불일치

**증상:**
콘솔에 `[Redux] Resetting entire interview state.` 로그가 반복적으로 찍히며, 면접 재시작 시 이전 면접의 설정(ID 등)이 남아있거나 초기화가 제대로 되지 않는 현상.

**원인:**
`EnvironmentCheck` 페이지 진입 시 `useEffect`에서 `resetInterview`를 호출하지만, `lastStatusRef`와 같은 로컬 Ref 값들이 초기화되지 않아 상태 감지 로직이 꼬임. 또한 `RealMode` 종료 시점과 `EnvironmentCheck` 진입 시점의 상태 관리가 명확하지 않았음.

**해결:**
1.  `interviewSlice.ts`에 `resetInterview` 리듀서를 추가하여 모든 상태(장비 체크 포함)를 초기값으로 되돌리는 로직 구현.
2.  `EnvironmentCheck.tsx` 진입 시 `lastStatusRef.current`를 수동으로 초기화하여 상태 감지 루프가 처음부터 다시 동작하도록 강제함.

### 7.2. AI 서버 500 에러 시 인터뷰 중단 (Blocker)

**증상:**
`RealMode`에서 답변 제출 후 `analyze-audio` API가 500 에러를 반환하면, 이후 로직(다음 질문 로드 등)이 실행되지 않고 멈춤.

**원인:**
`uploadAndAnalyze` 함수 내에서 `await interviewService.analyzeAudio(...)` 호출이 실패하면 예외가 발생하여 함수 실행이 중단됨.

**해결:**
해당 API 호출부를 `try-catch`로 감싸고, 에러 발생 시에도 `answerText`에 에러 메시지를 담아 리턴하도록 Fallback 로직을 구현함. 이를 통해 AI 서버 장애 시에도 인터뷰 진행이 가능하도록 조치.

```typescript
try {
  analyzeResponse = await interviewService.analyzeAudio(...);
} catch (audioError) {
  console.error("음성 분석 실패:", audioError);
  analyzeResponse = { 
    finished: false, 
    nextTurn: null, 
    answerText: "[음성 분석에 실패했습니다. AI 서버 상태를 확인해주세요.]" 
  };
}
```

### 7.3. 답변 저장 시 `turnId` 누락으로 인한 상태 업데이트 실패

**증상:**
`[Redux] updateAnswer failed: No answer found for turnId: 73` 경고 로그 발생.

**원인:**
`saveAnswer` 액션을 디스패치할 때 `turnId` 필드를 포함하지 않아, Redux 스토어에 저장된 답변 객체에 `turnId`가 없었음. 이후 `updateAnswer`가 `turnId`로 답변을 찾을 때 실패함.

**해결:**
`RealMode.tsx`의 `processAndAdvance` 함수에서 `saveAnswer` 호출 시 `turnId`를 명시적으로 포함하도록 수정.

```typescript
dispatch(saveAnswer({
  ...,
  turnId: turnId // 추가됨
}));
```
---

## 2026-02-01: `FrostedCard` 컴포넌트 모듈 로딩 에러 수정

### 1. `Uncaught SyntaxError` 해결

#### 변경 사항
- `pjt/src/components/Content/FrostedCard/FrostedCard.constants.ts` 파일의 import 구문을 수정하여 모듈 로딩 런타임 에러를 해결했습니다.

#### 상세 내용 및 사유
- **문제점**: `FrostedCard` 컴포넌트 리팩토링 이후, 브라우저에서 `Uncaught SyntaxError: The requested module '/src/components/Content/FrostedCard/FrostedCard.types.ts' does not provide an export named 'CardItem'` 에러가 발생했습니다. 이로 인해 `FrostedCard` 관련 기능이 전혀 동작하지 않았습니다.
- **원인**: `FrostedCard.constants.ts` 파일이 `FrostedCard.types.ts`로부터 `CardItem`이라는 `interface`를 import 하고 있었습니다. TypeScript에서 `interface`나 `type`은 컴파일 시점에만 사용되고 실제 JavaScript 결과물에는 포함되지 않습니다. 하지만 Vite와 같은 최신 번들러의 개발 서버(HMR)가 일반 `import` 구문을 처리할 때, 이를 타입이 아닌 실제 값(value)으로 잘못 해석하여 존재하지 않는 export를 찾으려고 시도하면서 런타임 에러가 발생한 것으로 보입니다.
- **해결**: `import type` 구문을 사용하여 해당 import가 타입 전용임을 명시적으로 선언했습니다. 이 구문은 TypeScript 컴파일러와 번들러에게 이 import가 타입 검사용이며, 실제 JavaScript 코드에서는 무시해도 된다는 힌트를 줍니다. 이를 통해 번들러의 혼동을 없애고 런타임 에러를 해결했습니다.

#### 코드 변경

**파일**: `pjt/src/components/Content/FrostedCard/FrostedCard.constants.ts`

```diff
- import { CategoryStyle, CardItem, CategoryKey } from './FrostedCard.types';
+ import type { CategoryStyle, CardItem, CategoryKey } from './FrostedCard.types';
```

### 2. `useFrostedCardData` 추가 수정

#### 변경 사항
- `pjt/src/components/Content/FrostedCard/useFrostedCardData.ts` 파일에서 발생하는 동일한 모듈 로딩 에러를 해결했습니다.

#### 상세 내용 및 사유
- **문제점**: `FrostedCard.constants.ts` 파일 수정 이후, 동일한 `Uncaught SyntaxError`가 이번에는 `useFrostedCardData.ts` 파일에서 발생했습니다.
- **원인**: `useFrostedCardData.ts` 커스텀 훅에서도 `CardItem` 타입을 일반 `import`로 가져오고 있어, 이전과 동일한 번들러의 혼동 문제가 발생했습니다.
- **해결**: 해당 파일의 import 구문도 `import type`으로 수정하여, 타입 전용 import임을 명시하고 런타임 에러를 해결했습니다. 이처럼 하나의 리팩토링으로 인해 관련된 여러 파일에서 동일한 패턴의 문제가 발생할 수 있음을 확인했습니다.

#### 코드 변경

**파일**: `pjt/src/components/Content/FrostedCard/useFrostedCardData.ts`

```diff
- import { CardItem } from './FrostedCard.types';
+ import type { CardItem } from './FrostedCard.types';
```

### 3. 컴포넌트 렌더링 관련 파일 추가 수정

#### 변경 사항
- `constants`와 `hooks` 파일 수정 이후에도 동일한 `SyntaxError`가 발생하여, 실제 컴포넌트 렌더링에 직접 관여하는 파일들의 임포트 구문을 추가로 수정했습니다.

#### 상세 내용 및 사유
- **문제점**: 이전 단계에서 `constants`와 `hooks` 파일의 타입 임포트 문제를 해결했음에도 불구하고, 브라우저에서 여전히 `CardItem` 모듈을 찾지 못하는 에러가 발생했습니다.
- **원인**: 에러의 근본 원인은 동일했습니다. `CardItem` 타입을 사용하는 다른 파일들(`CardItem.tsx`, `DetailModal.tsx`, `index.tsx`)에서도 `import type`이 아닌 일반 `import`를 사용하고 있었습니다.
- **해결**: 문제가 발생한 모든 파일에서 `CardItem` 타입을 임포트하는 구문을 `import type`으로 수정하여, 타입 전용 임포트임을 명시하고 런타임 에러를 완전히 해결했습니다.

#### 코드 변경

**파일**: `pjt/src/components/Content/FrostedCard/CardItem.tsx`
```diff
- import { CardItem as CardItemType } from './FrostedCard.types';
+ import type { CardItem as CardItemType } from './FrostedCard.types';
```

**파일**: `pjt/src/components/Content/FrostedCard/DetailModal.tsx`
```diff
- import { CardItem } from './FrostedCard.types';
+ import type { CardItem } from './FrostedCard.types';
```

**파일**: `pjt/src/components/Content/FrostedCard/index.tsx`
```diff
- import { CardItem } from './FrostedCard.types';
+ import type { CardItem } from './FrostedCard.types';
```

---
## 2026-02-02: 실전 모드(RealMode) UX 개선

### 1. 답변 제출 후 영상 재생 및 다음 질문으로 건너뛰기 기능 구현

#### 변경 사항
- **답변 영상 다시보기**: `RealMode`에서 사용자가 답변을 제출하면, AI가 분석하고 다음 질문을 준비하는 동안 방금 녹화한 본인의 답변 영상을 다시 볼 수 있도록 기능을 추가했습니다.
- **'다음 질문으로' 버튼**: 다음 질문이 준비되면, 화면 하단에 '다음 질문으로' 버튼이 활성화됩니다. 사용자는 원하는 시점에 이 버튼을 클릭하여 다음 질문으로 넘어갈 수 있습니다.

#### 상세 내용 및 사유
- **문제점**: 기존에는 답변을 제출하면 다음 질문이 올 때까지 특별한 피드백 없이 대기해야 했습니다. 이로 인해 사용자는 시스템이 정상적으로 동작하는지 알기 어려웠고, 대기 시간이 지루하게 느껴질 수 있었습니다.
- **요구사항**: 답변 제출 후의 대기 시간을 활용하여 사용자 경험을 개선하고자 했습니다. 본인의 답변 모습을 바로 피드백 받는 것은 면접 연습의 효율을 높일 수 있으며, 다음 질문으로 넘어가는 시점을 사용자가 직접 제어하게 하여 편의성을 높이고자 했습니다.
- **구현 과정**:
    1.  **상태 추가**: `useRealMode` 훅에 `lastRecordedVideoUrl`(마지막 녹화 영상 URL)과 `nextQuestionForSkip`(다음에 올 질문 데이터)이라는 두 가지 상태를 추가했습니다.
    2.  **영상 URL 생성**: 답변 녹화가 끝나고 `processAndAdvance` 함수가 호출될 때, `MediaRecorder`가 생성한 비디오 `Blob`으로 `URL.createObjectURL`을 사용해 임시 URL을 생성하고 `lastRecordedVideoUrl` 상태에 저장했습니다.
    3.  **흐름 제어 로직 변경**:
        - 기존 `uploadAndAnalyze` 함수는 다음 질문을 받아오면 즉시 화면을 전환했습니다.
        - 변경된 로직에서는 다음 질문(`nextQ`)을 받아오면 화면을 전환하는 대신 `setNextQuestionForSkip(nextQ)`를 호출하여 '스킵 가능한 질문이 준비되었음'을 상태로 관리합니다.
        - `isProcessing` 상태는 사용자가 '다음 질문으로' 버튼을 누르기 전까지 `true`로 유지됩니다.
    4.  **건너뛰기 핸들러**: 사용자가 '다음 질문으로' 버튼을 클릭하면 호출될 `handleSkipToNextQuestion` 함수를 새로 만들었습니다. 이 함수는 `nextQuestionForSkip`에 저장된 질문 데이터로 화면을 전환하고, 관련 상태(`isProcessing`, `lastRecordedVideoUrl` 등)를 모두 초기화하는 역할을 합니다.
    5.  **UI 수정**:
        -   `VideoFeed.tsx`: `isProcessing`이 `true`이고 `lastRecordedVideoUrl`이 존재할 경우, 라이브 웹캠 대신 `lastRecordedVideoUrl`을 `src`로 갖는 비디오 플레이어를 렌더링하도록 수정했습니다. 이 비디오는 자동으로 반복 재생됩니다.
        -   `ControlBar.tsx`: `isProcessing` 상태일 때, `nextQuestionForSkip` 데이터가 있으면 '다음 질문으로' 버튼을, 없으면 기존의 "제출 및 분석 중..." 로딩 버튼을 보여주도록 조건부 렌더링 로직을 추가했습니다.

#### 코드 변경 요약

**파일**: `pjt/src/pages/Interview/RealMode/useRealMode.ts`
```typescript
// 신규 상태 추가
const [lastRecordedVideoUrl, setLastRecordedVideoUrl] = useState<string | null>(null);
const [nextQuestionForSkip, setNextQuestionForSkip] = useState<any | null>(null);

// 건너뛰기 핸들러 추가
const handleSkipToNextQuestion = () => {
  if (nextQuestionForSkip) {
    // ... 화면 전환 및 상태 초기화 로직
    dispatch(addQuestion(nextQuestionForSkip));
    dispatch(nextQuestion());
    setIsProcessing(false);
    setLastRecordedVideoUrl(null);
    setNextQuestionForSkip(null);
  }
};

// 기존 로직 변경
const uploadAndAnalyze = async (/*...*/) => {
  // ... (API 호출 및 분석)
  if (nextQ) {
    setNextQuestionForSkip(nextQ); // 화면을 바로 전환하지 않고 상태에 저장
  } else {
    handleFinish();
    setIsProcessing(false);
  }
};

const processAndAdvance = useCallback(async (videoBlob: Blob, /*...*/) => {
  const videoUrl = URL.createObjectURL(videoBlob);
  setLastRecordedVideoUrl(videoUrl); // 녹화된 영상의 URL 저장
  // ...
  uploadAndAnalyze(videoBlob, audioBlob, turnId, duration);
}, [/*...*/]);
```

**파일**: `pjt/src/pages/Interview/RealMode/VideoFeed.tsx`
```typescript
// ...
{isProcessing && lastRecordedVideoUrl ? (
  <video
    src={lastRecordedVideoUrl}
    autoPlay
    loop
    className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
  />
) : (
  // 기존 웹캠 영상
)}
// ...
```

**파일**: `pjt/src/pages/Interview/RealMode/ControlBar.tsx`
```typescript
// ...
{isProcessing ? (
  nextQuestionForSkip ? (
    <button onClick={onSkipToNextQuestion} /*...*/ >
      <SkipForward className="w-5 h-5" /> 다음 질문으로
    </button>
  ) : (
    <button disabled /*...*/ >
      <Loader className="w-6 h-6 animate-spin" />
      제출 및 분석 중...
    </button>
  )
) : (
  // 기존 녹화 시작/종료 버튼
)}
// ...
```