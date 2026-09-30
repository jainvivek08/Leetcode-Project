import React from 'react';

function StatsDonut({ stats }) {
  const {
    totalSolved = 0,
    totalProblems = 0,
    attempting = 0,
    easy = { solved: 0, total: 0, beats: 0, progressPercent: 0 },
    medium = { solved: 0, total: 0, beats: 0, progressPercent: 0 },
    hard = { solved: 0, total: 0, beats: 0, progressPercent: 0 },
  } = stats || {};

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase tracking-wider">
          Solved Problems
        </h2>
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Easy
          </span>
          <span className="text-blue-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
            Med
          </span>
          <span className="text-rose-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
            Hard
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Donut SVG Circle */}
        <div className="md:col-span-5 flex items-center justify-center p-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
              {/* Gray Base Track */}
              <circle className="circle-bg" cx="22" cy="22" r="18" />

              {/* Only render colored arcs if problems are solved */}
              {easy.solved > 0 && (
                <circle
                  className="circle-easy"
                  cx="22"
                  cy="22"
                  r="18"
                  strokeDasharray={`${Math.max(easy.progressPercent, 2)} 100`}
                  strokeDashoffset="0"
                />
              )}
              {medium.solved > 0 && (
                <circle
                  className="circle-med"
                  cx="22"
                  cy="22"
                  r="18"
                  strokeDasharray={`${Math.max(medium.progressPercent, 2)} 100`}
                  strokeDashoffset="-34"
                />
              )}
              {hard.solved > 0 && (
                <circle
                  className="circle-hard"
                  cx="22"
                  cy="22"
                  r="18"
                  strokeDasharray={`${Math.max(hard.progressPercent, 2)} 100`}
                  strokeDashoffset="-54"
                />
              )}
            </svg>

            <div className="absolute text-center select-none">
              <span className="block text-3xl font-black text-slate-900 tracking-tight leading-none">
                {totalSolved}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase mt-1 block">
                / {totalProblems.toLocaleString()} Solved
              </span>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                {attempting} Attempting
              </span>
            </div>
          </div>
        </div>

        {/* Right: Breakdown Metric Cards */}
        <div className="md:col-span-7 space-y-2.5">
          {/* Easy Card */}
          <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3 border border-slate-200/80 transition">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-emerald-600">Easy</span>
              <span className="font-mono text-slate-700 font-bold">
                {easy.solved}{' '}
                <span className="text-slate-400 font-normal">/ {easy.total}</span>
              </span>
              <span className="text-[11px] text-slate-500 bg-slate-200/60 font-semibold px-2 py-0.5 rounded">
                Beats {easy.beats}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${easy.progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Medium Card */}
          <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3 border border-slate-200/80 transition">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-blue-600">Medium</span>
              <span className="font-mono text-slate-700 font-bold">
                {medium.solved}{' '}
                <span className="text-slate-400 font-normal">/ {medium.total}</span>
              </span>
              <span className="text-[11px] text-slate-500 bg-slate-200/60 font-semibold px-2 py-0.5 rounded">
                Beats {medium.beats}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${medium.progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Hard Card */}
          <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3 border border-slate-200/80 transition">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-rose-600">Hard</span>
              <span className="font-mono text-slate-700 font-bold">
                {hard.solved}{' '}
                <span className="text-slate-400 font-normal">/ {hard.total}</span>
              </span>
              <span className="text-[11px] text-slate-500 bg-slate-200/60 font-semibold px-2 py-0.5 rounded">
                Beats {hard.beats}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${hard.progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsDonut;
