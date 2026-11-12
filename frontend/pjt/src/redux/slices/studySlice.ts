// ★ createSelector를 추가로 임포트합니다.
import { createSlice, type PayloadAction, createSelector } from '@reduxjs/toolkit';

// 게시글 타입 정의
export interface StudyPost {
  id: number;
  title: string;
  category: string;
  author: string;
  date: string;
  views: number;
  likes: number; // 추가
  isLiked?: boolean; // 추가
  comments: number;
  content: string;
  modelAnswer?: string;
  followUpQuestions?: {
    questionId: number;
    content: string;
    modelAnswer: string;
  }[];
}

// 스터디 상태 정의
interface StudyState {
  currentCategory: string;
  posts: StudyPost[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: StudyState = {
  currentCategory: 'ALL',
  posts: [],
  status: 'idle',
};

const studySlice = createSlice({
  name: 'study',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.currentCategory = action.payload;
    },
    setPosts: (state, action: PayloadAction<StudyPost[]>) => {
      state.posts = action.payload;
    },
    toggleLike: (state, action: PayloadAction<number>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        if (post.isLiked) {
          post.likes -= 1;
          post.isLiked = false;
        } else {
          post.likes += 1;
          post.isLiked = true;
        }
      }
    },
  },
});

export const { setCategory, setPosts, toggleLike } = studySlice.actions;

// 기본 Selectors
export const selectCurrentCategory = (state: any) => state.study.currentCategory;
export const selectAllPosts = (state: any) => state.study.posts;

// ★ [핵심 수정] Memoized Selector (createSelector 사용)
// 카테고리 매핑 함수 (대소문자 무시)
const normalizeCategory = (cat: string) => {
  if (!cat) return '';
  const c = cat.toUpperCase();
  if (c === 'NW') return 'NETWORK';
  if (c === 'NETWORK') return 'NETWORK';
  if (c === 'BE' || c === 'BACKEND') return 'BE';
  if (c === 'FE' || c === 'FRONTEND') return 'FE';
  if (c === 'DSA' || c === 'DATA STR') return 'DSA';
  if (c === 'OS') return 'OS';
  if (c === 'DB') return 'DB';
  if (c === 'CS') return 'CS';
  return c;
};

export const selectFilteredPosts = createSelector(
  [selectCurrentCategory, selectAllPosts],
  (category, posts) => {
    if (normalizeCategory(category) === 'ALL') return posts;
    return posts.filter((post: StudyPost) => normalizeCategory(post.category) === normalizeCategory(category));
  }
);

export default studySlice.reducer;