import React, { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import {
  Check,
  Copy,
  X,
  History,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileCode,
  Clock,
  Cpu,
} from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    // If no problemId or default dummy problem, set empty safely
    if (!problemId || problemId === 'default-1614') {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        // Ensure data is always an array
        if (response.data && Array.isArray(response.data)) {
          setSubmissions(response.data);
        } else {
          setSubmissions([]);
        }
      } catch (err) {
        // If 401 or not logged in, or 404
        if (err.response?.status === 401) {
          setError('Please sign in to view your submission history.');
        } else {
          console.warn('Could not fetch submissions:', err);
          setSubmissions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusBadge = (statusStr) => {
    const status = (statusStr || '').toLowerCase();
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Accepted</span>
          </span>
        );
      case 'wrong':
      case 'wrong answer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>Wrong Answer</span>
          </span>
        );
      case 'error':
      case 'runtime error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>Runtime Error</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Pending</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Submitted'}
          </span>
        );
    }
  };

  const formatMemory = (memory) => {
    const num = Number(memory) || 0;
    if (num < 1024) return `${num} kB`;
    return `${(num / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const handleCopyCode = (codeStr) => {
    navigator.clipboard.writeText(codeStr || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <span className="w-6 h-6 border-2 border-zinc-500 border-t-blue-500 rounded-full animate-spin"></span>
        <span className="text-xs text-zinc-400 font-medium">Loading submission records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 select-none">
      {submissions.length === 0 ? (
        <div className="py-12 px-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400">
            <History className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-200">No submissions yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              Run and submit your solution using the Submit button to evaluate your code against all test cases.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Submissions Count Indicator */}
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-semibold text-zinc-300">
              {submissions.length} {submissions.length === 1 ? 'Submission' : 'Submissions'} Total
            </span>
          </div>

          {/* Table Container */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-800/60 border-b border-zinc-800 text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Language</th>
                    <th className="py-2.5 px-3 font-semibold">Runtime</th>
                    <th className="py-2.5 px-3 font-semibold">Memory</th>
                    <th className="py-2.5 px-3 font-semibold">Passed</th>
                    <th className="py-2.5 px-3 font-semibold">Submitted</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {submissions.map((sub, index) => (
                    <tr
                      key={sub._id || index}
                      className="hover:bg-zinc-800/40 transition"
                    >
                      <td className="py-3 px-3">{getStatusBadge(sub.status)}</td>
                      <td className="py-3 px-3 font-mono font-medium text-zinc-200">
                        {sub.language || 'Code'}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-300">
                        {sub.runtime ? `${sub.runtime}s` : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-300">
                        {formatMemory(sub.memory)}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-300">
                        {sub.testCasesPassed != null && sub.testCasesTotal != null
                          ? `${sub.testCasesPassed}/${sub.testCasesTotal}`
                          : '—'}
                      </td>
                      <td className="py-3 px-3 text-zinc-400 font-sans">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(sub)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition cursor-pointer"
                        >
                          <FileCode className="w-3 h-3 text-blue-400" />
                          <span>Code</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Code Viewer Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#1c1c1f] border border-zinc-700/90 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">
                  Submission Code ({selectedSubmission.language || 'Code'})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Meta Strip */}
            <div className="px-5 py-3 bg-zinc-900/30 border-b border-zinc-800/80 flex flex-wrap items-center gap-3 text-xs">
              <div>{getStatusBadge(selectedSubmission.status)}</div>
              {selectedSubmission.runtime && (
                <div className="flex items-center gap-1 text-zinc-400 font-mono">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>{selectedSubmission.runtime}s</span>
                </div>
              )}
              {selectedSubmission.memory && (
                <div className="flex items-center gap-1 text-zinc-400 font-mono">
                  <Cpu className="w-3 h-3 text-zinc-500" />
                  <span>{formatMemory(selectedSubmission.memory)}</span>
                </div>
              )}
              {selectedSubmission.testCasesPassed != null && (
                <div className="text-zinc-400 font-mono">
                  Passed: {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleCopyCode(selectedSubmission.code)}
                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message if any */}
            {selectedSubmission.errorMessage && (
              <div className="mx-5 mt-3 p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl text-xs text-rose-300 font-mono">
                {selectedSubmission.errorMessage}
              </div>
            )}

            {/* Code Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <pre className="p-4 bg-[#121214] border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed selection:bg-blue-600/30">
                <code>{selectedSubmission.code || '// No code recorded'}</code>
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-zinc-800 flex justify-end bg-zinc-900/60">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;