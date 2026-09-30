import React from 'react';
import { Link } from 'react-router';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

/**
 * Footer Component
 * Dark navy/slate theme footer for CodeQuest developer platform.
 * Clean 4-column layout strictly linking to existing routes and features.
 */
function Footer() {
  return (
    <footer className="bg-[#0a0f1d] text-slate-400 pt-16 pb-12 border-t border-slate-800 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* ============================================================ */}
          {/* COLUMN 1: BRAND & IDENTITY                                  */}
          {/* ============================================================ */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                &lt;/&gt;
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Code<span className="text-[#2563eb]">Quest</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pr-2">
              A modern developer practice platform. Master data structures and algorithms with interactive workspaces and AI guidance.
            </p>

            <div className="pt-1">
              <a
                href="mailto:support@codequest.dev"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@codequest.dev</span>
              </a>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center justify-center shadow-xs"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center justify-center shadow-xs"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center justify-center shadow-xs"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLUMN 2: PRACTICE (CORE ROUTES)                            */}
          {/* ============================================================ */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Practice
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/problems" className="hover:text-white transition">
                  All Problems
                </Link>
              </li>
              <li>
                <Link to="/problems" className="hover:text-white transition">
                  Data Structures
                </Link>
              </li>
              <li>
                <Link to="/problems" className="hover:text-white transition">
                  Algorithms
                </Link>
              </li>
              <li>
                <Link to="/problems" className="hover:text-white transition">
                  Top Interview Curated
                </Link>
              </li>
            </ul>
          </div>

          {/* ============================================================ */}
          {/* COLUMN 3: PLATFORM FEATURES                                 */}
          {/* ============================================================ */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Platform Features
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/explore" className="hover:text-white transition">
                  Learning Roadmaps
                </Link>
              </li>
              <li>
                <Link to="/compiler" className="hover:text-white transition">
                  Online Playground
                </Link>
              </li>
              <li>
                <Link to="/problems" className="hover:text-white transition">
                  AI DSA Tutor
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  User Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* ============================================================ */}
          {/* COLUMN 4: ACCOUNT & SUPPORT                                 */}
          {/* ============================================================ */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Account &amp; Support
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/settings" className="hover:text-white transition">
                  Account Settings
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@codequest.dev"
                  className="hover:text-white transition"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM COPYRIGHT BAR                                         */}
        {/* ============================================================ */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CodeQuest. Crafted for developers with pure practice in mind.</p>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
