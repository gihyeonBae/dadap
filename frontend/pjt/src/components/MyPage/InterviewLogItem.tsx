import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trash2, ChevronRight, Database } from 'lucide-react';

export interface InterviewLog {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  score: number;
  grade: string;
  status: string;
  feedback: string;
  category?: string; // Optional for CS logs
}

interface InterviewLogItemProps {
  log: InterviewLog;
  onClick: (id: number) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
  themeColor?: 'indigo' | 'cyan';
}

const InterviewLogItem: React.FC<InterviewLogItemProps> = ({ 
  log, 
  onClick, 
  onDelete, 
  themeColor = 'indigo' 
}) => {
  const accentClass = themeColor === 'indigo' ? 'group-hover:via-indigo-400' : 'group-hover:via-cyan-400';
  const iconColorClass = themeColor === 'indigo' ? 'text-indigo-400' : 'text-cyan-400';
  const bgColorClass = themeColor === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-cyan-500/10 border-cyan-500/20';
  const btnHoverClass = themeColor === 'indigo' ? 'group-hover:bg-indigo-600 group-hover:border-indigo-500' : 'group-hover:bg-cyan-600 group-hover:border-cyan-500';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
      onClick={() => onClick(log.id)} 
    >
      <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl hover:bg-white/[0.04] transition-all cursor-pointer overflow-hidden shadow-2xl shadow-black/20 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 ${accentClass}`} />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${log.status === 'COMPLETE' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/20 text-amber-400 bg-amber-500/10'}`}>
                {log.status}
              </span>
              {log.category && (
                <span className={`flex items-center gap-1 text-[10px] ${iconColorClass} font-bold tracking-wider uppercase ${bgColorClass} px-2 py-1 rounded border`}>
                  <Database size={10} /> {log.category}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-white transition-colors mb-3">
              {log.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium uppercase tracking-wide">
              <div className="flex items-center gap-1.5"><Calendar size={12} className={iconColorClass} />{log.date}</div>
              <div className="flex items-center gap-1.5"><Clock size={12} className={iconColorClass} />{log.time} ({log.duration})</div>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-8 min-w-[220px]">
            <div className="text-center">
              <div className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase mb-1">Score</div>
              <div className="text-4xl font-black text-white tracking-tighter">
                {log.score}<span className="text-lg text-zinc-600 not-italic ml-0.5">/100</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={(e) => onDelete(log.id, e)}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 bg-white/5 text-zinc-500 hover:text-rose-500 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all"
              >
                <Trash2 size={18} />
              </button>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/10 bg-white/5 ${btnHoverClass} text-zinc-400 group-hover:text-white transition-all`}>
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InterviewLogItem;
