const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST || 'seamless-endearing-celebrated-39386.db.redis.io',
        port: Number(process.env.REDIS_PORT) || 19056
    }
});

redisClient.on('error', (err) => {
    console.warn('Redis Client Warning:', err.message);
});

module.exports = redisClient;