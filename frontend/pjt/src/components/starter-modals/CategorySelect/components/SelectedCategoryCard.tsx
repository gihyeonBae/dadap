import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { SelectedCategoryCardProps } from '../CategorySelect.types';
import { STYLES, ITEM_VARIANTS } from '../CategorySelect.constants';
import { motion } from 'framer-motion';

export const SelectedCategoryCard: React.FC<SelectedCategoryCardProps> = ({ categoryData }) => (
  <motion.div 
    variants={ITEM_VARIANTS}
    className={`${STYLES.selectedCategoryCard} ${categoryData.bgToken} ${categoryData.borderToken}`}
  >
    <div className={STYLES.selectedCategoryIconWrapper}>
      <div className={categoryData.colorToken}>
        {React.cloneElement(categoryData.icon as React.ReactElement, { className: STYLES.selectedCategoryIcon })}
      </div>
      <h3 className={STYLES.selectedCategoryName}>{categoryData.name}</h3>
    </div>
    <CheckCircle2 className={`${STYLES.selectedCategoryIcon} ${categoryData.colorToken}`} />
  </motion.div>
);
