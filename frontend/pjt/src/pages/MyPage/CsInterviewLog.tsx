import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Trophy, BarChart2, FileText, Loader2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import CsLogItem, { type CsLog } from '../../components/MyPage/CsLogItem';
import MyPageHeader from '../../components/MyPage/MyPageHeader';
import { interviewService } from '../../api/interviewService';
import { setInterviewId } from '../../redux/slices/interviewSlice';

const PAGE_SIZE = 5;

const CsInterviewLog: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logs, setLogs] = useState<CsLog[]>([]);
  const [avgScore, setAvgScore] = useState<string>('-');
  const [ranking, setRanking] = useState<string>('-');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);

  // helper to read score from report responses (shared by effects)
  const extractReportScore = (rep: any) => {
    if (!rep) return 0;
    if (typeof rep.totalScore === 'number') return rep.totalScore;
    if (typeof rep.overallScore === 'number') return rep.overallScore;
    if (rep.data && typeof rep.data.totalScore === 'number') return rep.data.totalScore;
    if (rep.data && typeof rep.data.overallScore === 'number') return rep.data.overallScore;
    return 0;
  };

  const normalizeApi = (resp: any) => (resp && typeof resp === 'object' ? (resp.data ?? resp) : resp);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await interviewService.getInterviews();
        console.debug && console.debug('[CsInterviewLog] getInterviews response:', response);
        const mappedLogs: CsLog[] = response.interviews
          .filter(item =>
            item.interviewType === 'CS' &&
            item.status === 'FINISHED' &&
            item.startedAt &&
            new Date(item.startedAt).getFullYear() > 1971 // 1970, 1971년 데이터 제외
          )
          .map(item => {
            const start = new Date(item.startedAt);
            const end = item.finishedAt ? new Date(item.finishedAt) : null;
            const durationMin = end ? Math.floor((end.getTime() - start.getTime()) / 60000) : 0;

            return {
              id: item.interviewId,
              title: item.title || "CS 기술 면접",
              category: "Technical",
              date: start.toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, ''),
              time: start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
              duration: durationMin > 0 ? `${durationMin}분` : '-',
              score: 0,
              grade: '-',
              status: 'COMPLETE',
              feedback: "리포트를 통해 상세 결과를 확인하세요."
            };
          });
        

        // Try result first, fallback to report like AI log so CS shows same scores
        const withScores = await Promise.all(mappedLogs.map(async (lg) => {
          try {
            const rawRes = await interviewService.getInterviewResult(lg.id);
            const res = normalizeApi(rawRes);
            console.debug && console.debug('[CsInterviewLog] getInterviewResult', lg.id, res);

            // compute score from result first
            let score = 0;
            if (res) {
              if (typeof (res as any).overallScore === 'number') score = (res as any).overallScore;
              else if (typeof (res as any).totalScore === 'number') score = (res as any).totalScore;
              else if (Array.isArray((res as any).turns)) {
                const turns = (res as any).turns as any[];
                const vals = turns.map(t => (typeof t?.sttScore === 'number' ? t.sttScore : null)).filter(v => v != null) as number[];
                if (vals.length) score = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
              }
            }

            // NOTE: intentionally do NOT call /report from list view to avoid many 400 responses

            console.debug && console.debug('[CsInterviewLog] computed score for', lg.id, score);

            let grade = '-';
            if (typeof score === 'number') {
              if (score >= 85) grade = 'A';
              else if (score >= 70) grade = 'B';
              else if (score >= 50) grade = 'C';
              else grade = 'D';
            }
            return { ...lg, score, grade };
          } catch (err2) {
            console.warn('Failed to fetch interview result for', lg.id, err2);
            return lg;
          }
        }));

        // Sort by date descending
        withScores.sort((a, b) => {
          const dateA = new Date(a.date.replace(/\./g, '-') + ' ' + a.time).getTime();
          const dateB = new Date(b.date.replace(/\./g, '-') + ' ' + b.time).getTime();
          return dateB - dateA;
        });

        console.debug && console.debug('[CsInterviewLog] withScores length:', withScores.length);
        setLogs(withScores);

        const numericScores = withScores.map(w => (typeof w.score === 'number' ? w.score : null)).filter(s => s != null) as number[];
        if (numericScores.length) {
          const avg = Math.round(numericScores.reduce((s, v) => s + v, 0) / numericScores.length);
          const best = Math.max(...numericScores);
          console.debug && console.debug('[CsInterviewLog] numericScores', numericScores, 'avg', avg, 'best', best);
          setAvgScore(String(avg));
          setRanking(String(best));
        } else {
          console.debug && console.debug('[CsInterviewLog] no numeric scores found');
          setAvgScore('-');
          setRanking('-');
        }
      } catch (error) {
        console.error("Failed to fetch CS logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // We do not call /report from the list view to avoid many 400 responses; detailed report view will fetch report when opened.

  const totalPages = Math.ceil(logs.length / PAGE_SIZE);

  const currentLogs = useMemo(() => {
    const start = page * PAGE_SIZE;
    return logs.slice(start, start + PAGE_SIZE);
  }, [logs, page]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("정말 이 기록을 삭제하시겠습니까?")) {
      try {
        await interviewService.deleteInterview(id);
        setLogs(prev => prev.filter(log => log.id !== id));
        alert("면접이 삭제되었습니다.");
      } catch (error) {
        alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <MyPageHeader
        title="CS 지식 면접 기록"
      >
      </MyPageHeader>

      {/* Log List Section */}
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-cyan-500 animate-spin mb-4" />
            <p className="text-zinc-500 font-medium animate-pulse">면접 기록을 불러오는 중...</p>
          </div>
        ) : (
          <>
            {currentLogs.map((log) => (
              <CsLogItem 
                key={log.id} 
                log={log} 
                onClick={(id) => {
                  dispatch(setInterviewId(id));
                  navigate(`/interview/report`);
                }} 
                onDelete={handleDelete}
              />
            ))}
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 border border-white/5 rounded-3xl bg-white/[0.01] backdrop-blur-md">
                 <FileText size={48} className="text-zinc-800 mb-4" />
                 <p className="text-zinc-500 font-medium tracking-wide">저장된 CS 면접 기록이 없습니다.</p>
              </div>
            )}

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <footer className="flex justify-center items-center gap-2 mt-12 pb-8">
                <button
                  onClick={() => setPage(0)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/10 text-zinc-600 hover:text-white hover:border-white/30 transition-all disabled:opacity-30"
                  disabled={page <= 0}
                >
                  <ChevronsLeft size={18} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/10 text-zinc-600 hover:text-white hover:border-white/30 transition-all disabled:opacity-30"
                  disabled={page <= 0}
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1.5 px-2">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        idx === page
                          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 border border-cyan-500'
                          : 'bg-white/[0.02] border border-white/10 text-zinc-500 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/10 text-zinc-600 hover:text-white hover:border-white/30 transition-all disabled:opacity-30"
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => setPage(totalPages - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/10 text-zinc-600 hover:text-white hover:border-white/30 transition-all disabled:opacity-30"
                  disabled={page >= totalPages - 1}
                >
                  <ChevronsRight size={18} />
                </button>
              </footer>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

// 소형 통계 카드 컴포넌트
const StatsCard = ({ label, value, icon, highlight = false }: { label: string, value: string, icon: React.ReactNode, highlight?: boolean }) => (
  <div className="flex-1 flex flex-col px-5 py-4 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md min-w-[100px] shadow-lg">
    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-1">
      <span className={highlight ? 'text-cyan-400' : ''}>{icon}</span> {label}
    </div>
    <div className={`text-2xl font-black tracking-tighter ${highlight ? 'text-cyan-400' : 'text-white'}`}>
      {value}
    </div>
  </div>
);

export default CsInterviewLog;