import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { portfolioService } from '../../api/services/portfolioService';
import type { UploadFormProps } from './Step2HistoryList.types';

export const useStep2UploadForm = ({ uploadType, onConfirm }: Pick<UploadFormProps, 'uploadType' | 'onConfirm'>) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useSelector((state: RootState) => state.auth);

  const handleStartAnalysis = async () => {
    if (!file || !userId) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await portfolioService.uploadPortfolio(file, userId, uploadType, file.name);
      
      setIsAnalyzing(false);
      setIsDone(true);
      
      setTimeout(() => {
        onConfirm(file.name, response.portfolioId);
      }, 1500);
    } catch (err: any) {
      console.error('Portfolio upload failed:', err);
      setIsAnalyzing(false);
      
      const errorMessage = err.response?.data?.message || '분석 중 오류가 발생했습니다. 다시 시도해주세요.';
      
      if (err.response?.status === 400) {
        if (errorMessage.includes('텍스트를 추출할 수 없습니다')) {
          setError('파일에서 텍스트를 추출할 수 없습니다. 스캔 이미지가 아닌 텍스트 기반 PDF를 사용해주세요.');
        } else if (errorMessage.includes('지원하지 않는 파일 형식')) {
          setError('지원하지 않는 파일 형식입니다. PDF, DOCX, TXT 파일만 업로드 가능합니다.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
    }
  };

  return {
    file,
    setFile,
    isAnalyzing,
    isDone,
    error,
    handleStartAnalysis
  };
};
