import React from 'react';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText?: string;
  type?: 'success' | 'error' | 'info';
}

const AlertModal: React.FC<AlertModalProps> = ({ 
  isOpen, onClose, title, description, 
  buttonText = "확인", type = 'success' 
}) => {
  if (!isOpen) return null;

  // 스타일 설정: "Less is More" - 장식을 줄이고 본질에 집중
  const styles = {
    success: {
      icon: <Check className="w-5 h-5 text-green-500" strokeWidth={3} />, // 아이콘 두께감 조정
      iconBg: 'bg-green-500/10 border border-green-500/20',
      button: 'bg-white text-zinc-950 hover:bg-zinc-200' // 순백색 버튼 (High Contrast)
    },
    error: {
      icon: <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={2.5} />,
      iconBg: 'bg-red-500/10 border border-red-500/20',
      button: 'bg-red-600 text-white hover:bg-red-500' // 에러는 경고색 유지
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-500" strokeWidth={2.5} />,
      iconBg: 'bg-blue-500/10 border border-blue-500/20',
      button: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
    }
  };

  const currentStyle = styles[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* 모달 컨테이너: 깊은 Zinc 배경 + 미세한 테두리 */}
      <div className="w-[360px] bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
        
        {/* 우측 상단 닫기 버튼 (선택 사항 - UX 편의성) */}
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          
          {/* 아이콘: 너무 크지 않게, 적절한 비율 (w-12 -> w-10) */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 ${currentStyle.iconBg}`}>
            {currentStyle.icon}
          </div>
          
          {/* 타이틀: 단단하고 명료하게 (tracking-tight) */}
          <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
            {title}
          </h3>
          
          {/* 설명: 가독성 확보 (text-zinc-400) */}
          <p className="text-zinc-400 text-[15px] leading-relaxed mb-8 break-keep whitespace-pre-line px-2">
            {description}
          </p>

          {/* 버튼: 꽉 차게, 높이감 적절히 */}
          <button 
            onClick={onClose}
            className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-all duration-200 transform active:scale-[0.98] outline-none ring-offset-2 focus:ring-2 ring-zinc-500 ring-offset-zinc-900 ${currentStyle.button}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;