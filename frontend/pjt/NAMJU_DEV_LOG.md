# 프로젝트 개발 로그 (API 인프라 및 인증)

**작업 일시:** 2026-01-26
**작업 내용:** API 통신 인프라 구축 및 인증 서비스 구현

---

## 1. 개요
백엔드 API 연동을 위한 기본적인 통신 구조를 설계하고, 인증(Auth) 관련 기능을 우선적으로 구현했습니다. 팀원들은 이 구조를 바탕으로 각자의 도메인 API를 연동하면 됩니다.

## 2. 주요 작업 사항

### 2.1 인프라 설정
- **Axios 설치:** 비동기 HTTP 통신을 위해 `axios` 라이브러리를 설치했습니다.
- **환경 변수:** `.env` 파일을 통해 `VITE_API_BASE_URL`을 관리합니다.
- **Axios 인스턴스 (`src/api/axiosInstance.ts`):**
  - 모든 요청에 `Authorization: Bearer <token>` 헤더를 자동 주입하는 인터셉터 설정.
  - 응답 데이터를 `response.data`까지 파싱하여 전달하도록 가공.
  - `withCredentials: true` 설정으로 쿠키 기반 세션/리프레시 토큰 대응.

### 2.2 타입 정의 (TypeScript)
- **공통 규격 (`src/types/api/common.ts`):** 백엔드 공통 응답 포맷인 `GlobalApiResponse<T>` 정의.
- **인증 타입 (`src/types/api/auth.ts`):** 로그인/회원가입에 필요한 요청 및 응답 인터페이스 정의.
- **주의사항:** TypeScript 설정에 따라 타입 임포트 시 `import type` 키워드를 반드시 사용해야 합니다.

### 2.3 서비스 레이어 (`src/api/services/authService.ts`)
- 백엔드 명세서상의 모든 인증 API를 함수화하여 구현 완료.
  - 회원가입, 로그인, 로그아웃, 토큰 재발급, 비밀번호 초기화, 소셜 로그인(Github/Google).

## 3. 폴더 구조
```text
src/
  api/
    axiosInstance.ts      # 공통 Axios 설정
    services/
      authService.ts      # 인증 관련 API 호출 함수
  types/
    api/
      common.ts           # API 공통 응답 타입
      auth.ts             # 인증 관련 데이터 타입
      interview.ts        # 인터뷰 관련 데이터 타입 (파일 생성됨)
```

## 4. 팀원 참고 사항 (Next Steps)
- **팀원 A (인증/인프라):** `authSlice.ts`에서 위 `authService`를 사용하여 비동기 액션(createAsyncThunk)을 구현하고 전역 로그인 상태를 완성해 주세요.
- **팀원 B (마이페이지):** 유저 정보가 필요할 때 `authSlice`나 `userSlice`에 담길 `LoginResponse` 규격을 참고하세요.
- **팀원 C (인터뷰/스터디):** `interviewService.ts`를 생성하여 면접 관련 API를 위와 동일한 방식으로 연동해 주세요.

---

## 5. 팀원 B 작업 현황 (MyPage 담당) - 2026-01-26

### 5.1 현황 및 진단
- **백엔드 명세 미비:** 마이페이지 관련 API 엔드포인트가 아직 명세서에 부재함.
- **전략:** 실제 API가 나올 때까지 **가상의 타입과 Mock 서비스**를 구축하여 UI 작업을 우선 진행함. API 확정 시 `mypageService.ts`만 수정하면 되도록 인터페이스를 설계함.

### 5.2 작업 내역
- [x] **가상 타입 정의:** `src/types/api/mypage.ts` (프로필, 로그, 통계 데이터 구조)
- [x] **Mock 서비스 구축:** `src/api/services/mypageService.ts` (API 호출 흉내 및 지연 응답 구현)
- [x] **전역 상태 관리:** `src/redux/slices/mypageSlice.ts` 구축 및 `store.ts` 등록
- [x] **UI 리팩토링:** `MyPage.tsx` 컴포넌트 분리 및 데이터 흐름 연결

### 5.3 향후 계획
- 백엔드 명세 확정 즉시 실제 엔드포인트로 교체 및 테스트 진행.

---

## 6. 로컬 통합 테스트 및 인증 연동 실체화 - 2026-01-26 (현재 작업)

### 6.1 로컬 개발 환경 최적화
- **Vite 프록시 설정 (`vite.config.ts`):** 
  - 로컬 백엔드(`8080`)와의 통신 시 발생하는 CORS 에러를 해결하기 위해 프록시 서버 설정 추가.
  - `/auth`, `/api`, `/learning` 경로에 대해 백엔드 서버로 자동 포워딩.
- **포트 고정:** 다른 프로세스와의 충돌 방지를 위해 프론트엔드 포트를 `5173`으로 고정하고 `strictPort: true` 설정 적용.
- **환경 변수 최적화:** `.env`의 `VITE_API_BASE_URL`을 비워두어 브라우저가 프록시를 통해 현재 호스트로 요청을 보내도록 유도 (CORS 완전 회피).

### 6.2 인증 기능 실제 연동 (Mock -> Real API)
- **`EmailLogin.tsx`:** 
  - `authService.login`을 연동하여 실제 서버 로그인을 시도하도록 로직 수정.
  - 로그인 성공 시 `accessToken` 및 사용자 기본 정보를 `localStorage`에 저장하는 흐름 구현.
  - API 통신 중 버튼 비활성화 및 서버 에러 메시지(`401`, `403` 등) 실시간 표시 처리.
- **`EmailSignUp.tsx`:**
  - 기획 변경 사항 반영: 아이디(`id`) 필드를 제거하고 **이메일 로그인 체제**로 전환.
  - `nickname` 입력을 위한 단일 필드 구성으로 UI 단순화 및 백엔드 스펙(`email`, `password`, `nickname`)에 맞춤.
  - 비밀번호 확인(`confirmPassword`) 검증 로직 및 가입 성공 후 로그인 페이지 자동 이동 구현.

### 6.3 이슈 및 해결 (Troubleshooting)
- **403 Forbidden 이슈:** 
  - 백엔드 `SecurityConfig`의 `AllowedOrigins`에 `5174` 포트 누락 및 CSRF 설정 충돌 확인.
  - 백엔드 코드 수정을 통해 프론트엔드 포트 허용 및 CSRF 비활성화 권고하여 해결.
- **포트 자동 변경 이슈:** 
  - Vite가 `5174`로 자동 변경되어 백엔드 화이트리스트를 벗어나는 문제 발생 -> `vite.config.ts`에서 포트를 `5173`으로 강제 고정하여 환경 통일.

---

## 7. 전역 상태 기반 인증 고도화 및 소셜 로그인 연동 - 2026-01-26

### 7.1 전역 상태 관리 (Redux Integration)
- **상태 동기화:** `authSlice`와 `userSlice`를 연동하여 로그인 상태(`isLoggedIn`)와 사용자 프로필 정보(`nickname`, `profileImage`)를 중앙 집중 관리.
- **새로고침 유지 (Hydration):** `App.tsx` 초기 로딩 시 `localStorage`에서 토큰과 사용자 정보를 읽어와 Redux 상태를 복구하는 로직 구현.

---

## 8. 시스템 안정화 및 렌더링 성능 최적화 - 2026-01-28

### 8.1 라우터 구조 및 내비게이션 근본적 해결
- **Router 위치 재설계:** `App.tsx` 내부에 존재하던 `BrowserRouter`를 `main.tsx` 최상단으로 이동. 페이지 전환 시 라우터 자체가 재구성되면서 발생하던 화면 멈춤 및 비동기 동기화 이슈를 원천 차단.
- **인위적 지연 제거:** 사용자 경험을 저해하던 `App.tsx` 내 2초간의 강제 `setTimeout` 로직을 제거하여 즉각적인 앱 진입 환경 구축.

### 8.2 렌더링 성능 및 지연(Lag) 최적화
- **메인 페이지 DOM 부하 감축:** 
  - 하단 무한 스크롤(Marquee) 아이템 개수를 100개에서 20개로 최적화.
  - 기술 아카이브 섹션의 3D 카드 렌더링 개수를 120개에서 30개로 조정하여 언마운트 시 발생하는 메모리 해제 부하(렉) 해결.
- **메모이제이션 적용:**
  - `MainLayout`의 `Outlet context`를 `useMemo`로 처리하여 하위 페이지 이동 시 불필요한 전체 재렌더링 방지.
  - 무거운 메인 페이지 컴포넌트에 `React.memo`를 적용하여 내비게이션 반응 속도 개선.
- **스크롤 시스템 통합:** `MainLayout`과 `Main` 페이지 간의 중복 스크롤 컨테이너 설정을 정리하고, 페이지 이동 시 `ScrollToTop` 방식을 `smooth`에서 `instant`로 변경하여 즉각적인 화면 갱신 체감 제공.

### 8.3 상태 무결성 및 오류 수정
- **로그인 상태 복구 로직 보완:** `authSlice`의 초기 상태 설정 시 `localStorage`의 토큰 존재 여부를 `isLoggedIn`에 즉시 반영하도록 수정하여 새로고침 시 로그인 풀림 현상 해결.
- **런타임 에러 해결:** `MainLayout.tsx`에서 잘못 참조되고 있던 상태 변경 함수(`setIsVisible` -> `setIsChatVisible`)를 수정하여 화면 렌더링 차단 오류 해결.

---
- **안전한 상태 접근:** 컴포넌트(Header, MyPage 등)에서 `state.user` 접근 시 발생할 수 있는 `undefined` 오류를 방지하기 위해 옵셔널 체이닝 및 기본값 처리를 적용한 방어적 코드 작성.

### 7.2 헤더(Header) 및 UI 연동
- **로그인 상태별 UI 분기:** 
  - 비로그인: `Log In | Join Us` 텍스트 링크 노출.
  - 로그인: 사용자 **프로필 이미지 + 닉네임** 버튼 및 **Logout** 기능 활성화.
- **로그아웃 흐름:** 로그아웃 시 Redux 상태 초기화 및 `localStorage`의 인증 정보를 즉시 삭제하여 보안 강화.

### 7.3 소셜 로그인(OAuth2) 인프라 구축
- **OAuth2 흐름 설계:**
  - **Login 페이지:** GitHub/Google 인증 페이지로의 리다이렉트 핸들러 추가 (`Client ID` 기반).
  - **콜백 처리 (`SocialLoginCallback.tsx`):** 인증 완료 후 전달받은 `code`를 백엔드 API(`authService`)로 전달하여 최종 로그인을 완료하는 전용 라우트 구축.
- **환경 변수 관리:** `VITE_GITHUB_CLIENT_ID` 및 `VITE_GOOGLE_CLIENT_ID`를 통한 외부 서비스 식별자 관리 체계 구축.

### 7.4 마이페이지(MyPage) 실데이터 연동
- 기존 하드코딩된 유저 정보를 Redux 스토어의 실데이터로 대체.
- 로그인한 사용자의 이메일, 닉네임, 프로필 사진이 사이드바와 대시보드에 실시간 반영되도록 연결.

---
**추후 작업 예정:** 인터뷰 세션 생성 API 연동 및 실제 영상/음성 업로드 로직 구현.


 회원가입시 비밀번호 8자리 미만 불가능하게 수정

 ---

# 9. 포트폴리오 관련

[API] 포트폴리오 분석 및 질문 조회

> Version: v1.2 (문서 타입 구분 추가)
Last Updated: 2026.01.28
Auth: Bearer {AccessToken} (Header)
> 

## 9.1. 포트폴리오 업로드 및 AI 분석 요청

사용자가 포트폴리오 또는 자기소개서 파일을 업로드하면, 서버가 이를 S3에 저장하고 AI 분석을 수행한 뒤 DB에 저장합니다.
**분석이 완료될 때까지(약 30~60초) 응답을 대기해야 하는 동기(Synchronous) API입니다.**

- **URL:** `/api/v1/portfolios`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`

### 📥 Request (Form Data)

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | `File` | **Yes** | 분석할 파일 (PDF, DOCX, TXT) |
| `userId` | `String` | **Yes** | 사용자 ID (Long 타입으로 파싱 가능한 숫자 문자열) |
| `type` | `String` | **Yes** | 문서 타입 (`PORTFOLIO` 또는 `RESUME`) |
| `title` | `String` | No | 포트폴리오 제목 (미입력 시 파일명 사용) |

### 📤 Response (200 OK)

분석 및 저장이 완료되면 생성된 `portfolioId`를 반환합니다.

```
{
  "message": "분석이 완료되었습니다.",
  "portfolioId": 105
}

```

## 9.2. 내 포트폴리오 목록 조회

특정 사용자가 업로드한 모든 문서 목록을 최신순으로 조회합니다. `type` 파라미터로 필터링할 수 있습니다.

- **URL:** `/api/v1/portfolios?userId={userId}&type={type}`
- **Method:** `GET`
- **Content-Type:** `application/json`

### 📥 Request (Query Param)

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `userId` | `Long` | **Yes** | 조회할 사용자의 ID |
| `type` | `String` | No | 문서 타입 필터 (`PORTFOLIO` 또는 `RESUME`). 생략 시 전체 조회. |

### 📤 Response (200 OK)

```
{
  "count": 2,
  "portfolios": [
    {
      "id": 105,
      "title": "2026_Backend_Portfolio.pdf",
      "type": "PORTFOLIO",
      "originalFilename": "2026_Backend_Portfolio.pdf",
      "fileUrl": "https://s3.ap-northeast-2.amazonaws.com/...",
      "createdAt": "2026-01-28T14:30:00"
    },
    {
      "id": 101,
      "title": "My_Resume.pdf",
      "type": "RESUME",
      "originalFilename": "My_Resume.pdf",
      "fileUrl": "https://s3.ap-northeast-2.amazonaws.com/...",
      "createdAt": "2026-01-20T09:00:00"
    }
  ]
}

```

## 9.3. 포트폴리오 질문 목록 조회

분석이 완료된 포트폴리오의 **계층형(Tree) 질문 리스트**를 조회합니다.
질문은 **[메인] → [1차 꼬리] → [2차 꼬리]**의 3단계(`depth: 0, 1, 2`) 구조로 반환됩니다.

- **URL:** `/api/v1/portfolios/{portfolioId}/questions`
- **Method:** `GET`
- **Content-Type:** `application/json`

### 📥 Request (Path Variable)

| Name | Type | Description |
| --- | --- | --- |
| `portfolioId` | `Long` | 조회할 포트폴리오의 고유 ID (PK) |

### 📤 Response (200 OK)

```
{
  "portfolioId": 105,
  "count": 9,
  "questions": [
    {
      "id": 1,
      "content": "개인 프로젝트에서 Redis를 캐시로 선택한 이유는 무엇인가요?",
      "intent": "기술 선정 이유 및 아키텍처 이해도 검증",
      "topic": "Redis 캐싱 전략",
      "depth": 0,
      "children": [
        {
          "id": 10,
          "content": "Redis 사용 시 발생할 수 있는 데이터 정합성 문제는 어떻게 해결하셨나요?",
          "intent": "트러블 슈팅 능력 검증",
          "topic": null,
          "depth": 1,
          "children": [
            {
              "id": 11,
              "content": "Look-aside 패턴을 사용했을 때의 단점은 무엇이라고 생각하시나요?",
              "intent": "설계 패턴에 대한 비판적 사고 검증",
              "topic": null,
              "depth": 2,
              "children": []
            }
          ]
        }
      ]
    }
  ]
}

```

## 9.4. 에러 코드 (Error Codes)

| Status | Code | Description | 해결 방법 |
| --- | --- | --- | --- |
| `400` | `BAD_REQUEST` | `업로드 파일이 비어있습니다.` | 파일이 정상적으로 선택되었는지 확인 |
| `400` | `BAD_REQUEST` | `지원하지 않는 파일 형식입니다.` | PDF, DOCX, TXT 파일인지 확인 |
| `404` | `NOT_FOUND` | `해당 유저가 없습니다.` | `userId`가 올바른지 확인 |
| `404` | `NOT_FOUND` | `해당 포트폴리오가 없습니다.` | `portfolioId`가 올바른지 확인 |
| `500` | `INTERNAL_SERVER_ERROR` | `AI 분석 실패 또는 빈 응답` | AI 서버 상태 확인 (타임아웃 등) |

---

# 10. 마이페이지 실데이터 연동 및 안정화 - 2026-01-29

### 10.1 자소서/포트폴리오 목록 실데이터 연동
- **Mock 데이터 제거:** `MyPortfolio.tsx`에 존재하던 가상의 문서 목록을 제거하고 실제 서버 API(`getPortfolios`) 연동으로 전환.
- **Redux 연동:** `authSlice`의 `userId`를 참조하여 현재 로그인한 사용자의 데이터를 조회하도록 구현.
- **탭별 실시간 필터링:** 'RESUME' / 'PORTFOLIO' 탭 전환 시 서버에 `type` 파라미터를 전송하여 최신 목록을 실시간으로 갱신.

### 10.2 시스템 안정화 및 에러 수정
- **필드 매핑 최적화:** 백엔드 응답 구조(`{ count, portfolios: [] }`) 및 필드명(`id`, `title`)에 맞춰 인터페이스와 UI 바인딩 수정.
- **빌드/런타임 에러 해결:** Vite 환경에서의 `SyntaxError` 해결을 위한 `import type` 적용 및 `portfolioId` 참조 오류 수정.
- **포트폴리오 삭제 기능 구현:** `deletePortfolio` API 연동 및 UI 내 삭제 버튼 기능 활성화. (Path Variable: `portfolioId`, Query Param: `userId`)
- **면접 시작 모달 실데이터 연동:** `Step2HistoryList.tsx`에서 기존 하드코딩된 목록을 제거하고, `getPortfolios` API를 통해 유저가 업로드했던 실제 문서 목록을 불러와 선택할 수 있도록 구현.
