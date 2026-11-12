import React from 'react';
import Starter from '../Content/Dashboard/Starter';
import FrostedCard from '../Content/FrostedCard';
import Studylog from '../Content/Dashboard/Studylog';
import ServiceIntro from './ServiceIntro';
import { MAIN_LAYOUT_STYLES } from './Main.constants';

const Main: React.FC = () => {
  return (
    <div className={MAIN_LAYOUT_STYLES.container}>
      
      {/* 섹션 1: Starter & Studylog (히어로 섹션) */}
      <section className={MAIN_LAYOUT_STYLES.heroSection}>
        <div className={MAIN_LAYOUT_STYLES.heroLeft}>
          <Starter />
        </div>
        <div className={MAIN_LAYOUT_STYLES.heroRight}>
          <Studylog />
        </div>
      </section>

      {/* 섹션 2: FrostedCard (3D 아카이브) */}
      <section className={MAIN_LAYOUT_STYLES.archiveSection}>
        <FrostedCard />
      </section>

      {/* 섹션 3: ServiceIntro (기능 소개) */}
      <section className={MAIN_LAYOUT_STYLES.introSection}>
        <ServiceIntro />
      </section>

    </div>
  );
};

export default Main;