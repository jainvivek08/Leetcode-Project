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
  Trophy,
} from 'lucide-react';
import { ProfileDropdown } from './profile/ProfileDropdown';
import { logoutUser } from '../authSlice';

/**
 * Navbar Component
 * Standard LeetCode/CodeQuest layout:
 * - Brand: Orange gradient </> icon + CodeQuest title
 * - Nav links: Problems, Explore, Playground, Admin (Admin-only)
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

  // Sync streak count with authenticated user model
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.streakCount !== undefined) {
        setStreakCount(user.streakCount);
      }
    } else {
      setStreakCount(0);
    }
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
    <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100 shadow-2xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* ============================================================ */}
        {/* LEFT: BRAND LOGO + MAIN NAV LINKS                           */}
        {/* ============================================================ */}
        <div className="flex items-center space-x-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 flex items-center justify-center font-extrabold text-xs shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              &lt;/&gt;
            </div>
            <span className="font-extrabold text-lg tracking-tight text-zinc-100">
              Code<span className="text-amber-500">Quest</span>
            </span>
          </Link>

          {/* Standard Main Nav Links (Problems, Explore, Playground) */}
          <nav className="hidden md:flex items-center space-x-6 text-[13px]">
            {/* 1. Problems */}
            <Link
              to="/problems"
              className={`flex items-center gap-1.5 py-4.5 transition cursor-pointer ${
                currentPath === '/problems' || currentPath.startsWith('/problems/') || currentPath.startsWith('/problem/')
                  ? 'text-amber-400 font-extrabold border-b-2 border-amber-500'
                  : 'text-zinc-400 hover:text-zinc-100 font-semibold'
              }`}
            >
              <span>Problems</span>
            </Link>

            {/* 2. Explore / Roadmaps */}
            <Link
              to="/explore"
              className={`flex items-center gap-1.5 py-4.5 transition cursor-pointer ${
                currentPath === '/explore' || currentPath === '/roadmaps'
                  ? 'text-amber-400 font-extrabold border-b-2 border-amber-500'
                  : 'text-zinc-400 hover:text-zinc-100 font-semibold'
              }`}
            >
              <span>Explore</span>
            </Link>

            {/* 3. Playground / Online Compiler */}
            <Link
              to="/playground"
              className={`flex items-center gap-1.5 py-4.5 transition cursor-pointer ${
                currentPath === '/playground'
                  ? 'text-amber-400 font-extrabold border-b-2 border-amber-500'
                  : 'text-zinc-400 hover:text-zinc-100 font-semibold'
              }`}
            >
              <span>Playground</span>
            </Link>

            {/* Leaderboard Link */}
            <Link
              to="/leaderboard"
              className={`flex items-center gap-1.5 py-4.5 transition cursor-pointer ${
                currentPath === '/leaderboard'
                  ? 'text-amber-400 font-extrabold border-b-2 border-amber-500'
                  : 'text-zinc-400 hover:text-zinc-100 font-semibold'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Leaderboard</span>
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
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problems..."
                    className="pl-9 pr-12 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 w-44 lg:w-56 transition shadow-2xs"
                  />
                  <span className="absolute right-2.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700 px-1 py-0.5 rounded pointer-events-none">
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
                  (user?.streakCount ?? streakCount) > 0
                    ? `${user?.streakCount ?? streakCount} Day Problem Solving Streak`
                    : 'Solve a problem today to start your streak!'
                }
                className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs select-none"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-mono">{user?.streakCount ?? streakCount ?? 0}</span>
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
                className="text-zinc-400 hover:text-zinc-100 font-semibold text-sm px-2.5 py-1.5 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                state={{ from: location.pathname }}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 md:hidden transition cursor-pointer"
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
        <div className="md:hidden border-t border-zinc-800 bg-zinc-900/98 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150 text-zinc-100">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="pb-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </form>

          <Link
            to="/problems"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
              currentPath === '/problems'
                ? 'bg-amber-500/10 text-amber-400'
                : 'text-zinc-300 hover:bg-zinc-800'
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
                ? 'bg-amber-500/10 text-amber-400'
                : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </Link>

          <Link
            to="/playground"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
              currentPath === '/playground'
                ? 'bg-amber-500/10 text-amber-400'
                : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Playground</span>
          </Link>

          {/* Leaderboard Mobile Link */}
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
              currentPath === '/leaderboard'
                ? 'bg-amber-500/10 text-amber-400'
                : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Leaderboard</span>
          </Link>

          {!user && (
            <div className="pt-2 border-t border-zinc-800 flex items-center gap-2">
              <Link
                to="/login"
                state={{ from: currentPath }}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                state={{ from: currentPath }}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-lg shadow-sm transition"
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
