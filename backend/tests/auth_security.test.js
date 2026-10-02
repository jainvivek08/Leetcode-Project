const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const { app } = require('../src/index');
const User = require('../src/models/user');
const Problem = require('../src/models/problem');
const redisClient = require('../src/config/redis');

describe('Auth & Security Integration Tests', () => {
  let server;
  let baseUrl;
  let createdUserId = null;
  let testProblemId = null;

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

    // Create a dummy problem with reference solution and hidden test cases
    const testProblem = await Problem.create({
      problemCreator: new mongoose.Types.ObjectId(),
      title: 'Security Verification Problem ' + Date.now(),
      description: 'Check if reference solution is leaked',
      difficulty: 'easy',
      tags: ['array'],
      visibleTestCases: [{ input: '1', output: '1', explanation: 'test' }],
      hiddenTestCases: [{ input: '99', output: '99' }],
      referenceSolution: [{ language: 'javascript', completeCode: 'secret_admin_code_do_not_leak()' }],
      startCode: [{ language: 'javascript', initialCode: 'function solve() {}' }],
      timeLimit: 2000,
      memoryLimit: 256
    });
    testProblemId = testProblem._id;
  });

  after(async () => {
    if (createdUserId) {
      await User.deleteOne({ _id: createdUserId });
    }
    if (testProblemId) {
      await Problem.deleteOne({ _id: testProblemId });
    }
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

  test('registration strictly rejects mass assignment attempts (role: admin)', async () => {
    const maliciousPayload = {
      firstName: 'SecTest',
      lastName: 'User',
      emailId: `sectest_${Date.now()}@codequest.dev`,
      password: 'StrongPassword123!',
      role: 'admin',
      isAdmin: true
    };

    const res = await fetch(`${baseUrl}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousPayload)
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.user.role, 'user', 'Response user role must be "user"');

    createdUserId = data.user._id;

    // Verify directly in MongoDB database that role was persisted as 'user'
    const dbUser = await User.findById(createdUserId).lean();
    assert.ok(dbUser, 'User must exist in DB');
    assert.strictEqual(dbUser.role, 'user', 'MongoDB persisted role must strictly be "user"');
    assert.strictEqual(dbUser.isAdmin, undefined, 'isAdmin must not be persisted');
  });

  test('public problem endpoints do not leak referenceSolution or hiddenTestCases', async () => {
    // 1. Check GET /problem/problemById/:id
    const resDetail = await fetch(`${baseUrl}/problem/problemById/${testProblemId}`);
    assert.strictEqual(resDetail.status, 200);
    const problemDetail = await resDetail.json();

    assert.strictEqual(problemDetail.referenceSolution, undefined, 'referenceSolution must not be exposed in problem detail');
    assert.strictEqual(problemDetail.hiddenTestCases, undefined, 'hiddenTestCases must not be exposed in problem detail');

    // 2. Check GET /problem/list
    const resList = await fetch(`${baseUrl}/problem/list?limit=10`);
    assert.strictEqual(resList.status, 200);
    const listData = await resList.json();
    assert.ok(Array.isArray(listData.problems));

    for (const prob of listData.problems) {
      assert.strictEqual(prob.referenceSolution, undefined, 'Problem in list must not expose referenceSolution');
      assert.strictEqual(prob.hiddenTestCases, undefined, 'Problem in list must not expose hiddenTestCases');
    }
  });
});
