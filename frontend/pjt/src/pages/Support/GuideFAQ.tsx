import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ useNavigate 임포트

// FAQ 데이터 타입 정의
interface FAQItem {
  question: string;
  answer: string;
}

// 가이드 데이터 타입 정의
interface GuideStep {
  step: string;
  title: string;
  description: string;
}

const GuideFAQ: React.FC = () => {
  const navigate = useNavigate(); // ✅ 네비게이트 훅 사용
  
  // FAQ 토글 상태 관리
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // --- 컨텐츠 데이터 ---
  const guides: GuideStep[] = [
    {
      step: "01",
      title: "CS 지식 아카이빙",
      description: "CS Study Archive에서 중요한 기술 면접 질문들을 학습하고 나만의 답변을 정리하여 포트폴리오를 준비하세요."
    },
    {
      step: "02",
      title: "AI 모의 면접 설정",
      description: "원하는 기술 스택(Frontend, Backend, AI 등)과 난이도를 선택하여 실제 면접과 유사한 환경을 설정합니다."
    },
    {
      step: "03",
      title: "실전 인터뷰 진행",
      description: "AI 면접관의 질문에 마이크를 통해 음성으로 답변하거나 텍스트로 입력하세요. 꼬리물기 질문에도 대비해야 합니다."
    },
    {
      step: "04",
      title: "피드백 및 분석",
      description: "면접이 끝나면 AI가 답변의 논리성, 기술 정확도, 태도를 분석하여 상세한 피드백 리포트를 제공합니다."
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: "DADAP의 AI 면접은 어떤 모델을 사용하나요?",
      answer: "DADAP은 최신 LLM 모델을 기반으로 개발자 면접에 특화된 파인튜닝을 거쳤습니다. 단순한 키워드 매칭이 아닌, 답변의 맥락과 논리적 흐름을 분석하여 피드백을 제공합니다."
    },
    {
      question: "면접 기록은 어디에 저장되나요?",
      answer: "모든 면접 기록과 피드백은 'Docs' 또는 'My Page'에 자동으로 아카이빙됩니다. 언제든지 지난 면접을 복기하고 부족한 부분을 보완할 수 있습니다."
    },
    {
      question: "서비스 이용료는 무료인가요?",
      answer: "기본적인 CS 학습과 하루 일정 횟수의 AI 면접 연습은 무료로 제공됩니다. 심화 분석 기능이나 무제한 면접 연습은 추후 멤버십 플랜으로 제공될 예정입니다."
    },
    {
      question: "오류가 발생하거나 건의사항이 있어요.",
      answer: "우측 하단의 'Contact Us'를 이용하거나 support@dadap.com으로 메일을 보내주세요. 개발팀이 빠르게 확인 후 조치해 드립니다."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-6 sm:px-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* ✅ [추가됨] 메인으로 돌아가기 버튼 */}
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-zinc-500 hover:text-indigo-400 transition-colors mb-12 text-sm font-bold uppercase tracking-wider"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Main
        </button>

        <div className="space-y-20">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              GUIDE <span className="text-indigo-500">&</span> FAQ
            </h1>
            <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              DADAP을 200% 활용하는 방법과 자주 묻는 질문들을 모았습니다.<br/>
              개발자 면접 준비, 이제 AI와 함께 체계적으로 시작하세요.
            </p>
          </div>

          {/* 1. Guide Section */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white border-l-4 border-indigo-600 pl-4">
              How to use DADAP
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guides.map((guide, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group">
                  <div className="text-3xl font-black text-white/10 group-hover:text-indigo-500/50 transition-colors mb-4">
                    {guide.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{guide.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {guide.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. FAQ Section */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white border-l-4 border-indigo-600 pl-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                  <button 
                    onClick={() => toggleFAQ(idx)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-sm md:text-base text-zinc-200">
                      <span className="text-indigo-500 mr-3">Q.</span>
                      {faq.question}
                    </span>
                    <span className={`transform transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      openIndex === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-6 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center py-12 border-t border-white/10 mt-12">
            <p className="text-zinc-400 mb-6">더 궁금한 점이 있으신가요?</p>
            <div className="flex justify-center gap-4">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]">
                Contact Support Team
              </button>
              {/* 하단에도 메인으로 가는 버튼을 작게 추가하고 싶다면 이 주석을 해제하세요 */}
              {/* <button onClick={() => navigate('/')} className="border border-white/20 text-white font-bold py-3 px-8 rounded-full hover:bg-white/5 transition-all">
                Go to Main
              </button> */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuideFAQ;