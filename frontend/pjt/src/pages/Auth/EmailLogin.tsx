import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Header/Logo';
import { authService } from '../../api/services/authService';
import { useDispatch } from 'react-redux';
import { setLoginSuccess } from '../../redux/slices/authSlice';

const EmailLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const response = await authService.login({
        email: formData.id, 
        password: formData.password
      });

      // axiosInstance 인터셉터에 의해 response.data가 실제 데이터임
      if (response && response.data) {
        const { accessToken, userId, nickname, email, profileImageUrl } = response.data;

        // 통합된 authSlice의 setLoginSuccess 하나만 디스패치
        dispatch(setLoginSuccess({
          accessToken,
          refreshToken: '', 
          userId: userId.toString(),
          nickname,
          email,
          profileImage: profileImageUrl
        }));

        // 로컬 스토리지 저장 (새로고침 시 authSlice의 Hydration 로직에서 사용)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userInfo', JSON.stringify({
          userId,
          nickname,
          email,
          profileImageUrl
        }));
        
        navigate('/');
      } else {
        setErrorMsg(response.message || '로그인에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('로그인 에러:', err);
      const message = err.response?.data?.message || '아이디 또는 비밀번호를 확인해주세요.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-[#050505] text-white font-sans overflow-hidden p-6">
      {/* 배경 장식
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" /> */}
      {/* 헤더 섹션 */}
      <div className="relative z-10 flex flex-col items-center mb-12">
        <div className="mb-6 scale-125">
          <Logo />
        </div>
        <h2 className="text-xl font-black tracking-widest text-zinc-100 uppercase border-b border-indigo-500/50 pb-2">
          Email Login
        </h2>
        {errorMsg && (
          <p className="mt-4 text-red-500 text-xs font-bold animate-bounce">{errorMsg}</p>
        )}
      </div>

      {/* 입력 폼 섹션 */}
      <form 
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[420px] flex flex-col gap-8"
      >
        <div className="group">
          <label className="block text-[10px] font-black text-zinc-500 mb-1 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">ID / Email</label>
          <input 
            type="text" 
            required
            disabled={isLoading}
            className="w-full bg-white/5 border-b border-white/10 py-4 px-4 text-lg font-bold text-white outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder-white/5 rounded-t-md"
            placeholder="아이디 또는 이메일"
            onChange={(e) => handleInputChange('id', e.target.value)}
          />
        </div>

        <div className="group">
          <div className="flex justify-between items-end mb-1">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">Password</label>
            <button 
              type="button"
              disabled={isLoading}
              onClick={() => navigate('/password-reset')}
              className="text-[10px] font-bold text-zinc-600 hover:text-zinc-400 transition-colors tracking-tighter"
            >
              FORGOT PASSWORD?
            </button>
          </div>
          <input 
            type="password" 
            required
            disabled={isLoading}
            className="w-full bg-white/5 border-b border-white/10 py-4 px-4 text-lg font-bold text-white outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder-white/5 rounded-t-md"
            placeholder="비밀번호"
            onChange={(e) => handleInputChange('password', e.target.value)}
          />
        </div>

        {/* 로그인 버튼 (그라데이션 스타일) */}
        <button 
          type="submit"
          disabled={isLoading}
          className="relative w-full p-[1px] rounded-xl bg-gradient-to-r from-[#D300C5] via-[#7B42F6] to-[#0097FF] mt-4 group overflow-hidden shadow-[0_0_30px_rgba(123,66,246,0.3)] transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <div className="w-full h-full bg-[#050505] rounded-xl py-4 flex items-center justify-center group-hover:bg-transparent transition-all duration-300">
            <span className="text-white font-black tracking-widest text-lg uppercase">
              {isLoading ? 'Processing...' : 'Sign In'}
            </span>
          </div>
        </button>
      </form>

      {/* 하단 네비게이션 */}
      <div className="relative z-10 mt-12 flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-zinc-500">
          계정이 없으신가요? 
          <button 
            onClick={() => navigate('/signup')} 
            className="text-white font-bold ml-2 border-b border-white/30 hover:border-white transition-all pb-0.5"
          >
            가입하기
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailLogin;