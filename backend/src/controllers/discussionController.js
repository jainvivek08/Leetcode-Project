const mongoose = require('mongoose');
const Discussion = require('../models/discussion');
const Problem = require('../models/problem');

/**
 * Helper to resolve problem ObjectId from an ID or slug
 */
const resolveProblemId = async (param) => {
  if (!param || typeof param !== 'string') return null;
  const trimmed = param.trim();
  if (mongoose.isValidObjectId(trimmed)) {
    return new mongoose.Types.ObjectId(trimmed);
  }
  const problem = await Problem.findOne({ slug: trimmed.toLowerCase() }).select('_id');
  return problem ? problem._id : null;
};

/**
 * GET /problem/:problemId/discussions or /discussion/problem/:problemId
 * Fetch discussions for the given problemId sorted by createdAt descending
 */
const getProblemDiscussions = async (req, res) => {
  try {
    const rawId = req.params.problemId || req.params.id;
    const problemId = await resolveProblemId(rawId);

    if (!problemId) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const sortOrder = req.query.sort === 'upvotes' ? { 'upvotes.length': -1, createdAt: -1 } : { createdAt: -1 };

    const discussions = await Discussion.find({ problemId })
      .sort(sortOrder)
      .populate('userId', 'firstName lastName avatar')
      .populate('comments.userId', 'firstName lastName avatar')
      .lean();

    // Map discussions to include upvotes count and sanitize user fields
    const formattedDiscussions = discussions.map((d) => ({
      ...d,
      upvotesCount: Array.isArray(d.upvotes) ? d.upvotes.length : 0,
      commentsCount: Array.isArray(d.comments) ? d.comments.length : 0,
    }));

    return res.status(200).json({
      success: true,
      discussions: formattedDiscussions,
    });
  } catch (err) {
    console.error("getProblemDiscussions error:", err);
    return res.status(500).json({ message: "Error fetching discussions: " + err.message });
  }
};

/**
 * POST /problem/:problemId/discussions or /discussion/problem/:problemId
 * Create a new discussion post (auth required)
 */
const createDiscussion = async (req, res) => {
  try {
    const rawId = req.params.problemId || req.params.id;
    const problemId = await resolveProblemId(rawId);

    if (!problemId) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const { title, content, codeSnippet, language } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: "Title is required and must be non-empty." });
    }
    if (title.trim().length > 200) {
      return res.status(400).json({ message: "Title cannot exceed 200 characters." });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ message: "Content is required and must be non-empty." });
    }
    if (content.length > 10000) {
      return res.status(400).json({ message: "Content cannot exceed 10000 characters." });
    }

    const sanitizedCodeSnippet = typeof codeSnippet === 'string' ? codeSnippet.slice(0, 20000) : '';
    const sanitizedLanguage = typeof language === 'string' ? language.trim().slice(0, 50) : '';

    const newDiscussion = await Discussion.create({
      problemId,
      userId: req.result._id,
      title: title.trim(),
      content: content.trim(),
      codeSnippet: sanitizedCodeSnippet,
      language: sanitizedLanguage,
      upvotes: [],
      comments: [],
    });

    const populatedDiscussion = await Discussion.findById(newDiscussion._id)
      .populate('userId', 'firstName lastName avatar')
      .lean();

    return res.status(201).json({
      success: true,
      message: "Discussion post created successfully",
      discussion: {
        ...populatedDiscussion,
        upvotesCount: 0,
        commentsCount: 0,
      },
    });
  } catch (err) {
    console.error("createDiscussion error:", err);
    return res.status(500).json({ message: "Error creating discussion: " + err.message });
  }
};

/**
 * POST /discussion/:id/upvote
 * Toggle upvote for discussion post (auth required)
 */
const toggleUpvoteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const userIdStr = req.result._id.toString();
    const upvoteIndex = discussion.upvotes.findIndex((uid) => uid.toString() === userIdStr);

    let isUpvoted = false;
    if (upvoteIndex > -1) {
      discussion.upvotes.splice(upvoteIndex, 1);
      isUpvoted = false;
    } else {
      discussion.upvotes.push(req.result._id);
      isUpvoted = true;
    }

    await discussion.save();

    return res.status(200).json({
      success: true,
      isUpvoted,
      upvotesCount: discussion.upvotes.length,
      message: isUpvoted ? "Upvoted discussion" : "Removed upvote",
    });
  } catch (err) {
    console.error("toggleUpvoteDiscussion error:", err);
    return res.status(500).json({ message: "Error updating upvote: " + err.message });
  }
};

/**
 * POST /discussion/:id/comment
 * Append comment to discussion post (auth required)
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid discussion ID" });
    }

    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ message: "Comment content cannot be empty." });
    }
    if (content.trim().length > 2000) {
      return res.status(400).json({ message: "Comment cannot exceed 2000 characters." });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    discussion.comments.push({
      userId: req.result._id,
      content: content.trim(),
      createdAt: new Date(),
    });

    await discussion.save();

    const updatedDiscussion = await Discussion.findById(id)
      .populate('comments.userId', 'firstName lastName avatar')
      .lean();

    const createdComment = updatedDiscussion.comments[updatedDiscussion.comments.length - 1];

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: createdComment,
      comments: updatedDiscussion.comments,
      commentsCount: updatedDiscussion.comments.length,
    });
  } catch (err) {
    console.error("addComment error:", err);
    return res.status(500).json({ message: "Error adding comment: " + err.message });
  }
};

module.exports = {
  getProblemDiscussions,
  createDiscussion,
  toggleUpvoteDiscussion,
  addComment,
};
