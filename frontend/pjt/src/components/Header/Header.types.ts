import type { LucideIcon } from 'lucide-react';

export interface HeaderProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isChatVisible: boolean;
  setIsChatVisible: (val: boolean) => void;
  isInterviewPage: boolean;
}

export interface MenuItem {
  index: string;
  title: string;
  path: string;
  icon: LucideIcon;
  items: string[];
}

export interface SideNavigationProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export interface LogoProps {
  className?: string;
}
