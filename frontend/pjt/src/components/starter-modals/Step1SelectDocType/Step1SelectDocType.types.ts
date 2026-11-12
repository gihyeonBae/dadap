import React from 'react';

export type DocType = 'RESUME' | 'PORTFOLIO';

export interface Step1SelectDocTypeProps {
  onSelect: (type: DocType) => void;
  onBack: () => void;
}

export interface DocTypeButtonProps {
  type: DocType;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  iconColorClass: string; // Tailwind full class (e.g., 'text-accent-primary')
  onClick: () => void;
}
