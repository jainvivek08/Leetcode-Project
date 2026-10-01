const mongoose = require("mongoose");
const { getLanguageById, normalizeLanguage, mapJudge0Status, submitBatch, submitToken } = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo");
const { deleteCloudinaryVideo } = require("./videoSection");
const { CANONICAL_TAGS, CANONICAL_TAGS_SET } = require("../utils/problemTags");
const { getNextSequence } = require("../models/counter");
const { generateUniqueSlug } = require("../utils/slugify");

/**
 * Validates and normalizes tags array against CANONICAL_TAGS.
 * Returns { valid: boolean, tags?: string[], error?: string }
 */
const validateAndNormalizeTags = (tagsInput) => {
  if (!tagsInput) {
    return { valid: false, error: "Tags are required." };
  }

  let tagList = [];
  if (Array.isArray(tagsInput)) {
    tagList = tagsInput;
  } else if (typeof tagsInput === 'string') {
    tagList = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  } else {
    return { valid: false, error: "Tags must be an array of strings or comma-separated string." };
  }

  const deduped = [...new Set(tagList)];

  if (deduped.length < 1 || deduped.length > 6) {
    return { valid: false, error: "Problem must have between 1 and 6 tags." };
  }

  for (const tag of deduped) {
    if (!CANONICAL_TAGS_SET.has(tag)) {
      return {
        valid: false,
        error: `Invalid tag "${tag}". Allowed tags are: ${CANONICAL_TAGS.join(', ')}`
      };
    }
  }

  return { valid: true, tags: deduped };
};

const verifyReferenceSolutions = async (referenceSolution, visibleTestCases, hiddenTestCases, timeLimit, memoryLimit) => {
  const visible = Array.isArray(visibleTestCases) ? visibleTestCases : [];
  const hidden = Array.isArray(hiddenTestCases) ? hiddenTestCases : [];

  const allTestCases = [
    ...visible.map((tc, idx) => ({ ...tc, type: 'visible', index: idx + 1 })),
    ...hidden.map((tc, idx) => ({ ...tc, type: 'hidden', index: idx + 1 }))
  ];

  if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) {
    return null;
  }

  const extraLimits = {};
  if (typeof timeLimit === 'number') {
    extraLimits.cpu_time_limit = timeLimit;
  }
  if (typeof memoryLimit === 'number') {
    extraLimits.memory_limit = memoryLimit * 1024;
  }

  for (const { language, completeCode } of referenceSolution) {
    const languageId = getLanguageById(normalizeLanguage(language));

    const submissions = allTestCases.map((tc) => ({
      source_code: completeCode,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.output,
      ...extraLimits,
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    for (let i = 0; i < testResult.length; i++) {
      const test = testResult[i];
      if (test.status_id !== 3) {
        const failedCase = allTestCases[i];
        const statusDesc = test.status?.description || mapJudge0Status(test);
        const testDesc = failedCase.type === 'visible'
          ? `visible test #${failedCase.index}`
          : `hidden test #${failedCase.index}`;
        return `Reference solution for ${language} failed on ${testDesc} with status: ${statusDesc}`;
      }
    }
  }

  return null;
};

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    constraints,
    timeLimit,
    memoryLimit,
  } = req.body;

  try {
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    const tagCheck = validateAndNormalizeTags(tags);
    if (!tagCheck.valid) {
      return res.status(400).json({ message: tagCheck.error });
    }

    // Constraints validation
    const cleanConstraints = Array.isArray(constraints)
      ? constraints.map(c => String(c).trim()).filter(Boolean)
      : [];
    if (cleanConstraints.length > 20) {
      return res.status(400).json({ message: "Constraints cannot exceed 20 items." });
    }
    for (const c of cleanConstraints) {
      if (c.length > 300) {
        return res.status(400).json({ message: "Each constraint cannot exceed 300 characters." });
      }
    }

    // Time & Memory limits validation
    const parsedTimeLimit = timeLimit != null ? Number(timeLimit) : 2;
    if (isNaN(parsedTimeLimit) || parsedTimeLimit < 1 || parsedTimeLimit > 10) {
      return res.status(400).json({ message: "Time limit must be a number between 1 and 10 seconds." });
    }

    const parsedMemoryLimit = memoryLimit != null ? Number(memoryLimit) : 256;
    if (isNaN(parsedMemoryLimit) || parsedMemoryLimit < 64 || parsedMemoryLimit > 512) {
      return res.status(400).json({ message: "Memory limit must be a number between 64 and 512 MB." });
    }

    const verifyError = await verifyReferenceSolutions(
      referenceSolution,
      visibleTestCases,
      hiddenTestCases,
      parsedTimeLimit,
      parsedMemoryLimit
    );
    if (verifyError) {
      return res.status(400).json({ message: verifyError });
    }

    const problemNumber = await getNextSequence('problemNumber');
    const slug = await generateUniqueSlug(title, Problem);

    const userProblem = await Problem.create({
      title: title.trim(),
      description,
      difficulty,
      tags: tagCheck.tags,
      problemNumber,
      slug,
      constraints: cleanConstraints,
      timeLimit: parsedTimeLimit,
      memoryLimit: parsedMemoryLimit,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
      problemCreator: req.result._id,
    });

    return res.status(201).json({
      message: "Problem Saved Successfully",
      problem: userProblem,
    });
  } catch (err) {
    if (err.message === "Unsupported language") {
      return res.status(400).json({ message: "Unsupported language" });
    }
    return res.status(400).json({ message: "Error: " + err.message });
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid problem ID" });
    }

    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) {
      return res.status(404).json({ message: "Problem is Missing" });
    }

    const updateData = { ...req.body };
    // Rule: NEVER change slug or problemNumber, even if sent in body
    delete updateData.slug;
    delete updateData.problemNumber;
    delete updateData.problemCreator;

    if (updateData.tags !== undefined) {
      const tagCheck = validateAndNormalizeTags(updateData.tags);
      if (!tagCheck.valid) {
        return res.status(400).json({ message: tagCheck.error });
      }
      updateData.tags = tagCheck.tags;
    }

    if (updateData.constraints !== undefined) {
      const cleanConstraints = Array.isArray(updateData.constraints)
        ? updateData.constraints.map(c => String(c).trim()).filter(Boolean)
        : [];
      if (cleanConstraints.length > 20) {
        return res.status(400).json({ message: "Constraints cannot exceed 20 items." });
      }
      for (const c of cleanConstraints) {
        if (c.length > 300) {
          return res.status(400).json({ message: "Each constraint cannot exceed 300 characters." });
        }
      }
      updateData.constraints = cleanConstraints;
    }

    let parsedTimeLimit = DsaProblem.timeLimit;
    if (updateData.timeLimit !== undefined) {
      parsedTimeLimit = Number(updateData.timeLimit);
      if (isNaN(parsedTimeLimit) || parsedTimeLimit < 1 || parsedTimeLimit > 10) {
        return res.status(400).json({ message: "Time limit must be a number between 1 and 10 seconds." });
      }
      updateData.timeLimit = parsedTimeLimit;
    }

    let parsedMemoryLimit = DsaProblem.memoryLimit;
    if (updateData.memoryLimit !== undefined) {
      parsedMemoryLimit = Number(updateData.memoryLimit);
      if (isNaN(parsedMemoryLimit) || parsedMemoryLimit < 64 || parsedMemoryLimit > 512) {
        return res.status(400).json({ message: "Memory limit must be a number between 64 and 512 MB." });
      }
      updateData.memoryLimit = parsedMemoryLimit;
    }

    const referenceSolution = updateData.referenceSolution || DsaProblem.referenceSolution;
    const visibleTestCases = updateData.visibleTestCases || DsaProblem.visibleTestCases;
    const hiddenTestCases = updateData.hiddenTestCases || DsaProblem.hiddenTestCases;

    const verifyError = await verifyReferenceSolutions(
      referenceSolution,
      visibleTestCases,
      hiddenTestCases,
      parsedTimeLimit,
      parsedMemoryLimit
    );
    if (verifyError) {
      return res.status(400).json({ message: verifyError });
    }

    const newProblem = await Problem.findByIdAndUpdate(
      id,
      updateData,
      { runValidators: true, new: true }
    );

    return res.status(200).json(newProblem);
  } catch (err) {
    if (err.message === "Unsupported language") {
      return res.status(400).json({ message: "Unsupported language" });
    }
    return res.status(500).json({ message: "Error: " + err.message });
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid problem ID" });
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      return res.status(404).json({ message: "Problem is Missing" });
    }

    // 1. Delete all Submissions with that problemId
    const subResult = await Submission.deleteMany({ problemId: id });
    const deletedSubmissions = subResult.deletedCount || 0;

    // 2. Find SolutionVideo docs, delete Cloudinary assets, then delete docs
    const videos = await SolutionVideo.find({ problemId: id });
    for (const video of videos) {
      if (video.cloudinaryPublicId) {
        try {
          await deleteCloudinaryVideo(video.cloudinaryPublicId);
        } catch (cloudErr) {
          console.error(`Failed to delete Cloudinary asset ${video.cloudinaryPublicId}:`, cloudErr);
        }
      }
    }
    const videoResult = await SolutionVideo.deleteMany({ problemId: id });
    const deletedVideos = videoResult.deletedCount || 0;

    // 3. $pull that problemId from problemSolved of all Users
    const userResult = await User.updateMany(
      { problemSolved: id },
      { $pull: { problemSolved: id } }
    );
    const userSolvedRefs = userResult.modifiedCount || 0;

    return res.status(200).json({
      message: "Successfully Deleted",
      deleted: {
        submissions: deletedSubmissions,
        videos: deletedVideos,
        userSolvedRefs: userSolvedRefs,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Error: " + err.message });
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid problem ID" });
    }

    const getProblem = await Problem.findById(id).select(
      '_id title description difficulty tags visibleTestCases startCode slug problemNumber constraints timeLimit memoryLimit'
    );

    if (!getProblem) {
      return res.status(404).json({ message: "Problem is Missing" });
    }

    const videos = await SolutionVideo.findOne({ problemId: id });

    if (videos) {
      const responseData = {
        ...getProblem.toObject(),
        secureUrl: videos.secureUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
      };
      return res.status(200).json(responseData);
    }

    return res.status(200).json(getProblem);
  } catch (err) {
    return res.status(500).json({ message: "Error: " + err.message });
  }
};

const getProblemBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]{1,80}$/.test(slug)) {
      return res.status(400).json({ message: "Invalid slug format" });
    }

    const getProblem = await Problem.findOne({ slug }).select(
      '_id title description difficulty tags visibleTestCases startCode slug problemNumber constraints timeLimit memoryLimit'
    );

    if (!getProblem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const videos = await SolutionVideo.findOne({ problemId: getProblem._id });

    if (videos) {
      const responseData = {
        ...getProblem.toObject(),
        secureUrl: videos.secureUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
      };
      return res.status(200).json(responseData);
    }

    return res.status(200).json(getProblem);
  } catch (err) {
    return res.status(500).json({ message: "Error: " + err.message });
  }
};

const getAdminProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid problem ID" });
    }

    const getProblem = await Problem.findById(id);

    if (!getProblem) {
      return res.status(404).json({ message: "Problem is Missing" });
    }

    const videos = await SolutionVideo.findOne({ problemId: id });

    if (videos) {
      const responseData = {
        ...getProblem.toObject(),
        secureUrl: videos.secureUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
      };
      return res.status(200).json(responseData);
    }

    return res.status(200).json(getProblem);
  } catch (err) {
    return res.status(500).json({ message: "Error: " + err.message });
  }
};

const getAllProblem = async (req, res) => {
  try {
    const getProblem = await Problem.find({}).select(
      '_id title difficulty tags slug problemNumber'
    );

    if (getProblem.length === 0) {
      return res.status(404).json({ message: "Problem is Missing" });
    }

    return res.status(200).json(getProblem);
  } catch (err) {
    return res.status(500).json({ message: "Error: " + err.message });
  }
};

const getProblemTags = async (req, res) => {
  try {
    const tagCounts = await Problem.aggregate([
      { $unwind: "$tags" },
      { $match: { tags: { $in: CANONICAL_TAGS } } },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $project: { _id: 0, tag: "$_id", count: 1 } },
    ]);

    return res.status(200).json(tagCounts);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch tags: " + err.message });
  }
};

const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.result._id;

    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags slug problemNumber",
    });

    return res.status(200).json(user.problemSolved || []);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    if (!problemId || !mongoose.isValidObjectId(problemId)) {
      return res.status(400).json({ message: "Invalid problem ID" });
    }

    const ans = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });

    return res.status(200).json(ans || []);
  } catch (err) {
    console.error("submittedProblem error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProblemList = async (req, res) => {
  try {
    let { page = 1, limit = 20, search, difficulty, tag, sort = 'newest' } = req.query;

    const pageNum = Number(page);
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      return res.status(400).json({ message: "Invalid page: must be a positive integer >= 1" });
    }

    const limitNum = Number(limit);
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ message: "Invalid limit: must be an integer between 1 and 100" });
    }

    const filter = {};

    if (search !== undefined && search !== null && search !== '') {
      if (typeof search !== 'string' || search.length > 100) {
        return res.status(400).json({ message: "Search query too long (max 100 characters)" });
      }
      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.title = { $regex: new RegExp(escaped, 'i') };
      }
    }

    if (difficulty !== undefined && difficulty !== null && difficulty !== '') {
      const diff = String(difficulty).toLowerCase().trim();
      if (!['easy', 'medium', 'hard'].includes(diff)) {
        return res.status(400).json({ message: "Invalid difficulty: must be one of easy, medium, hard" });
      }
      filter.difficulty = diff;
    }

    if (tag !== undefined && tag !== null && tag !== '') {
      const tagParts = String(tag)
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      if (tagParts.length > 5) {
        return res.status(400).json({ message: "Too many tags in filter (max 5 tags allowed)" });
      }

      for (const t of tagParts) {
        if (!CANONICAL_TAGS_SET.has(t)) {
          return res.status(400).json({
            message: `Invalid tag "${t}". Allowed tags are: ${CANONICAL_TAGS.join(', ')}`
          });
        }
      }

      // AND semantics via $all
      filter.tags = { $all: tagParts };
    }

    const sortMap = {
      newest: { _id: -1 },
      oldest: { _id: 1 },
      title: { title: 1 },
      number: { problemNumber: 1 },
    };

    const sortKey = String(sort).toLowerCase().trim();
    if (!sortMap[sortKey]) {
      return res.status(400).json({
        message: "Invalid sort: must be one of newest, oldest, title, number"
      });
    }

    const total = await Problem.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    const problems = await Problem.find(filter)
      .select('_id title difficulty tags slug problemNumber')
      .sort(sortMap[sortKey])
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      problems,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list problems: " + err.message });
  }
};

module.exports = {
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
};
