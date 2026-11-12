import { Sparkles, BookOpen } from 'lucide-react';
import type { TabItem } from './Dashboard.types';
import type { Variants } from 'framer-motion';

export const DASHBOARD_TABS: TabItem[] = [
  { id: 'starter', label: 'AI 면접 시작하기', icon: Sparkles },
  { id: 'studylog', label: '나의 학습 기록', icon: BookOpen },
];

export const DASHBOARD_VARIANTS: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export const DASHBOARD_STYLES = {
  container: "w-full h-auto min-h-full flex flex-col",
  navContainer: "relative flex items-center justify-start mb-6",
  tabButtonBase: "relative px-5 py-3 text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2",
  tabButtonActive: "text-text-main bg-bg-card",
  tabButtonInactive: "text-text-muted hover:text-text-sub hover:bg-bg-card",
  viewAreaContainer: "w-full h-auto min-h-[600px] relative overflow-visible rounded-3xl backdrop-blur-xl bg-bg-surface shadow-[0_0_0_1px_var(--border-main)] [perspective:2000px]",
  topHighlight: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-text-main/30 to-transparent opacity-50",
  contentWrapper: "w-full h-full p-8 overflow-visible flex items-center justify-center",
  customScrollbarStyles: `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: var(--scroll-track); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--scroll-thumb-hover); }
  `,
};
