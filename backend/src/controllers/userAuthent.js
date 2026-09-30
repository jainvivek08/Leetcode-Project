const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")


const register = async (req,res)=>{
    
    try{
        // validate the data;

      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = 'user'
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
     const reply = {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role:user.role,
        problemSolved: [],
    }
    
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).json({
        user:reply,
        message:"Loggin Successfully"
    })
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
        const {emailId, password} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});

        if(!user)
            throw new Error("Invalid Credentials");

        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role:user.role,
            problemSolved: user.problemSolved || []
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        res.status(401).send(err.message || "Invalid Credentials");
    }
}


// logOut feature

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);


        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
    //    Token add kar dung Redis ke blockList
    //    Cookies ko clear kar dena.....

    res.cookie("token",null,{expires: new Date(Date.now())});
    res.send("Logged Out Succesfully");

    }
    catch(err){
       res.status(503).send("Error: "+err);
    }
}


const adminRegister = async(req,res)=>{
    try{
        // validate the data;
    //   if(req.result.role!='admin')
    //     throw new Error("Invalid Credentials");  
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = req.body.role || 'admin';
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).send("User Registered Successfully");
    }
    catch(err){
        res.status(400).send(err.message || "Registration failed");
    }
}

const deleteProfile = async(req,res)=>{
  
    try{
       const userId = req.result._id;
      
    // userSchema delete
    await User.findByIdAndDelete(userId);

    // Submission se bhi delete karo...
    
    // await Submission.deleteMany({userId});
    
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
        const allUsers = await User.find({}).select('firstName lastName emailId problemSolved avatar').lean();
        
        // Find current user's solved count
        const currentUser = allUsers.find(u => u._id.toString() === userId.toString());
        const mySolved = currentUser?.problemSolved ? currentUser.problemSolved.length : 0;

        if (mySolved === 0) {
            return res.status(200).json({
                rank: 'Unranked',
                rankPercentile: 'Solve problems to get ranked',
                totalSolved: 0,
                totalUsers: allUsers.length
            });
        }

        // Rank is determined by how many users solved strictly more problems
        const usersWithMoreSolved = allUsers.filter(u => (u.problemSolved?.length || 0) > mySolved).length;
        const rank = usersWithMoreSolved + 1;
        const percentile = Math.max(1, Math.round((rank / allUsers.length) * 100));

        res.status(200).json({
            rank: `#${rank}`,
            rankPercentile: rank === 1 ? 'Top 1% on CodeQuest' : `Top ${percentile}% on CodeQuest`,
            totalSolved: mySolved,
            totalUsers: allUsers.length
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to compute rank: " + err });
    }
};

module.exports = {register, login, logout, adminRegister, deleteProfile, getProfile, updateProfile, getUserRank};