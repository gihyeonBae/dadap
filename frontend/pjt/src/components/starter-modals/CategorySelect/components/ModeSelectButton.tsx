import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Swords } from 'lucide-react';
import type { ModeSelectButtonProps } from '../CategorySelect.types';
import { STYLES, ITEM_VARIANTS } from '../CategorySelect.constants';

export const ModeSelectButton: React.FC<ModeSelectButtonProps> = ({ mode, onClick }) => {
  const isPractice = mode === 'practice';
  const icon = isPractice ? <Sparkles className="w-5 h-5" /> : <Swords className="w-5 h-5" />;
  const title = isPractice ? '연습 모드' : '실전 모드';
  const description = isPractice ? 'AI 힌트/피드백\n자유로운 환경' : '힌트 없는\n실제 면접 환경';
  const bgColor = isPractice ? 'bg-bg-card hover:bg-bg-surface' : 'bg-bg-card hover:bg-bg-surface';
  const borderColor = isPractice ? 'border-border-subtle hover:border-accent-primary' : 'border-border-subtle hover:border-accent-neon';
  const iconBgColor = isPractice ? 'bg-accent-primary/10 text-accent-primary' : 'bg-accent-neon/10 text-accent-neon';

  return (
    <motion.button
      variants={ITEM_VARIANTS}
      onClick={() => onClick(mode)}
      className={`${STYLES.modeButtonBase} ${bgColor} ${borderColor}`}
    >
      <div className={`${STYLES.modeButtonIconWrapper} ${iconBgColor}`}>
        {icon}
      </div>
      <h3 className={STYLES.modeButtonTitle}>{title}</h3>
      <p className={`${STYLES.modeButtonDescription} whitespace-pre-line`}>{description}</p>
    </motion.button>
  );
};
