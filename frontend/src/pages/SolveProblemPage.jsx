import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import Editor from '@monaco-editor/react';
import {
  FileText,
  BookOpen,
  Users,
  History,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Send,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  RotateCcw,
  Maximize2,
  Minimize2,
  Wand2,
  Bookmark,
  Star,
  Braces,
  Lightbulb,
  Tag,
  Building2,
  Lock,
  Flame,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  MessageSquare,
  Code2,
} from 'lucide-react';
import axiosClient, { getApiErrorMessage } from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import ProblemDiscussion from '../components/discussion/ProblemDiscussion';
import ProfileDropdown from '../components/profile/ProfileDropdown';
import AuthPromptModal from '../components/AuthPromptModal';
import { normalizeTags, tagLabel } from '../utils/tags';
import FailedTestCaseCard from '../components/FailedTestCaseCard';

/**
 * Fallback Default Problem Specification (LeetCode #1614: Maximum Nesting Depth of the Parentheses)
 */
const DEFAULT_PROBLEM = {
  _id: 'default-1614',
  id: 1614,
  title: '1614. Maximum Nesting Depth of the Parentheses',
  difficulty: 'easy',
  tags: 'String, Stack',
  topics: ['String', 'Stack', 'Simulation'],
  companies: ['Amazon', 'Facebook', 'Bloomberg', 'Google'],
  hint: 'The depth of any character in the string is equal to the number of open parentheses before it minus the number of closed parentheses before it.',
  description: `Given a valid parentheses string \`s\`, return the **nesting depth** of \`s\`. The nesting depth is the maximum number of nested parentheses.

A string is a valid parentheses string (denoted **VPS**) if it meets any of the following:
- It is an empty string \`""\`, or a single character not equal to \`'('\` or \`')'\`,
- It can be written as \`AB\` (\`A\` concatenated with \`B\`), where \`A\` and \`B\` are VPS's, or
- It can be written as \`(A)\`, where \`A\` is a VPS.

We can similarly define the **nesting depth** \`depth(S)\` of any VPS \`S\` as follows:
- \`depth("") = 0\`
- \`depth(C) = 0\`, where \`C\` is a string with a single character not equal to \`'('\` or \`')'\`.
- \`depth(A + B) = max(depth(A), depth(B))\`, where \`A\` and \`B\` are VPS's.
- \`depth("(" + A + ")") = 1 + depth(A)\`, where \`A\` is a VPS.

For example, \`""\`, \`"()()"\`, and \`"()(()())"\` are VPS's (with nesting depths 0, 1, and 2), and \`")("\` and \`"(()"\` are not VPS's.`,
  visibleTestCases: [
    {
      input: 's = "(1+(2*3)+((8)/4))+1"',
      output: '3',
      explanation: 'Digit 8 is inside of 3 nested parentheses in the string.',
    },
    {
      input: 's = "(1)+((2))+(((3)))"',
      output: '3',
      explanation: 'Digit 3 is inside 3 nested parentheses in the string.',
    },
    {
      input: 's = "()(())((()))"',
      output: '3',
      explanation: 'The deepest nested segment has depth 3.',
    },
  ],
  constraints: [
    '1 <= s.length <= 100',
    "s consists of digits 0-9 and characters '+', '-', '*', '/', '(', and ')'.",
    "It is guaranteed that parentheses expression s is a valid parentheses string.",
  ],
  startCode: [
    {
      language: 'JavaScript',
      initialCode: `/**
 * @param {string} s
 * @return {number}
 */
var maxDepth = function(s) {
    let currentDepth = 0;
    let maxDepth = 0;
    
    for (let char of s) {
        if (char === '(') {
            currentDepth++;
            if (currentDepth > maxDepth) {
                maxDepth = currentDepth;
            }
        } else if (char === ')') {
            currentDepth--;
        }
    }
    
    return maxDepth;
};`,
    },
    {
      language: 'C++',
      initialCode: `class Solution {
public:
    int maxDepth(string s) {
        int currentDepth = 0;
        int maxDepthVal = 0;
        
        for (char c : s) {
            if (c == '(') {
                currentDepth++;
                maxDepthVal = max(maxDepthVal, currentDepth);
            } else if (c == ')') {
                currentDepth--;
            }
        }
        
        return maxDepthVal;
    }
};`,
    },
    {
      language: 'Java',
      initialCode: `class Solution {
    public int maxDepth(String s) {
        int currentDepth = 0;
        int maxDepth = 0;
        
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(') {
                currentDepth++;
                if (currentDepth > maxDepth) {
                    maxDepth = currentDepth;
                }
            } else if (c == ')') {
                currentDepth--;
            }
        }
        
        return maxDepth;
    }
}`,
    },
    {
      language: 'Python3',
      initialCode: `class Solution:
    def maxDepth(self, s: str) -> int:
        current_depth = 0
        max_depth = 0
        
        for char in s:
            if char == '(':
                current_depth += 1
                max_depth = max(max_depth, current_depth)
            elif char == ')':
                current_depth -= 1
                
        return max_depth`,
    },
  ],
};

const LANG_CONFIG = {
  javascript: { label: 'JavaScript', monaco: 'javascript', ext: 'js' },
  cpp: { label: 'C++', monaco: 'cpp', ext: 'cpp' },
  java: { label: 'Java', monaco: 'java', ext: 'java' },
  python3: { label: 'Python3', monaco: 'python', ext: 'py' },
};

/**
 * Helper to compute possible localStorage keys for drafts
 * Format: codequest_draft_${problemIdOrSlug}_${language}
 */
const getDraftKeys = (problem, routeId, langKey) => {
  const ids = [];
  if (problem?.slug) ids.push(problem.slug);
  if (problem?._id && String(problem._id) !== problem?.slug) ids.push(String(problem._id));
  if (routeId && !ids.includes(routeId)) ids.push(routeId);
  if (ids.length === 0) ids.push('default-1614');

  const langVariants = [];
  if (langKey) {
    langVariants.push(langKey);
    const label = LANG_CONFIG[langKey]?.label;
    if (label && !langVariants.includes(label)) langVariants.push(label);
  }

  const keys = [];
  for (const id of ids) {
    for (const lv of langVariants) {
      keys.push(`codequest_draft_${id}_${lv}`);
    }
  }
  return keys;
};

const loadSavedDraft = (problem, routeId, langKey) => {
  try {
    const keys = getDraftKeys(problem, routeId, langKey);
    for (const k of keys) {
      const val = localStorage.getItem(k);
      if (val !== null && val !== undefined) {
        return val;
      }
    }
  } catch (err) {
    console.warn('Failed to load draft from localStorage:', err);
  }
  return null;
};

const saveDraftToStorage = (problem, routeId, langKey, codeContent) => {
  if (codeContent === undefined || codeContent === null) return;
  try {
    const primaryId = problem?.slug || problem?._id || routeId || 'default-1614';
    const label = LANG_CONFIG[langKey]?.label || langKey;

    localStorage.setItem(`codequest_draft_${primaryId}_${langKey}`, codeContent);
    if (label && label !== langKey) {
      localStorage.setItem(`codequest_draft_${primaryId}_${label}`, codeContent);
    }

    if (problem?.slug && problem?._id && String(problem._id) !== problem.slug) {
      localStorage.setItem(`codequest_draft_${problem._id}_${langKey}`, codeContent);
      if (label && label !== langKey) {
        localStorage.setItem(`codequest_draft_${problem._id}_${label}`, codeContent);
      }
    }
  } catch (err) {
    console.warn('Failed to save draft to localStorage:', err);
  }
};

const clearDraftFromStorage = (problem, routeId, langKey) => {
  try {
    const keys = getDraftKeys(problem, routeId, langKey);
    for (const k of keys) {
      localStorage.removeItem(k);
    }
  } catch (err) {
    console.warn('Failed to clear draft from localStorage:', err);
  }
};

const getStarterCode = (prob, lang) => {
  if (!prob) return '';
  const langLabel = LANG_CONFIG[lang]?.label || lang || 'JavaScript';
  const found = prob?.startCode?.find(
    (sc) =>
      sc.language?.toLowerCase() === lang.toLowerCase() ||
      sc.language?.toLowerCase() === langLabel.toLowerCase()
  );
  if (found && found.initialCode) {
    return found.initialCode;
  }
  if (lang === 'javascript') {
    return `/**\n * Solution\n */\nfunction solve(input) {\n    // Write your code here\n    return 0;\n}`;
  } else if (lang === 'cpp') {
    return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int solve() {\n        return 0;\n    }\n};`;
  } else if (lang === 'java') {
    return `class Solution {\n    public int solve() {\n        // Write code here\n        return 0;\n    }\n}`;
  } else {
    return `class Solution:\n    def solve(self) -> int:\n        # Write code here\n        return 0`;
  }
};

/**
 * Left Pane Skeleton: Sleek LeetCode-style dark animated placeholder
 */
function ProblemDescriptionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Title & Status Badge Skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="h-7 w-3/4 max-w-sm bg-zinc-800/80 rounded-lg"></div>
        <div className="h-6 w-16 bg-zinc-800/60 rounded-full"></div>
      </div>

      {/* Action Badges Row Skeleton */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-zinc-800/80 pb-4">
        <div className="h-6 w-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full"></div>
        <div className="h-6 w-20 bg-zinc-800/70 border border-zinc-700/60 rounded-full"></div>
        <div className="h-6 w-24 bg-zinc-800/70 border border-zinc-700/60 rounded-full"></div>
        <div className="h-6 w-16 bg-zinc-800/70 border border-zinc-700/60 rounded-full ml-auto"></div>
      </div>

      {/* Problem Description Body Lines */}
      <div className="space-y-2.5 pt-1">
        <div className="h-4 w-full bg-zinc-800/60 rounded"></div>
        <div className="h-4 w-11/12 bg-zinc-800/60 rounded"></div>
        <div className="h-4 w-4/5 bg-zinc-800/60 rounded"></div>
        <div className="h-4 w-2/3 bg-zinc-800/60 rounded"></div>
        <div className="h-4 w-5/6 bg-zinc-800/60 rounded"></div>
      </div>

      {/* Examples Section Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="h-4 w-24 bg-zinc-800/80 rounded"></div>

        {/* Example Card 1 */}
        <div className="bg-zinc-900/80 border-l-2 border-zinc-700/80 pl-4 pr-4 py-3 rounded-r-xl space-y-2.5">
          <div className="h-3.5 w-20 bg-zinc-800/80 rounded"></div>
          <div className="h-3.5 w-3/5 bg-zinc-800/60 rounded"></div>
          <div className="h-3.5 w-1/4 bg-zinc-800/60 rounded"></div>
          <div className="h-3.5 w-2/3 bg-zinc-800/60 rounded"></div>
        </div>

        {/* Example Card 2 */}
        <div className="bg-zinc-900/80 border-l-2 border-zinc-700/80 pl-4 pr-4 py-3 rounded-r-xl space-y-2.5">
          <div className="h-3.5 w-20 bg-zinc-800/80 rounded"></div>
          <div className="h-3.5 w-1/2 bg-zinc-800/60 rounded"></div>
          <div className="h-3.5 w-1/4 bg-zinc-800/60 rounded"></div>
        </div>
      </div>

      {/* Constraints Section Skeleton */}
      <div className="space-y-2.5 pt-3 border-t border-zinc-800/80">
        <div className="h-4 w-28 bg-zinc-800/80 rounded"></div>
        <div className="space-y-2 pl-2">
          <div className="h-3.5 w-3/5 bg-zinc-800/50 rounded"></div>
          <div className="h-3.5 w-4/5 bg-zinc-800/50 rounded"></div>
          <div className="h-3.5 w-1/2 bg-zinc-800/50 rounded"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Right Pane Skeleton: Sleek Monaco-style dark code editor & console placeholder
 */
function ProblemRightPaneSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Editor Top Bar Placeholder */}
      <div className="h-10 bg-[#1c1c1f] border-b border-zinc-800/80 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-zinc-800/60 px-2.5 py-1 rounded-md border border-zinc-700/60">
            <Braces className="w-3.5 h-3.5" />
            <span>Code</span>
          </div>
          <div className="h-6 w-24 bg-zinc-800/80 rounded-md animate-pulse"></div>
          <div className="h-4 w-12 bg-zinc-800/50 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 bg-zinc-800/60 rounded animate-pulse"></div>
          <div className="w-6 h-6 bg-zinc-800/60 rounded animate-pulse"></div>
          <div className="w-6 h-6 bg-zinc-800/60 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Editor Code Area Skeleton */}
      <div className="flex-1 bg-[#1e1e1e] flex p-4 font-mono text-xs overflow-hidden">
        {/* Line Numbers Gutter */}
        <div className="text-zinc-700 space-y-3.5 pr-4 border-r border-zinc-800/70 select-none text-right font-mono text-[11px]">
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
          <div>6</div>
          <div>7</div>
          <div>8</div>
          <div>9</div>
          <div>10</div>
          <div>11</div>
          <div>12</div>
        </div>

        {/* Pulsing Code Lines Skeleton */}
        <div className="flex-1 pl-4 space-y-3.5 animate-pulse">
          <div className="h-3.5 w-36 bg-zinc-800/70 rounded"></div>
          <div className="h-3.5 w-56 bg-zinc-800/80 rounded"></div>
          <div className="h-3.5 w-28 bg-zinc-800/50 rounded ml-4"></div>
          <div className="h-3.5 w-64 bg-zinc-800/70 rounded ml-4"></div>
          <div className="h-3.5 w-44 bg-zinc-800/60 rounded ml-8"></div>
          <div className="h-3.5 w-52 bg-zinc-800/60 rounded ml-8"></div>
          <div className="h-3.5 w-32 bg-zinc-800/50 rounded ml-8"></div>
          <div className="h-3.5 w-20 bg-zinc-800/60 rounded ml-4"></div>
          <div className="h-3.5 w-28 bg-zinc-800/70 rounded ml-4"></div>
          <div className="h-3.5 w-10 bg-zinc-800/70 rounded"></div>
        </div>
      </div>

      {/* Editor Status Strip Skeleton */}
      <div className="h-6 bg-[#18181b] border-t border-zinc-800/80 px-3 flex items-center justify-between text-[11px] shrink-0">
        <div className="h-3 w-14 bg-zinc-800/60 rounded animate-pulse"></div>
        <div className="h-3 w-20 bg-zinc-800/60 rounded animate-pulse"></div>
      </div>

      {/* Bottom Console Drawer Skeleton */}
      <div className="h-44 bg-[#1a1a1e] border-t border-zinc-800/90 flex flex-col shrink-0">
        {/* Drawer Header */}
        <div className="h-8 bg-[#1c1c1f] border-b border-zinc-800/80 px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-16 bg-zinc-800/70 rounded animate-pulse"></div>
            <div className="h-5 w-20 bg-zinc-800/50 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Drawer Content Skeleton */}
        <div className="flex-1 p-3 space-y-2.5 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-16 bg-zinc-800/80 rounded-md"></div>
            <div className="h-6 w-16 bg-zinc-800/60 rounded-md"></div>
          </div>
          <div className="h-14 bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-2.5">
            <div className="h-3.5 w-1/2 bg-zinc-800/60 rounded"></div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="h-11 bg-[#1c1c1f] border-t border-zinc-800/80 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Console</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled
              className="px-4 py-1.5 bg-zinc-800/60 text-zinc-500 text-xs font-semibold rounded-lg border border-zinc-700/50 cursor-not-allowed flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run</span>
            </button>
            <button
              disabled
              className="px-5 py-1.5 bg-emerald-600/40 text-emerald-200/50 text-xs font-bold rounded-lg cursor-not-allowed flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SolveProblemPage Component
 * Full-screen Split-Pane Coding Workspace inspired by LeetCode's modern dark IDE.
 */
function SolveProblemPage() {
  const params = useParams();
  const routeIdentifier = params.slug || params.id || params.problemId;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});

  // Auth modal state for unauthenticated guest actions
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: 'Sign in to Run & Submit Code',
    subtitle:
      'Create a free account or log in to compile solutions, test against edge cases, and save your practice streak.',
  });

  const triggerAuthModal = (title, subtitle) => {
    setAuthModalConfig({
      title: title || 'Sign in to Run & Submit Code',
      subtitle:
        subtitle ||
        'Create a free account or log in to compile solutions, test against edge cases, and save your practice streak.',
    });
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  // Problem & Data States (Initialized as null to prevent flashing default problem data)
  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [isSolved, setIsSolved] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [mobileActiveView, setMobileActiveView] = useState('description'); // 'description' | 'editor'

  // Dynamic document title based on problem
  useEffect(() => {
    if (problem?.title) {
      document.title = `${problem.title} | CodeQuest`;
    } else {
      document.title = 'Solve Problem | CodeQuest';
    }
  }, [problem?.title]);

  // Left Pane Tabs: 'description' | 'editorial' | 'solutions' | 'submissions' | 'chatai'
  const [activeLeftTab, setActiveLeftTab] = useState('description');

  // Hint & Metadata accordions
  const [showHint, setShowHint] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);

  // Right Pane: Code Editor States
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [code, setCode] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const editorRef = useRef(null);
  const codeRef = useRef(code);
  const selectedLangRef = useRef(selectedLang);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    selectedLangRef.current = selectedLang;
  }, [selectedLang]);

  // Ensure un-debounced changes are saved before navigating or refreshing
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (codeRef.current !== undefined && codeRef.current !== null) {
        saveDraftToStorage(problem, routeIdentifier, selectedLang, codeRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (codeRef.current !== undefined && codeRef.current !== null) {
        saveDraftToStorage(problem, routeIdentifier, selectedLang, codeRef.current);
      }
    };
  }, [problem, routeIdentifier, selectedLang]);

  // Bottom Console / Testcase Drawer
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleTab, setConsoleTab] = useState('testcase'); // 'testcase' | 'custom' | 'result'
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState('');

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '', icon: 'ℹ' });

  const triggerToast = (message, icon = 'ℹ') => {
    setToast({ show: true, message, icon });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2800);
  };

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Sync bookmark status when problem or user changes
  useEffect(() => {
    let isMounted = true;
    const fetchBookmarkStatus = async () => {
      if (!user || !problem?._id || problem._id === 'default-1614') {
        if (isMounted) setIsBookmarked(false);
        return;
      }
      try {
        const { data } = await axiosClient.get('/user/bookmarks');
        if (isMounted && data?.success && Array.isArray(data.bookmarks)) {
          const match = data.bookmarks.some((b) => {
            const id = typeof b === 'object' && b?._id ? String(b._id) : String(b);
            return id === String(problem._id);
          });
          setIsBookmarked(match);
        }
      } catch {
        // Guest or error
      }
    };
    fetchBookmarkStatus();
    return () => {
      isMounted = false;
    };
  }, [user, problem?._id]);

  // Toggle bookmark handler
  const handleToggleBookmark = async () => {
    if (!user) {
      triggerAuthModal(
        'Sign in to Bookmark Problems',
        'Save challenging questions to your personal library and revisit them anytime.'
      );
      return;
    }
    if (!problem?._id || problem._id === 'default-1614') {
      triggerToast('Cannot bookmark default demo problem', '⚠️');
      return;
    }

    const previous = isBookmarked;
    setIsBookmarked(!previous); // Optimistic

    try {
      const { data } = await axiosClient.post(`/problem/${problem._id}/bookmark`);
      if (data?.success) {
        setIsBookmarked(data.bookmarked);
        triggerToast(
          data.bookmarked ? 'Problem added to bookmarks' : 'Problem removed from bookmarks',
          data.bookmarked ? '⭐' : '🗑️'
        );
      } else {
        setIsBookmarked(previous);
      }
    } catch (err) {
      setIsBookmarked(previous);
      triggerToast(err.response?.data?.message || 'Failed to update bookmark', '❌');
    }
  };

  // 1. Fetch Problem from MongoDB API or fallback
  useEffect(() => {
    let isMounted = true;
    setLoadingProblem(true);
    setProblem(null);
    setCode('');

    const fetchProblem = async () => {
      try {
        const currentLang = selectedLangRef.current || 'javascript';

        if (!routeIdentifier || routeIdentifier === 'default-1614') {
          if (!isMounted) return;
          setProblem(DEFAULT_PROBLEM);
          const savedDraft = loadSavedDraft(DEFAULT_PROBLEM, routeIdentifier, currentLang);
          const initial = savedDraft !== null && savedDraft !== undefined
            ? savedDraft
            : getStarterCode(DEFAULT_PROBLEM, currentLang);
          setCode(initial);
          codeRef.current = initial;
          setCustomInput(DEFAULT_PROBLEM.visibleTestCases?.[0]?.input || '');
          setLoadingProblem(false);
          return;
        }

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(routeIdentifier);
        const endpoint = isObjectId
          ? `/problem/problemById/${routeIdentifier}`
          : `/problem/bySlug/${routeIdentifier}`;

        const response = await axiosClient.get(endpoint);
        if (!isMounted) return;

        if (response.data) {
          const apiProblem = response.data;
          const cleanTags = normalizeTags(apiProblem.tags);
          const formattedProblem = {
            ...DEFAULT_PROBLEM,
            ...apiProblem,
            _id: apiProblem._id,
            problemNumber: apiProblem.problemNumber,
            slug: apiProblem.slug,
            constraints: apiProblem.constraints != null ? apiProblem.constraints : '',
            timeLimit: apiProblem.timeLimit != null ? apiProblem.timeLimit : 2000,
            memoryLimit: apiProblem.memoryLimit != null ? apiProblem.memoryLimit : 256000,
            tags: cleanTags,
            topics: cleanTags.length > 0 ? cleanTags.map(tagLabel) : ['Algorithms', 'Data Structures'],
            companies: apiProblem.companies || ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
            hint:
              apiProblem.hint ||
              'Think about the optimal data structure, frequency counting, or two-pointer approach.',
          };
          setProblem(formattedProblem);
          const savedDraft = loadSavedDraft(formattedProblem, routeIdentifier, currentLang);
          const initial = savedDraft !== null && savedDraft !== undefined
            ? savedDraft
            : getStarterCode(formattedProblem, currentLang);
          setCode(initial);
          codeRef.current = initial;
          setCustomInput(formattedProblem.visibleTestCases?.[0]?.input || '');

          // Check if user solved this problem
          try {
            const { data } = await axiosClient.get('/problem/problemSolvedByUser');
            if (isMounted && Array.isArray(data)) {
              const solved = data.some((sp) => sp._id === apiProblem._id);
              setIsSolved(solved);
              setStreakCount(data.length > 0 ? 1 : 0);
            }
          } catch {
            // guest or unauthenticated
          }
        } else {
          setProblem(DEFAULT_PROBLEM);
          const savedDraft = loadSavedDraft(DEFAULT_PROBLEM, routeIdentifier, currentLang);
          const initial = savedDraft !== null && savedDraft !== undefined
            ? savedDraft
            : getStarterCode(DEFAULT_PROBLEM, currentLang);
          setCode(initial);
          codeRef.current = initial;
          setCustomInput(DEFAULT_PROBLEM.visibleTestCases?.[0]?.input || '');
        }
      } catch (err) {
        console.warn('Could not fetch problem from API, fallback to default workspace:', err);
        if (isMounted) {
          const currentLang = selectedLangRef.current || 'javascript';
          setProblem(DEFAULT_PROBLEM);
          const savedDraft = loadSavedDraft(DEFAULT_PROBLEM, routeIdentifier, currentLang);
          const initial = savedDraft !== null && savedDraft !== undefined
            ? savedDraft
            : getStarterCode(DEFAULT_PROBLEM, currentLang);
          setCode(initial);
          codeRef.current = initial;
          setCustomInput(DEFAULT_PROBLEM.visibleTestCases?.[0]?.input || '');
        }
      } finally {
        if (isMounted) {
          setLoadingProblem(false);
        }
      }
    };

    fetchProblem();

    return () => {
      isMounted = false;
    };
  }, [routeIdentifier]);

  // Handle code changes from Monaco editor with debounced auto-save
  const handleCodeChange = (newVal) => {
    const val = newVal || '';
    setCode(val);
    codeRef.current = val;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setIsSavingDraft(true);
    saveTimeoutRef.current = setTimeout(() => {
      saveDraftToStorage(problem, routeIdentifier, selectedLang, val);
      setIsSavingDraft(false);
    }, 400);
  };

  // Switch Language with instant auto-save and draft loading
  const handleLanguageChange = (langKey) => {
    if (langKey === selectedLang) {
      setIsLangDropdownOpen(false);
      return;
    }

    // 1. Immediately persist current code before switching
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      setIsSavingDraft(false);
    }
    if (codeRef.current !== undefined && codeRef.current !== null) {
      saveDraftToStorage(problem, routeIdentifier, selectedLang, codeRef.current);
    }

    // 2. Switch language
    setSelectedLang(langKey);
    setIsLangDropdownOpen(false);

    // 3. Load saved draft for new language, or fallback to starter code
    const draft = loadSavedDraft(problem, routeIdentifier, langKey);
    const nextCode = draft !== null && draft !== undefined ? draft : getStarterCode(problem, langKey);
    setCode(nextCode);
    codeRef.current = nextCode;

    triggerToast(`Switched language to ${LANG_CONFIG[langKey]?.label || langKey}`, '⚡');
  };

  // Reset Code to default template
  const handleResetClick = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      setIsSavingDraft(false);
    }
    clearDraftFromStorage(problem, routeIdentifier, selectedLang);
    const defaultTemplate = getStarterCode(problem, selectedLang);
    setCode(defaultTemplate);
    codeRef.current = defaultTemplate;
    setShowResetModal(false);
    triggerToast(`Reset ${LANG_CONFIG[selectedLang]?.label || selectedLang} to default template`, '🔄');
  };

  // Format Code Helper
  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      triggerToast('Code formatted', '✨');
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    triggerToast('Copied to clipboard!', '📋');
  };

  // 2. Handle Code Execution (Run)
  const handleRun = async () => {
    if (!user) {
      triggerAuthModal(
        'Sign in to Run & Submit Code',
        'Create a free account or log in to compile solutions, test against edge cases, and save your practice streak.'
      );
      return;
    }

    if (!problem) return;

    if (code && code.length > 64000) {
      triggerToast('Code is too large (max 64 KB)', '⚠️');
      setRunResult({
        success: false,
        status: 'Error',
        error: 'Code is too large (max 64 KB)',
      });
      setConsoleOpen(true);
      setConsoleTab('result');
      return;
    }

    setIsRunning(true);
    setRunResult(null);
    setSubmitResult(null);
    setConsoleOpen(true);
    setConsoleTab('result');

    try {
      const targetProblemId = problem?._id || routeIdentifier;
      if (targetProblemId && targetProblemId !== 'default-1614') {
        const response = await axiosClient.post(`/submission/run/${targetProblemId}`, {
          code,
          language: selectedLang,
        });
        setRunResult(response.data);
        if (response.data?.success || response.data?.status === 'accepted') {
          triggerToast('All test cases passed! ✨', '✓');
        } else {
          triggerToast('Testcase execution failed', '⚠');
        }
      } else {
        // Simulated LeetCode Accepted Response
        await new Promise((r) => setTimeout(r, 650));
        setRunResult({
          success: true,
          status: 'Accepted',
          runtime: '2 ms',
          runtimePercentile: '89.4%',
          memory: '42.1 MB',
          memoryPercentile: '78.2%',
          cases: [
            {
              input: problem?.visibleTestCases?.[0]?.input || 's = "(1+(2*3)+((8)/4))+1"',
              output: '3',
              expected: '3',
              passed: true,
            },
            {
              input: problem?.visibleTestCases?.[1]?.input || 's = "(1)+((2))+(((3)))"',
              output: '3',
              expected: '3',
              passed: true,
            },
          ],
        });
        triggerToast('All test cases passed! ✨', '✓');
      }
    } catch (err) {
      console.error('Run code error:', err);
      const errMsg = getApiErrorMessage(err);
      setRunResult({
        success: false,
        status: 'Runtime Error',
        error: errMsg,
      });
      triggerToast(errMsg, '⚠');
    } finally {
      setIsRunning(false);
    }
  };

  // 2b. Handle Custom Input Execution
  const handleRunCustom = async () => {
    if (!user) {
      triggerAuthModal(
        'Sign in to Run & Submit Code',
        'Create a free account or log in to compile solutions, test against edge cases, and save your practice streak.'
      );
      return;
    }

    if (!problem) return;

    if (code && code.length > 64000) {
      triggerToast('Code is too large (max 64 KB)', '⚠️');
      setRunResult({
        success: false,
        mode: 'custom',
        status: 'Error',
        errorMessage: 'Code is too large (max 64 KB)',
      });
      setSubmitResult(null);
      setConsoleOpen(true);
      setConsoleTab('result');
      return;
    }

    if (typeof customInput !== 'string') {
      triggerToast('Custom input must be a string', '⚠️');
      return;
    }

    if (customInput.length > 10000) {
      triggerToast('Custom input cannot exceed 10000 characters', '⚠️');
      return;
    }

    setIsRunning(true);
    setRunResult(null);
    setSubmitResult(null);
    setConsoleOpen(true);
    setConsoleTab('result');
    setMobileActiveView('editor');

    try {
      const targetProblemId = problem?._id || routeIdentifier;
      if (targetProblemId && targetProblemId !== 'default-1614') {
        const response = await axiosClient.post(`/submission/run/${targetProblemId}`, {
          code,
          language: selectedLang,
          customInput,
        });
        setRunResult(response.data);
        if (response.data?.success || response.data?.status === 'accepted') {
          triggerToast('Custom run completed successfully! ✨', '✓');
        } else {
          triggerToast('Custom run completed with errors', '⚠');
        }
      } else {
        // Fallback simulation
        await new Promise((r) => setTimeout(r, 650));
        setRunResult({
          success: true,
          mode: 'custom',
          status: 'accepted',
          stdout: customInput ? `Echo: ${customInput}` : '(No output)',
          stderr: '',
          errorMessage: '',
          runtime: 3,
          memory: 3800,
        });
        triggerToast('Custom run completed successfully! ✨', '✓');
      }
    } catch (err) {
      console.error('Run custom code error:', err);
      const errMsg = getApiErrorMessage(err);
      setRunResult({
        success: false,
        mode: 'custom',
        status: 'Error',
        errorMessage: errMsg,
        stdout: '',
        stderr: errMsg,
        runtime: 0,
        memory: 0,
      });
      triggerToast(errMsg, '⚠');
    } finally {
      setIsRunning(false);
    }
  };

  // 3. Handle Submit
  const handleSubmitCode = async () => {
    if (!user) {
      triggerAuthModal(
        'Sign in to Run & Submit Code',
        'Create a free account or log in to compile solutions, test against edge cases, and save your practice streak.'
      );
      return;
    }

    if (!problem) return;

    if (code && code.length > 64000) {
      triggerToast('Code is too large (max 64 KB)', '⚠️');
      setSubmitResult({
        status: 'Error',
        error: 'Code is too large (max 64 KB)',
      });
      setConsoleOpen(true);
      setConsoleTab('result');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);
    setRunResult(null);
    setConsoleOpen(true);
    setConsoleTab('result');
    setMobileActiveView('editor');

    try {
      const targetProblemId = problem?._id || routeIdentifier;
      if (targetProblemId && targetProblemId !== 'default-1614') {
        const response = await axiosClient.post(`/submission/submit/${targetProblemId}`, {
          code,
          language: selectedLang,
        });
        setSubmitResult(response.data);
        if (response.data?.accepted || response.data?.status === 'accepted') {
          setIsSolved(true);
          setStreakCount(1);
          triggerToast('Solution Accepted! 🎉', '🏆');
        } else {
          triggerToast('Submission rejected', '❌');
        }
      } else {
        // Simulated LeetCode Submission
        await new Promise((r) => setTimeout(r, 900));
        setSubmitResult({
          status: 'Accepted',
          runtime: '3 ms',
          runtimePercentile: '92.6%',
          memory: '43.2 MB',
          memoryPercentile: '81.4%',
          testcasesPassed: '42 / 42 testcases passed',
        });
        setIsSolved(true);
        triggerToast('Solution Accepted! 🎉', '🏆');
      }
    } catch (err) {
      console.error('Submit code error:', err);
      const errMsg = getApiErrorMessage(err);
      setSubmitResult({
        status: 'Wrong Answer',
        error: errMsg,
      });
      triggerToast(errMsg, '❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen max-w-full flex flex-col bg-[#18181b] text-zinc-100 overflow-hidden overflow-x-hidden font-sans selection:bg-blue-600/30 selection:text-white select-none">
      {/* ============================================================ */}
      {/* 1. TOP SLEEK NAVBAR                                          */}
      {/* ============================================================ */}
      <header className="h-12 bg-[#1c1c1f] border-b border-zinc-800/80 px-2.5 sm:px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left: Brand & Problem Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link to="/" className="flex items-center space-x-2 group mr-1 sm:mr-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white flex items-center justify-center font-extrabold text-[10px] shadow-sm group-hover:scale-105 transition-transform">
              &lt;/&gt;
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white hidden sm:inline">
              Code<span className="text-blue-500">Quest</span>
            </span>
          </Link>

          <span className="text-zinc-700 hidden sm:inline">|</span>

          {/* Problems List Button */}
          <Link
            to="/problems"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            title="Return to Problem Directory"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline">Problem List</span>
          </Link>

          {/* Quick Problem Title Preview */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 pl-0.5 sm:pl-1">
            {loadingProblem || !problem ? (
              <div className="h-4 w-24 sm:w-48 bg-zinc-800/80 rounded animate-pulse" />
            ) : (
              <>
                <span className="text-xs font-semibold text-zinc-300 max-w-[105px] sm:max-w-xs truncate">
                  {problem.title}
                </span>
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                  className="p-1 rounded text-zinc-400 hover:text-amber-400 transition cursor-pointer"
                >
                  <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Daily Streak & Profile Dropdown / Guest Auth Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div
            title={
              streakCount > 0
                ? `${streakCount} Day Problem Solving Streak`
                : 'Solve this problem to start your daily streak!'
            }
            className="flex items-center gap-1 sm:gap-1.5 bg-orange-950/40 border border-orange-800/60 text-orange-400 px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-bold"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="font-mono">{streakCount}</span>
          </div>

          {isAuthenticated ? (
            <ProfileDropdown
              user={user}
              onNavigate={(path) => navigate(path)}
              onSettings={() => navigate('/settings')}
              onAppearance={() => navigate('/settings?tab=appearance')}
              onLogout={handleLogout}
            />
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="px-2.5 sm:px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg border border-zinc-700 transition cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                state={{ from: location.pathname }}
                className="px-2.5 sm:px-3 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs shadow-blue-900/40"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile top view switch (< md): [Problem Specs] vs [Code & Run] */}
      <div className="md:hidden flex items-center justify-center px-3 py-1.5 bg-[#19191c] border-b border-zinc-800 shrink-0 select-none">
        <div className="grid grid-cols-2 p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-sm">
          <button
            type="button"
            onClick={() => setMobileActiveView('description')}
            className={`py-1.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mobileActiveView === 'description'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Problem Specs</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView('editor')}
            className={`py-1.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mobileActiveView === 'editor'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-white" />
            <span>Code &amp; Run</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SPLIT-PANE WORKSPACE BODY                                 */}
      {/* ============================================================ */}
      <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-2 gap-2 p-1.5 sm:p-2 overflow-hidden">
        {/* ========================================================== */}
        {/* LEFT PANE: PROBLEM SPECIFICATIONS & COMMUNITY TABS         */}
        {/* ========================================================== */}
        <div className={`rounded-xl bg-[#202024] border border-zinc-800/90 overflow-hidden flex-col shadow-sm flex-1 min-h-0 w-full ${
          mobileActiveView === 'description' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Tab Navigation Header */}
          <div className="h-10 bg-[#1c1c1f] border-b border-zinc-800/80 px-2 flex items-center space-x-1 shrink-0 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveLeftTab('description')}
              className={`h-full px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeLeftTab === 'description'
                  ? 'border-blue-500 text-white font-bold bg-[#26262b]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#242429]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Description</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab('editorial')}
              className={`h-full px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeLeftTab === 'editorial'
                  ? 'border-blue-500 text-white font-bold bg-[#26262b]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#242429]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Editorial</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab('solutions')}
              className={`h-full px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeLeftTab === 'solutions'
                  ? 'border-blue-500 text-white font-bold bg-[#26262b]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#242429]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Solutions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab('submissions')}
              className={`h-full px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeLeftTab === 'submissions'
                  ? 'border-blue-500 text-white font-bold bg-[#26262b]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#242429]'
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>Submissions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab('discussions')}
              className={`h-full px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeLeftTab === 'discussions'
                  ? 'border-blue-500 text-white font-bold bg-[#26262b]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#242429]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Discussions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab('chatai')}
              className={`h-full px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeLeftTab === 'chatai'
                  ? 'border-blue-500 text-white font-bold bg-[#26262b]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#242429]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>ChatAI</span>
            </button>
          </div>

          {/* Left Content Scroll Area */}
          <div
            className={`flex-1 overflow-y-auto text-sm text-zinc-300 leading-relaxed ${
              activeLeftTab === 'chatai'
                ? 'p-0 flex flex-col h-full overflow-hidden'
                : 'p-5 sm:p-6 space-y-6'
            }`}
          >
            {loadingProblem || !problem ? (
              <ProblemDescriptionSkeleton />
            ) : (
              <>
                {/* TAB 1: DESCRIPTION */}
                {activeLeftTab === 'description' && (
              <div className="space-y-6">
                {/* Problem Title & Status Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {problem.problemNumber ? `${problem.problemNumber}. ` : ''}{problem.title}
                    </h1>
                    <button
                      type="button"
                      onClick={handleToggleBookmark}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                      className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                        isBookmarked
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                          : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Star className={`w-4 h-4 transition ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                  {isSolved ? (
                    <span className="shrink-0 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Solved</span>
                    </span>
                  ) : (
                    <span className="shrink-0 px-2.5 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700/80 rounded-full text-xs font-semibold">
                      Unsolved
                    </span>
                  )}
                </div>

                {/* Metadata Pills Row (Difficulty, Topics, Companies, Hint) */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-zinc-800/80 pb-4">
                  {/* Difficulty Pill */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      problem.difficulty === 'hard'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : problem.difficulty === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {problem.difficulty
                      ? problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)
                      : 'Easy'}
                  </span>

                  {/* Topics Button */}
                  <button
                    type="button"
                    onClick={() => setShowTopics((prev) => !prev)}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 transition cursor-pointer"
                  >
                    <Tag className="w-3 h-3 text-zinc-400" />
                    <span>Topics</span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>

                  {/* Companies Button */}
                  <button
                    type="button"
                    onClick={() => setShowCompanies((prev) => !prev)}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 transition cursor-pointer"
                  >
                    <Building2 className="w-3 h-3 text-zinc-400" />
                    <span>Companies</span>
                    <Lock className="w-2.5 h-2.5 text-zinc-500" />
                  </button>

                  {/* Hint Accordion Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowHint((prev) => !prev)}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-amber-300 border border-zinc-700 transition cursor-pointer ml-auto"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>Hint</span>
                  </button>
                </div>

                {/* Always-visible Tag Chips */}
                {normalizeTags(problem.tags || problem.topics).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {normalizeTags(problem.tags || problem.topics).map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-semibold"
                      >
                        {tagLabel(t)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Topics Tag List */}
                {showTopics && (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
                    {(problem.topics || ['String', 'Stack', 'Simulation']).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-300 font-semibold border border-zinc-700/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Companies Tags */}
                {showCompanies && (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
                    {(problem.companies || ['Amazon', 'Google', 'Microsoft']).map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-300 font-semibold border border-zinc-700/60"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hint Card */}
                {showHint && (
                  <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-200 leading-relaxed flex items-start gap-2.5 animate-in fade-in duration-150">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold mb-0.5 text-amber-300">
                        Algorithmic Hint:
                      </strong>
                      {problem.hint ||
                        'Count open and closed brackets. The max open brackets before closing indicates the peak depth.'}
                    </div>
                  </div>
                )}

                {/* Problem Description Body */}
                <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </div>

                {/* Examples Section */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Examples:
                  </h3>
                  {problem.visibleTestCases?.map((ex, index) => (
                    <div
                      key={index}
                      className="bg-zinc-900/80 border-l-2 border-blue-500/80 pl-4 pr-4 py-3 rounded-r-xl space-y-1.5 font-mono text-xs text-zinc-300 shadow-2xs"
                    >
                      <span className="font-bold text-zinc-200 block not-italic">
                        Example {index + 1}:
                      </span>
                      <div>
                        <span className="text-zinc-500 font-bold">Input: </span>
                        <span className="text-zinc-200">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 font-bold">Output: </span>
                        <span className="text-emerald-400 font-bold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div>
                          <span className="text-zinc-500 font-bold">Explanation: </span>
                          <span className="text-zinc-400">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints Section */}
                {Boolean(
                  problem.constraints &&
                  (Array.isArray(problem.constraints)
                    ? problem.constraints.length > 0
                    : typeof problem.constraints === 'string' && problem.constraints.trim().length > 0)
                ) && (
                  <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Constraints:
                    </h3>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 font-mono bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/60">
                      {(Array.isArray(problem.constraints)
                        ? problem.constraints
                        : problem.constraints.split('\n')
                      )
                        .map((c) => String(c).trim())
                        .filter(Boolean)
                        .map((c, i) => (
                          <li key={i} className="leading-relaxed">
                            <code className="text-amber-300/90 font-mono text-[12px]">{c}</code>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Per-problem Time and Memory Limits Chips */}
                <div className="pt-3 border-t border-zinc-800/60 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>Time Limit: {problem.timeLimit >= 100 ? `${problem.timeLimit / 1000}s` : `${problem.timeLimit || 2}s`}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Memory: {problem.memoryLimit > 1024 ? `${Math.round(problem.memoryLimit / 1000)} MB` : `${problem.memoryLimit || 256} MB`}</span>
                  </span>
                </div>

                {/* Mobile quick action to open Code Editor */}
                <div className="md:hidden pt-4 pb-2 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setMobileActiveView('editor')}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-950/40 transition cursor-pointer"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Open Code Editor &amp; Run</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: EDITORIAL */}
            {activeLeftTab === 'editorial' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <span>Official Editorial &amp; Approach</span>
                  </h2>
                </div>

                {/* Check if video editorial exists */}
                {problem.secureUrl && (
                  <Editorial
                    secureUrl={problem.secureUrl}
                    thumbnailUrl={problem.thumbnailUrl}
                    duration={problem.duration}
                  />
                )}

                {/* Structured Text Approach */}
                <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
                  <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2">
                    <h3 className="font-bold text-sm text-white">
                      Approach 1: Single Pass Simulation
                    </h3>
                    <p>
                      Iterate through each character of the string. Maintain a running counter{' '}
                      <code className="text-amber-300 bg-zinc-800 px-1 py-0.5 rounded">currentDepth</code>{' '}
                      that increments when an open parenthesis <code className="text-zinc-200">'('</code> is encountered and
                      decrements when a closing parenthesis <code className="text-zinc-200">')'</code> is encountered.
                    </p>
                    <p>
                      Keep track of the maximum value of <code className="text-amber-300">currentDepth</code> seen so far.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                      <span className="block text-zinc-500 font-bold mb-1">Time Complexity</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">O(N)</span>
                    </div>
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                      <span className="block text-zinc-500 font-bold mb-1">Space Complexity</span>
                      <span className="font-mono text-blue-400 font-bold text-sm">O(1)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SOLUTIONS */}
            {activeLeftTab === 'solutions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span>Reference Solutions</span>
                  </h2>
                </div>

                {/* If problem has a solution video, show video section */}
                {problem?.secureUrl && (
                  <Editorial
                    secureUrl={problem.secureUrl}
                    thumbnailUrl={problem.thumbnailUrl}
                    duration={problem.duration}
                  />
                )}

                <div className="space-y-4">
                  {problem?.referenceSolution && problem.referenceSolution.length > 0 ? (
                    problem.referenceSolution.map((sol, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden shadow-xs"
                      >
                        <div className="px-4 py-2.5 bg-zinc-800/80 border-b border-zinc-700/60 flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-white">
                            {sol?.language}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(sol?.completeCode || '')}
                            className="text-zinc-400 hover:text-white p-1 text-xs flex items-center gap-1 rounded hover:bg-zinc-700 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                          <code>{sol?.completeCode}</code>
                        </pre>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center">
                      <p className="text-sm text-zinc-400">
                        Official solutions are not available yet. Check the Editorial/Video tab.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SUBMISSIONS */}
            {activeLeftTab === 'submissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-400" />
                    <span>Submission History</span>
                  </h2>
                </div>
                <SubmissionHistory problemId={problem?._id || routeIdentifier} />
              </div>
            )}

            {/* TAB 5: DISCUSSIONS & COMMUNITY SOLUTIONS */}
            {activeLeftTab === 'discussions' && (
              <ProblemDiscussion
                problemId={problem?._id || routeIdentifier}
                user={user}
                onRequireAuth={(customTitle, customSub) =>
                  triggerAuthModal(customTitle, customSub)
                }
              />
            )}

                {/* TAB 5: CHAT AI */}
                {activeLeftTab === 'chatai' && (
                  <div className="h-full flex-1 flex flex-col overflow-hidden">
                    <ChatAi
                      problem={problem}
                      onRequireAuth={(customTitle, customSub) =>
                        triggerAuthModal(customTitle, customSub)
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT PANE: CODE EDITOR & EXECUTION DRAWER                 */}
        {/* ========================================================== */}
        <div className={`rounded-xl bg-[#202024] border border-zinc-800/90 overflow-hidden flex-col shadow-sm relative flex-1 min-h-0 w-full ${
          mobileActiveView === 'editor' ? 'flex' : 'hidden md:flex'
        }`}>
          {loadingProblem || !problem ? (
            <ProblemRightPaneSkeleton />
          ) : (
            <>
              {/* 1. Editor Top Bar */}
              <div className="h-10 bg-[#1c1c1f] border-b border-zinc-800/80 px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              {/* Code Tab Indicator */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-zinc-800/60 px-2.5 py-1 rounded-md border border-zinc-700/60">
                <Braces className="w-3.5 h-3.5" />
                <span>Code</span>
              </div>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition cursor-pointer"
                >
                  <span>{LANG_CONFIG[selectedLang]?.label || 'JavaScript'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute left-0 mt-1 z-30 w-36 bg-[#27272a] border border-zinc-700 rounded-lg shadow-xl p-1 text-xs font-medium space-y-0.5">
                    {Object.keys(LANG_CONFIG).map((lKey) => (
                      <button
                        key={lKey}
                        type="button"
                        onClick={() => handleLanguageChange(lKey)}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-700 text-zinc-200 flex items-center justify-between"
                      >
                        <span>{LANG_CONFIG[lKey].label}</span>
                        {selectedLang === lKey && (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-save indicator */}
              <div
                className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono select-none"
                title="Drafts auto-saved to localStorage"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSavingDraft ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'
                  }`}
                ></span>
                <span>{isSavingDraft ? 'Saving...' : 'Auto-saved'}</span>
              </div>
            </div>

            {/* Utility Icons */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleFormatCode}
                title="Format Code"
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetClick}
                title="Reset code to default template"
                className="px-2 py-1 text-zinc-400 hover:text-amber-400 rounded hover:bg-zinc-800 transition flex items-center gap-1 text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFullScreen((prev) => !prev)}
                title="Toggle Fullscreen"
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer"
              >
                {isFullScreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Interactive Monaco Editor Container */}
          <div className="flex-1 w-full min-h-[320px] md:min-h-0 bg-[#1e1e1e] overflow-hidden relative">
            <Editor
              height="100%"
              language={LANG_CONFIG[selectedLang]?.monaco || 'javascript'}
              value={code}
              onChange={handleCodeChange}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                renderLineHighlight: 'line',
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                cursorBlinking: 'smooth',
                mouseWheelZoom: true,
              }}
            />
          </div>

          {/* 3. Bottom Slide-up Console & Testcase Drawer */}
          {consoleOpen && (
            <div className="bg-[#1c1c1f] border-t border-zinc-800 h-48 sm:h-52 max-h-[45vh] flex flex-col shrink-0 animate-in slide-in-from-bottom-2 duration-150">
              {/* Console Tabs Header */}
              <div className="h-8 bg-[#18181b] border-b border-zinc-800/80 px-3 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setConsoleTab('testcase')}
                    className={`px-3 py-1 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                      consoleTab === 'testcase'
                        ? 'border-blue-500 text-white font-bold'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Terminal className="w-3 h-3 text-zinc-400" />
                    <span>Testcase</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleTab('custom')}
                    className={`px-3 py-1 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                      consoleTab === 'custom'
                        ? 'border-blue-500 text-white font-bold'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Terminal className="w-3 h-3 text-purple-400" />
                    <span>Custom Input</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleTab('result')}
                    className={`px-3 py-1 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                      consoleTab === 'result'
                        ? 'border-blue-500 text-white font-bold'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Test Result</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setConsoleOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
                  title="Close Console"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Console Content */}
              <div className="flex-1 p-3.5 overflow-y-auto text-xs font-mono text-zinc-300 space-y-3">
                {/* TAB A: TESTCASES */}
                {consoleTab === 'testcase' && (
                  <div className="space-y-3">
                    {/* Case Pills */}
                    <div className="flex items-center space-x-2">
                      {problem.visibleTestCases?.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedCaseIdx(idx)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                            selectedCaseIdx === idx
                              ? 'bg-zinc-700 text-white shadow-xs'
                              : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-750'
                          }`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Testcase Parameter Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400 font-semibold block">
                        Input:
                      </label>
                      <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200">
                        {problem.visibleTestCases?.[selectedCaseIdx]?.input ||
                          's = "(1+(2*3)+((8)/4))+1"'}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB B: CUSTOM INPUT */}
                {consoleTab === 'custom' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-zinc-400 font-semibold block">
                        Custom Stdin:
                      </label>
                      <div className="flex items-center gap-2">
                        {customInput.length > 8000 && (
                          <span
                            className={`text-[11px] font-mono ${
                              customInput.length > 10000 ? 'text-rose-400 font-bold' : 'text-amber-400'
                            }`}
                          >
                            {customInput.length} / 10000
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handleRunCustom}
                          disabled={isRunning || isSubmitting}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-semibold rounded-md shadow-xs transition cursor-pointer disabled:opacity-50"
                        >
                          {isRunning ? (
                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            <Play className="w-3 h-3 fill-current text-white" />
                          )}
                          <span>Run Custom</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      maxLength={10000}
                      rows={4}
                      placeholder="Enter custom stdin here..."
                      className="w-full p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-y"
                    />
                  </div>
                )}

                {/* TAB C: RESULTS */}
                {consoleTab === 'result' && (
                  <div>
                    {isRunning || isSubmitting ? (
                      <div className="flex items-center gap-2 py-6 justify-center text-zinc-400">
                        <span className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin"></span>
                        <span>Evaluating on CodeQuest engine...</span>
                      </div>
                    ) : runResult || submitResult ? (
                      <div className="space-y-3">
                        {/* Status Header */}
                        <div className="flex items-center gap-3">
                          {(runResult?.status === 'accepted' ||
                            runResult?.status === 'Accepted' ||
                            submitResult?.status === 'accepted' ||
                            submitResult?.status === 'Accepted' ||
                            (runResult?.success && !runResult?.status) ||
                            (submitResult?.accepted && !submitResult?.status)) ? (
                            <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Accepted</span>
                            </span>
                          ) : (
                            <span className="text-rose-400 font-bold text-sm flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-rose-400" />
                              <span>
                                {(() => {
                                  const rawStatus = (submitResult?.status || runResult?.status || '').toLowerCase();
                                  if (rawStatus === 'compile_error' || rawStatus === 'compilation error') return 'Compilation Error';
                                  if (rawStatus === 'runtime_error' || rawStatus === 'runtime error') return 'Runtime Error';
                                  if (rawStatus === 'tle' || rawStatus === 'time limit exceeded') return 'Time Limit Exceeded';
                                  if (rawStatus === 'wrong' || rawStatus === 'wrong answer') return 'Wrong Answer';
                                  if (rawStatus === 'error') return 'Error';
                                  return submitResult?.status || runResult?.status || 'Runtime Error';
                                })()}
                              </span>
                            </span>
                          )}

                          {(() => {
                            const isAccepted =
                              runResult?.status === 'accepted' ||
                              runResult?.status === 'Accepted' ||
                              submitResult?.status === 'accepted' ||
                              submitResult?.status === 'Accepted' ||
                              (runResult?.success && !runResult?.status) ||
                              (submitResult?.accepted && !submitResult?.status);

                            const runtimeVal =
                              runResult?.runtime != null
                                ? (typeof runResult.runtime === 'number' ? `${runResult.runtime} ms` : runResult.runtime)
                                : submitResult?.runtime != null
                                ? (typeof submitResult.runtime === 'number' ? `${submitResult.runtime} ms` : submitResult.runtime)
                                : '—';

                            const rawRuntimePercentile =
                              submitResult?.runtimePercentile != null
                                ? submitResult.runtimePercentile
                                : runResult?.runtimePercentile != null
                                ? runResult.runtimePercentile
                                : null;

                            const runtimePercentileStr =
                              rawRuntimePercentile != null
                                ? typeof rawRuntimePercentile === 'string' && rawRuntimePercentile.endsWith('%')
                                  ? rawRuntimePercentile.slice(0, -1)
                                  : rawRuntimePercentile
                                : null;

                            const formatMem = (mem) => {
                              if (mem == null) return '—';
                              if (typeof mem === 'string') return mem;
                              if (mem >= 1024) return `${(mem / 1024).toFixed(1)} MB`;
                              return `${mem} KB`;
                            };

                            const memoryVal =
                              runResult?.memory != null
                                ? formatMem(runResult.memory)
                                : submitResult?.memory != null
                                ? formatMem(submitResult.memory)
                                : '—';

                            const rawMemoryPercentile =
                              submitResult?.memoryPercentile != null
                                ? submitResult.memoryPercentile
                                : runResult?.memoryPercentile != null
                                ? runResult.memoryPercentile
                                : null;

                            const memoryPercentileStr =
                              rawMemoryPercentile != null
                                ? typeof rawMemoryPercentile === 'string' && rawMemoryPercentile.endsWith('%')
                                  ? rawMemoryPercentile.slice(0, -1)
                                  : rawMemoryPercentile
                                : null;

                            return (
                              <>
                                <span className="text-zinc-500 font-sans text-xs inline-flex items-center gap-1.5 flex-wrap">
                                  <span>Runtime:</span>
                                  <strong className="text-zinc-300">{runtimeVal}</strong>
                                  {isAccepted && runtimePercentileStr != null && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                      Beats {runtimePercentileStr}%
                                    </span>
                                  )}
                                </span>

                                <span className="text-zinc-500 font-sans text-xs inline-flex items-center gap-1.5 flex-wrap">
                                  <span>Memory:</span>
                                  <strong className="text-zinc-300">{memoryVal}</strong>
                                  {isAccepted && memoryPercentileStr != null && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                      Beats {memoryPercentileStr}%
                                    </span>
                                  )}
                                </span>
                              </>
                            );
                          })()}
                          {submitResult?.passedTestCases != null && submitResult?.totalTestCases != null && (
                            <span className="text-zinc-500 font-sans text-xs">
                              Passed:{' '}
                              <strong className="text-zinc-300">
                                {submitResult.passedTestCases}/{submitResult.totalTestCases}
                              </strong>
                            </span>
                          )}
                        </div>

                        {/* Error Message Box if errorMessage or error is present (and no failedTestCase) */}
                        {(runResult?.errorMessage || submitResult?.errorMessage || runResult?.error || submitResult?.error) &&
                          !submitResult?.failedTestCase && (
                            <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl text-xs text-rose-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-48 leading-relaxed">
                              {runResult?.errorMessage || submitResult?.errorMessage || runResult?.error || submitResult?.error}
                            </div>
                          )}

                        {/* C1: If submitResult has failedTestCase, show the FailedTestCaseCard */}
                        {submitResult?.failedTestCase ? (
                          <FailedTestCaseCard failedTestCase={submitResult.failedTestCase} />
                        ) : runResult?.mode === 'custom' ? (
                          /* C2: Custom run output display */
                          <div className="space-y-2">
                            {runResult.stdout != null && runResult.stdout !== '' ? (
                              <div className="space-y-1">
                                <span className="text-[11px] text-zinc-400 font-medium">Standard Output</span>
                                <pre className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-lg text-xs font-mono text-zinc-200 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                                  {runResult.stdout}
                                </pre>
                              </div>
                            ) : null}

                            {runResult.stderr || runResult.errorMessage ? (
                              <div className="space-y-1">
                                <span className="text-[11px] text-zinc-400 font-medium">Standard Error</span>
                                <pre className="p-2.5 bg-rose-950/20 border border-rose-800/40 rounded-lg text-xs font-mono text-rose-300 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                                  {runResult.stderr || runResult.errorMessage}
                                </pre>
                              </div>
                            ) : null}

                            {!runResult.stdout && !runResult.stderr && !runResult.errorMessage && (
                              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-xs italic">
                                (No output produced)
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Default Cases summary box for standard Run */
                          <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-zinc-400">
                              <span>Input:</span>
                              <span className="text-zinc-200">
                                {problem.visibleTestCases?.[0]?.input || 's = "(1+(2*3)+((8)/4))+1"'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-zinc-400">
                              <span>Output:</span>
                              <span className="text-emerald-400 font-bold">
                                {problem.visibleTestCases?.[0]?.output || '3'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-zinc-400">
                              <span>Expected:</span>
                              <span className="text-zinc-300">
                                {problem.visibleTestCases?.[0]?.output || '3'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-zinc-500 text-xs">
                        Run your code to evaluate testcases and view execution outputs.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Bottom Action Footer Bar */}
          <div className="h-11 bg-[#1c1c1f] border-t border-zinc-800/80 px-2 sm:px-4 flex items-center justify-between shrink-0">
            {/* Console Button */}
            <button
              type="button"
              onClick={() => setConsoleOpen((prev) => !prev)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console</span>
              {consoleOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Run & Submit Action Buttons */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current text-zinc-300" />
                )}
                <span>Run</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-950/40 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Send className="w-3 h-3 text-white" />
                )}
                <span>Submit</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  </div>

      {/* ============================================================ */}
      {/* 2.5 RESET CONFIRMATION MODAL                                 */}
      {/* ============================================================ */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
          <div className="bg-[#1c1c1f] border border-zinc-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset to Default Template</h3>
                <p className="text-xs text-zinc-400">
                  Target Language: <span className="font-semibold text-zinc-200">{LANG_CONFIG[selectedLang]?.label || selectedLang}</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Reset code to default template? Your unsaved draft for this language will be cleared.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 transition shadow-sm cursor-pointer"
              >
                Reset Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TOAST NOTIFICATION                                        */}
      {/* ============================================================ */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center space-x-2.5 transform transition-all duration-300 border border-zinc-700 ${
          toast.show
            ? 'translate-y-0 opacity-100'
            : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <span className="text-emerald-400 font-bold">{toast.icon}</span>
        <span className="font-semibold">{toast.message}</span>
      </div>

      {/* ============================================================ */}
      {/* 4. AUTH PROMPT MODAL FOR GUESTS                              */}
      {/* ============================================================ */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authModalConfig.title}
        subtitle={authModalConfig.subtitle}
        redirectPath={location.pathname}
      />
    </div>
  );
}

export default SolveProblemPage;
