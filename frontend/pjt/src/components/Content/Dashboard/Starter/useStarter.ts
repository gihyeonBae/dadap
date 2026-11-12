import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../redux/store';
import { interviewService } from '../../../../api/interviewService';

export const useStarter = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const [activeModal, setActiveModal] = useState<'NONE' | 'DOCS' | 'CS'>('NONE');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1); // 1: Type Choice, 2: Method Choice, 3: Upload/History, 4: Final
  const [subMode, setSubMode] = useState<'MAIN' | 'NEW' | 'HISTORY'>('MAIN');
  
  const [selectedDocType, setSelectedDocType] = useState<'RESUME' | 'PORTFOLIO'>('RESUME');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileId, setFileId] = useState<number | null>(null);

  const displayDocType = selectedDocType === 'RESUME' ? '자기소개서' : '포트폴리오';

  const handleClose = () => {
    setActiveModal('NONE');
    setTimeout(() => {
      setCurrentStep(1);
      setSubMode('MAIN');
      setFileName(null);
      setFileId(null);
    }, 300);
  };

  const handleDocTypeSelect = (type: 'RESUME' | 'PORTFOLIO') => {
    setSelectedDocType(type);
    setCurrentStep(2);
  };

  const handleSave = (name: string, id?: number) => {
    setFileName(name);
    if (id) setFileId(id);
    setSubMode('MAIN');
    setCurrentStep(3); // Go to Final Step
  };

  const handleStartInterviewAPI = async (mode: 'practice' | 'real', docType: 'RESUME' | 'PORTFOLIO', id: number | null) => {
    if (!id) {
      alert('서류 ID가 없습니다. 서류를 선택하거나 새로 등록해주세요.');
      return;
    }

    try {
      const requestData = {
        interviewType: 'PORTFOLIO' as const,
        runMode: mode.toUpperCase() as 'PRACTICE' | 'REAL', // Convert to uppercase
        portfolioId: id, // Use the selected document ID
        targetQuestionCount: 5,
        optionJson: JSON.stringify({ difficulty: 'easy' }),
      };
      
      const response = await interviewService.createInterview(requestData);
      const interviewId = response.interviewId;

      handleClose(); // Close the modal
      navigate('/interview/check', { 
        state: { 
          mode,
          interviewType: 'PORTFOLIO',
          portfolioId: id,
          interviewId: interviewId, // Pass the new interviewId
          docName: fileName, // Pass the selected document name
          docType: docType, // Pass the selected document type
        } 
      });

    } catch (error) {
      console.error("면접 시작 API 호출 실패:", error);
      alert("면접 시작에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleNav = (path: string) => {
    navigate(path);
    // Starter는 모달을 직접 닫으므로 여기서는 setIsOpen을 호출하지 않습니다.
  };

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as { modal?: 'DOCS' | 'CS' } | undefined;
        if (detail?.modal === 'DOCS') setActiveModal('DOCS');
        if (detail?.modal === 'CS') setActiveModal('CS');
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('openStarterModal', handler as EventListener);
    return () => window.removeEventListener('openStarterModal', handler as EventListener);
  }, []);

  return {
    isLoggedIn,
    activeModal,
    setActiveModal,
    currentStep,
    setCurrentStep,
    subMode,
    setSubMode,
    selectedDocType,
    setSelectedDocType,
    fileName,
    setFileName,
    fileId,
    setFileId,
    displayDocType,
    handleClose,
    handleDocTypeSelect,
    handleSave,
    handleStartInterviewAPI,
    handleNav,
  };
};
