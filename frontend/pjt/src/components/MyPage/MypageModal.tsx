import React from 'react';
import MypageModalFrame from './MypageModalFrame';

interface MypageModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info' | 'confirm';
  title?: string;
  buttonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmType?: 'success' | 'error' | 'info';
}

const MypageModal: React.FC<MypageModalProps> = ({
  open,
  message,
  onClose,
  type = 'info', // 기본값 변경: success -> info
  title,
  buttonText,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
  confirmType = 'success',
}) => {
  const defaultTitle = type === 'success' ? '성공' : type === 'error' ? '오류 발생' : type === 'confirm' ? '확인' : '알림';

  if (type === 'confirm') {
    return (
      <MypageModalFrame
        open={open}
        onClose={onClose}
        type={type}
        title={title || defaultTitle}
        message={message}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        confirmType={confirmType}
      />
    );
  }

  return (
    <MypageModalFrame
      open={open}
      onClose={onClose}
      type={type}
      title={title || defaultTitle}
      message={message}
      buttonText={buttonText}
    />
  );
};

export default MypageModal;