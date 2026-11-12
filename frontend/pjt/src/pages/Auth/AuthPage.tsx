import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthForm } from '../../useAuthForm';
import AlertModal from '../../components/Common/AlertModal';
import LoginForm from '../../components/Auth/LoginForm';
import SignUpForm from '../../components/Auth/SignUpForm';
import PasswordResetForm from '../../components/Auth/PasswordResetForm';

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isLoginMode = location.pathname === '/login';
  const isResetMode = location.pathname === '/password-reset';

  const {
    values,
    errors,
    isLoading,
    apiError,
    resetStep,
    alertState,
    handleChange,
    handleSubmit,
    handlePasswordResetRequest,
    handlePasswordResetConfirm,
    handleSocialLogin,
    closeAlert,
  } = useAuthForm();

  const toggleMode = () => {
    if (isLoginMode) {
      navigate('/signup');
    } else {
      navigate('/login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const getTitle = () => {
    if (isResetMode) return 'RESET';
    return isLoginMode ? 'WELCOME' : 'JOIN US';
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-bg-main text-text-sub font-sans p-4 overflow-hidden">
        <motion.div 
          key={location.pathname}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-md p-8 space-y-6 card-standard"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 p-2 bg-bg-card rounded-full border border-border-main shadow-lg">
              <img src="/images/cat_mascot.png" alt="DADAP Mascot" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-text-main">
              {getTitle()}
            </h3>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            {isResetMode ? (
              <PasswordResetForm
                step={resetStep}
                values={values}
                errors={errors}
                isLoading={isLoading}
                apiError={apiError}
                onChange={handleChange}
                onRequestReset={handlePasswordResetRequest}
                onConfirmReset={handlePasswordResetConfirm}
                onBackToLogin={() => navigate('/login')}
              />
            ) : isLoginMode ? (
              <LoginForm
                values={values}
                errors={errors}
                isLoading={isLoading}
                apiError={apiError}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onToggleMode={toggleMode}
                onPasswordReset={() => navigate('/password-reset')}
                onSocialLogin={handleSocialLogin}
              />
            ) : (
              <SignUpForm
                values={values}
                errors={errors}
                isLoading={isLoading}
                apiError={apiError}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onToggleMode={toggleMode}
                onSocialLogin={handleSocialLogin}
              />
            )}
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active  {
          -webkit-box-shadow: 0 0 0 30px #18181b inset !important;
          -webkit-text-fill-color: #d4d4d8 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        description={alertState.description}
        type={alertState.type}
      />
    </>
  );
}
