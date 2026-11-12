# DapDap API 명세서 (컨트롤러 기준)

이 문서는 현재 백엔드 컨트롤러 구현을 기준으로 작성되었습니다.
대부분의 응답은 `GlobalApiResponse<T>`로 래핑됩니다.

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    // API별 응답 데이터
  }
}
```

예외
- `/learning/**`는 `GlobalApiResponse`로 래핑되지 않습니다.

공통
- Auth: `Required`인 경우 `Authorization: Bearer <accessToken>` 필요
- Content-Type: JSON 요청은 `application/json`
- 날짜/시간 필드는 ISO-8601 문자열로 내려옵니다.

에러 응답 표준
- 대부분의 에러는 `GlobalApiResponse<Void>` 형태로 내려옵니다.
- `/learning/**`는 성공 응답은 래핑되지 않지만, 에러는 동일한 표준을 따릅니다.

```json
{
  "status": 400,
  "message": "잘못된 요청입니다.",
  "data": null
}
```

주요 에러 코드

| HTTP Status | 상황 | message 예시 |
| --- | --- | --- |
| 400 | 잘못된 파라미터/타입 불일치 | "잘못된 요청입니다.", "요청 값의 타입이 올바르지 않습니다." |
| 401 | 인증 필요 | "인증이 필요합니다." |
| 403 | 권한 없음 | "접근 권한이 없습니다." |
| 404 | 리소스 없음 | "대상을 찾을 수 없습니다." |
| 409 | 중복 | "이미 존재하는 데이터입니다." |
| 422 | Validation 실패 | "유효성 검증에 실패했습니다." |
| 500 | 서버 내부 오류 | "서버 오류가 발생했습니다." |

Validation 에러 메시지 형식
- `field: message` 형태가 `, `로 연결됩니다.
- 예: `"nickname: nickname must be 2-20 characters., bio: bio must be 0-100 characters."`

---

## 1. 인증 (Auth)

### 1.1 회원가입
- Method: `POST`
- URL: `/auth/signup`
- Auth: None
- Description: 이메일/비밀번호/닉네임으로 회원가입

Request Body (JSON)
```json
{
  "email": "test@example.com",
  "password": "password123!",
  "nickname": "테스트유저"
}
```

Fields

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| email | String | O | 사용자 이메일 |
| password | String | O | 비밀번호 |
| nickname | String | O | 닉네임 |

Response
```json
{
  "status": 200,
  "message": "회원가입 완료",
  "data": null
}
```

---

### 1.2 닉네임 중복 체크 (회원가입)
- Method: `GET`
- URL: `/auth/nickname-available`
- Auth: None
- Description: 닉네임 사용 가능 여부 확인

Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| nickname | String | O | 확인할 닉네임 |

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "available": true
  }
}
```

Fields

| 필드명 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| available | boolean | X | 사용 가능 여부 |

---

### 1.3 로그인
- Method: `POST`
- URL: `/auth/login`
- Auth: None
- Description: 이메일/비밀번호 로그인 및 토큰 발급

Request Body (JSON)
```json
{
  "email": "test@example.com",
  "password": "password123!"
}
```

Response
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
    "profileImageUrl": "https://example.com/profile.jpg"
  }
}
```

Fields

| 필드명 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| userId | Long | X | 사용자 ID |
| email | String | X | 이메일 |
| nickname | String | X | 닉네임 |
| role | String | X | 사용자 권한 (`ROLE_USER`, `ROLE_ADMIN`) |
| accessToken | String | X | Access Token |
| profileImageUrl | String | O | 프로필 이미지 URL |

---

### 1.4 토큰 재발급
- Method: `POST`
- URL: `/auth/reissue`
- Auth: None (refresh cookie 필요)
- Description: Refresh Token으로 Access/Refresh 토큰 재발급

Request
- Cookie: `refresh=<refreshToken>`

Response
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

### 1.5 로그아웃
- Method: `POST`
- URL: `/auth/logout`
- Auth: Required
- Description: Refresh Token 삭제 및 쿠키 만료

Response
```json
{
  "status": 200,
  "message": "로그아웃 완료",
  "data": null
}
```

---

### 1.6 비밀번호 초기화 요청 (인증코드 발송)
- Method: `POST`
- URL: `/auth/password/reset`
- Auth: None
- Description: 이메일로 인증 코드 발송

Request Body (JSON)
```json
{
  "email": "test@example.com"
}
```

Fields

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| email | String | O | 가입된 사용자 이메일 |

Response
```json
{
  "status": 200,
  "message": "이메일로 인증 코드가 발송되었습니다.",
  "data": null
}
```

---

### 1.7 비밀번호 초기화 확인 (임시 비밀번호 발송)
- Method: `POST`
- URL: `/auth/password/reset-confirm`
- Auth: None
- Description: 인증코드 확인 후 임시 비밀번호 발송

Request Body (JSON)
```json
{
  "email": "test@example.com",
  "code": "123456"
}
```

Fields

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| email | String | O | 가입된 사용자 이메일 |
| code | String | O | 이메일로 받은 인증 코드 |

Response
```json
{
  "status": 200,
  "message": "임시 비밀번호가 이메일로 전송되었습니다.",
  "data": null
}
```

---

### 1.8 Github 소셜 로그인
- Method: `POST`
- URL: `/auth/github/doLogin`
- Auth: None
- Description: Github OAuth 코드로 로그인/회원가입

Request Body (JSON)
```json
{
  "code": "github_oauth_code"
}
```

Response
- 로그인과 동일한 `LoginResponse`

---

### 1.9 Google 소셜 로그인
- Method: `POST`
- URL: `/auth/google/doLogin`
- Auth: None
- Description: Google OAuth 코드로 로그인/회원가입

Request Body (JSON)
```json
{
  "code": "google_oauth_code"
}
```

Response
- 로그인과 동일한 `LoginResponse`

---

## 2. 사용자 (Users)

### 2.1 내 정보 조회
- Method: `GET`
- URL: `/users/me`
- Auth: Required
- Description: 내 프로필 정보 조회

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "userId": 1,
    "email": "test@example.com",
    "nickname": "테스트유저",
    "jobTitle": "BACKEND",
    "bio": "안녕하세요",
    "profileImageUrl": "https://cdn.dapdap.com/...",
    "createdAt": "2026-01-27T08:56:00",
    "updatedAt": "2026-01-27T08:56:00"
  }
}
```

---

### 2.2 내 프로필 수정
- Method: `PATCH`
- URL: `/users/me`
- Auth: Required
- Description: 닉네임/직무/소개 수정 (필드별 부분 업데이트)

Request Body (JSON)
```json
{
  "nickname": "새닉네임",
  "jobTitle": "FRONTEND",
  "bio": "자기소개"
}
```

---

### 2.3 닉네임 중복 체크 (마이페이지)
- Method: `GET`
- URL: `/users/me/nickname-available`
- Auth: Required
- Description: 로그인 사용자 기준으로 닉네임 사용 가능 여부 확인 (현재 닉네임은 사용 가능으로 처리)

---

### 2.4 프로필 이미지 업로드
- Method: `POST`
- URL: `/users/me/profile-image`
- Auth: Required
- Description: 프로필 이미지 업로드

---

### 2.5 프로필 이미지 삭제
- Method: `DELETE`
- URL: `/users/me/profile-image`
- Auth: Required
- Description: 프로필 이미지 제거 (URL null)

---

### 2.6 비밀번호 변경
- Method: `PATCH`
- URL: `/users/me/password`
- Auth: Required
- Description: 비밀번호 변경

---

### 2.7 마이페이지 게시글 목록 조회 (내 글/좋아요)
- Method: `GET`
- URL: `/users/me/boards`
- Auth: Required
- Description: 마이페이지에서 내 게시글(`mine`) 또는 좋아요한 게시글(`liked`) 목록 조회

Query Parameters

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| type | String | X | `mine`(기본), `liked` |

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "type": "liked",
    "posts": [
      {
        "postId": 10,
        "title": "첫 번째 글",
        "excerpt": "게시글 내용 요약...",
        "authorName": "alice",
        "imageUrl": "https://cdn.dapdap.com/boards/user-1/xxx.png",
        "views": 3,
        "likes": 2,
        "commentCount": 1,
        "liked": true,
        "createdAt": "2026-01-27T12:00:00",
        "updatedAt": "2026-01-27T12:05:00",
        "likedAt": "2026-01-29T11:03:22"
      }
    ]
  }
}
```

Fields (`posts` item)

| 필드명 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| postId | Long | X | 게시글 ID |
| title | String | X | 제목 |
| excerpt | String | O | 본문 요약 |
| authorName | String | X | 작성자 닉네임 |
| imageUrl | String | O | 이미지 URL |
| views | long | X | 조회수 |
| likes | long | X | 좋아요 수 |
| commentCount | long | X | 댓글 수 |
| liked | boolean | X | 내가 좋아요 했는지 |
| createdAt | LocalDateTime | X | 생성 시간 |
| updatedAt | LocalDateTime | X | 수정 시간 |
| likedAt | LocalDateTime | O | 좋아요 누른 시간 (`type=liked` 일 때만) |

---

## 3. 인터뷰 (Interview)

### 3.1 인터뷰 생성
- Method: `POST`
- URL: `/api/interviews`
- Auth: Required
- Description: 면접 세션 생성

Request Body (JSON)
```json
{
  "interviewType": "CS",
  "runMode": "PRACTICE",
  "categoryId": 1,
  "portfolioId": null,
  "targetQuestionCount": 5,
  "optionJson": "{\"timeLimitSec\":120}"
}
```

Fields

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| interviewType | String | O | `CS` 또는 `PORTFOLIO` |
| runMode | String | O | `PRACTICE` 또는 `REAL` |
| categoryId | Long | 조건부 | CS 면접이면 필수 |
| portfolioId | Long | 조건부 | PORTFOLIO 면접이면 선택(또는 필수 정책) |
| targetQuestionCount | Integer | O | 총 질문 수(꼬리질문 포함) |
| optionJson | String | X | 선택 옵션 JSON 문자열 |

Response
```json
{
  "status": 201,
  "message": "면접이 생성되었습니다.",
  "data": {
    "interviewId": 10
  }
}
```

---

### 3.2 다음 질문 요청
- Method: `POST`
- URL: `/api/interviews/{interviewId}/next-question`
- Auth: Required
- Description: 다음 메인 질문 요청

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "interviewId": 10,
    "turnId": 101,
    "turnIndex": 1,
    "questionText": "자기소개를 해주세요.",
    "followUp": false,
    "parentTurnId": null,
    "keywords": ["자기소개", "경험"]
  }
}
```

Fields

| 필드명 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| interviewId | Long | X | 면접 ID |
| turnId | Long | X | 턴 ID |
| turnIndex | int | X | 턴 순서 |
| questionText | String | X | 질문 텍스트 |
| followUp | boolean | X | 꼬리질문 여부 |
| parentTurnId | Long | O | 꼬리질문인 경우 부모 턴 ID |
| keywords | List<String> | X | 키워드 목록 |

---

### 3.3 인터뷰 제목 수정
- Method: `PATCH`
- URL: `/api/interviews/{interviewId}/title`
- Auth: Required
- Description: 인터뷰 제목 변경

Request Body (JSON)
```json
{
  "title": "2026-01-29 모의면접"
}
```

Fields

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| title | String | O | 새 인터뷰 제목 |

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "interviewId": 10,
    "title": "2026-01-29 모의면접"
  }
}
```

---

### 3.4 답변 음성 업로드
- Method: `POST`
- URL: `/api/interviews/{interviewId}/turns/{turnId}/upload-audio`
- Auth: Required
- Description: 음성 파일 업로드

Request (multipart/form-data)

| 파트명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| audioFile | File | O | WAV/MP3 등 음성 파일 |

Response
```json
{
  "status": 200,
  "message": "오디오 업로드가 완료되었습니다.",
  "data": {
    "interviewId": 10,
    "turnId": 101,
    "turnIndex": 1,
    "mediaType": "AUDIO",
    "key": "interviews/10/turns/101/audio.wav",
    "size": 524288,
    "contentType": "audio/wav"
  }
}
```

---

### 3.5 답변 영상 업로드
- Method: `POST`
- URL: `/api/interviews/{interviewId}/turns/{turnId}/upload-video`
- Auth: Required
- Description: 영상 파일 업로드

Request (multipart/form-data)

| 파트명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| videoFile | File | O | MP4 등 영상 파일 |

Response
```json
{
  "status": 200,
  "message": "비디오 업로드가 완료되었습니다.",
  "data": {
    "interviewId": 10,
    "turnId": 101,
    "turnIndex": 1,
    "mediaType": "VIDEO",
    "key": "interviews/10/turns/101/video.mp4",
    "size": 10485760,
    "contentType": "video/mp4"
  }
}
```

---

### 3.6 턴 음성 분석 요청 (동기)
- Method: `POST`
- URL: `/api/interviews/{interviewId}/turns/{turnId}/analyze-audio`
- Auth: Required
- Description: AI 음성 분석 및 피드백 반환

Response
```json
{
  "status": 200,
  "message": "오디오 분석이 완료되었습니다.",
  "data": {
    "finished": false,
    "interviewId": 10,
    "turnId": 101,
    "turnIndex": 1,
    "questionText": "자기소개를 해주세요.",
    "answerText": "안녕하세요. 백엔드 개발자입니다.",
    "feedbackText": "핵심 경험을 먼저 말해보세요.",
    "followUpTurn": false,
    "nextTurn": {
      "interviewId": 10,
      "turnId": 102,
      "turnIndex": 2,
      "questionText": "최근 프로젝트를 소개해주세요.",
      "followUp": false,
      "parentTurnId": null,
      "keywords": ["프로젝트", "역할"]
    }
  }
}
```

---

### 3.7 영상 분석 업로드 (MediaPipe JSON)
- Method: `POST`
- URL: `/api/interviews/{interviewId}/turns/{turnId}/video-analysis`
- Auth: Required
- Description: MediaPipe JSON 업로드 후 비동기 영상 분석 요청

Request Body (JSON)
```json
{
  "frames": [
    {
      "time": 0.033,
      "landmarks": []
    }
  ],
  "meta": {
    "width": 1280,
    "height": 720
  }
}
```

Response (202)
```json
{
  "status": 202,
  "message": "VIDEO_ANALYSIS_ACCEPTED",
  "data": {
    "interviewId": 10,
    "turnId": 101,
    "jobId": 9001,
    "status": "QUEUED"
  }
}
```

---

### 3.8 영상 분석 결과 조회
- Method: `GET`
- URL: `/api/interviews/{interviewId}/turns/{turnId}/video-analysis`
- Auth: Required
- Description: 영상 분석 결과 조회 (폴링)

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "status": "DONE",
    "totalScore": 87,
    "feedbackTitle": "시선 처리 개선",
    "detailedFeedback": [
      "카메라를 주기적으로 응시하세요.",
      "상체 움직임을 줄여보세요."
    ],
    "coachingMessage": "좋은 자세를 유지했습니다."
  }
}
```

---

### 3.9 턴 영상 분석 시작 (Legacy)
- Method: `POST`
- URL: `/api/interviews/{interviewId}/turns/{turnId}/analyze-video`
- Auth: Required
- Description: 레거시 비디오 분석 시작 API

Response
```json
{
  "status": 200,
  "message": "비디오 분석 작업이 시작되었습니다.",
  "data": {
    "interviewId": 10,
    "turnId": 101,
    "jobId": 9001,
    "status": "QUEUED"
  }
}
```

---

### 3.10 내 연속 면접(스트릭) 조회
- Method: `GET`
- URL: `/api/interviews/me/streak`
- Auth: Required
- Description: 로그인 사용자 기준 연속 면접 일수 조회

Response (GlobalApiResponse 래핑 없음)
```json
{
  "currentStreak": 3,
  "streakDates": ["2026-01-27", "2026-01-28", "2026-01-29"]
}
```

---

### 3.11 인터뷰 삭제 (소프트 딜리트)
- Method: `DELETE`
- URL: `/api/interviews/{interviewId}`
- Auth: Required
- Description: 인터뷰를 소프트 딜리트 처리 (목록/조회에서 제외)

Response
```json
{
  "status": 204,
  "message": "면접이 삭제되었습니다.",
  "data": null
}
```

---
## 4. 인터뷰 조회 (Query)

### 4.1 내 면접 목록 조회
- Method: `GET`
- URL: `/api/interviews`
- Auth: Required
- Description: 로그인 유저의 면접 목록 조회

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "interviews": [
      {
        "interviewId": 10,
        "title": "2026-01-29 모의면접",
        "interviewType": "CS",
        "runMode": "PRACTICE",
        "status": "IN_PROGRESS",
        "targetQuestionCount": 5,
        "askedCount": 2,
        "startedAt": "2026-01-29T10:05:00",
        "finishedAt": null,
        "createdAt": "2026-01-29T10:00:00"
      }
    ]
  }
}
```

---

### 4.2 인터뷰 턴 목록 조회
- Method: `GET`
- URL: `/api/interviews/{interviewId}/turns`
- Auth: Required
- Description: 면접 턴 목록 조회

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "interviewId": 10,
    "status": "IN_PROGRESS",
    "targetQuestionCount": 5,
    "askedCount": 2,
    "turns": [
      {
        "turnId": 101,
        "turnIndex": 1,
        "followUp": false,
        "parentTurnId": null,
        "questionText": "자기소개를 해주세요.",
        "answerText": "안녕하세요. 백엔드 개발자입니다.",
        "feedbackText": "핵심 경험을 먼저 말해보세요.",
        "sttScore": 78,
        "analysisStatus": "DONE",
        "audioKey": "interviews/10/turns/101/audio.wav",
        "videoKey": "interviews/10/turns/101/video.mp4"
      }
    ]
  }
}
```

---

### 4.3 인터뷰 상세 조회 (턴 + 영상 분석)
- Method: `GET`
- URL: `/api/interviews/{interviewId}/result`
- Auth: Required
- Description: 면접 상세(턴 + 최신 영상 분석 결과) 조회

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "interviewId": 10,
    "status": "FINISHED",
    "targetQuestionCount": 5,
    "askedCount": 5,
    "turns": [
      {
        "turnId": 101,
        "turnIndex": 1,
        "followUp": false,
        "parentTurnId": null,
        "questionText": "자기소개를 해주세요.",
        "answerText": "안녕하세요. 백엔드 개발자입니다.",
        "feedbackText": "핵심 경험을 먼저 말해보세요.",
        "sttScore": 78,
        "analysisStatus": "DONE",
        "audioUrl": "https://cdn.dapdap.com/interviews/10/turns/101/audio.wav",
        "videoUrl": "https://cdn.dapdap.com/interviews/10/turns/101/video.mp4",
        "videoAnalyses": [
          {
            "jobId": 9001,
            "status": "DONE",
            "score": 87,
            "inputSummary": {
              "duration": 120,
              "eyeContactScore": 80,
              "poseStabilityScore": 75,
              "movementScore": 70,
              "mainEmotion": "neutral"
            },
            "inputEmotions": [
              {
                "emotion": "neutral",
                "percent": 60
              },
              {
                "emotion": "happy",
                "percent": 30
              }
            ],
            "feedbackTitle": "시선 처리 개선",
            "detailedFeedback": ["카메라를 주기적으로 응시하세요."],
            "coachingMessage": "좋은 자세를 유지했습니다.",
            "errorMessage": null
          }
        ]
      }
    ]
  }
}
```

---

## 5. 리포트 (Report)

### 5.1 총괄 리포트 생성
- Method: `POST`
- URL: `/api/interviews/{interviewId}/report/generate`
- Auth: Required
- Description: 총괄 리포트 생성

Response
```json
{
  "status": 200,
  "message": "총괄 리포트를 생성했습니다.",
  "data": {
    "interviewId": 10,
    "status": "DONE",
    "totalScore": 82,
    "totalFeedback": "전체적으로 안정적입니다.",
    "summaryJson": "{\"summary\":\"...\"}",
    "fullVideoKey": "interviews/10/full/video.mp4",
    "fullAudioKey": "interviews/10/full/audio.wav"
  }
}
```

---

### 5.2 총괄 리포트 조회
- Method: `GET`
- URL: `/api/interviews/{interviewId}/report`
- Auth: Required
- Description: 총괄 리포트 조회

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "interviewId": 10,
    "status": "DONE",
    "totalScore": 82,
    "totalFeedback": "전체적으로 안정적입니다.",
    "summaryJson": "{\"summary\":\"...\"}",
    "fullVideoKey": "interviews/10/full/video.mp4",
    "fullAudioKey": "interviews/10/full/audio.wav"
  }
}
```

---

## 6. 분석 작업 (Analysis Jobs)

### 6.1 분석 작업 상태 조회
- Method: `GET`
- URL: `/api/analysis-jobs/{jobId}`
- Auth: Required
- Description: 비동기 분석 작업 상태 조회

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "jobId": 9001,
    "type": "VIDEO_ANALYSIS",
    "status": "DONE",
    "resultJson": "{\"totalScore\":87}",
    "score": 87,
    "errorMessage": null
  }
}
```

---

## 7. 게시판 (Boards)

### 7.1 게시글 목록 조회
- Method: `GET`
- URL: `/boards`
- Auth: Optional
- Query Parameters:
  - `sort`: `latest`(기본), `likes`, `views`
- Description: 게시글 목록을 최신/좋아요/조회수 순으로 조회

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "posts": [
      {
        "postId": 10,
        "title": "첫 번째 글",
        "authorName": "alice",
        "authorProfileImageUrl": "https://cdn.dapdap.com/profiles/user-1.png",
        "views": 3,
        "likes": 2,
        "createdAt": "2026-01-27T12:00:00",
        "updatedAt": "2026-01-27T12:05:00"
      }
    ]
  }
}
```

---

### 7.2 게시글 작성
- Method: `POST`
- URL: `/boards`
- Auth: Required
- Description: 게시글 작성 (이미지 파일 업로드 가능)

Notes
- 이 API는 `multipart/form-data`로 요청해야 합니다.
- 이미지 파일이 없으면 `imageUrl`은 `null`로 저장됩니다.
- `imageUrl`은 요청에서 사용하지 않습니다. 이미지가 필요하면 `imageFile` 파트를 전송하세요.

Request (multipart/form-data)

| 파트명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| req | JSON | O | `{ "title": "...", "content": "..." }` |
| imageFile | File | X | PNG/JPEG 이미지 |

Response
```json
{
  "status": 201,
  "message": "게시글이 생성되었습니다.",
  "data": {
    "postId": 10,
    "title": "안녕하세요",
    "authorName": "alice",
    "authorProfileImageUrl": "https://cdn.dapdap.com/profiles/user-1.png",
    "content": "게시글 내용입니다.",
    "imageUrl": "https://cdn.dapdap.com/boards/user-1/xxx.png",
    "views": 0,
    "likes": 0,
    "createdAt": "2026-01-27T12:00:00",
    "updatedAt": "2026-01-27T12:00:00",
    "comments": []
  }
}
```

---

### 7.3 게시글 상세 조회
- Method: `GET`
- URL: `/boards/{postId}`
- Auth: Optional
- Description: 게시글 상세 + 댓글 트리 조회 (조회수 증가)

Response
```json
{
  "status": 200,
  "message": "총괄 리포트를 생성했습니다.",
  "data": {
    "postId": 10,
    "title": "안녕하세요",
    "authorName": "alice",
    "authorProfileImageUrl": "https://cdn.dapdap.com/profiles/user-1.png",
    "content": "게시글 내용입니다.",
    "imageUrl": "https://cdn.dapdap.com/boards/user-1/xxx.png",
    "views": 1,
    "likes": 0,
    "createdAt": "2026-01-27T12:00:00",
    "updatedAt": "2026-01-27T12:00:00",
    "comments": [
      {
        "commentId": 100,
        "parentCommentId": null,
        "authorName": "bob",
        "authorProfileImageUrl": "https://cdn.dapdap.com/profiles/user-2.png",
        "content": "댓글입니다.",
        "createdAt": "2026-01-27T12:03:00",
        "replies": [
          {
            "commentId": 101,
            "parentCommentId": 100,
            "authorName": "alice",
            "authorProfileImageUrl": "https://cdn.dapdap.com/profiles/user-1.png",
            "content": "대댓글입니다.",
            "createdAt": "2026-01-27T12:04:00",
            "replies": []
          }
        ]
      }
    ]
  }
}
```

---

### 7.4 게시글 수정
- Method: `PATCH`
- URL: `/boards/{postId}`
- Auth: Required
- Description: 게시글 수정 (작성자만)

Notes
- 이 API는 `multipart/form-data`로 요청해야 합니다.
- 이미지 변경 시 `imageFile` 파트를 전송합니다. 파일이 없으면 기존 이미지가 유지됩니다.

Request (multipart/form-data)

| 파트명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| req | JSON | O | `{ "title": "...", "content": "..." }` |
| imageFile | File | X | PNG/JPEG 이미지 |

Response
- 게시글 상세 조회 응답과 동일한 구조

---

### 7.5 게시글 삭제
- Method: `DELETE`
- URL: `/boards/{postId}`
- Auth: Required
- Description: 게시글 삭제 (작성자만)

Response
```json
{
  "status": 204,
  "message": "게시글이 삭제되었습니다.",
  "data": null
}
```

---

### 7.6 게시글 좋아요 토글
- Method: `POST`
- URL: `/boards/{postId}/like`
- Auth: Required
- Description: 좋아요 토글 (이미 좋아요면 취소)

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "postId": 10,
    "views": 12,
    "likes": 3,
    "liked": true
  }
}
```

---

### 7.7 게시글 이미지 업로드
- Method: `POST`
- URL: `/boards/{postId}/image`
- Auth: Required
- Description: S3에 이미지 업로드 후 게시글에 URL 저장 (작성자만)

Request (multipart/form-data)

| 파트명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| imageFile | File | O | PNG/JPEG 이미지 |

Response
- 게시글 상세 조회 응답과 동일한 구조 (`imageUrl` 갱신)

---

### 7.8 댓글 작성
- Method: `POST`
- URL: `/boards/{postId}/comments`
- Auth: Required
- Description: 댓글 작성 (parentCommentId가 있으면 대댓글)

Request Body (JSON)
```json
{
  "content": "댓글 내용",
  "parentCommentId": null
}
```

Response
```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "commentId": 100,
    "parentCommentId": null,
    "authorName": "bob",
    "authorProfileImageUrl": "https://cdn.dapdap.com/profiles/user-2.png",
    "content": "댓글 내용",
    "createdAt": "2026-01-27T12:03:00",
    "replies": []
  }
}
```

---

### 7.9 댓글 삭제
- Method: `DELETE`
- URL: `/boards/{postId}/comments/{commentId}`
- Auth: Required
- Description: 댓글 삭제 (작성자만)

Response
```json
{
  "status": 204,
  "message": "댓글이 삭제되었습니다.",
  "data": null
}
```

---

## 8. 스토리지 (Storage)

### 8.1 Presigned Download URL 발급
- Method: `POST`
- URL: `/api/storage/test/presign-download`
- Auth: Required
- Description: S3 객체 키로 Presigned URL 발급

---

### 8.2 [TEST ONLY] S3 음성 파일 직접 업로드
- Method: `POST`
- URL: `/api/storage/test/upload-audio`
- Auth: Required
- Description: 음성 파일 업로드 테스트

---

### 8.3 [TEST ONLY] S3 영상 파일 직접 업로드
- Method: `POST`
- URL: `/api/storage/test/upload-video`
- Auth: Required
- Description: 영상 파일 업로드 테스트

---

## 9. 학습 (Learning)

### 9.1 질문 목록 조회
- Method: `GET`
- URL: `/learning/questions`
- Auth: None
- Description: 질문 목록 페이지 조회

Response (GlobalApiResponse 래핑 없음)
```json
{
  "items": [
    {
      "questionId": 100,
      "title": "스프링에서 DI가 무엇인가요?",
      "difficulty": 2,
      "parentId": null,
      "categoryId": 1,
      "categoryName": "Backend",
      "views": 12
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

Fields (items)

| 필드명 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| questionId | Long | X | 질문 ID |
| title | String | X | 질문 제목(요약) |
| difficulty | int | X | 난이도 |
| parentId | Long | O | 부모 질문 ID |
| categoryId | Long | O | 카테고리 ID |
| categoryName | String | O | 카테고리 이름 |
| views | long | X | 조회수 |

---

### 9.2 질문 상세 조회
- Method: `GET`
- URL: `/learning/questions/{questionId}`
- Auth: None
- Description: 질문 상세 조회

Response (GlobalApiResponse 래핑 없음)
```json
{
  "questionId": 100,
  "difficulty": 2,
  "parentId": null,
  "content": "스프링에서 DI가 무엇인가요?",
  "modelAnswer": "의존성을 외부에서 주입하는 패턴입니다.",
  "views": 12,
  "followUpQuestions": [
    {
      "questionId": 101,
      "content": "필드 주입과 생성자 주입의 차이를 설명해주세요.",
      "modelAnswer": "테스트 용이성과 불변성 측면에서 생성자 주입이 권장됩니다."
    }
  ]
}
```

Fields

| 필드명 | 타입 | nullable | 설명 |
| --- | --- | --- | --- |
| questionId | Long | X | 질문 ID |
| difficulty | int | X | 난이도 |
| parentId | Long | O | 부모 질문 ID |
| content | String | X | 질문 본문 |
| modelAnswer | String | O | 모범 답안 |
| views | long | X | 조회수 |
| followUpQuestions | List | X | 꼬리 질문 목록 |

---

## 10. 테스트 전용 (Test Only)

### 10.1 테스트 API
- Base URL: `/api/test`
- Auth: Required
- Description: 테스트용 엔드포인트 모음

Endpoints
- `GET /api/test/success`
- `GET /api/test/success-message`
- `POST /api/test/created`
- `DELETE /api/test/no-content`
- `GET /api/test/bad-request`
- `GET /api/test/not-found`
- `GET /api/test/conflict`
- `POST /api/test/validation`
- `GET /api/test/type-mismatch/{id}`
- `GET /api/test/server-error`

