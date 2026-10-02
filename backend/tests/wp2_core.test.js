const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { app } = require('../src/index');
const redisClient = require('../src/config/redis');
const { connectTestDb, disconnectTestDb } = require('./testHelper');
const { getJudge0Config } = require('../src/utils/problemUtility');
const solveDoubt = require('../src/controllers/solveDoubt');

describe('WP2 Core Basics & Configurable Integrations', () => {
  let server;
  let baseUrl;

  before(async () => {
    await connectTestDb();
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
    } catch (_) {}

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    try {
      if (redisClient.isOpen) {
        await redisClient.quit();
      }
    } catch (_) {}
    await disconnectTestDb();
  });

  test('Helmet security headers are set on GET /api/health and /health', async () => {
    for (const path of ['/api/health', '/health']) {
      const res = await fetch(`${baseUrl}${path}`);
      assert.strictEqual(res.status, 200);

      // Verify Helmet default security headers
      assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
      assert.strictEqual(res.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.strictEqual(res.headers.get('x-dns-prefetch-control'), 'off');
    }
  });

  test('Judge0 config cleanly switches between RapidAPI and Public modes', () => {
    const originalUrl = process.env.JUDGE0_BASE_URL;
    const originalKey = process.env.JUDGE0_KEY;

    try {
      // 1. RapidAPI mode
      process.env.JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';
      process.env.JUDGE0_KEY = 'test_rapidapi_secret_key';
      const rapidConfig = getJudge0Config();
      assert.strictEqual(rapidConfig.baseUrl, 'https://judge0-ce.p.rapidapi.com');
      assert.strictEqual(rapidConfig.headers['x-rapidapi-key'], 'test_rapidapi_secret_key');
      assert.strictEqual(rapidConfig.headers['x-rapidapi-host'], 'judge0-ce.p.rapidapi.com');

      // 2. Public / Self-hosted mode (no key)
      process.env.JUDGE0_BASE_URL = 'https://ce.judge0.com';
      delete process.env.JUDGE0_KEY;
      delete process.env.RAPIDAPI_KEY;
      const publicConfig = getJudge0Config();
      assert.strictEqual(publicConfig.baseUrl, 'https://ce.judge0.com');
      assert.strictEqual(publicConfig.headers['x-rapidapi-key'], undefined);
      assert.strictEqual(publicConfig.headers['x-rapidapi-host'], undefined);
    } finally {
      process.env.JUDGE0_BASE_URL = originalUrl;
      process.env.JUDGE0_KEY = originalKey;
    }
  });

  test('AI chat controller handles rate limits (429) gracefully without leaking raw stack trace', async () => {
    const mockReq = {
      body: {
        messages: [{ role: 'user', parts: [{ text: 'How do I solve two sum?' }] }],
        title: 'Two Sum',
        description: 'Find two indices'
      }
    };

    let statusCode = null;
    let jsonPayload = null;
    const mockRes = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        jsonPayload = payload;
        return this;
      }
    };

    // Save real key and mock an invalid/rate-limited situation
    const realKey = process.env.GEMINI_KEY;
    try {
      process.env.GEMINI_KEY = 'invalid_mock_key';
      process.env.GEMINI_MODEL = 'non-existent-mock-model-404';
      process.env.GEMINI_FALLBACK_MODEL = 'non-existent-fallback-model-404';

      await solveDoubt(mockReq, mockRes);

      assert.ok(statusCode === 429 || statusCode === 503, `Expected 429 or 503 but got ${statusCode}`);
      assert.strictEqual(jsonPayload?.message, "AI helper is busy or unavailable, please try again in a moment.");
    } finally {
      process.env.GEMINI_KEY = realKey;
    }
  });
});
