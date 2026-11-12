import React from 'react';
import { motion } from 'framer-motion';
import { FolderUp, ChevronLeft, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import type { UploadFormProps } from './Step2HistoryList.types';
import { STYLES, UPLOAD_FORM_VARIANTS } from './Step2HistoryList.constants';
import { useStep2UploadForm } from './useStep2UploadForm';

const Step2UploadForm: React.FC<UploadFormProps> = ({ type, uploadType, onBack, onConfirm }) => {
  const {
    file,
    setFile,
    isAnalyzing,
    isDone,
    error,
    handleStartAnalysis
  } = useStep2UploadForm({ uploadType, onConfirm });

  return (
    <motion.div
      variants={UPLOAD_FORM_VARIANTS}
      initial="hidden"
      animate="visible"
      className="text-text-main animate-in fade-in zoom-in duration-300 flex flex-col"
    >
      {!isAnalyzing && !isDone ? (
        <>
          <div className="text-text-muted">
            <button onClick={onBack} className={STYLES.backButton}>
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">이전으로</span>
            </button>
          </div>

          <div className="p-8 pt-4 flex flex-col flex-grow">
            <h3 className={STYLES.header}>{type} 신규 등록</h3>
            
            <label className={STYLES.uploadLabel}>
              <FolderUp className={STYLES.uploadIcon} />
              <span className={STYLES.uploadFileName}>
                {file ? file.name : "클릭하거나 파일을 드래그하여 업로드"}
              </span>
              <input type="file" className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
            </label>

            {error && (
              <div className={STYLES.errorAlert}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className={STYLES.errorText}>{error}</p>
              </div>
            )}

            <div className="mt-auto">
              <button 
                disabled={!file}
                onClick={handleStartAnalysis}
                className={`${file ? STYLES.confirmButtonActive : STYLES.confirmButtonInactive}`}
              >
                분석 시작
              </button>
            </div>
          </div>
        </>
      ) : isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-500 flex-grow">
          <div className="relative mb-8">
            <Loader2 className={STYLES.aiAnalyzingIcon} />
            <Sparkles className={STYLES.sparklesIcon} />
          </div>
          <h3 className={STYLES.aiAnalyzingTitle}>AI 서류 분석 중</h3>
          <p className={STYLES.aiAnalyzingMessage}>
            면접 질문 생성을 위해 내용을 파악하고 있어요...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-500 flex-grow">
          <CheckCircle2 className={STYLES.analysisDoneIcon} />
          <h3 className={STYLES.analysisDoneTitle}>분석 완료!</h3>
          <p className={STYLES.analysisDoneMessage}>데이터가 성공적으로 등록되었습니다.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Step2UploadForm;