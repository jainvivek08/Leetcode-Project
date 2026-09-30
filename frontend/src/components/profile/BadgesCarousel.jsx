import React from 'react';
import { Award, Lock } from 'lucide-react';
import { Link } from 'react-router';

function BadgesCarousel({ badges = [], onBadgeClick, onViewAll }) {
  const isZeroBadges = !badges || badges.length === 0;

  // Placeholder locked badges to show users what they can unlock
  const lockedBadges = [
    {
      id: 'locked-1',
      title: 'First AC Badge',
      subtitle: 'Solve 1 Problem',
      icon: '🎯',
    },
    {
      id: 'locked-2',
      title: '50 Days Streak',
      subtitle: 'Locked',
      icon: '⚡',
    },
    {
      id: 'locked-3',
      title: 'Array Specialist',
      subtitle: 'Locked',
      icon: '🗂️',
    },
    {
      id: 'locked-4',
      title: 'Tree Novice',
      subtitle: 'Locked',
      icon: '🌲',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase tracking-wider">
            Badges
          </h2>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {badges.length}
          </span>
        </div>
        {badges.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            View All &rarr;
          </button>
        )}
      </div>

      {isZeroBadges ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {lockedBadges.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-slate-200/60 bg-slate-50/50 flex flex-col items-center text-center opacity-50 relative group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xl shadow-xs mb-2">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-600">{b.title}</h4>
                <span className="text-[10px] font-mono text-slate-400 font-medium mt-0.5">
                  {b.subtitle}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center pt-2 pb-1">
            <p className="text-xs text-slate-500">
              No badges unlocked yet.{' '}
              <Link to="/problems" className="text-blue-600 font-bold hover:underline">
                Solve your first problem
              </Link>{' '}
              to start earning achievement awards! 🏆
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              onClick={() => onBadgeClick && onBadgeClick(b)}
              className={`p-3 rounded-xl border ${b.border} bg-gradient-to-br ${b.bgGradient} flex flex-col items-center text-center group cursor-pointer hover:shadow-2xs hover:-translate-y-0.5 transition-all`}
            >
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-tr ${b.iconBg} text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform mb-2`}
              >
                <span>{b.icon}</span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-800">{b.title}</h4>
              <span className={`text-[10px] font-mono ${b.tagColor} font-bold mt-0.5`}>
                {b.subtitle}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BadgesCarousel;
