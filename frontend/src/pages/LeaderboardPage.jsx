import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import {
  Trophy,
  Medal,
  Award,
  Flame,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';

function LeaderboardPage() {
  const { user } = useSelector((state) => state.auth || {});

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cachedAt, setCachedAt] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // User's own rank stats (when outside top 50 or for personal rank display)
  const [userRankData, setUserRankData] = useState(null);

  const fetchLeaderboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const { data } = await axiosClient.get('/leaderboard?limit=50');
      if (data?.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        setCachedAt(data.cachedAt || new Date().toISOString());
      } else {
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err.response?.data?.message || 'Failed to load leaderboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    document.title = 'Leaderboard | CodeQuest';
  }, []);

  useEffect(() => {
    const fetchUserRank = async () => {
      if (!user) {
        setUserRankData(null);
        return;
      }
      try {
        const { data } = await axiosClient.get('/user/getRank');
        if (data?.success) {
          setUserRankData(data);
        }
      } catch (err) {
        console.warn('Failed to fetch user rank:', err);
      }
    };

    if (user) {
      fetchUserRank();
    } else {
      setUserRankData(null);
    }
  }, [user]);

  // Check if current user is present in the top 50 list
  const currentUserInTop50 = user
    ? leaderboard.find((entry) => String(entry._id) === String(user._id))
    : null;

  // Filter leaderboard by search query
  const filteredLeaderboard = leaderboard.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const name = `${entry.firstName || ''} ${entry.lastName || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase().trim());
  });

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/40 shadow-xs font-black text-sm">
          <Trophy className="w-4 h-4 fill-amber-500" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300/30 text-slate-400 border border-slate-400/40 shadow-xs font-black text-sm">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/15 text-amber-700 dark:text-amber-600 border border-amber-700/40 shadow-xs font-black text-sm">
          <Award className="w-4 h-4" />
        </div>
      );
    }
    return (
      <span className="font-mono font-bold text-xs sm:text-sm text-slate-500 dark:text-slate-400 w-8 text-center">
        #{rank}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col antialiased text-slate-800 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900 pb-20">
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 2. HERO / HEADER STRIP */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3 shadow-2xs">
                <Trophy className="w-3.5 h-3.5 fill-amber-500" />
                <span>Global Rankings</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <span>CodeQuest Leaderboard</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Top algorithmic problem solvers ranked by verified problem submissions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {cachedAt && (
                <div className="text-right text-[11px] text-slate-400 font-mono hidden sm:block">
                  <div>Live 60s Cache</div>
                  <div>{new Date(cachedAt).toLocaleTimeString()}</div>
                </div>
              )}
              <button
                type="button"
                onClick={fetchLeaderboardData}
                disabled={refreshing}
                title="Refresh Leaderboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200/80 dark:border-slate-700 transition cursor-pointer disabled:opacity-60 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN LEADERBOARD CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* Search Bar & Top Stats */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by coder name..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Showing top 50 participants</span>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto animate-pulse select-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase select-none">
                    <th className="py-3.5 px-4 sm:px-6 w-16 text-center">RANK</th>
                    <th className="py-3.5 px-4 sm:px-6">USER</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">SOLVED</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">DIFFICULTY BREAKDOWN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <tr key={i} className="py-3.5">
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-750 mx-auto" />
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-750 shrink-0" />
                          <div className="space-y-1 w-full max-w-[160px]">
                            <div className="h-4 bg-slate-200 dark:bg-slate-750 rounded w-full" />
                            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <div className="h-6 w-14 bg-slate-200 dark:bg-slate-750 rounded-full mx-auto" />
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex gap-2 justify-end">
                          <div className="h-5 w-8 bg-slate-200 dark:bg-slate-750 rounded" />
                          <div className="h-5 w-8 bg-slate-200 dark:bg-slate-750 rounded" />
                          <div className="h-5 w-8 bg-slate-200 dark:bg-slate-750 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : error ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-rose-600 dark:text-rose-400 text-sm font-bold">{error}</p>
              <button
                type="button"
                onClick={fetchLeaderboardData}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="p-16 text-center space-y-3 select-none">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-sm font-bold">
                {searchQuery ? 'No participants match your search.' : 'No leaderboard entries yet.'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try searching with another name or clear your search input.'
                  : 'Solve algorithm problems to be the first coder featured on the global leaderboard!'}
              </p>
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              ) : (
                <Link
                  to="/problems"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Start Solving
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase select-none">
                    <th className="py-3.5 px-4 sm:px-6 w-16 text-center">RANK</th>
                    <th className="py-3.5 px-4 sm:px-6">USER</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">SOLVED</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">DIFFICULTY BREAKDOWN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {filteredLeaderboard.map((coder) => {
                    const isCurrentUser = user && String(coder._id) === String(user._id);

                    return (
                      <tr
                        key={coder._id}
                        className={`transition ${
                          isCurrentUser
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-l-blue-600 font-bold'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <div className="flex items-center justify-center">
                            {getRankBadge(coder.rank)}
                          </div>
                        </td>

                        {/* User Avatar + Name */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            {coder.avatar ? (
                              <img
                                src={coder.avatar}
                                alt={coder.firstName || 'User'}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                                {(coder.firstName?.[0] || 'U').toUpperCase()}
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {coder.firstName} {coder.lastName || ''}
                              </span>
                              {isCurrentUser && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-2xs">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Solved Count */}
                        <td className="py-3.5 px-4 sm:px-6 text-center font-mono font-extrabold text-slate-800 dark:text-slate-100">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {coder.solvedCount}
                          </span>
                        </td>

                        {/* Easy/Medium/Hard Breakdown */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <span
                              title="Easy Problems Solved"
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            >
                              {coder.easyCount || 0}E
                            </span>
                            <span
                              title="Medium Problems Solved"
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            >
                              {coder.mediumCount || 0}M
                            </span>
                            <span
                              title="Hard Problems Solved"
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            >
                              {coder.hardCount || 0}H
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 4. STICKY USER RANK FOOTER / BANNER */}
      {user && !currentUserInTop50 && userRankData && (
        <aside
          aria-label="Your ranking status"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-blue-500/30 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] py-3 px-4 sm:px-6"
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {(user.firstName?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Your Global Position</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({userRankData.totalUsers || 0} total coders)
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {userRankData.rankPercentile || 'Keep practicing to climb the ranks!'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl font-mono text-xs font-extrabold text-blue-700 dark:text-blue-300">
                <span>Your Rank: #{userRankData.rank || 'N/A'}</span>
                <span>|</span>
                <span>Solved: {userRankData.solvedCount ?? userRankData.totalSolved ?? 0}</span>
              </div>
              <Link
                to="/problems"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Solve Problems
              </Link>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

export default LeaderboardPage;
