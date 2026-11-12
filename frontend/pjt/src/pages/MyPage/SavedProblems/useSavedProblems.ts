import { useState, useEffect, useMemo } from 'react';
import type { SavedProblem } from '../../../components/MyPage/SavedProblemItem';
import { PAGE_SIZE } from './SavedProblems.constants';
import { interviewService } from '../../../api/interviewService';

export const useSavedProblems = () => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<SavedProblem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await interviewService.getScrappedQuestions({ page: Math.max(0, page - 1), size: PAGE_SIZE });
        const body = (res as any).data ?? res;
        let itemsRaw: any[] = [];
        if (Array.isArray(body)) itemsRaw = body;
        else if (Array.isArray(body?.data)) itemsRaw = body.data;
        else if (Array.isArray(body?.items)) itemsRaw = body.items;
        else if (Array.isArray(body?.data?.items)) itemsRaw = body.data.items;
        else itemsRaw = body?.items ?? body?.data ?? [];
        if (cancelled) return;
        const mapped: SavedProblem[] = (itemsRaw || []).map((it: any) => ({
          id: it.questionId,
          category: it.categoryName ?? String(it.categoryId ?? ''),
          subCategory: '',
          title: it.title,
          difficulty: (it.difficulty === 1 ? 'Easy' : it.difficulty === 2 ? 'Medium' : 'Hard'),
          savedDate: '',
          tags: [],
        }));
        setItems(mapped);
        const total = Number(body?.totalElements ?? body?.data?.totalElements ?? mapped.length) || mapped.length;
        const pages = Number(body?.totalPages ?? body?.data?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE))) || Math.max(1, Math.ceil(total / PAGE_SIZE));
        setTotalElements(total);
        setTotalPages(pages);
      } catch (e) {
        console.error('[useSavedProblems] failed to fetch scrapped questions', e);
      }
    })();
    return () => { cancelled = true; };
  }, [page]);

  const pagedItems = items; // already represents current page

  const handleRemove = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await interviewService.removeQuestionScrap(id);
      // re-fetch current page
      try {
        const res = await interviewService.getScrappedQuestions({ page: Math.max(0, page - 1), size: PAGE_SIZE });
        const body = (res as any).data ?? res;
        let itemsRaw: any[] = [];
        if (Array.isArray(body)) itemsRaw = body;
        else if (Array.isArray(body?.data)) itemsRaw = body.data;
        else if (Array.isArray(body?.items)) itemsRaw = body.items;
        else if (Array.isArray(body?.data?.items)) itemsRaw = body.data.items;
        else itemsRaw = body?.items ?? body?.data ?? [];
        const mapped: SavedProblem[] = (itemsRaw || []).map((it: any) => ({
          id: it.questionId,
          category: it.categoryName ?? String(it.categoryId ?? ''),
          subCategory: '',
          title: it.title,
          difficulty: (it.difficulty === 1 ? 'Easy' : it.difficulty === 2 ? 'Medium' : 'Hard'),
          savedDate: '',
          tags: [],
        }));
        setItems(mapped);
        const total = Number(body?.totalElements ?? body?.data?.totalElements ?? mapped.length) || mapped.length;
        const pages = Number(body?.totalPages ?? body?.data?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE))) || Math.max(1, Math.ceil(total / PAGE_SIZE));
        setTotalElements(total);
        setTotalPages(pages);
      } catch (err) {
        // fallback: remove locally
        setItems(prev => prev.filter(i => i.id !== id));
        setTotalElements(t => Math.max(0, t - 1));
      }
    } catch (err) {
      console.error('[useSavedProblems] failed to remove scrap', err);
    }
  };

  return {
    items: pagedItems,
    pagedItems,
    page,
    totalPages,
    setPage,
    handleRemove,
    totalElements,
  };
};
