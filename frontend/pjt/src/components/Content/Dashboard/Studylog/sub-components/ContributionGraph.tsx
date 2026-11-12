import React, { useMemo } from 'react';
import type { ContributionData } from '../Studylog.types';
import { MONTH_NAMES, WEEKDAY_LABELS_EN, CONTRIBUTION_COLORS } from '../Studylog.constants';

interface ContributionGraphProps {
  data: ContributionData[];
  streak?: { streakDates: string[] };
  year: number;
}

const ContributionGraph: React.FC<ContributionGraphProps> = ({ data, streak, year }) => {
  const { days, weeksCount, monthLabels, dataMap, streakSet } = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(year, 11, 31);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const dataMap = new Map<string, { count: number; level: number }>();
    (data || []).forEach(d => dataMap.set(d.date, { count: d.count, level: d.level }));

    const daysList: { date: string; jsDate: Date }[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      daysList.push({ 
        date: new Date(d).toISOString().slice(0, 10), 
        jsDate: new Date(d) 
      });
    }

    const weeks = Math.ceil(daysList.length / 7);
    const labels: { label: string; colStart: number }[] = [];
    
    for (let m = 0; m < 12; m++) {
      let firstIdx = -1;
      let lastIdx = -1;
      for (let i = 0; i < daysList.length; i++) {
        const d = daysList[i].jsDate;
        if (d.getFullYear() === year && d.getMonth() === m) {
          if (firstIdx === -1) firstIdx = Math.floor(i / 7);
          lastIdx = Math.floor(i / 7);
        }
      }
      if (firstIdx !== -1) {
        labels.push({ label: MONTH_NAMES[m], colStart: Math.floor((firstIdx + lastIdx) / 2) + 1 });
      }
    }

    const streakSet = new Set<string>(streak?.streakDates || []);
    return { days: daysList, weeksCount: weeks, monthLabels: labels, dataMap, streakSet };
  }, [data, streak, year]);

  const cellSize = 12;
  const gap = 6;
  const gridMinWidth = weeksCount * (cellSize + gap);

  return (
    <div className="flex items-start w-full gap-4 overflow-visible">
      {/* Weekday Labels */}
      <div className="flex flex-col justify-between pt-8 text-[10px] text-text-muted h-[120px]">
        {WEEKDAY_LABELS_EN.map(day => <span key={day}>{day}</span>)}
      </div>

      {/* Grid Scrollable */}
      <div className="flex-1 pb-2 overflow-x-auto overflow-y-visible custom-scrollbar">
        {/* Month Labels */}
        <div 
          className="grid items-center mb-2 h-4 text-[10px] text-text-muted"
          style={{ 
            minWidth: gridMinWidth, 
            gridTemplateColumns: `repeat(${weeksCount}, ${cellSize + gap}px)`,
            columnGap: `${gap}px` 
          }}
        >
          {monthLabels.map(({ label, colStart }) => (
            <div key={`${label}-${colStart}`} style={{ gridColumnStart: colStart }}>{label}</div>
          ))}
        </div>

        {/* Contribution Grid */}
        <div 
          className="grid gap-[6px]"
          style={{ 
            minWidth: gridMinWidth, 
            gridTemplateColumns: `repeat(${weeksCount}, ${cellSize + gap}px)`,
            gridTemplateRows: `repeat(7, ${cellSize}px)` 
          }}
        >
          {days.map((day, i) => {
            const weekIndex = Math.floor(i / 7) + 1;
            const weekday = day.jsDate.getDay() + 1;
            const info = dataMap.get(day.date) ?? { count: 0, level: 0 };
            const isStreak = streakSet.has(day.date);
            const level = isStreak ? 4 : info.level;
            
            const tooltipText =
              info.count > 0 ? `${day.date}: ${info.count}문제 해결` : `${day.date}: 기록 없음`;
            const tooltipPositionClass = weekday === 1 ? 'top-5' : '-top-8';

            return (
              <div
                key={day.date}
                className="relative group"
                style={{ gridColumn: weekIndex, gridRow: weekday }}
              >
                <div
                  className={`w-3 h-3 rounded-[2px] transition-colors ${CONTRIBUTION_COLORS(level)} group-hover:brightness-110 group-hover:ring-2 group-hover:ring-text-main/60`}
                />
                <div className={`pointer-events-none absolute ${tooltipPositionClass} left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-3 py-1 text-[10px] font-black text-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100 z-10`}>
                  {tooltipText}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;


