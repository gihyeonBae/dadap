import React from 'react';
import type { StoryItemProps } from '../MyStories.types';
import { STYLES } from '../MyStories.constants';

export const StoryItem: React.FC<StoryItemProps> = ({ post, onClick }) => (
  <button
    onClick={() => onClick(post.postId)}
    className={STYLES.itemBtn}
  >
    <div>
      <h3 className={STYLES.title}>{post.title || '(제목 없음)'}</h3>
      <p className={STYLES.date}>{(post.createdAt || '').slice(0, 10)}</p>
    </div>
    <div className={STYLES.stats}>
      <span>좋아요 {post.likes ?? 0}</span>
      <span>조회 {post.views ?? 0}</span>
    </div>
  </button>
);
