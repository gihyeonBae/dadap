import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import VISION_SYSTEM_PROMPT, VISION_USER_PROMPT_TEMPLATE

class VisionService:
    def __init__(self):
        # OpenAI 클라이언트 초기화 (GMS/OpenAI 공통)
        client_kwargs = {"api_key": settings.OPENAI_API_KEY}
        if settings.OPENAI_API_BASE:
            client_kwargs["base_url"] = settings.OPENAI_API_BASE
        self.client = AsyncOpenAI(**client_kwargs)

    async def generate_feedback(self, summary):
        """
        프론트엔드에서 계산된 점수 데이터(summary)를 받아
        app/core/prompts.py에 정의된 템플릿을 사용하여 피드백을 생성합니다.
        """
        
        # 1. 감정 상세 정보 문자열 변환
        # 예: "smile (60%), neutral (30%)" 형태로 변환
        emotions_str = ", ".join([f"{e.emotion} ({e.percent}%)" for e in summary.emotionTop3])
        
        # 2. 유저 프롬프트 생성 (.format()을 사용하여 데이터 주입)
        # 템플릿의 {변수명} 자리에 실제 값을 채워 넣습니다.
        user_prompt = VISION_USER_PROMPT_TEMPLATE.format(
            duration=summary.duration,
            eye_contact_score=summary.eyeContactScore,
            pose_stability_score=summary.poseStabilityScore,
            movement_score=summary.movementScore,
            main_emotion=summary.mainEmotion,
            emotion_str=emotions_str
        )

        try:
            # 3. OpenAI API 호출
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": VISION_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"}, # JSON 응답 강제
                temperature=0.7
            )
            
            # 4. 응답 파싱
            return json.loads(response.choices[0].message.content)

        except Exception as e:
            print(f"❌ LLM 호출 에러: {e}")
            return {
                "total_score": 0,
                "feedback_title": "분석 오류",
                "detailed_feedback": ["데이터 처리 중 문제가 발생했습니다."],
                "coaching_message": "잠시 후 다시 시도해 주세요."
            }