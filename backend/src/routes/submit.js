
const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { submitLimiter, runLimiter } = require("../middleware/rateLimiters");
const { submitCode, runCode } = require("../controllers/userSubmission");
const { getActivityHeatmap } = require("../controllers/userAuthent");

submitRouter.post("/submit/:id", userMiddleware, submitLimiter, submitCode);
submitRouter.post("/run/:id", userMiddleware, runLimiter, runCode);
submitRouter.get("/activity-heatmap", userMiddleware, getActivityHeatmap);

module.exports = submitRouter;

