const { createClient } = require('redis');

const allowMemoryFallback = process.env.ALLOW_MEMORY_BLOCKLIST === 'true';

class MemoryBlocklistClient {
    constructor() {
        this.store = new Map(); // key -> expireAtMs
        this.isOpen = true;
        this.isMemoryFallback = true;
        console.warn("[SECURITY NOTICE] Using in-memory JWT blocklist fallback. Intended for free-tier demo only!");

        const interval = setInterval(() => {
            const now = Date.now();
            for (const [key, expireAt] of this.store.entries()) {
                if (expireAt <= now) {
                    this.store.delete(key);
                }
            }
        }, 60000);
        if (interval.unref) interval.unref();
    }

    async connect() {
        this.isOpen = true;
        return;
    }

    async quit() {
        this.isOpen = false;
        return;
    }

    async exists(key) {
        const expireAt = this.store.get(key);
        if (!expireAt) return 0;
        if (Date.now() > expireAt) {
            this.store.delete(key);
            return 0;
        }
        return 1;
    }

    async set(key, value, options = {}) {
        const ttlSec = options.EX || options.ex || 3600;
        const expireAt = Date.now() + ttlSec * 1000;
        this.store.set(key, expireAt);
        return 'OK';
    }

    async get(key) {
        const exists = await this.exists(key);
        return exists ? 'Blocked' : null;
    }
}

let redisClient;

if (!process.env.REDIS_HOST && allowMemoryFallback) {
    redisClient = new MemoryBlocklistClient();
} else {
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

    const realClient = createClient(redisConfig);

    realClient.on('error', (err) => {
        console.warn('Redis Client Warning:', err.message);
    });

    if (allowMemoryFallback) {
        const memoryFallback = new MemoryBlocklistClient();
        redisClient = new Proxy(realClient, {
            get(target, prop, receiver) {
                if (prop === 'isOpen') {
                    return target.isOpen || memoryFallback.isOpen;
                }
                if (prop === 'isMemoryFallback') {
                    return !target.isOpen;
                }
                if (prop === 'exists' || prop === 'set' || prop === 'get') {
                    if (target.isOpen) {
                        return target[prop].bind(target);
                    }
                    return memoryFallback[prop].bind(memoryFallback);
                }
                if (prop === 'connect') {
                    return async () => {
                        try {
                            await target.connect();
                        } catch (err) {
                            console.warn("[SECURITY NOTICE] Failed to connect to Redis, switching to in-memory blocklist fallback:", err.message);
                        }
                    };
                }
                const val = Reflect.get(target, prop, receiver);
                return typeof val === 'function' ? val.bind(target) : val;
            }
        });
    } else {
        redisClient = realClient;
    }
}

module.exports = redisClient;