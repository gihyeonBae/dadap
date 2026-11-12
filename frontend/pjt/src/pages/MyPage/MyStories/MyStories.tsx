import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import MyPageHeader from '../../../components/MyPage/MyPageHeader';

import { useMyStories } from './useMyStories';
import { MY_STORIES_VARIANTS, LIST_ITEM_VARIANTS, STYLES } from './MyStories.constants';
import { StoryItem } from './components/StoryItem';

const MyStories: React.FC = () => {
  const navigate = useNavigate();
  const { posts, isLoading, error } = useMyStories();

  return (
    <motion.div
      variants={MY_STORIES_VARIANTS}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <MyPageHeader
        title="My Stories"
        showDot={false}
      />

      <motion.div
        variants={LIST_ITEM_VARIANTS}
        className={STYLES.container}
      >
        {isLoading ? (
          <p className="text-text-muted text-center py-6 animate-pulse">로딩 중...</p>
        ) : error ? (
          <p className="text-rose-400 text-center py-6">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-text-muted text-center py-8">작성한 게시글이 없습니다.</p>
        ) : (
          <div className={STYLES.listWrapper}>
            {posts.map((post) => (
              <StoryItem 
                key={post.postId}
                post={post}
                onClick={(id) => navigate(`/community/${id}`)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MyStories;
