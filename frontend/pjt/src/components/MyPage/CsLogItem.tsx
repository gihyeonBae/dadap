import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trash2, ChevronRight, Database } from 'lucide-react';

export interface CsLog {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  score: number;
  grade: string;
  status: string;
  feedback: string;
}

interface CsLogItemProps {
  log: CsLog;
  onClick: (id: number) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}

const CsLogItem: React.FC<CsLogItemProps> = ({ log, onClick, onDelete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
      onClick={() => onClick(log.id)} 
    >
      <div className="p-8 rounded-3xl border border-border-subtle bg-bg-card backdrop-blur-2xl hover:bg-bg-surface transition-all cursor-pointer overflow-hidden shadow-2xl shadow-black/20 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border-main to-transparent opacity-50 group-hover:via-accent-primary" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${log.status === 'COMPLETE' ? 'border-green-500/20 text-green-400 bg-green-500/10' : 'border-yellow-500/20 text-yellow-400 bg-yellow-500/10'}`}>
                {log.status}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-accent-primary font-bold tracking-wider uppercase bg-accent-primary/10 px-2 py-1 rounded border border-accent-primary/20">
                <Database size={10} /> {log.category}
              </span>
            </div>
            <h3 className="text-xl font-bold text-text-main tracking-tight group-hover:text-accent-primary transition-colors mb-3">
              {log.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-text-muted font-medium uppercase tracking-wide">
              <div className="flex items-center gap-1.5"><Calendar size={12} className="text-accent-primary" />{log.date}</div>
              <div className="flex items-center gap-1.5"><Clock size={12} className="text-accent-primary" />{log.time} ({log.duration})</div>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-8 min-w-[220px]">
            <div className="text-center">
              <div className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-1">Score</div>
              <div className="text-4xl font-black text-text-main tracking-tighter">
                {log.score}<span className="text-lg text-text-muted ml-0.5">/100</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={(e) => onDelete(log.id, e)}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-border-subtle bg-bg-surface text-text-muted hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={18} />
              </button>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border-subtle bg-bg-surface group-hover:bg-accent-primary group-hover:border-accent-primary text-text-muted group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CsLogItem;
