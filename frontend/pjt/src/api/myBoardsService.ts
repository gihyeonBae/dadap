import axiosInstance from './axiosInstance';
import type { GlobalApiResponse } from '../types/api/common';

export type BoardPost = {
  postId: number;
  title: string;
  authorName: string;
  authorProfileImageUrl?: string | null;
  content: string;
  imageUrl: string | null;
  views: number;
  likes: number;
  liked: boolean;
  createdAt: string;
  updatedAt: string;
  comments: BoardComment[];
}

export type BoardComment = {
  commentId: number;
  parentCommentId: number | null;
  authorName: string;
  authorProfileImageUrl?: string | null;
  content: string;
  createdAt: string;
  replies: BoardComment[];
}

export type BoardListItem = {
  postId: number;
  title: string;
  authorName: string;
  authorProfileImageUrl?: string | null;
  views: number;
  likes: number;
  liked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BoardListResponse = {
  posts: BoardListItem[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

export const boardsService = {
  // 게시글 목록 조회
  getBoards: async (
    opts: 'latest' | 'likes' | 'views' | { sort?: 'latest' | 'likes' | 'views'; page?: number; size?: number } = 'latest'
  ): Promise<BoardListResponse> => {
    const resolved =
      typeof opts === 'string'
        ? { sort: opts, page: undefined, size: undefined }
        : { sort: opts.sort ?? 'latest', page: opts.page, size: opts.size };
    const params = new URLSearchParams();
    if (resolved.sort) params.set('sort', resolved.sort);
    if (typeof resolved.page === 'number') params.set('page', String(resolved.page));
    if (typeof resolved.size === 'number') params.set('size', String(resolved.size));
    const query = params.toString();
    const res = await axiosInstance.get<GlobalApiResponse<BoardListResponse>>(`/boards${query ? `?${query}` : ''}`);
    return res.data;
  },

  // 게시글 상세 조회
  getBoard: async (postId: number): Promise<BoardPost> => {
    const res = await axiosInstance.get<GlobalApiResponse<BoardPost>>(`/boards/${postId}`);
    return res.data;
  },

  // 게시글 생성
  createBoard: async (req: { title: string; content: string; imageUrl?: string }, imageFile?: File): Promise<BoardPost> => {
    const formData = new FormData();
    formData.append('req', new Blob([JSON.stringify(req)], { type: 'application/json' }));
    if (imageFile) formData.append('imageFile', imageFile);
    if (import.meta.env.DEV) {
      try {
        for (const entry of (formData as any).entries()) {
          console.debug('[boardsService.createBoard] formData entry:', entry[0], entry[1]);
        }
      } catch (e) {}
    }
    // Let the browser/axios set the multipart Content-Type (with boundary).
    const res = await axiosInstance.post<GlobalApiResponse<BoardPost>>('/boards', formData, {
      headers: { 'Content-Type': undefined as any },
    });
    return res.data;
  },

  // 게시글 수정
  updateBoard: async (postId: number, req: { title: string; content: string; imageUrl?: string }, imageFile?: File): Promise<BoardPost> => {
    const formData = new FormData();
    formData.append('req', new Blob([JSON.stringify(req)], { type: 'application/json' }));
    if (imageFile) formData.append('imageFile', imageFile);
    if (import.meta.env.DEV) {
      try {
        for (const entry of (formData as any).entries()) {
          console.debug('[boardsService.updateBoard] formData entry:', entry[0], entry[1]);
        }
      } catch (e) {}
    }
    // Let the browser/axios set the multipart Content-Type (with boundary).
    const res = await axiosInstance.patch<GlobalApiResponse<BoardPost>>(`/boards/${postId}`, formData, {
      headers: { 'Content-Type': undefined as any },
    });
    return res.data;
  },

  // 게시글 삭제
  deleteBoard: async (postId: number): Promise<void> => {
    await axiosInstance.delete(`/boards/${postId}`);
  },

  // 게시글 좋아요
  likeBoard: async (postId: number): Promise<{ postId: number; views: number; likes: number; liked: boolean }> => {
    const res = await axiosInstance.post<GlobalApiResponse<{ postId: number; views: number; likes: number; liked: boolean }>>(`/boards/${postId}/like`);
    return res.data;
  },

  // 댓글 작성
  createComment: async (postId: number, req: { content: string; parentCommentId?: number | null }): Promise<BoardComment> => {
    const res = await axiosInstance.post<GlobalApiResponse<BoardComment>>(`/boards/${postId}/comments`, req);
    return res.data;
  },

  // 댓글 삭제
  deleteComment: async (postId: number, commentId: number): Promise<void> => {
    await axiosInstance.delete(`/boards/${postId}/comments/${commentId}`);
  },
};
