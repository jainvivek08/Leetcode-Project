const express = require('express');
const discussionRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const {
  getProblemDiscussions,
  createDiscussion,
  toggleUpvoteDiscussion,
  addComment,
} = require('../controllers/discussionController');

// Discussion endpoints
discussionRouter.get('/problem/:problemId', getProblemDiscussions);
discussionRouter.post('/problem/:problemId', userMiddleware, createDiscussion);
discussionRouter.post('/:id/upvote', userMiddleware, toggleUpvoteDiscussion);
discussionRouter.post('/:id/comment', userMiddleware, addComment);

module.exports = discussionRouter;
