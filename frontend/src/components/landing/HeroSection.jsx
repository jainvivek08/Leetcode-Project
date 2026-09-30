import React from 'react';
import { Link } from 'react-router';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import ProblemArenaPreview from './ProblemArenaPreview';
import HeroFloatingAnimations from './HeroFloatingAnimations';

/**
 * HeroSection Component
 * Modern, clean, and high-impact hero banner with light blueprint aesthetic for CodeQuest.
 */
function HeroSection() {
  return (
    <section
      className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 overflow-hidden bg-[#fbfcff]"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(59, 130, 246, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      {/* Dynamic Floating Code Animations & Soft Ambient Backlight */}
      <HeroFloatingAnimations />

      {/* Center ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-blue-400/15 via-sky-300/15 to-indigo-400/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* 1. Top Announcement / Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-600 text-xs md:text-sm font-bold tracking-wide shadow-xs mb-6 hover:bg-blue-100/70 transition-colors">
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>A Better Way to Practice Coding</span>
        </div>

        {/* 2. Main Headline (H1) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#1d4ed8] tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Bored of Theory? Let&apos;s Code for{' '}
          <span className="bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#1e40af] bg-clip-text text-transparent">
            Real.
          </span>
        </h1>

        {/* 3. Sub-headline / Supporting Copy */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          Solve problems, improve your algorithms, and become a more confident developer. Join 5M+ students building projects, mastering algorithms, and landing internships. No boring lectures, just real practice!
        </p>

        {/* 4. Call-To-Action (CTA) Button Group */}
        <div className="mt-8 flex items-center justify-center">
          <Link
            to="/problems"
            className="inline-flex items-center gap-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3.5 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-blue-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
          >
            <span>Start Practicing Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 5. Trust Metrics / Social Proof Strip (Bottom) */}
        <div className="mt-10 pt-6 border-t border-slate-200/70 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>2,500+ Curated Problems</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Free &amp; Open</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>AI-Powered DSA Tutor</span>
          </div>
        </div>

        {/* 6. Interactive Dual-Pane Problem Arena Preview */}
        <div className="mt-12">
          <ProblemArenaPreview />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
