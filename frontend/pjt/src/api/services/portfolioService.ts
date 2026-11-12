import axiosInstance from '../axiosInstance';
import type { GlobalApiResponse } from '../../types/api/common';

export interface PortfolioUploadResponse {
  message: string;
  portfolioId: number;
}

export interface PortfolioFile {
  id: number;
  title: string;
  fileUrl: string;
  createdAt: string;
  type: 'RESUME' | 'PORTFOLIO';
  originalFilename?: string;
}

export interface PortfoliosResponse {
  count: number;
  portfolios: PortfolioFile[];
}

export interface PortfolioQuestion {
  id: number;
  content: string;
  intent: string;
  topic: string | null;
  depth: number;
  children: PortfolioQuestion[];
}

export interface PortfolioQuestionsResponse {
  portfolioId: number;
  count: number;
  questions: PortfolioQuestion[];
}

export const portfolioService = {
  uploadPortfolio: async (file: File, userId: string, type: 'RESUME' | 'PORTFOLIO', title?: string): Promise<PortfolioUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', type);
    if (title) {
      formData.append('title', title);
    }

    return axiosInstance.post('/api/v1/portfolios', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getPortfolioQuestions: async (portfolioId: number): Promise<PortfolioQuestionsResponse> => {
    return axiosInstance.get(`/api/v1/portfolios/${portfolioId}/questions`);
  },

  getPortfolios: async (userId: string, type?: 'RESUME' | 'PORTFOLIO'): Promise<PortfoliosResponse> => {
    const params: Record<string, string> = { userId };
    if (type) {
      params.type = type;
    }
    return axiosInstance.get('/api/v1/portfolios', { params });
  },

  deletePortfolio: async (portfolioId: number, userId: string): Promise<any> => {
    return axiosInstance.delete(`/api/v1/portfolios/${portfolioId}`, {
      params: { userId },
    });
  },
};
