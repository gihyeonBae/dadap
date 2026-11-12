import { interviewService } from '../api/interviewService';
// NOTE: keep existing LikedPost type local to this module

export type SavedProblem = {
  id: number;
  category: string;
  subCategory: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  savedDate: string;
  tags: string[];
};
export type LikedPost = {
  id: number;
  type: 'board' | 'study';
  title: string;
  author?: string;
  date?: string;
  likes?: number;
  extra?: any;
};

const BASE_SAVED_KEY = 'dadap_saved_problems_v1';
const BASE_LIKED_KEY = 'dadap_liked_posts_v1';

// In-memory stores (session-only). Do not persist scrapped/saved items to localStorage.
let inMemorySavedProblems: SavedProblem[] = [];
let inMemorySavedBoards: SavedBoard[] = [];

const getUserId = (): string | null => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.userId?.toString() || null;
  } catch (e) {
    return null;
  }
};

const scopedKey = (base: string) => {
  const uid = getUserId();
  return uid ? `${base}::${uid}` : base;
};

// Migration helper: if scoped key not present but global base has data, migrate it
const migrateIfNeeded = (base: string) => {
  try {
    const uid = getUserId();
    if (!uid) return; // nothing to migrate for anonymous
    const scoped = `${base}::${uid}`;
    if (localStorage.getItem(scoped)) return;
    const global = localStorage.getItem(base);
    if (global) {
      localStorage.setItem(scoped, global);
    }
  } catch (e) {
    // ignore
  }
};

export const getSavedProblems = (): SavedProblem[] => {
  // In-memory only: do not persist saved problems to localStorage anymore.
  try {
    return [...inMemorySavedProblems];
  } catch (e) {
    console.error('getSavedProblems read error', e);
    return [];
  }
};

export const saveSavedProblems = (items: SavedProblem[]) => {
  // store in-memory for session only and notify listeners
  inMemorySavedProblems = [...items];
  try { window.dispatchEvent(new CustomEvent('myPage:savedUpdated')); } catch {}
};

export const addSavedProblem = (item: SavedProblem) => {
  const list = getSavedProblems();
  if (!list.find(i => i.id === item.id)) {
    const next = [item, ...list];
    saveSavedProblems(next);
  }
};

export const removeSavedProblem = (id: number) => {
  const list = getSavedProblems().filter(i => i.id !== id);
  saveSavedProblems(list);
};

export const getLikedPosts = (): LikedPost[] => {
  try {
    migrateIfNeeded(BASE_LIKED_KEY);
    const key = scopedKey(BASE_LIKED_KEY);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('getLikedPosts parse error', e);
    return [];
  }
};

export const saveLikedPosts = (items: LikedPost[]) => {
  const key = scopedKey(BASE_LIKED_KEY);
  localStorage.setItem(key, JSON.stringify(items));
  try {
    console.debug('[myPageStore] saveLikedPosts ->', key, items.length, items.map(i => `${i.type}:${i.id}`));
  } catch (e) {}
  try {
    window.dispatchEvent(new CustomEvent('myPage:likedUpdated'));
  } catch {}
};

export const addLikedPost = (item: LikedPost) => {
  const list = getLikedPosts();
  if (!list.find(i => i.id === item.id && i.type === item.type)) {
    list.unshift(item);
    saveLikedPosts(list);
  }
};

export const removeLikedPost = (id: number, type?: 'board' | 'study') => {
  const list = getLikedPosts().filter(i => {
    if (type) return !(i.id === id && i.type === type);
    return i.id !== id;
  });
  saveLikedPosts(list);
};

// Fetch saved/scrapped problems from backend and populate in-memory store
export const refreshSavedProblems = async (page = 0, size = 20) => {
  try {
    const res = await interviewService.getScrappedQuestions({ page, size });
    const body = (res as any).data ?? res;
    let items: any[] = [];
    if (Array.isArray(body)) items = body;
    else if (Array.isArray(body?.data)) items = body.data;
    else if (Array.isArray(body?.items)) items = body.items;
    else if (Array.isArray(body?.data?.items)) items = body.data.items;
    else items = body?.items ?? body?.data ?? [];
    const mapped: SavedProblem[] = (items || []).map((it: any) => ({
      id: it.questionId,
      category: it.categoryName ?? String(it.categoryId ?? ''),
      subCategory: '',
      title: it.title,
      difficulty: (it.difficulty === 1 ? 'Easy' : it.difficulty === 2 ? 'Medium' : 'Hard'),
      savedDate: '',
      tags: [],
    }));
    saveSavedProblems(mapped);
    return {
      items: mapped,
      page: Number(body?.page ?? body?.data?.page ?? page),
      size: Number(body?.size ?? body?.data?.size ?? size),
      totalElements: Number(body?.totalElements ?? body?.data?.totalElements ?? mapped.length),
      totalPages: Number(body?.totalPages ?? body?.data?.totalPages ?? Math.max(1, Math.ceil(mapped.length / size))),
    };
  } catch (e) {
    console.debug('[myPageStore] refreshSavedProblems failed', e);
    return null;
  }
};

// Backwards-compatible name used elsewhere in the app
export const refreshMyPageStore = refreshSavedProblems;

export const isProblemSaved = (id: number): boolean => {
  try {
    return getSavedProblems().some(s => Number(s.id) === Number(id));
  } catch (e) {
    return false;
  }
};

export const isPostLiked = (id: number, type: 'board' | 'study'): boolean => {
  try {
    return getLikedPosts().some(l => Number(l.id) === Number(id) && l.type === type);
  } catch (e) {
    return false;
  }
};

// ----------------------------
// Saved boards (스크랩) - separate storage so scrap != like
// ----------------------------
export type SavedBoard = {
  id: number;
  title?: string;
  author?: string;
  date?: string;
  extra?: any;
};

const BASE_SCRAP_KEY = 'dadap_saved_boards_v1';

export const getSavedBoards = (): SavedBoard[] => {
  // In-memory only: do not persist saved boards (scrap for community) to localStorage anymore.
  try {
    return [...inMemorySavedBoards];
  } catch (e) {
    console.error('getSavedBoards read error', e);
    return [];
  }
};

export const saveSavedBoards = (items: SavedBoard[]) => {
  inMemorySavedBoards = [...items];
  try { window.dispatchEvent(new CustomEvent('myPage:scrapUpdated')); } catch {}
};

export const addSavedBoard = (item: SavedBoard) => {
  const list = getSavedBoards();
  if (!list.find(i => i.id === item.id)) {
    const next = [item, ...list];
    saveSavedBoards(next);
  }
};

export const removeSavedBoard = (id: number) => {
  const list = getSavedBoards().filter(i => i.id !== id);
  saveSavedBoards(list);
};

export const isBoardSaved = (id: number): boolean => {
  try {
    return getSavedBoards().some(s => Number(s.id) === Number(id));
  } catch (e) {
    return false;
  }
};
