const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
            return res.status(401).send("Authentication required: Token missing");
        }

        if (redisClient.isOpen) {
            try {
                const isBlocked = await redisClient.exists(`token:${token}`);
                if(isBlocked){
                    return res.status(401).send("Token revoked or expired");
                }
            } catch (redisErr) {
                console.warn("Redis check warning in adminMiddleware:", redisErr.message);
            }
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

        req.result = req.result || { _id };
        const user = await User.findById(req.result._id).select('role');
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin rights required.' });
        }

        req.result = user;
        next();
    }
    catch(err){
        res.status(401).send("Error: " + err.message);
    }
};


module.exports = adminMiddleware;
