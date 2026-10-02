const mongoose = require("mongoose");
const problemUtility = require("../utils/problemUtility");
const { getLanguageById, normalizeLanguage, mapJudge0Status } = problemUtility;
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo");
const Discussion = require("../models/discussion");
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
    extraLimits.cpu_time_limit = timeLimit >= 100 ? timeLimit / 1000 : timeLimit;
  }
  if (typeof memoryLimit === 'number') {
    extraLimits.memory_limit = memoryLimit <= 1024 ? memoryLimit * 1024 : memoryLimit;
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

    const submitResult = await problemUtility.submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await problemUtility.submitToken(resultToken);

    if (testResult && !Array.isArray(testResult) && (testResult.status === 'judge_timeout' || testResult.status === 'time_limit_exceeded')) {
      return `Reference solution for ${language} timed out waiting for judge results.`;
    }

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

const CANONICAL_LANGUAGES = ['javascript', 'c++', 'java', 'python3'];

const canonicalLanguageName = (lang) => {
  const norm = normalizeLanguage(lang);
  if (norm === 'javascript') return 'JavaScript';
  if (norm === 'c++') return 'C++';
  if (norm === 'java') return 'Java';
  if (norm === 'python3') return 'Python3';
  return lang;
};

function normalizeSolutionsForCompare(solutions) {
  if (!Array.isArray(solutions)) return [];
  return solutions
    .map((s) => ({
      language: normalizeLanguage(s.language),
      completeCode: String(s.completeCode || '').replace(/\r\n/g, '\n').trim(),
    }))
    .sort((a, b) => a.language.localeCompare(b.language));
}

function normalizeVisibleCasesForCompare(cases) {
  if (!Array.isArray(cases)) return [];
  return cases.map((c) => ({
    input: String(c.input || '').replace(/\r\n/g, '\n').trim(),
    output: String(c.output || '').replace(/\r\n/g, '\n').trim(),
    explanation: String(c.explanation || '').replace(/\r\n/g, '\n').trim(),
  }));
}

function normalizeHiddenCasesForCompare(cases) {
  if (!Array.isArray(cases)) return [];
  return cases.map((c) => ({
    input: String(c.input || '').replace(/\r\n/g, '\n').trim(),
    output: String(c.output || '').replace(/\r\n/g, '\n').trim(),
  }));
}

const validateProblemPayload = (data, isCreate = true, existingProblem = null) => {
  // Title: 1-150 chars
  if (isCreate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string') {
      return { valid: false, field: 'title', message: 'Title is required and must be a string.' };
    }
    const trimmedTitle = data.title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 150) {
      return { valid: false, field: 'title', message: 'Title must be between 1 and 150 characters.' };
    }
  }

  // Description: 1-20000 chars
  if (isCreate || data.description !== undefined) {
    if (!data.description || typeof data.description !== 'string') {
      return { valid: false, field: 'description', message: 'Description is required and must be a string.' };
    }
    const trimmedDesc = data.description.trim();
    if (trimmedDesc.length < 1 || trimmedDesc.length > 20000) {
      return { valid: false, field: 'description', message: 'Description must be between 1 and 20000 characters.' };
    }
  }

  // Difficulty: enum
  if (isCreate || data.difficulty !== undefined) {
    if (!data.difficulty || typeof data.difficulty !== 'string') {
      return { valid: false, field: 'difficulty', message: 'Difficulty is required.' };
    }
    const diff = data.difficulty.toLowerCase().trim();
    if (!['easy', 'medium', 'hard'].includes(diff)) {
      return { valid: false, field: 'difficulty', message: 'Difficulty must be one of: easy, medium, hard.' };
    }
  }

  // Tags: 1-6 canonical tags
  if (isCreate || data.tags !== undefined) {
    const tagCheck = validateAndNormalizeTags(data.tags);
    if (!tagCheck.valid) {
      return { valid: false, field: 'tags', message: tagCheck.error };
    }
  }

  // Constraints: optional markdown text or array of strings
  if (data.constraints !== undefined && data.constraints !== null) {
    if (typeof data.constraints !== 'string' && !Array.isArray(data.constraints)) {
      return { valid: false, field: 'constraints', message: 'Constraints must be a string or an array of strings.' };
    }
  }

  // TimeLimit: 100-10000 ms, or 1-10 s
  if (data.timeLimit !== undefined) {
    const tl = Number(data.timeLimit);
    if (isNaN(tl) || tl < 1 || (tl > 10 && tl < 100) || tl > 10000) {
      return { valid: false, field: 'timeLimit', message: 'Time limit must be between 100 and 10000 ms (or 1 to 10 seconds).' };
    }
  }

  // MemoryLimit: 64-512 MB or 64000-512000 KB
  if (data.memoryLimit !== undefined) {
    const ml = Number(data.memoryLimit);
    if (isNaN(ml) || ml < 64 || (ml > 512 && ml < 64000) || ml > 512000) {
      return { valid: false, field: 'memoryLimit', message: 'Memory limit must be between 64 and 512 MB (or 64000 to 512000 KB).' };
    }
  }

  // Visible test cases: 1..10, input/output/explanation non-empty, input/output <= 5000 chars
  if (isCreate || data.visibleTestCases !== undefined) {
    if (!Array.isArray(data.visibleTestCases) || data.visibleTestCases.length < 1 || data.visibleTestCases.length > 10) {
      return { valid: false, field: 'visibleTestCases', message: 'visibleTestCases must contain between 1 and 10 test cases.' };
    }
    for (let i = 0; i < data.visibleTestCases.length; i++) {
      const tc = data.visibleTestCases[i];
      if (!tc || typeof tc !== 'object') {
        return { valid: false, field: 'visibleTestCases', message: `visibleTestCases #${i + 1} must be an object.` };
      }
      if (tc.input === undefined || tc.input === null || String(tc.input).trim() === '') {
        return { valid: false, field: 'visibleTestCases', message: `visibleTestCases #${i + 1}: input cannot be empty.` };
      }
      if (tc.output === undefined || tc.output === null || String(tc.output).trim() === '') {
        return { valid: false, field: 'visibleTestCases', message: `visibleTestCases #${i + 1}: output cannot be empty.` };
      }
      if (tc.explanation === undefined || tc.explanation === null || String(tc.explanation).trim() === '') {
        return { valid: false, field: 'visibleTestCases', message: `visibleTestCases #${i + 1}: explanation cannot be empty.` };
      }
      if (String(tc.input).length > 5000 || String(tc.output).length > 5000) {
        return { valid: false, field: 'visibleTestCases', message: `visibleTestCases #${i + 1}: input and output cannot exceed 5000 characters.` };
      }
    }
  }

  // Hidden test cases: 1..50, input/output non-empty, input/output <= 5000 chars
  if (isCreate || data.hiddenTestCases !== undefined) {
    if (!Array.isArray(data.hiddenTestCases) || data.hiddenTestCases.length < 1 || data.hiddenTestCases.length > 50) {
      return { valid: false, field: 'hiddenTestCases', message: 'hiddenTestCases must contain between 1 and 50 test cases.' };
    }
    for (let i = 0; i < data.hiddenTestCases.length; i++) {
      const tc = data.hiddenTestCases[i];
      if (!tc || typeof tc !== 'object') {
        return { valid: false, field: 'hiddenTestCases', message: `hiddenTestCases #${i + 1} must be an object.` };
      }
      if (tc.input === undefined || tc.input === null || String(tc.input).trim() === '') {
        return { valid: false, field: 'hiddenTestCases', message: `hiddenTestCases #${i + 1}: input cannot be empty.` };
      }
      if (tc.output === undefined || tc.output === null || String(tc.output).trim() === '') {
        return { valid: false, field: 'hiddenTestCases', message: `hiddenTestCases #${i + 1}: output cannot be empty.` };
      }
      if (String(tc.input).length > 5000 || String(tc.output).length > 5000) {
        return { valid: false, field: 'hiddenTestCases', message: `hiddenTestCases #${i + 1}: input and output cannot exceed 5000 characters.` };
      }
    }
  }

  // startCode: at most one entry per language, canonical list
  const startCodes = data.startCode !== undefined ? data.startCode : (existingProblem ? existingProblem.startCode : []);
  if (isCreate || data.startCode !== undefined) {
    if (!Array.isArray(startCodes) || startCodes.length < 1) {
      return { valid: false, field: 'startCode', message: 'startCode must contain at least one entry.' };
    }
    const seenStartLangs = new Set();
    for (let i = 0; i < startCodes.length; i++) {
      const sc = startCodes[i];
      if (!sc || typeof sc !== 'object') {
        return { valid: false, field: 'startCode', message: `startCode #${i + 1} must be an object.` };
      }
      const norm = normalizeLanguage(sc.language);
      if (!CANONICAL_LANGUAGES.includes(norm)) {
        return { valid: false, field: 'startCode', message: `startCode: Unsupported language "${sc.language}". Allowed: JavaScript, C++, Java, Python3.` };
      }
      if (seenStartLangs.has(norm)) {
        return { valid: false, field: 'startCode', message: `startCode: Duplicate entry for language "${sc.language}".` };
      }
      seenStartLangs.add(norm);
      if (!sc.initialCode || typeof sc.initialCode !== 'string' || !sc.initialCode.trim()) {
        return { valid: false, field: 'startCode', message: `startCode: initialCode is required for ${sc.language}.` };
      }
    }
  }

  // referenceSolution: at most one entry per language, canonical list, at least one entry
  const refSolutions = data.referenceSolution !== undefined ? data.referenceSolution : (existingProblem ? existingProblem.referenceSolution : []);
  if (isCreate || data.referenceSolution !== undefined) {
    if (!Array.isArray(refSolutions) || refSolutions.length < 1) {
      return { valid: false, field: 'referenceSolution', message: 'referenceSolution must contain at least one entry.' };
    }
    const seenRefLangs = new Set();
    for (let i = 0; i < refSolutions.length; i++) {
      const ref = refSolutions[i];
      if (!ref || typeof ref !== 'object') {
        return { valid: false, field: 'referenceSolution', message: `referenceSolution #${i + 1} must be an object.` };
      }
      const norm = normalizeLanguage(ref.language);
      if (!CANONICAL_LANGUAGES.includes(norm)) {
        return { valid: false, field: 'referenceSolution', message: `referenceSolution: Unsupported language "${ref.language}". Allowed: JavaScript, C++, Java, Python3.` };
      }
      if (seenRefLangs.has(norm)) {
        return { valid: false, field: 'referenceSolution', message: `referenceSolution: Duplicate entry for language "${ref.language}".` };
      }
      seenRefLangs.add(norm);
      if (!ref.completeCode || typeof ref.completeCode !== 'string' || !ref.completeCode.trim()) {
        return { valid: false, field: 'referenceSolution', message: `referenceSolution: completeCode is required for ${ref.language}.` };
      }
    }
  }

  // Cross-check: every referenceSolution language must also have a startCode entry
  const finalStartLangs = new Set((startCodes || []).map((s) => normalizeLanguage(s.language)));
  for (const ref of (refSolutions || [])) {
    const norm = normalizeLanguage(ref.language);
    if (!finalStartLangs.has(norm)) {
      return { valid: false, field: 'referenceSolution', message: `referenceSolution: Language "${ref.language}" must also have a startCode entry.` };
    }
  }

  return { valid: true };
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
    // 1. Comprehensive input validation (A2)
    const validation = validateProblemPayload(req.body, true);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const trimmedTitle = title.trim();

    // 2. Title uniqueness check (A3)
    const existingProblem = await Problem.findOne({
      title: { $regex: new RegExp(`^${trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (existingProblem) {
      return res.status(409).json({ message: "A problem with this title already exists." });
    }

    const tagCheck = validateAndNormalizeTags(tags);
    const cleanConstraints = Array.isArray(constraints)
      ? constraints.map((c) => String(c).trim()).filter(Boolean).join('\n')
      : (typeof constraints === 'string' ? constraints.trim() : '');
    const parsedTimeLimit = timeLimit != null
      ? (Number(timeLimit) <= 10 ? Number(timeLimit) * 1000 : Number(timeLimit))
      : 2000;
    const parsedMemoryLimit = memoryLimit != null
      ? (Number(memoryLimit) <= 512 ? Number(memoryLimit) * 1000 : Number(memoryLimit))
      : 256000;

    const formattedStartCode = (startCode || []).map((s) => ({
      language: canonicalLanguageName(s.language),
      initialCode: s.initialCode,
    }));
    const formattedRefSolution = (referenceSolution || []).map((r) => ({
      language: canonicalLanguageName(r.language),
      completeCode: r.completeCode,
    }));

    // 3. Verify reference solution on Judge0
    const verifyError = await verifyReferenceSolutions(
      formattedRefSolution,
      visibleTestCases,
      hiddenTestCases,
      parsedTimeLimit,
      parsedMemoryLimit
    );
    if (verifyError) {
      return res.status(400).json({ message: verifyError });
    }

    const problemNumber = await getNextSequence('problemNumber');
    const slug = await generateUniqueSlug(trimmedTitle, Problem);

    const userProblem = await Problem.create({
      title: trimmedTitle,
      description: description.trim(),
      difficulty: difficulty.toLowerCase().trim(),
      tags: tagCheck.tags,
      problemNumber,
      slug,
      constraints: cleanConstraints,
      timeLimit: parsedTimeLimit,
      memoryLimit: parsedMemoryLimit,
      visibleTestCases,
      hiddenTestCases,
      startCode: formattedStartCode,
      referenceSolution: formattedRefSolution,
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

    // 1. Validate payload (A2)
    const validation = validateProblemPayload(req.body, false, DsaProblem);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const updateData = { ...req.body };
    // Rule: NEVER change slug or problemNumber, even if sent in body
    delete updateData.slug;
    delete updateData.problemNumber;
    delete updateData.problemCreator;

    // 2. Title uniqueness check (A3)
    if (updateData.title !== undefined) {
      const trimmedTitle = updateData.title.trim();
      const existingProblem = await Problem.findOne({
        _id: { $ne: id },
        title: { $regex: new RegExp(`^${trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      if (existingProblem) {
        return res.status(409).json({ message: "A problem with this title already exists." });
      }
      updateData.title = trimmedTitle;
    }

    if (updateData.description !== undefined) {
      updateData.description = updateData.description.trim();
    }

    if (updateData.difficulty !== undefined) {
      updateData.difficulty = updateData.difficulty.toLowerCase().trim();
    }

    if (updateData.tags !== undefined) {
      const tagCheck = validateAndNormalizeTags(updateData.tags);
      updateData.tags = tagCheck.tags;
    }

    if (updateData.constraints !== undefined) {
      updateData.constraints = Array.isArray(updateData.constraints)
        ? updateData.constraints.map((c) => String(c).trim()).filter(Boolean).join('\n')
        : (typeof updateData.constraints === 'string' ? updateData.constraints.trim() : '');
    }

    let parsedTimeLimit = DsaProblem.timeLimit;
    if (updateData.timeLimit !== undefined) {
      parsedTimeLimit = Number(updateData.timeLimit) <= 10
        ? Number(updateData.timeLimit) * 1000
        : Number(updateData.timeLimit);
      updateData.timeLimit = parsedTimeLimit;
    }

    let parsedMemoryLimit = DsaProblem.memoryLimit;
    if (updateData.memoryLimit !== undefined) {
      parsedMemoryLimit = Number(updateData.memoryLimit) <= 512
        ? Number(updateData.memoryLimit) * 1000
        : Number(updateData.memoryLimit);
      updateData.memoryLimit = parsedMemoryLimit;
    }

    if (updateData.startCode !== undefined) {
      updateData.startCode = updateData.startCode.map((s) => ({
        language: canonicalLanguageName(s.language),
        initialCode: s.initialCode,
      }));
    }

    if (updateData.referenceSolution !== undefined) {
      updateData.referenceSolution = updateData.referenceSolution.map((r) => ({
        language: canonicalLanguageName(r.language),
        completeCode: r.completeCode,
      }));
    }

    // 3. Conditional Judge0 verification (A1)
    let referenceSolutionChanged = false;
    if (updateData.referenceSolution !== undefined) {
      const normOld = JSON.stringify(normalizeSolutionsForCompare(DsaProblem.referenceSolution));
      const normNew = JSON.stringify(normalizeSolutionsForCompare(updateData.referenceSolution));
      if (normOld !== normNew) {
        referenceSolutionChanged = true;
      }
    }

    let visibleChanged = false;
    if (updateData.visibleTestCases !== undefined) {
      const normOld = JSON.stringify(normalizeVisibleCasesForCompare(DsaProblem.visibleTestCases));
      const normNew = JSON.stringify(normalizeVisibleCasesForCompare(updateData.visibleTestCases));
      if (normOld !== normNew) {
        visibleChanged = true;
      }
    }

    let hiddenChanged = false;
    if (updateData.hiddenTestCases !== undefined) {
      const normOld = JSON.stringify(normalizeHiddenCasesForCompare(DsaProblem.hiddenTestCases));
      const normNew = JSON.stringify(normalizeHiddenCasesForCompare(updateData.hiddenTestCases));
      if (normOld !== normNew) {
        hiddenChanged = true;
      }
    }

    const reverified = referenceSolutionChanged || visibleChanged || hiddenChanged;

    if (reverified) {
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
    }

    const newProblem = await Problem.findByIdAndUpdate(
      id,
      updateData,
      { runValidators: true, new: true }
    );

    return res.status(200).json({
      message: "Problem updated",
      problem: {
        _id: newProblem._id,
        slug: newProblem.slug,
        problemNumber: newProblem.problemNumber,
        title: newProblem.title,
      },
      reverified,
    });
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

    const problemId = deletedProblem._id;

    // 1. Cascade delete all associated submissions
    const subResult = await Submission.deleteMany({ problemId });
    const deletedSubmissions = subResult.deletedCount || 0;

    // 2. Cascade delete all associated solution videos and Cloudinary assets
    const videos = await SolutionVideo.find({ problemId });
    for (const video of videos) {
      if (video.cloudinaryPublicId) {
        try {
          await deleteCloudinaryVideo(video.cloudinaryPublicId);
        } catch (cloudErr) {
          console.error(`Failed to delete Cloudinary asset ${video.cloudinaryPublicId}:`, cloudErr);
        }
      }
    }
    const videoResult = await SolutionVideo.deleteMany({ problemId });
    const deletedVideos = videoResult.deletedCount || 0;

    // 3. Cascade delete all associated discussion threads
    await Discussion.deleteMany({ problemId });

    // 4. $pull that problemId from problemSolved and bookmarks of all Users
    const userResult = await User.updateMany(
      { $or: [{ problemSolved: problemId }, { bookmarks: problemId }] },
      { $pull: { problemSolved: problemId, bookmarks: problemId } }
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
  const id = req.params.identifier || req.params.id;

  try {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: "Invalid problem identifier" });
    }

    const trimmed = id.trim();
    let query;
    if (mongoose.isValidObjectId(trimmed)) {
      query = { _id: trimmed };
    } else {
      query = { slug: trimmed.toLowerCase() };
    }

    const getProblem = await Problem.findOne(query).select(
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
    const {
      page = 1,
      limit = 20,
      search,
      difficulty,
      tag,
      sortBy = 'problemNumber',
      sort,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    const filter = {};

    // Search query on title and slug
    if (search && typeof search === 'string') {
      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escaped, 'i');
        filter.$or = [
          { title: { $regex: searchRegex } },
          { slug: { $regex: searchRegex } },
        ];
      }
    }

    // Difficulty filter
    if (difficulty && typeof difficulty === 'string') {
      const diff = difficulty.toLowerCase().trim();
      if (['easy', 'medium', 'hard'].includes(diff)) {
        filter.difficulty = diff;
      }
    }

    // Tag filter
    if (tag && typeof tag === 'string') {
      const trimmedTag = tag.trim();
      if (trimmedTag && trimmedTag.toLowerCase() !== 'all') {
        const tagParts = trimmedTag
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        if (tagParts.length === 1) {
          const matched = CANONICAL_TAGS.find(
            (ct) => ct.toLowerCase() === tagParts[0].toLowerCase()
          );
          filter.tags = matched || tagParts[0];
        } else if (tagParts.length > 1) {
          const canonicalParts = tagParts.map((tp) => {
            const matched = CANONICAL_TAGS.find(
              (ct) => ct.toLowerCase() === tp.toLowerCase()
            );
            return matched || tp;
          });
          filter.tags = { $all: canonicalParts };
        }
      }
    }

    // Sort options: problemNumber, difficulty, title
    const effectiveSort = sortBy || sort || 'problemNumber';
    let sortObj = { problemNumber: 1, _id: 1 };
    if (effectiveSort === 'title' || effectiveSort === 'alpha') {
      sortObj = { title: 1 };
    } else if (effectiveSort === 'difficulty') {
      sortObj = { difficulty: 1, problemNumber: 1 };
    } else if (effectiveSort === 'newest') {
      sortObj = { _id: -1 };
    } else if (effectiveSort === 'oldest') {
      sortObj = { _id: 1 };
    } else {
      sortObj = { problemNumber: 1, _id: 1 };
    }

    const totalProblems = await Problem.countDocuments(filter);
    const totalPages = Math.ceil(totalProblems / limitNum) || 1;
    const skip = (pageNum - 1) * limitNum;

    const problems = await Problem.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .select('_id problemNumber title slug difficulty tags timeLimit memoryLimit');

    const pagination = {
      currentPage: pageNum,
      totalPages,
      totalProblems,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    };

    return res.status(200).json({
      success: true,
      problems,
      pagination,
      availableTags: CANONICAL_TAGS,
      total: totalProblems,
      totalPages,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error: " + err.message });
  }
};

/**
 * GET /problem/all-lite
 * Returns unpaginated array of problems capped at 1000 items.
 * Strictly excludes referenceSolution and hiddenTestCases.
 */
const getAllProblemLite = async (req, res, next) => {
  try {
    const problems = await Problem.find({})
      .sort({ problemNumber: 1, _id: 1 })
      .limit(1000)
      .select('_id problemNumber slug title difficulty tags')
      .lean();

    return res.status(200).json(problems);
  } catch (err) {
    next(err);
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

    const showHiddenDetails = process.env.SHOW_FAILED_HIDDEN_TEST_DETAILS !== 'false';
    const sanitized = ans.map((sub) => {
      const doc = sub.toObject();
      if (!showHiddenDetails && doc.failedTestCase && doc.failedTestCase.isHidden) {
        doc.failedTestCase.input = null;
        doc.failedTestCase.expectedOutput = null;
        doc.failedTestCase.actualOutput = null;
      }
      doc.runtimePercentile = doc.runtimePercentile != null ? doc.runtimePercentile : null;
      doc.memoryPercentile = doc.memoryPercentile != null ? doc.memoryPercentile : null;
      return doc;
    });

    return res.status(200).json(sanitized);
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

const getAdminProblemList = async (req, res) => {
  try {
    const problems = await Problem.find({})
      .select('_id problemNumber slug title difficulty tags createdAt visibleTestCases hiddenTestCases')
      .sort({ problemNumber: 1, _id: 1 })
      .lean();

    const videos = await SolutionVideo.find({}, { problemId: 1 }).lean();
    const videoProblemIds = new Set(videos.map((v) => String(v.problemId)));

    const adminList = problems.map((p) => {
      let createdAt = p.createdAt;
      if (!createdAt && p._id) {
        try {
          const timestamp = parseInt(String(p._id).substring(0, 8), 16) * 1000;
          createdAt = new Date(timestamp);
        } catch {
          createdAt = null;
        }
      }

      return {
        _id: p._id,
        problemNumber: p.problemNumber,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags,
        createdAt,
        hasVideo: videoProblemIds.has(String(p._id)),
        visibleCount: Array.isArray(p.visibleTestCases) ? p.visibleTestCases.length : 0,
        hiddenCount: Array.isArray(p.hiddenTestCases) ? p.hiddenTestCases.length : 0,
      };
    });

    return res.status(200).json(adminList);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch admin problem list: " + err.message });
  }
};

const getDailyChallenge = async (req, res) => {
  try {
    const totalCount = await Problem.countDocuments({});
    if (totalCount === 0) {
      return res.status(404).json({ success: false, message: "No problems found" });
    }

    // Deterministic problem selection based on current UTC date string (YYYY-MM-DD)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    // Compute deterministic hash from date string modulo total problems count
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
    }
    const index = hash % totalCount;

    const problem = await Problem.findOne({})
      .sort({ problemNumber: 1, _id: 1 })
      .skip(index)
      .select('_id problemNumber title slug difficulty tags')
      .lean();

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    return res.status(200).json({
      success: true,
      date: dateStr,
      problem: {
        _id: problem._id,
        problemNumber: problem.problemNumber,
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        tags: problem.tags,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const problem = await Problem.findById(id).select('_id');
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const userId = req.result._id;
    const user = await User.findById(userId).select('bookmarks');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentBookmarks = Array.isArray(user.bookmarks) ? user.bookmarks.map((b) => b.toString()) : [];
    const isBookmarked = currentBookmarks.includes(id.toString());

    let updatedUser;
    if (isBookmarked) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { bookmarks: id } },
        { new: true }
      ).select('bookmarks');
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { bookmarks: id } },
        { new: true }
      ).select('bookmarks');
    }

    const bookmarksCount = updatedUser?.bookmarks?.length || 0;

    return res.status(200).json({
      success: true,
      bookmarked: !isBookmarked,
      bookmarksCount,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error: " + err.message });
  }
};

const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId)
      .populate({
        path: 'bookmarks',
        select: '_id problemNumber slug title difficulty tags',
      })
      .select('bookmarks')
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      bookmarks: user.bookmarks || [],
    });
  } catch (err) {
    return res.status(500).json({ message: "Error: " + err.message });
  }
};

module.exports = {
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
  getUserBookmarks,
};
