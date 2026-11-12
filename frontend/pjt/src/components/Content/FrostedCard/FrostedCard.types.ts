// pjt/src/components/Content/FrostedCard/FrostedCard.types.ts

/**
 * 카테고리 식별자로 사용되는 키 (DB, OS 등)
 */
export type CategoryKey = 'DB' | 'OS' | 'FE' | 'BE' | 'NETWORK' | 'DSA';

/**
 * API 호출 또는 폴백 데이터에 사용되는 카드 아이템의 데이터 구조
 */
export interface CardItem {
  id: string | number;
  category: CategoryKey | 'ALL'; // 'ALL'은 폴백 데이터에서만 사용될 수 있음
  title: string;
  desc: string;
  questionId?: number;
}

/**
 * 카테고리별 색상 및 메타데이터 정의
 */
export interface CategoryStyle {
  name: string;
  mainHex: string;
  darkHex: string;
  lightHex: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}
