import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { Zap, Brain, Users, Trophy, ArrowUpRight } from 'lucide-react';

const ServiceIntro: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-bg-main flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Background Elements */}




      {/* Header */}
      <div className="relative z-10 text-center mb-8 md:mb-12">
        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white mb-2">
          Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Next Level</span>
        </h2>
        <p className="text-zinc-500 text-sm font-bold tracking-[0.2em] uppercase">
          AI-Powered Interview Solutions
        </p>
      </div>

      {/* Interactive Grid */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-4 h-[600px] md:h-[500px]">
        
        {/* Card 1: AI Analysis (Large) */}
        <TiltCard
          onClick={() => navigate('/about')}
          className="col-span-1 md:col-span-2 row-span-2 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-3xl p-8 flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap size={28} />
            </div>
            <ArrowUpRight className="text-white/20 group-hover:text-white transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase text-white mb-2 tracking-tight">Real-Time AI Analysis</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              면접관의 관점에서 당신의 표정, 목소리, 시선을 실시간으로 분석합니다. 단순한 답변 교정을 넘어 비언어적 습관까지 완벽하게 케어하세요.
            </p>
          </div>
          <div className="flex gap-2 mt-4">
             {['Eye Contact', 'Voice Tone', 'Emotion'].map(tag => (
               <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase text-zinc-400">{tag}</span>
             ))}
          </div>
        </TiltCard>

        {/* Card 2: Knowledge Archive */}
        <TiltCard
          onClick={() => navigate('/mypage/saved')}
          className="col-span-1 md:col-span-1 row-span-2 md:row-span-1 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-3xl p-6 flex flex-col justify-between group"
        >
           <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Brain size={20} />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase text-white mb-1 tracking-tight">Smart Archive</h3>
              <p className="text-zinc-500 text-xs font-medium">오답 노트와 핵심 CS 지식을 자동으로 정리해드립니다.</p>
           </div>
        </TiltCard>

        {/* Card 3: Gamification */}
        <TiltCard
          onClick={() => navigate('/mypage')}
          className="col-span-1 md:col-span-1 row-span-2 md:row-span-1 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-3xl p-6 flex flex-col justify-between group"
        >
           <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Trophy size={20} />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase text-white mb-1 tracking-tight">Rank System</h3>
              <p className="text-zinc-500 text-xs font-medium">스트릭과 랭킹 시스템으로 꾸준한 성장을 증명하세요.</p>
           </div>
        </TiltCard>

        {/* Card 4: Community (Wide) */}
        <TiltCard className="col-span-1 md:col-span-2 row-span-1 bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/10 rounded-3xl p-6 flex items-center gap-6 group">
           <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users size={28} />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase text-white mb-1 tracking-tight">Dev Community</h3>
              <p className="text-zinc-400 text-sm">
                수천 명의 개발자와 함께하는 모의 면접 스터디. 혼자가 아닌 함께 성장하는 여정을 시작해보세요.
              </p>
           </div>
           <button
             onClick={() => navigate('/study')}
             className="ml-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all"
           >
             <ArrowUpRight size={18} />
           </button>
        </TiltCard>

      </div>
    </div>
  );
};

/* 3D Tilt Card Component */
const TiltCard = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX: useMotionTemplate`${mouseY}deg`, // Y축 이동 -> X축 회전
        rotateY: useMotionTemplate`${mouseX}deg`, // X축 이동 -> Y축 회전
        transformStyle: "preserve-3d",
      }}
      className={`relative transform transition-transform duration-200 ease-out hover:z-20 ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div 
        style={{ transform: "translateZ(20px)" }} 
        className="relative z-10 w-full h-full"
      >
        {children}
      </div>
      
      {/* Glow Effect */}
      <motion.div
        style={{
          background: useMotionTemplate`radial-gradient(
            400px circle at ${mouseX}px ${mouseY}px,
            rgba(99, 102, 241, 0.15),
            transparent 80%
          )`,
        }}
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"
      />
    </motion.div>
  );
};

export default ServiceIntro;