import React from 'react';
import { Link } from 'react-router';

function PreFooterCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#dbeafe] via-[#eff6ff] to-[#dbeafe] border-t border-blue-100 py-16">
      {/* Soft ambient glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Subtle floating badges */}
      <div className="absolute top-4 left-6 anim-gentle-c opacity-25 hover:opacity-60 transition-opacity hidden md:block pointer-events-none select-none">
        <span className="bg-white/75 border border-blue-200/70 text-blue-700 font-code text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs">
          #01 Two Sum Solved ✔
        </span>
      </div>
      <div className="absolute bottom-4 right-10 anim-gentle-a opacity-25 hover:opacity-60 transition-opacity hidden lg:block pointer-events-none select-none">
        <span className="bg-white/75 border border-blue-200/70 text-slate-600 font-code text-[11px] font-medium px-3 py-1 rounded-full shadow-xs">
          Time: O(log N) • Space: O(1)
        </span>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Start Your Coding Journey with CodeQuest
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Join millions mastering top languages, cracking real-world problems &amp; landing top software engineering roles.
          </p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-md transition cursor-pointer"
            >
              Level Up Your Skills now
            </Link>
          </div>
        </div>

        {/* Coder Graphic */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="relative bg-white border-4 border-blue-100 rounded-3xl p-6 shadow-xl flex flex-col items-center">
            <div className="text-7xl mb-2">🧑‍💻</div>
            <div className="bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              CodeQuest
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PreFooterCta;
