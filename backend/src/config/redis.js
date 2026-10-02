const { createClient } = require('redis');

const redisPassword = process.env.REDIS_PASSWORD || process.env.REDIS_PASS;
const redisConfig = {
    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379
    }
};

if (redisPassword) {
    redisConfig.username = process.env.REDIS_USER || 'default';
    redisConfig.password = redisPassword;
}

const redisClient = createClient(redisConfig);

redisClient.on('error', (err) => {
    console.warn('Redis Client Warning:', err.message);
});

module.exports = redisClient;