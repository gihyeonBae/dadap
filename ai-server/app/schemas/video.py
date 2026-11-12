from pydantic import BaseModel
from typing import List

# 1. 감정 상세 정보 (emotionTop3 리스트 내부)
class EmotionDetail(BaseModel):
    emotion: str
    percent: int

# 2. 요약 데이터 (summary 객체)
class VideoSummary(BaseModel):
    duration: int
    eyeContactScore: int
    poseStabilityScore: int
    movementScore: int
    mainEmotion: str
    emotionTop3: List[EmotionDetail]

# 3. 최상위 요청 객체 (프론트엔드 페이로드 전체)
class VideoReportRequest(BaseModel):
    # [추가됨] 어떤 면접의 몇 번째 턴인지 식별하기 위한 ID
    interview_id: int 
    turn_id: int
    
    summary: VideoSummary