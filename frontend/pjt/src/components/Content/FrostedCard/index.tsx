// pjt/src/components/Content/FrostedCard/index.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFrostedCardData } from './useFrostedCardData';
import { useCardCarousel } from './useCardCarousel';
import Card from './CardItem';
import DetailModal from './DetailModal';
import type { CardItem } from './FrostedCard.types';

const FrostedCard: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<CardItem | null>(null);
  const navigate = useNavigate();
  const { displayItems } = useFrostedCardData();
  const { position, getVelocity, carouselProps } = useCardCarousel({ itemCount: displayItems.length });

  const handleCardClick = (item: CardItem) => {
    // 드래그 직후에는 클릭이 방지되도록 약간의 임계값 설정
    if (getVelocity() < 1) {
      setSelectedItem(item);
    }
  };
  
  return (
    <div className="w-full flex flex-col font-sans selection:bg-accent-primary/20 relative select-none" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* 액션 타일: 왼쪽 상단 사분면에서 약간 왼쪽으로, 위로 박스 높이의 2배만큼 이동.
          ARCHIVE 제목 제거, 박스 크기/폰트 증가 */}
      {/* 슬라이더 상단 중앙에 투명 CTA 텍스트로 배치 */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/study'); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/study'); } }}
          className="cursor-pointer px-3 py-1 bg-transparent focus:outline-none"
          aria-label="학습 아카이브로 이동하기"
        >
          <span className="text-sm md:text-base font-black text-text-main/40 hover:text-text-main/80 transition-colors duration-150 motion-safe:animate-pulse motion-reduce:animate-none">
            학습 아카이브로 이동하기
          </span>
        </button>
      </div>

      <main 
        className="flex-1 w-full h-[50vh] min-h-[400px] flex justify-center items-center [perspective:4000px] overflow-hidden py-10 md:py-20 cursor-grab active:cursor-grabbing"
        {...carouselProps}
      >
        <div 
          className="flex w-max"
          style={{ transform: `translateX(${position}px)` }}
        >
          {displayItems.map((item, index) => (
            <Card
              key={`${item.id}-${index}`}
              item={item}
              index={index}
              totalItems={displayItems.length}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </main>

      {selectedItem && (
        <DetailModal 
          selectedItem={selectedItem}
          onClose={() => setSelectedItem(null)}
          summaryMaxLength={150}
        />
      )}

      {/* 안내 문구 제거: 'Swipe to explore · Tap to view details' */}
    </div>
  );
};

export default FrostedCard;
