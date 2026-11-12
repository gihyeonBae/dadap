import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FilePlus } from 'lucide-react';

import MyPageHeader from '../../../components/MyPage/MyPageHeader';
import ModalFrame from '../../../components/starter-modals/ModalFrame';
import Step2UploadForm from '../../../components/starter-modals/Step2UploadForm';

import { useMyPortfolio } from './useMyPortfolio';
import { MY_PORTFOLIO_VARIANTS, STYLES } from './MyPortfolio.constants';
import { PortfolioTabs } from './components/PortfolioTabs';
import { PortfolioList } from './components/PortfolioList';

const MyPortfolio: React.FC = () => {
  const {
    files,
    isLoading,
    activeTab,
    setActiveTab,
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadType,
    handleUploadClick,
    handleUploadConfirm,
    handleDelete
  } = useMyPortfolio();

  return (
    <motion.div 
      variants={MY_PORTFOLIO_VARIANTS}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <MyPageHeader
        title="DOCS"
        description="Manage your resumes and portfolios in one place."
      >
        <div className={STYLES.headerActionWrapper}>
          <button 
            onClick={() => handleUploadClick('RESUME')}
            className={STYLES.resumeBtn}
          >
            <FilePlus size={18} />
            <span className="text-sm text-nowrap">Add Resume</span>
          </button>
          <button 
            onClick={() => handleUploadClick('PORTFOLIO')}
            className={STYLES.portfolioBtn}
          >
            <Upload size={18} />
            <span className="text-sm text-nowrap">Add Portfolio</span>
          </button>
        </div>
      </MyPageHeader>

      <PortfolioTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <PortfolioList 
        files={files}
        isLoading={isLoading}
        activeTab={activeTab}
        onDelete={handleDelete}
      />

      <ModalFrame isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
        <div className="w-full max-w-xl mx-auto py-4">
          <Step2UploadForm 
            type={uploadType === 'RESUME' ? '자기소개서' : '포트폴리오'} 
            uploadType={uploadType}
            onBack={() => setIsUploadModalOpen(false)} 
            onConfirm={handleUploadConfirm} 
          />
        </div>
      </ModalFrame>
    </motion.div>
  );
};

export default MyPortfolio;


