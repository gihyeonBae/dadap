import React from 'react';
import { ChevronLeft, ChevronRight, ScanLine, Calendar as CalendarIcon } from 'lucide-react';
import { STUDYLOG_STYLES, WEEKDAY_LABELS } from './Studylog.constants';
import { useStudylog } from './useStudylog';
import ContributionGraph from './sub-components/ContributionGraph';
import CalendarModal from './sub-components/CalendarModal';
import LogItem from './sub-components/LogItem';

const StudyLog: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    isCalendarOpen,
    setIsCalendarOpen,
    currentLogs,
    averageScore,
    streak,
    availableYears,
    selectedYear,
    setSelectedYear,
    yearContributions,
    calendarDays,
    getFormattedDate,
  } = useStudylog();

  return (
    <div className={STUDYLOG_STYLES.container}>
      {/* --- Top Row: Full Width Title --- */}
      <header className="md:col-span-12 mb-2">
        <h1 className="text-2xl font-black tracking-tighter text-text-main uppercase italic">
          Study Log
        </h1>
      </header>

      {/* --- Left Column: Stats + Calendar + Logs --- */}
      <div className="md:col-span-8 flex flex-col h-full min-h-0">
        <div className="grid grid-cols-3 gap-4 w-full mb-6">
          <div className={STUDYLOG_STYLES.statBox}>
            <span className="text-xl font-black text-accent-primary font-mono italic leading-none">
              {averageScore > 0 ? averageScore : '--'}
            </span>
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-2">
              Avg Score
            </span>
          </div>
          <div className={STUDYLOG_STYLES.statBox}>
            <span className="text-xl font-black text-text-main font-mono italic leading-none">
              {currentLogs.length}
            </span>
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-2">
              Completed
            </span>
          </div>
          <div className={STUDYLOG_STYLES.statBox}>
            <span className="text-xl font-black text-accent-secondary font-mono italic leading-none">
              {streak?.currentStreak ?? 0}
            </span>
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-2">
              Streak
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <section className="w-full shrink-0 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black text-text-main uppercase tracking-tighter italic">
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                onClick={() => setIsCalendarOpen(true)}
                className="p-1.5 rounded-lg bg-bg-card border border-border-main text-text-muted hover:text-text-main transition-colors"
              >
                <CalendarIcon size={12} />
              </button>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }} 
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-main bg-bg-card hover:bg-bg-surface transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }} 
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-main bg-bg-card hover:bg-bg-surface transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date) => {
              const dateStr = getFormattedDate(date);
              const isSelected = dateStr === getFormattedDate(selectedDate);
              return (
                <button 
                  key={dateStr} 
                  onClick={() => setSelectedDate(date)} 
                  className={`
                    ${STUDYLOG_STYLES.calendarBtn}
                    ${isSelected ? 'bg-accent-primary text-white shadow-lg scale-105' : 'bg-bg-card border border-border-subtle hover:border-accent-primary/20'}
                  `}
                >
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>
                    {WEEKDAY_LABELS[date.getDay()]}
                  </span>
                  <span className="text-sm font-black font-mono mt-1">
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Logs List */}
        <section className="w-full shrink-0 mb-2">
          <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-3 italic">
            Activity Log
          </h2>
          <div className={STUDYLOG_STYLES.logListContainer}>
            {currentLogs.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 p-2">
                {currentLogs.map((log) => (
                  <LogItem key={log.id} log={log} />
                ))}
              </div>
            ) : ( 
              <div className="h-full w-full flex flex-col items-center justify-center border-2 border-dashed border-border-main rounded-2xl opacity-20 py-12">
                <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">No Records Found</p>
              </div> 
            )}
          </div>
        </section>
      </div>

      {/* --- Right Column: Contribution & Stats --- */}
      <div className="md:col-span-4 flex flex-col gap-5 h-full min-h-0 pr-1">
        <div className={`${STUDYLOG_STYLES.card} h-fit`}>
          <h3 className="text-[10px] font-black text-text-main mb-6 flex items-center gap-2 uppercase italic tracking-[0.2em]">
            <ScanLine size={14} className="text-accent-primary"/> 
            Performance Matrix
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-accent-primary italic font-mono tracking-tighter">
                {currentLogs.length}
              </p>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-2">
                Month Activity
              </p>
            </div>
            <div>
              <p className="text-3xl font-black text-accent-secondary italic font-mono tracking-tighter">
                {streak?.currentStreak ?? 0}
              </p>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-2">
                Max Streak
              </p>
            </div>
          </div>
        </div>

        <div className={STUDYLOG_STYLES.card}>
          <div className="flex items-center justify-between mb-8">
            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Year Archive</div>
            <div className="flex items-center gap-2">
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))} 
                className="bg-bg-surface text-text-main text-[10px] font-black px-2 py-1 rounded border border-border-main appearance-none cursor-pointer hover:border-accent-primary/50 transition-colors"
              >
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-center">
            <ContributionGraph 
              data={yearContributions} 
              streak={streak} 
              year={selectedYear} 
            />
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <CalendarModal 
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          onClose={() => setIsCalendarOpen(false)}
          logs={currentLogs}
        />
      )}
    </div>
  );
};

export default StudyLog;

                                            