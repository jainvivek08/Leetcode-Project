const mongoose = require("mongoose");
const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {
  normalizeLanguage,
  getLanguageById,
  mapJudge0Status,
  getErrorMessage,
  submitBatch,
  submitToken
} = require("../utils/problemUtility");

const submitCode = async (req,res)=>{
    let submittedResult = null;
    try{
       const userId = req.result._id;
       const problemId = req.params.id;

       if(!problemId || !mongoose.isValidObjectId(problemId)){
         return res.status(400).json({ message: "Invalid problem ID" });
       }

       let {code,language} = req.body;

       if(!code || typeof code !== 'string' || code.trim() === ''){
         return res.status(400).json({ message: "Code must be a non-empty string" });
       }

       if(code.length > 65536){
         return res.status(400).json({ message: "Code is too large (max 64 KB)" });
       }

       if(!language || typeof language !== 'string'){
         return res.status(400).json({ message: "Language must be a string" });
       }

       language = normalizeLanguage(language);
       const languageId = getLanguageById(language);

       // Fetch the problem from database
       const problem = await Problem.findById(problemId);
       if(!problem)
         return res.status(404).json({ message: "Problem not found" });

       if(!problem.hiddenTestCases || problem.hiddenTestCases.length === 0)
         return res.status(400).json({ message: "No hidden test cases found for this problem" });

       // Create pending submission
       submittedResult = await Submission.create({
             userId,
             problemId,
             code,
             language,
             status:'pending',
             testCasesTotal:problem.hiddenTestCases.length
       });

       try {
         // Judge0 code batch execution
         const extraLimits = {};
         if (typeof problem.timeLimit === 'number') {
           extraLimits.cpu_time_limit = problem.timeLimit;
         }
         if (typeof problem.memoryLimit === 'number') {
           extraLimits.memory_limit = problem.memoryLimit * 1024;
         }

         const submissions = problem.hiddenTestCases.map((testcase)=>({
             source_code:code,
             language_id: languageId,
             stdin: testcase.input,
             expected_output: testcase.output,
             ...extraLimits
         }));

         const submitResult = await submitBatch(submissions);
         const resultToken = submitResult.map((value)=> value.token);
         const testResult = await submitToken(resultToken);

         let testCasesPassed = 0;
         let finalStatus = 'accepted';
         let errorMessage = '';
         let firstFailingTest = null;
         let maxTimeMs = 0;
         let maxMemory = 0;

         for(const test of testResult){
             const mappedStatus = mapJudge0Status(test);
             if(mappedStatus === 'accepted'){
                testCasesPassed++;
             } else if(!firstFailingTest){
                firstFailingTest = test;
                finalStatus = mappedStatus;
                errorMessage = getErrorMessage(test);
             }

             if(test.time != null){
                const timeMs = parseFloat(test.time) * 1000;
                if(!isNaN(timeMs)){
                   maxTimeMs = Math.max(maxTimeMs, timeMs);
                }
             }
             if(test.memory != null){
                const mem = parseFloat(test.memory);
                if(!isNaN(mem)){
                   maxMemory = Math.max(maxMemory, mem);
                }
             }
         }

         const runtime = Math.round(maxTimeMs * 100) / 100;
         const memory = maxMemory;

         // Store the result in Database in Submission
         submittedResult.status = finalStatus;
         submittedResult.testCasesPassed = testCasesPassed;
         submittedResult.errorMessage = errorMessage;
         submittedResult.runtime = runtime;
         submittedResult.memory = memory;

         await submittedResult.save();

         if (finalStatus === 'accepted') {
           await User.updateOne(
             { _id: userId },
             { $addToSet: { problemSolved: problemId } }
           );
         }
         
         const accepted = (finalStatus === 'accepted');
         return res.status(201).json({
           accepted,
           totalTestCases: submittedResult.testCasesTotal,
           passedTestCases: testCasesPassed,
           runtime,
           memory,
           status: finalStatus,
           errorMessage
         });
       } catch (judgeErr) {
         console.error("Judge0 execution failed in submitCode:", judgeErr.message);
         try {
           submittedResult.status = 'error';
           submittedResult.errorMessage = "Judge0 execution failed or timed out. Please try again.";
           await submittedResult.save();
         } catch (saveErr) {
           console.error("Failed to update submission to error status:", saveErr.message);
         }
         return res.status(503).json({
           message: "Judge0 execution failed or timed out. Please try again.",
           status: 'error'
         });
       }
    }
    catch(err){
      if(err.message === "Unsupported language"){
        return res.status(400).json({ message: "Unsupported language" });
      }
      res.status(500).json({ message: "Internal Server Error " + (err.message || err) });
    }
}


const runCode = async(req,res)=>{
     try{
      const userId = req.result._id;
      const problemId = req.params.id;

      if(!problemId || !mongoose.isValidObjectId(problemId)){
        return res.status(400).json({ message: "Invalid problem ID" });
      }

      let {code,language} = req.body;

      if(!code || typeof code !== 'string' || code.trim() === ''){
        return res.status(400).json({ message: "Code must be a non-empty string" });
      }

      if(code.length > 65536){
        return res.status(400).json({ message: "Code is too large (max 64 KB)" });
      }

      if(!language || typeof language !== 'string'){
        return res.status(400).json({ message: "Language must be a string" });
      }

      language = normalizeLanguage(language);
      const languageId = getLanguageById(language);

      // Fetch the problem from database
      const problem = await Problem.findById(problemId);
      if(!problem)
        return res.status(404).json({ message: "Problem not found" });

      if(!problem.visibleTestCases || problem.visibleTestCases.length === 0)
        return res.status(400).json({ message: "No visible test cases found for this problem" });

      try {
        // Judge0 code ko submit karna hai
        const extraLimits = {};
        if (typeof problem.timeLimit === 'number') {
          extraLimits.cpu_time_limit = problem.timeLimit;
        }
        if (typeof problem.memoryLimit === 'number') {
          extraLimits.memory_limit = problem.memoryLimit * 1024;
        }

        const submissions = problem.visibleTestCases.map((testcase)=>({
            source_code:code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
            ...extraLimits
        }));

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value)=> value.token);
        const testResult = await submitToken(resultToken);

        let testCasesPassed = 0;
        let finalStatus = 'accepted';
        let errorMessage = '';
        let firstFailingTest = null;
        let maxTimeMs = 0;
        let maxMemory = 0;

        for(const test of testResult){
            const mappedStatus = mapJudge0Status(test);
            if(mappedStatus === 'accepted'){
               testCasesPassed++;
            } else if(!firstFailingTest){
               firstFailingTest = test;
               finalStatus = mappedStatus;
               errorMessage = getErrorMessage(test);
            }

            if(test.time != null){
               const timeMs = parseFloat(test.time) * 1000;
               if(!isNaN(timeMs)){
                  maxTimeMs = Math.max(maxTimeMs, timeMs);
               }
            }
            if(test.memory != null){
               const mem = parseFloat(test.memory);
               if(!isNaN(mem)){
                  maxMemory = Math.max(maxMemory, mem);
               }
            }
        }

        const runtime = Math.round(maxTimeMs * 100) / 100;
        const memory = maxMemory;

        return res.status(201).json({
          success: (finalStatus === 'accepted'),
          testCases: testResult,
          runtime,
          memory,
          status: finalStatus,
          errorMessage
        });
      } catch (judgeErr) {
        console.error("Judge0 execution failed in runCode:", judgeErr.message);
        return res.status(503).json({
          message: "Judge0 execution failed or timed out. Please try again."
        });
      }
    }
    catch(err){
      if(err.message === "Unsupported language"){
        return res.status(400).json({ message: "Unsupported language" });
      }
      res.status(500).json({ message: "Internal Server Error " + (err.message || err) });
    }
}

module.exports = {submitCode,runCode};




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