import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText, Briefcase } from 'lucide-react';

import type { DocType, Step1SelectDocTypeProps } from './Step1SelectDocType.types';
import { STYLES, SELECT_DOC_VARIANTS } from './Step1SelectDocType.constants';

import { DocTypeButton } from './components/DocTypeButton';

const Step1SelectDocType: React.FC<Step1SelectDocTypeProps> = ({ onSelect, onBack }) => {
  return (
    <motion.div
      variants={SELECT_DOC_VARIANTS}
      initial="hidden"
      animate="visible"
      className={STYLES.container}
    >
      
      <div className={STYLES.backButton}>
        <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors group"
        >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">이전으로</span>
        </button>
      </div>

      <div className={STYLES.contentWrapper}>
        <div className={STYLES.headerWrapper}>
          <h3 className={STYLES.title}>면접 서류 선택</h3>
          <p className={STYLES.description}>경험 면접을 진행할 서류 종류를 하나만 선택해주세요.</p>
        </div>

        <div className={STYLES.buttonGrid}>
          <DocTypeButton
            type="RESUME"
            label="자기소개서"
            subLabel="Resume"
            icon={<FileText />}
            iconColorClass="text-accent-primary"
            onClick={() => onSelect('RESUME')}
          />

          <DocTypeButton
            type="PORTFOLIO"
            label="포트폴리오"
            subLabel="Portfolio"
            icon={<Briefcase />}
            iconColorClass="text-accent-secondary"
            onClick={() => onSelect('PORTFOLIO')}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Step1SelectDocType;