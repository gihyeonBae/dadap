import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/Common/ScrollToTop';
import ScrollToTopButton from './components/Common/ScrollToTopButton';
import Loading from './components/Common/Loading';

// 레이아웃 및 페이지 임포트
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Lazy Load Pages
const Main = React.lazy(() => import('./pages/Main'));
const AuthPage = React.lazy(() => import('./pages/Auth/AuthPage').then(module => ({ default: module.AuthPage })));
const SocialLoginCallback = React.lazy(() => import('./pages/Auth/SocialLoginCallback'));
const MyPage = React.lazy(() => import('./pages/MyPage/MyPage'));
const AiInterviewLog = React.lazy(() => import('./pages/MyPage/AiInterviewLog'));
const CsInterviewLog = React.lazy(() => import('./pages/MyPage/CsInterviewLog'));
const SavedProblems = React.lazy(() => import('./pages/MyPage/SavedProblems/SavedProblems'));
const AccountSettings = React.lazy(() => import('./pages/MyPage/AccountSettings'));
const AboutPage = React.lazy(() => import('./pages/About/AboutPage'));

const StudyList = React.lazy(() => import('./pages/Study/StudyList'));
const StudyDetail = React.lazy(() => import('./pages/Study/StudyDetail/StudyDetail'));

const CommunityList = React.lazy(() => import('./pages/Community/CommunityPage').then(module => ({ default: module.CommunityList })));
const CommunityDetail = React.lazy(() => import('./pages/Community/CommunityPage').then(module => ({ default: module.CommunityDetail })));
const CreatePostPage = React.lazy(() => import('./pages/Community/CreatePostPage'));
const EditPostPage = React.lazy(() => import('./pages/Community/EditPostPage'));

const EnvironmentCheck = React.lazy(() => import('./pages/Interview/EnvironmentCheck'));
const RealMode = React.lazy(() => import('./pages/Interview/RealMode'));
const PracticeMode = React.lazy(() => import('./pages/Interview/PracticeMode'));
const InterviewReport = React.lazy(() => import('./pages/Interview/InterviewReport'));
const CategorySelectionPage = React.lazy(() => import('./pages/Interview/CategorySelectionPage'));
const DocumentSelectionPage = React.lazy(() => import('./pages/Interview/DocumentSelectionPage'));

const GuideFAQ = React.lazy(() => import('./pages/Support/GuideFAQ'));
const ContactUs = React.lazy(() => import('./pages/Support/ContactUs'));
const PrivacyPolicy = React.lazy(() => import('./pages/Support/PrivacyPolicy'));

const PeerDemo = React.lazy(() => import('./p2p/PeerDemo'));

const MyPortfolio = React.lazy(() => import('./pages/MyPage/MyPortfolio/MyPortfolio'));
const LikedPosts = React.lazy(() => import('./pages/MyPage/LikedPosts/LikedPosts'));
const MyStories = React.lazy(() => import('./pages/MyPage/MyStories/MyStories'));
const MyPageLayout = React.lazy(() => import('./components/Layout/MyPageLayout'));

const App: React.FC = () => {

  return (
    <>
      <ScrollToTop />
      <ScrollToTopButton />
      <Suspense fallback={<Loading />}>
      <Routes>
        {/* 모든 서비스 페이지의 공통 레이아웃 적용 */}
        <Route element={<MainLayout />}>
          
          {/* =========================================
              [Public Routes] 비로그인 접근 가능
          ========================================= */}
          <Route path="/" element={<Main />} />
          <Route path="/about" element={<AboutPage />} />

          {/* 커뮤니티 (목록/상세 조회) */}
          <Route path="/community" element={<CommunityList />} />
          <Route path="/community/:id" element={<CommunityDetail />} />

          {/* 통합 인증 라우트 */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/password-reset" element={<AuthPage />} />
          <Route path="/oauth/:provider/redirect" element={<SocialLoginCallback />} />

          {/* 학습 커뮤니티 도메인 */}
          <Route path="/study">
            <Route index element={<Navigate to="/study/category/all" replace />} />
            <Route path="category/:category" element={<StudyList />} />
            <Route path="post/:id" element={<StudyDetail />} />
          </Route>          

          {/* 고객지원(Support) 도메인 */}
          <Route path="/support">
            <Route path="guide" element={<GuideFAQ />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
          </Route>

          {/* P2P demo page (local testing) */}
          <Route path="/p2p" element={<PeerDemo />} />


          {/* =========================================
              [Protected Routes] 로그인 필수
          ========================================= */}
          <Route element={<ProtectedRoute />}>
            
            {/* 커뮤니티 (작성/수정) - 로그인 필요 */}
            <Route path="/community/create" element={<CreatePostPage />} />
            <Route path="/community/edit/:id" element={<EditPostPage />} />

            {/* 마이페이지 라우트 그룹 */}
            <Route path="/mypage" element={<MyPageLayout />}>
              <Route index element={<MyPage />} />
              <Route path="ai-log" element={<AiInterviewLog />} />
              <Route path="cs-log" element={<CsInterviewLog />} />
              <Route path="saved" element={<SavedProblems />} />
              <Route path="settings" element={<AccountSettings />} />
              <Route path="docs" element={<MyPortfolio />} />
              <Route path="likes" element={<LikedPosts />} />
              <Route path="stories" element={<MyStories />} />
            </Route>
          
            {/* 면접 시스템 도메인 */}
            <Route path="/interview">
              <Route index element={<Navigate to="/interview/check" replace />} />
              <Route path="check" element={<EnvironmentCheck />} />
              <Route path="select-category" element={<CategorySelectionPage />} />
              <Route path="select-document" element={<DocumentSelectionPage />} />
              <Route path="real" element={<RealMode />} />
              <Route path="practice" element={<PracticeMode />} />
              <Route path="report" element={<InterviewReport />} />
            </Route>
          </Route>

        </Route>
        
        {/* 없는 페이지는 메인으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      </Suspense>
    </>
  );
};

export default App;