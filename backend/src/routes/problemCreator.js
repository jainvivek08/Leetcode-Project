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
  getAllProblem,
  getProblemTags,
  getProblemList,
  solvedAllProblembyUser,
  submittedProblem,
} = require("../controllers/userProblem");
const userMiddleware = require("../middleware/userMiddleware");

// Admin routes
problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);
problemRouter.get("/adminProblemById/:id", adminMiddleware, getAdminProblemById);

// Public routes
problemRouter.get("/tags", getProblemTags);
problemRouter.get("/bySlug/:slug", getProblemBySlug);
problemRouter.get("/list", getProblemList);
problemRouter.get("/getAllProblem", getAllProblem);
problemRouter.get("/problemById/:id", getProblemById);

// User authenticated routes
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);

module.exports = problemRouter;
