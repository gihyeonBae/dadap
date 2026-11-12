// pjt/src/components/Content/FrostedCard/FrostedCard.constants.ts
import type { CategoryStyle, CardItem, CategoryKey } from './FrostedCard.types';

/**
 * 카테고리별 스타일 정보 맵
 * DB(1), OS(2), FE(3), BE(4), NETWORK(5), DSA(6)
 */
export const CATEGORY_COLOR_MAP: Record<CategoryKey, CategoryStyle> = {
  DB: { name: 'DB', mainHex: '#FACC15', darkHex: '#A16207', lightHex: '#FEF08A', colorClass: 'text-white', bgClass: 'bg-yellow-400/10', borderClass: 'border-yellow-400/30' },
  OS: { name: 'OS', mainHex: '#60A5FA', darkHex: '#1E40AF', lightHex: '#BFDBFE', colorClass: 'text-white', bgClass: 'bg-blue-400/10', borderClass: 'border-blue-400/30' },
  FE: { name: 'FE', mainHex: '#22D3EE', darkHex: '#0E7490', lightHex: '#CFFAFE', colorClass: 'text-white', bgClass: 'bg-cyan-400/10', borderClass: 'border-cyan-400/30' },
  BE: { name: 'BE', mainHex: '#4ADE80', darkHex: '#166534', lightHex: '#DCFCE7', colorClass: 'text-white', bgClass: 'bg-green-400/10', borderClass: 'border-green-400/30' },
  NETWORK: { name: 'NETWORK', mainHex: '#C084FC', darkHex: '#6B21A8', lightHex: '#DDD6FE', colorClass: 'text-white', bgClass: 'bg-purple-400/10', borderClass: 'border-purple-400/30' },
  DSA: { name: 'DSA', mainHex: '#F472B6', darkHex: '#9D174D', lightHex: '#FBCFE8', colorClass: 'text-white', bgClass: 'bg-pink-400/10', borderClass: 'border-pink-400/30' },
};

/**
 * API 로딩 실패 또는 초기 상태에 사용될 기본 데이터 풀
 */
export const FALLBACK_POOL: CardItem[] = [
  { id: 'all-archive', category: "ALL", title: "전체 아카이브", desc: "모든 카테고리의 학습 자료를 한눈에 볼 수 있습니다." },
  { id: 'processes-threads', category: "OS", title: "프로세스와 스레드", desc: "운영체제에서 실행되는 프로그램의 단위와 그 안의 실행 흐름을 이해합니다." },
  { id: 'tcp-ip', category: "NETWORK", title: "TCP/IP 4계층 모델", desc: "인터넷 통신의 핵심 프로토콜 스택과 각 계층의 역할을 심층 분석합니다." },
  { id: 'javascript', category: "DSA", title: "JavaScript 비동기 처리", desc: "싱글 스레드 JavaScript에서 비동기 작업을 처리하는 이벤트 루프와 Promise를 다룹니다." },
  { id: 'sql-joins', category: "DB", title: "SQL JOIN의 종류와 활용법", desc: "관계형 데이터베이스에서 여러 테이블을 연결하는 다양한 JOIN 연산자를 학습합니다." },
  { id: 'css', category: "FE", title: "CSS 핵심 원리", desc: "웹 페이지 스타일링의 기본이 되는 선택자, 계단식 상속, 박스 모델을 심도 있게 탐구합니다." },
  { id: 'html', category: "BE", title: "HTML의 구조와 원칙", desc: "웹 문서의 뼈대를 이루는 HTML의 기본 구조와 접근성, SEO 원칙을 이해합니다." },
];

/**
 * API 호출에 사용될 카테고리 목록
 * 순서: OS-1, NETWORK-2, DSA-3, DB-4, FE-5, BE-6
 */
export const API_CATEGORIES: { id: number, key: CategoryKey }[] = [
  { id: 1, key: 'OS' },
  { id: 2, key: 'NETWORK' },
  { id: 3, key: 'DSA' },
  { id: 4, key: 'DB' },
  { id: 5, key: 'FE' },
  { id: 6, key: 'BE' },
];

/**
 * 캐러셀 카드 레이아웃 관련 상수
 */
export const CAROUSEL_LAYOUT = {
  CARD_WIDTH: 280, // 카드 너비 (w-[280px])
  CARD_MARGIN: -64, // 카드 간 음수 마진 (-ml-16)
  EFFECTIVE_WIDTH: 280 - 64, // 실질적인 카드 하나당 차지 너비
  CAROUSEL_SETS: 5, // 무한 루프를 위해 데이터를 복제할 횟수
};
