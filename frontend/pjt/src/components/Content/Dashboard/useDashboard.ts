import { useState, useRef, useEffect } from 'react';
import { DASHBOARD_TABS } from './Dashboard.constants';

export const useDashboard = () => {
  const [activeTab, setActiveTab] = useState(DASHBOARD_TABS[0].id);
  const [direction, setDirection] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tabId: string) => {
    const currentIndex = DASHBOARD_TABS.findIndex(tab => tab.id === activeTab);
    const nextIndex = DASHBOARD_TABS.findIndex(tab => tab.id === tabId);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setActiveTab(tabId);
  };

  useEffect(() => {
    const navNode = navRef.current;
    if (navNode) {
      const activeElement = navNode.querySelector(`[data-active="true"]`) as HTMLElement;
      if (activeElement) {
        const navRect = navNode.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        const scrollOffset = activeRect.left - navRect.left - (navRect.width / 2) + (activeRect.width / 2);
        
        navNode.scrollTo({
          left: navNode.scrollLeft + scrollOffset,
          behavior: 'smooth',
        });
      }
    }
  }, [activeTab]);

  return {
    activeTab,
    direction,
    navRef,
    handleTabClick,
  };
};
