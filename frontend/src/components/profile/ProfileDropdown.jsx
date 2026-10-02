import React, { useState, useRef, useEffect } from 'react';
import { User, Palette, Settings, LogOut, Sun, Moon, Shield, PlusCircle, Sliders } from 'lucide-react';
import { useTheme } from '../../utils/theme';

/**
 * ProfileDropdown Component
 * Clean, accessible User Profile Dropdown Menu in React & Tailwind CSS
 * Following CodeQuest's architectural blueprint theme with Light & Dark mode support.
 *
 * Menu Items:
 * 1. My Profile (User icon -> /profile)
 * 2. Appearance (Palette icon -> Quick Dark/Light Switcher & /settings?tab=appearance)
 * 3. Settings (Settings icon -> /settings)
 * 4. Logout (LogOut icon -> sign out)
 *
 * @param {Object} props
 * @param {Object} [props.user]
 * @param {Function} [props.onNavigate]
 * @param {Function} [props.onAppearance]
 * @param {Function} [props.onSettings]
 * @param {Function} [props.onLogout]
 * @param {string} [props.className]
 */
export function ProfileDropdown({
  user,
  onNavigate,
  onAppearance,
  onSettings,
  onLogout,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isDark, setTheme } = useTheme();

  // Derived user identity with clean fallbacks
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    'Vivek Jain';

  const username =
    user?.username ||
    (user?.emailId
      ? user.emailId.split('@')[0]
      : user?.email
      ? user.email.split('@')[0]
      : 'vivekjain_dev');

  const avatarInitial = (
    user?.avatarInitial ||
    user?.firstName?.[0] ||
    user?.name?.[0] ||
    displayName?.[0] ||
    'V'
  ).toUpperCase();

  const avatarUrl = user?.avatar || '';

  // 1. Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 2. Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = (callback) => {
    if (callback) callback();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button: Circular Avatar */}
      <button
        type="button"
        id="profile-menu-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User profile options menu"
        className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-800 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-500/20 hover:ring-blue-500 hover:scale-105 active:scale-95 shadow-xs transition-all duration-150 cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{avatarInitial}</span>
        )}
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="profile-menu-button"
          className="absolute right-0 mt-2 w-64 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/60 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* 1. Header (User Identity) */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight truncate">
              {displayName}
            </p>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
              @{username}
            </p>
          </div>

          {/* 2. Core Navigation Items */}
          <div className="py-1 space-y-0.5">
            {/* My Profile */}
            <button
              type="button"
              role="menuitem"
              onClick={() =>
                handleAction(() => {
                  if (onNavigate) onNavigate('/profile');
                  else window.location.assign('/profile');
                })
              }
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl hover:bg-blue-50/80 dark:hover:bg-slate-800/80 hover:text-[#2563eb] dark:hover:text-blue-400 transition cursor-pointer text-left group"
            >
              <User className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] dark:group-hover:text-blue-400 transition-colors shrink-0" />
              <span>My Profile</span>
            </button>

            {/* Appearance (Theme Quick Switcher) */}
            <div className="px-3.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleAction(() => {
                      if (onAppearance) {
                        onAppearance();
                      } else if (onNavigate) {
                        onNavigate('/settings?tab=appearance');
                      } else {
                        window.location.assign('/settings?tab=appearance');
                      }
                    })
                  }
                  className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#2563eb] dark:hover:text-blue-400 transition cursor-pointer text-left flex-1 group"
                >
                  <Palette className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] dark:group-hover:text-blue-400 transition-colors shrink-0" />
                  <span>Appearance</span>
                </button>

                {/* Dark / Light Pill Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme('light');
                    }}
                    title="Light Theme"
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      !isDark
                        ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme('dark');
                    }}
                    title="Dark Theme"
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      isDark
                        ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Moon className="w-3 h-3 text-blue-200" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Settings */}
            <button
              type="button"
              role="menuitem"
              onClick={() =>
                handleAction(() => {
                  if (onSettings) {
                    onSettings();
                  } else if (onNavigate) {
                    onNavigate('/settings');
                  } else {
                    window.location.assign('/settings');
                  }
                })
              }
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl hover:bg-blue-50/80 dark:hover:bg-slate-800/80 hover:text-[#2563eb] dark:hover:text-blue-400 transition cursor-pointer text-left group"
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] dark:group-hover:text-blue-400 transition-colors shrink-0" />
              <span>Settings</span>
            </button>

            {/* Admin Controls (Visible only to admin users) */}
            {user?.role === 'admin' && (
              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    handleAction(() => {
                      if (onNavigate) onNavigate('/admin/create');
                      else window.location.assign('/admin/create');
                    })
                  }
                  className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl hover:bg-blue-50/80 dark:hover:bg-slate-800/80 hover:text-[#2563eb] dark:hover:text-blue-400 transition cursor-pointer text-left group"
                >
                  <PlusCircle className="w-4 h-4 text-blue-500 group-hover:scale-105 transition-transform shrink-0" />
                  <span>Create Problem</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    handleAction(() => {
                      if (onNavigate) onNavigate('/admin/update');
                      else window.location.assign('/admin/update');
                    })
                  }
                  className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl hover:bg-blue-50/80 dark:hover:bg-slate-800/80 hover:text-[#2563eb] dark:hover:text-blue-400 transition cursor-pointer text-left group"
                >
                  <Sliders className="w-4 h-4 text-emerald-500 group-hover:scale-105 transition-transform shrink-0" />
                  <span>Manage Problems</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Footer Action */}
          <div className="pt-1 mt-0.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(onLogout)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer text-left group"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
