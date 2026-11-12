from fastapi import APIRouter
from app.schemas.interview import InterviewTurnRequest, InterviewTurnResponse
from app.services.llm_service import LLMService
import httpx
import os
import uuid
import asyncio

# [핵심] 이 줄이 반드시 있어야 합니다!
router = APIRouter()

llm_service = LLMService()


async def _write_bytes(path: str, data: bytes) -> None:
    def _sync_write() -> None:
        with open(path, "wb") as f:
            f.write(data)
    await asyncio.to_thread(_sync_write)


async def download_audio(url: str) -> str | None:
    """S3 URL에서 오디오 파일을 비동기 다운로드하여 임시 경로를 반환합니다."""
    try:
        if not url or "http" not in url:
            return None

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
        if response.status_code != 200:
            return None

        ext = url.split('.')[-1] if '.' in url else "wav"
        if len(ext) > 4:
            ext = "wav"

        temp_filename = f"temp_audio_{uuid.uuid4()}.{ext}"
        await _write_bytes(temp_filename, response.content)
        return temp_filename
    except Exception as e:
        print(f"Audio Download Failed: {e}")
        return None

@router.post("/cs", response_model=InterviewTurnResponse)
async def analyze_cs_turn(request: InterviewTurnRequest):
    """
    [CS 기술 면접] 답변 분석 및 다음 질문 선택
    """
    # 1. 오디오 파일 다운로드
    temp_audio_path = await download_audio(request.user_audio_url)
    
    stt_text = ""
    if temp_audio_path:
        # 2. STT 변환
        stt_text = await llm_service.stt(temp_audio_path)
        if await asyncio.to_thread(os.path.exists, temp_audio_path):
            await asyncio.to_thread(os.remove, temp_audio_path)

    # 3. Dual-Track 분석 (선택 + 평가)
    candidates_list = [c.model_dump() for c in request.next_question_candidates]
    
    result = await llm_service.process_cs_turn(
        stt_text=stt_text,
        current_q=request.current_question_text,
        model_answer=request.model_answer,
        keywords=request.key_terms,
        candidates=candidates_list
    )
    
    return result

@router.post("/resume", response_model=InterviewTurnResponse)
async def analyze_resume_turn(request: InterviewTurnRequest):
    """
    [서류 면접] 답변 논리 분석 및 심층 질문 선택
    """
    temp_audio_path = await download_audio(request.user_audio_url)
    
    stt_text = ""
    if temp_audio_path:
        stt_text = await llm_service.stt(temp_audio_path)
        if await asyncio.to_thread(os.path.exists, temp_audio_path):
            await asyncio.to_thread(os.remove, temp_audio_path)

    candidates_list = [c.model_dump() for c in request.next_question_candidates]

    result = await llm_service.process_resume_turn(
        stt_text=stt_text,
        current_q=request.current_question_text,
        intent=request.model_answer, # 의도(Model Answer)
        key_logic=request.key_terms, # 핵심 논리(Key Terms)
        candidates=candidates_list
    )
    
    return result