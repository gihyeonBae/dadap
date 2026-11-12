// filepath: src/pages/Study/PostItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

interface PostItemProps {
  id: number;
  title: string;
  author: string;
  date: string;
  category: string; // 게시글 본연의 카테고리 (배지 표시용, 예: CS)
  comments: number;
  views: number;
  likes: number;
  isLiked?: boolean;
  currentPage?: number;
  returnCategory?: string; // [추가] 목록으로 돌아갈 때 사용할 카테고리 (예: ALL)
}

const PostItem: React.FC<PostItemProps> = ({ 
  id, title, author, date, category, comments, views, likes, isLiked, 
  currentPage, 
  returnCategory // [추가] props로 받음
}) => {
  return (
    <Link 
      to={`/study/post/${id}`} 
      state={{ 
        title: title, 
        // [수정 핵심] 
        // 리스트에서 'returnCategory'(예: 'all')를 받았다면 그것을 state에 담아 보냅니다.
        // 상세 페이지는 이 값을 보고 '뒤로 가기' 시 'ALL' 탭으로 이동합니다.
        // 값이 없다면 기본적으로 게시글의 카테고리를 사용합니다.
        category: returnCategory || category, 
        page: currentPage 
      }}
      className="block bg-bg-card border-b border-border-main p-6 transition-all duration-300 hover:bg-bg-card/70 group"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {/* 화면에 보이는 뱃지는 게시글의 원래 카테고리(CS, DB 등)를 그대로 보여줍니다 */}
            <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-[10px] font-bold rounded-full border border-accent-primary/20 uppercase">
              {category}
            </span>
          </div>
          <h3 className="text-lg font-bold text-text-main group-hover:text-accent-primary transition-colors">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-6 text-text-muted text-xs font-medium mt-2 sm:mt-0 w-full sm:w-auto justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/cat_logo.png" alt="Author" className="w-6 h-6 rounded-full bg-bg-surface" />
            <span>{author}</span>
          </div>
          <span className="hidden sm:block text-text-muted">{date}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> {views}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostItem;