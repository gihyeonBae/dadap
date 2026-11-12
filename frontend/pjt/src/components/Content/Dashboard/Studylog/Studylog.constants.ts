import { Cpu, Globe, Database, Layers, Code, Monitor, Briefcase } from 'lucide-react';
import type { CategoryKey, CategoryStyle } from './Studylog.types';

export const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
export const WEEKDAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CATEGORY_STYLE: Record<CategoryKey, CategoryStyle> = {
  PORTFOLIO: {
    icon: Briefcase,
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/30',
    border: 'border-emerald-500/20',
  },
  OS: {
    icon: Cpu,
    color: 'text-sky-400',
    bg: 'bg-sky-900/30',
    border: 'border-sky-500/20',
  },
  DATABASE: {
    icon: Database,
    color: 'text-amber-400',
    bg: 'bg-amber-900/30',
    border: 'border-amber-500/20',
  },
  BACKEND: {
    icon: Code,
    color: 'text-rose-400',
    bg: 'bg-rose-900/30',
    border: 'border-rose-500/20',
  },
  FRONTEND: {
    icon: Monitor,
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/30',
    border: 'border-cyan-500/20',
  },
  NETWORK: {
    icon: Globe,
    color: 'text-teal-400',
    bg: 'bg-teal-900/30',
    border: 'border-teal-500/20',
  },
  DSA: {
    icon: Layers,
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
    border: 'border-purple-500/20',
  },
};

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  PORTFOLIO: 'PORTFOLIO',
  OS: 'OS',
  DATABASE: 'DATABASE',
  BACKEND: 'BACKEND',
  FRONTEND: 'FRONTEND',
  NETWORK: 'NETWORK',
  DSA: 'DSA',
};

export const STUDYLOG_STYLES = {
  container: "grid grid-cols-1 md:grid-cols-12 gap-5 h-full w-full px-4 py-2 bg-transparent text-text-main font-sans overflow-hidden",
  card: "bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm backdrop-blur-md",
  header: "flex flex-col items-start shrink-0 mb-6",
  statBox: "bg-bg-surface border border-border-main p-4 rounded-2xl flex flex-col items-center justify-center transition-all hover:border-accent-primary/30 shadow-sm",
  logListContainer: "overflow-y-auto pr-1 custom-scrollbar border border-border-subtle rounded-2xl bg-bg-surface/30 min-h-[200px] max-h-[320px]",
  logItem: "bg-bg-card border border-border-main rounded-xl p-3 flex items-center gap-4 hover:bg-bg-surface transition-all duration-200",
  calendarBtn: "relative flex flex-col items-center justify-center py-2 rounded-xl transition-all border border-transparent",
  modalOverlay: "absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8",
  modalContent: "bg-bg-surface border border-border-main rounded-2xl p-6 w-full max-w-md shadow-2xl",
};

export const CONTRIBUTION_COLORS = (level: number) => {
  if (level >= 4) return 'bg-accent-primary';
  if (level === 3) return 'bg-accent-primary/80';
  if (level === 2) return 'bg-accent-primary/60';
  if (level === 1) return 'bg-accent-primary/40';
  return 'bg-bg-card';
};
