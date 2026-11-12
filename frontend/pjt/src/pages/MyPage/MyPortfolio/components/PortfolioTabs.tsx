import React from 'react';
import { motion } from 'framer-motion';
import type { PortfolioTabsProps, PortfolioTab } from '../MyPortfolio.types';
import { STYLES } from '../MyPortfolio.constants';

export const PortfolioTabs: React.FC<PortfolioTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: PortfolioTab; label: string }[] = [
    { id: 'RESUME', label: '자기소개서' },
    { id: 'PORTFOLIO', label: '포트폴리오' }
  ];

  return (
    <div className={STYLES.tabsWrapper}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`${STYLES.tabBtnBase} ${
            activeTab === tab.id ? 'text-text-main' : 'text-text-muted hover:text-text-sub'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div 
              layoutId="activeTab"
              className={STYLES.activeTabIndicator} 
            />
          )}
        </button>
      ))}
    </div>
  );
};
