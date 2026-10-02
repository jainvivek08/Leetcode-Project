const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const { app } = require('../src/index');
const redisClient = require('../src/config/redis');

describe('Health Check API (GET /health)', () => {
  let server;
  let baseUrl;

  before(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.DB_CONNECT_STRING);
    }
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
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('returns 200 JSON with status healthy and database connected', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.strictEqual(typeof data.uptime, 'number');
    assert.ok(data.timestamp);
    assert.strictEqual(data.services.database, 'connected');
    assert.ok(data.services.redis === 'connected' || data.services.redis === 'disconnected/disabled');
  });
});
