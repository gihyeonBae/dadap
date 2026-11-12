import type { LucideIcon } from 'lucide-react';

export type CategoryKey = 'PORTFOLIO' | 'OS' | 'DATABASE' | 'BACKEND' | 'FRONTEND' | 'NETWORK' | 'DSA';

export interface LogData {
  id: string;
  title: string;
  category: CategoryKey;
  date: string;
  score: number | null;
  status: 'PASS' | 'FAIL' | 'PENDING';
}

export interface ContributionData {
  date: string;
  count: number;
  level: number;
}

export interface CategoryStyle {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}
