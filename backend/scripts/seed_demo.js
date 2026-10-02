const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Load environment configuration
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/user');
const Problem = require('../src/models/problem');
const Submission = require('../src/models/submission');
const Discussion = require('../src/models/discussion');

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'DemoPass@123';

const DEMO_USERS = [
  {
    emailId: 'admin@codequest.dev',
    firstName: 'Admin',
    lastName: 'CodeQuest',
    role: 'admin',
    solvedTarget: 0, // Admin doesn't participate in leaderboard
  },
  {
    emailId: 'alex.chen@demo.com',
    firstName: 'Alex',
    lastName: 'Chen',
    role: 'user',
    solvedTarget: 14,
    streakDays: 7,
  },
  {
    emailId: 'priya.sharma@demo.com',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'user',
    solvedTarget: 10,
    streakDays: 5,
  },
  {
    emailId: 'marcus.vance@demo.com',
    firstName: 'Marcus',
    lastName: 'Vance',
    role: 'user',
    solvedTarget: 7,
    streakDays: 3,
  },
  {
    emailId: 'elena.rostova@demo.com',
    firstName: 'Elena',
    lastName: 'Rostova',
    role: 'user',
    solvedTarget: 4,
    streakDays: 2,
  },
  {
    emailId: 'david.kim@demo.com',
    firstName: 'David',
    lastName: 'Kim',
    role: 'user',
    solvedTarget: 2,
    streakDays: 1,
  },
];

async function seedDemoData() {
  console.log('=== CodeQuest Idempotent Demo Data Seeder ===\n');

  if (!process.env.DB_CONNECT_STRING) {
    console.error('FATAL: DB_CONNECT_STRING is not set in environment.');
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log('Connected to MongoDB.\n');

  // 1. Fetch available problems
  const problems = await Problem.find({}).sort({ problemNumber: 1 });
  if (problems.length === 0) {
    console.error('FATAL: No problems found in database. Please seed or create problems first.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Found ${problems.length} problem(s) in database to link submissions and discussions.\n`);

  const easyProblems = problems.filter((p) => p.difficulty === 'easy');
  const mediumProblems = problems.filter((p) => p.difficulty === 'medium');
  const hardProblems = problems.filter((p) => p.difficulty === 'hard');

  // 2. Hash demo password once
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 3. Upsert Demo & Admin Users
  console.log('1. Upserting Admin & Demo Users...');
  const seededUsers = [];

  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ emailId: u.emailId });

    if (existing) {
      existing.firstName = u.firstName;
      existing.lastName = u.lastName;
      existing.role = u.role;
      existing.password = hashedPassword;
      await existing.save();
      seededUsers.push(existing);
      console.log(`  ✓ Updated existing user: ${u.emailId} (${u.role})`);
    } else {
      const created = await User.create({
        emailId: u.emailId,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        password: hashedPassword,
        problemSolved: [],
        bookmarks: [],
      });
      seededUsers.push(created);
      console.log(`  ✓ Created new user: ${u.emailId} (${u.role})`);
    }
  }

  const adminUser = seededUsers.find((u) => u.role === 'admin');
  const regularDemoUsers = seededUsers.filter((u) => u.role !== 'admin');
  const allDemoUserIds = seededUsers.map((u) => u._id);

  // 4. Idempotently Reset & Seed Submissions & Activity Heatmaps
  console.log('\n2. Seeding Realistic Submissions & 30-Day Activity Heatmap...');

  // Remove existing submissions for demo users to maintain idempotent counts
  const deleteSubResult = await Submission.deleteMany({ userId: { $in: allDemoUserIds } });
  console.log(`  Cleared ${deleteSubResult.deletedCount} previous demo submission(s) for clean idempotency.`);

  const now = new Date();

  for (let i = 0; i < regularDemoUsers.length; i++) {
    const userDoc = regularDemoUsers[i];
    const userMeta = DEMO_USERS.find((u) => u.emailId === userDoc.emailId);
    const targetCount = userMeta.solvedTarget;

    // Pick problems to solve (prioritizing easy, then medium, then hard)
    const selectedToSolve = [];
    let count = 0;
    for (const p of easyProblems) {
      if (count >= targetCount) break;
      selectedToSolve.push(p);
      count++;
    }
    for (const p of mediumProblems) {
      if (count >= targetCount) break;
      selectedToSolve.push(p);
      count++;
    }
    for (const p of hardProblems) {
      if (count >= targetCount) break;
      selectedToSolve.push(p);
      count++;
    }

    const solvedIds = selectedToSolve.map((p) => p._id);
    const submissionsToInsert = [];

    // Create submissions distributed over the last 30 days
    selectedToSolve.forEach((prob, idx) => {
      // Days ago between 0 and 28
      const daysAgo = Math.min(idx * 2, 28);
      const subDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - (idx * 3600000));

      // Accepted submission
      submissionsToInsert.push({
        userId: userDoc._id,
        problemId: prob._id,
        code: `// Verified solution by ${userDoc.firstName}\nfunction solve() {\n  return true;\n}`,
        language: 'javascript',
        status: 'accepted',
        runtime: 25 + (idx % 40),
        memory: 38000 + (idx % 6000),
        runtimePercentile: 75 + (idx % 24),
        memoryPercentile: 65 + (idx % 30),
        testCasesPassed: 10,
        testCasesTotal: 10,
        createdAt: subDate,
        updatedAt: subDate,
      });

      // Optionally add 1 previous failed/wrong attempt for realistic metrics
      if (idx % 2 === 0) {
        const failDate = new Date(subDate.getTime() - 15 * 60000); // 15 mins before accept
        submissionsToInsert.push({
          userId: userDoc._id,
          problemId: prob._id,
          code: `// Initial buggy draft\nfunction solve() {\n  return false;\n}`,
          language: 'javascript',
          status: idx % 4 === 0 ? 'runtime_error' : 'wrong',
          runtime: 0,
          memory: 0,
          errorMessage: idx % 4 === 0 ? 'TypeError: Cannot read properties of undefined' : '',
          testCasesPassed: 3,
          testCasesTotal: 10,
          failedTestCase: {
            index: 4,
            isHidden: false,
            input: '[3, 2, 4], 6',
            expectedOutput: '[1, 2]',
            actualOutput: '[0, 1]',
            status: 'wrong',
          },
          createdAt: failDate,
          updatedAt: failDate,
        });
      }
    });

    // Ensure active streak for demo user by adding an accepted submission today and yesterday
    if (userMeta.streakDays > 0) {
      for (let s = 0; s < userMeta.streakDays; s++) {
        const streakDate = new Date(now.getTime() - s * 24 * 60 * 60 * 1000);
        // Find or use any problem
        const streakProblem = problems[s % problems.length];
        submissionsToInsert.push({
          userId: userDoc._id,
          problemId: streakProblem._id,
          code: `// Streak preserver submission\nconsole.log("Streak day ${s}");`,
          language: 'javascript',
          status: 'accepted',
          runtime: 30,
          memory: 39000,
          runtimePercentile: 82,
          memoryPercentile: 78,
          testCasesPassed: 10,
          testCasesTotal: 10,
          createdAt: streakDate,
          updatedAt: streakDate,
        });
      }
    }

    if (submissionsToInsert.length > 0) {
      await Submission.insertMany(submissionsToInsert);
    }

    // 5. Seed Bookmarks (2-3 problems)
    const bookmarkedProblems = [
      problems[i % problems.length]._id,
      problems[(i + 3) % problems.length]._id,
    ];

    // Update user solved list and bookmarks
    await User.findByIdAndUpdate(userDoc._id, {
      problemSolved: solvedIds,
      bookmarks: bookmarkedProblems,
    });

    console.log(
      `  ✓ ${userDoc.firstName} ${userDoc.lastName}: Solved ${solvedIds.length} problems, ${submissionsToInsert.length} submissions, ${bookmarkedProblems.length} bookmarks.`
    );
  }

  // 6. Idempotently Seed Discussions & Community Comments
  console.log('\n3. Seeding Realistic Discussion Threads & Community Comments...');
  const deleteDiscResult = await Discussion.deleteMany({ userId: { $in: allDemoUserIds } });
  console.log(`  Cleared ${deleteDiscResult.deletedCount} previous demo discussion(s) for clean idempotency.`);

  // Find popular target problems (like two-sum, valid-parentheses, or first 3 problems)
  const targetProb1 = problems.find((p) => p.slug === 'two-sum' || p.slug === 'two-sum-target') || problems[0];
  const targetProb2 = problems.find((p) => p.slug === 'valid-parentheses') || problems[1 % problems.length];
  const targetProb3 = problems.find((p) => p.slug === 'climbing-stairs' || p.slug === 'nth-fibonacci-number') || problems[2 % problems.length];

  const demoDiscussions = [
    {
      problemId: targetProb1._id,
      userId: regularDemoUsers[0]._id, // Alex Chen
      title: 'Clean O(N) Time and O(N) Space Hash Map Solution with Detailed Walkthrough',
      content:
        'Instead of using a brute-force quadratic search with nested loops, we can store each value and its index into a hash table as we traverse the array. On each iteration, we check if the complement (target - num) is already in the map.',
      codeSnippet: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for idx, val in enumerate(nums):
            complement = target - val
            if complement in seen:
                return [seen[complement], idx]
            seen[val] = idx
        return []`,
      language: 'python3',
      upvotes: [regularDemoUsers[1]._id, regularDemoUsers[2]._id, regularDemoUsers[3]._id],
      comments: [
        {
          userId: regularDemoUsers[1]._id, // Priya Sharma
          content: 'Excellent explanation! The one-pass hash map is optimal and passes all edge cases.',
          createdAt: new Date(now.getTime() - 48 * 3600000),
        },
        {
          userId: regularDemoUsers[2]._id, // Marcus Vance
          content: 'Very clear Python syntax. Solved the problem in 2 ms runtime.',
          createdAt: new Date(now.getTime() - 24 * 3600000),
        },
      ],
    },
    {
      problemId: targetProb2._id,
      userId: regularDemoUsers[1]._id, // Priya Sharma
      title: 'Intuitive Stack Approach in JavaScript with O(1) Bracket Matching',
      content:
        'We use a stack to push matching closing brackets whenever an opening bracket is encountered. If we encounter a closing bracket, it must match the top of the stack.',
      codeSnippet: `function isValid(s) {
  const stack = [];
  const map = { '(': ')', '{': '}', '[': ']' };
  
  for (const ch of s) {
    if (map[ch]) {
      stack.push(map[ch]);
    } else if (stack.pop() !== ch) {
      return false;
    }
  }
  return stack.length === 0;
}`,
      language: 'javascript',
      upvotes: [regularDemoUsers[0]._id, regularDemoUsers[3]._id],
      comments: [
        {
          userId: regularDemoUsers[3]._id, // Elena Rostova
          content: 'Storing expected closing brackets directly on the stack makes the comparison super elegant!',
          createdAt: new Date(now.getTime() - 36 * 3600000),
        },
      ],
    },
    {
      problemId: targetProb3._id,
      userId: regularDemoUsers[2]._id, // Marcus Vance
      title: 'From Recursion to O(1) Space Bottom-Up Dynamic Programming',
      content:
        'Notice how this problem mirrors the Fibonacci recurrence: dp[i] = dp[i-1] + dp[i-2]. We only need two variables to track the previous two steps instead of allocating a full array.',
      codeSnippet: `def climbStairs(n: int) -> int:
    if n <= 2:
        return n
    prev2, prev1 = 1, 2
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1`,
      language: 'python3',
      upvotes: [regularDemoUsers[0]._id, regularDemoUsers[1]._id, regularDemoUsers[4]._id],
      comments: [
        {
          userId: regularDemoUsers[4]._id, // David Kim
          content: 'Reduced memory from 42 MB down to 38 MB with O(1) auxiliary space. Thanks!',
          createdAt: new Date(now.getTime() - 12 * 3600000),
        },
      ],
    },
  ];

  const createdDiscussions = await Discussion.insertMany(demoDiscussions);
  console.log(`  ✓ Successfully seeded ${createdDiscussions.length} discussion threads with comments and upvotes.`);

  console.log('\n=============================================================');
  console.log('            DEMO DATA SEEDING COMPLETE                       ');
  console.log('=============================================================');
  console.log(`Demo Password for all accounts: "${DEMO_PASSWORD}" (read from process.env.DEMO_PASSWORD)\n`);
  console.log('Seeded Accounts:');
  console.log(`  👑 Admin:     ${adminUser.emailId} (Role: admin)`);
  regularDemoUsers.forEach((u, i) => {
    const meta = DEMO_USERS.find((d) => d.emailId === u.emailId);
    console.log(
      `  👤 Coder #${i + 1}: ${u.emailId.padEnd(24)} | Solved: ${String(meta.solvedTarget).padStart(2)} | Streak: ${meta.streakDays}d`
    );
  });
  console.log('\n✓ Re-running this script at any time is completely idempotent.');
  console.log('=============================================================\n');

  await mongoose.disconnect();
}

seedDemoData().catch((err) => {
  console.error('Demo data seeding failed:', err);
  process.exit(1);
});
