const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
            return res.status(401).send("Authentication required: Token missing");
        }

        const isBlocked = await redisClient.exists(`token:${token}`);
        if(isBlocked){
            return res.status(401).send("Token revoked or expired");
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_KEY);
        } catch {
            return res.status(401).send("Invalid or expired token");
        }

        const {_id} = payload;
        if(!_id){
            return res.status(401).send("Invalid token payload");
        }

        const result = await User.findById(_id);
        if(!result){
            return res.status(401).send("User does not exist");
        }

        // Strictly check role from database
        if(result.role !== 'admin'){
            return res.status(403).send("Access denied: Admin role required");
        }

        req.result = result;
        next();
    }
    catch(err){
        res.status(401).send("Error: " + err.message);
    }
};


module.exports = adminMiddleware;
