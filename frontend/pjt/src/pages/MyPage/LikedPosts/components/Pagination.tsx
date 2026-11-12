import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { PaginationProps } from '../LikedPosts.types';
import { STYLES } from '../LikedPosts.constants';

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={STYLES.paginationBtn}
        aria-label="first"
      >
        <ChevronsLeft size={18} />
      </button>

      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={STYLES.paginationBtn}
        aria-label="prev"
      >
        <ChevronLeft size={18} />
      </button>

      {Array.from({ length: totalPages }).map((_, idx) => {
        const n = idx + 1;
        const isActive = currentPage === n;
        return (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            aria-current={isActive ? 'page' : undefined}
            className={isActive ? STYLES.paginationActiveBtn : STYLES.paginationBtn}
          >
            {n}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={STYLES.paginationBtn}
        aria-label="next"
      >
        <ChevronRight size={18} />
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={STYLES.paginationBtn}
        aria-label="last"
      >
        <ChevronsRight size={18} />
      </button>
    </div>
  );
};
