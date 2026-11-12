import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import MyPageHeader from '../../../components/MyPage/MyPageHeader';
import SavedProblemItem from '../../../components/MyPage/SavedProblemItem';

import { useSavedProblems } from './useSavedProblems';
import { SAVED_PROBLEMS_VARIANTS, LIST_CONTAINER_VARIANTS, STYLES, PAGE_SIZE } from './SavedProblems.constants';
import { Pagination } from './components/Pagination';

const SavedProblems: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    pagedItems,
    page,
    totalPages,
    setPage,
    handleRemove
  } = useSavedProblems();

  return (
    <motion.div
      variants={SAVED_PROBLEMS_VARIANTS}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <MyPageHeader
        title="저장한 문제"
        showDot={false}
      />

      <motion.div
        variants={LIST_CONTAINER_VARIANTS}
        className={STYLES.container}
      >
        <div className="grid grid-cols-1 gap-6">
          {items.length === 0 ? (
            <p className="text-text-muted text-center py-12">저장된 문제 목록이 없습니다.</p>
          ) : (
            pagedItems.map((p) => (
              <SavedProblemItem
                key={p.id}
                problem={p}
                onSolve={(id) => navigate(`/study/post/${id}`)}
                onDelete={handleRemove}
              />
            ))
          )}
        </div>

        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </motion.div>
    </motion.div>
  );
};

export default SavedProblems;