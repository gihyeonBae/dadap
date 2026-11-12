import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { portfolioService, type PortfolioFile } from '../../api/services/portfolioService';
import type { Step2HistoryListProps } from './Step2HistoryList.types';
import type { RootState } from '../../redux/store';

export const useStep2HistoryList = ({ type }: Pick<Step2HistoryListProps, 'type'>) => {
  const [histories, setHistories] = useState<PortfolioFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<PortfolioFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { userId } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchHistories = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const apiType = type === '자기소개서' ? 'RESUME' : 'PORTFOLIO';
        const response = await portfolioService.getPortfolios(userId, apiType);
        
        if (response && Array.isArray(response.portfolios)) {
          setHistories(response.portfolios);
        } else {
          setHistories([]);
        }
      } catch (err) {
        console.error("Failed to fetch histories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistories();
  }, [userId, type]);

  return {
    histories,
    selectedFile,
    setSelectedFile,
    isLoading
  };
};
