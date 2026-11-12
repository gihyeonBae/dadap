import React from 'react';
import type { LogData } from '../Studylog.types';
import { CATEGORY_STYLE, STUDYLOG_STYLES, CATEGORY_LABELS } from '../Studylog.constants';

interface LogItemProps {
  log: LogData;
}

const LogItem: React.FC<LogItemProps> = ({ log }) => {
  const style = CATEGORY_STYLE[log.category];
  const Icon = style.icon;

  return (
    <div className={STUDYLOG_STYLES.logItem}>
      <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border ${style.border} ${style.bg}`}>
        <Icon size={20} className={style.color} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-main truncate">{log.title}</p>
        <p className={`text-[10px] font-black uppercase tracking-widest ${style.color}`}>
          {CATEGORY_LABELS[log.category]}
        </p>
      </div>
      
      <div className="text-base font-mono font-bold text-text-main">
        {log.score ?? '--'}
      </div>
    </div>
  );
};

export default LogItem;
