from fastapi import APIRouter
from app.schemas.video import VideoReportRequest
from app.services.vision_service import VisionService

router = APIRouter()
vision_service = VisionService()

@router.post("/analyze")
async def analyze_video_data(request: VideoReportRequest):
    """
    [Internal] Spring 서버로부터 영상 분석 결과(점수 데이터)를 받아
    최종 피드백과 코칭 메시지를 생성하여 반환합니다.
    """
    # 요청 데이터에서 ID 추출
    interview_id = request.interview_id
    turn_id = request.turn_id
    
    print(f"🎬 [Interview: {interview_id}, Turn: {turn_id}] 비디오 데이터 분석 요청 수신")
    
    # 서비스 계층에 데이터 해석 요청 (점수 데이터만 전달)
    # result는 GPT가 생성한 피드백 JSON (total_score, detailed_feedback 등 포함)
    result = await vision_service.generate_feedback(request.summary)
    
    # [수정] 결과 JSON에 ID 정보를 추가하여 반환
    # 이렇게 하면 Spring 서버가 응답을 받았을 때 어떤 요청의 결과인지 바로 식별 가능합니다.
    if isinstance(result, dict):
        result["interview_id"] = interview_id
        result["turn_id"] = turn_id
    
    print(f"✅ [Interview: {interview_id}, Turn: {turn_id}] 분석 완료 및 결과 반환")
    return result