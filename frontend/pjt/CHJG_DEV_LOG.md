# CHJG 개발 로그

## 날짜: 2026-01-28

### 1. 학습 페이지 페이지네이션 개선
- **대상 파일**: `src/pages/Study/StudyList.tsx`
- **변경 사항**:
    - 페이지 번호가 고정된 1-10 범위가 아닌 동적으로 표시되도록 슬라이딩 윈도우 페이지네이션 로직을 구현했습니다 (예: 11-20).
    - `ChevronsLeft`, `ChevronsRight` 아이콘을 사용하여 **맨 처음으로**(`<<`) 및 **맨 끝으로**(`>>`) 이동 버튼을 추가했습니다.
    - 이전/다음 버튼의 비활성화 로직을 개선했습니다.

### 2. 카테고리 네비게이션 리팩토링 (URL 동기화)
- **대상 파일**: `src/pages/Study/CategoryBar.tsx`, `src/pages/Study/StudyList.tsx`
- **변경 사항**:
    - 카테고리 선택 방식을 단순 Redux 상태 관리에서 **URL 경로 파라미터**(`/study/category/:category`) 방식으로 변경했습니다.
    - 이제 사용자가 특정 카테고리 페이지를 북마크하거나 새로고침해도 상태가 유지됩니다.
    - URL의 카테고리 약어 처리 로직을 구현했습니다 (예: `dsa` -> `DATA STR`, `nw` -> `NETWORK`).
    - `/study`로 진입 시 `/study/category/all`로 리다이렉트되도록 설정하여 전체 목록이 기본으로 표시되게 했습니다.

### 3. 'ALL' 탭 카테고리 표시 (백엔드 제약 사항 우회)
- **대상 파일**: `src/pages/Study/StudyList.tsx`
- **문제점**: 백엔드 API(`getQuestions`)가 `categoryId`나 카테고리 이름을 반환하지 않아, 'ALL' 탭의 모든 항목이 기본값인 'CS'로 표시되는 문제가 있었습니다.
- **해결 방안**:
    - 프론트엔드 내부에 `inferCategory` 함수를 구현했습니다.
    - 이 함수는 질문 제목의 키워드('SQL', 'TCP', 'OS' 등)를 분석하여 리스트 뷰에서 올바른 카테고리 라벨(DB, NETWORK, CS 등)을 추론해 표시합니다.

### 4. 학습 상세 페이지 기능 강화
- **대상 파일**: `src/pages/Study/StudyDetail.tsx`
- **변경 사항**:
    - **스마트 뒤로 가기**: "목록으로 돌아가기" 버튼이 이제 사용자가 이전에 보고 있던 카테고리 컨텍스트를 유지합니다 (무조건 'ALL'로 가지 않고 `/study/category/db` 등으로 복귀).
    - **모범 답안 표시**: 데이터가 존재할 경우 하단에 `modelAnswer`를 렌더링하는 섹션(마크다운 지원)을 추가했습니다.
    - **카테고리 유지**: 새로고침 후에도 올바른 카테고리와 아이콘이 표시되도록 로직을 수정했습니다.
    - **UI 정리**: 푸터와 헤더 메타데이터에서 "댓글"(MessageCircle) 아이콘 및 카운트를 제거했습니다.

### 5. 일반 UI/UX 수정
- **대상 파일**: `src/pages/Study/PostItem.tsx`, `src/pages/Study/studyMock.ts`
- **변경 사항**:
    - **작성자 이름**: 목(Mock) 데이터 및 리스트/상세 뷰 전체에서 작성자 이름을 **'DADAP_Archive'**로 통일했습니다.
    - **댓글 제거**: 게시글 목록 아이템에서 댓글 카운트 표시를 제거했습니다.

### 6. 프론트엔드 조회수 시뮬레이션
- **대상 파일**: `src/pages/Study/viewUtils.ts` (신규), `src/pages/Study/StudyList.tsx`, `src/pages/Study/StudyDetail.tsx`
- **기능**:
    - 백엔드 지원 없이 조회수 증가를 구현하기 위해 로컬 스토리지(LocalStorage) 기반 시스템을 구현했습니다.
    - `viewUtils.ts`: 게시글 ID를 기반으로 결정적인(Deterministic) 랜덤 초기 조회수를 생성하고 증가 로직을 처리합니다.
    - 상세 페이지 진입 시 실시간으로 조회수를 업데이트하고, 이를 리스트 뷰에도 반영합니다.

## 날짜: 2026-01-29

### 1. 카테고리/정렬/매핑/백엔드 동기화 개선
- **대상 파일**: `src/pages/Study/StudyList.tsx`, `src/components/Content/FrostedCard.tsx`, `src/pages/Study/CategoryBar.tsx`, `src/pages/Study/StudyDetail.tsx`
- **변경 사항**:
    - **카테고리 매핑 및 정렬**: 백엔드에서 내려주는 categoryId와 카테고리명이 완전히 일치하도록 매핑 로직을 전면 수정함. (OS-1, NETWORK-2, DSA-3, DB-4, FE-5, BE-6)
    - **API 요청 및 카드 매핑**: FrostedCard, StudyList 등에서 API 요청 시 categoryId를 위 순서에 맞게 요청하고, 받아온 데이터도 해당 순서대로 정렬 및 매핑되도록 개선.
    - **카테고리별 데이터 일치**: questionId, categoryId, 카테고리명이 모두 정확히 매칭되어, 리스트/카드/상세 등 모든 뷰에서 일관성 있게 출력됨.
    - **ALL 탭/추론**: ALL 탭에서 categoryId가 없는 경우에만 inferCategory로 추론, 그 외에는 반드시 categoryIdToName을 사용해 카테고리명을 지정.
    - **정렬 우선순위**: StudyList 등에서 카테고리 우선순위(OS→NETWORK→DSA→DB→FE→BE)로 정렬, 같은 카테고리 내에서는 questionId 오름차순 정렬.
    - **상세/카드/리스트 동기화**: StudyDetail, FrostedCard 등 모든 컴포넌트에서 카테고리 표기, 아이콘, URL 이동 등도 백엔드 기준에 맞춰 동기화.
    - **테스트/버그 수정**: 카테고리 꼬임, 잘못된 매핑, 순서 오류 등 기존 문제점 전부 해결.

## 날짜: 2026-01-30

### 1. Studylog — 기여도(히트맵) 및 연도별 보기 개선
- **대상 파일**: `src/components/Content/Studylog.tsx`, `src/index.css`, `src/api/interviewService.ts`, `src/api/axiosInstance.ts`
- **변경 사항 (요약)**:
    - ReferenceError 및 잘못된 스코프 오류 수정: 컴포넌트 최하단에 남아 있던 중복/스트레이 JSX를 제거하여 `dailyContributions` 미정의 오류 해결.
    - 기여도 그래프 재구성:
        - 주 단위 열(week-columns) × 요일 행(7행) 레이아웃으로 구현하고, 주(week) 열을 고정 너비로 유지하여 칸이 압축되지 않도록 `minWidth` 적용.
        - 왼쪽에 요일(Sun..Sat) 라벨을 고정된 컬럼으로 배치해 스크롤 시에도 위치 유지.
        - 가로 스크롤 컨테이너(`contrib-scrollbar`) 적용으로 전체 UI 테마에 맞는 다크 모드 스크롤바 스타일 추가 (`src/index.css`에 스타일 추가).
    - 월 라벨/정렬 개선:
        - 월 라벨을 한국어(`1월`..`12월`)로 변경하고, 각 월의 주 범위를 계산하여 해당 월의 중앙(중간 주) 위치에 라벨을 배치 — 12월/1월 겹침 문제 해결.
        - 연도 선택 모드(드롭다운) 추가: 상단에서 연도를 선택하면 해당 연도(1월~12월)만 표시하도록 `ContributionGraph`가 연도별 범위를 렌더링.
    - 날짜 정렬/정확성 개선:
        - 연도별 보기 및 기본 1년 보기 모두 시작일을 이전 일요일로, 종료일을 다음 토요일로 정렬하여 주(week) 경계와 요일 행이 일치하도록 보정 — 예: 1/29, 1/30 같은 날짜가 정확한 요일에 표시되도록 수정.
    - 연도/월별 통계 계산 추가:
        - 선택된 연도에 대해 각 달의 요일별 일수 배열(`monthWeekdayCounts`)을 정확히 계산하도록 추가 (윤년 포함). 개발 중 콘솔 로그로 값 확인 가능.
    - 데이터 매핑/디듀프:
        - 백엔드의 `getDailyCategoryAverages` 응답을 안전하게 파싱하고, 유효한 세션만 `logs`로 사용하도록 변경(인터뷰 결과와의 불필요한 병합 제거).
    - API/디버깅 보완:
        - `axiosInstance`에 개발용 요청/응답 디버그 로깅을 추가해 네트워크 응답 형태를 확인하기 쉽게 함.
        - `interviewService`의 일부 엔드포인트에서 방어적 응답 언래핑(`(response as any).data ?? response`) 적용.

### 2. 기타 소소한 UI/버그 픽스
- 그래프의 월 라벨 위치·간격·줄높이 조정으로 가독성 향상.
- 불필요한 '역량 분석' 블록 제거 및 레이아웃 정리.

### 검증 및 다음 계획
- 검증: 로컬에서 페이지를 새로고침하며 월 라벨/요일 정렬, 연도 선택 동작, 스크롤바 스타일을 확인했습니다. (추가 미세조정 요청 수신 대기)
- 다음 계획: 월별 요일 수를 UI에 노출하거나 CSV로 내보내는 기능 추가, 드래그-팬(직접 드래그로 좌우 스크롤) 복원 또는 터치/휠 경험 개선.

### 3. 커뮤니티(Boards) — 게시판 기능 정비 (2026-01-30)

- **대상 파일**: `src/pages/Community/CreatePostPage.tsx`, `src/pages/Community/EditPostPage.tsx`, `src/pages/Community/CommunityPage.tsx`, `src/pages/Community/CommunityPage.tsx`, `src/api/myBoardsService.ts`, `src/api/axiosInstance.ts`

- **변경 사항 요약**:
    - **게시글 작성/수정 UI 개선**: `CreatePostPage`를 페이지형 작성 화면(드롭존 + 미리보기)으로 재작성하고, `EditPostPage`를 새로 추가해 기존 게시글을 불러와 수정 가능하도록 구현함. 이미지 선택/교체/제거 처리를 포함.
    - **FormData 전송 안정화**: `myBoardsService.createBoard` / `updateBoard`에서 `req`를 JSON Blob으로 추가하고 `imageFile`을 multipart로 전송하도록 유지하되, `Content-Type` 헤더를 브라우저가 자동으로 설정하게 변경하여 boundary 누락 문제 해결(서버가 파일을 인식 못하는 문제 완화).
    - **axios 인스턴스 개선**: `axiosInstance`의 요청 인터셉터에서 `FormData` 전송 시 강제 `Content-Type`을 제거하도록 처리하고, 개발환경에서 `VITE_API_BASE_URL` 미설정 시 경고 로그를 추가하여 잘못된 요청(예: Vite 정적 서버로 DELETE 전송) 가능성을 줄임.
    - **이미지 로드 실패 대비 UX**: 게시글 내 이미지와 프로필 이미지에 `onError` 핸들러를 추가해 CDN/DNS 문제로 이미지 로드 실패 시 placeholder로 대체하도록 처리.
    - **삭제(DELETE) 흐름 디버깅**: 삭제 시 발생하던 500 에러(개발 환경에서 잘못된 baseURL로 전송되어 발생)를 자세히 로깅하도록 코드 보완(에러 응답의 status/data를 콘솔에 출력). 또한 클라이언트에서 삭제를 막고 있던 제한 로직(좋아요/댓글 유무 체크)을 제거하여 서버가 최종 권한/정책을 판단하게 변경함.
    - **라우팅 및 페이지 연결**: `/community/edit/:id` 라우트를 등록하고 `EditPostPage`를 연결함으로써 수정 버튼이 정상적으로 편집 페이지로 이동하도록 수정.
    - **디버깅 로그 추가**: `boardsService` 호출 결과와 FormData 항목들을 DEV 환경에서 콘솔에 찍어 네트워크 페이로드를 빠르게 검증할 수 있게 함.
    - **더미 데이터 제거/점검**: `src/pages/Community` 관련 코드에서 하드코딩된 더미 게시글은 제거되어 API 기반으로 읽도록 정리됨(목 데이터는 별도 영역에 없음).

-- **검증/권장 작업**:
    - `.env`에 `VITE_API_BASE_URL`을 정확히 설정하고(dev: `http://localhost:8080` 등), dev 서버 재시작 후 DELETE/POST 동작을 재검증할 것.
    - CDN/DNS 문제(`cdn.dapdap.com`)는 네트워크/인프라팀에 확인 요청 (DNS 레코드 또는 CDN 배포 상태 점검).

## 날짜: 2026-02-01

### 1. MyPage — 스크랩(저장)/좋아요 연동 및 UI 정비
- **대상 파일**: `src/api/interviewService.ts`, `src/utils/myPageStore.ts`, `src/pages/Study/StudyDetail.tsx`, `src/pages/MyPage/SavedProblems.tsx`, `src/pages/MyPage/LikedPosts.tsx`, `src/components/MyPage/SavedProblemItem.tsx`
- **변경 사항**:
    - 백엔드 API 명세(POST/DELETE `/learning/questions/{questionId}/scrap`)에 맞춰 프론트엔드 스크랩 등록/삭제 메서드 추가 및 호출 로직 구현.
    - `StudyDetail`에서 스크랩 토글(스크랩/해제) UI와 비동기 핸들러 추가.
    - 로컬 저장소 기반의 중앙 유틸 `myPageStore`(`dadap_saved_problems_v1`, `dadap_liked_posts_v1`) 생성: 저장/삭제, 조회 함수와 변경 시 커스텀 이벤트(`myPage:savedUpdated`, `myPage:likedUpdated`) 디스패치.
    - 마이페이지의 `SavedProblems`와 `LikedPosts` 페이지 구현/정비: 카드 레이아웃 통일, 실시간(이벤트 기반) 갱신, 페이지네이션(페이지당 7개) 적용.
    - `LikedPosts`에 게시글 직접 언라이크(하트) 버튼 추가, `SavedProblems`는 북마크(저장) 아이콘로 언세이브 처리 — `StudyDetail`의 아이콘/동작과 일관성 유지.

### 2. 기타 수정 및 주의사항
- 라우팅: 저장/좋아요에서 특정 글 보기로 이동할 때 사용하는 경로를 `/study/post/:id`로 정리해 경로 오류 수정.
- 타입 전용 import 문제(런타임 에러) 수정 및 스타일(퍼플 액센트) 정리, 페이지네이션 버튼 크기/스타일 조정.
- 현재 마이페이지 목록 데이터는 로컬스토리지 기반으로 동작합니다. 서버에서 '내가 저장한 항목'/'내가 좋아요한 글' 같은 전용 API가 제공되면 해당 API로 전환하는 것을 권장합니다.
- 개발환경 설정: `.env`에 `VITE_API_BASE_URL`을 추가하고(dev 예: `http://localhost:8080`) dev 서버를 재시작해야 백엔드 호출이 올바르게 동작합니다.

## 날짜: 2026-02-02

### 오늘(요약)
- MyPage 관련 동작 안정화 및 UI 일관성 개선 작업을 진행했습니다. 주요 내용은 로컬 영구 저장소의 사용자 스코프화, 상세/목록 뷰의 스크랩(북마크) 표시 강화, MyPage 목록의 삭제 동작 통일, 상세 조회수 위치 이동 및 중복 증가 방지 등입니다.

### 주요 변경 사항
- **MyPage per-user 로컬스토리지 & 이벤트 동기화**: `myPageStore`를 사용자별 키로 분리하고(마이그레이션 포함) `myPage:savedUpdated` / `myPage:likedUpdated` 이벤트로 컴포넌트 간 실시간 동기화를 구현했습니다.
- **스크랩 버튼 강조**: `StudyDetail`, `CommunityPage` 등 상세 페이지의 북마크 버튼에 좋아요와 유사한 시각 강조(진한 테두리, ring, 아이콘 채움)를 적용했습니다.
- **MyPage 목록 아이템의 삭제 아이콘 통일**: `LikedPosts`, `SavedProblems`, `MyPortfolio` 등에서 좋아요/저장 카운트 및 하트/북마크 버튼을 제거하고 삭제(Trash) 아이콘으로 통일해 삭제/언라이크 동작을 명확히 했습니다.
- **조회수 위치 이동 및 중복 방지**: 상세 페이지의 조회수를 헤더의 메타 영역으로 이동했고, 조회수 증가 호출을 한 번만 실행하도록 세션/타임스탬프 기반 중복 방지 로직을 강화했습니다.
- **런타임/문법 오류 수정**: 브라우저에서의 `require` 사용을 모두 `import()`로 대체했고, 일부 JSX 중첩/닫힘 오류를 수정해 빌드 에러를 제거했습니다.
- **로그인/로그아웃시 MyPage 재하이드레이트 트리거**: `authSlice`의 로그인/로그아웃 핸들러에서 커스텀 이벤트를 디스패치하도록 추가했습니다.

### 변경된 주요 파일 (요약)
- `src/utils/myPageStore.ts`
- `src/pages/Study/StudyDetail.tsx`
- `src/pages/Study/viewUtils.ts`
- `src/pages/Community/CommunityPage.tsx`
- `src/pages/MyPage/LikedPosts.tsx`
- `src/pages/MyPage/SavedProblems.tsx`
- `src/components/MyPage/SavedProblemItem.tsx`
- `src/pages/MyPage/MyPortfolio.tsx`
- `src/redux/slices/authSlice.ts`

---

### 추가 작업 (2026-02-02 세션)
- **목적**: `MyPage` 통계 표시를 백엔드 스펙(`/users/me/summary`)에 맞춰 연동하고, 데이터 없음/로딩 처리 및 디버깅 로그를 보강하여 UI가 정확히 표시되도록 안정화했습니다.
- **주요 변경 내용**:
    - `src/api/services/mypageService.ts`: `getUserSummary()` 메서드 추가 (`GET /users/me/summary`).
    - `src/pages/MyPage.tsx`: 백엔드 `summary.data`를 호출하여 네 개 통계 카드(`평균 STT`, `면접 총 횟수`, `연속 면접 일수`, `스크랩 수`)에 매핑하도록 구현.
        - 로딩 플래그(`isSummaryLoaded`) 추가: 응답 전에는 `-` 표시, 응답 후 필드가 `null`이면 0(또는 `0%`)으로 표시.
        - 오류/응답 디버깅 로그 추가: fetch 시작, 응답 객체, `setSummary` 호출, 그리고 Axios `error.response`(status, headers, data) 출력.
        - 최근 면접 점수 추출 로직 보완 및 카드 레이블 정리.
    - 프론트엔드 표시 로직 변경으로 초기값(0)이 실제 응답에 덮어쓰는 문제를 방지함.

- **디버깅 및 권장 작업**:
    - 개발 환경에서 `VITE_API_BASE_URL`이 비어있을 경우 Vite dev origin(5173)으로 요청이 가므로 `.env`에 `VITE_API_BASE_URL=http://localhost:8080` 설정 후 dev 서버 재시작 권장.
    - 백엔드에서 간헐적 500 에러가 발생한 기록이 있어(콘솔 `error.response.data`에 `{status:500, message:'서버 오류가 발생했습니다.'}`), 문제가 지속되면 백엔드 로그(Gradle/Docker)에서 스택트레이스 확인 필요.

    ## 날짜: 2026-02-03

    ### 1. Community — 디자인/아이콘/스크랩 처리 변경
    - **대상 파일**: `src/pages/Community/CommunityPage.tsx`
    - **변경 요약**:
        - 커뮤니티 목록을 학습 아카이브 스타일로 재구성: 카드형 배경(rounded/soft glass), 타이포그래피(타이틀 키우기), 상단 패딩 완화(`pt-48` → `pt-24`) 등으로 전체 레이아웃을 정리했습니다.
        - 상세 페이지 헤더: 타이틀 크기 조정 및 좋아요 버튼 스타일을 pill/rounded 형태로 개선해 시각적 균형을 맞췄습니다.
        - 스크랩(북마크) 관련 UI 및 상태를 제거(버튼/상태/이벤트 리스너/핸들러 삭제). 스크랩 로직은 더 이상 Community 상세에서 사용되지 않습니다.
        - 모든 아이콘(뒤로가기, 좋아요, 조회수, 페이지네비게이션 등)을 흰색(`text-white`)으로 고정하여 아이콘 색상 일관성을 맞췄습니다.
        - Markdown 렌더러의 `h3` 스타일을 파란 계열(`text-indigo-400`)로 변경해 '모범 답안' 등 섹션 타이틀이 강조되도록 했습니다.

    ### 2. MyPage — LikedPosts 항목 JSX 수정
    - **대상 파일**: `src/pages/MyPage/LikedPosts/components/LikedPostItem.tsx`
    - **변경 요약**:
        - `LikedPostItem` 컴포넌트의 JSX 문법 오류(인접한 JSX 요소 문제)를 수정하고, UI를 정리했습니다: 제목/메타 영역과 우측 액션(삭제, View)으로 구조화했습니다.
        - 좋아요(숫자) 표시를 제거하고 삭제(Trash) 아이콘과 'View' 버튼 레이아웃을 유지합니다.

    ### 3. 기타
    - 좋아요 로직(`boardsService.likeBoard`)과 리스트/상세 간의 네비게이션 동작은 변경하지 않았습니다 — 서버 호출과 local persist 동작은 그대로 유지됩니다.
    - 검증 권장: `npm run dev` 후 Community 목록/상세를 열어 아이콘 색상, h3 색상, 카드 스타일, 좋아요 버튼 동작(네트워크 호출)을 확인하세요.

    ---

    *기록자: 변경사항을 적용한 개발자 작업 로그 (간단 요약)*



