import React from 'react';
import { ChevronLeft, Rocket, Mic, Clock } from 'lucide-react';

import type { CategorySelectProps } from './CategorySelect.types';
import { CATEGORIES, STYLES } from './CategorySelect.constants';
import { useCategorySelect } from './useCategorySelect';

import { CategoryItem } from './components/CategoryItem';

const CategorySelect: React.FC<CategorySelectProps> = ({ onBack }) => {
  const {
    selectedId,
    setSelectedId,
    selectedCategoryData,
    handleStart,
    handleBack
  } = useCategorySelect({ onBack });

  return (
    <div
      className="flex flex-col h-full text-text-main text-center"
    >
      {/* 상단 헤더: 뒤로 가기 버튼 */}
      <div className="px-8 pt-7 text-left">
        <button
          onClick={handleBack}
          className={STYLES.backButton}
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">이전으로</span>
        </button>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col px-8 pt-4 pb-12">

        {!selectedId ? (
          // [STEP 1] 카테고리 선택 화면
          <>
            <div className={STYLES.headerContainer}>
              <h3 className={STYLES.title}>기술 카테고리 선택</h3>
              <p className={STYLES.description}>면접 영역을 선택해주세요.</p>
            </div>

            <div className={STYLES.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  category={cat}
                  onClick={setSelectedId}
                  isSelected={selectedId === cat.id}
                />
              ))}
            </div>
          </>
        ) : (
          // [STEP 2] 모드 선택 화면
          <div className={STYLES.modeSelectContainer}>
            {/* 상단 아이콘 */}
            <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-primary/10 rounded-full mb-4 mx-auto">
                <Rocket className="w-7 h-7 text-accent-primary" />
            </div>

            <div className={STYLES.headerContainer}>
              <h2 className="text-xl font-bold mb-2 tracking-tight">준비 완료!</h2>
              <p className="text-text-sub mb-8 text-sm leading-relaxed break-keep">면접 방식을 선택해주세요.</p>
            </div>

            {/* 선택된 카테고리 표시 카드 */}
            {selectedCategoryData && (
              <div className={`w-full bg-bg-surface border rounded-xl p-4 mb-6 shadow-sm relative overflow-hidden flex items-center gap-4 ${(selectedCategoryData as any).borderToken}`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${(selectedCategoryData as any).colorToken.replace('text-', 'bg-')}`} />
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ml-2 ${(selectedCategoryData as any).bgToken} ${(selectedCategoryData as any).colorToken}`}>
                  {(selectedCategoryData as any).icon}
                </div>
                
                <div className="text-left flex-1">
                  <p className="text-xs font-bold text-text-sub mb-0.5 uppercase tracking-wider">Selected Category</p>
                  <h3 className="text-lg font-black text-text-main leading-tight">
                    {(selectedCategoryData as any).name}
                  </h3>
                </div>
              </div>
            )}

            {/* 모드 선택 버튼 */}
            <div className="grid grid-cols-2 gap-4 w-full mt-2">
              <button
                onClick={() => handleStart('practice')}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-border-subtle bg-bg-card hover:border-accent-primary hover:bg-accent-primary/5 transition-colors duration-200 group h-auto active:scale-[0.98]"
              >
                <div className="p-3 rounded-full bg-accent-primary/10 text-accent-primary group-hover:scale-110 transition-transform">
                  <Mic size={24} />
                </div>
                <div className="text-center">
                  <span className="block text-base font-bold text-text-main group-hover:text-accent-primary transition-colors">연습 모드</span>
                  <span className="text-xs text-text-sub mt-1">시간 제한 없음</span>
                </div>
              </button>

              <button
                onClick={() => handleStart('real')}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-border-subtle bg-bg-card hover:border-red-500 hover:bg-red-500/5 transition-colors duration-200 group h-auto active:scale-[0.98]"
              >
                <div className="p-3 rounded-full bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                  <Clock size={24} />
                </div>
                <div className="text-center">
                  <span className="block text-base font-bold text-text-main group-hover:text-red-500 transition-colors">실전 모드</span>
                  <span className="text-xs text-text-sub mt-1">실전과 동일 환경</span>
                </div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategorySelect;