import React from 'react';
import { Link } from 'react-router';

function AuthNavbar() {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              &lt;/&gt;
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Code<span className="text-[#2563eb]">Quest</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-5 text-xs font-semibold text-slate-600">
            <Link to="/problems" className="hover:text-[#2563eb] transition">Roadmaps</Link>
            <Link to="/problems" className="hover:text-[#2563eb] transition">Practice</Link>
            <Link to="/problems" className="hover:text-[#2563eb] transition">Compiler</Link>
            <Link to="/problems" className="hover:text-[#2563eb] transition">Discuss</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
          >
            <span>&larr;</span> Back to Home
          </Link>
        </div>
      </div>
    </header>
  );
}

export default AuthNavbar;
