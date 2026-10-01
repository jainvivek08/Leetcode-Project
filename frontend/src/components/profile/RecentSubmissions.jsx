import React, { useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Code2, Sparkles, ExternalLink } from 'lucide-react';
import { normalizeTags, tagLabel } from '../../utils/tags';

function RecentSubmissions({ submissions = [], onSubmissionClick, onToast }) {
  const [activeTab, setActiveTab] = useState('ac'); // 'ac' | 'all'

  const acSubmissions = submissions.filter((s) => s.status !== 'rejected');
  const list = activeTab === 'ac' ? acSubmissions : submissions;

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (onToast) {
      onToast(
        tab === 'ac'
          ? 'Displaying Accepted (AC) solutions'
          : 'Displaying All run & submit attempts',
        '📄'
      );
    }
  };

  const getDifficultyBadge = (diff = 'Easy') => {
    const d = diff.toLowerCase();
    if (d === 'hard') return 'bg-rose-50 text-rose-600 border border-rose-200/60';
    if (d === 'medium') return 'bg-blue-50 text-blue-600 border border-blue-200/60';
    return 'bg-emerald-50 text-emerald-600 border border-emerald-200/60';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleTabSwitch('ac')}
            className={`text-xs pb-1 transition cursor-pointer ${
              activeTab === 'ac'
                ? 'font-bold text-blue-600 border-b-2 border-blue-600'
                : 'font-semibold text-slate-500 hover:text-slate-800'
            }`}
          >
            Recent AC ({acSubmissions.length})
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('all')}
            className={`text-xs pb-1 transition cursor-pointer ${
              activeTab === 'all'
                ? 'font-bold text-blue-600 border-b-2 border-blue-600'
                : 'font-semibold text-slate-500 hover:text-slate-800'
            }`}
          >
            All Submissions ({submissions.length})
          </button>
        </div>

        <Link
          to="/problems"
          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Practice Problems</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* When List is Empty */}
      {list.length === 0 ? (
        <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-3 shadow-xs">
            <Code2 className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No submissions yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
            You haven&apos;t attempted or solved any problems yet. Jump into the arena, write some code, and test your logic!
          </p>
          <Link
            to="/problems"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Solving Problems</span>
          </Link>
        </div>
      ) : (
        /* Problem List Rows */
        <div className="divide-y divide-slate-100 text-xs">
          {list.map((item, idx) => {
            const tags = normalizeTags(item.tags);
            const targetLink = `/problem/${item.slug || item.problemId || item._id || item.id}`;
            const num = item.problemNumber || item.number;
            return (
              <div
                key={item._id || item.id || idx}
                onClick={() => onSubmissionClick && onSubmissionClick(item)}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 font-bold text-sm shrink-0">✔</span>

                  <div>
                    <Link
                      to={targetLink}
                      className="font-bold text-slate-800 group-hover:text-blue-600 transition inline-flex items-center gap-1"
                    >
                      <span>{num ? `${num}. ` : ''}{item.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {item.detail || (tags.length > 0 ? `Tags: ${tags.map(tagLabel).join(', ')}` : 'Solved in CodeQuest Arena')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${getDifficultyBadge(
                      item.difficulty
                    )}`}
                  >
                    {item.difficulty || 'Easy'}
                  </span>
                  {tags.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] hidden sm:inline">
                      {tags.map(tagLabel).join(', ')}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">
                    {item.timestamp || 'Solved'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentSubmissions;
