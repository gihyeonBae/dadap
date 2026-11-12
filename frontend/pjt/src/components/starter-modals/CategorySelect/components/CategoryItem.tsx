import React from 'react';
import { motion } from 'framer-motion';
import type { CategoryItemProps } from '../CategorySelect.types';
import { STYLES, ITEM_VARIANTS } from '../CategorySelect.constants';

export const CategoryItem: React.FC<CategoryItemProps> = ({ category, onClick, isSelected }) => (
  <motion.button
    key={category.id}
    variants={ITEM_VARIANTS}
    onClick={() => onClick(category.id)}
    className={`${STYLES.categoryItemBase} ${
      isSelected ? `${category.bgToken} ${category.borderToken}` : ''
    } group-hover:scale-[1.02]`}
  >
    <div className={`${STYLES.categoryItemIconWrapper} ${category.colorToken}`}>
      {React.cloneElement(category.icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
    <span className={`${STYLES.categoryItemName} ${isSelected ? STYLES.categoryItemName : ''}`}>
      {category.name}
    </span>
  </motion.button>
);
