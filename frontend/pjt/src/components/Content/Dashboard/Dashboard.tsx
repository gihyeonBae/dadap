import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Starter from './Starter/Starter';
import Studylog from './Studylog/Studylog';
import { DASHBOARD_TABS, DASHBOARD_VARIANTS, DASHBOARD_STYLES } from './Dashboard.constants';
import { useDashboard } from './useDashboard';

const Dashboard: React.FC = () => {
  const { activeTab, direction, navRef, handleTabClick } = useDashboard();

  return (
    <div className={DASHBOARD_STYLES.container}>
      {/* 1. Simple Tab Header */}
      <nav className={DASHBOARD_STYLES.navContainer} ref={navRef}>
        <div className="flex gap-2">
          {DASHBOARD_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                ${DASHBOARD_STYLES.tabButtonBase}
                ${activeTab === tab.id ? DASHBOARD_STYLES.tabButtonActive : DASHBOARD_STYLES.tabButtonInactive}
              `}
              data-active={activeTab === tab.id}
            >
              {tab.icon && <tab.icon size={16} strokeWidth={2.5} />}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 2. View Area - 3D Glassmorphism Panel (Height Auto) */}
      <div className={DASHBOARD_STYLES.viewAreaContainer}>
        {/* Top Highlight for 3D effect */}
        <div className={DASHBOARD_STYLES.topHighlight} />
        
        {/* Relative content flow instead of absolute positioning */}
        <div className={DASHBOARD_STYLES.contentWrapper}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeTab}
              custom={direction}
              variants={DASHBOARD_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="w-full h-full"
            >
              {activeTab === 'starter' && (
                <div className="w-full h-full">
                  <Starter />
                </div>
              )}
              {activeTab === 'studylog' && (
                <div className="w-full h-full">
                  <Studylog />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{DASHBOARD_STYLES.customScrollbarStyles}</style>
    </div>
  );
};

export default Dashboard;