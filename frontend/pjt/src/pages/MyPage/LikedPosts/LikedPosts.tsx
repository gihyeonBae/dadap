import React from 'react';
import { motion } from 'framer-motion';
import MyPageHeader from '../../../components/MyPage/MyPageHeader';
import { useLikedPosts } from './useLikedPosts';
import { LikedPostItem } from './components/LikedPostItem';
import { Pagination } from './components/Pagination';
import { SAVED_PROBLEMS_VARIANTS, LIST_CONTAINER_VARIANTS, STYLES as SAVED_STYLES } from '../SavedProblems/SavedProblems.constants';

const LikedPosts: React.FC = () => {
  const {
    items,
    pagedItems,
    page,
    totalPages,
    setPage,
    handleRemove,
    handleView
  } = useLikedPosts();

  return (
    <motion.div
      variants={SAVED_PROBLEMS_VARIANTS}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <MyPageHeader
        title="Liked Posts"
        showDot={false}
      />

      <motion.div
        variants={LIST_CONTAINER_VARIANTS}
        className={SAVED_STYLES.container}
      >
        <div className="grid grid-cols-1 gap-6">
          {items.length === 0 ? (
            <p className="text-text-muted text-center py-12">좋아요한 글이 없습니다.</p>
          ) : (
            pagedItems.map((item) => (
              <LikedPostItem 
                key={`${item.type}-${item.id}`}
                item={item}
                onRemove={handleRemove}
                onView={handleView}
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

export default LikedPosts;
