import type { FooterSection } from './Footer.types';

export const FOOTER_LINK_SECTIONS: FooterSection[] = [
  {
    title: 'Interview',
    links: [
      { label: '모의 면접 (AI)', path: '/interview/practice' },
      { label: '실전 면접', path: '/interview/real' },
    ],
  },
  {
    title: 'Archive',
    links: [
      { label: 'All', path: '/study?category=all' },
      { label: 'CS', path: '/study?category=cs' },
      { label: 'Language', path: '/study?category=language' },
      { label: 'Docs', path: '/study?category=docs' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: '최신 글', path: '/community' },
    ],
  },
  {
    title: 'My Page',
    links: [
      { label: '대시보드', path: '/mypage' },
      { label: 'AI 면접 기록', path: '/mypage/ai-log' },
      { label: 'CS 지식 질문 기록', path: '/mypage/cs-log' },
      { label: '포트폴리오 관리', path: '/mypage/portfolio' },
    ],
  },
  {
    title: 'DADAP',
    links: [
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/support/contact' },
      { label: 'Privacy Policy', path: '/support/privacy-policy' },
    ],
  },
];

export const FOOTER_STYLES = {
  container: "w-full bg-bg-main border-t border-border-subtle py-10 px-4 md:px-8 flex-shrink-0 z-50 transition-colors duration-300",
  sectionTitle: "text-sm font-semibold text-text-main mb-3 tracking-wider",
  linkBtn: "text-text-muted hover:text-text-main text-xs transition-colors duration-200 text-left",
  copyright: "text-xs text-text-muted font-mono"
};
