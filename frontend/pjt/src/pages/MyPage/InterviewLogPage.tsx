import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BarChart2, FileText } from 'lucide-react';
import InterviewLogItem, { type InterviewLog } from '../../components/MyPage/InterviewLogItem';
import MyPageHeader from '../../components/MyPage/MyPageHeader';

interface InterviewLogPageProps {
  type: 'AI' | 'CS';
  initialLogs: InterviewLog[];
  title: string;
  description: string;
  stats: {
    total: string;
    avgScore: string;
    ranking?: string;
    bestGrade?: string;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const InterviewLogPage: React.FC<InterviewLogPageProps> = ({ 
  type, 
  initialLogs, 
  title, 
  description, 
  stats 
}) => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<InterviewLog[]>(initialLogs);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("정말 이 기록을 삭제하시겠습니까?")) {
      setLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  const themeColor = type === 'AI' ? 'indigo' : 'cyan';

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >


      <div className="flex flex-col gap-6">
        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <InterviewLogItem 
              key={log.id} 
              log={log} 
              themeColor={themeColor}
              onClick={() => navigate(`/interview/report`)} 
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border border-white/5 rounded-3xl bg-white/[0.01] backdrop-blur-md">
             <FileText size={48} className="text-zinc-800 mb-4" />
             <p className="text-zinc-500 font-medium tracking-wide">저장된 {type} 면접 기록이 없습니다.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StatsCard = ({ label, value, icon, highlight = false, themeColor = 'indigo' }: { label: string, value: string, icon: React.ReactNode, highlight?: boolean, themeColor?: 'indigo' | 'cyan' }) => (
  <div className="flex-1 flex flex-col px-5 py-4 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md min-w-[100px] shadow-lg">
    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-1 text-nowrap">
      <span className={highlight ? (themeColor === 'indigo' ? 'text-indigo-400' : 'text-cyan-400') : ''}>{icon}</span> {label}
    </div>
    <div className={`text-2xl font-black tracking-tighter ${highlight ? (themeColor === 'indigo' ? 'text-indigo-400' : 'text-cyan-400') : 'text-white'}`}>
      {value}
    </div>
  </div>
);

export default InterviewLogPage;
