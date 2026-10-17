import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Terminal,
  Cpu,
  Clock,
  Trash2,
  Code2,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  ChevronLeft,
} from 'lucide-react';
import axiosClient, { getApiErrorMessage } from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import ProfileDropdown from '../components/profile/ProfileDropdown';
import AuthPromptModal from '../components/AuthPromptModal';

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript (Node.js)', monacoLang: 'javascript' },
  { id: 'python', label: 'Python (3.11)', monacoLang: 'python' },
  { id: 'cpp', label: 'C++ (GCC 13)', monacoLang: 'cpp' },
  { id: 'java', label: 'Java (OpenJDK 17)', monacoLang: 'java' },
];

function PlaygroundPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem('cq_playground_lang') || 'javascript';
  });

  // Editor initializes completely blank by default for all languages
  const [code, setCode] = useState('');

  const [customInput, setCustomInput] = useState('');
  const [activeRightTab, setActiveRightTab] = useState('output'); // 'output' | 'input'
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'terminal'
  const [isRunning, setIsRunning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Execution Output State
  const [runResult, setRunResult] = useState(null);

  const editorRef = useRef(null);

  // Clean legacy template cache from localStorage if present
  useEffect(() => {
    ['javascript', 'python', 'cpp', 'java'].forEach((l) => {
      localStorage.removeItem(`cq_playground_code_${l}`);
    });
  }, []);

  // Toast Helper
  const triggerToast = (msg, icon = '✓') => {
    setToastMessage({ msg, icon });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync Language Change - switches language and keeps editor completely blank
  const handleLanguageChange = (newLang) => {
    setSelectedLang(newLang);
    localStorage.setItem('cq_playground_lang', newLang);
    setCode('');
  };

  // Handle Code Change in Monaco
  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  // Reset editor to completely blank
  const handleResetCode = () => {
    setCode('');
    triggerToast('Editor cleared', '↺');
  };

  // Client-side JavaScript evaluation fallback
  const runClientJs = (sourceCode) => {
    return new Promise((resolve) => {
      const logs = [];
      const errors = [];
      const startTime = performance.now();

      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      console.log = (...args) => {
        logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
      };
      console.warn = (...args) => {
        logs.push('[WARN] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
      };
      console.error = (...args) => {
        errors.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
      };

      try {
        const executor = new Function(sourceCode);
        executor();
        const duration = Math.round(performance.now() - startTime);

        resolve({
          success: errors.length === 0,
          status: errors.length === 0 ? 'accepted' : 'error',
          stdout: logs.join('\n'),
          stderr: errors.join('\n'),
          runtime: duration,
          memory: 1240,
        });
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        resolve({
          success: false,
          status: 'error',
          stdout: logs.join('\n'),
          stderr: err.toString(),
          runtime: duration,
          memory: 0,
        });
      } finally {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
      }
    });
  };

  // Execute Code
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;

    if (!code || code.trim() === '') {
      triggerToast('Please write some code before running', '⚠');
      return;
    }

    // If guest attempts compiled languages without login, prompt authentication
    if (!isAuthenticated && selectedLang !== 'javascript') {
      setAuthModalOpen(true);
      return;
    }

    setIsRunning(true);
    setActiveRightTab('output');
    if (window.innerWidth < 1024) {
      setMobileTab('terminal');
    }

    try {
      if (isAuthenticated) {
        // Authenticated run through backend Judge0 runner
        const response = await axiosClient.post('/submission/run/playground', {
          code,
          language: selectedLang,
          customInput: customInput || '',
        });

        const data = response.data;
        setRunResult({
          status: data.status || (data.success ? 'accepted' : 'error'),
          stdout: data.stdout || '',
          stderr: data.stderr || data.errorMessage || '',
          runtime: data.runtime || 0,
          memory: data.memory || 0,
        });

        if (data.success || data.status === 'accepted') {
          triggerToast('Execution completed successfully!', '✓');
        } else {
          triggerToast('Execution finished with warnings or errors', '⚠');
        }
      } else {
        // Guest mode for JavaScript
        const clientResult = await runClientJs(code);
        setRunResult({
          ...clientResult,
          note: 'Ran in browser sandbox. Sign in to run Python, C++, and Java with cloud compilation.',
        });
        if (clientResult.success) {
          triggerToast('Executed in browser sandbox', '✓');
        } else {
          triggerToast('Script encountered an error', '⚠');
        }
      }
    } catch (err) {
      console.error('Playground run error:', err);
      // Fallback for JS if server is offline
      if (selectedLang === 'javascript') {
        const fallbackRes = await runClientJs(code);
        setRunResult(fallbackRes);
        triggerToast('Executed in browser fallback', '✓');
      } else {
        const errMsg = getApiErrorMessage(err);
        setRunResult({
          status: 'error',
          stdout: '',
          stderr: errMsg,
          runtime: 0,
          memory: 0,
        });
        triggerToast(errMsg, '⚠');
      }
    } finally {
      setIsRunning(false);
    }
  }, [code, customInput, isRunning, selectedLang, isAuthenticated]);

  // Global Keyboard Shortcut: Ctrl + Enter or Cmd + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode]);

  const activeLangConfig = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`min-h-screen flex flex-col bg-zinc-950 text-zinc-100 ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* 1. Header Navigation Bar (Matches SolveProblemPage Compact Dark Arena Theme) */}
      <header className="h-12 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-20">
        {/* Left: Brand, Problem List Back Link, & Breadcrumb */}
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

          {/* Problem List Button */}
          <Link
            to="/problems"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            title="Return to Problem Directory"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline">Problem List</span>
          </Link>

          <span className="text-zinc-700 hidden sm:inline">|</span>

          {/* Center / Breadcrumb: Clean text Playground or Code Scratchpad */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 pl-0.5">
            <Code2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Code Scratchpad</span>
          </div>
        </div>

        {/* Right: Language Selector, Reset, Fullscreen, Run Code, and Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Selector Dropdown */}
          <select
            value={selectedLang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-2.5 py-1 bg-zinc-800 border border-zinc-700/80 rounded-lg text-xs font-semibold text-zinc-200 hover:border-zinc-600 focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-xs transition"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-zinc-900 text-zinc-200">
                {lang.label}
              </option>
            ))}
          </select>

          {/* Reset Code Button */}
          <button
            type="button"
            onClick={handleResetCode}
            title="Clear editor code"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700/60 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen((prev) => !prev)}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            className="hidden sm:flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700/60 transition cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Styled Green "Run Code" Button */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-950/40 transition cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                <span>Run Code</span>
                <span className="hidden xl:inline text-[10px] text-emerald-200 font-mono opacity-80">
                  (Ctrl+↵)
                </span>
              </>
            )}
          </button>

          {/* User Auth Pill or Profile */}
          {user ? (
            <ProfileDropdown
              user={user}
              onNavigate={(path) => navigate(path)}
              onSettings={() => navigate('/settings')}
              onAppearance={() => navigate('/settings?tab=appearance')}
              onLogout={() => dispatch(logoutUser())}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                state={{ from: '/playground' }}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg border border-zinc-700 transition cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center border-b border-zinc-800 bg-zinc-900/60 px-4 py-2 gap-2">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${
            mobileTab === 'editor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          Code Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('terminal')}
          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileTab === 'terminal'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Output &amp; Input</span>
          {runResult && (
            <span
              className={`w-2 h-2 rounded-full ${
                runResult.status === 'accepted' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
          )}
        </button>
      </div>

      {/* 2. Workspace Body: Monaco Editor & Output Panels */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Monaco Code Editor */}
        <section
          className={`flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-zinc-950 overflow-hidden ${
            mobileTab !== 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="h-9 px-4 bg-zinc-900/50 border-b border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-zinc-300 font-semibold">
                main.{activeLangConfig.monacoLang === 'python' ? 'py' : activeLangConfig.monacoLang === 'cpp' ? 'cpp' : activeLangConfig.monacoLang === 'java' ? 'java' : 'js'}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">Scratchpad</span>
          </div>

          <div className="flex-1 w-full h-full relative">
            <Editor
              height="100%"
              language={activeLangConfig.monacoLang}
              value={code}
              onChange={handleEditorChange}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, Courier New, monospace',
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </section>

        {/* Right Pane: Custom Input & Live Console Output */}
        <aside
          className={`w-full lg:w-[460px] xl:w-[520px] flex flex-col bg-zinc-900/30 overflow-hidden shrink-0 ${
            mobileTab !== 'terminal' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Right Pane Tabs */}
          <div className="h-9 px-3 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveRightTab('output')}
                className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeRightTab === 'output'
                    ? 'bg-zinc-800 text-white shadow-2xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Console Output</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRightTab('input')}
                className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeRightTab === 'input'
                    ? 'bg-zinc-800 text-white shadow-2xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Custom Input (stdin)</span>
                {customInput && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
              </button>
            </div>

            {activeRightTab === 'output' && runResult && (
              <button
                type="button"
                onClick={() => setRunResult(null)}
                title="Clear Output Console"
                className="p-1 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Pane Content Area */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
            {activeRightTab === 'input' ? (
              <div className="h-full flex flex-col space-y-2">
                <label className="text-zinc-400 text-xs font-sans font-medium flex items-center justify-between">
                  <span>Standard Input (stdin)</span>
                  <span className="text-[11px] text-zinc-500">Passed to process stdin on execution</span>
                </label>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter inputs here line by line (e.g. 5, Hello, 10 20)..."
                  className="flex-1 w-full min-h-[220px] p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-200 font-mono text-xs leading-relaxed focus:outline-hidden focus:border-blue-500 resize-none shadow-inner"
                />
              </div>
            ) : (
              <div className="h-full flex flex-col space-y-4">
                {/* Status Bar */}
                {runResult ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 ${
                          runResult.status === 'accepted'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {runResult.status === 'accepted' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>{runResult.status === 'accepted' ? 'Success' : 'Error'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-zinc-400 text-xs font-mono">
                      {runResult.runtime != null && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{runResult.runtime} ms</span>
                        </div>
                      )}
                      {runResult.memory != null && runResult.memory > 0 && (
                        <div className="flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-zinc-500" />
                          <span>{runResult.memory} KB</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40 text-xs text-zinc-500 font-sans">
                    <span>Terminal Ready</span>
                    <span>Press Ctrl + Enter to run</span>
                  </div>
                )}

                {/* Console Output Body */}
                <div className="flex-1 flex flex-col bg-zinc-950 rounded-xl border border-zinc-800/80 overflow-hidden shadow-inner">
                  <div className="px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800/60 text-[11px] text-zinc-400 font-sans flex items-center justify-between">
                    <span>Program Output</span>
                    {isRunning && <span className="text-blue-400 animate-pulse">Executing code...</span>}
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto max-h-[500px] leading-relaxed">
                    {runResult ? (
                      <>
                        {runResult.note && (
                          <div className="mb-2 text-[11px] text-amber-300/80 font-sans bg-amber-950/20 border border-amber-900/30 p-2 rounded">
                            {runResult.note}
                          </div>
                        )}
                        {runResult.stdout ? (
                          <pre className="text-zinc-200 whitespace-pre-wrap">{runResult.stdout}</pre>
                        ) : null}
                        {runResult.stderr ? (
                          <pre className="text-rose-400 mt-2 whitespace-pre-wrap">{runResult.stderr}</pre>
                        ) : null}
                        {!runResult.stdout && !runResult.stderr && (
                          <span className="text-zinc-600 italic">(Program exited without output)</span>
                        )}
                      </>
                    ) : (
                      <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2">
                        <Terminal className="w-6 h-6 text-zinc-600 mb-1" />
                        <p className="text-xs font-sans">No output yet.</p>
                        <p className="text-[11px] font-sans text-zinc-600 max-w-xs">
                          Click &quot;Run Code&quot; or press Ctrl + Enter to test your code snippet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-zinc-800/95 border border-zinc-700/80 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 backdrop-blur-md">
            <span>{toastMessage.icon}</span>
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign in for Cloud Code Execution"
        subtitle="Sign in to compile and execute Python, C++, and Java solutions on CodeQuest cloud servers."
        redirectPath="/playground"
      />
    </div>
  );
}

export default PlaygroundPage;
