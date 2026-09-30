import React from 'react';

/**
 * HeroFloatingAnimations Component
 * Subtle, delicate floating DSA code cards and metric badges
 * mirroring the login/signup page animations for CodeQuest landing hero,
 * styled with soft opacity and non-intrusive micro-animations.
 */
function HeroFloatingAnimations() {
  return (
    <>
      {/* 1. Soft Ambient Radial Backlights */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
        <div className="absolute top-16 left-4 lg:left-12 w-80 h-80 bg-gradient-to-tr from-blue-200/20 via-sky-100/15 to-indigo-100/20 rounded-full blur-3xl" />
        <div className="absolute top-28 right-4 lg:right-12 w-80 h-80 bg-gradient-to-bl from-sky-200/20 via-blue-100/15 to-indigo-100/20 rounded-full blur-3xl" />
        <div className="absolute top-[480px] left-1/4 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-indigo-200/10 rounded-full blur-3xl" />
      </div>

      {/* 2. Gentle Floating DSA Code Snippets (Subtle, Light & Non-distracting) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
        {/* Top-Left: #01 Two Sum */}
        <div className="absolute top-10 left-3 xl:left-8 2xl:left-16 anim-gentle-a opacity-25 hover:opacity-75 transition-opacity duration-300 hidden lg:block pointer-events-auto">
          <div className="bg-white/60 backdrop-blur-[2px] border border-slate-200/60 shadow-xs rounded-xl p-3 w-60 text-[11px] font-code text-left">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100/80 font-sans">
              <span className="text-emerald-600 font-semibold bg-emerald-50/70 px-1.5 py-0.5 rounded text-[10px]">
                #01 Two Sum
              </span>
              <span className="text-slate-400 text-[10px]">Hash Map O(N)</span>
            </div>
            <p className="text-slate-400 font-sans text-[10px] leading-tight mb-1">
              nums = [2,7,11,15], target = 9
            </p>
            <p className="text-slate-500 font-medium">
              <span className="text-purple-500">int</span> diff = target - nums[i];
            </p>
            <p className="text-slate-500">
              <span className="text-blue-500">if</span> (mp.count(diff)){' '}
              <span className="text-purple-500">return</span> &#123;mp[diff], i&#125;;
            </p>
          </div>
        </div>

        {/* Top-Right: #20 Valid Parentheses */}
        <div className="absolute top-12 right-3 xl:right-8 2xl:right-16 anim-gentle-b opacity-25 hover:opacity-75 transition-opacity duration-300 hidden lg:block pointer-events-auto">
          <div className="bg-white/60 backdrop-blur-[2px] border border-slate-200/60 shadow-xs rounded-xl p-3 w-56 text-[11px] font-code text-left">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100/80 font-sans">
              <span className="text-emerald-600 font-semibold bg-emerald-50/70 px-1.5 py-0.5 rounded text-[10px]">
                #20 Valid Parentheses
              </span>
              <span className="text-blue-500 text-[10px] bg-blue-50/70 px-1.5 py-0.5 rounded">
                Stack
              </span>
            </div>
            <p className="text-slate-500">
              <span className="text-blue-500">if</span> (c =={' '}
              <span className="text-amber-500">&apos;(&apos;</span>) st.push(
              <span className="text-amber-500">&apos;)&apos;</span>);
            </p>
            <p className="text-slate-500">
              <span className="text-blue-500">else if</span> (st.empty() || st.top() != c)
            </p>
            <p className="text-purple-500 pl-3">return false;</p>
          </div>
        </div>

        {/* Mid-Left: #704 Binary Search */}
        <div className="absolute top-[280px] left-2 xl:left-6 2xl:left-14 anim-gentle-c opacity-20 hover:opacity-70 transition-opacity duration-300 hidden xl:block pointer-events-auto">
          <div className="bg-white/60 backdrop-blur-[2px] border border-slate-200/60 shadow-xs rounded-xl p-3 w-60 text-[11px] font-code text-left">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100/80 font-sans">
              <span className="text-emerald-600 font-semibold bg-emerald-50/70 px-1.5 py-0.5 rounded text-[10px]">
                #704 Binary Search
              </span>
              <span className="text-purple-500 text-[10px] bg-purple-50/70 px-1.5 py-0.5 rounded">
                O(log N)
              </span>
            </div>
            <p className="text-slate-500">
              <span className="text-purple-500">int</span> mid = low + (high - low)/2;
            </p>
            <p className="text-slate-500">
              <span className="text-blue-500">if</span> (nums[mid] == target){' '}
              <span className="text-purple-500">return</span> mid;
            </p>
            <p className="text-slate-500">
              <span className="text-blue-500">else if</span> (nums[mid] &lt; target) low = mid + 1;
            </p>
          </div>
        </div>

        {/* Mid-Right: #226 Invert Tree */}
        <div className="absolute top-[300px] right-2 xl:right-6 2xl:right-14 anim-gentle-d opacity-20 hover:opacity-70 transition-opacity duration-300 hidden xl:block pointer-events-auto">
          <div className="bg-white/60 backdrop-blur-[2px] border border-slate-200/60 shadow-xs rounded-xl p-3 w-52 text-[11px] font-code text-left">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100/80 font-sans">
              <span className="text-emerald-600 font-semibold bg-emerald-50/70 px-1.5 py-0.5 rounded text-[10px]">
                #226 Invert Tree
              </span>
              <span className="text-slate-400 text-[10px]">DFS</span>
            </div>
            <p className="text-slate-500">
              <span className="text-blue-500">swap</span>(root-&gt;left, root-&gt;right);
            </p>
            <p className="text-slate-500">invertTree(root-&gt;left);</p>
            <p className="text-slate-500">invertTree(root-&gt;right);</p>
          </div>
        </div>

        {/* Subtle Metric Pill 1 (Beside Problem Arena - Left) */}
        <div className="absolute top-[640px] left-3 xl:left-8 2xl:left-16 opacity-25 hover:opacity-70 transition-opacity duration-300 anim-gentle-b hidden xl:block pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 bg-white/65 backdrop-blur-[2px] border border-slate-200/60 text-slate-500 font-code text-[10px] font-medium px-2.5 py-1 rounded-full shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Runtime: 0 ms (beats 100%)
          </span>
        </div>

        {/* Subtle Metric Pill 2 (Beside Problem Arena - Right) */}
        <div className="absolute top-[660px] right-3 xl:right-8 2xl:right-16 opacity-25 hover:opacity-70 transition-opacity duration-300 anim-gentle-a hidden xl:block pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 bg-white/65 backdrop-blur-[2px] border border-slate-200/60 text-slate-500 font-code text-[10px] font-medium px-2.5 py-1 rounded-full shadow-xs">
            dp[i][w] = max(include, exclude)
          </span>
        </div>

        {/* Subtle Pill 3 (Upper Left Flank) */}
        <div className="absolute top-[180px] left-4 xl:left-12 2xl:left-24 opacity-20 hover:opacity-70 transition-opacity duration-300 anim-gentle-d hidden 2xl:block pointer-events-auto">
          <span className="inline-flex items-center gap-1 bg-white/65 backdrop-blur-[2px] border border-slate-200/60 text-emerald-600 font-code text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs">
            ✔ 58/58 Testcases Passed
          </span>
        </div>

        {/* Subtle Pill 4 (Upper Right Flank) */}
        <div className="absolute top-[190px] right-4 xl:right-12 2xl:right-24 opacity-20 hover:opacity-70 transition-opacity duration-300 anim-gentle-c hidden 2xl:block pointer-events-auto">
          <span className="inline-flex items-center gap-1 bg-white/65 backdrop-blur-[2px] border border-slate-200/60 text-blue-600 font-code text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs">
            💾 Memory: 41.2 MB (O(1))
          </span>
        </div>
      </div>
    </>
  );
}

export default HeroFloatingAnimations;
