import { PortfolioFile } from '../../api/services/portfolioService';

export interface Step2HistoryListProps {
  type: string;
  onBack: () => void;
  onConfirm: (name: string, id: number) => void;
}

export interface UploadFormProps {
  type: string; // Display label (e.g., '자기소개서', '포트폴리오')
  uploadType: 'RESUME' | 'PORTFOLIO'; // API type
  onBack: () => void;
  onConfirm: (name: string, id: number) => void;
}
