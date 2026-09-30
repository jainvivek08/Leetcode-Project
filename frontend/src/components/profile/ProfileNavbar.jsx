import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Flame, Bell } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

function ProfileNavbar({
  user,
  userInitial = 'V',
  streakCount = 0,
  onNotificationClick,
  onAppearance,
  onSettings,
  onLogout,
  onNavigate,
}) {
  const navigate = useNavigate();

  const handleNav = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* Brand & Primary Navigation (Pure DSA & Learning Focus - Zero Contest Mentions) */}
        <div className="flex items-center space-x-7">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              &lt;/&gt;
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Code<span className="text-blue-600">Quest</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-[13px] font-semibold text-slate-600">
            <Link to="/problems" className="hover:text-blue-600 transition">
              Problems
            </Link>
            <Link to="/explore" className="hover:text-blue-600 transition">
              Explore
            </Link>
            <Link to="/compiler" className="hover:text-blue-600 transition">
              Playground
            </Link>
          </nav>
        </div>

        {/* Right User Utilities */}
        <div className="flex items-center space-x-3.5">
          {/* Active Learning Streak */}
          <div
            title="Daily Problem Solving Streak"
            className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-xs font-bold shadow-2xs select-none"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="font-mono">{streakCount}</span>
          </div>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={onNotificationClick}
            title="Notifications"
            className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </button>

          {/* Profile Dropdown Menu */}
          <ProfileDropdown
            user={user || { name: 'User', avatarInitial: userInitial }}
            onNavigate={handleNav}
            onAppearance={onAppearance}
            onSettings={onSettings || (() => handleNav('/settings'))}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}

export default ProfileNavbar;
