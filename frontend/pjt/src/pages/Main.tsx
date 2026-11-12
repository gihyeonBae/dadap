import React from 'react';
import { motion, useScroll } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Dashboard from '../components/Content/Dashboard/Dashboard';
import FrostedCard from '../components/Content/FrostedCard';
import HeroImageSlider from '../components/Content/HeroImageSlider';

const MarqueeItem = ({ text, onClick }: { text: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="mx-6 text-lg md:text-xl font-black tracking-tighter text-text-main uppercase whitespace-nowrap hover:text-accent-primary transition-colors"
  >
    {text}
  </button>
);

const Main: React.FC = React.memo(() => {
  const { scrollRef } = useOutletContext<{ scrollRef: React.RefObject<HTMLDivElement> }>();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({ 
    container: scrollRef,
    offset: ["start start", "end end"]
  });

  const handleMarqueeItemClick = (item: { route?: string; modal?: string }) => {
    if (item.modal) {
      // 워크스페이스 섹션으로 부드럽게 스크롤
      document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
      // 스크롤 및 컴포넌트 렌더링 시간을 고려하여 모달 오픈 이벤트 지연 발생
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openStarterModal', { detail: { modal: item.modal } }));
      }, 800); // 0.8초 지연
    } else if (item.route) {
      navigate(item.route);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        ease: "easeOut",
        duration: 0.4
      }
    }
  } as const;
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  } as const;

  return (
    <div className="bg-bg-main w-full text-text-main selection:bg-accent-primary/20 relative font-sans transition-colors duration-300">
      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent-primary z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* 1. Hero Section */}
      <section
        className="h-[100dvh] w-full snap-start flex flex-col justify-center items-center relative overflow-visible px-6 bg-transparent"
      >
        {/* 배경 이미지: 절대 레이어로 배치하여 텍스트 앞/뒤 레이어 제어 */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* 이미지 슬라이더 */}
          <HeroImageSlider />
        </div>
        <div className="relative z-30 w-full max-w-7xl mx-auto flex items-start justify-center min-h-[72vh] px-6 md:px-0">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center md:items-start w-full gap-8 md:-ml-40"
          >
            <motion.span variants={itemVariants} className="text-accent-primary font-bold tracking-[0.3em] text-xs md:text-sm lg:text-base mb-4 md:mb-6 uppercase">
              AI Interview Solution
            </motion.span>
            <motion.h1 variants={itemVariants} className="font-black tracking-tighter text-text-main uppercase text-4xl md:text-6xl lg:text-7xl leading-tight mb-6 md:mb-8 text-center md:text-left">
              당신의 역량을<br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px var(--text-main)' }}>증명하세요</span>

            </motion.h1>
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end gap-8 md:gap-28 w-full">
                <p className="text-text-main/90 max-w-3xl text-base md:text-lg lg:text-xl leading-relaxed font-bold break-keep text-center md:text-left">
                    다답(DADAP)은 <br/>
                    AI 기술을 통해 CS 지식의 깊이를 진단하고<br/>
                    포트폴리오에 숨겨진 기술적 가치를 분석합니다.<br/>
                    정밀한 피드백 데이터로 당신의 가능성을 현실로 만드세요.
                   </p>
            </motion.div>
          </motion.div>
          {/* START WORKSPACE 버튼: 왼쪽 하단에 절대 배치, 크기 확대 */}
            <div className="absolute left-1/2 bottom-6 md:bottom-12 z-40 transform -translate-x-1/2">
            <button
              onClick={() => document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center gap-6 text-text-main font-extrabold uppercase tracking-widest text-lg md:text-2xl lg:text-3xl px-6 py-3 md:px-8 md:py-4 bg-transparent transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 focus:outline-none"
              style={{ letterSpacing: '0.12em' }}
            >
              <span>START WORKSPACE</span>
              <div className="w-20 h-[3px] bg-white group-hover:w-40 transition-all duration-300" />
            </button>
          </div>
        </div>

        <div className="absolute left-0 bottom-12 md:bottom-16 w-full z-10 pointer-events-auto">
          <div className="w-full overflow-hidden flex justify-center">
            <div className="w-full bg-bg-main py-4 border-y border-border-main">
              <div className="flex items-center animate-infinite-scroll gap-4">
              {(() => {
                const items = [
                  { text: 'Start AI Interview', modal: 'DOCS' },
                  { text: 'AI Interview Log', route: '/mypage/ai-log' },
                  { text: 'CS Knowledge Log', route: '/mypage/cs-log' },
                  { text: 'My Portfolio', route: '/mypage/docs' },
                  { text: 'Saved Questions', route: '/mypage/saved' },
                  { text: 'Learning Community', route: '/study' },
                  { text: 'Tech Archive', route: '/study/category/all' },
                  { text: 'About DADAP', route: '/about' },
                ];
                const repeated = Array(4).fill(items).flat();
                return repeated.map((it, i) => (
                  <MarqueeItem
                    key={`${it.text}-${i}`}
                    text={it.text}
                    onClick={() => handleMarqueeItemClick(it)}
                  />
                ));
              })()}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 3. Workspace Section */}
      <section id="workspace" className="h-[100dvh] w-full snap-start flex flex-col relative bg-bg-main pt-24 px-4 md:px-12">
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col h-full overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-between items-end mb-6 border-b border-border-main pb-4 shrink-0"
          >
            <div>
              <h2 className="font-black uppercase tracking-tighter text-text-main">
                WORKSPACE
              </h2>
            </div>
            <p className="hidden md:block text-text-muted text-sm font-bold max-w-sm text-right">
               AI 기반 면접 연습과 학습 기록을 관리하는 통합 환경
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 min-h-0 pb-8"
          >
             <Dashboard />
          </motion.div>
        </div>
      </section>

      {/* 4. Archive Section */}
      <section className="h-[100dvh] w-full snap-start flex flex-col relative bg-bg-main dark:bg-black pt-24" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="w-full h-full flex flex-col overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-between items-end mb-4 border-b border-border-main pb-4 px-4 md:px-12 max-w-7xl mx-auto w-full shrink-0"
          >
            <div>
              <h2 className="font-black uppercase tracking-tighter text-text-main">
                ARCHIVES
              </h2>
            </div>
            <p className="hidden md:block text-text-muted text-sm font-bold max-w-sm text-right">
               체계적인 핵심 개념 복습
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex-1 flex items-center justify-center min-h-0"
          >
             <FrostedCard />
          </motion.div>
        </div>
      </section>

      {/* Footer is now in MainLayout */}
      {/* <section className="h-auto w-full snap-start flex items-end">
        <Footer />
      </section> */}

      <style>{`
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 30s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
});

export default Main;