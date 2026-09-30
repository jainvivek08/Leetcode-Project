import React, { useState } from 'react';

function ProblemArenaPreview() {
  const [executionState, setExecutionState] = useState({
    status: 'idle', // 'idle' | 'running' | 'submitted'
    message: '● Status: All 55 testcases passed (0 ms)',
    memory: 'Memory: 10.4 MB',
    type: 'success', // 'success' | 'running' | 'submitting' | 'accepted'
  });

  const handleRun = () => {
    if (executionState.status === 'running' || executionState.status === 'submitting') return;

    setExecutionState({
      status: 'running',
      message: '⚙ Compiling and executing test cases...',
      memory: '',
      type: 'running',
    });

    setTimeout(() => {
      setExecutionState({
        status: 'idle',
        message: '● Status: All 55 testcases passed (0 ms)',
        memory: 'Memory: 10.4 MB',
        type: 'success',
      });
    }, 600);
  };

  const handleSubmit = () => {
    if (executionState.status === 'running' || executionState.status === 'submitting') return;

    setExecutionState({
      status: 'submitting',
      message: '🚀 Submitting to test suite...',
      memory: '',
      type: 'submitting',
    });

    setTimeout(() => {
      setExecutionState({
        status: 'submitted',
        message: '✔ Accepted: All 55 Test Cases Passed!',
        memory: 'Memory: 10.4 MB',
        type: 'accepted',
      });
    }, 750);
  };

  return (
    <div id="practice" className="w-full max-w-5xl mx-auto bg-[#0a0f1d] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-left">
      {/* Terminal Chrome Bar */}
      <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-xs font-mono text-slate-400 pl-3">problem_01_twosum.cpp</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
            C++ (GCC 13)
          </span>
          <button
            type="button"
            onClick={handleRun}
            disabled={executionState.status === 'running' || executionState.status === 'submitting'}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-400 text-xs font-bold px-3 py-1 rounded border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>▶ Run</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={executionState.status === 'running' || executionState.status === 'submitting'}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-1 rounded shadow transition cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Dual Pane Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Pane: Problem Description */}
        <div className="lg:col-span-5 p-5 bg-[#0e1629] text-slate-300 text-xs space-y-3 font-sans flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Easy
              </span>
              <span className="text-slate-400 text-xs font-mono">#01 Two Sum</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Target Sum in Array</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Given an array of integers <code className="text-amber-300 font-mono">nums</code> and an integer <code className="text-amber-300 font-mono">target</code>, return indices of two numbers that add up to target.
            </p>
            <div className="bg-[#080d19] rounded-xl p-3 border border-slate-800 font-mono text-xs space-y-1 mb-3">
              <div><span className="text-slate-400">Input:</span> nums = [2,7,11,15], target = 9</div>
              <div><span className="text-slate-400">Output:</span> <span className="text-emerald-400 font-bold">[0, 1]</span></div>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] pt-1">
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Array</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Hash Table</span>
              <span className="text-emerald-400 font-medium ml-auto">94.2% Acceptance</span>
            </div>
          </div>

          {/* Interactive Output Bar with React State */}
          <div className="pt-3 text-[11px] font-mono flex items-center justify-between border-t border-slate-800/80 min-h-[38px]">
            {executionState.type === 'running' && (
              <span className="text-amber-400 animate-pulse flex items-center gap-1.5">
                {executionState.message}
              </span>
            )}
            {executionState.type === 'submitting' && (
              <span className="text-blue-400 animate-pulse flex items-center gap-1.5">
                {executionState.message}
              </span>
            )}
            {executionState.type === 'accepted' && (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                {executionState.message}
              </span>
            )}
            {executionState.type === 'success' && (
              <span className="text-emerald-400 flex items-center gap-1.5">
                {executionState.message}
              </span>
            )}
            {executionState.memory && (
              <span className="text-slate-400">{executionState.memory}</span>
            )}
          </div>
        </div>

        {/* Right Pane: Compact C++ Editor with Line Numbers */}
        <div className="lg:col-span-7 p-4 bg-[#080d1a] font-code text-xs text-slate-200 overflow-x-auto">
          <div className="flex">
            {/* Line Numbers */}
            <div className="select-none text-slate-600 text-right pr-3.5 border-r border-slate-800 font-mono code-line text-[11px]">
              <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
              <div>6</div><div>7</div><div>8</div><div>9</div><div>10</div>
              <div>11</div><div>12</div><div>13</div><div>14</div><div>15</div>
              <div>16</div><div>17</div><div>18</div><div>19</div><div>20</div>
            </div>
            {/* Compact Code Content */}
            <div className="pl-3.5 font-mono code-line text-[11px] whitespace-pre">
              <div><span className="text-pink-400 font-semibold">#include</span> <span className="text-emerald-400">&lt;unordered_map&gt;</span></div>
              <div><span className="text-pink-400 font-semibold">#include</span> <span className="text-emerald-400">&lt;vector&gt;</span></div>
              <div><span className="text-sky-400">using namespace</span> <span className="text-white">std</span>;</div>
              <div></div>
              <div><span className="text-sky-400">class</span> <span className="text-amber-300 font-bold">Solution</span> &#123;</div>
              <div><span className="text-sky-400">public</span>:</div>
              <div>    <span className="text-sky-400">vector</span>&lt;<span className="text-sky-400">int</span>&gt; <span className="text-amber-300">twoSum</span>(<span className="text-sky-400">vector</span>&lt;<span className="text-sky-400">int</span>&gt;&amp; <span className="text-slate-200">nums</span>, <span className="text-sky-400">int</span> <span className="text-slate-200">target</span>) &#123;</div>
              <div>        <span className="text-sky-400">unordered_map</span>&lt;<span className="text-sky-400">int</span>, <span className="text-sky-400">int</span>&gt; <span className="text-slate-200">mp</span>;</div>
              <div>        <span className="text-purple-400 font-semibold">for</span> (<span className="text-sky-400">int</span> <span className="text-slate-200">i</span> = <span className="text-orange-400">0</span>; <span className="text-slate-200">i</span> &lt; <span className="text-slate-200">nums</span>.<span className="text-sky-300">size</span>(); ++<span className="text-slate-200">i</span>) &#123;</div>
              <div>            <span className="text-sky-400">int</span> <span className="text-slate-200">complement</span> = <span className="text-slate-200">target</span> - <span className="text-slate-200">nums</span>[<span className="text-slate-200">i</span>];</div>
              <div>            <span className="text-purple-400 font-semibold">if</span> (<span className="text-slate-200">mp</span>.<span className="text-sky-300">count</span>(<span className="text-slate-200">complement</span>)) &#123;</div>
              <div>                <span className="text-purple-400 font-semibold">return</span> &#123;<span className="text-slate-200">mp</span>[<span className="text-slate-200">complement</span>], <span className="text-slate-200">i</span>&#125;;</div>
              <div>            &#125;</div>
              <div>            <span className="text-slate-200">mp</span>[<span className="text-slate-200">nums</span>[<span className="text-slate-200">i</span>]] = <span className="text-slate-200">i</span>;</div>
              <div>        &#125;</div>
              <div>        <span className="text-purple-400 font-semibold">return</span> &#123;&#125;;</div>
              <div>    &#125;</div>
              <div>&#125;;<span className="inline-block w-1.5 h-3.5 bg-sky-400 ml-1 animate-blink align-middle"></span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemArenaPreview;
