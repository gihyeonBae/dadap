import type { PortfolioFile } from '../../../api/services/portfolioService';

export type PortfolioTab = 'RESUME' | 'PORTFOLIO';

export interface MyPortfolioProps {}

export interface PortfolioTabsProps {
  activeTab: PortfolioTab;
  onTabChange: (tab: PortfolioTab) => void;
}

export interface PortfolioListProps {
  files: PortfolioFile[];
  isLoading: boolean;
  activeTab: PortfolioTab;
  onDelete: (id: number) => void;
}
