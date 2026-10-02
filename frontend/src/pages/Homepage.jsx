import { useEffect, useState } from 'react';
import { NavLink } from 'react-router'; // Fixed import
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { normalizeTags, tagLabel, CANONICAL_TAGS } from '../utils/tags';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyDate, setDailyDate] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  useEffect(() => {
    const fetchDailyChallenge = async () => {
      try {
        const { data } = await axiosClient.get('/problem/daily-challenge');
        if (data?.success && data?.problem) {
          setDailyChallenge(data.problem);
          setDailyDate(data.date || '');
        }
      } catch (error) {
        console.warn('Could not fetch daily challenge:', error);
      }
    };

    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/all-lite');
        setProblems(Array.isArray(data) ? data : (data?.problems || []));
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchDailyChallenge();
    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); // Clear solved problems on logout
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || normalizeTags(problem.tags).includes(filters.tag);
    const statusMatch = filters.status === 'all' || 
                      solvedProblems.some(sp => sp._id === problem._id);
    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-lg px-4">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">LeetCode</NavLink>
        </div>
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost">
              {user?.firstName}
            </div>
            <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><NavLink to="/profile">👤 My Profile</NavLink></li>
              <li><NavLink to="/settings">⚙️ Settings</NavLink></li>
              <div className="divider my-1"></div>
              <li><button onClick={handleLogout}>Logout</button></li>
              {user?.role === 'admin' && <li><NavLink to="/admin">Admin</NavLink></li>}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Daily Challenge Card */}
        {dailyChallenge && (
          <div className="card bg-base-100 shadow-xl border border-primary/20 mb-6 overflow-hidden bg-gradient-to-r from-primary/5 via-base-100 to-secondary/5">
            <div className="card-body p-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary gap-1 font-bold text-xs py-2 px-3 shadow-xs">
                      ⚡ Daily Challenge
                    </span>
                    {dailyDate && (
                      <span className="text-xs text-base-content/60 font-mono">
                        {dailyDate}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight text-base-content">
                    {dailyChallenge.problemNumber ? `#${dailyChallenge.problemNumber}. ` : ''}
                    {dailyChallenge.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={`badge ${getDifficultyBadgeColor(dailyChallenge.difficulty)} font-semibold capitalize`}>
                      {dailyChallenge.difficulty}
                    </span>
                    {normalizeTags(dailyChallenge.tags).map((t) => (
                      <span key={t} className="badge badge-outline text-xs">
                        {tagLabel(t)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <NavLink
                    to={`/problems/${dailyChallenge.slug || dailyChallenge._id}`}
                    className="btn btn-primary gap-2 w-full md:w-auto shadow-md hover:scale-105 transition-transform font-bold"
                  >
                    Solve Challenge →
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* New Status Filter */}
          <select 
            className="select select-bordered"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select>

          <select 
            className="select select-bordered"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select 
            className="select select-bordered"
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all">All Tags</option>
            {CANONICAL_TAGS.map((t) => (
              <option key={t} value={t}>
                {tagLabel(t)}
              </option>
            ))}
          </select>
        </div>

        {/* Problems List */}
        <div className="grid gap-4">
          {filteredProblems.map(problem => (
            <div key={problem._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">
                    <NavLink to={`/problem/${problem.slug || problem._id}`} className="hover:text-primary">
                      {problem.problemNumber ? `#${problem.problemNumber}. ` : ''}{problem.title}
                    </NavLink>
                  </h2>
                  {solvedProblems.some(sp => sp._id === problem._id) && (
                    <div className="badge badge-success gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Solved
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </div>
                  {normalizeTags(problem.tags).map((t) => (
                    <div key={t} className="badge badge-info">
                      {tagLabel(t)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;