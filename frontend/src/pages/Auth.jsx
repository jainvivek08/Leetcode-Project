import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearError } from '../authSlice';
import { getApiErrorMessage } from '../utils/axiosClient';
import AuthNavbar from '../components/auth/AuthNavbar';
import AuthFooter from '../components/auth/AuthFooter';
import AuthBackground from '../components/auth/AuthBackground';

function Auth({ defaultMode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, loading: reduxLoading, error: reduxError } = useSelector(
    (state) => state.auth
  );

  // Determine current active mode
  const initialMode = defaultMode || (location.pathname === '/signup' ? 'signup' : 'signin');
  const [mode, setMode] = useState(initialMode);

  // Form input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Captcha simulation states
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(true);
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState(false);

  // Local submit loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    icon: '✔',
  });

  // Redirect to target workspace (or problems arena) if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from || '/problems';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Sync mode with route if route changes
  useEffect(() => {
    if (defaultMode) {
      setMode(defaultMode);
    } else if (location.pathname === '/signup') {
      setMode('signup');
    } else if (location.pathname === '/login') {
      setMode('signin');
    }
    setValidationError('');
  }, [location.pathname, defaultMode]);

  // Mode switcher handler (updates mode & URL without reloading)
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setValidationError('');
    dispatch(clearError());
    if (newMode === 'signup' && location.pathname !== '/signup') {
      navigate('/signup', { replace: true, state: location.state });
    } else if (newMode === 'signin' && location.pathname !== '/login') {
      navigate('/login', { replace: true, state: location.state });
    }
  };

  // Toast helper
  const triggerToast = (msg, icon = '✔') => {
    setToast({ show: true, message: msg, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2600);
  };

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Toggle Cloudflare Turnstile Captcha
  const handleCaptchaToggle = () => {
    if (isVerifyingCaptcha) return;

    if (isCaptchaVerified) {
      setIsCaptchaVerified(false);
      setIsVerifyingCaptcha(true);

      setTimeout(() => {
        setIsVerifyingCaptcha(false);
        setIsCaptchaVerified(true);
        triggerToast('Cloudflare Turnstile Verified', '🛡️');
      }, 700);
    } else {
      setIsVerifyingCaptcha(true);
      setTimeout(() => {
        setIsVerifyingCaptcha(false);
        setIsCaptchaVerified(true);
        triggerToast('Cloudflare Turnstile Verified', '🛡️');
      }, 700);
    }
  };

  // Form Submit handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!isCaptchaVerified) {
      triggerToast('Please complete the Cloudflare verification', '⚠️');
      return;
    }

    if (mode === 'signup' && fullName.trim().length < 3) {
      setValidationError('Full Name must be at least 3 characters.');
      return;
    }

    if (!email || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    dispatch(clearError());

    try {
      if (mode === 'signin') {
        const result = await dispatch(loginUser({ emailId: email.trim().toLowerCase(), password }));
        if (loginUser.fulfilled.match(result)) {
          triggerToast('Signed in successfully!', '🎉');
          const destination = location.state?.from || '/problems';
          navigate(destination, { replace: true });
        } else {
          const errMsg = typeof result.payload === 'string' ? result.payload : getApiErrorMessage(result.payload || result.error || 'Login failed');
          setValidationError(errMsg);
          setIsSubmitting(false);
        }
      } else {
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Whitelist: send only firstName, lastName, emailId, password
        const result = await dispatch(
          registerUser({
            firstName,
            lastName,
            emailId: email.trim().toLowerCase(),
            password,
          })
        );
        if (registerUser.fulfilled.match(result)) {
          triggerToast('Account created successfully!', '🎉');
          const destination = location.state?.from || '/problems';
          navigate(destination, { replace: true });
        } else {
          const errMsg = typeof result.payload === 'string' ? result.payload : getApiErrorMessage(result.payload || result.error || 'Registration failed');
          setValidationError(errMsg);
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      setValidationError(getApiErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  // Quick Demo Account Auto-Fill
  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setValidationError('');
    triggerToast(`Demo credentials applied (${demoEmail})`, '🔑');
  };

  // Social Login handler
  const handleSocialLogin = (provider) => {
    triggerToast(`Connecting with ${provider}...`, '🔄');
  };

  const isLoading = isSubmitting || reduxLoading;

  return (
    <div className="bg-grid-blueprint min-h-screen flex flex-col justify-between antialiased overflow-x-hidden relative selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Background with Ambient Glow & Floating DSA Snippets */}
      <AuthBackground />

      {/* 1. CLEAN TOP NAVBAR */}
      <AuthNavbar />

      {/* 2. COMPACT ELEVATED AUTH CARD */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-20">
        <div className="w-full max-w-[380px] bg-white rounded-2xl border border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(30,58,138,0.18),0_10px_20px_-5px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 p-6 sm:p-7 relative transition-all">
          {/* Brand Icon Header */}
          <div className="flex flex-col items-center text-center mb-4">
            <Link to="/" className="group flex flex-col items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-sm mb-2 group-hover:scale-105 transition-transform">
                &lt;/&gt;
              </div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Code<span className="text-[#2563eb]">Quest</span>
              </h2>
            </Link>
            <p className="text-[12px] text-slate-500 mt-0.5 font-medium">
              {mode === 'signin'
                ? 'Log in to track problems & continue learning'
                : 'Create your account and start practicing'}
            </p>
          </div>

          {/* Mode Switcher Pill (Sign In / Sign Up) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => handleModeChange('signin')}
              className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-[#2563eb] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('signup')}
              className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#2563eb] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Validation or Redux Error Alerts */}
          {(validationError || reduxError) && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2 rounded-xl mb-3 flex items-center gap-2">
              <span className="shrink-0 text-sm">⚠️</span>
              <span className="leading-tight">{validationError || reduxError}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {/* Full Name (Only on Sign Up) */}
            {mode === 'signup' && (
              <div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="custom-input w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 transition"
                />
              </div>
            )}

            {/* Username or Email */}
            <div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username or E-mail"
                className="custom-input w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 transition"
              />
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 8 chars)"
                className="custom-input w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 pr-10 transition"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Interactive Cloudflare Turnstile Verification Box */}
            <div
              onClick={handleCaptchaToggle}
              className="border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer rounded-xl p-2.5 flex items-center justify-between select-none transition"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    isCaptchaVerified
                      ? 'bg-emerald-500'
                      : 'border-2 border-slate-300 bg-white'
                  }`}
                >
                  {isVerifyingCaptcha ? (
                    <div className="w-3 h-3 border-2 border-slate-400 border-t-blue-600 rounded-full turnstile-spin"></div>
                  ) : isCaptchaVerified ? (
                    <svg
                      className="w-3.5 h-3.5 text-white stroke-[3]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isVerifyingCaptcha
                      ? 'text-slate-500'
                      : isCaptchaVerified
                      ? 'text-slate-700'
                      : 'text-slate-500'
                  }`}
                >
                  {isVerifyingCaptcha
                    ? 'Verifying...'
                    : isCaptchaVerified
                    ? 'Success!'
                    : 'Verify you are human'}
                </span>
              </div>

              {/* Cloudflare Branding */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-3 text-[#f38020]" viewBox="0 0 120 70" fill="currentColor">
                    <path d="M96.7 35.8c-.8-8.2-7.8-14.6-16.2-14.6-4.6 0-8.8 1.9-11.7 5.1-3.6-7.8-11.6-13.3-20.9-13.3-11.9 0-21.7 8.9-23.2 20.6C10.7 34.6 0 45 0 57.7 0 71.3 11 82.3 24.6 82.3h71.8C108.5 82.3 118 72.8 118 61c0-11-8.2-20.1-18.9-20.9-1-1.5-1.5-3.3-2.4-4.3z" />
                  </svg>
                  <span className="text-[9px] font-bold tracking-tight text-slate-700 uppercase font-mono">
                    Cloudflare
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 space-x-1">
                  <a
                    href="#terms"
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline hover:text-slate-600"
                  >
                    Privacy
                  </a>
                  <span>•</span>
                  <a
                    href="#help"
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline hover:text-slate-600"
                  >
                    Help
                  </a>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] disabled:opacity-75 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-blue-500/15 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isLoading
                  ? mode === 'signin'
                    ? 'Signing In...'
                    : 'Creating Account...'
                  : mode === 'signin'
                  ? 'Sign In'
                  : 'Create Account'}
              </span>
              {isLoading && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full turnstile-spin"></div>
              )}
            </button>
          </form>

          {/* Terms Disclaimer */}
          <p className="text-center text-[11px] text-slate-500 mt-2.5 leading-tight">
            By continuing, you agree to CodeQuest&apos;s{' '}
            <a href="#terms" className="text-[#2563eb] font-medium hover:underline">
              Terms
            </a>{' '}
            &amp;{' '}
            <a href="#privacy" className="text-[#2563eb] font-medium hover:underline">
              Privacy Policy
            </a>
            .
          </p>

          {/* Forgot Password & Alternate Mode Switch */}
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() =>
                triggerToast(
                  'Password reset via email is coming soon! Please contact your administrator to reset credentials.',
                  'ℹ️'
                )
              }
              title="Password reset via administrator"
              className="text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Forgot Password?
            </button>
            <button
              type="button"
              onClick={() => handleModeChange(mode === 'signin' ? 'signup' : 'signin')}
              className="font-bold text-[#2563eb] hover:underline transition cursor-pointer"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Quick Demo Login Credentials Buttons */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] text-center text-slate-400 mb-1.5 font-medium">
              Quick Demo Accounts
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-1 px-2 border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-white text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                onClick={() => handleQuickDemo('admin@leetcode.com', 'Admin@1234')}
              >
                👑 Admin Demo
              </button>
              <button
                type="button"
                className="flex-1 py-1 px-2 border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-white text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                onClick={() => handleQuickDemo('swastik@leetcode.com', 'User@1234')}
              >
                👤 User Demo
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white px-2 text-slate-400">or you can sign in with</span>
            </div>
          </div>

          {/* Compact Social OAuth Icons (Google, GitHub, Apple, LinkedIn) */}
          <div className="flex items-center justify-center gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              title="Sign in with Google"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center shadow-xs transition hover:scale-105 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleSocialLogin('GitHub')}
              title="Sign in with GitHub"
              className="w-8 h-8 rounded-full border border-slate-200 bg-[#181717] hover:bg-black text-white flex items-center justify-center shadow-xs transition hover:scale-105 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              title="Sign in with Apple"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center shadow-xs transition hover:scale-105 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12.01-14.43-5.35-8.22-9.55-17.78-12.6-28.67-3.05-10.89-4.58-21.2-4.58-30.93 0-14.77 3.73-26.65 11.19-35.63 7.46-8.98 16.71-13.54 27.75-13.68 4.7 0 9.94 1.18 15.71 3.53 5.77 2.35 9.77 3.59 12 3.71 1.77-.12 6.07-1.47 12.91-4.05 6.84-2.58 12.44-3.66 16.8-3.24 12.45 1.06 22.42 5.86 29.93 14.4-10.89 6.53-16.24 15.53-16.05 27.01.19 8.97 3.63 16.59 10.32 22.86 6.69 6.27 14.77 10.05 24.23 11.34-2.23 6.94-4.87 13.73-7.92 20.37zM119.22 31.81c0-7.25 2.63-14.07 7.89-20.46 5.26-6.39 11.75-10.42 19.47-12.09.23 1.18.35 2.12.35 2.82 0 7.29-2.73 14.28-8.19 20.97-5.46 6.69-12.07 10.74-19.82 12.15.06-1.18.3-2.31.3-3.39z" />
              </svg>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleSocialLogin('LinkedIn')}
              title="Sign in with LinkedIn"
              className="w-8 h-8 rounded-lg bg-[#0077b5] hover:bg-[#006097] text-white flex items-center justify-center shadow-xs transition hover:scale-105 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* 3. COMPACT FOOTER */}
      <AuthFooter />

      {/* 4. TOAST NOTIFICATION */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-white border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center space-x-2.5 transform transition-all duration-300 ${
          toast.show
            ? 'translate-y-0 opacity-100'
            : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <span className="text-emerald-500 font-bold text-sm">{toast.icon}</span>
        <span className="font-semibold">{toast.message}</span>
      </div>
    </div>
  );
}

export default Auth;
