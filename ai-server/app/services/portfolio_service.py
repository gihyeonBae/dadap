import json
import asyncio
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.prompts import PORTFOLIO_SYSTEM_PROMPT, PORTFOLIO_USER_PROMPT_TEMPLATE
from app.utils.file_parser import clean_and_prepare


class PortfolioService:
    def __init__(self):
        client_kwargs = {"api_key": settings.OPENAI_API_KEY}
        if settings.OPENAI_API_BASE:
            client_kwargs["base_url"] = settings.OPENAI_API_BASE
        self.client = AsyncOpenAI(**client_kwargs)

    async def generate_questions(self, document_text: str):
        """
        총 6세트의 질문을 확보하기 위해 반복 호출합니다.
        전략: 1회 호출당 3세트 생성 * 2회 반복 = 딱 6개 (낭비 없음)
        [개선점] 꼬리 질문의 내용까지 '문맥(Context)'으로 저장하여 중복 완벽 차단.
        """
        # 1. 전처리
        try:
            document_text = clean_and_prepare(document_text)
            if not document_text:
                return {"questions": [], "error": "문서 내용이 비어있습니다."}
        except Exception as e:
            print(f"⚠️ 문서 전처리 중 오류 발생, 원문 사용: {e}")

        all_questions = []
        
        # [핵심 변경] 단순 Topic Set이 아니라, 질문 내용을 담는 리스트로 변경
        accumulated_context = [] 
        
        target_count = 6
        max_retries = 3 

        for i in range(max_retries):
            # 6개 다 찼으면 칼같이 종료
            if len(all_questions) >= target_count:
                break

            print(f"🔄 [질문 생성] {i+1}번째 배치 요청 중... (현재 {len(all_questions)}/{target_count}개)")
            
            # [중복 방지 로직 강화]
            if accumulated_context:
                # 리스트를 줄바꿈 문자열로 변환하여 AI에게 전달
                context_str = "\n".join(accumulated_context)
                previous_questions_text = f"""
                [History - Critical Constraint]
                이미 생성된 질문 목록입니다. 아래 내용과 겹치는 질문은 절대 생성하지 마세요:
                
                {context_str}
                
                ⛔ 위 목록에 있는 '주제'는 물론, '질문 내용(Main/Tail)'과 유사한 맥락도 피하세요.
                완전히 새로운 기술 스택, 새로운 에피소드를 찾아내세요.
                """
            else:
                previous_questions_text = "없음 (첫 번째 요청)"

            try:
                # 2. 프롬프트 조립
                user_prompt = PORTFOLIO_USER_PROMPT_TEMPLATE.format(
                    document_text=document_text,
                    previous_questions=previous_questions_text
                )

                # 3. GPT 호출 (온도를 조금씩 높여 다양성 확보)
                current_temp = min(0.8 + (i * 0.15), 1.1)

                response = await self.client.chat.completions.create(
                    model="gpt-4o-mini", 
                    messages=[
                        {"role": "system", "content": PORTFOLIO_SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=current_temp
                )
                
                # 4. 결과 파싱 및 안전장치
                content = response.choices[0].message.content
                if not content: continue
                
                # 가끔 GPT가 ```json 등을 붙일 때 제거
                if content.startswith("```"):
                    content = content.replace("```json", "").replace("```", "")

                batch_result = json.loads(content)
                new_questions = batch_result.get("questions", [])
                
                if not new_questions: continue

                # 5. 결과 합치기 및 [문맥 수집]
                for q in new_questions:
                    if len(all_questions) >= target_count:
                        break
                        
                    all_questions.append(q)
                    
                    # [여기가 핵심!] Topic + Main Question + Tail Keywords까지 싹 긁어 모으기
                    topic = q.get("topic", "No Topic")
                    main_q = q.get("parent_question", "")
                    
                    # 꼬리 질문 내용 요약 (앞부분 30자 정도만 가져와도 충분함)
                    tail_summary = ""
                    if "tail_questions" in q:
                        tails = [t.get("content", "")[:30] for t in q["tail_questions"]]
                        tail_summary = " / ".join(tails)
                    
                    # "주제 (질문내용... / 꼬리질문...)" 형태로 저장 -> 다음 턴 프롬프트에 들어감
                    context_entry = f"- 주제: {topic} (Main: {main_q[:40]}... | Tail: {tail_summary}...)"
                    accumulated_context.append(context_entry)
                    
                    print(f"   📌 학습된 문맥: {context_entry}")

            except json.JSONDecodeError:
                print(f"❌ JSON 파싱 실패: {i+1}번째 시도.")
            except Exception as e:
                print(f"❌ {i+1}번째 배치 생성 중 오류: {e}")

        print(f"✅ 최종 확보된 질문 개수: {len(all_questions)}개")
        
        return {"questions": all_questions[:target_count]}