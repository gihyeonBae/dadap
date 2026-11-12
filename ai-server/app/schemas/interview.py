from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

# 다음 질문 후보군 (DTO)
class NextQuestionCandidate(BaseModel):
    id: int
    text: str

# 1. 면접 턴 요청 (Spring -> AI)
class InterviewTurnRequest(BaseModel):
    interview_id: int = Field(..., description="면접 식별자 (Log용)")
    current_question_id: int
    current_question_text: str
    
    model_answer: str = Field(..., description="CS 정답 또는 서류 면접 의도")
    key_terms: List[str] = Field(..., description="필수 키워드 또는 핵심 논리")
    
    user_audio_url: str = Field(..., description="사용자 답변 음성 파일 URL (S3)")
    
    next_question_candidates: List[NextQuestionCandidate] = Field(..., description="다음 질문 후보 리스트")

# 2. 평가 결과 객체
class EvaluationResult(BaseModel):
    score: int
    feedback: str
    missing_keywords: List[str] = []
    found_keywords: List[str] = []

# 3. 면접 턴 응답 (AI -> Spring)
class InterviewTurnResponse(BaseModel):
    status: str = "success"
    stt_text: str
    evaluation: EvaluationResult
    selected_question_id: int
    selected_question_text: Optional[str] = None # 편의상 텍스트도 반환