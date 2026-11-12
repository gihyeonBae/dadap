import React from 'react';
import { ArrowLeft, Eye, Code } from 'lucide-react';
import { CATEGORY_ICONS, getCategoryDisplay, COMPONENT_CLASSES, SEMANTIC_COLORS } from './StudyDetail.constants';
import type { StudyPost } from './StudyDetail.types';

interface StudyDetailHeaderProps {
  post: StudyPost;
  handleBackToList: () => void;
}

const StudyDetailHeader: React.FC<StudyDetailHeaderProps> = ({ post, handleBackToList }) => {
  const IconComponent = CATEGORY_ICONS[post?.category?.toUpperCase() || 'CS'] ?? Code;

  return (
    <header className="mb-10">
      <button 
        onClick={handleBackToList} 
        className={`flex items-center gap-2 ${SEMANTIC_COLORS.textSub} hover:${SEMANTIC_COLORS.textMain} transition-colors mb-8 group text-sm font-semibold`}
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        목록으로 돌아가기
      </button>
      
      <div className="flex items-center gap-3 mb-4">
        <span className={COMPONENT_CLASSES.categoryTag}>
          <IconComponent size={12} className="inline mr-1.5" />
          {getCategoryDisplay(post.category)}
        </span>
      </div>

      <h1 className={`text-3xl font-extrabold ${SEMANTIC_COLORS.textMain} tracking-tighter leading-tight mb-5`}>
        {post.title}
      </h1>

      <div className={`flex items-center gap-4 ${SEMANTIC_COLORS.textSub} border-b ${SEMANTIC_COLORS.borderDefault} pb-8`}>
        <img src="/images/cat_logo.png" alt="Author" className={`w-9 h-9 rounded-full ${SEMANTIC_COLORS.bgSurface} border ${SEMANTIC_COLORS.borderDefault}`} />
        <span className={`text-sm font-semibold ${SEMANTIC_COLORS.textSub}`}>{post.author}</span>
        <span className="text-sm">{post.date}</span>
        <div className="ml-auto flex items-center gap-3">
          <div className={`flex items-center gap-2 ${COMPONENT_CLASSES.glassUi} ${SEMANTIC_COLORS.bgSurface} border ${SEMANTIC_COLORS.borderDefault} px-3 py-1 rounded-lg`}>
            <Eye size={16} className="text-accent-tertiary" />
            <span className={`text-sm font-semibold ${SEMANTIC_COLORS.textSub}`}>{post.views}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudyDetailHeader;