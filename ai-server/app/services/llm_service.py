import json
import asyncio
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import (
    CS_SELECTOR_PROMPT, CS_EVALUATOR_PROMPT,
    RESUME_SELECTOR_PROMPT, RESUME_EVALUATOR_PROMPT,
    STT_STYLE_PROMPT
)

client_kwargs = {"api_key": settings.OPENAI_API_KEY}
if settings.OPENAI_API_BASE:
    client_kwargs["base_url"] = settings.OPENAI_API_BASE

client = AsyncOpenAI(**client_kwargs)

class LLMService:
    
    async def stt(self, audio_file_path: str) -> str:
        """
        [Step 1 & 2] 음성 파일을 텍스트로 변환 (Whisper)
        """
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcript = await client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language="ko",
                    prompt=STT_STYLE_PROMPT # 스타일 가이드 프롬프트 적용
                )
            return transcript.text
        except Exception as e:
            print(f"STT Error: {e}")
            return ""

    async def process_cs_turn(self, stt_text: str, current_q: str, model_answer: str, keywords: list, candidates: list):
        """
        [Step 3-A] CS 면접 턴 처리 (Dual-Track)
        """
        # Track A: 질문 선택
        task_selector = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": CS_SELECTOR_PROMPT},
                {"role": "user", "content": f"질문: {current_q}\n답변: {stt_text}\n모범답안: {model_answer}\n키워드: {keywords}\n후보군: {candidates}"}
            ],
            response_format={"type": "json_object"}
        )

        # Track B: 정밀 평가
        task_evaluator = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": CS_EVALUATOR_PROMPT},
                {"role": "user", "content": f"질문: {current_q}\n답변: {stt_text}\n모범답안: {model_answer}\n키워드: {keywords}"}
            ],
            response_format={"type": "json_object"}
        )

        # 병렬 실행
        selector_res, evaluator_res = await asyncio.gather(task_selector, task_evaluator)

        selection_data = json.loads(selector_res.choices[0].message.content)
        eval_data = json.loads(evaluator_res.choices[0].message.content)

        return {
            "status": "success",
            "stt_text": stt_text,
            "evaluation": eval_data.get("evaluation", {}),
            "selected_question_id": selection_data.get("selected_question_id", -1)
        }

    async def process_resume_turn(self, stt_text: str, current_q: str, intent: str, key_logic: list, candidates: list):
        """
        [Step 3-B] 서류 면접 턴 처리 (Dual-Track)
        """
        # Track A: 질문 선택
        task_selector = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": RESUME_SELECTOR_PROMPT},
                {"role": "user", "content": f"질문: {current_q}\n답변: {stt_text}\n의도: {intent}\n핵심논리: {key_logic}\n후보군: {candidates}"}
            ],
            response_format={"type": "json_object"}
        )

        # Track B: 정밀 평가
        task_evaluator = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": RESUME_EVALUATOR_PROMPT},
                {"role": "user", "content": f"질문: {current_q}\n답변: {stt_text}\n의도: {intent}\n핵심논리: {key_logic}"}
            ],
            response_format={"type": "json_object"}
        )

        selector_res, evaluator_res = await asyncio.gather(task_selector, task_evaluator)

        selection_data = json.loads(selector_res.choices[0].message.content)
        eval_data = json.loads(evaluator_res.choices[0].message.content)

        return {
            "status": "success",
            "stt_text": stt_text,
            "evaluation": eval_data.get("evaluation", {}),
            "selected_question_id": selection_data.get("selected_question_id", -1)
        }