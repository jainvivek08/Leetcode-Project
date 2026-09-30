import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosClient, { getApiErrorMessage } from '../utils/axiosClient';
import {
  Send,
  Sparkles,
  Bot,
  Trash2,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

const SUGGESTIONS = [
  {
    label: '💡 Give me a hint',
    prompt: 'Can you give me a subtle hint on how to approach this problem without revealing the complete solution?',
  },
  {
    label: "⏱️ What's the time complexity?",
    prompt: 'What is the expected optimal time and space complexity for this problem and how can I achieve it?',
  },
  {
    label: '🔍 Explain with an example',
    prompt: 'Can you walk me through the first example step by step to clarify the logic?',
  },
  {
    label: '🐛 Help me debug my code',
    prompt: 'What are the most common edge cases and pitfalls in this problem that could lead to bugs or failed testcases?',
  },
];

/**
 * Lightweight Markdown Code & Inline Text Formatter
 */
function FormattedMessage({ content }) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  if (!content) return null;

  const handleCopy = (codeStr, idx) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Split by fenced code blocks ```
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'code', value: match[1] });
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.substring(lastIndex) });
  }

  return (
    <div className="space-y-2">
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          const lines = part.value.split('\n');
          const firstLine = lines[0].trim();
          const hasLang = ['javascript', 'js', 'python', 'py', 'cpp', 'c++', 'java', 'typescript', 'ts'].includes(
            firstLine.toLowerCase()
          );
          const langLabel = hasLang ? firstLine : '';
          const codeText = hasLang ? lines.slice(1).join('\n') : part.value;

          return (
            <div
              key={pIdx}
              className="my-2.5 rounded-xl overflow-hidden border border-zinc-700/80 bg-[#121214] shadow-sm"
            >
              <div className="bg-zinc-800/80 px-3 py-1.5 text-[11px] font-mono text-zinc-400 border-b border-zinc-700/60 flex items-center justify-between">
                <span className="uppercase font-semibold tracking-wider text-zinc-300">
                  {langLabel || 'CODE'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(codeText.trim(), pIdx)}
                  className="flex items-center gap-1 text-zinc-400 hover:text-white transition cursor-pointer px-1.5 py-0.5 rounded hover:bg-zinc-700/60"
                  title="Copy Code"
                >
                  {copiedCodeIdx === pIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px] font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed selection:bg-emerald-500/20">
                <code>{codeText.trim()}</code>
              </pre>
            </div>
          );
        }

        return (
          <p key={pIdx} className="whitespace-pre-wrap leading-relaxed">
            {renderInlineSpans(part.value)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineSpans(text) {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, i) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={i}
          className="bg-zinc-900 border border-zinc-700/60 px-1.5 py-0.5 rounded font-mono text-emerald-400 text-xs mx-0.5 selection:bg-emerald-500/30"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    return token;
  });
}

/**
 * Modern AI DSA Tutor Chat Component
 */
function ChatAi({ problem, onRequireAuth }) {
  const { user } = useSelector((state) => state.auth || {});
  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.username
    ? user.username.charAt(0).toUpperCase()
    : 'V';

  const defaultGreeting = `Hello! I am your **CodeQuest AI DSA Tutor**. I'm here to help you understand "${
    problem?.title || 'this problem'
  }", brainstorm optimal approaches, analyze time/space complexity, and debug edge cases.\n\nHow can I help you get started?`;

  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: defaultGreeting,
      parts: [{ text: defaultGreeting }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Clear Chat
  const handleClearChat = () => {
    setMessages([
      {
        role: 'model',
        text: defaultGreeting,
        parts: [{ text: defaultGreeting }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Common message sender
  const sendMessageWithText = async (textToSend) => {
    if (!textToSend || isLoading) return;

    // Check user authentication
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth(
          'Sign in to Chat with AI Tutor',
          'Create a free account or log in to get hints, analyze complexity, and debug algorithms with the CodeQuest AI Tutor.'
        );
      }
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      role: 'user',
      text: textToSend,
      parts: [{ text: textToSend }],
      timestamp: currentTime,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    if (inputRef.current) inputRef.current.value = '';
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/ai/chat', {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          parts: m.parts || [{ text: m.text }],
        })),
        title: problem?.title,
        description: problem?.description,
        testCases: problem?.visibleTestCases,
        startCode: problem?.startCode,
      });

      const replyText = response.data?.message || response.data?.reply || 'I processed your query. Let me know if you need any other hints!';

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: replyText,
          parts: [{ text: replyText }],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errMsg = getApiErrorMessage(error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ **Error**: ${errMsg}`,
          parts: [{ text: errMsg }],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (text) {
      sendMessageWithText(text);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#18181b] overflow-hidden select-none">
      {/* ============================================================ */}
      {/* 1. SLEEK STICKY HEADER                                       */}
      {/* ============================================================ */}
      <div className="h-12 border-b border-zinc-800/80 px-4 flex items-center justify-between bg-[#18181b]/95 backdrop-blur-md shrink-0 z-10">
        {/* Left: Sparkles Pill + Title + Online Badge */}
        <div className="flex items-center space-x-2.5">
          <div className="bg-blue-500/10 text-blue-400 p-1.5 rounded-lg border border-blue-500/20 shadow-xs flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-white tracking-tight">AI DSA Tutor</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online</span>
            </span>
          </div>
        </div>

        {/* Right: Model Tag & Clear Chat */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
            Model: CodeQuest AI
          </span>
          <button
            type="button"
            onClick={handleClearChat}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg transition cursor-pointer disabled:opacity-50"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CHAT MESSAGE STREAM                                       */}
      {/* ============================================================ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, index) => {
          const isAi = msg.role === 'model';

          return (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {/* Bot Avatar */}
              {isAi && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${
                  isAi ? 'items-start' : 'items-end'
                }`}
              >
                {/* Meta Name & Timestamp */}
                <div className="flex items-center space-x-1.5 mb-1 px-1 text-[11px] text-zinc-500">
                  <span className="font-semibold">{isAi ? 'CodeQuest AI' : 'You'}</span>
                  <span>•</span>
                  <span>{msg.timestamp || 'Just now'}</span>
                </div>

                {/* Bubble Content */}
                <div
                  className={`p-3.5 text-xs md:text-sm leading-relaxed shadow-sm ${
                    isAi
                      ? 'bg-zinc-800/85 border border-zinc-700/60 text-zinc-200 rounded-2xl rounded-tl-xs'
                      : 'bg-blue-600 text-white rounded-2xl rounded-tr-xs shadow-blue-900/30'
                  }`}
                >
                  {isAi ? (
                    <FormattedMessage content={msg.text} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {!isAi && (
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                  {userInitial}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Thinking Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5 animate-pulse">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-zinc-800/85 border border-zinc-700/60 rounded-2xl rounded-tl-xs p-3.5 text-xs text-zinc-300 flex items-center gap-2">
              <span className="flex space-x-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                ></span>
              </span>
              <span className="font-semibold text-zinc-400 text-xs">Analyzing algorithm...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ============================================================ */}
      {/* 3. QUICK SUGGESTION CHIPS (Above Input)                      */}
      {/* ============================================================ */}
      <div className="px-3 py-2 bg-[#18181b] border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessageWithText(s.prompt)}
            disabled={isLoading}
            className="bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/50 rounded-full px-3 py-1 text-xs transition cursor-pointer flex-shrink-0 active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 4. SEAMLESS DARK INPUT BAR                                   */}
      {/* ============================================================ */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-[#18181b] border-t border-zinc-800 shrink-0"
      >
        <div className="bg-zinc-900 border border-zinc-700/70 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 rounded-xl px-3 py-2 flex items-center gap-2 transition shadow-inner">
          <input
            ref={inputRef}
            id="chat-ai-input"
            type="text"
            maxLength={2000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI tutor for hints, approaches, or debugging..."
            disabled={isLoading}
            className="bg-transparent text-xs md:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none flex-1 font-sans disabled:opacity-50"
          />

          {input.length > 1500 && (
            <span className="text-[10px] font-mono text-zinc-400 shrink-0">
              {input.length}/2000
            </span>
          )}

          <button
            id="chat-ai-send-btn"
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white p-2 rounded-lg transition flex items-center justify-center cursor-pointer shrink-0 active:scale-95 shadow-sm shadow-blue-950"
            title="Send Message (Enter)"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatAi;