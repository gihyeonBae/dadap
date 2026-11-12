# PORTING MANUAL

## 1. 프로젝트 개요
- 프로젝트명: DADAP
- 프로젝트 설명: CS/포트폴리오 면접을 실전처럼 연습하고, AI가 답변 및 비언어적 요소를 분석하여 피드백을 제공하는 면접 코칭 서비스
- Repository URL: https://lab.ssafy.com/s14-webmobile1-sub1/S14P11D203

## 2. 시스템 아키텍처
- 사용 기술 스택
    - Frontend: Typescript, React, Vite, Tailwind CSS, Node.js, PostCss
    - Backend: Spring Boot, Java
    - AI: Python, FastAPI
    - Infra: Docker, AWS EC2, UBUNTU, Nginx
    - IDE: Visual Studio Code, IntelliJ
- 전체 구조 요약: 사용자는 HTTPS(Nginx)를 통해 서비스에 접속하며, Nginx가 Frontend 정적 페이지(`/`)와 Backend API(`/api`), AI 서버(`/api/v1/ai`)로 요청을 라우팅한다. Backend는 MySQL DB 및 AI 서버와 통신한다.

## 3. 실행 환경(Server 기준)
### 3.1 OS / VM
- OS: Ubuntu 24.04.3 LTS
- Cloud: AWS EC2

### 3.2 Web Server/ WAS
- Web Server: Nginx
- WAS: Spring Boot 3.5.9(Embedded Tomcat)

### 3.3 Runtime & Tool
- Docker: 29.1.5
- Docker Compose: v5.0.2
- Java: OpenJDK 21(Eclipse Temurin, Docker Image)
- Node: Node.js 20(Docker build stage)
- Python: 3.11(Docker Image, python:3.11-slim)
- Database: MySQL 8.0(Docker Image)
- AI Server: FastAPI + Uvicorn
- PeerJS Server: peerjs/peerjs-server(Docker Image)



## 4. 환경 변수 설정
### 4.1 환경 변수 파일 목록
- .env.prod: Backend, DB 공통 환경 변수
- .env.ai.prod: AI 서버 관련 환경 변수
### 4.2 환경 변수 예시
아래는 환경 변수 설정 예시이며, 실제 값은 배포 환경에 맞게 설정한다.
모든 민감 정보(API Key, Secret 등)는 Git에 포함하지 않도록 유의한다.
```env
# .env.prod
# ===== Profile =====
SPRING_PROFILES_ACTIVE=prod

# ===== AWS (S3 등) =====
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=발급받은_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=발급받은_AWS_SECRET_KEY

# ===== Spring DB =====
DB_URL=jdbc:mysql://db:3306/dadap?serverTimezone=Asia/Seoul&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=MYSQL_USER와_동일
DB_PASSWORD=MYSQL_PASSWORD와_동일

# ===== JWT =====
JWT_SECRET=임의의_긴_문자열_32자_이상

# ===== Mail =====
GMAIL_USERNAME=example@gmail.com
GMAIL_PASSWORD=구글_앱_비밀번호
NAVER_USERNAME=example@naver.com
NAVER_PASSWORD=네이버_앱_비밀번호

# ===== OAuth =====
GITHUB_CLIENT_ID=발급받은_GITHUB_ID
GITHUB_CLIENT_SECRET=발급받은_GITHUB_SECRET
GOOGLE_CLIENT_ID=발급받은_GOOGLE_ID
GOOGLE_CLIENT_SECRET=발급받은_GOOGLE_SECRET
GITHUB_REDIRECT_URI=https://도메인/api/auth/github/redirect
GOOGLE_REDIRECT_URI=https://도메인/api/auth/google/redirect

# ===== DB Container(Docker Container와 동일하게) =====
MYSQL_DATABASE=dadap
MYSQL_USER=dadap
MYSQL_PASSWORD=DB_USER_PASSWORD
MYSQL_ROOT_PASSWORD=DB_ROOT_PASSWORD

# ===== AI Server =====
AI_BASE_URL=http://ai:8000
```
```env
# .env.ai.prod
OPENAI_API_KEY=발급받은_OPENAI_KEY
OPENAI_API_BASE=https://api.openai.com/v1
STT_PROVIDER=google
VISION_MODEL_PATH=models/vision
```

## 5. 빌드 및 배포 방법
### 5.1 프로젝트 클론
배포를 위해 Git 저장소를 클론한다.
```bash
git clone <Git Repository URL>
git switch test
cd <프로젝트 루트 디렉토리>/deploy 
```
### 5.2 Docker 이미지 빌드 및 실행
`deploy` 디렉토리에 아래 파일을 생성하고 값을 설정한다.
서버 배포는 기본 Compose 파일과 Production 오버라이드 파일을 함께 사용한다.

- `.env.prod`
- `.env.ai.prod`

```bash
touch .env.prod .env.ai.prod
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
### 5.3 서비스 실행 확인
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```
### 5.4 서비스 중지
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```
### 5.5 서비스 로그 확인
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f <서비스명>
```

## 6. 포트 구성
## 6.1 외부 공개 포트
| 포트 | 프로토콜 | 대상 | 설명 |
|---:|---|---|---|
| 80 | HTTP | Nginx | 프론트/백엔드 Reverse Proxy 진입점 |
| 443 | HTTPS | Nginx | (사용 시) HTTPS 진입점 |
| 9000 | TCP | PeerJS | WebRTC signaling 서버 |

## 6.2 컨테이너 내부 포트
| 서비스 | 컨테이너 포트 | 비고 |
|---|---:|---|
| frontend (nginx 정적서빙) | 80 | Nginx가 프론트 정적파일 제공 |
| backend (spring) | 8080 | API 서버 |
| ai (fastapi/uvicorn) | 8000 | AI 서버 |
| db (mysql) | 3306 | DB |
| peerjs | 9000 | signaling |

## 7. Nginx 설정
Nginx는 Reverse Proxy로 동작하며, 80(또는 443) 포트로 들어오는 요청을 프론트 정적 페이지 및 백엔드/AI API로 라우팅한다.
Frontend 컨테이너는 호스트의 8080 포트에 바인딩되며, Nginx는 `/` 경로로 들어오는 요청을 해당 포트로 프록시한다.
### 7.1 라우팅 규칙
- `/` : Frontend 정적 파일 제공
- `/api` : Backend 서버로 프록시
- `/api/v1/ai` : AI 서버로 프록시
### 7.2 설정 파일 적용
- 설정 파일 위치: `/etc/nginx/sites-available/dadap.conf`
- 심볼릭 링크: `/etc/nginx/sites-enabled/dadap.conf`

적용 명령어:
```bash
sudo ln -s /etc/nginx/sites-available/dadap.conf /etc/nginx/sites-enabled/dadap.conf
sudo nginx -t
sudo systemctl restart nginx
```
HTTPS 인증서는 Let’s Encrypt(certbot)를 사용하여 발급하였다.
### 7.3 주요 설정 예시
```nginx
server {
    listen 443 ssl;
    server_name dadap.site www.dadap.site;

    client_max_body_size 50m;
    proxy_connect_timeout 60s;
    proxy_send_timeout    300s;
    proxy_read_timeout    300s;
    ssl_certificate /etc/letsencrypt/live/www.dadap.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.dadap.site/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/v1/ai {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /auth/ {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /learning/ {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 8. DB 설정
### 8.1 DB 덤프 파일
- 위치: ./dump.sql
