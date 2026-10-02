import React, { useState } from 'react';
import { Copy, Check, Clock, AlertTriangle, EyeOff, XCircle } from 'lucide-react';

/**
 * FailedTestCaseCard component
 * Displays detailed information about the first failing test case
 * Used in both SolveProblemPage (console result pane) and SubmissionHistory (code modal).
 */
const FailedTestCaseCard = ({ failedTestCase }) => {
  const [copiedInput, setCopiedInput] = useState(false);

  if (!failedTestCase) return null;

  const {
    index,
    isHidden,
    input,
    expectedOutput,
    actualOutput,
    status,
  } = failedTestCase;

  const isTle = status === 'tle' || (status && status.toLowerCase().includes('time limit'));
  const isRuntimeError =
    status === 'runtime_error' || (status && status.toLowerCase().includes('runtime'));

  const handleCopyInput = () => {
    if (input == null) return;
    navigator.clipboard.writeText(input);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  // Case A: Hidden test case details disabled (SHOW_FAILED_HIDDEN_TEST_DETAILS=false)
  if (input === null) {
    return (
      <div className="p-3.5 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
          <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Failed on hidden test case #{index}</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
          Details for this hidden test case are not revealed by server configuration.
        </p>
      </div>
    );
  }

  // Case B: Visible or revealed hidden test case with input, expected, actual
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isTle ? (
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          ) : isRuntimeError ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="font-bold text-xs text-zinc-200">
            {isTle
              ? `Time Limit Exceeded on Test Case #${index}`
              : `Failed Test Case #${index}`}
          </span>
          {isHidden && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
              Hidden Test
            </span>
          )}
        </div>
      </div>

      {/* Input Block */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>Input</span>
          <button
            type="button"
            onClick={handleCopyInput}
            className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            title="Copy testcase input"
          >
            {copiedInput ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-lg text-xs font-mono text-zinc-200 whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
          {input || '(empty input)'}
        </pre>
      </div>

      {/* Expected Output Block (omit if null or empty and is TLE/runtime_error) */}
      {expectedOutput != null && (
        <div className="space-y-1">
          <div className="text-[11px] text-zinc-400 font-medium">Expected Output</div>
          <pre className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-lg text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
            {expectedOutput}
          </pre>
        </div>
      )}

      {/* Your Output / Error Block */}
      <div className="space-y-1">
        <div className="text-[11px] text-zinc-400 font-medium">
          {isRuntimeError ? 'Your Output / Error' : isTle ? 'Your Output / Status' : 'Your Output'}
        </div>
        <pre
          className={`p-2.5 bg-zinc-950/80 border rounded-lg text-xs font-mono whitespace-pre-wrap break-all max-h-36 overflow-y-auto ${
            isRuntimeError || isTle
              ? 'border-rose-900/40 text-rose-300'
              : 'border-zinc-800/80 text-rose-400'
          }`}
        >
          {actualOutput || (isTle ? 'Time Limit Exceeded' : isRuntimeError ? 'Runtime Error' : '(no output)')}
        </pre>
      </div>
    </div>
  );
};

export default FailedTestCaseCard;
