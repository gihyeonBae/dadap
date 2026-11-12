/**
 * 마이페이지 대시보드 통계 데이터
 */
export interface MyPageStats {
  successRate: string;
  mockCount: number;
  streak: number;
  savedCount: number;
}

/**
 * 면접 로그 아이템 (AI/CS 공통)
 */
export interface InterviewLogItem {
  id: number;
  title: string;
  description: string;
  path: string;
  createdAt: string;
}

/**
 * 마이페이지 메인 데이터 구조 (추정)
 */
export interface MyPageData {
  stats: MyPageStats;
  aiLogs: InterviewLogItem[];
  csLogs: InterviewLogItem[];
}
