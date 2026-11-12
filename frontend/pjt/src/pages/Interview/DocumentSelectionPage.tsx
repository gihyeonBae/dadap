import React, { useEffect } from 'react';
import ModalFrame from '../../components/starter-modals/ModalFrame';
import Step1SelectDocType from '../../components/starter-modals/Step1SelectDocType/Step1SelectDocType';
import Step1DocumentType from '../../components/starter-modals/Step1DocumentType';
import Step2UploadForm from '../../components/starter-modals/Step2UploadForm';
import Step2HistoryList from '../../components/starter-modals/Step2HistoryList';
import Step3Final from '../../components/starter-modals/Step3Final';
import { useStarter } from '../../components/Content/Dashboard/Starter/useStarter';
import { useNavigate } from 'react-router-dom';

const DocumentSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    setCurrentStep,
    subMode,
    setSubMode,
    selectedDocType,
    fileName,
    fileId,
    displayDocType,
    handleDocTypeSelect,
    handleSave,
    handleStartInterviewAPI,
    setActiveModal,
  } = useStarter();

  // This page is a replacement for the modal, so we force it open on mount.
  // The useStarter hook listens for a global event, but we can call it directly.
  useEffect(() => {
    setActiveModal('DOCS');
  }, [setActiveModal]);


  const handleCloseAndGoBack = () => {
    navigate('/');
  };

  return (
    // The ModalFrame provides its own overlay
    <ModalFrame isOpen={true} onClose={handleCloseAndGoBack}>
      <div className="w-full">
        <div className="relative z-20">
          {currentStep === 1 && (
            <Step1SelectDocType 
              onSelect={handleDocTypeSelect}
              onBack={handleCloseAndGoBack}
            />
          )}
          
          {currentStep === 2 && subMode === 'MAIN' && (
            <Step1DocumentType 
              title={displayDocType}
              onNew={() => setSubMode('NEW')}
              onHistory={() => setSubMode('HISTORY')}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {subMode === 'NEW' && (
            <Step2UploadForm 
              type={displayDocType} 
              uploadType={selectedDocType}
              onBack={() => setSubMode('MAIN')} 
              onConfirm={handleSave} 
            />
          )}

          {subMode === 'HISTORY' && (
            <Step2HistoryList 
              type={displayDocType} 
              onBack={() => setSubMode('MAIN')} 
              onConfirm={handleSave} 
            />
          )}

          {currentStep === 3 && (
            <Step3Final 
              docName={fileName} 
              docId={fileId}     
              docType={selectedDocType} 
              onBack={() => {
                if (fileId) {
                  setCurrentStep(2);
                } else {
                  setCurrentStep(2); 
                }
              }}
              onStartInterview={handleStartInterviewAPI} 
            />
          )}
        </div>
      </div>
    </ModalFrame>
  );
};

export default DocumentSelectionPage;