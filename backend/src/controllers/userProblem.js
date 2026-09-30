const mongoose = require("mongoose");
const {getLanguageById,normalizeLanguage,mapJudge0Status,submitBatch,submitToken} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo");
const { deleteCloudinaryVideo } = require("./videoSection");

const verifyReferenceSolutions = async (referenceSolution, visibleTestCases, hiddenTestCases) => {
  const visible = Array.isArray(visibleTestCases) ? visibleTestCases : [];
  const hidden = Array.isArray(hiddenTestCases) ? hiddenTestCases : [];

  const allTestCases = [
    ...visible.map((tc, idx) => ({ ...tc, type: 'visible', index: idx + 1 })),
    ...hidden.map((tc, idx) => ({ ...tc, type: 'hidden', index: idx + 1 }))
  ];

  if (!Array.isArray(referenceSolution) || referenceSolution.length === 0) {
    return null;
  }

  for (const { language, completeCode } of referenceSolution) {
    const languageId = getLanguageById(normalizeLanguage(language));

    const submissions = allTestCases.map((tc) => ({
      source_code: completeCode,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.output
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

const createProblem = async (req,res)=>{
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution, problemCreator
    } = req.body;

    try{
      const verifyError = await verifyReferenceSolutions(referenceSolution, visibleTestCases, hiddenTestCases);
      if (verifyError) {
        return res.status(400).send(verifyError);
      }

      const userProblem = await Problem.create({
        ...req.body,
        problemCreator: req.result._id
      });

      res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        if (err.message === "Unsupported language") {
            return res.status(400).send("Unsupported language");
        }
        res.status(400).send("Error: "+err);
    }
}

const updateProblem = async (req,res)=>{
  const {id} = req.params;
  const {title,description,difficulty,tags,
    visibleTestCases,hiddenTestCases,startCode,
    referenceSolution, problemCreator
   } = req.body;

   try{
     if(!id || !mongoose.isValidObjectId(id)){
      return res.status(400).send("Invalid problem ID");
     }

    const DsaProblem = await Problem.findById(id);
    if(!DsaProblem)
    {
      return res.status(404).send("ID is not persent in server");
    }

    const verifyError = await verifyReferenceSolutions(referenceSolution, visibleTestCases, hiddenTestCases);
    if (verifyError) {
      return res.status(400).send(verifyError);
    }

    const newProblem = await Problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
    res.status(200).send(newProblem);
  }
  catch(err){
      if (err.message === "Unsupported language") {
          return res.status(400).send("Unsupported language");
      }
      res.status(500).send("Error: "+err);
  }
}

const deleteProblem = async(req,res)=>{
  const {id} = req.params;
  try{
    if(!id || !mongoose.isValidObjectId(id))
      return res.status(400).send("Invalid problem ID");

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if(!deletedProblem)
      return res.status(404).send("Problem is Missing");

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
        userSolvedRefs: userSolvedRefs
      }
    });
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}


const getProblemById = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id || !mongoose.isValidObjectId(id))
      return res.status(400).send("Invalid problem ID");

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode');
   
    // video ka jo bhi url wagera le aao

   if(!getProblem)
    return res.status(404).send("Problem is Missing");

   const videos = await SolutionVideo.findOne({problemId:id});

   if(videos){   
    
   const responseData = {
    ...getProblem.toObject(),
    secureUrl:videos.secureUrl,
    thumbnailUrl : videos.thumbnailUrl,
    duration : videos.duration,
   } 
  
   return res.status(200).send(responseData);
   }
    
   res.status(200).send(getProblem);

  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

const getAdminProblemById = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id || !mongoose.isValidObjectId(id))
      return res.status(400).send("Invalid problem ID");

    const getProblem = await Problem.findById(id);

    if(!getProblem)
      return res.status(404).send("Problem is Missing");

    const videos = await SolutionVideo.findOne({problemId:id});

    if(videos){   
      const responseData = {
        ...getProblem.toObject(),
        secureUrl:videos.secureUrl,
        thumbnailUrl : videos.thumbnailUrl,
        duration : videos.duration,
      } 
      return res.status(200).send(responseData);
    }
    
    res.status(200).send(getProblem);

  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}

const getAllProblem = async(req,res)=>{

  try{
     
    const getProblem = await Problem.find({}).select('_id title difficulty tags');

   if(getProblem.length==0)
    return res.status(404).send("Problem is Missing");


   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}


const solvedAllProblembyUser =  async(req,res)=>{
   
    try{
       
      const userId = req.result._id;

      const user =  await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
      });
      
      res.status(200).send(user.problemSolved);

    }
    catch(err){
      res.status(500).send("Server Error");
    }
}

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    if (!problemId || !mongoose.isValidObjectId(problemId)) {
      return res.status(400).send("Invalid problem ID");
    }

    const ans = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });

    return res.status(200).json(ans || []);
  } catch (err) {
    console.error("submittedProblem error:", err);
    res.status(500).send("Internal Server Error");
  }
};



const getProblemList = async (req, res) => {
  try {
    let { page = 1, limit = 20, search, difficulty, tag, sort = 'newest' } = req.query;

    const pageNum = Number(page);
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: "Invalid page: must be a positive integer >= 1" });
    }

    const limitNum = Number(limit);
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ error: "Invalid limit: must be an integer between 1 and 100" });
    }

    const filter = {};

    if (search !== undefined && search !== null && search !== '') {
      if (typeof search !== 'string' || search.length > 100) {
        return res.status(400).json({ error: "Search query too long (max 100 characters)" });
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
        return res.status(400).json({ error: "Invalid difficulty: must be one of easy, medium, hard" });
      }
      filter.difficulty = diff;
    }

    if (tag !== undefined && tag !== null && tag !== '') {
      filter.tags = String(tag).trim();
    }

    const sortMap = {
      newest: { _id: -1 },
      oldest: { _id: 1 },
      title: { title: 1 }
    };

    const sortKey = String(sort).toLowerCase().trim();
    if (!sortMap[sortKey]) {
      return res.status(400).json({ error: "Invalid sort: must be one of newest, oldest, title" });
    }

    const total = await Problem.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    const problems = await Problem.find(filter)
      .select('_id title difficulty tags')
      .sort(sortMap[sortKey])
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      problems,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to list problems: " + err.message });
  }
};

module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAdminProblemById,getAllProblem,getProblemList,solvedAllProblembyUser,submittedProblem};


