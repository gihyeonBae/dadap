import React from 'react';
import { X } from 'lucide-react';

interface ModalFrameProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalFrame: React.FC<ModalFrameProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-8 bg-bg-main/70 backdrop-blur-md">
      
      <div className="relative z-[1001] w-full max-w-lg max-h-[calc(100vh-4rem)] flex flex-col bg-bg-surface border border-border-main rounded-xl shadow-lg animate-in fade-in zoom-in duration-300 overflow-hidden">
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-5 right-6 text-text-muted hover:text-text-main transition-colors z-[70] p-2 hover:bg-bg-card rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalFrame;