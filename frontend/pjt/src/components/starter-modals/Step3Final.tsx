import React from 'react';
import { Rocket, CheckCircle2, ChevronLeft, Sparkles, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StepFinalProps {
  docName: string | null; // The name of the selected document (resume or portfolio)
  docId: number | null;   // The ID of the selected document
  docType: 'RESUME' | 'PORTFOLIO'; // The type of the selected document
  onStartInterview: (mode: 'practice' | 'real', docType: 'RESUME' | 'PORTFOLIO', id: number | null) => void;
  onBack: () => void;
}

const Step3Final: React.FC<StepFinalProps> = ({ docName, docId, docType, onStartInterview, onBack }) => {
  const navigate = useNavigate();

  // 모드 선택 핸들러
  const handleSelectMode = (mode: 'practice' | 'real') => {
    onStartInterview(mode, docType, docId);
  };

  return (
    <div className="text-text-main text-center animate-in zoom-in duration-500 flex flex-col">
      
      {/* 상단 뒤로가기 버튼 */}
      <div className="px-8 pt-7 text-left">
        <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors group"
        >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">이전으로</span>
        </button>
      </div>

      <div className="px-8 pt-4 pb-12 flex flex-col items-center">
        {/* 상단 아이콘 */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-primary/10 rounded-full mb-4">
            <Rocket className="w-7 h-7 text-accent-primary animate-pulse" />
        </div>
        
        <h2 className="text-xl font-bold mb-2 tracking-tight">준비 완료!</h2>
        <p className="text-text-sub mb-8 text-sm leading-relaxed">면접 방식을 선택해주세요.</p>

        {/* 서류 상태 확인창 */}
        <div className="w-full bg-bg-card border border-border-subtle rounded-xl p-3.5 px-4 mb-6 text-left">
            <div className="flex items-center justify-between">
                <span className="text-text-muted font-bold text-[10px] uppercase tracking-wider">{docType === 'RESUME' ? '자기소개서' : '포트폴리오'}</span>
                <span className="font-bold flex items-center gap-2 text-xs truncate max-w-[200px]">
                    <span className="text-text-main truncate">{docName || "미등록"}</span> 
                    {docName && <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />}
                </span>
            </div>
        </div>

        {/* 모드 선택 버튼 영역 (2열 그리드) */}
        <div className="grid grid-cols-2 gap-3 w-full">
            
            {/* 1. 연습 모드 */}
            <button 
                onClick={() => handleSelectMode('practice')}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-primary hover:bg-bg-surface hover:scale-[1.01] transition-all duration-300"
            >
                <div className="mb-2 p-2 rounded-full bg-accent-primary/10 text-accent-primary group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-text-main">연습 모드</h3>
                <p className="text-[10px] text-text-muted text-center leading-tight mt-1">
                    AI 힌트/피드백<br/>자유로운 환경
                </p>
            </button>

            {/* 2. 실전 모드 */}
            <button 
                onClick={() => handleSelectMode('real')}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-neon hover:bg-bg-surface hover:scale-[1.01] transition-all duration-300"
            >
                <div className="mb-2 p-2 rounded-full bg-accent-neon/10 text-accent-neon group-hover:scale-105 transition-transform">
                    <Swords className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-text-main">실전 모드</h3>
                <p className="text-[10px] text-text-muted text-center leading-tight mt-1">
                    힌트 없는<br/>실제 면접 환경
                </p>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Step3Final;