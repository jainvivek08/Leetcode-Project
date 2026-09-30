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
} from 'lucide-react';
import axiosClient, { getApiErrorMessage } from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import ProfileDropdown from '../components/profile/ProfileDropdown';
import AuthPromptModal from '../components/AuthPromptModal';

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
  const { problemId } = useParams();
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
  const editorRef = useRef(null);

  // Bottom Console / Testcase Drawer
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleTab, setConsoleTab] = useState('testcase'); // 'testcase' | 'result'
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

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

  // 1. Fetch Problem from MongoDB API or fallback
  useEffect(() => {
    let isMounted = true;
    setLoadingProblem(true);
    setProblem(null);
    setCode('');

    const fetchProblem = async () => {
      try {
        if (!problemId || problemId === 'default-1614') {
          if (!isMounted) return;
          setProblem(DEFAULT_PROBLEM);
          loadStarterCode(DEFAULT_PROBLEM, selectedLang);
          setLoadingProblem(false);
          return;
        }

        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        if (!isMounted) return;

        if (response.data) {
          const apiProblem = response.data;
          const formattedProblem = {
            ...DEFAULT_PROBLEM,
            ...apiProblem,
            topics: apiProblem.tags
              ? apiProblem.tags.split(',').map((t) => t.trim())
              : ['Algorithms', 'Data Structures'],
            companies: apiProblem.companies || ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
            hint:
              apiProblem.hint ||
              'Think about the optimal data structure, frequency counting, or two-pointer approach.',
          };
          setProblem(formattedProblem);
          loadStarterCode(formattedProblem, selectedLang);
        } else {
          setProblem(DEFAULT_PROBLEM);
          loadStarterCode(DEFAULT_PROBLEM, selectedLang);
        }
      } catch (err) {
        console.warn('Could not fetch problem from API, fallback to default workspace:', err);
        if (isMounted) {
          setProblem(DEFAULT_PROBLEM);
          loadStarterCode(DEFAULT_PROBLEM, selectedLang);
        }
      } finally {
        if (isMounted) {
          setLoadingProblem(false);
        }
      }
    };

    fetchProblem();

    // Check if user solved this problem
    const checkSolved = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        if (isMounted && Array.isArray(data)) {
          const solved = data.some((sp) => sp._id === problemId);
          setIsSolved(solved);
          setStreakCount(data.length > 0 ? 1 : 0);
        }
      } catch {
        // guest or unauthenticated
      }
    };
    checkSolved();

    return () => {
      isMounted = false;
    };
  }, [problemId, selectedLang]);

  // Load starter code according to selected language
  const loadStarterCode = (prob, lang) => {
    if (!prob) {
      setCode('');
      return;
    }
    const langLabel = LANG_CONFIG[lang]?.label || 'JavaScript';
    const foundCode = prob?.startCode?.find(
      (sc) => sc.language?.toLowerCase() === langLabel.toLowerCase()
    );

    if (foundCode && foundCode.initialCode) {
      setCode(foundCode.initialCode);
    } else {
      // Default boilerplates
      if (lang === 'javascript') {
        setCode(`/**\n * Solution\n */\nfunction solve(input) {\n    // Write your code here\n    return 0;\n}`);
      } else if (lang === 'cpp') {
        setCode(`#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int solve() {\n        return 0;\n    }\n};`);
      } else if (lang === 'java') {
        setCode(`class Solution {\n    public int solve() {\n        // Write code here\n        return 0;\n    }\n}`);
      } else {
        setCode(`class Solution:\n    def solve(self) -> int:\n        # Write code here\n        return 0`);
      }
    }
  };

  // Switch Language
  const handleLanguageChange = (langKey) => {
    setSelectedLang(langKey);
    setIsLangDropdownOpen(false);
    if (problem) {
      loadStarterCode(problem, langKey);
    }
    triggerToast(`Switched language to ${LANG_CONFIG[langKey].label}`, '⚡');
  };

  // Reset Code
  const handleResetCode = () => {
    if (problem) {
      loadStarterCode(problem, selectedLang);
      triggerToast('Code reset to default starter template', '🔄');
    }
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
    setConsoleOpen(true);
    setConsoleTab('result');

    try {
      if (problemId && problemId !== 'default-1614') {
        const response = await axiosClient.post(`/submission/run/${problemId}`, {
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
    setConsoleOpen(true);
    setConsoleTab('result');

    try {
      if (problemId && problemId !== 'default-1614') {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
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
    <div className="h-screen w-screen flex flex-col bg-[#18181b] text-zinc-100 overflow-hidden font-sans selection:bg-blue-600/30 selection:text-white select-none">
      {/* ============================================================ */}
      {/* 1. TOP SLEEK NAVBAR                                          */}
      {/* ============================================================ */}
      <header className="h-12 bg-[#1c1c1f] border-b border-zinc-800/80 px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left: Brand & Problem Navigation */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2 group mr-2">
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
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            title="Return to Problem Directory"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline">Problem List</span>
          </Link>

          {/* Quick Problem Title Preview */}
          <div className="flex items-center space-x-1.5 pl-1">
            {loadingProblem || !problem ? (
              <div className="h-4 w-32 sm:w-48 bg-zinc-800/80 rounded animate-pulse" />
            ) : (
              <span className="text-xs font-semibold text-zinc-300 max-w-[200px] sm:max-w-xs truncate">
                {problem.title}
              </span>
            )}
          </div>
        </div>

        {/* Right: Daily Streak & Profile Dropdown / Guest Auth Buttons */}
        <div className="flex items-center space-x-3">
          <div
            title={
              streakCount > 0
                ? `${streakCount} Day Problem Solving Streak`
                : 'Solve this problem to start your daily streak!'
            }
            className="flex items-center gap-1.5 bg-orange-950/40 border border-orange-800/60 text-orange-400 px-2.5 py-0.5 rounded-full text-xs font-bold"
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
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg border border-zinc-700 transition cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                state={{ from: location.pathname }}
                className="px-3 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs shadow-blue-900/40"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. SPLIT-PANE WORKSPACE BODY                                 */}
      {/* ============================================================ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 overflow-hidden">
        {/* ========================================================== */}
        {/* LEFT PANE: PROBLEM SPECIFICATIONS & COMMUNITY TABS         */}
        {/* ========================================================== */}
        <div className="rounded-xl bg-[#202024] border border-zinc-800/90 overflow-hidden flex flex-col shadow-sm">
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
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {problem.title}
                  </h1>
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
                {problem.constraints && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Constraints:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-zinc-400 font-mono">
                      {problem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
                <SubmissionHistory problemId={problem._id || problemId} />
              </div>
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
        <div className="rounded-xl bg-[#202024] border border-zinc-800/90 overflow-hidden flex flex-col shadow-sm relative">
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
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Auto</span>
              </div>
            </div>

            {/* Utility Icons */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleFormatCode}
                title="Format Code"
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
              >
                <Wand2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetCode}
                title="Reset Code Template"
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsFullScreen((prev) => !prev)}
                title="Toggle Fullscreen"
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
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
          <div className="flex-1 w-full bg-[#1e1e1e] overflow-hidden relative">
            <Editor
              height="100%"
              language={LANG_CONFIG[selectedLang]?.monaco || 'javascript'}
              value={code}
              onChange={(val) => setCode(val || '')}
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
            <div className="bg-[#1c1c1f] border-t border-zinc-800 h-52 flex flex-col shrink-0 animate-in slide-in-from-bottom-2 duration-150">
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

                {/* TAB B: RESULTS */}
                {consoleTab === 'result' && (
                  <div>
                    {isRunning || isSubmitting ? (
                      <div className="flex items-center gap-2 py-6 justify-center text-zinc-400">
                        <span className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin"></span>
                        <span>Evaluating test cases on CodeQuest engine...</span>
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

                          <span className="text-zinc-500 font-sans text-xs">
                            Runtime:{' '}
                            <strong className="text-zinc-300">
                              {runResult?.runtime != null
                                ? (typeof runResult.runtime === 'number' ? `${runResult.runtime} ms` : runResult.runtime)
                                : submitResult?.runtime != null
                                ? (typeof submitResult.runtime === 'number' ? `${submitResult.runtime} ms` : submitResult.runtime)
                                : '—'}
                            </strong>
                          </span>
                          <span className="text-zinc-500 font-sans text-xs">
                            Memory:{' '}
                            <strong className="text-zinc-300">
                              {runResult?.memory != null
                                ? (typeof runResult.memory === 'number' ? `${runResult.memory} kB` : runResult.memory)
                                : submitResult?.memory != null
                                ? (typeof submitResult.memory === 'number' ? `${submitResult.memory} kB` : submitResult.memory)
                                : '—'}
                            </strong>
                          </span>
                          {submitResult?.passedTestCases != null && submitResult?.totalTestCases != null && (
                            <span className="text-zinc-500 font-sans text-xs">
                              Passed:{' '}
                              <strong className="text-zinc-300">
                                {submitResult.passedTestCases}/{submitResult.totalTestCases}
                              </strong>
                            </span>
                          )}
                        </div>

                        {/* Error Message Box if errorMessage or error is present */}
                        {(runResult?.errorMessage || submitResult?.errorMessage || runResult?.error || submitResult?.error) && (
                          <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl text-xs text-rose-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-48 leading-relaxed">
                            {runResult?.errorMessage || submitResult?.errorMessage || runResult?.error || submitResult?.error}
                          </div>
                        )}

                        {/* Cases summary box */}
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
          <div className="h-11 bg-[#1c1c1f] border-t border-zinc-800/80 px-4 flex items-center justify-between shrink-0">
            {/* Console Button */}
            <button
              type="button"
              onClick={() => setConsoleOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
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
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition cursor-pointer disabled:opacity-50"
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
                className="flex items-center gap-1.5 px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-950/40 transition cursor-pointer disabled:opacity-50"
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
