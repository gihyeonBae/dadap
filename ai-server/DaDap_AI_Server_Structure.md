📘 [DaDap] AI Server Project Structure & Guide

이 문서는 Client-Side Vision & Server-Side LLM 아키텍처로 구성된 **DaDap AI Server (FastAPI)**의 현재 폴더 구조와 핵심 로직을 설명합니다.

서버는 프론트엔드에서 계산된 비언어적 데이터를 받아 **데이터 해석 및 피드백 생성(LLM)**을 전담합니다.

📂 1. 전체 폴더 구조 (Directory Structure)

dadap-ai-server/
├── main.py                  # [Entry Point] 앱 실행 및 설정
├── requirements.txt         # [Dependency] 필수 라이브러리 (FastAPI, OpenAI)
├── .env                     # [Config] 환경 변수 (OPENAI_API_KEY)
│
├── app/
│   ├── api/                 # [Controller] API 라우터
│   │   └── v1/
│   │       ├── api.py       # 라우터 통합
│   │       └── endpoints/
│   │           ├── interview.py  # 대화형 면접 (STT + LLM)
│   │           └── video.py      # 영상 데이터 분석 및 피드백 API
│   │
│   ├── core/                # [Config] 설정 및 프롬프트
│   │   ├── config.py        # 환경변수 로드
│   │   └── prompts.py       # LLM 페르소나 및 프롬프트 템플릿
│   │
│   ├── schemas/             # [DTO] 데이터 검증 모델
│   │   ├── interview.py     # 대화형 면접 스키마
│   │   └── video.py         # 영상 점수 데이터 스키마
│   │
│   └── services/            # [Service] 비즈니스 로직
│       ├── llm_service.py   # 면접 대화 로직 (Dual-Track)
│       └── vision_service.py # 점수 기반 피드백 생성기 (LLM Wrapper)


🛠️ 2. 파일별 상세 설명 (Detailed Description)

1️⃣ Root Directory (루트 경로)

main.py

역할: FastAPI 서버의 진입점입니다.

핵심 로직:

CORS 설정: 프론트엔드 및 타 서버에서의 접근 허용.

Router 등록: /api/v1 하위의 모든 엔드포인트 연결.

requirements.txt

역할: 프로젝트 구동에 필요한 라이브러리 목록입니다.

주요 패키지:

fastapi, uvicorn: 웹 서버 구동

openai: LLM(GPT) 피드백 생성

python-multipart: 폼 데이터 처리

2️⃣ app/core (설정 및 상수)

app/core/prompts.py

역할: LLM에게 부여할 페르소나와 프롬프트 템플릿을 중앙에서 관리합니다.

주요 프롬프트:

CS_SELECTOR/EVALUATOR: 기술 면접 진행용.

RESUME_SELECTOR/EVALUATOR: 서류 면접 진행용.

VISION_SYSTEM_PROMPT: 면접 코치 페르소나 정의.

VISION_USER_PROMPT_TEMPLATE: 수치 데이터를 자연어 프롬프트로 변환하는 템플릿.

3️⃣ app/schemas (DTO)

app/schemas/video.py

역할: 프론트엔드에서 전송하는 JSON 점수 데이터의 유효성을 검사합니다.

구조:

VideoReportRequest: 최상위 요청 객체.

VideoSummary: duration, eyeContactScore, movementScore, mainEmotion 등 핵심 지표.

EmotionDetail: 감정 분포 리스트 (emotion, percent).

4️⃣ app/services (비즈니스 로직)

app/services/vision_service.py

역할: 정량적인 점수 데이터를 정성적인 코칭 멘트로 변환합니다.

핵심 로직:

데이터 포맷팅: 입력받은 JSON 점수 데이터를 VISION_USER_PROMPT_TEMPLATE에 주입하여 텍스트화합니다.

LLM 호출: GPT-4o-mini API를 호출하여 전문적인 피드백을 요청합니다.

JSON 파싱: LLM이 생성한 응답을 구조화된 JSON 객체로 반환합니다.

app/services/llm_service.py

역할: 음성 기반의 대화형 면접(CS/서류)을 수행합니다.

기술: Whisper(STT)와 GPT 모델을 Dual-Track(선택/평가 병렬 처리)으로 운영하여 응답 속도를 최적화합니다.

5️⃣ app/api/v1/endpoints (컨트롤러)

app/api/v1/endpoints/video.py

역할: 영상 분석 데이터를 수신하고 최종 피드백을 반환하는 동기(Synchronous) API입니다.

Endpoint: POST /analyze (또는 /video/analyze)

흐름:

클라이언트로부터 VideoReportRequest (JSON) 수신.

vision_service.generate_feedback() 호출.

생성된 피드백 JSON 즉시 반환.

🚀 3. 개발 및 테스트 워크플로우

환경 설정: .env 파일에 OPENAI_API_KEY를 설정합니다.

설치: pip install -r requirements.txt 명령어로 필수 패키지를 설치합니다.

실행: uvicorn main:app --reload 명령어로 서버를 실행합니다.

테스트:

영상 파일 업로드 없이, **JSON 데이터(점수)**만 전송하여 로직을 검증합니다.

test_endpoints.py 스크립트 또는 Swagger UI(http://localhost:8000/docs)를 활용합니다.