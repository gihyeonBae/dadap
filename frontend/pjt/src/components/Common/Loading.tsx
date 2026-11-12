import React from 'react';
import LoadingLogo from './LoadingLogo';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-bg-main flex flex-col items-center justify-center z-50 overflow-hidden">
      
      {/* 마스코트 이미지와 흰색 원형 배경 */}
      <div className="relative w-80 h-80 flex items-center justify-center animate-float-pulse">
        {/* 흰색 원형 배경 - 시맨틱한 bg-bg-surface 적용 및 테두리 추가 */}
        <div className="absolute w-64 h-64 bg-bg-surface border border-border-main rounded-full opacity-100 shadow-xl"></div>
        {/* 고양이 마스코트 (z-index로 흰색 원형 위에 오도록 설정) */}
        <img
          src="/images/cat_mascot.png"
          alt="서비스 로딩 중..."
          className="relative z-10 w-full h-full object-contain"
        />
      </div>

      {/* 로딩 전용 로고 컴포넌트 */}
      <div className="mt-4">
        <LoadingLogo />
      </div>
      
      {/* 로딩 텍스트 - 시맨틱한 text-text-main 및 text-h3 적용 */}
      <p className="mt-8 text-text-main text-h3 font-semibold">
        서비스를 준비 중입니다...
      </p>
      
      <style>{`
        @keyframes float-pulse {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-10px) scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-float-pulse {
          animation: float-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loading;
