import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { portfolioService, type PortfolioFile } from '../../../api/services/portfolioService';
import { type RootState } from '../../../redux/store';
import type { PortfolioTab } from './MyPortfolio.types';

export const useMyPortfolio = () => {
  const { userId } = useSelector((state: RootState) => state.auth);
  const [files, setFiles] = useState<PortfolioFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PortfolioTab>('RESUME');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<PortfolioTab>('RESUME');

  const fetchFiles = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const response = await portfolioService.getPortfolios(userId, activeTab);
      
      if (response && Array.isArray(response.portfolios)) {
        setFiles(response.portfolios);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Failed to fetch portfolio files:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [userId, activeTab]);

  const handleUploadClick = (type: PortfolioTab) => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  const handleUploadConfirm = () => {
    setIsUploadModalOpen(false);
    fetchFiles();
  };

  const handleDelete = async (id: number) => {
    if (!userId) return;
    if (window.confirm("정말로 이 파일을 삭제하시겠습니까?")) {
      try {
        await portfolioService.deletePortfolio(id, userId);
        setFiles(prev => prev.filter(f => f.id !== id));
      } catch (error) {
        console.error("Failed to delete portfolio:", error);
        alert("파일 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return {
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
  };
};
