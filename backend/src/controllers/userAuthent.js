const redisClient = require("../config/redis");
const User =  require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { getCookieOptions, getJwtExpiresInSeconds } = require("../utils/cookieOptions");

const register = async (req,res)=>{
    try{
        const { firstName, lastName, emailId, password } = req.body;
        const normalizedEmail = (emailId || '').toLowerCase().trim();

        // Validate mandatory fields
        validate({ firstName, emailId: normalizedEmail, password });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Explicit field whitelisting - strictly force role to 'user'
        const user = await User.create({
            firstName: firstName?.trim(),
            lastName: lastName?.trim() || '',
            emailId: normalizedEmail,
            password: hashedPassword,
            role: 'user'
        });

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
    res.clearCookie("token", getCookieOptions({ maxAge: 0 }));
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

const getUserRank = async (req, res) => {
    try {
        const userId = req.result._id;
        const currentUser = await User.findById(userId).select('problemSolved').lean();
        const mySolved = currentUser?.problemSolved ? currentUser.problemSolved.length : 0;
        const totalUsers = await User.countDocuments();

        if (mySolved === 0) {
            return res.status(200).json({
                rank: 'Unranked',
                rankPercentile: 'Solve problems to get ranked',
                totalSolved: 0,
                totalUsers: totalUsers
            });
        }

        const countResult = await User.aggregate([
            {
                $project: {
                    solved: { $size: { $ifNull: ['$problemSolved', []] } }
                }
            },
            {
                $match: {
                    solved: { $gt: mySolved }
                }
            },
            {
                $count: 'usersWithMore'
            }
        ]);

        const usersWithMoreSolved = countResult.length > 0 ? countResult[0].usersWithMore : 0;
        const rank = usersWithMoreSolved + 1;
        const percentile = Math.max(1, Math.round((rank / totalUsers) * 100));

        res.status(200).json({
            rank: `#${rank}`,
            rankPercentile: rank === 1 ? 'Top 1% on CodeQuest' : `Top ${percentile}% on CodeQuest`,
            totalSolved: mySolved,
            totalUsers: totalUsers
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to compute rank: " + err });
    }
};

module.exports = {register, login, logout, adminRegister, deleteProfile, getProfile, updateProfile, getUserRank};