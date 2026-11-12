import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentCategory } from '../../redux/slices/studySlice';

const CategoryBar: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const reduxCategory = useSelector(selectCurrentCategory);
  
  // URL 파라미터 우선, 없으면 Redux 상태
  let activeCategory = category ? category.toUpperCase() : reduxCategory;
  // URL에서 온 dsa, nw 등을 원래 이름으로 복원해서 비교
  if (activeCategory === 'NW') activeCategory = 'NETWORK';
  // DSA는 그대로 'DSA'로 유지 (버튼 라벨과 일치)

  // 순서: ALL, OS, NETWORK, DSA, DB, FE, BE (API 기준)
  const categories = ['ALL', 'OS', 'NETWORK', 'DSA', 'DB', 'FE', 'BE'];

  const handleCategoryClick = (cat: string) => {
    // URL 변경 -> StudyList에서 감지
    let target = cat.toLowerCase();
    // URL 친화적 매핑 (API 기준)
    if (cat === 'DSA') target = 'dsa';
    if (cat === 'NETWORK') target = 'network';
    if (cat === 'FE') target = 'fe';
    if (cat === 'BE') target = 'be';
    if (cat === 'OS') target = 'os';
    if (cat === 'DB') target = 'db';
    navigate(`/study/category/${target}`);
  };

  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2 justify-center">
      {categories.map((cat) => {
        // 현재 선택된 카테고리와 비교
        const isSelected = activeCategory === cat;
        
        return (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${isSelected 
                ? 'bg-accent-primary text-white shadow-accent-primary/20 scale-105 border border-accent-primary' 
                : 'bg-bg-card text-text-sub border border-border-subtle hover:border-accent-primary hover:text-accent-primary hover:bg-bg-surface'
              }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryBar;