

# Common Project (Frontend)

React 19 및 Tailwind CSS v4 기반 최신 프론트엔드 개발 환경
Vite 7과 React Compiler 적용으로 성능 및 개발 생산성 극대화

## 🛠 System & Runtime
로컬 개발을 위해 필수적으로 갖춰야 할 기본 환경

| 구분 | 항목 (Item) | 버전 (Version) | 용도 (Purpose) | 버전 선정 이유 (Rationale) |
| :--- | :--- | :--- | :--- | :--- |
| **System** | **Node.js** | `v24.13.0` | 자바스크립트 런타임 | **최신 LTS.** Vite 7 및 최신 빌드 도구 성능 100% 활용 위한 V8 엔진 탑재 |
| **System** | **npm** | `v11.6.2` | 패키지 매니저 | **최신 버전.** 패키지 설치 속도 최적화 및 보안 업데이트 적용 |

<br/>

##  Core Tech Stack
`package.json`에 명시된 실제 프로젝트 구동 핵심 기술 스택

| 구분 | 패키지명 (Package) | 버전 (Exact) | 용도 (Purpose) | 버전 선정 이유 (Rationale) |
| :--- | :--- | :--- | :--- | :--- |
| **Framework** | **react** | `v19.2.0` | UI 라이브러리 | **React 19 최신 버전.** React Compiler 및 Server Actions 등 최신 아키텍처 지원 |
| **Framework** | **react-dom** | `v19.2.0` | 웹 렌더링 엔진 | React 19와 버전을 일치시켜 DOM 조작 성능 최적화 |
| **Router** | **react-router-dom** | `v7.12.0` | 페이지 라우팅 | **v7 최신 표준.** 기존 v6 대비 데이터 로딩(Loader) 및 타입 안전성이 강화된 최신 라우터 |
| **Lang** | **typescript** | `v5.9.3` | 메인 언어 | **v5.9 최신 버전.** React 19 타입 시스템 완벽 지원 및 빌드·추론 속도 향상 |
| **Build** | **vite** | `v7.2.4` | 빌드/개발 서버 | **차세대 번들러.** Webpack 대비 월등히 빠르며 React Compiler 플러그인 네이티브 지원 |
| **Style** | **tailwindcss** | `v4.1.18` | CSS 프레임워크 | **Oxide 엔진 탑재(v4).** 별도 config 파일 없이 CSS 파일 직접 설정 가능 및 빌드 속도 극대화 |
| **Compiler** | **babel-plugin-react-compiler** | `v1.0.0` | React 자동 최적화 | **React Compiler.** useMemo, useCallback 없이 렌더링 자동 최적화하여 코드 복잡도 제거 |
| **Lint** | **eslint** | `v9.39.1` | 코드 품질 검사 | **Flat Config 지원.** 최신 린팅 표준 적용하여 잠재적 문법 오류 사전 차단 |

<br/>

##  IDE Extensions (VS Code)
팀 간 코드 일관성과 생산성을 위해 설치 권장

| 구분 | 이름 (Name) | 필수 여부 | 용도 (Purpose) | 사용 이유 (Rationale) |
| :--- | :--- | :--- | :--- | :--- |
| **Extension** | **Tailwind CSS IntelliSense** | **필수** | 클래스 자동완성 및 미리보기 | **생산성 향상.** 수천 개 클래스명 암기 불필요 및 오타로 인한 스타일 깨짐 방지 |
| **Extension** | **Prettier - Code formatter** | **필수** | 코드 스타일 자동 정렬 | **협업 표준.** 저장 시 들여쓰기/줄바꿈 강제 통일하여 불필요한 Git 충돌 방지 |
| **Extension** | **ES7+ React Snippets** | 권장 | 리액트 코드 스니펫 | **보일러플레이트 제거.** 단축어로 컴포넌트 뼈대 1초 만에 생성하여 반복 작업 최소화 |

<br/>

##  Getting Started (Setup Guide)
프로젝트 초기 구축부터 실행까지의 단계별 가이드

### 1. 프로젝트 스캐폴딩 생성 (Create Project)
Vite 최신 버전을 사용하여 프로젝트 초기 뼈대 생성
```bash
npm create vite@latest

```

**[터미널 대화형 선택 과정]**

1. **Project name**: `common-project` 입력 후 엔터
2. **Select a framework**: `React` 선택
3. **Select a variant**: `TypeScript` 선택

### 2. 프로젝트 폴더 진입 및 기본 패키지 설치 (Init)

생성된 폴더로 이동하여 `package.json`의 기본 의존성 설치

```bash
cd common-project
npm install

```

### 3. 추가 라이브러리 설치 (Add Dependencies)

React Router(v7) 등 프로젝트 필수 라이브러리 추가

```bash
npm install react-router-dom

```

### 4. 스타일링 및 개발 도구 설치 (DevTools)

Tailwind CSS v4 및 Vite 연동 플러그인 설치 (개발 의존성)

```bash
npm install -D tailwindcss @tailwindcss/vite

```

### 5. 환경 설정 파일 적용 (Configuration)

설치된 도구들의 정상 작동을 위한 설정 파일 수정

**1) Vite 설정 (`vite.config.ts`)**
Tailwind 플러그인 등록 및 React Compiler 옵션 적용

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", {}]
        ],
      },
    }),
    tailwindcss(),
  ],
})

```

**2) CSS 설정 (`src/index.css`)**
기존 스타일 코드를 모두 제거하고 Tailwind 호출 구문 추가

```css
@import "tailwindcss";

```

### 6. 개발 서버 실행 (Run Server)

설정 완료 후 로컬 개발 서버 구동

```bash
npm run dev

```

### 7. 커밋 메시지 컨벤션 (Commit Message Convention)

커밋 메시지는 기본적으로 아래 형식을 따릅니다.

> **Type: Subject**

1. Type (유형)

| 타입 (Type) | 의미 (Description) |
| :--- | :--- |
| **feat** | 새로운 기능 추가 |
| **fix** | 버그 수정 |
| **docs** | 문서 수정 (README.md, 주석 등) |
| **style** | 코드 포맷 변경, 세미콜론 누락 등 (코드 수정 없는 경우) |
| **refactor** | 코드 리팩토링 (기능 변화 없이 가독성/구조 개선) |
| **test** | 테스트 코드 추가 및 리팩토링 |
| **chore** | 빌드 업무 수정, 패키지 매니저 설정, 프로젝트 초기 생성 등 |
| **build** | 빌드 관련 파일 수정, 외부 종속성 변경 |
| **ci** | CI 설정 파일 및 스크립트 수정 |


2. 규칙 (Rules)

- **제목은 50자 이내**로 작성하고 마지막에 마침표(.)를 붙이지 않습니다.
- **영문 제목**의 경우 첫 글자는 대문자로 시작하며, 과거형이 아닌 **명령문** 형태를 사용합니다.
- 본문이 필요한 경우, 제목과 본문 사이에 **한 줄의 빈칸**을 둡니다.


3. 예시 (Examples)
- `feat: 로그인 기능 구현`
- `fix: 메인 페이지 이미지 로딩 에러 수정`
- `chore: initial commit with create-react-app`
- `docs: README 프로젝트 설명 추가`