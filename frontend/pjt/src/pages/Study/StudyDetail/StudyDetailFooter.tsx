import React from 'react';
import { Bookmark } from 'lucide-react';
import { COMPONENT_CLASSES } from './StudyDetail.constants';
import type { StudyPost } from './StudyDetail.types';


interface StudyDetailFooterProps {
  post: StudyPost;
  isScrapped: boolean;
  scrapLoading: boolean;
  handleToggleScrap: () => Promise<void>;
}

const StudyDetailFooter: React.FC<StudyDetailFooterProps> = ({ post, isScrapped, scrapLoading, handleToggleScrap }) => {
  return (
    <footer className="mt-12 pt-8 border-t border-border-default flex justify-end items-center gap-4">
      <button
        onClick={handleToggleScrap}
        disabled={scrapLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all group ${COMPONENT_CLASSES.btnSecondary} ${isScrapped ? 'text-accent-default border-accent-default ring-2 ring-accent-default/40 bg-accent-default/10' : 'text-text-sub hover:text-text-main'}`}
      >
        <Bookmark size={16} className={isScrapped ? 'fill-current text-accent-default' : 'group-hover:text-accent-default'} />
      </button>
    </footer>
  );
};

export default StudyDetailFooter;