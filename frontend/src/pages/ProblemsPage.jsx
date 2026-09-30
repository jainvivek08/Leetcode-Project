import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  LayoutGrid,
  List,
  Tag,
  BarChart2,
  Building2,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Flame,
  X,
  Check,
  Code2,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import ProfileDropdown from '../components/profile/ProfileDropdown';
import { logoutUser } from '../authSlice';

/**
 * Base Problem Metadata for the user's real MongoDB questions
 * Maps real MongoDB IDs to companies, submission stats, and accuracy.
 */
const BASE_PROBLEMS_DATA = [
  {
    _id: '6915634fd64afde0c9380820',
    title: 'Check Even or Odd',
    difficulty: 'easy',
    tags: 'math',
    topic: 'Mathematics',
    companies: ['Accenture', 'TCS', 'Wipro'],
    submissions: '145.8k',
    submissionsVal: 145800,
    accuracy: '68.2%',
    accuracyVal: 68.2,
  },
  {
    _id: '6915042aa87b7e3f89c974f7',
    title: 'Addition of Two Numbers',
    difficulty: 'easy',
    tags: 'array,math',
    topic: 'Mathematics',
    secondaryTopic: 'Arrays',
    companies: ['TCS', 'Infosys'],
    submissions: '180.4k',
    submissionsVal: 180400,
    accuracy: '72.5%',
    accuracyVal: 72.5,
  },
  {
    _id: '6ab3c2771bfee203bcae7f01',
    title: 'Multiply Two Numbers',
    difficulty: 'easy',
    tags: 'array,math',
    topic: 'Mathematics',
    secondaryTopic: 'Arrays',
    companies: ['Infosys', 'Cognizant'],
    submissions: '98.2k',
    submissionsVal: 98200,
    accuracy: '74.1%',
    accuracyVal: 74.1,
  },
  {
    _id: '69156380d64afde0c9380822',
    title: 'Factorial of a Number',
    difficulty: 'medium',
    tags: 'recursion,math',
    topic: 'Recursion',
    secondaryTopic: 'Mathematics',
    companies: ['Microsoft', 'Adobe'],
    submissions: '142.1k',
    submissionsVal: 142100,
    accuracy: '52.8%',
    accuracyVal: 52.8,
  },
  {
    _id: '69156423d64afde0c9380824',
    title: 'Nth Fibonacci Number',
    difficulty: 'medium',
    tags: 'recursion,dp',
    topic: 'Recursion',
    secondaryTopic: 'Dynamic Programming',
    companies: ['Amazon', 'Goldman Sachs'],
    submissions: '195.4k',
    submissionsVal: 195400,
    accuracy: '47.6%',
    accuracyVal: 47.6,
  },
  {
    _id: '6a397b8de160bb3aec153fc2',
    title: 'Two Sum',
    difficulty: 'easy',
    tags: 'array',
    topic: 'Arrays',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    submissions: '340.5k',
    submissionsVal: 340500,
    accuracy: '49.8%',
    accuracyVal: 49.8,
  },
  {
    _id: '6a1565c4f680434d4ac67b97',
    title: 'Two Sum Target',
    difficulty: 'easy',
    tags: 'array',
    topic: 'Arrays',
    companies: ['Amazon', 'Flipkart'],
    submissions: '120.3k',
    submissionsVal: 120300,
    accuracy: '51.4%',
    accuracyVal: 51.4,
  },
  {
    _id: '69340b8a946a41b9a4d070fd',
    title: 'Reverse a String',
    difficulty: 'easy',
    tags: 'array,string',
    topic: 'Strings',
    secondaryTopic: 'Arrays',
    companies: ['Amazon', 'Microsoft', 'Google'],
    submissions: '210.8k',
    submissionsVal: 210800,
    accuracy: '64.9%',
    accuracyVal: 64.9,
  },
  {
    _id: '6915648ad64afde0c9380826',
    title: 'Palindrome Check',
    difficulty: 'medium',
    tags: 'string',
    topic: 'Strings',
    companies: ['Microsoft', 'Amazon'],
    submissions: '165.2k',
    submissionsVal: 165200,
    accuracy: '58.3%',
    accuracyVal: 58.3,
  },
  {
    _id: '6915652bd64afde0c9380828',
    title: 'Count Vowels',
    difficulty: 'medium',
    tags: 'string',
    topic: 'Strings',
    companies: ['Adobe', 'Flipkart'],
    submissions: '115.4k',
    submissionsVal: 115400,
    accuracy: '63.7%',
    accuracyVal: 63.7,
  },
  {
    _id: '6a397b8de160bb3aec154006',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    tags: 'array,string',
    topic: 'Strings',
    secondaryTopic: 'Arrays',
    companies: ['Google', 'Amazon', 'Microsoft'],
    submissions: '285.9k',
    submissionsVal: 285900,
    accuracy: '44.5%',
    accuracyVal: 44.5,
  },
  {
    _id: '6a397b8de160bb3aec153fd1',
    title: 'Reverse Linked List',
    difficulty: 'easy',
    tags: 'linkedList',
    topic: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Google'],
    submissions: '290.4k',
    submissionsVal: 290400,
    accuracy: '56.2%',
    accuracyVal: 56.2,
  },
  {
    _id: '6a397b8de160bb3aec153fde',
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy',
    tags: 'linkedList',
    topic: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Flipkart'],
    submissions: '225.1k',
    submissionsVal: 225100,
    accuracy: '54.8%',
    accuracyVal: 54.8,
  },
  {
    _id: '6a397b8de160bb3aec153feb',
    title: 'Climbing Stairs',
    difficulty: 'easy',
    tags: 'dp',
    topic: 'Dynamic Programming',
    companies: ['Amazon', 'Adobe', 'Google'],
    submissions: '260.8k',
    submissionsVal: 260800,
    accuracy: '48.9%',
    accuracyVal: 48.9,
  },
  {
    _id: '6a397b8de160bb3aec153ff9',
    title: 'Maximum Subarray',
    difficulty: 'medium',
    tags: 'dp,array',
    topic: 'Dynamic Programming',
    secondaryTopic: 'Arrays',
    companies: ['Amazon', 'Microsoft', 'Google', 'LinkedIn'],
    submissions: '310.2k',
    submissionsVal: 310200,
    accuracy: '42.1%',
    accuracyVal: 42.1,
  },
  {
    _id: '6a397b8de160bb3aec154014',
    title: 'Longest Common Subsequence',
    difficulty: 'medium',
    tags: 'dp',
    topic: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Google'],
    submissions: '138.4k',
    submissionsVal: 138400,
    accuracy: '36.5%',
    accuracyVal: 36.5,
  },
  {
    _id: '6a397b8de160bb3aec154020',
    title: 'Number of Islands',
    difficulty: 'medium',
    tags: 'graph',
    topic: 'Graphs & Matrix',
    companies: ['Amazon', 'Microsoft', 'Google', 'Bloomberg'],
    submissions: '175.6k',
    submissionsVal: 175600,
    accuracy: '34.2%',
    accuracyVal: 34.2,
  },
];

/**
 * Standard Topic Category Definitions
 */
const TOPIC_ORDER = [
  'Mathematics',
  'Arrays',
  'Strings',
  'Recursion',
  'Dynamic Programming',
  'Linked List',
  'Graphs & Matrix',
];

const TOPIC_TAG_MAP = {
  math: 'Mathematics',
  mathematics: 'Mathematics',
  array: 'Arrays',
  arrays: 'Arrays',
  string: 'Strings',
  strings: 'Strings',
  recursion: 'Recursion',
  dp: 'Dynamic Programming',
  linkedlist: 'Linked List',
  graph: 'Graphs & Matrix',
  matrix: 'Graphs & Matrix',
};

const TOPIC_TO_TAG_MAP = {
  'Mathematics': 'math',
  'Arrays': 'array',
  'Strings': 'string',
  'Recursion': 'recursion',
  'Dynamic Programming': 'dp',
  'Linked List': 'linkedList',
  'Graphs & Matrix': 'graph',
};

/**
 * ProblemsPage Component
 * Renders the user's authentic questions grouped by topic and difficulty tier.
 */
function ProblemsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // View state: 'list' | 'grid'
  const [viewMode, setViewMode] = useState('list');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedSort, setSelectedSort] = useState('default');

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null);

  // Live problems & Solved state from MongoDB API
  const [liveProblems, setLiveProblems] = useState(BASE_PROBLEMS_DATA);
  const [solvedIds, setSolvedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProblems, setTotalProblems] = useState(BASE_PROBLEMS_DATA.length);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const reqIdRef = useRef(0);

  // Accordion state:
  // Level 1: Topic expanded (default: Mathematics and Arrays open)
  const [expandedTopics, setExpandedTopics] = useState({
    Mathematics: true,
    Arrays: true,
  });

  // Level 2: Difficulty expanded (default: Mathematics-Easy and Arrays-Easy open)
  const [expandedDifficulties, setExpandedDifficulties] = useState({
    'Mathematics-Easy': true,
    'Arrays-Easy': true,
  });

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', icon: 'ℹ' });

  const triggerToast = (message, icon = 'ℹ') => {
    setToast({ show: true, message, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2800);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  // Debounce search input (300 ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedTopic, selectedDifficulty, selectedSort]);

  // Fetch paginated & filtered problems from MongoDB API
  useEffect(() => {
    const currentReqId = ++reqIdRef.current;

    const fetchProblems = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 20,
          sort: selectedSort === 'alpha' ? 'title' : 'newest',
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (selectedDifficulty !== 'All') {
          params.difficulty = selectedDifficulty.toLowerCase();
        }

        if (selectedTopic !== 'All') {
          params.tag = TOPIC_TO_TAG_MAP[selectedTopic] || selectedTopic.toLowerCase();
        }

        const { data } = await axiosClient.get('/problem/list', { params });

        // Request race check: ignore stale response
        if (currentReqId !== reqIdRef.current) return;

        if (data && Array.isArray(data.problems)) {
          const merged = data.problems.map((apiP) => {
            const foundMeta = BASE_PROBLEMS_DATA.find(
              (bp) =>
                bp._id === apiP._id ||
                bp.title?.toLowerCase().trim() ===
                  apiP.title?.toLowerCase().trim()
            );

            let topicName = 'Arrays';
            if (foundMeta?.topic) {
              topicName = foundMeta.topic;
            } else if (apiP.tags) {
              const primaryTag = String(apiP.tags).split(',')[0].toLowerCase().trim();
              topicName = TOPIC_TAG_MAP[primaryTag] || 'Arrays';
            }

            return {
              _id: apiP._id,
              title: apiP.title,
              difficulty: (apiP.difficulty || 'easy').toLowerCase(),
              tags: apiP.tags || 'general',
              topic: topicName,
              secondaryTopic: foundMeta?.secondaryTopic,
              companies: foundMeta?.companies || ['Amazon', 'Microsoft'],
              submissions: foundMeta?.submissions || '120.5k',
              submissionsVal: foundMeta?.submissionsVal || 120500,
              accuracy: foundMeta?.accuracy || '54.2%',
              accuracyVal: foundMeta?.accuracyVal || 54.2,
            };
          });

          setLiveProblems(merged);
          setTotalProblems(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        if (currentReqId === reqIdRef.current) {
          console.error('Failed to fetch problems from /problem/list:', err);
        }
      } finally {
        if (currentReqId === reqIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProblems();
  }, [page, debouncedSearch, selectedTopic, selectedDifficulty, selectedSort]);

  // Fetch solved problems by logged in user
  useEffect(() => {
    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        if (Array.isArray(data)) {
          setSolvedIds(data.map((sp) => sp._id));
        }
      } catch {
        // Guest user or not logged in
      }
    };

    if (user) {
      fetchSolvedProblems();
    } else {
      setSolvedIds([]);
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.dropdown-filter-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // When search query is entered, auto-expand matching topics and tiers
  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const newTopics = {};
      const newDiffs = {};

      liveProblems.forEach((p) => {
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesTopic = p.topic.toLowerCase().includes(q);
        const matchesCompany = p.companies.some((c) =>
          c.toLowerCase().includes(q)
        );

        if (matchesTitle || matchesTopic || matchesCompany) {
          newTopics[p.topic] = true;
          const diffCap =
            p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1);
          newDiffs[`${p.topic}-${diffCap}`] = true;
        }
      });

      setExpandedTopics((prev) => ({ ...prev, ...newTopics }));
      setExpandedDifficulties((prev) => ({ ...prev, ...newDiffs }));
    }
  }, [searchQuery, liveProblems]);

  // Toggle Level 1 Topic
  const toggleTopic = (topicName) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicName]: !prev[topicName],
    }));
  };

  // Toggle Level 2 Difficulty Tier
  const toggleDifficulty = (topicName, diffName) => {
    const key = `${topicName}-${diffName}`;
    setExpandedDifficulties((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Navigate to problem compiler arena with real MongoDB ID
  const handleProblemClick = (problem) => {
    navigate(`/problem/${problem._id}`);
  };

  // Group problems into 3-level hierarchy (Topic -> Difficulty -> Problems)
  const hierarchicalTopics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // 1. Filter problems
    const filteredProblems = liveProblems.filter((p) => {
      // Topic filter
      if (selectedTopic !== 'All' && p.topic !== selectedTopic) {
        return false;
      }
      // Difficulty filter
      if (
        selectedDifficulty !== 'All' &&
        p.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()
      ) {
        return false;
      }
      // Company filter
      if (
        selectedCompany !== 'All' &&
        !p.companies.some(
          (c) => c.toLowerCase() === selectedCompany.toLowerCase()
        )
      ) {
        return false;
      }
      // Search Query
      if (q) {
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesTopic = p.topic.toLowerCase().includes(q);
        const matchesCompany = p.companies.some((c) =>
          c.toLowerCase().includes(q)
        );
        return matchesTitle || matchesTopic || matchesCompany;
      }
      return true;
    });

    // 2. Sort problems
    if (selectedSort === 'acc-high') {
      filteredProblems.sort((a, b) => b.accuracyVal - a.accuracyVal);
    } else if (selectedSort === 'acc-low') {
      filteredProblems.sort((a, b) => a.accuracyVal - b.accuracyVal);
    } else if (selectedSort === 'sub-high') {
      filteredProblems.sort((a, b) => b.submissionsVal - a.submissionsVal);
    } else if (selectedSort === 'alpha') {
      filteredProblems.sort((a, b) => a.title.localeCompare(b.title));
    }

    // 3. Group by Topic
    const topicMap = {};

    // Initialize all topics
    TOPIC_ORDER.forEach((tName) => {
      topicMap[tName] = {
        name: tName,
        problems: [],
        difficulties: {
          Easy: [],
          Medium: [],
          Hard: [],
        },
      };
    });

    filteredProblems.forEach((prob) => {
      const tName = prob.topic || 'Arrays';
      if (!topicMap[tName]) {
        topicMap[tName] = {
          name: tName,
          problems: [],
          difficulties: { Easy: [], Medium: [], Hard: [] },
        };
      }

      // Add to primary topic
      topicMap[tName].problems.push(prob);
      const diffCap =
        prob.difficulty === 'hard'
          ? 'Hard'
          : prob.difficulty === 'medium'
          ? 'Medium'
          : 'Easy';

      if (!topicMap[tName].difficulties[diffCap]) {
        topicMap[tName].difficulties[diffCap] = [];
      }
      topicMap[tName].difficulties[diffCap].push(prob);

      // If problem has secondary topic and search/topic filter matches, include it too
      if (prob.secondaryTopic && topicMap[prob.secondaryTopic]) {
        topicMap[prob.secondaryTopic].problems.push(prob);
        topicMap[prob.secondaryTopic].difficulties[diffCap].push(prob);
      }
    });

    // Format into array, keeping only topics with problems if search or filter active
    const result = Object.values(topicMap)
      .map((t) => {
        const diffList = ['Easy', 'Medium', 'Hard'].map((diffName) => ({
          name: diffName,
          count: t.difficulties[diffName]?.length || 0,
          problems: t.difficulties[diffName] || [],
        }));

        return {
          name: t.name,
          totalCount: t.problems.length,
          difficulties: diffList,
        };
      })
      .filter((t) => {
        if (
          q ||
          selectedTopic !== 'All' ||
          selectedDifficulty !== 'All' ||
          selectedCompany !== 'All'
        ) {
          return t.totalCount > 0;
        }
        return t.totalCount > 0;
      });

    return result;
  }, [
    liveProblems,
    searchQuery,
    selectedTopic,
    selectedDifficulty,
    selectedCompany,
    selectedSort,
  ]);

  // Extract unique companies from real questions
  const availableCompanies = useMemo(() => {
    const set = new Set();
    liveProblems.forEach((p) => p.companies.forEach((c) => set.add(c)));
    return ['All', ...Array.from(set)];
  }, [liveProblems]);

  return (
    <div className="hero-grid min-h-screen flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900 text-slate-800 dark:text-slate-100">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-7">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                &lt;/&gt;
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Code<span className="text-blue-600 dark:text-blue-400">Quest</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-[13px] font-semibold text-slate-600 dark:text-slate-400">
              <Link
                to="/problems"
                className="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-1.5 py-4 border-b-2 border-blue-600 dark:border-blue-400"
              >
                <span>Problems</span>
              </Link>
              <Link
                to="/explore"
                className="hover:text-slate-900 dark:hover:text-white transition"
              >
                Explore
              </Link>
              <Link
                to="/compiler"
                className="hover:text-slate-900 dark:hover:text-white transition"
              >
                Playground
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3.5">
            {user ? (
              <>
                {/* Daily Streak Flame */}
                <div
                  title="Daily Problem Solving Streak"
                  className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/60 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold shadow-2xs select-none"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  <span className="font-mono">
                    {user?.streak || (solvedIds.length > 0 ? 1 : 0)}
                  </span>
                </div>

                {/* Profile Dropdown */}
                <ProfileDropdown
                  user={user}
                  onNavigate={(path) => navigate(path)}
                  onSettings={() => navigate('/settings')}
                  onAppearance={() => navigate('/settings?tab=appearance')}
                  onLogout={handleLogout}
                />
              </>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  state={{ from: '/problems' }}
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-semibold text-sm px-2.5 py-1.5 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  state={{ from: '/problems' }}
                  className="bg-[#2563eb] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN PROBLEMS DIRECTORY */}
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* ============================================================ */}
          {/* TITLE BAR                                                    */}
          {/* ============================================================ */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                All Problems
              </h1>

              {/* View Toggle (List vs Grid) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('grid');
                    triggerToast('Switched to Grid Topic Cards', '🔲');
                  }}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('list');
                    triggerToast('Switched to Nested Accordion List', '📋');
                  }}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Problems Count Pill */}
            <div className="inline-flex items-center px-3.5 py-1 bg-slate-100/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full">
              <span className="text-xs font-black tracking-wider text-slate-600 dark:text-slate-300 uppercase font-mono">
                {totalProblems} PROBLEMS
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* FILTER & SEARCH TOOLBAR                                      */}
          {/* ============================================================ */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center gap-3">
            {/* 1. Live Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by problem name, topic, or company..."
                className="w-full pl-10 pr-9 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters Container */}
            <div className="dropdown-filter-container flex flex-wrap items-center gap-2.5">
              {/* 2. Topic Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'topic' ? null : 'topic')
                  }
                  className={`inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                    selectedTopic !== 'All'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedTopic === 'All' ? 'Topic' : selectedTopic}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === 'topic' && (
                  <div className="absolute top-full mt-1.5 left-0 z-30 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 text-xs font-medium space-y-0.5 max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTopic('All');
                        setOpenDropdown(null);
                        triggerToast('Showing all topics');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                    >
                      <span>All Topics</span>
                      {selectedTopic === 'All' && (
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </button>
                    {TOPIC_ORDER.map((tName) => (
                      <button
                        key={tName}
                        type="button"
                        onClick={() => {
                          setSelectedTopic(tName);
                          setExpandedTopics((prev) => ({
                            ...prev,
                            [tName]: true,
                          }));
                          setOpenDropdown(null);
                          triggerToast(`Topic: ${tName}`, '📁');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                      >
                        <span>{tName}</span>
                        {selectedTopic === tName && (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Difficulty Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'diff' ? null : 'diff')
                  }
                  className={`inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                    selectedDifficulty !== 'All'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {selectedDifficulty === 'All'
                      ? 'Difficulty'
                      : selectedDifficulty}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === 'diff' && (
                  <div className="absolute top-full mt-1.5 left-0 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 text-xs font-medium space-y-0.5">
                    {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => {
                          setSelectedDifficulty(diff);
                          setOpenDropdown(null);
                          triggerToast(
                            diff === 'All'
                              ? 'Showing all difficulties'
                              : `Difficulty: ${diff}`,
                            '📊'
                          );
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                      >
                        <span>{diff === 'All' ? 'All Difficulties' : diff}</span>
                        {selectedDifficulty === diff && (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Company Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'comp' ? null : 'comp')
                  }
                  className={`inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                    selectedCompany !== 'All'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {selectedCompany === 'All' ? 'Company' : selectedCompany}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {openDropdown === 'comp' && (
                  <div className="absolute top-full mt-1.5 left-0 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 text-xs font-medium space-y-0.5 max-h-60 overflow-y-auto">
                    {availableCompanies.map((comp) => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => {
                          setSelectedCompany(comp);
                          setOpenDropdown(null);
                          triggerToast(
                            comp === 'All'
                              ? 'Showing all companies'
                              : `Filtered by ${comp}`,
                            '🏢'
                          );
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                      >
                        <span>{comp === 'All' ? 'All Companies' : comp}</span>
                        {selectedCompany === comp && (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Sort Dropdown (With Green Indicator Dot) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'sort' ? null : 'sort')
                  }
                  className="relative inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-emerald-600/90 dark:border-emerald-500 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition shadow-2xs cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Sort</span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                </button>

                {openDropdown === 'sort' && (
                  <div className="absolute top-full mt-1.5 right-0 z-30 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 text-xs font-medium space-y-0.5">
                    {[
                      { id: 'default', label: 'Default Order' },
                      { id: 'acc-high', label: 'Accuracy: High to Low' },
                      { id: 'acc-low', label: 'Accuracy: Low to High' },
                      { id: 'sub-high', label: 'Most Submissions' },
                      { id: 'alpha', label: 'Problem Title (A-Z)' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSort(s.id);
                          setOpenDropdown(null);
                          triggerToast(`Sorted: ${s.label}`, '📊');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                      >
                        <span>{s.label}</span>
                        {selectedSort === s.id && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset Filters */}
              {(selectedTopic !== 'All' ||
                selectedDifficulty !== 'All' ||
                selectedCompany !== 'All' ||
                searchQuery ||
                selectedSort !== 'default') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic('All');
                    setSelectedDifficulty('All');
                    setSelectedCompany('All');
                    setSelectedSort('default');
                    setSearchQuery('');
                    triggerToast('All filters reset', '🔄');
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* TABLE COLUMN HEADER STRIP (List View)                        */}
          {/* ============================================================ */}
          {viewMode === 'list' && (
            <div className="hidden sm:grid grid-cols-12 px-6 py-3 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase select-none">
              <div className="col-span-1">STATUS</div>
              <div className="col-span-5">PROBLEM</div>
              <div className="col-span-3">COMPANIES</div>
              <div className="col-span-2 text-right">SUBMISSIONS</div>
              <div className="col-span-1 text-right">ACCURACY</div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3-LEVEL HIERARCHICAL ACCORDION LIST                          */}
          {/* ============================================================ */}
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <span className="loading loading-spinner loading-lg text-blue-600"></span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading problems...</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {hierarchicalTopics.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400 text-sm font-semibold">
                    No problems match your filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTopic('All');
                      setSelectedDifficulty('All');
                      setSelectedCompany('All');
                    }}
                    className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                hierarchicalTopics.map((topic) => {
                  const isTopicOpen = !!expandedTopics[topic.name];

                  return (
                    <div key={topic.name} className="topic-block">
                      {/* LEVEL 1: MAIN TOPIC ROW */}
                      <button
                        type="button"
                        onClick={() => toggleTopic(topic.name)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {isTopicOpen ? (
                            <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-300 transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-transform" />
                          )}
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {topic.name}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                          {topic.totalCount} {topic.totalCount === 1 ? 'Problem' : 'Problems'}
                        </span>
                      </button>

                      {/* LEVEL 2: DIFFICULTY SUB-TIERS */}
                      {isTopicOpen && (
                        <div className="bg-slate-50/40 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 pl-4 sm:pl-8">
                          {topic.difficulties
                            .filter((diff) => diff.count > 0)
                            .map((diff) => {
                              const diffKey = `${topic.name}-${diff.name}`;
                              const isDiffOpen =
                                expandedDifficulties[diffKey] !== false;

                              return (
                                <div key={diff.name}>
                                  {/* Difficulty Tier Header Button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleDifficulty(topic.name, diff.name)
                                    }
                                    className="w-full px-6 py-3.5 flex items-center justify-between hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition text-left group cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3">
                                      {isDiffOpen ? (
                                        <ChevronDown
                                          className={`w-4 h-4 transition-transform ${
                                            diff.name === 'Easy'
                                              ? 'text-emerald-600 dark:text-emerald-400'
                                              : diff.name === 'Medium'
                                              ? 'text-blue-600 dark:text-blue-400'
                                              : 'text-rose-600 dark:text-rose-400'
                                          }`}
                                        />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-transform" />
                                      )}
                                      <span
                                        className={`text-xs sm:text-sm ${
                                          isDiffOpen
                                            ? 'font-bold text-slate-900 dark:text-white'
                                            : 'font-semibold text-slate-700 dark:text-slate-300'
                                        }`}
                                      >
                                        {diff.name}
                                      </span>
                                    </div>
                                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                      {diff.count} {diff.count === 1 ? 'Problem' : 'Problems'}
                                    </span>
                                  </button>

                                  {/* LEVEL 3: CONCRETE PROBLEM ROWS */}
                                  {isDiffOpen && (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 pl-4">
                                      {diff.problems.map((problem) => {
                                        const isSolved = solvedIds.includes(
                                          problem._id
                                        );

                                        return (
                                          <div
                                            key={problem._id}
                                            onClick={() =>
                                              handleProblemClick(problem)
                                            }
                                            className="grid grid-cols-12 px-4 py-3 items-center hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition group cursor-pointer"
                                          >
                                            {/* Status Badge */}
                                            <div className="col-span-1">
                                              {isSolved ? (
                                                <span
                                                  title="Solved in MongoDB"
                                                  className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shadow-2xs"
                                                >
                                                  ✓
                                                </span>
                                              ) : (
                                                <span
                                                  title="Unsolved"
                                                  className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 inline-block"
                                                ></span>
                                              )}
                                            </div>

                                            {/* Problem Title */}
                                            <div className="col-span-5 font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition pr-2 truncate">
                                              {problem.title}
                                            </div>

                                            {/* Companies */}
                                            <div className="col-span-3 flex flex-wrap gap-1">
                                              {problem.companies.map((comp) => (
                                                <span
                                                  key={comp}
                                                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-400"
                                                >
                                                  {comp}
                                                </span>
                                              ))}
                                            </div>

                                            {/* Submissions */}
                                            <div className="col-span-2 text-right text-xs font-mono text-slate-500 dark:text-slate-400">
                                              {problem.submissions}
                                            </div>

                                            {/* Accuracy */}
                                            <div
                                              className={`col-span-1 text-right text-xs font-bold ${
                                                problem.accuracyVal >= 50
                                                  ? 'text-emerald-600 dark:text-emerald-400'
                                                  : 'text-slate-600 dark:text-slate-400'
                                              }`}
                                            >
                                              {problem.accuracy}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* ============================================================ */
            /* GRID VIEW CARDS MODE                                         */
            /* ============================================================ */
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hierarchicalTopics.map((topic) => (
                <div
                  key={topic.name}
                  className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">
                        {topic.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
                        {topic.totalCount} Qs
                      </span>
                    </div>

                    <div className="pt-3.5 space-y-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Difficulty Tiers:
                      </p>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-bold">
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl">
                          <span className="block text-emerald-600 dark:text-emerald-400">
                            Easy
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-mono">
                            {topic.difficulties.find((d) => d.name === 'Easy')
                              ?.count || 0}
                          </span>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-xl">
                          <span className="block text-blue-600 dark:text-blue-400">
                            Med
                          </span>
                          <span className="text-blue-700 dark:text-blue-300 font-mono">
                            {topic.difficulties.find((d) => d.name === 'Medium')
                              ?.count || 0}
                          </span>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-950/30 p-2 rounded-xl">
                          <span className="block text-rose-600 dark:text-rose-400">
                            Hard
                          </span>
                          <span className="text-rose-700 dark:text-rose-300 font-mono">
                            {topic.difficulties.find((d) => d.name === 'Hard')
                              ?.count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {topic.totalCount} Questions Available
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('list');
                        setSelectedTopic(topic.name);
                        setExpandedTopics((prev) => ({
                          ...prev,
                          [topic.name]: true,
                        }));
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing page <span className="font-bold text-slate-800 dark:text-slate-200">{page}</span> of{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{totalPages || 1}</span> ({totalProblems} {totalProblems === 1 ? 'problem' : 'problems'})
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1 || loading}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
                Page {page} of {totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages || 1))}
                disabled={page >= (totalPages || 1) || loading}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 3. TOAST NOTIFICATION */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center space-x-2.5 transform transition-all duration-300 border border-slate-700 ${
          toast.show
            ? 'translate-y-0 opacity-100'
            : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <span className="text-emerald-400 font-bold">{toast.icon}</span>
        <span className="font-semibold">{toast.message}</span>
      </div>
    </div>
  );
}

export default ProblemsPage;
