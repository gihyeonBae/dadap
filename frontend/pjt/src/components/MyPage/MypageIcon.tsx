import React from 'react';

interface MypageIconProps {
  type: 'success' | 'error' | 'info';
}


// 미니멀/모던/컬러포인트, 라운드 배경 + 심플 라인 아이콘
const icons = {
  success: (
    <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-400/20 to-green-700/30 border-2 border-green-400/40 mb-4 shadow-lg">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M10 17L15 22L22 11" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  ),
  error: (
    <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-red-400/20 to-red-700/30 border-2 border-red-400/40 mb-4 shadow-lg">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <line x1="11" y1="11" x2="21" y2="21" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="21" y1="11" x2="11" y2="21" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </span>
  ),
  info: (
    <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-700/30 border-2 border-blue-400/40 mb-4 shadow-lg">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="12" r="2" fill="#60A5FA"/>
        <rect x="15" y="16" width="2" height="7" rx="1" fill="#60A5FA"/>
      </svg>
    </span>
  )
};

const MypageIcon: React.FC<MypageIconProps> = ({ type }) => icons[type];

export default MypageIcon;
