const path = require('path');
const express = require('express')
const app = express();
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

// Fail-fast validation for mandatory environment variables
const requiredEnv = ['JWT_KEY', 'DB_CONNECT_STRING'];
if (process.env.ALLOW_MEMORY_BLOCKLIST !== 'true') {
    requiredEnv.push('REDIS_HOST');
}
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`FATAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

// Reverse proxy trust setting
app.set('trust proxy', process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : false);

const helmet = require('helmet');
const morgan = require('morgan');

const isProduction = process.env.NODE_ENV === 'production';

// Security Headers: Helmet with tailored CSP
app.use(helmet({
    contentSecurityPolicy: isProduction ? {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "fonts.gstatic.com", "data:"],
            imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "res.cloudinary.com"],
            mediaSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "res.cloudinary.com"],
            connectSrc: [
                "'self'",
                "https://res.cloudinary.com",
                "res.cloudinary.com",
                "https://*.rapidapi.com",
                "*.rapidapi.com",
                "https://ce.judge0.com",
                "ce.judge0.com",
                "https://generativelanguage.googleapis.com",
                "generativelanguage.googleapis.com"
            ],
            objectSrc: ["'none'"]
        }
    } : false,
    crossOriginEmbedderPolicy: false
}));

// Request Logging: morgan in dev or combined format (never logs cookies, authorization headers, or body)
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(isProduction ? 'combined' : 'dev'));
}

const mongoose = require('mongoose');
const main =  require('./config/db');
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");
const discussionRouter = require("./routes/discussionRoute");
const cors = require('cors');
const { generalLimiter } = require('./middleware/rateLimiters');
const errorHandler = require('./middleware/errorHandler');
const Submission = require('./models/submission');

// CORS: active in dev or when external CORS_ORIGIN / CLIENT_URL is specified
const hasCustomCors = !!(process.env.CORS_ORIGIN || process.env.CLIENT_URL);
if (!isProduction || hasCustomCors) {
    const configuredCorsOrigin = process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173';
    const allowedOrigins = [
        ...configuredCorsOrigin.split(',').map((o) => o.trim()),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174'
    ].filter(Boolean);

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        credentials: true 
    }));
}

// Global general rate limiter (configurable via GENERAL_RATE_LIMIT_MAX / GENERAL_RATE_LIMIT_WINDOW_MINUTES, skips frequent read routes)
app.use(generalLimiter);

// Global body parser: 1mb for general routes, deferred to route-level 10mb for /user/updateProfile
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/user/updateProfile') || req.originalUrl.startsWith('/api/user/updateProfile')) {
        return next();
    }
    return express.json({ limit: '1mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Health check endpoint (public, no auth - both /health and /api/health supported)
const healthHandler = (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const redisConnected = redisClient && redisClient.isOpen
        ? (redisClient.isMemoryFallback ? 'connected (in-memory fallback)' : 'connected')
        : 'disconnected/disabled';

    return res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
            database: dbConnected,
            redis: redisConnected
        }
    });
};

const { getLeaderboard } = require('./controllers/userAuthent');

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/leaderboard', getLeaderboard);
app.get('/leaderboard', getLeaderboard);

// Unified API routing under /api prefix
app.use('/api/user', authRouter);
app.use('/api/problem', problemRouter);
app.use('/api/submission', submitRouter);
app.use('/api/ai', aiRouter);
app.use('/api/video', videoRouter);
app.use('/api/discussion', discussionRouter);

// Development / test convenience: keep un-prefixed mounts when not in production
if (!isProduction) {
    app.use('/user', authRouter);
    app.use('/problem', problemRouter);
    app.use('/submission', submitRouter);
    app.use('/ai', aiRouter);
    app.use('/video', videoRouter);
    app.use('/discussion', discussionRouter);
}

// Production Static SPA Serving (Express)
if (isProduction) {
    const frontendDist = path.resolve(__dirname, '../../frontend/dist');
    app.use(express.static(frontendDist));

    // SPA catch-all handler: for any GET request that does NOT start with /api/, serve index.html
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.originalUrl.startsWith('/api/') && req.originalUrl !== '/health') {
            return res.sendFile(path.join(frontendDist, 'index.html'));
        }
        next();
    });
}

// Centralized error handling middleware (must be mounted after all routes)
app.use(errorHandler);


const InitalizeConnection = async ()=>{
    try{
        const connectTasks = [main()];
        if (redisClient && !redisClient.isOpen) {
            connectTasks.push(redisClient.connect().catch((err) => {
                if (process.env.ALLOW_MEMORY_BLOCKLIST === 'true') {
                    console.warn("[SECURITY NOTICE] Failed to connect to Redis, fallback active:", err.message);
                } else {
                    throw err;
                }
            }));
        }

        await Promise.all(connectTasks);
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


if (require.main === module) {
    InitalizeConnection();
}

module.exports = { app, InitalizeConnection };


