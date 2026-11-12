import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import type { RootState } from '../../redux/store';

const ProtectedRoute: React.FC = () => {
  // 서버의 최신 변경 사항인 'isLoggedIn'을 사용합니다.
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  // 로그인 상태면 통과(Outlet), 아니면 로그인 페이지로 이동
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;