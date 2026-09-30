import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Flame,
  Menu,
  X,
  Layers,
  Compass,
  Terminal,
} from 'lucide-react';
import { ProfileDropdown } from './profile/ProfileDropdown';
import { logoutUser } from '../authSlice';
import axiosClient from '../utils/axiosClient';

/**
 * Navbar Component
 * Standard LeetCode/CodeQuest layout:
 * - Brand: Orange gradient </> icon + CodeQuest title
 * - Nav links: Problems, Explore, Playground (No redundant My Profile / Settings)
 * - Right: Global Search, Daily Streak Flame, ProfileDropdown
 */
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [streakCount, setStreakCount] = useState(0);

  // Dynamically compute streak count based on user solved problems
  useEffect(() => {
    let isMounted = true;
    const fetchStreak = async () => {
      if (isAuthenticated && user) {
        try {
          const { data } = await axiosClient.get('/problem/problemSolvedByUser');
          if (isMounted && Array.isArray(data)) {
            setStreakCount(data.length > 0 ? 1 : 0);
          }
        } catch {
          const solvedLen = user.problemSolved?.length || 0;
          if (isMounted) setStreakCount(solvedLen > 0 ? 1 : 0);
        }
      } else {
        if (isMounted) setStreakCount(0);
      }
    };

    fetchStreak();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/problems?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    } else {
      navigate('/problems');
    }
    setMobileMenuOpen(false);
  };

  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* ============================================================ */}
        {/* LEFT: BRAND LOGO + MAIN NAV LINKS                           */}
        {/* ============================================================ */}
        <div className="flex items-center space-x-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              &lt;/&gt;
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              Code<span className="text-[#2563eb] dark:text-blue-400">Quest</span>
            </span>
          </Link>

          {/* Standard Main Nav Links (Problems, Explore, Playground) */}
          <nav className="hidden md:flex items-center space-x-6 text-[13px]">
            {/* 1. Problems */}
            <Link
              to="/problems"
              className={`flex items-center gap-1.5 py-4.5 transition cursor-pointer ${
                currentPath === '/problems' || currentPath.startsWith('/problem/')
                  ? 'text-[#2563eb] dark:text-blue-400 font-extrabold border-b-2 border-[#2563eb] dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
              }`}
            >
              <span>Problems</span>
            </Link>

            {/* 2. Explore / Roadmaps */}
            <Link
              to="/explore"
              className={`flex items-center gap-1.5 py-4.5 transition cursor-pointer ${
                currentPath === '/explore' || currentPath === '/roadmaps'
                  ? 'text-[#2563eb] dark:text-blue-400 font-extrabold border-b-2 border-[#2563eb] dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
              }`}
            >
              <span>Explore</span>
            </Link>

            {/* 3. Playground / Online Compiler */}
            <Link
              to="/compiler"
              className={`flex items-center gap-1.5 py-4.5 transition cursor-pointer ${
                currentPath === '/compiler' || currentPath.startsWith('/solve/')
                  ? 'text-[#2563eb] dark:text-blue-400 font-extrabold border-b-2 border-[#2563eb] dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold'
              }`}
            >
              <span>Playground</span>
            </Link>
          </nav>
        </div>

        {/* ============================================================ */}
        {/* RIGHT: SEARCH + STREAK + USER AVATAR / PROFILE DROPDOWN     */}
        {/* ============================================================ */}
        <div className="flex items-center space-x-3.5">
          {/* 1. Global Search Box (Hidden on Landing Page) */}
          {location.pathname !== '/' && (
            <div className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problems..."
                    className="pl-9 pr-12 py-1.5 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-44 lg:w-56 transition shadow-2xs"
                  />
                  <span className="absolute right-2.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded pointer-events-none">
                    /
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* 2. AUTHENTICATED vs GUEST SECTION */}
          {user ? (
            <>
              {/* Daily Streak Flame Counter */}
              <div
                title={
                  (user.streak || streakCount) > 0
                    ? `${user.streak || streakCount} Day Problem Solving Streak`
                    : 'Solve a problem today to start your streak!'
                }
                className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs select-none"
              >
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span className="font-mono">{user.streak || streakCount || 0}</span>
              </div>

              {/* User Avatar Circle with ProfileDropdown */}
              <ProfileDropdown
                user={user}
                onNavigate={(path) => navigate(path)}
                onSettings={() => navigate('/settings')}
                onAppearance={() => navigate('/settings?tab=appearance')}
                onLogout={handleLogout}
              />
            </>
          ) : (
            <div className="flex items-center space-x-2.5">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-semibold text-sm px-2.5 py-1.5 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                state={{ from: location.pathname }}
                className="bg-[#2563eb] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm transition active:scale-95 cursor-pointer"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE EXPANDED MENU DRAWER                                  */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="pb-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </form>

          <Link
            to="/problems"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
              currentPath === '/problems'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Problems</span>
          </Link>

          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
              currentPath === '/explore' || currentPath === '/roadmaps'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </Link>

          <Link
            to="/compiler"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
              currentPath === '/compiler'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Playground</span>
          </Link>

          {!user && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Link
                to="/login"
                state={{ from: currentPath }}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                state={{ from: currentPath }}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold bg-[#2563eb] text-white rounded-lg shadow-sm hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
