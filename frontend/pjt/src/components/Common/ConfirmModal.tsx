import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  theme?: 'blue' | 'red'; // 테마 선택 (Practice=Blue, Real=Red)
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, onClose, onConfirm, title, description, 
  confirmText = "확인", cancelText = "취소",
  theme = 'blue' 
}) => {
  if (!isOpen) return null;

  // 테마별 스타일 정의
  const styles = {
    blue: {
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      borderColor: 'border-zinc-800',
      confirmBtn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20',
    },
    red: {
      iconBg: 'bg-red-500/10 border border-red-500/20',
      iconColor: 'text-red-500',
      borderColor: 'border-red-900/30',
      confirmBtn: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-900/30',
    }
  };

  const currentStyle = styles[theme];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-[400px] bg-[#1A1A1A] border ${currentStyle.borderColor} rounded-2xl p-8 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200`}>
        <div className="flex flex-col items-center text-center">
          {/* 아이콘 */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 ${currentStyle.iconBg}`}>
            <CheckCircle2 className={`w-6 h-6 ${currentStyle.iconColor}`} />
          </div>
          
          {/* 텍스트 */}
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8 whitespace-pre-line">
            {description}
          </p>

          {/* 버튼 그룹 */}
          <div className="flex w-full gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all ${currentStyle.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;