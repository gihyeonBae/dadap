import React from 'react';
import { Loader } from 'lucide-react';
import type { InterviewQuestion } from '../../../redux/slices/interviewSlice';

interface QuestionDisplayProps {
  currentQuestion: InterviewQuestion | undefined;
  currentIndex: number;
  isFetchingQuestion: boolean;
  isTransitioning: boolean;
  targetQuestionCount: number;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  currentQuestion,
  currentIndex,
  isFetchingQuestion,
  isTransitioning,
  targetQuestionCount
}) => {
  return (
    <div className="w-[400px] bg-[#121212] flex flex-col p-8 justify-center relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
        <div
          className="h-full bg-red-600 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / Math.max(1, targetQuestionCount)) * 100}%` }}
        />
      </div>

      <div className={`flex-1 flex flex-col justify-center transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <span className="text-red-500 font-bold tracking-wider text-sm mb-4">QUESTION {currentIndex + 1}</span>
        <div className="min-h-[120px] mb-8">
          {isFetchingQuestion ? (
            <div className="flex items-center gap-4 text-zinc-400">
              <Loader className="w-8 h-8 animate-spin" />
              <span className="text-2xl font-bold">질문을 가져오는 중...</span>
            </div>
          ) : (
            <h2 className="text-3xl font-bold text-white leading-snug break-keep">{currentQuestion?.text || "질문이 없습니다."}</h2>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {currentQuestion?.keywords.map((k, i) => (
              <span key={i} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-sm rounded-lg border border-zinc-700"># {k}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;
