const redisClient = require("../config/redis");
const User =  require("../models/user");
const Submission = require("../models/submission");
const mongoose = require("mongoose");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { getCookieOptions, getClearCookieOptions, getJwtExpiresInSeconds } = require("../utils/cookieOptions");

const register = async (req,res)=>{
    try{
        const { firstName, lastName, emailId, password, age } = req.body;
        const normalizedEmail = (emailId || '').toLowerCase().trim();

        // Validate mandatory fields
        validate({ firstName, emailId: normalizedEmail, password });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Strict whitelist: only firstName, lastName, emailId, password, age
        // Explicitly set role: 'user' and disallow role, isAdmin, problemSolved, createdAt, etc.
        const allowedUserData = {
            firstName: firstName?.trim(),
            lastName: lastName?.trim() || '',
            emailId: normalizedEmail,
            password: hashedPassword,
            role: 'user'
        };

        if (age !== undefined && age !== null && age !== '') {
            const parsedAge = Number(age);
            if (!isNaN(parsedAge) && parsedAge >= 6 && parsedAge <= 80) {
                allowedUserData.age = parsedAge;
            }
        }

        const user = await User.create(allowedUserData);

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: 'user' },
            process.env.JWT_KEY,
            { expiresIn: getJwtExpiresInSeconds() }
        );

        const reply = {
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            problemSolved: [],
        };

        res.cookie('token', token, getCookieOptions());
        res.status(201).json({
            user: reply,
            message: "Registered Successfully"
        });
    }
    catch(err){
        if (err.code === 11000) {
            return res.status(400).send("Email already registered. Please login.");
        }
        res.status(400).send(err.message || "Registration failed");
    }
}


const login = async (req,res)=>{
    try{
        const { emailId, password } = req.body;

        if(!emailId || !password)
            throw new Error("Invalid Credentials");

        const normalizedEmail = emailId.toLowerCase().trim();
        const user = await User.findOne({ emailId: normalizedEmail });

        if(!user)
            throw new Error("Invalid Credentials");

        const match = await bcrypt.compare(password, user.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            problemSolved: user.problemSolved || []
        };

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: getJwtExpiresInSeconds() }
        );

        res.cookie('token', token, getCookieOptions());
        res.status(200).json({
            user: reply,
            message: "Logged In Successfully"
        });
    }
    catch(err){
        res.status(401).send(err.message || "Invalid Credentials");
    }
}


const blockTokenAndClearCookie = async (req, res) => {
    const { token } = req.cookies;
    if (token) {
        try {
            const payload = jwt.decode(token);
            const nowSec = Math.floor(Date.now() / 1000);
            const defaultTtl = getJwtExpiresInSeconds();
            const ttl = (payload && payload.exp && payload.exp > nowSec)
                ? (payload.exp - nowSec)
                : defaultTtl;

            if (ttl > 0) {
                await redisClient.set(`token:${token}`, 'Blocked', { EX: ttl });
            }
        } catch (err) {
            console.warn("Error decoding token for Redis blocklist:", err.message);
        }
    }
    res.clearCookie("token", getClearCookieOptions());
};

// logOut feature
const logout = async(req,res)=>{
    try{
        await blockTokenAndClearCookie(req, res);
        res.status(200).send("Logged Out Successfully");
    }
    catch(err){
       res.status(500).send("Error: " + err.message);
    }
}


const adminRegister = async(req,res)=>{
    try{
        const { firstName, lastName, emailId, password } = req.body;
        const normalizedEmail = (emailId || '').toLowerCase().trim();

        validate({ firstName, emailId: normalizedEmail, password });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Explicit field whitelisting - force role to 'admin'
        const user = await User.create({
            firstName: firstName?.trim(),
            lastName: lastName?.trim() || '',
            emailId: normalizedEmail,
            password: hashedPassword,
            role: 'admin'
        });

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: 'admin' },
            process.env.JWT_KEY,
            { expiresIn: getJwtExpiresInSeconds() }
        );

        res.cookie('token', token, getCookieOptions());
        res.status(201).send("Admin Registered Successfully");
    }
    catch(err){
        if (err.code === 11000) {
            return res.status(400).send("Email already registered. Please login.");
        }
        res.status(400).send(err.message || "Registration failed");
    }
}

const deleteProfile = async(req,res)=>{
    try{
        const userId = req.result._id;
        await User.findByIdAndDelete(userId);
        await blockTokenAndClearCookie(req, res);
        res.status(200).send("Deleted Successfully");
    }
    catch(err){
        res.status(500).send("Internal Server Error");
    }
}

const getProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user, message: "Profile fetched successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error fetching profile: " + err });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        if (req.body.avatar && typeof req.body.avatar === 'string' && req.body.avatar.length > 2 * 1024 * 1024) {
            return res.status(400).json({ error: "Avatar image is too large (max 2 MB)" });
        }

        const allowedFields = [
            'firstName',
            'lastName',
            'college',
            'graduationDetails',
            'location',
            'bio',
            'website',
            'github',
            'linkedin',
            'twitter',
            'avatar'
        ];

        const updates = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).select('-password');

        res.status(200).json({
            user: updatedUser,
            message: "Profile updated successfully in MongoDB"
        });
    } catch (err) {
        res.status(400).json({ error: err.message || "Failed to update profile" });
    }
};

const getUserRank = async (req, res, next) => {
    try {
        const userId = req.result._id;
        const currentUser = await User.findById(userId).select('problemSolved').lean();
        const currentSolvedCount = Array.isArray(currentUser?.problemSolved)
            ? currentUser.problemSolved.length
            : 0;

        const totalUsers = await User.countDocuments();

        // O(1) memory rank calculation directly using countDocuments
        const usersAhead = await User.countDocuments({
            $expr: { $gt: [{ $size: { $ifNull: ["$problemSolved", []] } }, currentSolvedCount] }
        });
        const rank = usersAhead + 1;
        const percentile = totalUsers > 0 ? Math.max(1, Math.round((rank / totalUsers) * 100)) : 100;

        return res.status(200).json({
            success: true,
            rank,
            totalUsers,
            solvedCount: currentSolvedCount,
            rankPercentile: currentSolvedCount === 0
                ? 'Solve problems to get ranked'
                : (rank === 1 ? 'Top 1% on CodeQuest' : `Top ${percentile}% on CodeQuest`),
            totalSolved: currentSolvedCount
        });
    } catch (err) {
        next(err);
    }
};

const getActivityHeatmap = async (req, res) => {
    try {
        const userId = req.result._id;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Aggregate from the Submission collection for the authenticated user
        // Group and count accepted submissions per calendar day formatted as YYYY-MM-DD
        const allAcceptedDays = await Submission.aggregate([
            {
                $match: {
                    userId: userObjectId,
                    status: 'accepted'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const activeDates = allAcceptedDays.map((d) => d._id);
        const activeDateSet = new Set(activeDates);

        // 365 days window for activityMap
        const now = new Date();
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        const oneYearAgoStr = oneYearAgo.toISOString().slice(0, 10);

        // Produce an activityMap object mapping date strings to submission counts within the last 365 days
        const activityMap = {};
        for (const item of allAcceptedDays) {
            if (item._id >= oneYearAgoStr) {
                activityMap[item._id] = item.count;
            }
        }

        // totalActiveDays: total count of unique active dates with at least 1 accepted submission
        const totalActiveDays = activeDates.length;

        // Current streak logic:
        // Check if today has at least 1 accepted submission. If yes, count consecutive active days backwards.
        // If today has no submission, check if yesterday was active. If yes, count consecutive active days backwards from yesterday (the streak is preserved until today ends).
        // If neither today nor yesterday was active, currentStreak is 0.
        const todayStr = now.toISOString().slice(0, 10);

        const getOffsetDateStr = (baseDate, offsetDays) => {
            const d = new Date(baseDate);
            d.setUTCDate(d.getUTCDate() + offsetDays);
            return d.toISOString().slice(0, 10);
        };

        const yesterdayStr = getOffsetDateStr(now, -1);

        let currentStreak = 0;
        if (activeDateSet.has(todayStr)) {
            currentStreak = 1;
            let offset = -1;
            while (activeDateSet.has(getOffsetDateStr(now, offset))) {
                currentStreak++;
                offset--;
            }
        } else if (activeDateSet.has(yesterdayStr)) {
            currentStreak = 1;
            let offset = -2;
            while (activeDateSet.has(getOffsetDateStr(now, offset))) {
                currentStreak++;
                offset--;
            }
        } else {
            currentStreak = 0;
        }

        // maxStreak: the longest unbroken chain of consecutive active days found across the user's entire submission history.
        let maxStreak = 0;
        if (activeDates.length > 0) {
            maxStreak = 1;
            let tempStreak = 1;

            for (let i = 1; i < activeDates.length; i++) {
                const prev = new Date(activeDates[i - 1] + 'T00:00:00.000Z');
                const curr = new Date(activeDates[i] + 'T00:00:00.000Z');
                const diffDays = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));

                if (diffDays === 1) {
                    tempStreak++;
                    if (tempStreak > maxStreak) {
                        maxStreak = tempStreak;
                    }
                } else if (diffDays > 1) {
                    tempStreak = 1;
                }
            }
        }

        // Ensure maxStreak is at least currentStreak
        if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
        }

        return res.status(200).json({
            success: true,
            currentStreak,
            maxStreak,
            totalActiveDays,
            activityMap
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error fetching activity heatmap: " + err.message
        });
    }
};

module.exports = {register, login, logout, adminRegister, deleteProfile, getProfile, updateProfile, getUserRank, getActivityHeatmap};