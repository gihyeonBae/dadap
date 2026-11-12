import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from './CategorySelect.constants';
import type { CategorySelectProps } from './CategorySelect.types';

export const useCategorySelect = ({ onBack }: Pick<CategorySelectProps, 'onBack'>) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCategoryData = CATEGORIES.find(c => c.id === selectedId);

  const handleStart = (mode: 'practice' | 'real') => {
    if (selectedId) {
      navigate('/interview/check', { 
        state: { 
          category: selectedId,
          mode: mode 
        } 
      });
    }
  };

  const handleBack = () => {
    if (selectedId) {
      setSelectedId(null);
    } else {
      onBack();
    }
  };

  return {
    selectedId,
    setSelectedId,
    selectedCategoryData,
    handleStart,
    handleBack
  };
};
