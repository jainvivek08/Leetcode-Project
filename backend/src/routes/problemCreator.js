const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getProblemBySlug,
  getAdminProblemById,
  getAdminProblemList,
  getAllProblem,
  getAllProblemLite,
  getProblemTags,
  getProblemList,
  getDailyChallenge,
  solvedAllProblembyUser,
  submittedProblem,
  toggleBookmark,
} = require("../controllers/userProblem");
const userMiddleware = require("../middleware/userMiddleware");

// Admin routes
problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);
problemRouter.get("/adminProblemById/:id", adminMiddleware, getAdminProblemById);
problemRouter.get("/adminList", adminMiddleware, getAdminProblemList);

// Public routes
problemRouter.get("/daily-challenge", getDailyChallenge);
problemRouter.get("/dailyChallenge", getDailyChallenge);
problemRouter.get("/tags", getProblemTags);
problemRouter.get("/bySlug/:slug", getProblemBySlug);
problemRouter.get("/list", getAllProblem);
problemRouter.get("/allProblem", getAllProblem);
problemRouter.get("/getAllProblem", getAllProblem);
problemRouter.get("/all-lite", getAllProblemLite);
problemRouter.get("/problemById/:id", getProblemById);

// User authenticated routes
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);
problemRouter.post("/:id/bookmark", userMiddleware, toggleBookmark);

// Discussion routes under /problem
const { getProblemDiscussions, createDiscussion } = require("../controllers/discussionController");
problemRouter.get("/:problemId/discussions", getProblemDiscussions);
problemRouter.post("/:problemId/discussions", userMiddleware, createDiscussion);

// Unified problem retrieval by ObjectId or slug (e.g. GET /problem/:identifier)
problemRouter.get("/:identifier", getProblemById);

module.exports = problemRouter;
