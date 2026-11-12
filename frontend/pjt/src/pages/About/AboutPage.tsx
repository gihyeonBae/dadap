import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Brain, Target, Shield, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const StickySection: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  index: number;
}> = ({ children, className, index }) => {
  return (
    <div 
      className={`sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden border-t border-border-subtle ${className}`}
      style={{ zIndex: index }}
    >
      {children}
    </div>
  );
};

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slideFeatures = [
    { title: "실시간 분석", desc: "표정, 음성, 시선 처리를 실시간으로 분석하여 비언어적 습관을 교정합니다.", step: "01" },
    { title: "트렌드 업데이트", desc: "최신 기술 면접 트렌드를 반영한 예상 질문으로 실전 감각을 키웁니다.", step: "02" },
    { title: "자동 아카이브", desc: "틀린 문제와 핵심 개념을 자동으로 정리하여 나만의 오답 노트를 생성합니다.", step: "03" },
    { title: "커뮤니티", desc: "함께 성장하는 개발자들과 모의 면접을 진행하고 피드백을 주고받으세요.", step: "04" }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slideFeatures.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slideFeatures.length) % slideFeatures.length);
  };

  return (
    <div className="relative w-full h-screen overflow-y-auto bg-black font-sans selection:bg-blue-500 selection:text-black [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
      
      {/* 1. HERO: Black & White (Reverted) */}
      <StickySection index={10} className="bg-bg-main text-text-main">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-3 h-3 bg-accent-primary rounded-full animate-pulse" />
              <span className="text-accent-primary font-mono text-sm tracking-widest uppercase">System Operational</span>
            </div>
            <h1 className="text-[10vw] leading-[0.9] font-black tracking-tighter uppercase mb-12 text-text-main">
              Dadap<span className="text-accent-primary">.</span><br/>
              Interview<br/>
              Mastery
            </h1>
            <div className="w-full h-px bg-border-main mb-12" />
            <div className="flex flex-col md:flex-row justify-between items-end w-full gap-8">
              <p className="max-w-xl text-xl text-text-sub font-medium leading-relaxed">
                AI 기반 실시간 피드백과 CS 아카이브.<br/>
                개발자 면접의 새로운 기준을 제시합니다.
              </p>
              <button 
                onClick={() => navigate('/signup')}
                className="group flex items-center gap-4 px-8 py-4 bg-text-main text-bg-main font-bold text-lg hover:bg-accent-primary hover:text-white transition-colors"
              >
                Start Journey <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </StickySection>

      {/* 2. FEATURES: Tech Spec Grid */}
      <StickySection index={20} className="bg-bg-surface text-text-main">
        <div className="max-w-7xl mx-auto px-6 w-full h-full flex flex-col justify-center">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-border-main pb-8">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2">Core System</h2>
              <p className="text-text-sub">Advanced modules for interview mastery.</p>
            </div>
            <div className="hidden md:block text-right">
               <div className="text-xs font-mono text-accent-primary mb-1">STATUS: ONLINE</div>
               <div className="text-xs font-mono text-text-muted">V.2.0.4</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                icon: Brain, 
                title: "AI Neural Coach", 
                desc: "LLM 기반 실시간 면접 시뮬레이션",
                sub: "Context-Aware Questioning"
              },
              { 
                icon: Target, 
                title: "Precision Analysis", 
                desc: "비언어적 행동 패턴 정밀 분석",
                sub: "Multi-Modal Feedback"
              },
              { 
                icon: Shield, 
                title: "Knowledge Archive", 
                desc: "CS 지식 체계화 및 오답 관리",
                sub: "Smart Indexing"
              },
              { 
                icon: Sparkles, 
                title: "Gamification", 
                desc: "지속적인 성장을 위한 동기 부여",
                sub: "Achievement System"
              }
            ].map((feature, i) => (
              <div key={i} className="group bg-bg-card backdrop-blur-md border border-border-subtle p-10 rounded-[2rem] hover:bg-bg-surface transition-all duration-300 relative overflow-hidden">
                <feature.icon size={40} className="text-text-muted group-hover:text-accent-primary transition-colors duration-300 mb-6" />
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-text-sub mb-4">{feature.desc}</p>
                <span className="text-xs font-mono text-accent-primary/50 group-hover:text-accent-primary transition-colors uppercase tracking-wider">
                  [{feature.sub}]
                </span>
              </div>
            ))}
          </div>
        </div>
      </StickySection>

      {/* 3. WHY US: Modern Minimal (Reverted) */}
      <StickySection index={30} className="bg-white text-zinc-900">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row gap-16 md:gap-32 items-center">
          <div className="flex-1 text-left">
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-black">Why<br/>DADAP?</h2>
            <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium">
              단순한 암기가 아닙니다.<br/>
              <span className="text-blue-600 font-semibold">체화된 지식</span>과 <span className="text-blue-600 font-semibold">실전 감각</span>입니다.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="relative h-[600px] w-full flex items-end justify-center pb-24">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/30 via-purple-300/30 to-pink-300/30 rounded-full blur-[80px] pointer-events-none" />
              <motion.div 
                className="relative w-full max-w-5xl h-[240px]"
              >
                {slideFeatures.map((feature, index) => {
                  const offset = (index - currentIndex + slideFeatures.length) % slideFeatures.length;
                  return (
                    <motion.div
                      key={index}
                      layout
                      initial={false}
                      animate={{
                        x: offset * 70,
                        y: -offset * 45,
                        scale: 1 - offset * 0.05,
                        zIndex: slideFeatures.length - offset,
                        opacity: 1 - offset * 0.1,
                        filter: offset === 0 ? "blur(0px)" : "blur(1px)"
                      }}
                      whileHover={offset !== 0 ? { x: offset * 70 + 20, y: -offset * 45 - 10, cursor: 'pointer' } : {}}
                      onClick={() => setCurrentIndex(index)}
                      drag={offset === 0 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, { offset: { x } }) => {
                        if (x < -50) handleNext();
                        if (x > 50) handlePrev();
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="absolute top-0 left-0 w-full h-full bg-zinc-50 border border-zinc-200 p-8 rounded-[2rem] shadow-2xl flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-6xl font-black text-blue-100">{feature.step}</span>
                        <div className={`p-3 rounded-full text-white transition-colors ${offset === 0 ? 'bg-blue-600' : 'bg-zinc-300'}`}>
                          <CheckCircle2 size={24} />
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-3xl font-bold mb-4 transition-colors ${offset === 0 ? 'text-zinc-900' : 'text-zinc-400'}`}>{feature.title}</h3>
                        <p className={`font-medium leading-relaxed transition-colors ${offset === 0 ? 'text-zinc-500' : 'text-zinc-300'}`}>{feature.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </StickySection>

      {/* 4. CTA: Lime (Accent) */}
      <StickySection index={40} className="bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-[10vw] font-black uppercase tracking-tighter leading-none mb-12">
            Ready To<br/>Level Up?
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button 
              onClick={() => navigate('/signup')}
              className="px-12 py-6 bg-white text-blue-900 text-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl"
            >
              Create Account
            </button>
            <button 
              onClick={() => navigate('/study')}
              className="px-12 py-6 border-4 border-white text-white text-xl font-black uppercase tracking-widest hover:bg-white hover:text-blue-900 transition-colors"
            >
              Explore Archive
            </button>
          </div>
        </div>
      </StickySection>
      
    </div>
  );
};

export default AboutPage;