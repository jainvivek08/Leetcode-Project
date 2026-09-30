import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Lock,
  X,
  LogIn,
  UserPlus,
  Play,
  Send,
  Sparkles,
  Flame,
  CheckCircle2,
  Code2,
  ArrowRight,
} from 'lucide-react';

/**
 * AuthPromptModal Component
 * LeetCode-style dark modal displayed when unauthenticated users attempt
 * protected actions (Run, Submit, or ChatAI Tutor) in the problem workspace.
 */
function AuthPromptModal({
  isOpen,
  onClose,
  title = 'Sign in to Run & Submit Code',
  subtitle = 'Create a free account or log in to compile solutions, test against edge cases, and save your practice streak.',
  redirectPath,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const targetFrom = redirectPath || location.pathname;

  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path, { state: { from: targetFrom } });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Container Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-zinc-100 animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Soft Ambient Background Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Brand Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Authentication Required
            </span>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 mt-1 leading-snug">
              {title}
            </h3>
          </div>
        </div>

        {/* Subtitle / Descriptive Copy */}
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-5">
          {subtitle}
        </p>

        {/* LeetCode-style Value Propositions / Perks */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 mb-6 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20 shrink-0" />
            <span>Run code in JavaScript, C++, or Java with live outputs</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <Send className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Submit against hidden automated test cases</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 shrink-0" />
            <span>Log daily streak, runtime percentiles &amp; rank</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Ask AI DSA tutor for step-by-step hints and complexity reviews</span>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="space-y-2.5">
          {/* 1. Log In Button */}
          <button
            type="button"
            onClick={() => handleNavigate('/login')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-900/30"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </button>

          {/* 2. Create Free Account Button */}
          <button
            type="button"
            onClick={() => handleNavigate('/signup')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-950/40"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Free Account</span>
          </button>

          {/* 3. Continue Reading (Close Modal) */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition underline underline-offset-4 cursor-pointer py-1"
            >
              Continue Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPromptModal;
