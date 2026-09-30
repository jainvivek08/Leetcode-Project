import React, { useState, useMemo } from 'react';
import { Flame } from 'lucide-react';

/**
 * ActivityHeatmap Component
 * 52-week activity / contribution matrix mirroring GitHub / LeetCode profile cadence.
 * Dynamically highlights active submission days, streaks, and exact calendar dates.
 * Seamlessly aligns 12 months with their exact 52-week grid columns.
 */
function ActivityHeatmap({
  totalSubmissions = 0,
  currentStreak = 0,
  maxStreak = 0,
  submissions = [],
  onDayClick,
}) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Helper date key: YYYY-MM-DD
  const formatDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (d) => {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Generate 52-week matrix ending at the current week
  const { matrix: heatmapData, monthMarkers } = useMemo(() => {
    const weeks = 52;
    const days = 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Map of date string (YYYY-MM-DD) -> submission count
    const dateCounts = {};

    // 1. Populate from actual submission records if timestamps exist
    if (Array.isArray(submissions) && submissions.length > 0) {
      submissions.forEach((s) => {
        const rawDate = s.createdAt || s.updatedAt || s.date;
        if (rawDate) {
          const key = formatDateKey(new Date(rawDate));
          dateCounts[key] = (dateCounts[key] || 0) + 1;
        }
      });
    }

    // 2. If no timestamps but totalSubmissions > 0, attribute to today & active streak days
    if (Object.keys(dateCounts).length === 0 && totalSubmissions > 0) {
      const todayKey = formatDateKey(today);
      const activeStreak = Math.max(currentStreak || 1, 1);

      // Give today at least 1 submission
      dateCounts[todayKey] = Math.max(1, Math.min(totalSubmissions, 2));
      let remaining = totalSubmissions - dateCounts[todayKey];

      // Spread remaining streak days backwards
      for (let i = 1; i < activeStreak && remaining > 0; i++) {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i);
        const pastKey = formatDateKey(pastDate);
        const count = Math.min(remaining, 2);
        dateCounts[pastKey] = count;
        remaining -= count;
      }
    }

    // 3. Calculate start Sunday: 51 weeks before current week's Sunday
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const startSunday = new Date(today);
    startSunday.setDate(today.getDate() - currentDayOfWeek - 51 * 7);
    startSunday.setHours(0, 0, 0, 0);

    const calculatedMatrix = [];
    const markers = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks; w++) {
      const weekDays = [];
      const firstDayOfWeek = new Date(startSunday);
      firstDayOfWeek.setDate(startSunday.getDate() + w * 7);

      // Track month transitions for header labels with exact column start
      const m = firstDayOfWeek.getMonth();
      if (m !== lastMonth) {
        markers.push({
          month: firstDayOfWeek.toLocaleDateString('en-US', { month: 'short' }),
          colStart: w + 1,
        });
        lastMonth = m;
      }

      for (let d = 0; d < days; d++) {
        const cellDate = new Date(startSunday);
        cellDate.setDate(startSunday.getDate() + w * 7 + d);

        const isToday = formatDateKey(cellDate) === formatDateKey(today);
        const isFuture = cellDate > today;
        const dateKey = formatDateKey(cellDate);
        const count = isFuture ? 0 : dateCounts[dateKey] || 0;

        let bgClass = 'bg-slate-200/60 hover:bg-slate-300';
        if (isFuture) {
          bgClass = 'bg-slate-100/40 border border-slate-200/30';
        } else if (count >= 4) {
          bgClass = 'bg-emerald-600 hover:bg-emerald-700 shadow-2xs';
        } else if (count >= 2) {
          bgClass = 'bg-emerald-500 hover:bg-emerald-600 shadow-2xs';
        } else if (count >= 1) {
          bgClass = 'bg-emerald-400 hover:bg-emerald-500 shadow-2xs ring-1 ring-emerald-500/30';
        }

        const dateStr = formatDateDisplay(cellDate);
        weekDays.push({
          week: w,
          day: d,
          date: cellDate,
          dateKey,
          count,
          bgClass,
          dateStr: isToday ? `${dateStr} (Today)` : dateStr,
          isToday,
          isFuture,
        });
      }
      calculatedMatrix.push(weekDays);
    }

    return {
      matrix: calculatedMatrix,
      monthMarkers: markers,
    };
  }, [totalSubmissions, currentStreak, submissions]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      {/* Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase tracking-wider">
            <span>{totalSubmissions}</span> Submissions in the past year
          </h2>
          <p className="text-[11px] text-slate-400">Total active problem solving cadence</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div>
            <span className="text-slate-400 font-mono text-[10px] uppercase block">
              Current Streak
            </span>
            <span className="text-slate-700 font-bold font-mono text-sm flex items-center gap-1">
              {currentStreak} Days{' '}
              <Flame
                className={`w-3.5 h-3.5 inline ${
                  currentStreak > 0
                    ? 'text-orange-500 fill-orange-500 animate-pulse'
                    : 'text-slate-300'
                }`}
              />
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 font-mono text-[10px] uppercase block">Max Streak</span>
            <span className="text-slate-700 font-bold font-mono text-sm">{maxStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix with Aligned Month Markers */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[680px]">
          {/* Month Markers locked 1-to-1 with the 52 week columns */}
          <div
            className="grid gap-1 mb-1.5 px-2 text-[10px] font-mono text-slate-400 select-none"
            style={{ gridTemplateColumns: 'repeat(52, minmax(0, 1fr))' }}
          >
            {monthMarkers.map((marker, idx) => (
              <span
                key={idx}
                style={{ gridColumnStart: marker.colStart }}
                className="col-span-4 truncate text-left"
              >
                {marker.month}
              </span>
            ))}
          </div>

          {/* Matrix of 52 Columns x 7 Days stretched across 100% width */}
          <div
            className="grid gap-1 p-2 bg-slate-50/70 rounded-xl border border-slate-200/80"
            style={{ gridTemplateColumns: 'repeat(52, minmax(0, 1fr))' }}
          >
            {heatmapData.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((item, dIdx) => (
                  <div
                    key={dIdx}
                    onMouseEnter={() => setHoveredDay(item)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => onDayClick && onDayClick(item)}
                    className={`aspect-square w-full rounded-xs ${item.bgClass} cursor-pointer transition-transform hover:scale-135 hover:ring-2 hover:ring-blue-400 ${
                      item.isToday && item.count > 0 ? 'ring-1 ring-emerald-500' : ''
                    }`}
                    title={
                      item.count > 0
                        ? `${item.count} submission${item.count === 1 ? '' : 's'} on ${item.dateStr}`
                        : item.isFuture
                        ? `Upcoming day (${item.dateStr})`
                        : `No submissions on ${item.dateStr}`
                    }
                  ></div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend & Tooltip readout */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-3 px-1">
            <span className="font-medium">
              {hoveredDay ? (
                hoveredDay.count > 0 ? (
                  <span className="text-emerald-700 font-semibold">
                    ✔ {hoveredDay.count} submission{hoveredDay.count === 1 ? '' : 's'} on {hoveredDay.dateStr}
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {hoveredDay.isFuture ? 'Upcoming day' : 'No submissions'} on {hoveredDay.dateStr}
                  </span>
                )
              ) : totalSubmissions > 0 ? (
                <span className="text-emerald-600 font-semibold">
                  ✔ {totalSubmissions} problem{totalSubmissions === 1 ? '' : 's'} solved in the past year • {currentStreak} Day Streak 🔥
                </span>
              ) : (
                'No submissions recorded yet'
              )}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-200/60 inline-block" title="0 submissions"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 inline-block" title="1-2 submissions"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" title="2-3 submissions"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" title="4+ submissions"></span>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
