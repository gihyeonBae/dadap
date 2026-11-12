import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  // 정책 데이터 (내용 수정이 필요하면 여기서 편하게 하세요)
  const sections = [
    {
      title: "1. Introduction",
      content: "DADAP(이하 '서비스')은 이용자의 개인정보를 소중히 다루며, '정보통신망 이용촉진 및 정보보호 등에 관한 법률' 등 관련 법령을 준수합니다. 본 개인정보 처리방침은 DADAP이 제공하는 서비스 이용과 관련하여 이용자의 개인정보를 어떻게 수집, 이용, 보관하며 보호하는지 설명합니다."
    },
    {
      title: "2. Information We Collect",
      content: "서비스 제공을 위해 다음과 같은 최소한의 개인정보를 수집합니다.",
      list: [
        "필수 항목: 이메일 주소, 비밀번호, 닉네임 (회원가입 시)",
        "서비스 이용 기록: 접속 로그, 쿠키, 접속 IP 정보",
        "AI 면접 데이터: 모의 면접 진행 시 입력된 음성 데이터 및 텍스트 답변 (사용자 동의 하에 분석용으로만 사용)",
        "학습 데이터: CS Study Archive에 저장한 학습 기록 및 노트"
      ]
    },
    {
      title: "3. How We Use Information",
      content: "수집한 개인정보는 다음의 목적을 위해서만 이용됩니다.",
      list: [
        "회원 식별 및 서비스 이용 의사 확인",
        "AI 면접 피드백 생성 및 맞춤형 학습 콘텐츠 추천",
        "서비스 트래픽 분석 및 시스템 개선",
        "고객 문의 응대 및 중요 공지사항 전달"
      ]
    },
    {
      title: "4. Data Retention & Deletion",
      content: "이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용 목적이 달성되면 지체 없이 파기합니다. 단, 관계 법령에 의하여 보존할 필요가 있는 경우에는 일정 기간 동안 보존합니다. 회원은 언제든지 자신의 계정을 삭제(회원탈퇴)할 수 있으며, 이 경우 저장된 모든 면접 데이터와 포트폴리오는 즉시 파기됩니다."
    },
    {
      title: "5. Information Security",
      content: "DADAP은 이용자의 개인정보 보호를 위해 기술적/관리적 대책을 마련하고 있습니다. 비밀번호는 암호화되어 저장되며, 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출을 막기 위해 보안 프로그램을 설치하고 주기적인 점검을 수행합니다."
    },
    {
      title: "6. Contact Us",
      content: "개인정보 처리와 관련하여 궁금한 점이 있으시면 언제든지 문의해 주시기 바랍니다.",
      footerInfo: "Contact: privacy@dadap.com"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-6 sm:px-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* 메인으로 돌아가기 버튼 */}
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-zinc-500 hover:text-indigo-400 transition-colors mb-12 text-sm font-bold uppercase tracking-wider"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Main
        </button>

        {/* Header */}
        <div className="mb-16 border-b border-white/10 pb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            PRIVACY <span className="text-indigo-500">POLICY</span>
          </h1>
          <p className="text-zinc-400">
            Last updated: <span className="text-white font-medium">January 24, 2026</span>
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full block"></span>
                {section.title}
              </h2>
              <div className="pl-5 space-y-4">
                <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                  {section.content}
                </p>
                
                {/* 리스트가 있는 경우 렌더링 */}
                {section.list && (
                  <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm md:text-base marker:text-indigo-500">
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}

                {/* 하단 추가 정보가 있는 경우 */}
                {section.footerInfo && (
                  <p className="text-indigo-400 font-bold mt-2">
                    {section.footerInfo}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Footer Area */}
        <div className="mt-20 pt-8 border-t border-white/10 text-center text-zinc-500 text-sm">
          <p>By using DADAP, you agree to the collection and use of information in accordance with this policy.</p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;