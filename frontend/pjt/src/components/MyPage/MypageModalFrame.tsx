import React from 'react';
import { createPortal } from 'react-dom';
import MypageIcon from './MypageIcon';

interface MypageModalFrameProps {
  open: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info' | 'confirm';
  title: string;
  message: string;
  buttonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmType?: 'success' | 'error' | 'info'; // 확인/취소 모드의 경고 스타일 지정
}

const typeColors = {
  success: 'border-green-500/40',
  error: 'border-red-500/40',
  info: 'border-blue-500/40',
  confirm: 'border-blue-500/40',
};

const MypageModalFrame: React.FC<MypageModalFrameProps> = ({
  open, onClose, type, title, message, buttonText = '확인', onConfirm, onCancel, confirmText = '확인', cancelText = '취소', confirmType = 'success'
}) => {
  if (!open) return null;

  const confirmBtnClass = confirmType === 'error'
    ? "flex-1 py-3 rounded-xl font-bold transition-all bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
    : "flex-1 py-3 rounded-xl font-bold transition-all bg-accent-primary text-white hover:bg-accent-primary/90 shadow-lg shadow-accent-primary/20";
  const cancelBtnClass = "flex-1 py-3 rounded-xl font-bold transition-all bg-bg-card border border-border-main text-text-sub hover:text-text-main hover:bg-bg-surface";

  const iconType = type === 'confirm' ? (confirmType || 'info') : type;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-main/80 animate-in fade-in duration-200">
      <div className={`w-[370px] bg-bg-surface border border-border-main rounded-xl p-8 shadow-lg relative`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-main/80 transition-colors">
          <span className="text-2xl font-bold">×</span>
        </button>
        <div className="flex flex-col items-center text-center mt-2">
          <MypageIcon type={iconType} />
          <h3 className="text-text-main mb-2 tracking-tight">{title}</h3>
          <p className="text-text-sub text-sm leading-relaxed mb-8 break-keep whitespace-pre-line px-2">{message}</p>
          {type === 'confirm' ? (
            <div className="flex w-full gap-3">
              <button
                onClick={onConfirm}
                className={confirmBtnClass}
              >
                {confirmText}
              </button>
              <button
                onClick={onCancel || onClose}
                className={cancelBtnClass}
              >
                {cancelText}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold transition-all bg-accent-primary text-white hover:bg-accent-primary/90 shadow-lg shadow-accent-primary/20"
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MypageModalFrame;
