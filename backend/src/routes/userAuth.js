const express = require('express');

const authRouter =  express.Router();
const {register, login, logout, adminRegister, deleteProfile, getProfile, updateProfile, getUserRank, getActivityHeatmap, getLeaderboard} = require('../controllers/userAuthent');
const { getUserBookmarks } = require('../controllers/userProblem');
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require('../middleware/adminMiddleware');
const { authLimiter } = require('../middleware/rateLimiters');

// Register & Login
authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile);

// Profile & Leaderboard APIs (Direct MongoDB Save & Fetch)
authRouter.get('/profile', userMiddleware, getProfile);
authRouter.get('/getProfile', userMiddleware, getProfile);
authRouter.put('/updateProfile', userMiddleware, express.json({ limit: '10mb' }), updateProfile);
authRouter.get('/getRank', userMiddleware, getUserRank);
authRouter.get('/getUserRank', userMiddleware, getUserRank);
authRouter.get('/activity-heatmap', userMiddleware, getActivityHeatmap);
authRouter.get('/leaderboard', getLeaderboard);
authRouter.get('/bookmarks', userMiddleware, getUserBookmarks);

authRouter.get('/check', userMiddleware, async (req, res) => {
    const user = req.result;
    if (user && user.lastSolvedDate) {
      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastMidnight = new Date(
        user.lastSolvedDate.getFullYear(),
        user.lastSolvedDate.getMonth(),
        user.lastSolvedDate.getDate()
      );
      const diffDays = Math.round((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        user.streakCount = 0; // Display 0 until they solve a new question
        await user.save();
      }
    }

    const reply = {
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
        college: user.college || '',
        graduationDetails: user.graduationDetails || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
        avatar: user.avatar || '',
        problemSolved: user.problemSolved || [],
        streakCount: user.streakCount || 0,
        lastSolvedDate: user.lastSolvedDate || null
    };

    res.status(200).json({
        user: reply,
        message: "Valid User"
    });
});

module.exports = authRouter;

// login
// logout
// GetProfile

