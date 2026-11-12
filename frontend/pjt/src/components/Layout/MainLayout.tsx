import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import ChatBot from '../Common/ChatBot';
import Footer from '../Footer/Footer';
import ScrollToTop from '../Common/ScrollToTop';

const MainLayout: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isChatVisible, setIsChatVisible] = useState<boolean>(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const isInterviewPage = location.pathname.startsWith('/interview');

  // Context memoization to prevent unnecessary re-renders of children when location changes
  const contextValue = React.useMemo(() => ({ 
    isOpen, 
    setIsOpen, 
    isChatVisible, 
    setIsChatVisible, 
    scrollRef 
  }), [isOpen, isChatVisible]);

  const header = (
    <Header 
      isOpen={isOpen} 
      setIsOpen={setIsOpen} 
      isChatVisible={isChatVisible} 
      setIsChatVisible={setIsChatVisible} 
      isInterviewPage={isInterviewPage} 
    />
  );
  
  const chatBot = (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      <ChatBot isVisible={isChatVisible} setIsVisible={setIsChatVisible} />
    </div>
  );

  if (isMainPage) {
    return (
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-bg-main font-sans text-text-main transition-colors duration-300">
        {chatBot}
        {header}
        <main
          ref={scrollRef}
          className="relative z-0 flex-1 overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        >
          <Outlet context={contextValue} />
          <section className="h-auto w-full snap-start flex items-end">
            <Footer />
          </section>
        </main>
      </div>
    );
  }

  // Interview pages have a layout where the footer is inside the scrollable area
  // to prevent it from overlapping with content.
  if (isInterviewPage) {
    return (
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-bg-main font-sans text-text-main transition-colors duration-300">
        {chatBot}
        {header}
        <main className="relative z-0 flex-1 overflow-y-auto">
          <Outlet context={contextValue} />
          <Footer />
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-bg-main font-sans text-text-main transition-colors duration-300">
      {chatBot}
      {header}
      <main className="relative z-0 flex-1 w-full">
        <Outlet context={contextValue} />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;