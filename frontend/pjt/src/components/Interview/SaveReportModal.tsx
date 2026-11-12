import React, { useState } from 'react';
import { Save, X, Edit3, Loader } from 'lucide-react';
import ModalFrame from '../starter-modals/ModalFrame';

interface SaveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  isSaving: boolean;
}

const SaveReportModal: React.FC<SaveReportModalProps> = ({ isOpen, onClose, onSave, isSaving }) => {
  const [title, setTitle] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      alert('인터뷰 제목을 입력해주세요.');
      return;
    }
    onSave(title);
    // 성공 시에만 초기화하도록 상위 컴포넌트에서 관리
    // setTitle('');
  };

  return (
    <ModalFrame isOpen={isOpen} onClose={onClose}>
      <div className="p-10 text-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-2 font-mono">
              <Save size={12} /> Save to Log
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">기록 저장하기</h2>
          </div>

        </div>

        {/* Body */}
        <div className="space-y-6">
          <p className="text-zinc-400 text-sm font-medium leading-relaxed">
            마이페이지의 <span className="text-white">AI Interview Log</span>에서 확인할 수 있도록 <br/>리포트의 제목을 정해주세요.
          </p>
          
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
              <Edit3 size={18} />
            </div>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 프론트엔드 주니어 직무 면접"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all font-bold tracking-tight"
              autoFocus
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-4 mt-12">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="py-4 rounded-2xl font-black text-zinc-500 hover:bg-white/5 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:bg-indigo-800"
          >
            {isSaving ? (
              <>
                <Loader size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Report'
            )}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
};

export default SaveReportModal;