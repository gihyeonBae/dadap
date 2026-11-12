from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import asyncio
from app.utils.file_parser import extract_text_from_bytes
from app.services.portfolio_service import PortfolioService

router = APIRouter()
portfolio_service = PortfolioService()


async def _download_bytes(url: str) -> bytes:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
    response.raise_for_status()
    return response.content

# 요청 Body 스키마 정의
class PortfolioUrlRequest(BaseModel):
    url: str
    portfolio_id: int  # [추가] 로깅 및 추적을 위해 ID 수신

@router.post("/generate-questions")
async def generate_portfolio_questions(request: PortfolioUrlRequest):
    """
    [Internal] Spring 서버로부터 포트폴리오 파일 URL을 받아
    파일을 다운로드하고 분석하여 면접 질문(부모+꼬리) JSON을 반환합니다.
    """
    url = request.url
    portfolio_id = request.portfolio_id

    if not url:
        raise HTTPException(status_code=400, detail="파일 URL이 제공되지 않았습니다.")

    # [수정] 로그에 ID 포함하여 추적 용이성 확보
    print(f"📂 [Portfolio ID: {portfolio_id}] 다운로드 및 분석 시작: {url}")

    # 1. URL에서 파일 다운로드
    try:
        file_content = await _download_bytes(url)
        filename = url.split("?")[0].split("/")[-1]
    except Exception as e:
        print(f"❌ [Portfolio ID: {portfolio_id}] 파일 다운로드 실패: {e}")
        raise HTTPException(status_code=400, detail="S3에서 파일을 다운로드할 수 없습니다.")

    # 2. 텍스트 추출 (수정된 Utils 사용)
    try:
        text_content = await asyncio.to_thread(extract_text_from_bytes, file_content, filename)
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [Portfolio ID: {portfolio_id}] 텍스트 추출 에러: {e}")
        raise HTTPException(status_code=500, detail="파일 처리 중 오류가 발생했습니다.")
    
    # 3. GPT 질문 생성 (Service 활용 - 기존 로직 유지)
    result = await portfolio_service.generate_questions(text_content)
    
    print(f"✅ [Portfolio ID: {portfolio_id}] 분석 완료: 질문 {len(result.get('questions', []))}세트 생성됨")
    return result