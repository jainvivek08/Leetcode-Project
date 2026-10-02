const express = require('express');

const authRouter =  express.Router();
const {register, login, logout, adminRegister, deleteProfile, getProfile, updateProfile, getUserRank, getActivityHeatmap} = require('../controllers/userAuthent')
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
authRouter.get('/getProfile', userMiddleware, getProfile);
authRouter.put('/updateProfile', userMiddleware, express.json({ limit: '10mb' }), updateProfile);
authRouter.get('/getRank', userMiddleware, getUserRank);
authRouter.get('/getUserRank', userMiddleware, getUserRank);
authRouter.get('/activity-heatmap', userMiddleware, getActivityHeatmap);

authRouter.get('/check', userMiddleware, (req, res) => {
    const reply = {
        firstName: req.result.firstName,
        lastName: req.result.lastName,
        emailId: req.result.emailId,
        _id: req.result._id,
        role: req.result.role,
        college: req.result.college || '',
        graduationDetails: req.result.graduationDetails || '',
        location: req.result.location || '',
        bio: req.result.bio || '',
        website: req.result.website || '',
        github: req.result.github || '',
        linkedin: req.result.linkedin || '',
        twitter: req.result.twitter || '',
        avatar: req.result.avatar || '',
        problemSolved: req.result.problemSolved || []
    }

    res.status(200).json({
        user: reply,
        message: "Valid User"
    });
});

module.exports = authRouter;

// login
// logout
// GetProfile

