import React from 'react';

function AuthBackground() {
  return (
    <>
      <style>{`
        @keyframes floatGentleA {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50% { transform: translateY(-11px) rotate(-2deg); }
        }
        @keyframes floatGentleB {
          0%, 100% { transform: translateY(0px) rotate(5deg); }
          50% { transform: translateY(-13px) rotate(7deg); }
        }
        @keyframes floatGentleC {
          0%, 100% { transform: translateY(0px) rotate(-6deg); }
          50% { transform: translateY(11px) rotate(-4deg); }
        }
        @keyframes floatGentleD {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        .anim-gentle-a { animation: floatGentleA 8.5s ease-in-out infinite; will-change: transform; }
        .anim-gentle-b { animation: floatGentleB 9.5s ease-in-out infinite; will-change: transform; }
        .anim-gentle-c { animation: floatGentleC 9.0s ease-in-out infinite; will-change: transform; }
        .anim-gentle-d { animation: floatGentleD 10.0s ease-in-out infinite; will-change: transform; }
      `}</style>

      {/* Very soft, subtle ambient backlight behind the main card */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-0">
        <div className="w-[520px] h-[520px] bg-gradient-to-tr from-blue-200/20 via-sky-100/15 to-indigo-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Gentle, light floating DSA code cards (Subtle & Non-distracting) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
        {/* Top Left: #01 Two Sum */}
        <div className="absolute top-16 left-6 lg:left-14 anim-gentle-a opacity-35 hover:opacity-75 transition-opacity duration-300 hidden sm:block">
          <div className="bg-white/70 backdrop-blur-xs border border-slate-200/60 shadow-xs rounded-xl p-3 w-64 text-[11px] font-code">
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

        {/* Top Right: #20 Valid Parentheses */}
        <div className="absolute top-20 right-6 lg:right-16 anim-gentle-b opacity-30 hover:opacity-75 transition-opacity duration-300 hidden sm:block">
          <div className="bg-white/70 backdrop-blur-xs border border-slate-200/60 shadow-xs rounded-xl p-3 w-60 text-[11px] font-code">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100/80 font-sans">
              <span className="text-emerald-600 font-semibold bg-emerald-50/70 px-1.5 py-0.5 rounded text-[10px]">
                #20 Valid Parentheses
              </span>
              <span className="text-blue-500 text-[10px] bg-blue-50/70 px-1.5 py-0.5 rounded">Stack</span>
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

        {/* Bottom Left: #704 Binary Search */}
        <div className="absolute bottom-16 left-8 lg:left-20 anim-gentle-c opacity-35 hover:opacity-75 transition-opacity duration-300 hidden md:block">
          <div className="bg-white/70 backdrop-blur-xs border border-slate-200/60 shadow-xs rounded-xl p-3 w-64 text-[11px] font-code">
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

        {/* Bottom Right: #226 Invert Tree */}
        <div className="absolute bottom-20 right-8 lg:right-24 anim-gentle-d opacity-30 hover:opacity-75 transition-opacity duration-300 hidden md:block">
          <div className="bg-white/70 backdrop-blur-xs border border-slate-200/60 shadow-xs rounded-xl p-3 w-56 text-[11px] font-code">
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

        {/* Peripheral Tiny Metric Pills */}
        <div className="absolute top-[40%] left-4 lg:left-8 opacity-25 anim-gentle-b hidden xl:block">
          <span className="bg-white/70 border border-slate-200/60 text-slate-400 font-code text-[10px] font-medium px-2.5 py-1 rounded-full">
            Runtime: 0 ms (beats 100%)
          </span>
        </div>

        <div className="absolute top-[38%] right-6 lg:right-10 opacity-25 anim-gentle-a hidden xl:block">
          <span className="bg-white/70 border border-slate-200/60 text-slate-400 font-code text-[10px] font-medium px-2.5 py-1 rounded-full">
            dp[i][w] = max(include, exclude)
          </span>
        </div>
      </div>
    </>
  );
}

export default AuthBackground;
