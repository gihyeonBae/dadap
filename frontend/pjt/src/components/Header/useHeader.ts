import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from '../../redux/slices/authSlice';
import type { RootState } from '../../redux/store';

export const useHeader = (setIsOpen?: (val: boolean) => void) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(setLogout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    if (setIsOpen) setIsOpen(false);
    navigate('/', { replace: true });
  };

  const handleNav = (path: string, category?: string) => {
    const fullPath = category ? `${path}/category/${category.toLowerCase()}` : path;
    navigate(fullPath);
    if (setIsOpen) setIsOpen(false);
    window.scrollTo(0, 0);
  };

  return {
    ...auth,
    navigate,
    handleLogout,
    handleNav
  };
};
