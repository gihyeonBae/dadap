import React from 'react';
import { SEMANTIC_COLORS } from './StudyDetail.constants';
import { useStudyDetail } from './useStudyDetail';
import StudyDetailHeader from './StudyDetailHeader';
import StudyDetailContent from './StudyDetailContent';
import StudyDetailFooter from './StudyDetailFooter';

const StudyDetail: React.FC = () => {
  const { id, navigate, loadingDetail, scrapLoading, isScrapped, showFollowUps, setShowFollowUps, post, handleBackToList, handleToggleScrap } = useStudyDetail();

  // id가 변경될 때(다른 게시물로 이동할 때) 항상 맨 위로 스크롤합니다.
  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      // 안전하게 실패 무시
      try { window.scrollTo(0, 0); } catch (err) {}
    }
  }, [id]);

  if (!post && loadingDetail) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${SEMANTIC_COLORS.bgMain} flex-col gap-4`}>
        <p className={`text-xl ${SEMANTIC_COLORS.textSub}`}>불러오는 중입니다...</p>
      </div>
    );
  }

  if (!post && !loadingDetail) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${SEMANTIC_COLORS.bgMain} flex-col gap-4`}>
        <p className={`text-xl ${SEMANTIC_COLORS.textSub}`}>게시물을 찾을 수 없습니다.</p>
        <button 
            onClick={handleBackToList}
            className="text-accent-default hover:text-accent-hover underline"
        >
            목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${SEMANTIC_COLORS.bgMain} font-sans ${SEMANTIC_COLORS.textMain}`}>
      <div className="relative z-10 max-w-4xl mx-auto pt-40 pb-20 px-4">
        {post && <StudyDetailHeader post={post} handleBackToList={handleBackToList} />}
        {post && <StudyDetailContent post={post} showFollowUps={showFollowUps} setShowFollowUps={setShowFollowUps} navigate={navigate} />}
        {post && <StudyDetailFooter post={post} isScrapped={isScrapped} scrapLoading={scrapLoading} handleToggleScrap={handleToggleScrap} />}
      </div>
    </div>
  );
};

export default StudyDetail;