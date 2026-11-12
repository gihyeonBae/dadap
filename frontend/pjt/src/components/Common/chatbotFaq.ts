export interface ChatbotQuickItem {
  id: string;
  label: string;
  answer: string;
}

export const CHATBOT_QUICK_ITEMS: ChatbotQuickItem[] = [
  {
    id: 'features',
    label: '기능',
    answer: 'CS 학습, AI 면접 연습, 학습 기록 관리 기능 등을 제공합니다.',
  },
  {
    id: 'policy',
    label: '운영 방침',
    answer: '서비스 품질을 위해 비정상 이용은 제한될 수 있으며, 정책은 공지 후 반영됩니다. 자세한 내용은 공지사항을 확인바랍니다.',
  },
  {
    id: 'pricing',
    label: '요금',
    answer: '기본 기능은 무료이며, 일부 고급 기능은 추후 멤버십으로 제공될 예정입니다.',
  },
  {
    id: 'contact',
    label: '문의',
    answer: '문의는 고객센터 또는 Contact 페이지를 통해 접수해주세요.',
  },
];
