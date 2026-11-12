// pjt/src/components/Content/FrostedCard/DetailModal.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CardItem } from './FrostedCard.types';
import { CATEGORY_COLOR_MAP } from './FrostedCard.constants';
import { interviewService } from '../../../api/interviewService';

interface DetailModalProps {
  selectedItem: CardItem;
  onClose: () => void;
  summaryMaxLength?: number;
}

const DetailModal: React.FC<DetailModalProps> = ({ selectedItem, onClose, summaryMaxLength = 200 }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleNavigate = () => {
    const targetId = selectedItem.questionId || selectedItem.id;
    // 숫자 ID를 가진 경우 (API 데이터) 상세 페이지로, 아닌 경우 (폴백 데이터) 스터디 목록으로 이동
    if (typeof targetId === 'number' || !isNaN(Number(targetId))) {
      navigate(`/study/post/${targetId}`, {
        state: {
          title: selectedItem.title,
          category: selectedItem.category,
        },
      });
    } else {
      navigate('/study');
    }
    window.scrollTo(0, 0);
  };

  // 'ALL' 카테고리는 스타일이 없으므로 기본값 처리
  const categoryStyle = selectedItem.category !== 'ALL' ? CATEGORY_COLOR_MAP[selectedItem.category] : null;

  useEffect(() => {
    const qid = Number(selectedItem.questionId || selectedItem.id);
    if (!qid) return;

    let mounted = true;
    const fetchSummary = async () => {
      try {
        setLoadingSummary(true);
        const res = await interviewService.getQuestionDetail(qid);
        const data: any = (res as any).data ?? res;
        const content = data?.modelAnswer ?? data?.content ?? data?.description ?? '';
        if (!mounted) return;
        if (content) {
          const maxLen = Number(summaryMaxLength) || 200;
          const trimmed = content.length > maxLen ? content.slice(0, maxLen).trim() + '…' : content;
          setSummary(trimmed);
        } else {
          setSummary(null);
        }
      } catch (e) {
        console.error('DetailModal: failed to fetch summary', e);
        setSummary(null);
      } finally {
        if (mounted) setLoadingSummary(false);
      }
    };

    fetchSummary();
    return () => { mounted = false; };
  }, [selectedItem]);

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-bg-main/90 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-bg-surface text-text-main w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-300 border border-border-main"
        style={{ perspective: '1000px' }}
        onClick={e => e.stopPropagation()}
      >
        
        <div className="flex flex-col h-full max-h-[95vh]">
          {/* 상단: 타이틀 및 핵심 정보 (X 버튼 포함) */}
          <div className="w-full p-4 md:p-6 bg-bg-card border-b border-border-subtle relative overflow-hidden">
            {categoryStyle && <div className={`absolute inset-0 opacity-10 ${categoryStyle.bgClass.replace('/10', '/30')}`} />}

            <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-bg-card transition-colors z-20">
              <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="relative z-10">
              {categoryStyle && (
                <span 
                  className={`inline-block text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 ${categoryStyle.bgClass} border ${categoryStyle.borderClass}`}
                  style={{ color: categoryStyle.mainHex }}
                >
                  {categoryStyle.name}
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-2">
                {selectedItem.title}
              </h2>
              <div className="w-12 h-1 bg-text-main/20 rounded-full mb-2" />

              <div className="space-y-2 text-xs font-mono text-text-muted">
                <p>DOC-ID: {String(selectedItem.id).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* 하단: 상세 내용 및 액션 */}
          <div
            className="w-full p-8 md:p-12 flex flex-col flex-1 bg-white/10 backdrop-blur-md backdrop-saturate-150 relative transform-gpu"
            style={{
              boxShadow: 'inset 0 6px 30px rgba(0,0,0,0.25), 0 20px 40px rgba(16,24,40,0.35)',
              transform: 'translateZ(12px)'
            }}
          >
            {/* glass sheen (opacity 낮춤) */}
            <div className="pointer-events-none absolute inset-x-6 -top-6 h-16 rounded-t-2xl bg-gradient-to-b from-white/10 to-transparent opacity-30 blur-sm" />
            {/* glossy highlight (opacity 낮춤) */}
            <div className="pointer-events-none absolute right-6 top-6 w-24 h-6 rounded-full bg-white/10 blur-sm opacity-25 rotate-[-20deg]" />
            {/* subtle rim */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/5 mix-blend-overlay" />
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
              <p className="text-lg md:text-2xl font-medium leading-relaxed text-text-sub">
                {loadingSummary ? '요약을 불러오는 중입니다...' : (summary ?? selectedItem.desc ?? '내용을 불러오는 중입니다...')}
              </p>

            </div>

            <div className="mt-8 pt-8 border-t border-border-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-base text-text-muted leading-relaxed max-w-[70ch]">
                이 문서는 CS 지식 아카이브의 일부입니다. <br/>
                전체 내용을 확인하고 학습 기록에 반영하려면 상세 페이지로 이동하세요.
              </p>

              <div className="flex justify-end">
                <button
                  onClick={handleNavigate}
                  className="btn-accent px-6 py-3"
                >
                  학습 하러 가기
                  <svg className="w-4 h-4 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;