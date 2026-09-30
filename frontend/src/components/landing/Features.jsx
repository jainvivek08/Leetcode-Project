import React from 'react';
import { Link } from 'react-router';

function Features() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Card 1: AI MENTOR */}
        <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">
          <div className="w-full md:w-1/2 bg-[#fdf8f4] border border-[#f5e6d8] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white rounded-2xl border border-amber-200 shadow-sm flex items-center justify-center text-4xl animate-float">
                🤖
              </div>
              <div className="bg-blue-600 text-white text-xs px-3 py-2 rounded-xl shadow font-mono animate-pulse">
                &lt;/&gt; Hint: Check edge cases!
              </div>
              <div className="w-20 h-20 bg-white rounded-2xl border border-amber-200 shadow-sm flex items-center justify-center text-4xl animate-float [animation-delay:1.5s]">
                👨‍💻
              </div>
            </div>
            <div className="bg-white border border-amber-100 rounded-xl px-4 py-2 text-xs text-slate-600 font-medium shadow-sm">
              💡 Explains step-by-step logic without spoiling answers
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-3">
            <span className="text-xs sm:text-sm font-bold tracking-wide text-amber-600 uppercase">
              AI mentor
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              Your Personal AI Tutor : Solve Problems Instantly
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Get step-by-step explanations, debugging help, and personalized learning guidance from our AI-powered assistant.
            </p>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pt-2">
              How It Works
            </h4>
            <div className="space-y-2.5 pb-2 text-xs sm:text-sm text-slate-700 font-medium">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>{' '}
                Ask a coding-related question.
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>{' '}
                Get instant solutions &amp; explanations.
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>{' '}
                Debug and optimize your code in real time..
              </div>
            </div>
            <Link
              to="/problems"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-sm transition"
            >
              Ask AI Mentor
            </Link>
          </div>
        </div>

        {/* Card 2: REAL WORLD PROBLEMS */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-10 lg:gap-16">
          <div className="w-full md:w-1/2 bg-[#e6fbf3] border border-[#c1f3df] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
            <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-6 text-center">
              Choose from different difficulty level
            </h4>

            {/* Graphic Capsules with filled heights */}
            <div className="flex items-end justify-center gap-5 h-52 w-full max-w-xs">
              {/* Easy (50% filled green) */}
              <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                <span className="text-xs font-bold text-emerald-800 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                  Easy 👆
                </span>
                <div className="w-full bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 h-36 flex flex-col justify-end">
                  <div className="w-full bg-[#10b981] rounded-xl h-1/2 shadow-inner"></div>
                </div>
              </div>

              {/* Medium (~75% filled blue) */}
              <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                <span className="text-xs font-bold text-blue-800 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                  Medium
                </span>
                <div className="w-full bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 h-36 flex flex-col justify-end">
                  <div className="w-full bg-[#3b82f6] rounded-xl h-3/4 shadow-inner"></div>
                </div>
              </div>

              {/* Hard (~100% full rose) */}
              <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                <span className="text-xs font-bold text-rose-800 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                  Hard
                </span>
                <div className="w-full bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 h-36 flex flex-col justify-end">
                  <div className="w-full bg-[#f43f5e] rounded-xl h-full shadow-inner"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-3">
            <span className="text-xs sm:text-sm font-bold tracking-wide text-emerald-600 uppercase">
              Real world Problems
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              Practice to Solve Real World Problems
            </h3>
            <ul className="space-y-2.5 py-2 text-xs sm:text-sm text-slate-700 font-medium">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>{' '}
                Take on challenges that truly matter.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>{' '}
                Choose by difficulty level.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>{' '}
                Explore 30+ languages and technologies.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>{' '}
                Use AI Tutor for smart tips.
              </li>
            </ul>
            <Link
              to="/problems"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-sm transition"
            >
              Start Practice
            </Link>
          </div>
        </div>

        {/* Card 3: BUILD REAL WORLD PROJECTS */}
        <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">
          <div className="w-full md:w-1/2 bg-[#fcf8dc] border border-[#f3ecc2] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
            <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-4 text-center">
              Build Real World Projects
            </h4>
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-16 h-12 bg-slate-900 rounded-lg p-1.5 shadow flex flex-col justify-between">
                  <div className="w-8 h-1 bg-blue-400 rounded"></div>
                  <div className="w-5 h-1 bg-emerald-400 rounded"></div>
                </div>
                <div className="w-28 h-20 bg-slate-900 rounded-xl p-2 shadow-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[8px] font-mono text-slate-400">server.ts</span>
                  <p className="font-mono text-[7px] text-blue-400">app.post(&apos;/api&apos;)</p>
                </div>
                <div className="w-16 h-12 bg-slate-900 rounded-lg p-1.5 shadow flex flex-col justify-between">
                  <div className="w-8 h-1 bg-amber-400 rounded"></div>
                  <div className="w-5 h-1 bg-purple-400 rounded"></div>
                </div>
              </div>
              <div className="w-40 h-2.5 bg-slate-800 rounded-full mt-1"></div>
              <div className="text-2xl mt-1">🧑‍💻 🐈</div>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-3">
            <span className="text-xs sm:text-sm font-bold tracking-wide text-rose-500 uppercase">
              Real World projects
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              Build Real World Projects
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Work on hands-on projects that reflect real industry challenges
            </p>
            <ul className="space-y-2.5 py-2 text-xs sm:text-sm text-slate-700 font-medium">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>{' '}
                Solve real problems with projects.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>{' '}
                Explore projects in full stack development and data science.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>{' '}
                Gain practical, job-ready skills.
              </li>
            </ul>
            <Link
              to="/problems"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-sm transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Card 4: ONLINE COMPILER */}
        <div id="compiler" className="flex flex-col md:flex-row-reverse items-center gap-10 lg:gap-16">
          <div className="w-full md:w-1/2 bg-[#ede9fe]/50 border border-[#ddd6fe] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
            <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-4 text-center">
              Code, Test &amp; Debug instantly
            </h4>
            <div className="bg-slate-900 text-slate-200 font-mono text-xs p-4 rounded-xl shadow-md w-full max-w-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                <span className="text-[11px] ml-1">online-playground</span>
              </div>
              <p className="text-emerald-400">&gt; g++ main.cpp -o app</p>
              <p className="text-emerald-400">
                &gt; ./app<span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-1 animate-blink align-middle"></span>
              </p>
              <p className="text-blue-300">Outputs: Test cases passed (0.02s)</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-3">
            <span className="text-xs sm:text-sm font-bold tracking-wide text-indigo-600 uppercase">
              Online Compiler
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              Your Interactive Coding Playground
            </h3>
            <ul className="space-y-2.5 py-2 text-xs sm:text-sm text-slate-700 font-medium">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>{' '}
                Code, Test &amp; Debug Instantly in any Language.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>{' '}
                Build web applications with our HTML and React online compilers.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>{' '}
                Optimize your code using AI-driven debugging.
              </li>
            </ul>
            <Link
              to="/problems"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-sm transition"
            >
              Explore Compiler
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
