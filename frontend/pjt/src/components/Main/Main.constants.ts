/**
 * Main 페이지 레이아웃 및 스타일 상수
 */
export const MAIN_LAYOUT_STYLES = {
  container: "w-full bg-bg-main flex flex-col snap-y snap-mandatory min-h-screen overflow-y-auto",
  
  // 히어로 섹션 (Starter + Studylog)
  heroSection: "min-h-screen w-full flex-shrink-0 snap-start flex flex-col md:flex-row items-center justify-center relative p-4 gap-4 md:gap-8",
  heroLeft: "w-full md:w-1/2 flex items-center justify-center",
  heroRight: "w-full md:w-1/2 flex items-center justify-center",

  // 아카이브 섹션 (FrostedCard)
  archiveSection: "h-[100dvh] w-full flex-shrink-0 snap-start flex items-center justify-center bg-bg-surface",

  // 서비스 소개 섹션 (ServiceIntro)
  introSection: "min-h-screen w-full flex-shrink-0 snap-start flex items-center justify-center"
};
