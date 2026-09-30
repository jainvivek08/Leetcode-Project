const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../src/models/user');
const Submission = require('../src/models/submission');

async function cleanupTestData() {
  const isApply = process.argv.includes('--apply');
  console.log(`\n=== CLEANUP TEST DATA (${isApply ? 'APPLY MODE - DELETING' : 'DRY RUN - NO DELETIONS'}) ===\n`);

  await mongoose.connect(process.env.DB_CONNECT_STRING);

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const userQuery = {
    createdAt: { $gte: fortyEightHoursAgo },
    $or: [
      { emailId: { $regex: /harden_test@/i } },
      { emailId: { $regex: /rand_/i } },
      { emailId: { $regex: /test/i } },
      { emailId: { $regex: /@example\.com$/i } },
      { emailId: { $regex: /reg_limiter_/i } },
      { emailId: { $regex: /brute_/i } }
    ]
  };

  const testUsers = await User.find(userQuery).lean();
  const testUserIds = testUsers.map(u => u._id);

  const subQuery = {
    $or: [
      { userId: { $in: testUserIds } },
      { errorMessage: 'Submission timed out' },
      { status: 'error', createdAt: { $gte: fortyEightHoursAgo } }
    ]
  };

  const testSubmissions = await Submission.find(subQuery).lean();

  console.log(`Identified ${testUsers.length} test user(s):`);
  testUsers.forEach(u => console.log(` - User ID: ${u._id} | Email: ${u.emailId} | CreatedAt: ${u.createdAt}`));

  console.log(`\nIdentified ${testSubmissions.length} test submission(s):`);
  testSubmissions.forEach(s => console.log(` - Sub ID: ${s._id} | ProblemId: ${s.problemId} | Status: ${s.status} | CreatedAt: ${s.createdAt}`));

  if (!isApply) {
    console.log(`\n[DRY RUN] Would delete ${testUsers.length} user(s) and ${testSubmissions.length} submission(s).`);
    console.log(`To apply deletions, run with --apply: node scripts/cleanup_test_data.js --apply\n`);
  } else {
    const deletedSubs = await Submission.deleteMany(subQuery);
    const deletedUsers = await User.deleteMany(userQuery);
    console.log(`\n[APPLIED] Deleted ${deletedUsers.deletedCount} user(s) and ${deletedSubs.deletedCount} submission(s).\n`);
  }

  await mongoose.disconnect();
}

cleanupTestData().catch(err => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
