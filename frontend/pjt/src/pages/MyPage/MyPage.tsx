import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Award, BarChart3, Bookmark, Activity
} from 'lucide-react'; 
import StatCard from "../../components/MyPage/StatCard";
import { getSavedProblems, getSavedBoards } from "../../utils/myPageStore";
import { mypageService } from "../../api/services/mypageService";
import { interviewService } from "../../api/interviewService";
import ContentCard from '../../components/MyPage/ContentCard';
import MypageModal from '../../components/MyPage/MypageModal';

const CONTENT_SECTIONS = [
  { 
    id: 'ai', 
    title: "AI 면접 기록", 
    description: "자기소개서/포트폴리오 면접 기록", 
    path: "/mypage/ai-log"
  },
  { 
    id: 'cs', 
    title: "CS 면접 기록", 
    description: "CS 지식 면접 기록",
    path: "/mypage/cs-log"
  },
  { 
    id: 'saved', 
    title: "저장한 문제", 
    description: "저장한 문제 목록",
    path: "/mypage/saved"
  },
];

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 마이페이지용 모달 상태 (type, title 등 확장)
  const [modal, setModal] = useState<{
    open: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    title?: string;
    buttonText?: string;
  }>({ open: false, message: '', type: 'success' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] as any 
      } 
    }
  };

  const [savedCount, setSavedCount] = useState(() => {
    try {
      const saved = getSavedProblems().length;
      // boards that were previously stored in liked posts are now stored in saved boards (scraps)
      let boards = 0;
      try {
        const m = require('../../utils/myPageStore');
        boards = (m.getSavedBoards ? m.getSavedBoards() : []).length;
      } catch (e) {
        boards = getSavedBoards().length;
      }
      return saved + boards;
    } catch (e) {
      return 0;
    }
  });

  const [summary, setSummary] = useState<{
    averageSttScore: number | null;
    totalInterviewCount: number;
    currentStreakDays: number;
    scrapCount: number;
  } | null>(null);
  const [isSummaryLoaded, setIsSummaryLoaded] = useState(false);

  const [recentScore, setRecentScore] = useState<number | null>(null);
  const [isRecentLoaded, setIsRecentLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '');
  });

  React.useEffect(() => {
    // Ensure saved problems are loaded from backend (DB) on mount
    (async () => {
      try {
        const m = await import('../../utils/myPageStore');
        if (m && typeof m.refreshSavedProblems === 'function') {
          await m.refreshSavedProblems(0, 20);
        }
      } catch (e) {
        console.debug('[MyPage] refreshSavedProblems failed', e);
      }
    })();

    let mounted = true;
    (async () => {
      try {
        console.debug('[MyPage] fetching summary');
        const resp = await mypageService.getUserSummary();
        console.debug('[MyPage] getUserSummary response', resp);
        if (mounted) {
          if (resp && resp.data) {
            setSummary(resp.data);
            console.debug('[MyPage] setSummary', resp.data);
          } else {
            console.debug('[MyPage] getUserSummary returned no data');
          }
          setIsSummaryLoaded(true);
        }
      } catch (e) {
        console.error('[MyPage] getUserSummary error', e);
        if (mounted) setIsSummaryLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // fetch latest interview score
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await interviewService.getInterviews();
        const interviews = (list as any).interviews ?? [];
        if (!interviews.length) {
          if (mounted) setIsRecentLoaded(true);
          return;
        }

        // pick latest by finishedAt (fallback to startedAt)
        interviews.sort((a: any, b: any) => {
          const aTime = Date.parse(a.finishedAt ?? a.startedAt ?? a.createdAt ?? 0);
          const bTime = Date.parse(b.finishedAt ?? b.startedAt ?? b.createdAt ?? 0);
          return bTime - aTime;
        });
        const latest = interviews[0];
        if (!latest) {
          if (mounted) setIsRecentLoaded(true);
          return;
        }

        // set header's last updated date from latest interview (finishedAt > startedAt)
        try {
          const dt = latest.finishedAt ?? latest.startedAt ?? latest.createdAt ?? new Date().toISOString();
          const formatted = new Date(dt).toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '');
          if (mounted) setLastUpdated(formatted);
        } catch (e) {
          if (mounted) setLastUpdated(new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, ''));
        }

        const result = await interviewService.getInterviewResult(latest.interviewId);
        // prefer overallScore/totalScore, else compute avg of turns' sttScore
        let score: number | null = null;
        if (typeof (result as any).overallScore === 'number') score = (result as any).overallScore;
        else if (typeof (result as any).totalScore === 'number') score = (result as any).totalScore;
        else if (Array.isArray((result as any).turns)) {
          const turns = (result as any).turns as any[];
          const values = turns.map(t => (typeof t?.sttScore === 'number' ? t.sttScore : null)).filter(v => v != null) as number[];
          if (values.length) {
            score = values.reduce((s, v) => s + v, 0) / values.length;
          }
        }

        if (mounted) {
          setRecentScore(score == null ? null : Number(score));
          setIsRecentLoaded(true);
        }
      } catch (e) {
        console.error('[MyPage] fetch recent interview error', e);
        if (mounted) setIsRecentLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    console.debug('[MyPage] summary changed', summary, 'loaded=', isSummaryLoaded);
  }, [summary, isSummaryLoaded]);

  React.useEffect(() => {
    const handler = async () => {
      try {
        const saved = getSavedProblems().length;
        let boards = 0;
        try {
          const { getSavedBoards } = await import('../../utils/myPageStore');
          boards = (getSavedBoards ? getSavedBoards().length : 0);
        } catch (e) {
          boards = getSavedBoards().length;
        }
        setSavedCount(saved + boards);
      } catch (e) {
        setSavedCount(0);
      }
    };
    window.addEventListener('myPage:savedUpdated', handler as EventListener);
    window.addEventListener('myPage:likedUpdated', handler as EventListener);
    window.addEventListener('myPage:scrapUpdated', handler as EventListener);
    return () => {
      window.removeEventListener('myPage:savedUpdated', handler as EventListener);
      window.removeEventListener('myPage:likedUpdated', handler as EventListener);
      window.removeEventListener('myPage:scrapUpdated', handler as EventListener);
    };
  }, []);

  return (
    <>
      {/* 마이페이지용 모달 예시 */}
      <MypageModal
        open={modal.open}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
        type={modal.type}
        title={modal.title}
        buttonText={modal.buttonText}
      />

      {/* Stats Bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <StatCard
          icon={<BarChart3 size={16}/>} 
          label="최근 면접 평균점수"
          value={!isRecentLoaded ? '-' : (recentScore != null ? String(Math.round(Number(recentScore))) : '-')}
          color="text-indigo-400"
        />
        <StatCard
          icon={<Activity size={16}/>} 
          label="면접 총 횟수"
          value={!isSummaryLoaded ? '-' : String(summary?.totalInterviewCount ?? 0)}
          color="text-cyan-400"
        />
        <StatCard
          icon={<Award size={16}/>} 
          label="연속 면접 일수"
          value={!isSummaryLoaded ? '-' : String(summary?.currentStreakDays ?? 0)}
          color="text-sky-400"
        />
        <StatCard
          icon={<Bookmark size={16}/>} 
          label="스크랩 수"
          value={!isSummaryLoaded ? '-' : String(summary?.scrapCount ?? savedCount)}
          color="text-indigo-400"
        />
      </motion.div>

      {/* Activity Sections */}
      <section className="flex-1 flex flex-col min-h-0">
        <div className="flex items-end justify-between px-2 mb-6 shrink-0">
           <h3 className="text-4xl font-black tracking-tighter uppercase text-text-main leading-none">활동 기록</h3>
           <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">최근 업데이트: {lastUpdated}</span>
        </div>
        
        <div className="grid gap-4 flex-1">
          {CONTENT_SECTIONS.map((section) => (
            <motion.div key={section.id} variants={itemVariants} className="h-full">
              <ContentCard 
                {...section} 
                onClick={() => navigate(section.path)} 
              />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};

export default MyPage;