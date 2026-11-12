import type { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon; // LucideIcon 타입을 추가합니다.
}

export interface DashboardProps {
  // 필요한 경우 여기에 Dashboard 컴포넌트의 props를 정의합니다.
}
