// pjt/src/components/Content/FrostedCard/useFrostedCardData.ts
import { useState, useEffect, useMemo } from 'react';
import { interviewService } from '../../../api/interviewService';
import type { CardItem } from './FrostedCard.types';
import { FALLBACK_POOL, API_CATEGORIES, CATEGORY_COLOR_MAP, CAROUSEL_LAYOUT } from './FrostedCard.constants';

/**
 * FrostedCard 컴포넌트에 필요한 데이터를 관리하는 훅.
 * API를 통해 학습 데이터를 가져오고, 실패 시 폴백 데이터를 사용합니다.
 * 캐러셀에 표시될 아이템 목록을 생성하고 관리합니다.
 */
export const useFrostedCardData = () => {
  const [dataPool, setDataPool] = useState<CardItem[]>(FALLBACK_POOL);

  useEffect(() => {
    const fetchStudyData = async () => {
      try {
        const TARGET_COUNT = 18;
        const PER_CATEGORY_PICK = 3;

        const normalizeCategoryKey = (value: any): CardItem['category'] | null => {
          if (!value) return null;
          const key = String(value).toUpperCase();
          if (key in CATEGORY_COLOR_MAP) return key as CardItem['category'];
          return null;
        };

        const resolveCategoryKey = (it: any): CardItem['category'] | null => {
          return (
            normalizeCategoryKey(it?.categoryName) ||
            normalizeCategoryKey(it?.categoryKey) ||
            normalizeCategoryKey(
              API_CATEGORIES.find(c => c.id === Number(it?.categoryId))?.key
            )
          );
        };

        const getDateValue = (it: any): number => {
          const raw =
            it?.scrappedAt ||
            it?.scrapCreatedAt ||
            it?.scrapAt ||
            it?.createdAt ||
            it?.updatedAt;
          const t = raw ? Date.parse(raw) : 0;
          return Number.isFinite(t) ? t : 0;
        };

        // 1) 스크랩 최신 18개 우선
        const scrapRes = await interviewService.getScrappedQuestions({ page: 0, size: TARGET_COUNT });
        const scrapBody = (scrapRes as any).data ?? scrapRes;
        let scrapItemsRaw: any[] = [];
        if (Array.isArray(scrapBody)) scrapItemsRaw = scrapBody;
        else if (Array.isArray(scrapBody?.data)) scrapItemsRaw = scrapBody.data;
        else if (Array.isArray(scrapBody?.items)) scrapItemsRaw = scrapBody.items;
        else if (Array.isArray(scrapBody?.data?.items)) scrapItemsRaw = scrapBody.data.items;

        const sortedScraps = [...scrapItemsRaw].sort((a, b) => getDateValue(b) - getDateValue(a));
        const scrapItems: CardItem[] = [];
        const usedIds = new Set<number>();
        for (const it of sortedScraps) {
          const questionId = Number(it?.questionId);
          const category = resolveCategoryKey(it);
          if (!questionId || !category || usedIds.has(questionId)) continue;
          usedIds.add(questionId);
          scrapItems.push({
            id: questionId,
            questionId,
            category,
            title: it?.title ?? 'Untitled',
            desc: "학습 아카이브에서 상세 내용을 확인하세요."
          });
          if (scrapItems.length >= TARGET_COUNT) break;
        }

        let combinedItems: CardItem[] = [...scrapItems];

        // 2) 스크랩이 부족하면 카테고리별 랜덤으로 채움
        const remaining = TARGET_COUNT - combinedItems.length;
        if (remaining > 0) {
          const requests = API_CATEGORIES.map(cat =>
            interviewService.getQuestions({ categoryId: cat.id, page: 0, size: 10 })
              .then(res => ({ key: cat.key, items: (res as any).items || [] }))
              .catch(() => ({ key: cat.key, items: [] }))
          );

          const results = await Promise.all(requests);
          let randomCandidates: CardItem[] = [];

          results.forEach(({ key, items }) => {
            if (items.length > 0 && CATEGORY_COLOR_MAP[key]) {
              const shuffled = [...items]
                .filter((it: any) => !usedIds.has(Number(it?.questionId)))
                .sort(() => Math.random() - 0.5)
                .slice(0, PER_CATEGORY_PICK);

              const mapped = shuffled.map((it: any) => ({
                id: it.questionId,
                questionId: it.questionId,
                category: key,
                title: it.title,
                desc: "학습 아카이브에서 상세 내용을 확인하세요."
              }));

              randomCandidates = [...randomCandidates, ...mapped];
            }
          });

          const randomFill = randomCandidates.sort(() => Math.random() - 0.5).slice(0, remaining);
          combinedItems = [...combinedItems, ...randomFill];
        }

        if (combinedItems.length > 0) {
          setDataPool(combinedItems);
        }
      } catch (e) {
        console.error("Failed to load slider data:", e);
        // 에러 발생 시 폴백 데이터가 이미 설정되어 있으므로 추가 작업 필요 없음
      }
    };
    fetchStudyData();
  }, []);

  // 무한 캐러셀을 위한 아이템 목록 생성 (원본 데이터를 섞어서 5세트 반복)
  const displayItems = useMemo(() => {
    if (dataPool.length === 0) return [];
    return Array(CAROUSEL_LAYOUT.CAROUSEL_SETS).fill(dataPool).flat();
  }, [dataPool]);

  return { dataPool, displayItems };
};
