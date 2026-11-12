import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, FileText, Loader2 } from 'lucide-react';
import type { Step2HistoryListProps } from './Step2HistoryList.types';
import { STYLES, HISTORY_LIST_VARIANTS } from './Step2HistoryList.constants';
import { useStep2HistoryList } from './useStep2HistoryList';

export default function Step2HistoryList({ type, onBack, onConfirm }: Step2HistoryListProps) {
  const { histories, selectedFile, setSelectedFile, isLoading } = useStep2HistoryList({ type });

  return (
    <motion.div
      variants={HISTORY_LIST_VARIANTS}
      initial="hidden"
      animate="visible"
      className="text-text-main animate-in fade-in zoom-in duration-300 flex flex-col"
    >
      <div className="text-text-muted">
        <button onClick={onBack} className={STYLES.backButton}>
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">이전으로</span>
        </button>
      </div>

      <div className="p-8 pt-4 flex flex-col flex-grow">
        <h3 className={STYLES.header}>기존 {type} 선택</h3>
        
        <div className={STYLES.listContainer}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 className={STYLES.loaderIcon} />
              <p className={STYLES.loadingText}>목록을 불러오는 중...</p>
            </div>
          ) : histories.length > 0 ? (
            histories.map((file) => (
              <button 
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`${STYLES.listItemBase} ${
                  selectedFile?.id === file.id ? STYLES.listItemActive : STYLES.listItemInactive
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <FileText className={`w-4 h-4 flex-shrink-0 ${selectedFile?.id === file.id ? STYLES.fileIconActive : STYLES.fileIconInactive}`} />
                  <div className="flex flex-col items-start truncate">
                    <span className={`${STYLES.fileNameInactive} ${selectedFile?.id === file.id ? STYLES.fileNameActive : ''}`}>
                      {file.title}
                    </span>
                    <span className={STYLES.fileDate}>
                      {file.createdAt.split('T')[0]}
                    </span>
                  </div>
                </div>
                {selectedFile?.id === file.id && <div className={STYLES.checkIconWrapper}><Check className={STYLES.checkIcon} /></div>}
              </button>
            ))
          ) : (
            <div className={STYLES.emptyStateWrapper}>
              <p className={STYLES.emptyStateText}>등록된 {type}가 없습니다.</p>
            </div>
          )}
        </div>

        <div className="flex mt-auto">
          <button 
            disabled={!selectedFile}
            onClick={() => selectedFile && onConfirm(selectedFile.title, selectedFile.id)}
            className={`${selectedFile ? STYLES.confirmButtonActive : STYLES.confirmButtonInactive}`}
          >
            선택 완료
          </button>
        </div>
      </div>
    </motion.div>
  );
}
