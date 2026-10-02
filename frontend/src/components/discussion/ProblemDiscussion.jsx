import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  Send,
  Code,
  Copy,
  Check,
  Search,
  ChevronLeft,
  User,
  Clock,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';
import axiosClient, { getApiErrorMessage } from '../../utils/axiosClient';

function formatTimeAgo(dateString) {
  if (!dateString) return 'recently';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ProblemDiscussion({ problemId, user, onRequireAuth }) {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);

  // New post modal state
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postLanguage, setPostLanguage] = useState('');
  const [postCodeSnippet, setPostCodeSnippet] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postError, setPostError] = useState('');

  // Comment state
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'upvotes'

  const fetchDiscussions = useCallback(async () => {
    if (!problemId) return;
    setLoading(true);
    setError('');
    try {
      const sortParam = sortBy === 'upvotes' ? '?sort=upvotes' : '';
      const response = await axiosClient.get(`/discussion/problem/${problemId}${sortParam}`);
      if (response.data && Array.isArray(response.data.discussions)) {
        setDiscussions(response.data.discussions);
      } else {
        setDiscussions([]);
      }
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [problemId, sortBy]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleOpenNewPost = () => {
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth('Sign in to Post a Discussion', 'Join the discussion, share solutions, and get community feedback.');
      }
      return;
    }
    setPostError('');
    setShowNewPostModal(true);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (!postTitle.trim() || !postContent.trim()) {
      setPostError('Title and content are required.');
      return;
    }

    setSubmittingPost(true);
    setPostError('');
    try {
      const response = await axiosClient.post(`/discussion/problem/${problemId}`, {
        title: postTitle.trim(),
        content: postContent.trim(),
        language: postLanguage.trim(),
        codeSnippet: postCodeSnippet.trim(),
      });

      if (response.data && response.data.discussion) {
        setDiscussions((prev) => [response.data.discussion, ...prev]);
        setShowNewPostModal(false);
        setPostTitle('');
        setPostContent('');
        setPostLanguage('');
        setPostCodeSnippet('');
      }
    } catch (err) {
      setPostError(getApiErrorMessage(err));
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleUpvote = async (discussionId, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth('Sign in to Upvote', 'Log in to show appreciation for community solutions.');
      }
      return;
    }

    try {
      const response = await axiosClient.post(`/discussion/${discussionId}/upvote`);
      const { isUpvoted, upvotesCount } = response.data;

      // Update discussions list
      setDiscussions((prev) =>
        prev.map((d) => {
          if (d._id === discussionId) {
            const currentUpvotes = Array.isArray(d.upvotes) ? [...d.upvotes] : [];
            const userId = user._id;
            let nextUpvotes;
            if (isUpvoted) {
              nextUpvotes = currentUpvotes.some((u) => (u._id || u) === userId)
                ? currentUpvotes
                : [...currentUpvotes, userId];
            } else {
              nextUpvotes = currentUpvotes.filter((u) => (u._id || u) !== userId);
            }
            return {
              ...d,
              upvotes: nextUpvotes,
              upvotesCount: typeof upvotesCount === 'number' ? upvotesCount : nextUpvotes.length,
            };
          }
          return d;
        })
      );

      // Update active selected discussion if open
      if (selectedDiscussion && selectedDiscussion._id === discussionId) {
        setSelectedDiscussion((prev) => {
          if (!prev) return prev;
          const currentUpvotes = Array.isArray(prev.upvotes) ? [...prev.upvotes] : [];
          const userId = user._id;
          let nextUpvotes;
          if (isUpvoted) {
            nextUpvotes = currentUpvotes.some((u) => (u._id || u) === userId)
              ? currentUpvotes
              : [...currentUpvotes, userId];
          } else {
            nextUpvotes = currentUpvotes.filter((u) => (u._id || u) !== userId);
          }
          return {
            ...prev,
            upvotes: nextUpvotes,
            upvotesCount: typeof upvotesCount === 'number' ? upvotesCount : nextUpvotes.length,
          };
        });
      }
    } catch (err) {
      console.error('Error toggling upvote:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth('Sign in to Comment', 'Join the thread and reply to community discussions.');
      }
      return;
    }

    if (!commentContent.trim() || !selectedDiscussion) return;

    setSubmittingComment(true);
    try {
      const response = await axiosClient.post(
        `/discussion/${selectedDiscussion._id}/comment`,
        { content: commentContent.trim() }
      );

      if (response.data && response.data.comment) {
        const updatedComments = response.data.comments || [
          ...(selectedDiscussion.comments || []),
          response.data.comment,
        ];

        setSelectedDiscussion((prev) => ({
          ...prev,
          comments: updatedComments,
          commentsCount: updatedComments.length,
        }));

        setDiscussions((prev) =>
          prev.map((d) =>
            d._id === selectedDiscussion._id
              ? { ...d, comments: updatedComments, commentsCount: updatedComments.length }
              : d
          )
        );

        setCommentContent('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCopyCode = (snippet) => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredDiscussions = discussions.filter((d) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = d.title?.toLowerCase().includes(query);
    const contentMatch = d.content?.toLowerCase().includes(query);
    const authorMatch =
      d.userId?.firstName?.toLowerCase().includes(query) ||
      d.userId?.lastName?.toLowerCase().includes(query);
    const langMatch = d.language?.toLowerCase().includes(query);
    return titleMatch || contentMatch || authorMatch || langMatch;
  });

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* HEADER & CONTROLS                                             */}
      {/* ------------------------------------------------------------- */}
      {!selectedDiscussion && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">Community Discussions</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
              {discussions.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewPost}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Post</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SEARCH & SORT BAR (LIST VIEW)                                 */}
      {/* ------------------------------------------------------------- */}
      {!selectedDiscussion && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions, solutions, authors..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setSortBy('recent')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                sortBy === 'recent'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Most Recent
            </button>
            <button
              type="button"
              onClick={() => setSortBy('upvotes')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                sortBy === 'upvotes'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Most Upvoted
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DETAIL / EXPAND VIEW                                          */}
      {/* ------------------------------------------------------------- */}
      {selectedDiscussion ? (
        <div className="space-y-5 animate-in fade-in duration-150">
          <button
            type="button"
            onClick={() => setSelectedDiscussion(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to all discussions</span>
          </button>

          {/* Discussion Card */}
          <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedDiscussion.userId?.avatar ? (
                  <img
                    src={selectedDiscussion.userId.avatar}
                    alt={selectedDiscussion.userId.firstName || 'Author'}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                    {selectedDiscussion.userId?.firstName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {selectedDiscussion.userId?.firstName || 'Anonymous'}{' '}
                      {selectedDiscussion.userId?.lastName || ''}
                    </span>
                    {selectedDiscussion.language && (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-zinc-800 text-indigo-400 border border-indigo-500/20">
                        {selectedDiscussion.language}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(selectedDiscussion.createdAt)}
                  </span>
                </div>
              </div>

              {/* Upvote Button */}
              {(() => {
                const currentUserId = user?._id?.toString();
                const isUserUpvoted = (selectedDiscussion.upvotes || []).some(
                  (u) => (u._id?.toString() || u?.toString()) === currentUserId
                );
                return (
                  <button
                    type="button"
                    onClick={(e) => handleToggleUpvote(selectedDiscussion._id, e)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 border transition cursor-pointer ${
                      isUserUpvoted
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                        : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700/60'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isUserUpvoted ? 'fill-current' : ''}`} />
                    <span>{selectedDiscussion.upvotesCount ?? selectedDiscussion.upvotes?.length ?? 0}</span>
                  </button>
                );
              })()}
            </div>

            <h1 className="text-lg font-bold text-white tracking-tight">
              {selectedDiscussion.title}
            </h1>

            <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {selectedDiscussion.content}
            </div>

            {/* Code Snippet if present */}
            {selectedDiscussion.codeSnippet && (
              <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1e24]">
                <div className="px-4 py-2 bg-zinc-800/80 border-b border-zinc-700/60 flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    {selectedDiscussion.language || 'Code Snippet'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedDiscussion.codeSnippet)}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded hover:bg-zinc-700 transition cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                  <code>{selectedDiscussion.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------- */}
          {/* COMMENTS THREAD                                             */}
          {/* ----------------------------------------------------------- */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Comments ({selectedDiscussion.comments?.length || 0})</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <div className="flex gap-2.5">
                <div className="shrink-0 pt-1">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder={
                      user
                        ? 'Write a constructive comment or question...'
                        : 'Sign in to write a comment...'
                    }
                    className="w-full px-3 py-2 text-xs bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500 transition resize-y"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentContent.trim()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{submittingComment ? 'Posting...' : 'Reply'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comment List */}
            <div className="space-y-2.5 pt-2">
              {selectedDiscussion.comments && selectedDiscussion.comments.length > 0 ? (
                selectedDiscussion.comments.map((c, idx) => (
                  <div
                    key={c._id || idx}
                    className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {c.userId?.avatar ? (
                          <img
                            src={c.userId.avatar}
                            alt={c.userId.firstName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                            {c.userId?.firstName?.[0] || 'U'}
                          </div>
                        )}
                        <span className="font-semibold text-zinc-200">
                          {c.userId?.firstName || 'User'} {c.userId?.lastName || ''}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 pl-7 whitespace-pre-wrap leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
                  No comments yet. Be the first to share your thoughts!
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ----------------------------------------------------------- */
        /* DISCUSSION LIST VIEW                                        */
        /* ----------------------------------------------------------- */
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3 animate-pulse select-none">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-28 bg-zinc-800 rounded" />
                        <div className="h-2.5 w-16 bg-zinc-800/60 rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-12 bg-zinc-800/70 rounded-lg" />
                  </div>
                  <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                  <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center">
              {error}
            </div>
          ) : filteredDiscussions.length === 0 ? (
            <div className="py-12 px-4 text-center bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-3 select-none">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  {searchQuery.trim() ? 'No discussions found' : 'No discussions yet'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {searchQuery.trim()
                    ? `No discussions match "${searchQuery}". Try a different search keyword.`
                    : 'No discussions yet. Be the first to share an approach or ask a question!'}
                </p>
              </div>
              {searchQuery.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-1 text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenNewPost}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Post</span>
                </button>
              )}
            </div>
          ) : (
            filteredDiscussions.map((d) => {
              const currentUserId = user?._id?.toString();
              const isUserUpvoted = (d.upvotes || []).some(
                (u) => (u._id?.toString() || u?.toString()) === currentUserId
              );

              return (
                <div
                  key={d._id}
                  onClick={() => setSelectedDiscussion(d)}
                  className="p-4 bg-zinc-900/70 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl transition cursor-pointer space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        {d.userId?.avatar ? (
                          <img
                            src={d.userId.avatar}
                            alt={d.userId.firstName}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center text-[9px] font-bold">
                            {d.userId?.firstName?.[0] || 'U'}
                          </div>
                        )}
                        <span className="font-semibold text-zinc-300">
                          {d.userId?.firstName || 'Anonymous'} {d.userId?.lastName || ''}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(d.createdAt)}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                        {d.title}
                      </h3>
                    </div>

                    {d.language && (
                      <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-zinc-800 text-indigo-400 border border-indigo-500/20">
                        {d.language}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {d.content}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs text-zinc-500">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => handleToggleUpvote(d._id, e)}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition ${
                          isUserUpvoted
                            ? 'text-indigo-400 bg-indigo-500/10'
                            : 'hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isUserUpvoted ? 'fill-current' : ''}`} />
                        <span className="font-semibold">{d.upvotesCount ?? d.upvotes?.length ?? 0}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{d.commentsCount ?? d.comments?.length ?? 0}</span>
                      </div>

                      {d.codeSnippet && (
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                          <Code className="w-3 h-3 text-indigo-400" />
                          <span>Code snippet</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition">
                      View discussion →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* NEW DISCUSSION POST MODAL                                     */}
      {/* ------------------------------------------------------------- */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#1e1e24] border border-zinc-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Create Discussion Post</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPostModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-md transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {postError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                {postError}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Clean O(N) Two-Pointer approach with explanation"
                  className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Language (Optional)
                </label>
                <select
                  value={postLanguage}
                  onChange={(e) => setPostLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-indigo-500 transition"
                >
                  <option value="">General / Conceptual</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python3">Python 3</option>
                  <option value="c++">C++</option>
                  <option value="java">Java</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Content / Intuition <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={10000}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Explain your approach, why it works, time/space complexity, or what you're stuck on..."
                  className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500 transition resize-y leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Code Snippet (Optional)
                </label>
                <textarea
                  rows={4}
                  maxLength={20000}
                  value={postCodeSnippet}
                  onChange={(e) => setPostCodeSnippet(e.target.value)}
                  placeholder="// Paste your formatted code snippet here..."
                  className="w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg text-indigo-200 placeholder-zinc-600 focus:outline-hidden focus:border-indigo-500 transition resize-y leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingPost ? 'Publishing...' : 'Publish Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
