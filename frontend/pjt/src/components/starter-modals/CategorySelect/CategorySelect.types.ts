import React from 'react';

export interface CategoryItemData {
  id: string;
  name: string;
  icon: React.ReactNode;
  colorToken: string; // e.g., 'text-category-os'
  bgToken: string;    // e.g., 'bg-category-os/10'
  borderToken: string; // e.g., 'border-category-os/30'
}

export interface CategorySelectProps {
  onBack: () => void;
}

export interface CategoryItemProps {
  category: CategoryItemData;
  onClick: (id: string) => void;
  isSelected: boolean;
}

export interface ModeSelectButtonProps {
  mode: 'practice' | 'real';
  onClick: (mode: 'practice' | 'real') => void;
}

export interface SelectedCategoryCardProps {
  categoryData: CategoryItemData;
}
