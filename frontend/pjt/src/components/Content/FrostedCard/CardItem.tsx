// pjt/src/components/Content/FrostedCard/CardItem.tsx
import React from 'react';
import type { CardItem as CardItemType } from './FrostedCard.types';
import { CATEGORY_COLOR_MAP } from './FrostedCard.constants';

interface CardItemProps {
  item: CardItemType;
  index: number;
  totalItems: number;
  onCardClick: (item: CardItemType) => void;
}

const Card: React.FC<CardItemProps> = ({ item, index, totalItems, onCardClick }) => {
  // 'ALL' 카테고리는 폴백용이므로, 실제 렌더링 시에는 스타일이 정의된 키만 사용
  if (item.category === 'ALL' || !CATEGORY_COLOR_MAP[item.category]) {
    return null;
  }
  const currentCategory = CATEGORY_COLOR_MAP[item.category];

  const cardContainerStyle: React.CSSProperties = {
    zIndex: totalItems - index,
  };

  const folderBackStyle: React.CSSProperties = {
    background: `linear-gradient(145deg, ${currentCategory.darkHex}, ${currentCategory.mainHex}66)`,
  };

  const folderTabStyle: React.CSSProperties = {
    backgroundColor: currentCategory.darkHex,
  };

  const folderFrontStyle: React.CSSProperties = {
    background: `linear-gradient(to top right, ${currentCategory.mainHex}, ${currentCategory.lightHex}44)`,
    backdropFilter: 'blur(4px)',
  };

  return (
    <div
      onClick={() => onCardClick(item)}
      className="group relative w-[336px] h-[240px] shrink-0 -ml-16 cursor-pointer
                 transition-transform duration-700
                 [transform-style:preserve-3d]
                 [transform:rotateY(-32deg)_rotateX(8deg)_rotateZ(6deg)]
                 hover:[transform:rotateY(-5deg)_rotateX(0deg)_rotateZ(0deg)_translateZ(200px)_scale(1.1)]
                 hover:z-[2000!important]"
      style={cardContainerStyle}
    >
      {/* 1. 폴더 뒷면 */}
      <div 
        className="absolute inset-0 rounded-2xl shadow-[40px_40px_80px_var(--border-subtle)] border border-border-subtle overflow-hidden"
        style={folderBackStyle}
      >
        <div className="absolute -top-3 left-0 w-20 h-6 rounded-t-xl border-t border-border-main" style={folderTabStyle} />
      </div>

      {/* 2. 내부 종이 (제목) */}
      <div className="absolute inset-x-4 bottom-4 min-h-[192px] glass-ui rounded-2xl border border-border-subtle
                      flex flex-col items-end justify-center p-6 transition-all duration-500 ease-out
                      [transform:translateZ(10px)] group-hover:-translate-y-28 z-[2]">
        <span className="text-text-sub text-xs font-bold uppercase mb-2 tracking-[0.2em] border-b border-border-subtle pb-1">QUESTION</span>
        <h3 className="text-text-main text-lg md:text-xl  font-black leading-snug text-right transition-all group-hover:scale-105 break-keep line-clamp-3">
          {item.title}
        </h3>
      </div>

      {/* 3. 폴더 앞면 (카테고리) */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[156px] rounded-2xl rounded-b-2xl [transform:translateZ(40px)] z-[3]
                   flex flex-col justify-end items-end p-6 border-t border-border-subtle shadow-[-20px_-20px_40px_var(--border-subtle)]"
        style={folderFrontStyle}
      >
        <div className="text-right w-full overflow-hidden">
          <p className="text-[11px] font-black text-text-main/70 uppercase tracking-[0.2em] mb-0.5">CATEGORY</p>
          <h4 className={`text-lg md:text-xl font-black leading-tight tracking-tighter drop-shadow-md ${currentCategory.colorClass}`}>
            {currentCategory.name}
          </h4>
        </div>
        <div className="absolute top-4 left-5 font-mono text-[11px] font-bold text-text-main/70 tracking-widest vertical-rl">
          REF: {2026 + index}
        </div>
      </div>
    </div>
  );
};

export default Card;
