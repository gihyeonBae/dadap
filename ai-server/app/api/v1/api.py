from fastapi import APIRouter
from app.api.v1.endpoints import interview, video, portfolio 

api_router = APIRouter()

# 1. 면접 대화 관련 API (/api/v1/ai/interview/...)
api_router.include_router(interview.router, prefix="/ai/interview", tags=["Interview Turn"])

# 2. 비디오 분석 관련 API (/api/v1/ai/video/...)
api_router.include_router(video.router, prefix="/ai/video", tags=["Video Analysis"])

# 3. 서류 분석 관련 API
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio Analysis"])