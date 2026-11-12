import React from 'react';
import { FilePlus, History, ArrowRight, ChevronLeft } from 'lucide-react';

interface StepProps {
  title: string;
  onNew: () => void;
  onHistory: () => void;
  onBack: () => void; // [추가됨] 뒤로가기 함수 타입 정의
}

const Step1DocumentType: React.FC<StepProps> = ({ title, onNew, onHistory, onBack }) => {
  return (
    <div className="text-text-main animate-in slide-in-from-right duration-500 flex flex-col">
      
      <div className="px-8 pt-7 text-text-muted">
        <button 
            onClick={onBack} 
            className="flex items-center gap-2 hover:text-text-main transition-colors group"
        >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">이전으로</span>
        </button>
      </div>

      <div className="p-8 pt-4 flex flex-col">
        <div className="mb-8 text-center flex flex-col items-center">
          <h2 className="text-text-main text-xl font-bold mb-2 tracking-tight">{title} 등록</h2>
          <p className="text-text-sub text-sm leading-relaxed break-keep">면접 준비를 위해 서류를 등록하거나 선택해주세요.</p>
        </div>

        <div className="flex flex-col gap-3.5 mb-2">
          <button onClick={onNew} className="flex items-center justify-between p-5 bg-bg-card border border-border-subtle rounded-2xl hover:bg-bg-surface hover:border-accent-primary/50 transition-all group">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-accent-primary/10 rounded-xl group-hover:bg-accent-primary/20 transition-colors">
                <FilePlus className="w-6 h-6 text-accent-primary" />
              </div>
              <span className="font-bold text-base text-text-sub group-hover:text-text-main block">신규 파일 업로드</span>
            </div>
            <ArrowRight className="w-5 h-5 text-text-muted/20 group-hover:translate-x-1 group-hover:text-text-main transition-all" />
          </button>

          <button onClick={onHistory} className="flex items-center justify-between p-5 bg-bg-card border border-border-subtle rounded-2xl hover:bg-bg-surface hover:border-accent-secondary/50 transition-all group">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-accent-secondary/10 rounded-xl group-hover:bg-accent-secondary/20 transition-colors">
                <History className="w-6 h-6 text-accent-secondary" />
              </div>
              <span className="font-bold text-base text-text-sub group-hover:text-text-main block">기존 내역에서 선택</span>
            </div>
            <ArrowRight className="w-5 h-5 text-text-muted/20 group-hover:translate-x-1 group-hover:text-text-main transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1DocumentType;