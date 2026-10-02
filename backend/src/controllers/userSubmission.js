const mongoose = require("mongoose");
const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const problemUtility = require("../utils/problemUtility");
const {
  normalizeLanguage,
  getLanguageById,
  mapJudge0Status,
  getErrorMessage,
} = problemUtility;

const truncateString = (str, maxLen = 2000) => {
  if (str === null || str === undefined) return str;
  const s = String(str);
  if (s.length <= maxLen) return s;
  return s.substring(0, maxLen) + '... (truncated)';
};

const getTimeLimitInSeconds = (timeLimit) => {
  if (typeof timeLimit !== 'number' || isNaN(timeLimit)) return 2;
  // If stored in milliseconds (>= 100), convert to seconds
  if (timeLimit >= 100) return timeLimit / 1000;
  // If already in seconds
  return timeLimit;
};

const getMemoryLimitInKB = (memoryLimit) => {
  if (typeof memoryLimit !== 'number' || isNaN(memoryLimit)) return 256000;
  // If stored in MB (<= 1024), convert to KB
  if (memoryLimit <= 1024) return memoryLimit * 1024;
  // If already in KB
  return memoryLimit;
};

const submitCode = async (req, res) => {
  let submittedResult = null;
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    if (!problemId || typeof problemId !== 'string') {
      return res.status(400).json({ message: "Invalid problem ID" });
    }

    const trimmedId = problemId.trim();
    let problem;
    if (mongoose.isValidObjectId(trimmedId)) {
      problem = await Problem.findById(trimmedId);
    } else {
      problem = await Problem.findOne({ slug: trimmedId.toLowerCase() });
    }

    if (!problem)
      return res.status(404).json({ message: "Problem not found" });

    let { code, language } = req.body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({ message: "Code must be a non-empty string" });
    }

    if (code.length > 65536) {
      return res.status(400).json({ message: "Code size exceeds the maximum allowed limit of 64KB." });
    }

    if (!language || typeof language !== 'string') {
      return res.status(400).json({ message: "Language must be a string" });
    }

    language = normalizeLanguage(language);
    const languageId = getLanguageById(language);

    // Order: visible test cases followed by hidden test cases
    const visible = Array.isArray(problem.visibleTestCases) ? problem.visibleTestCases : [];
    const hidden = Array.isArray(problem.hiddenTestCases) ? problem.hiddenTestCases : [];
    const allTestCases = [
      ...visible.map((tc, idx) => ({ ...(tc.toObject ? tc.toObject() : tc), isHidden: false, index: idx + 1 })),
      ...hidden.map((tc, idx) => ({ ...(tc.toObject ? tc.toObject() : tc), isHidden: true, index: visible.length + idx + 1 })),
    ];

    if (allTestCases.length === 0)
      return res.status(400).json({ message: "No test cases found for this problem" });

    // Create pending submission
    submittedResult = await Submission.create({
      userId,
      problemId: problem._id,
      code,
      language,
      status: 'pending',
      testCasesTotal: allTestCases.length,
    });

    try {
      // Judge0 code batch execution
      const extraLimits = {
        cpu_time_limit: getTimeLimitInSeconds(problem.timeLimit),
        memory_limit: getMemoryLimitInKB(problem.memoryLimit),
      };

      const submissions = allTestCases.map((testcase) => ({
        source_code: code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
        ...extraLimits,
      }));

      const submitResult = await problemUtility.submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await problemUtility.submitToken(resultToken);

      if (testResult && !Array.isArray(testResult) && (testResult.status === 'judge_timeout' || testResult.status === 'time_limit_exceeded')) {
        submittedResult.status = testResult.status;
        submittedResult.errorMessage = testResult.message;
        await submittedResult.save();

        return res.status(200).json({
          accepted: false,
          status: testResult.status,
          message: testResult.message,
          errorMessage: testResult.message,
          totalTestCases: submittedResult.testCasesTotal,
          passedTestCases: 0,
        });
      }

      let testCasesPassed = 0;
      let finalStatus = 'accepted';
      let errorMessage = '';
      let firstFailingTest = null;
      let firstFailingIndex = -1;
      const runtimes = [];
      const memories = [];

      for (let i = 0; i < testResult.length; i++) {
        const test = testResult[i];
        const mappedStatus = mapJudge0Status(test);

        if (test.time != null) {
          const timeMs = parseFloat(test.time) * 1000;
          if (!isNaN(timeMs)) {
            runtimes.push(timeMs);
          }
        }
        if (test.memory != null) {
          const mem = parseFloat(test.memory);
          if (!isNaN(mem)) {
            memories.push(mem);
          }
        }

        if (mappedStatus === 'accepted') {
          testCasesPassed++;
        } else if (!firstFailingTest) {
          firstFailingTest = test;
          firstFailingIndex = i;
          finalStatus = mappedStatus;
          errorMessage = getErrorMessage(test);
        }
      }

      // Calculate the MAXIMUM runtime across all executed test cases (Math.max(...runtimes) rounded to 1 decimal place)
      let runtime = runtimes.length > 0
        ? Number(Math.max(...runtimes).toFixed(1))
        : 0;
      if (runtime === 0 && finalStatus === 'tle' && problem.timeLimit) {
        runtime = Number((getTimeLimitInSeconds(problem.timeLimit) * 1000).toFixed(1));
      }

      // Calculate the MAXIMUM memory consumed across all executed test cases (Math.max(...memories))
      const memory = memories.length > 0
        ? Number(Math.max(...memories).toFixed(1))
        : 0;

      // Build failedTestCase only if not accepted and not compile_error
      let failedTestCase = undefined;
      if (
        finalStatus !== 'accepted' &&
        finalStatus !== 'compile_error' &&
        firstFailingTest &&
        firstFailingIndex >= 0
      ) {
        const failingCase = allTestCases[firstFailingIndex];
        const showHiddenDetails = process.env.SHOW_FAILED_HIDDEN_TEST_DETAILS !== 'false';
        const shouldHide = failingCase.isHidden && !showHiddenDetails;

        let actualOutput = '';
        if (finalStatus === 'runtime_error' || finalStatus === 'tle') {
          actualOutput =
            getErrorMessage(firstFailingTest) ||
            (firstFailingTest.stdout != null ? String(firstFailingTest.stdout).trim() : finalStatus);
        } else {
          actualOutput =
            (firstFailingTest.stdout != null ? String(firstFailingTest.stdout).trim() : '') ||
            getErrorMessage(firstFailingTest);
        }

        failedTestCase = {
          index: failingCase.index,
          isHidden: failingCase.isHidden,
          input: shouldHide ? null : truncateString(failingCase.input, 2000),
          expectedOutput: shouldHide ? null : truncateString(failingCase.output, 2000),
          actualOutput: shouldHide ? null : truncateString(actualOutput, 2000),
          status: finalStatus,
        };
      }

      // Store the result in Database in Submission
      submittedResult.status = finalStatus;
      submittedResult.testCasesPassed = testCasesPassed;
      submittedResult.errorMessage = errorMessage;
      submittedResult.runtime = runtime;
      submittedResult.memory = memory;
      if (failedTestCase) {
        submittedResult.failedTestCase = failedTestCase;
      }

      let runtimePercentile = null;
      let memoryPercentile = null;

      if (finalStatus === 'accepted') {
        // Save first so this submission is persisted and counted in totalAccepted
        await submittedResult.save();

        const totalAccepted = await Submission.countDocuments({
          problemId: problem._id,
          status: 'accepted',
        });

        const slowerCount = await Submission.countDocuments({
          problemId: problem._id,
          status: 'accepted',
          runtime: { $gt: runtime },
        });

        const higherMemoryCount = await Submission.countDocuments({
          problemId: problem._id,
          status: 'accepted',
          memory: { $gt: memory },
        });

        if (totalAccepted > 1) {
          runtimePercentile = Number(((slowerCount / totalAccepted) * 100).toFixed(1));
          memoryPercentile = Number(((higherMemoryCount / totalAccepted) * 100).toFixed(1));

          // Safe tie handling: if no submission ran faster or used less memory, default to 100.0%
          const fasterRuntimeCount = await Submission.countDocuments({
            problemId: problem._id,
            status: 'accepted',
            runtime: { $lt: runtime },
          });
          if (fasterRuntimeCount === 0) {
            runtimePercentile = 100.0;
          }

          const fasterMemoryCount = await Submission.countDocuments({
            problemId: problem._id,
            status: 'accepted',
            memory: { $lt: memory },
          });
          if (fasterMemoryCount === 0) {
            memoryPercentile = 100.0;
          }
        } else {
          runtimePercentile = 100.0;
          memoryPercentile = 100.0;
        }

        // Clamp cleanly between 0.0 and 100.0
        runtimePercentile = Math.min(100.0, Math.max(0.0, runtimePercentile));
        memoryPercentile = Math.min(100.0, Math.max(0.0, memoryPercentile));

        submittedResult.runtimePercentile = runtimePercentile;
        submittedResult.memoryPercentile = memoryPercentile;
        await submittedResult.save();

        await User.updateOne(
          { _id: userId },
          { $addToSet: { problemSolved: problemId } }
        );
      } else {
        await submittedResult.save();
      }

      const accepted = finalStatus === 'accepted';
      return res.status(201).json({
        accepted,
        totalTestCases: submittedResult.testCasesTotal,
        passedTestCases: testCasesPassed,
        runtime,
        memory,
        runtimePercentile,
        memoryPercentile,
        status: finalStatus,
        errorMessage,
        failedTestCase,
      });
    } catch (judgeErr) {
      console.error("Judge0 execution failed in submitCode:", judgeErr.message);
      const isTimeout = judgeErr.status === 'judge_timeout' || judgeErr.message?.includes('timed out');
      const errorStatus = isTimeout ? 'judge_timeout' : 'error';
      const timeoutMsg = "Execution timed out while waiting for judge results. Please try again.";
      const errorMsg = isTimeout ? timeoutMsg : "Judge0 execution failed or timed out. Please try again.";
      try {
        submittedResult.status = errorStatus;
        submittedResult.errorMessage = errorMsg;
        await submittedResult.save();
      } catch (saveErr) {
        console.error("Failed to update submission to error status:", saveErr.message);
      }
      return res.status(isTimeout ? 504 : 503).json({
        message: errorMsg,
        status: errorStatus,
      });
    }
  } catch (err) {
    if (err.message === "Unsupported language") {
      return res.status(400).json({ message: "Unsupported language" });
    }
    res.status(500).json({ message: "Internal Server Error " + (err.message || err) });
  }
};

const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    if (!problemId || typeof problemId !== 'string') {
      return res.status(400).json({ message: "Invalid problem ID" });
    }

    const trimmedId = problemId.trim();
    let problem;
    if (mongoose.isValidObjectId(trimmedId)) {
      problem = await Problem.findById(trimmedId);
    } else {
      problem = await Problem.findOne({ slug: trimmedId.toLowerCase() });
    }

    if (!problem)
      return res.status(404).json({ message: "Problem not found" });

    let { code, language, customInput } = req.body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json({ message: "Code must be a non-empty string" });
    }

    if (code.length > 65536) {
      return res.status(400).json({ message: "Code size exceeds the maximum allowed limit of 64KB." });
    }

    if (!language || typeof language !== 'string') {
      return res.status(400).json({ message: "Language must be a string" });
    }

    language = normalizeLanguage(language);
    const languageId = getLanguageById(language);

    // Mode B: Custom Input Run
    if (customInput !== undefined) {
      if (typeof customInput !== 'string') {
        return res.status(400).json({ message: "Custom input must be a string" });
      }
      if (customInput.length > 10000) {
        return res.status(400).json({ message: "Custom input cannot exceed 10000 characters" });
      }

      try {
        const extraLimits = {
          cpu_time_limit: getTimeLimitInSeconds(problem.timeLimit),
          memory_limit: getMemoryLimitInKB(problem.memoryLimit),
        };

        const submissions = [
          {
            source_code: code,
            language_id: languageId,
            stdin: customInput,
            ...extraLimits,
          },
        ];

        const submitResult = await problemUtility.submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        const testResult = await problemUtility.submitToken(resultToken);

        if (testResult && !Array.isArray(testResult) && (testResult.status === 'judge_timeout' || testResult.status === 'time_limit_exceeded')) {
          return res.status(200).json({
            success: false,
            mode: 'custom',
            status: testResult.status,
            errorMessage: testResult.message,
            message: testResult.message,
            stdout: '',
            stderr: '',
            runtime: 0,
            memory: 0,
          });
        }

        const test = testResult[0] || {};

        const mappedStatus = mapJudge0Status(test);
        const success = mappedStatus === 'accepted' || test.status_id === 3;
        const finalStatus = success ? 'accepted' : mappedStatus;
        const stdout = truncateString(test.stdout != null ? String(test.stdout) : '', 10000);
        const stderr = truncateString(test.stderr != null ? String(test.stderr) : '', 10000);
        const errorMessage = getErrorMessage(test);
        let runtime = test.time != null ? Number((parseFloat(test.time) * 1000).toFixed(1)) : 0;
        if (runtime === 0 && finalStatus === 'tle' && problem.timeLimit) {
          runtime = Number((getTimeLimitInSeconds(problem.timeLimit) * 1000).toFixed(1));
        }
        const memory = test.memory != null ? Number(parseFloat(test.memory).toFixed(1)) : 0;

        return res.status(200).json({
          success,
          mode: 'custom',
          status: finalStatus,
          errorMessage,
          stdout,
          stderr,
          runtime,
          memory,
        });
      } catch (judgeErr) {
        console.error("Judge0 execution failed in runCode (customInput):", judgeErr.message);
        return res.status(503).json({
          message: "Judge0 execution failed or timed out. Please try again.",
        });
      }
    }

    // Default Mode: Visible Test Cases Run
    if (!problem.visibleTestCases || problem.visibleTestCases.length === 0)
      return res.status(400).json({ message: "No visible test cases found for this problem" });

    try {
      const extraLimits = {
        cpu_time_limit: getTimeLimitInSeconds(problem.timeLimit),
        memory_limit: getMemoryLimitInKB(problem.memoryLimit),
      };

      const submissions = problem.visibleTestCases.map((testcase) => ({
        source_code: code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
        ...extraLimits,
      }));

      const submitResult = await problemUtility.submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await problemUtility.submitToken(resultToken);

      if (testResult && !Array.isArray(testResult) && (testResult.status === 'judge_timeout' || testResult.status === 'time_limit_exceeded')) {
        return res.status(200).json({
          success: false,
          testCasesPassed: 0,
          status: testResult.status,
          errorMessage: testResult.message,
          message: testResult.message,
          runtime: 0,
          memory: 0,
        });
      }

      let testCasesPassed = 0;
      let finalStatus = 'accepted';
      let errorMessage = '';
      let firstFailingTest = null;
      const runtimes = [];
      const memories = [];

      for (const test of testResult) {
        if (test.time != null) {
          const timeMs = parseFloat(test.time) * 1000;
          if (!isNaN(timeMs)) {
            runtimes.push(timeMs);
          }
        }
        if (test.memory != null) {
          const mem = parseFloat(test.memory);
          if (!isNaN(mem)) {
            memories.push(mem);
          }
        }

        const mappedStatus = mapJudge0Status(test);
        if (mappedStatus === 'accepted') {
          testCasesPassed++;
        } else if (!firstFailingTest) {
          firstFailingTest = test;
          finalStatus = mappedStatus;
          errorMessage = getErrorMessage(test);
        }
      }

      let runtime = runtimes.length > 0
        ? Number(Math.max(...runtimes).toFixed(1))
        : 0;
      if (runtime === 0 && finalStatus === 'tle' && problem.timeLimit) {
        runtime = Number((getTimeLimitInSeconds(problem.timeLimit) * 1000).toFixed(1));
      }

      const memory = memories.length > 0
        ? Number(Math.max(...memories).toFixed(1))
        : 0;

      return res.status(201).json({
        success: finalStatus === 'accepted',
        testCases: testResult,
        runtime,
        memory,
        status: finalStatus,
        errorMessage,
      });
    } catch (judgeErr) {
      console.error("Judge0 execution failed in runCode:", judgeErr.message);
      return res.status(503).json({
        message: "Judge0 execution failed or timed out. Please try again.",
      });
    }
  } catch (err) {
    if (err.message === "Unsupported language") {
      return res.status(400).json({ message: "Unsupported language" });
    }
    res.status(500).json({ message: "Internal Server Error " + (err.message || err) });
  }
};

module.exports = { submitCode, runCode };




//     language_id: 54,
//     stdin: '2 3',
//     expected_output: '5',
//     stdout: '5',
//     status_id: 3,
//     created_at: '2025-05-12T16:47:37.239Z',
//     finished_at: '2025-05-12T16:47:37.695Z',
//     time: '0.002',
//     memory: 904,
//     stderr: null,
//     token: '611405fa-4f31-44a6-99c8-6f407bc14e73',


// User.findByIdUpdate({
// })

//const user =  User.findById(id)
// user.firstName = "Mohit";
// await user.save();