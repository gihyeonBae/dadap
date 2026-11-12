# DADAP API SPEC

# 1. 인증 (Auth)

### 1.1 회원가입

- Method: `POST`
- URL: `/auth/signup`
- Auth: None
- Description: 이메일/비밀번호/닉네임으로 회원가입

**Request Body (JSON)**

```json
{
  "email": "test@example.com",
  "password": "password123!",
  "nickname": "테스트유저";
}

```

**Fields**

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| email | String | O | 사용자 이메일 |
| password | String | O | 비밀번호 |
| nickname | String | O | 닉네임 |

**Response**

```json
{
  "status": 200,
  "message": "회원가입 완료",
  "data": null
}

```

---

### 1.1.1 닉네임 중복 체크 (회원가입)

- Method: `GET`
- URL: `/auth/nickname-available`
- Auth: None
- Description: 닉네임 사용 가능 여부 확인

**Query Parameters**

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| nickname | String | O | 확인할 닉네임 |

**Response**

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "available": true
  }
}

```

**Fields**

| 필드명 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| available | boolean | X | 사용 가능 여부 |

---

### 1.2 로그인

- Method: `POST`
- URL: `/auth/login`
- Auth: None
- Description: 이메일/비밀번호 로그인 및 토큰 발급

**Request Body (JSON)**

```json
{
  "email": "test@example.com",
  "password": "password123!"
}

```

**Response**

- `Authorization` 헤더에 Access Token
- `refresh` 쿠키에 Refresh Token

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "userId": 1,
    "email": "test@example.com",
    "nickname": "테스트유저",
    "role": "ROLE_USER",
    "accessToken": "ey...",
    "profileImageUrl": "<https://example.com/profile.jpg>"
  }
}

```

**Fields**

| 필드명 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| userId | Long | X | 사용자 ID |
| email | String | X | 이메일 |
| nickname | String | X | 닉네임 |
| role | String | X | 사용자 권한 (`ROLE_USER`, `ROLE_ADMIN`) |
| accessToken | String | X | Access Token |
| profileImageUrl | String | O | 프로필 이미지 URL |

---

### 1.3 토큰 재발급

- Method: `POST`
- URL: `/auth/reissue`
- Auth: None
- Description: Refresh Token으로 Access/Refresh 토큰 재발급

**Request**

- Cookie: `refresh=<refreshToken>`

**Response**

- `Authorization` 헤더에 새 Access Token
- `refresh` 쿠키에 새 Refresh Token

```json
{
  "status": 200,
  "message": "토큰이 재발급되었습니다.",
  "data": null
}

```

---

### 1.4 로그아웃

- Method: `POST`
- URL: `/auth/logout`
- Auth: Required
- Description: Refresh Token 삭제 및 쿠키 만료

**Response**

```json
{
  "status": 200,
  "message": "로그아웃 완료",
  "data": null
}

```

---

### 1.5 비밀번호 초기화 요청 (인증코드 발송)

- Method: `POST`
- URL: `/auth/password/reset`
- Auth: None
- Description: 이메일로 인증 코드 발송

**Request Body (JSON)**

```json
{
  "email": "test@example.com"
}

```

**Fields**

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| email | String | O | 가입된 사용자 이메일 |

**Response**

```json
{
  "status": 200,
  "message": "이메일로 인증 코드가 발송되었습니다.",
  "data": null
}

```

---

### 1.6 비밀번호 초기화 확인 (임시 비밀번호 발송)

- Method: `POST`
- URL: `/auth/password/reset-confirm`
- Auth: None
- Description: 인증코드 확인 후 임시 비밀번호 발송

**Request Body (JSON)**

```json
{
  "email": "test@example.com",
  "code": "123456"
}

```

**Fields**

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| email | String | O | 가입된 사용자 이메일 |
| code | String | O | 이메일로 받은 인증 코드 |

**Response**

```json
{
  "status": 200,
  "message": "임시 비밀번호가 이메일로 전송되었습니다.",
  "data": null
}

```

---

### 1.7 Github 소셜 로그인

- Method: `POST`
- URL: `/auth/github/doLogin`
- Auth: None
- Description: Github OAuth 코드로 로그인/회원가입

**Request Body (JSON)**

```json
{
  "code": "github_oauth_code"
}

```

**Fields**

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| code | String | O | Github OAuth 코드 |

**Response**

- 로그인과 동일한 `LoginResponse`

---

### 1.8 Google 소셜 로그인

- Method: `POST`
- URL: `/auth/google/doLogin`
- Auth: None
- Description: Google OAuth 코드로 로그인/회원가입

**Request Body (JSON)**

```json
{
  "code": "google_oauth_code"
}

```

**Fields**

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| code | String | O | Google OAuth 코드 |

**Response**

- 로그인과 동일한 `LoginResponse`

---

# 2. 사용자 (Users)

## 2.1 내 정보 조회

내 프로필 정보를 상세히 조회합니다.

- **Method:** `GET`
- **URL:** `/users/me`
- **Auth:** `Required`

### Response

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "userId": 1,
    "email": "test@example.com",
    "nickname": "테스트유저",
    "jobTitle": "BACKEND",
    "bio": "안녕하세요",
    "profileImageUrl": "[https://cdn.dapdap.com/](https://cdn.dapdap.com/)...",
    "createdAt": "2026-01-27T08:56:00",
    "updatedAt": "2026-01-27T08:56:00"
  }
}

```

### Fields

| 필드명 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| **userId** | Long | X | 사용자 고유 식별 ID |
| **email** | String | X | 사용자 이메일 계정 |
| **nickname** | String | X | 서비스 내 닉네임 |
| **jobTitle** | String | O | 직무 (Enum) |
| **bio** | String | O | 한 줄 자기소개 |
| **profileImageUrl** | String | O | 프로필 이미지 저장 경로 |
| **createdAt** | LocalDateTime | X | 계정 생성 일시 |
| **updatedAt** | LocalDateTime | X | 최근 정보 수정 일시 |

## 2.2 내 프로필 수정

닉네임, 직무, 소개글을 수정합니다. (원하는 필드만 보내는 부분 업데이트 지원)

- **Method:** `PATCH`
- **URL:** `/users/me`
- **Auth:** `Required`

### Request Body

```
{
  "nickname": "새닉네임",
  "jobTitle": "FRONTEND",
  "bio": "자기소개"
}

```

### Request Fields

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| **nickname** | String | X | 변경할 닉네임 (2~20자) |
| **jobTitle** | String | X | 변경할 직무 (Enum 문자열) |
| **bio** | String | X | 변경할 자기소개 (최대 100자) |

### Response

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "userId": 1,
    "email": "test@example.com",
    "nickname": "새닉네임",
    "jobTitle": "FRONTEND",
    "bio": "자기소개",
    "profileImageUrl": "[https://cdn.dapdap.com/](https://cdn.dapdap.com/)...",
    "updatedAt": "2026-01-27T08:56:00"
  }
}

```

## 2.3 닉네임 중복 체크 (마이페이지)

로그인된 사용자 기준으로 닉네임 사용 가능 여부를 확인합니다. (현재 자신의 닉네임은 사용 가능으로 반환됨)

- **Method:** `GET`
- **URL:** `/users/me/nickname-available`
- **Auth:** `Required`

### Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| **nickname** | String | O | 중복 여부를 확인할 닉네임 |

### Response

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "available": true
  }
}

```

## 2.4 프로필 이미지 업로드

사용자의 프로필 이미지를 서버에 업로드합니다.

- **Method:** `POST`
- **URL:** `/users/me/profile-image`
- **Auth:** `Required`
- **Content-Type:** `multipart/form-data`

### Request (Multipart)

| 파트명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| **file** | File | O | 업로드할 이미지 파일 (JPG, PNG 등) |

### Response

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "profileImageUrl": "[https://cdn.dapdap.com/](https://cdn.dapdap.com/)...",
    "updatedAt": "2026-01-27T08:56:00"
  }
}

```

## 2.5 프로필 이미지 삭제

등록된 프로필 이미지를 제거하고 URL을 `null`로 변경합니다.

- **Method:** `DELETE`
- **URL:** `/users/me/profile-image`
- **Auth:** `Required`

### Response

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "profileImageUrl": null,
    "updatedAt": "2026-01-27T08:56:00"
  }
}

```

## 2.6 비밀번호 변경

현재 비밀번호 확인 후 새로운 비밀번호로 변경합니다.

- **Method:** `PATCH`
- **URL:** `/users/me/password`
- **Auth:** `Required`

### Request Body

```
{
  "currentPassword": "oldPass123!",
  "newPassword": "newPass123!",
  "confirmPassword": "newPass123!"
}

```

### Response

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "success": true
  }
}

```

---

# 3. 인터뷰 (Interview)

## 3.1 인터뷰 생성

면접 세션을 생성합니다.

- **Method:** `POST`
- **URL:** `/api/interviews`
- **Auth:** `Required`

### Request Body

```
{
  "interviewType": "CS",
  "runMode": "PRACTICE",
  "categoryId": 1,
  "portfolioId": null,
  "targetQuestionCount": 5,
  "optionJson": "{ \"difficulty\": \"easy\" }"
}

```

### Fields

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| interviewType | String | O | CS, PORTFOLIO |
| runMode | String | O | PRACTICE, REAL |
| categoryId | Long | 조건 | CS면접일 때 필요 |
| portfolioId | Long | 조건 | PORTFOLIO면접일 때 사용 |
| targetQuestionCount | Integer | O | 총 질문 수 |
| optionJson | String | O | 옵션 (JSON 문자열) |

## 3.2 다음 질문 요청

다음 메인 질문을 요청합니다.

- **Method:** `POST`
- **URL:** `/api/interviews/{interviewId}/next-question`
- **Auth:** `Required`

### Response

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "interviewId": 123,
    "turnId": 456,
    "turnIndex": 1,
    "questionText": "JVM의 구조에 대해 설명해주세요.",
    "followUp": false,
    "parentTurnId": null
  }
}

```

## 3.3/3.4 답변 파일 업로드 (음성/영상)

- **음성:** `POST` `/api/interviews/{interviewId}/turns/{turnId}/upload-audio`
- **영상:** `POST` `/api/interviews/{interviewId}/turns/{turnId}/upload-video`

### Request (Multipart)

| 파트명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| audioFile/videoFile | File | O | 미디어 파일 |

## 3.5 턴 음성 분석 요청 (동기)

AI 음성 분석 및 피드백을 반환하며, 필요시 꼬리질문 정보를 포함합니다.

- **Method:** `POST`
- **URL:** `/api/interviews/{interviewId}/turns/{turnId}/analyze-audio`

### Response

```
{
  "status": 200,
  "message": "오디오 분석이 완료되었습니다.",
  "data": {
    "finished": false,
    "interviewId": 123,
    "turnId": 456,
    "answerText": "답변 내용...",
    "feedbackText": "피드백 내용...",
    "followUpTurn": true,
    "nextTurn": {
      "turnId": 457,
      "questionText": "꼬리 질문 내용...",
      "followUp": true
    }
  }
}

```

## 3.6 영상 분석 업로드 (MediaPipe)

MediaPipe 분석 결과 JSON을 업로드하고 비동기 분석을 요청합니다.

- **Method:** `POST`
- **URL:** `/api/interviews/{interviewId}/turns/{turnId}/video-analysis`

### Response

```
{
  "status": 202,
  "message": "VIDEO_ANALYSIS_ACCEPTED",
  "data": {
    "status": "PROCESSING",
    "jobId": 999
  }
}

```

## 3.7 영상 분석 결과 조회

영상 분석 상태 및 최종 결과를 조회합니다.

- **Method:** `GET`
- **URL:** `/api/interviews/{interviewId}/turns/{turnId}/video-analysis`

### Response (Done)

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "status": "DONE",
    "totalScore": 88,
    "feedbackTitle": "자신감 넘치는 미소가 돋보이는 지원자",
    "detailedFeedback": ["시선 처리가 안정적입니다.", "자세가 바릅니다."],
    "coachingMessage": "코칭 팁..."
  }
}

```

## 3.8 턴 영상 분석 시작 (Legacy)

- **Method:** `POST`
- **URL:** `/api/interviews/{interviewId}/turns/{turnId}/analyze-video`
- **Status:** `400 BAD_REQUEST` (사용 중지됨)

---

# 4. 인터뷰 조회 (Query)

## 4.1 내 면접 목록 조회

로그인 유저의 면접 목록을 조회합니다.

- **Method:** `GET`
- **URL:** `/api/interviews`
- **Auth:** `Required`

### Response

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "interviews": [
      {
        "interviewId": 123,
        "interviewType": "CS",
        "runMode": "PRACTICE",
        "status": "FINISHED",
        "targetQuestionCount": 5,
        "askedCount": 5,
        "startedAt": "2026-01-27T08:56:00",
        "finishedAt": "2026-01-27T09:10:00",
        "createdAt": "2026-01-27T08:55:00"
      }
    ]
  }
}

```

## 4.2 인터뷰 턴 목록 조회

특정 면접의 턴 목록을 상세히 조회합니다. (오디오/비디오 키는 Presigned URL 형태로 제공됩니다.)

- **Method:** `GET`
- **URL:** `/api/interviews/{interviewId}/turns`
- **Auth:** `Required`

### Path Variables

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| **interviewId** | Long | O | 면접 ID |

### Response

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "interviewId": 123,
    "status": "FINISHED",
    "targetQuestionCount": 5,
    "askedCount": 5,
    "turns": [
      {
        "turnId": 456,
        "turnIndex": 1,
        "followUp": false,
        "parentTurnId": null,
        "questionText": "JVM의 구조에 대해 설명해주세요.",
        "answerText": "제가 알기로 JVM은...",
        "feedbackText": "답변이 다소 짧습니다...",
        "sttScore": 85,
        "analysisStatus": "DONE",
        "audioKey": "https://s3.../presigned-audio-url",
        "videoKey": "https://s3.../presigned-video-url"
      }
    ]
  }
}

```

### Turn Item Fields

| 필드명 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| **turnId** | Long | X | 턴 고유 식별 ID |
| **turnIndex** | int | X | 질문 순서 (1부터 시작) |
| **followUp** | boolean | X | 꼬리질문 여부 |
| **parentTurnId** | Long | O | 부모 턴 ID (꼬리질문일 경우) |
| **questionText** | String | X | 질문 내용 |
| **answerText** | String | O | 사용자 답변 STT 결과 |
| **feedbackText** | String | O | 질문에 대한 피드백 |
| **sttScore** | Integer | O | STT 기반 답변 점수 |
| **analysisStatus** | String | X | 분석 상태 (PENDING, RUNNING, DONE, FAILED) |
| **audioKey** | String | O | 오디오 파일 접근용 Presigned URL |
| **videoKey** | String | O | 영상 파일 접근용 Presigned URL |

## 4.3 인터뷰 상세 조회 (턴 + 영상 분석)

면접 결과 전체와 각 턴의 최신 영상 분석 결과를 한 번에 조회합니다.

- **Method:** `GET`
- **URL:** `/api/interviews/{interviewId}/result`
- **Auth:** `Required`

### Response

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "interviewId": 123,
    "status": "FINISHED",
    "targetQuestionCount": 5,
    "askedCount": 5,
    "turns": [
      {
        "turnId": 456,
        "turnIndex": 1,
        "followUp": false,
        "parentTurnId": null,
        "questionText": "JVM의 구조에 대해 설명해주세요.",
        "answerText": "제가 알기로 JVM은...",
        "feedbackText": "답변이 다소 짧습니다...",
        "sttScore": 85,
        "analysisStatus": "DONE",
        "audioUrl": "https://s3.../presigned-audio-url",
        "videoUrl": "https://s3.../presigned-video-url",
        "videoAnalysis": {
          "jobId": 999,
          "status": "DONE",
          "score": 88,
          "feedbackTitle": "자신감 넘치는 미소가 돋보이는 지원자",
          "detailedFeedback": [
            "시선 처리가 85점으로 매우 안정적이며, 면접관과 아이컨택이 잘 되고 있습니다."
          ],
          "coachingMessage": "지금처럼 밝은 표정을 유지하되...",
          "errorMessage": null
        }
      }
    ]
  }
}

```

---

# 5. 리포트 (Report)

인터뷰 종료 후 생성되는 총괄 리포트 관련 API입니다.

## 5.1 총괄 리포트 생성

인터뷰 데이터를 바탕으로 AI 분석 리포트를 생성합니다.

- **Method:** `POST`
- **URL:** `/api/interviews/{interviewId}/report/generate`
- **Auth:** `Required`
- **Description:** 특정 인터뷰의 총괄 리포트를 생성합니다.

### Path Variables

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `interviewId` | `Long` | O | 리포트를 생성할 면접 ID |

### Response

```
{
  "status": 200,
  "message": "총괄 리포트를 생성했습니다.",
  "data": {
    "interviewId": 123,
    "status": "DONE",
    "totalScore": 85,
    "totalFeedback": "전반적으로 CS 지식은 훌륭하지만 실무 경험에 대한 설명이 다소 부족합니다.",
    "summaryJson": "{ ... }",
    "fullVideoKey": null,
    "fullAudioKey": "interviews/123/report/full_audio.mp3"
  }
}

```

## 5.2 총괄 리포트 조회

이미 생성된 총괄 리포트 정보를 조회합니다.

- **Method:** `GET`
- **URL:** `/api/interviews/{interviewId}/report`
- **Auth:** `Required`
- **Description:** 특정 인터뷰의 총괄 리포트 상세 정보를 조회합니다.

### Path Variables

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `interviewId` | `Long` | O | 조회할 면접 ID |

### Response

`5.1 리포트 생성` 응답과 동일한 `ReportResponse`를 반환합니다.

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `interviewId` | `Long` | 면접 고유 ID |
| `status` | `String` | 리포트 생성 상태 (READY, PROCESSING, DONE, FAIL) |
| `totalScore` | `Integer` | 종합 점수 (0~100) |
| `totalFeedback` | `String` | AI 종합 피드백 |
| `summaryJson` | `String(JSON)` | 상세 분석 데이터가 포함된 JSON 문자열 |
| `fullVideoKey` | `String` | 전체 영상 S3 키 (없을 경우 null) |
| `fullAudioKey` | `String` | 전체 음성 S3 키 |

---

# 6. 분석 작업 (Analysis Jobs)

## 6.1 분석 작업 상태 조회

비동기로 진행되는 분석 작업의 현재 상태를 조회합니다.

### API 개요

- **Method**: `GET`
- **URL**: `/api/analysis-jobs/{jobId}`
- **Auth**: `Required` (인증 필요)

### Path Variables

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| **jobId** | `Long` | O | 조회할 분석 작업 ID |

### Response Example

```
{
  "status": 200,
  "message": "OK",
  "data": {
    "jobId": 789,
    "type": "VIDEO",
    "status": "DONE",
    "resultJson": "{...}",
    "score": 90,
    "errorMessage": null
  }
}

```

### Data Fields Specification

| 필드명 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| **jobId** | `Long` | X | 작업 고유 식별자 |
| **type** | `String` | X | 작업 유형 (예: `VIDEO`) |
| **status** | `String` | X | 작업 상태 (`QUEUED`, `RUNNING`, `DONE`, `FAILED`) |
| **resultJson** | `String` | O | 결과 데이터 (JSON 문자열 형식) |
| **score** | `Integer` | O | 분석 결과 점수 |
| **errorMessage** | `String` | O | 작업 실패 시 상세 오류 메시지 |

---

# 7. 학습 (Learning)

## 7.1 질문 목록 조회

질문 목록 페이지 정보를 조회합니다.

### API 개요

- **Method**: `GET`
- **URL**: `/learning/questions`
- **Auth**: `None`

### Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| **categoryId** | `Long` | X | 카테고리 ID |
| **page** | `int` | X | 페이지 (기본값: 0) |
| **size** | `int` | X | 페이지 크기 (기본값: 20) |

### Response Example

```
{
  "items": [
    {
      "questionId": 1,
      "title": "JVM의 구조에 대해 설명해주세요.",
      "difficulty": 3,
      "parentIId": null
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5
}

```

### Response Fields

| 필드명 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| **items** | `List` | X | 질문 목록 |
| **page** | `int` | X | 현재 페이지 |
| **size** | `int` | X | 페이지 크기 |
| **totalElements** | `long` | X | 전체 질문 개수 |
| **totalPages** | `int` | X | 총 페이지 수 |

### Question Item Fields (items 내부)

| 필드명 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| **questionId** | `Long` | X | 질문 고유 ID |
| **title** | `String` | X | 질문 제목 |
| **difficulty** | `int` | X | 난이도 |
| **parentIId** | `Long` | O | 부모 질문 ID (필드명 유의: `parentIId`) |

## 7.2 질문 상세 조회

특정 질문의 상세 내용을 조회합니다.

### API 개요

- **Method**: `GET`
- **URL**: `/learning/questions/{questionId}`
- **Auth**: `None`

### Path Variables

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| **questionId** | `Long` | O | 조회할 질문 ID |

### Response Example

```
{
  "questionId": 1,
  "difficulty": 3,
  "parentId": null,
  "content": "JVM의 메모리 구조와 실행 과정에 대해 상세히 설명해주세요.",
  "modelAnswer": "JVM은 크게 클래스 로더..."
}

```

### Response Fields

| 필드명 | 타입 | Nullable | 설명 |
| --- | --- | --- | --- |
| **questionId** | `Long` | X | 질문 고유 ID |
| **difficulty** | `int` | X | 난이도 |
| **parentId** | `Long` | O | 부모 질문 ID |
| **content** | `String` | X | 질문 상세 내용 |
| **modelAnswer** | `String` | X | 모범 답안 내용 |

---

## API 개요

프론트 개발자가 바로 용도를 파악할 수 있도록, 각 API의 화면/플로우 기준 역할을 조금 더 자세히 설명합니다.

### 인증 (Auth)

- `POST /auth/signup`: 회원가입 폼 제출. 성공 시 사용자 생성 완료.
- `GET /auth/nickname-available`: 회원가입/프로필 수정 시 닉네임 사용 가능 여부 확인.
- `POST /auth/login`: 로그인 폼 제출. 응답 헤더에 Access Token, 쿠키에 Refresh Token 설정.
- `POST /auth/reissue`: Access Token 만료 시 Refresh Token으로 재발급.
- `POST /auth/logout`: 로그아웃 처리(Refresh Token 폐기).
- `POST /auth/password/reset`: 비밀번호 찾기에서 이메일 인증코드 발송 요청.
- `POST /auth/password/reset-confirm`: 인증코드 확인 후 임시 비밀번호 이메일 발송.
- `POST /auth/github/doLogin`: GitHub OAuth 로그인 처리(신규면 회원가입).
- `POST /auth/google/doLogin`: Google OAuth 로그인 처리(신규면 회원가입).

### 사용자 (Users)

- `GET /users/me`: 마이페이지 진입 시 내 프로필 정보 조회.
- `PATCH /users/me`: 마이페이지 프로필 수정(닉네임/직무/소개).
- `GET /users/me/nickname-available`: 마이페이지에서 닉네임 중복 확인.
- `POST /users/me/profile-image`: 프로필 이미지 업로드 후 URL 갱신.
- `DELETE /users/me/profile-image`: 프로필 이미지 삭제(기본 이미지로 대체).
- `PATCH /users/me/password`: 마이페이지 비밀번호 변경.

### 인터뷰 (Interview)

- `POST /api/interviews`: 면접 시작 버튼 클릭 시 새 면접 세션 생성.
- `POST /api/interviews/{interviewId}/next-question`: 다음 질문 요청(메인/꼬리 질문 생성).
- `POST /api/interviews/{interviewId}/turns/{turnId}/upload-audio`: 특정 턴 답변 음성 파일 업로드.
- `POST /api/interviews/{interviewId}/turns/{turnId}/upload-video`: 특정 턴 답변 영상 파일 업로드.
- `POST /api/interviews/{interviewId}/turns/{turnId}/analyze-audio`: 음성 분석 요청 후 바로 피드백/다음 질문 반환.
- `POST /api/interviews/{interviewId}/turns/{turnId}/video-analysis`: MediaPipe JSON 업로드 후 비동기 영상 분석 요청.
- `GET /api/interviews/{interviewId}/turns/{turnId}/video-analysis`: 영상 분석 진행 상태/결과 폴링.
- `POST /api/interviews/{interviewId}/turns/{turnId}/analyze-video`: 레거시 영상 분석 시작 API(현재 사용 안 함).

### 인터뷰 조회 (Query)

- `GET /api/interviews`: 마이페이지 면접 목록 조회(카드/리스트 렌더링용).
- `GET /api/interviews/{interviewId}/turns`: 면접 상세 페이지에서 턴 목록(질문/답변/피드백 요약) 조회.
- `GET /api/interviews/{interviewId}/result`: 면접 상세 결과 페이지에서 턴 + 최신 영상 분석 결과까지 조회.

### 리포트 (Report)

- `POST /api/interviews/{interviewId}/report/generate`: 면접 종료 후 총괄 리포트 생성 요청.
- `GET /api/interviews/{interviewId}/report`: 총괄 리포트 조회(생성 완료 후 재조회 포함).

### 분석 작업 (Analysis Jobs)

- `GET /api/analysis-jobs/{jobId}`: 비동기 분석 작업의 상태/결과 확인(폴링용).

### 스토리지 (Storage)

- `POST /api/storage/test/presign-download`: 테스트/관리용 Presigned Download URL 발급.
- `POST /api/storage/test/upload-audio`: 테스트용 음성 업로드.
- `POST /api/storage/test/upload-video`: 테스트용 영상 업로드.

### 학습 (Learning)

- `GET /learning/questions`: 학습 탭 질문 목록 조회(페이징/카테고리 필터).
- `GET /learning/questions/{questionId}`: 학습 질문 상세 조회.

### 테스트 (Test Only)

- `/api/test/*`: 에러 케이스/응답 형식 확인용 테스트 엔드포인트 모음.

---

# 8. Boards controller 요청/응답 예시

아래 예시는 `GlobalApiResponse` 형식(`status`, `message`, `data`) 기준입니다.

추가 규칙:

- 게시글 수정/삭제/이미지 업로드는 **작성자 본인만** 가능합니다.
- 댓글 삭제는 **작성자 본인만** 가능합니다.
- `liked`는 **로그인 사용자 기준**이며 비로그인 시 `false`입니다.

## 8.1. 게시글 목록 조회

- 요청: `GET /boards?sort=latest`
- sort 값: `latest` | `likes` | `views` (기본 `latest`)
- 응답 예시

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "posts": [
      {
        "postId": 10,
        "title": "면접 준비",
        "authorName": "kim",
        "views": 123,
        "likes": 7,
        "liked": true,
        "createdAt": "2026-01-27T12:34:56",
        "updatedAt": "2026-01-27T13:00:00"
      }
    ]
  }
}

```

## 8.2. 게시글 생성

- 요청: `POST /boards`
- Content-Type: `multipart/form-data`
- 파트:
    - `req` (JSON): `title`, `content`, `imageUrl`(선택)
    - `imageFile` (파일, 선택)
- 참고:
    - `imageFile`이 있으면 서버가 업로드 후 이미지 URL을 저장합니다.
    - `imageFile`이 없으면 `imageUrl` 값을 그대로 저장합니다.
- 요청 예시 (req JSON)

```json
{
  "title": "첫 글입니다",
  "content": "내용입니다",
  "imageUrl": "https://example.com/images/board-1.png"
}

```

- 응답 예시

```json
{
  "status": 201,
  "message": "게시글이 생성되었습니다",
  "data": {
    "postId": 11,
    "title": "첫 글입니다",
    "authorName": "kim",
    "content": "내용입니다",
    "imageUrl": "https://example.com/images/board-1.png",
    "views": 0,
    "likes": 0,
    "liked": false,
    "createdAt": "2026-01-27T12:40:00",
    "updatedAt": "2026-01-27T12:40:00",
    "comments": []
  }
}

```

## 8.3. 게시글 상세 조회

- 요청: `GET /boards/{postId}`
- 응답 예시

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "postId": 10,
    "title": "면접 준비",
    "authorName": "kim",
    "content": "면접을 어떻게 준비해야 할까요?",
    "imageUrl": null,
    "views": 124,
    "likes": 7,
    "liked": true,
    "createdAt": "2026-01-27T12:34:56",
    "updatedAt": "2026-01-27T13:00:00",
    "comments": [
      {
        "commentId": 100,
        "parentCommentId": null,
        "authorName": "lee",
        "content": "좋은 정보 감사합니다",
        "createdAt": "2026-01-27T13:10:00",
        "replies": [
          {
            "commentId": 101,
            "parentCommentId": 100,
            "authorName": "kim",
            "content": "도움이 되셨다니 감사합니다",
            "createdAt": "2026-01-27T13:12:00",
            "replies": []
          }
        ]
      }
    ]
  }
}

```

## 8.4. 게시글 수정

- 요청: `PATCH /boards/{postId}`
- Content-Type: `multipart/form-data`
- 파트:
    - `req` (JSON): `title`, `content`, `imageUrl`(선택)
    - `imageFile` (파일, 선택)
- 참고:
    - `imageFile`이 있으면 서버가 업로드 후 이미지 URL을 저장합니다.
    - `imageFile`이 없으면 `imageUrl` 값을 사용합니다.
    - `imageFile`과 `imageUrl`이 모두 없으면 기존 이미지를 유지합니다.
- 요청 예시 (req JSON)

```json
{
  "title": "면접 준비(수정)",
  "content": "내용을 업데이트했습니다",
  "imageUrl": "https://example.com/images/board-1-updated.png"
}

```

- 응답 예시

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "postId": 10,
    "title": "면접 준비(수정)",
    "authorName": "kim",
    "content": "내용을 업데이트했습니다",
    "imageUrl": "https://example.com/images/board-1-updated.png",
    "views": 124,
    "likes": 7,
    "liked": true,
    "createdAt": "2026-01-27T12:34:56",
    "updatedAt": "2026-01-27T13:30:00",
    "comments": []
  }
}

```

## 8.5. 게시글 삭제

- 요청: `DELETE /boards/{postId}`
- 응답 예시

```json
{
  "status": 204,
  "message": "게시글이 삭제되었습니다",
  "data": null
}

```

## 8.6. 게시글 좋아요

- 요청: `POST /boards/{postId}/like`
- 응답 예시

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "postId": 10,
    "views": 124,
    "likes": 8,
    "liked": true
  }
}

```

## 8.7. 댓글 작성

- 요청: `POST /boards/{postId}/comments`
- 요청 예시

```json
{
  "content": "질문 있어요",
  "parentCommentId": null
}

```

- 응답 예시

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "commentId": 200,
    "parentCommentId": null,
    "authorName": "park",
    "content": "질문 있어요",
    "createdAt": "2026-01-27T14:00:00",
    "replies": []
  }
}

```

## 8.8. 댓글 삭제

- 요청: `DELETE /boards/{postId}/comments/{commentId}`
- 응답 예시

```json
{
  "status": 204,
  "message": "댓글이 삭제되었습니다",
  "data": null
}

```

---

# 9. 포트폴리오 관련

[API] 포트폴리오 분석 및 질문 조회

## 9.1. 포트폴리오 업로드 및 AI 분석 요청

사용자가 포트폴리오 파일을 업로드하면, 서버가 이를 S3에 저장하고 AI 분석을 수행한 뒤 DB에 저장합니다.
**분석이 완료될 때까지(약 30~60초) 응답을 대기해야 하는 동기(Synchronous) API입니다.**

- **URL:** `/api/v1/portfolios`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`

### 📥 Request (Form Data)

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | `File` | **Yes** | 분석할 포트폴리오 파일 (PDF, DOCX, TXT) |
| `userId` | `String` | **Yes** | 사용자 ID (Long 타입으로 파싱 가능한 숫자 문자열) |
| `title` | `String` | No | 포트폴리오 제목 (미입력 시 파일명 사용) |

### 📤 Response (200 OK)

분석 및 저장이 완료되면 생성된 `portfolioId`를 반환합니다.
(질문 목록은 `portfolioId`를 이용해 **조회 API**로 별도 호출해야 합니다.)

```
{
  "message": "분석이 완료되었습니다.",
  "portfolioId": 105
}

```

## 9.2. 포트폴리오 질문 목록 조회

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
            },
            {
              "id": 12,
              "content": "Redis 장애 발생 시 DB 부하를 막기 위한 대책은 무엇인가요?",
              "intent": "장애 대응 능력 검증",
              "topic": null,
              "depth": 2,
              "children": []
            }
          ]
        }
      ]
    },
    // ... (총 9개 세트 반복)
  ]
}

```

## 9.3. 에러 코드 (Error Codes)

공통적으로 발생할 수 있는 에러 상황입니다.

| Status | Code | Description | 해결 방법 |
| --- | --- | --- | --- |
| `400` | `BAD_REQUEST` | `업로드 파일이 비어있습니다.` | 파일이 정상적으로 선택되었는지 확인 |
| `400` | `BAD_REQUEST` | `지원하지 않는 파일 형식입니다.` | PDF, DOCX, TXT 파일인지 확인 |
| `400` | `BAD_REQUEST` | `파일에서 텍스트를 추출할 수 없습니다.` | 이미지 PDF나 스캔본이 아닌지 확인 |
| `404` | `NOT_FOUND` | `해당 유저가 없습니다.` | `userId`가 올바른지 확인 |
| `404` | `NOT_FOUND` | `해당 포트폴리오가 없습니다.` | `portfolioId`가 올바른지 확인 |
| `500` | `INTERNAL_SERVER_ERROR` | `AI 분석 실패 또는 빈 응답` | AI 서버 상태 확인 (타임아웃 등) |