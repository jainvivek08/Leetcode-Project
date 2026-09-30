const express = require('express')
const app = express();
require('dotenv').config();

// Fail-fast validation for mandatory environment variables
const requiredEnv = ['JWT_KEY', 'DB_CONNECT_STRING', 'REDIS_HOST'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`FATAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

// Reverse proxy trust setting
app.set('trust proxy', process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : false);

const main =  require('./config/db');
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");
const cors = require('cors');
const { generalLimiter } = require('./middleware/rateLimiters');
const Submission = require('./models/submission');

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
    origin: clientOrigin,
    credentials: true 
}));

// Global general rate limiter (300 requests / 15 min per IP)
app.use(generalLimiter);

// Global body parser: 1mb for general routes, deferred to route-level 10mb for /user/updateProfile
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/user/updateProfile')) {
        return next();
    }
    return express.json({ limit: '1mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use("/video",videoRouter);


const InitalizeConnection = async ()=>{
    try{

        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");

        // Startup cleanup: Mark any 'pending' submissions older than 10 minutes as 'error'
        try {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const cleanupResult = await Submission.updateMany(
                { status: 'pending', createdAt: { $lt: tenMinutesAgo } },
                { $set: { status: 'error', errorMessage: 'Submission timed out' } }
            );
            console.log(`Cleaned up ${cleanupResult.modifiedCount} stuck pending submission(s)`);
        } catch (cleanupErr) {
            console.warn("Startup submission cleanup error:", cleanupErr.message);
        }
        
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+ process.env.PORT);
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}


InitalizeConnection();


