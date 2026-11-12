import { useState, useMemo, useEffect } from 'react';
import { interviewService } from '../../../../api/interviewService';
import type { StreakResponse } from '../../../../api/interviewService';
import type { LogData, CategoryKey } from './Studylog.types';

const getFormattedDate = (d: Date) => d.toISOString().slice(0, 10);

export const useStudylog = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [streak, setStreak] = useState<StreakResponse>({ currentStreak: 0, streakDates: [] });
  const [interviews, setInterviews] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Initial data fetching
  useEffect(() => {
    interviewService.getStreak()
      .then(setStreak)
      .catch(() => setStreak({ currentStreak: 0, streakDates: [] }));

    interviewService.getInterviews()
      .then((res) => setInterviews(res.interviews || []))
      .catch(err => console.error('getInterviews error', err));
  }, []);

  // Fetch daily logs when selectedDate changes
  useEffect(() => {
    const dateStr = getFormattedDate(selectedDate);
    interviewService.getDailyCategoryAverages(dateStr)
      .then((res) => {
        const items: LogData[] = [];
        (res.daily || []).forEach(dayItem => {
          dayItem.categories.forEach(cat => {
            (cat.sessions || []).forEach(sess => {
              if (!sess || !sess.interviewId) return;
              items.push({
                id: String(sess.interviewId),
                title: cat.categoryName || '학습',
                category: mapCategoryNameToKey(cat.categoryName || '') as CategoryKey,
                date: dayItem.date,
                score: typeof sess.avgScore === 'number' ? sess.avgScore : null,
                status: 'PASS',
              });
            });
          });
        });
        setLogs(items);
      })
      .catch(() => setLogs([]));
  }, [selectedDate]);

  const mapCategoryNameToKey = (name: string): CategoryKey => {
    const n = name.toLowerCase();
    if (n.includes('운영') || n.includes('운영체제')) return 'OS';
    if (n.includes('os')) return 'OS';
    if (n.includes('network') || n.includes('네트워크')) return 'NETWORK';
    if (n.includes('db') || n.includes('database') || n.includes('데이터')) return 'DATABASE';
    if (n.includes('portfolio') || n.includes('포트폴리오')) return 'PORTFOLIO';
    if (n.includes('backend') || n.includes('백엔드')) return 'BACKEND';
    if (n.includes('front') || n.includes('frontend') || n.includes('프론트')) return 'FRONTEND';
    if (n.includes('dsa') || n.includes('자료구조') || n.includes('algorithm') || n.includes('알고리즘')) return 'DSA';
    return 'DSA';
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const nowYear = new Date().getFullYear();
    years.add(nowYear);
    years.add(nowYear - 1);
    (streak?.streakDates || []).forEach((d: string) => years.add(new Date(d).getFullYear()));
    return Array.from(years).filter(y => !isNaN(y)).sort((a, b) => b - a);
  }, [streak]);

  const yearContributions = useMemo(() => {
    const streakSet = new Set<string>(streak?.streakDates || []);
    const streakCountMap = new Map<string, number>();
    (streak?.streakDateCounts || []).forEach((item) => {
      if (!item || !item.date) return;
      streakCountMap.set(item.date, item.count ?? 0);
    });
    const contributions = [];
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31);
    
    // If streakDateCounts exists, use it for per-day counts.
    // Otherwise fall back to 1 for streak dates only.
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = getFormattedDate(d);
      const count = streakCountMap.has(dateStr)
        ? (streakCountMap.get(dateStr) || 0)
        : (streakSet.has(dateStr) ? 1 : 0);
      let level = 0;
      if (count >= 8) level = 4;
      else if (count >= 5) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;
      contributions.push({ date: dateStr, count, level });
    }
    return contributions;
  }, [streak, selectedYear]);

  const { currentLogs, averageScore } = useMemo(() => {
    const scoredLogs = logs.filter(l => l.score !== null);
    const avg = scoredLogs.length === 0 ? 0 : Math.round(scoredLogs.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredLogs.length);
    return { currentLogs: logs, averageScore: avg };
  }, [logs]);

  const calendarDays = useMemo(() => {
    // 선택된 날짜가 속한 주의 일요일을 시작일로 설정하여 한 주를 보여줍니다.
    // 이렇게 하면 같은 주 내의 날짜를 클릭할 때 달력이 움직이지 않습니다.
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay(); // 0(일) ~ 6(토)
    startOfWeek.setDate(selectedDate.getDate() - day);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  return {
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
    getFormattedDate
  };
};
