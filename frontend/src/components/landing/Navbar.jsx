import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, ArrowRight } from 'lucide-react';
import { ProfileDropdown } from '../profile/ProfileDropdown';
import { logoutUser } from '../../authSlice';

/**
 * LandingNavbar Component
 * Clean, modern, dedicated top navigation bar specifically for the CodeQuest Landing Page.
 * - Clean brand logo & landing navigation links (Features, Problems, Testimonials, FAQ)
 * - Pure auth CTAs (Log In / Sign Up or User Avatar + Go to Problems)
 * - Strictly NO in-problem search bar or daily streak badge.
 */
function LandingNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* ============================================================ */}
        {/* LEFT: BRAND LOGO + LANDING NAV LINKS                        */}
        {/* ============================================================ */}
        <div className="flex items-center space-x-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              &lt;/&gt;
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Code<span className="text-[#2563eb]">Quest</span>
            </span>
          </Link>

          {/* Landing Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-slate-600">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="hover:text-blue-600 transition cursor-pointer"
            >
              Features
            </a>
            <Link
              to="/problems"
              className="hover:text-blue-600 transition cursor-pointer"
            >
              Problems
            </Link>
            <Link
              to="/explore"
              className="hover:text-blue-600 transition cursor-pointer"
            >
              Roadmaps
            </Link>
            <a
              href="#testimonials"
              onClick={(e) => scrollToSection(e, 'testimonials')}
              className="hover:text-blue-600 transition cursor-pointer"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="hover:text-blue-600 transition cursor-pointer"
            >
              FAQ
            </a>
          </nav>
        </div>

        {/* ============================================================ */}
        {/* RIGHT: AUTH BUTTONS / USER PROFILE (NO SEARCH, NO STREAK)   */}
        {/* ============================================================ */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/problems"
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                <span>Go to Problems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <ProfileDropdown
                user={user}
                onNavigate={(path) => navigate(path)}
                onSettings={() => navigate('/settings')}
                onAppearance={() => navigate('/settings?tab=appearance')}
                onLogout={handleLogout}
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 transition rounded-lg hover:bg-slate-100"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition cursor-pointer"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Features
            </a>
            <Link
              to="/problems"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 text-[#2563eb]"
            >
              Problems Arena
            </Link>
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700"
            >
              Learning Roadmaps
            </Link>
            <a
              href="#testimonials"
              onClick={(e) => scrollToSection(e, 'testimonials')}
              className="py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="py-2 px-3 rounded-lg hover:bg-slate-100"
            >
              FAQ
            </a>
          </nav>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-bold bg-[#2563eb] text-white rounded-xl shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default LandingNavbar;
