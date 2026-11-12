import React, { useState } from 'react';
import { XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { STUDYLOG_STYLES, WEEKDAY_LABELS, MONTH_NAMES } from '../Studylog.constants';
import type { LogData } from '../Studylog.types';

interface CalendarModalProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
  logs: LogData[];
}

const CalendarModal: React.FC<CalendarModalProps> = ({ selectedDate, onSelect, onClose, logs }) => {
  const getFormattedDate = (d: Date) => d.toISOString().slice(0, 10);
  
  // 현재 보고 있는 연도와 월을 로컬 상태로 관리
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d);
    const dateStr = getFormattedDate(date);
    const isToday = dateStr === getFormattedDate(new Date());
    const isSelected = dateStr === getFormattedDate(selectedDate);
    const hasData = logs.some(l => l.date === dateStr);

    days.push(
      <button
        key={d}
        onClick={() => { onSelect(date); onClose(); }}
        className={`
          relative h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all
          ${isSelected ? 'bg-accent-primary text-white shadow-lg' : 'hover:bg-bg-card text-text-sub'}
          ${isToday && !isSelected ? 'border border-accent-primary text-accent-primary' : ''}
        `}
      >
        {d}
        {hasData && (
          <div className={`absolute bottom-1.5 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-accent-primary'}`} />
        )}
      </button>
    );
  }

  return (
    <div className={STUDYLOG_STYLES.modalOverlay} onClick={onClose}>
      <div className={STUDYLOG_STYLES.modalContent} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h3 className="text-xl font-black tracking-tighter text-text-main uppercase italic">Select Date</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-sm font-bold text-accent-primary">{year}년 {MONTH_NAMES[month]}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 mr-2">
              <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-bg-card text-text-muted hover:text-text-main transition-colors border border-border-main">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-bg-card text-text-muted hover:text-text-main transition-colors border border-border-main">
                <ChevronRight size={16} />
              </button>
            </div>
            <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {WEEKDAY_LABELS.map(d => (
            <div key={d} className="text-[10px] font-black text-text-muted uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
