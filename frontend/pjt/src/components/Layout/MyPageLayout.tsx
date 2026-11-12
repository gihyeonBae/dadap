import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MyPageSidebar from '../MyPage/MyPageSidebar';

const MyPageLayout: React.FC = () => {
  const location = useLocation();
  
  // /mypage 메인(대시보드)이 아닌 모든 하위 페이지에서는 사이드바를 숨깁니다.
  const isDashboard = location.pathname === '/mypage' || location.pathname === '/mypage/';
  const shouldHideSidebar = !isDashboard;

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-bg-main text-text-main font-sans overflow-x-hidden pt-32 pb-20 transition-colors duration-300">
      {/* 공통 배경 효과 */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-secondary/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      </div>

      <div className={`relative z-10 flex flex-col lg:flex-row w-full mx-auto px-6 gap-8 items-stretch ${
        shouldHideSidebar ? 'max-w-5xl' : 'max-w-7xl'
      }`}>
        {/* 조건부 사이드바 렌더링 */}
        {!shouldHideSidebar && <MyPageSidebar />}

        {/* 하위 페이지 콘텐츠 출력 영역 */}
        <main className="flex-1 flex flex-col gap-8 h-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MyPageLayout;
