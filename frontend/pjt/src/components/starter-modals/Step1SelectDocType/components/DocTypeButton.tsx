import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { DocTypeButtonProps } from '../Step1SelectDocType.types';
import { STYLES } from '../Step1SelectDocType.constants';

export const DocTypeButton: React.FC<DocTypeButtonProps> = ({ 
  label, 
  subLabel, 
  icon, 
  iconColorClass, 
  onClick 
}) => {
  const colorBase = iconColorClass.replace('text-', '');

  return (
    <button 
      onClick={onClick} 
      className={`${STYLES.docButtonBase} hover:border-${colorBase}/50`}
    >
      <div className="flex items-center gap-4 text-left">
        <div className={`${STYLES.iconWrapper} bg-${colorBase}/10 group-hover:bg-${colorBase}/20`}>
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
            className: `w-6 h-6 ${iconColorClass}` 
          })}
        </div>
        <div>
          <span className="font-bold text-base text-text-sub group-hover:text-text-main block">{label}</span>
          <span className={STYLES.subLabel}>{subLabel}</span>
        </div>
      </div>
      <ArrowRight className={STYLES.arrowIcon} />
    </button>
  );
};
