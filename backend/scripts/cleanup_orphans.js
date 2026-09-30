const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Problem = require('../src/models/problem');
const User = require('../src/models/user');
const Submission = require('../src/models/submission');
const SolutionVideo = require('../src/models/solutionVideo');
const { deleteCloudinaryVideo } = require('../src/controllers/videoSection');

async function cleanupOrphans() {
  const isApply = process.argv.includes('--apply');
  console.log(`\n=== CLEANUP ORPHANS (${isApply ? 'APPLY MODE - DELETING' : 'DRY RUN - NO DELETIONS'}) ===\n`);

  await mongoose.connect(process.env.DB_CONNECT_STRING);

  // 1. Get all valid Problem IDs and User IDs
  const allProblems = await Problem.find({}, '_id').lean();
  const validProblemIdSet = new Set(allProblems.map(p => p._id.toString()));
  const validProblemIds = allProblems.map(p => p._id);

  const allUsers = await User.find({}, '_id').lean();
  const validUserIdSet = new Set(allUsers.map(u => u._id.toString()));
  const validUserIds = allUsers.map(u => u._id);

  // 2. Submissions whose problemId no longer exists
  const orphanSubByProblem = await Submission.find({
    $or: [
      { problemId: { $exists: false } },
      { problemId: null },
      { problemId: { $nin: validProblemIds } }
    ]
  }).lean();

  // 3. Submissions whose userId no longer exists
  const orphanSubByUser = await Submission.find({
    $or: [
      { userId: { $exists: false } },
      { userId: null },
      { userId: { $nin: validUserIds } }
    ]
  }).lean();

  // Combine unique orphan submissions
  const orphanSubMap = new Map();
  orphanSubByProblem.forEach(s => orphanSubMap.set(s._id.toString(), { ...s, reason: 'missing problemId' }));
  orphanSubByUser.forEach(s => {
    if (orphanSubMap.has(s._id.toString())) {
      orphanSubMap.get(s._id.toString()).reason += ' & missing userId';
    } else {
      orphanSubMap.set(s._id.toString(), { ...s, reason: 'missing userId' });
    }
  });
  const allOrphanSubs = Array.from(orphanSubMap.values());

  // 4. SolutionVideos whose problemId no longer exists
  const orphanVideos = await SolutionVideo.find({
    $or: [
      { problemId: { $exists: false } },
      { problemId: null },
      { problemId: { $nin: validProblemIds } }
    ]
  }).lean();

  // 5. Users with problemSolved referencing missing problems
  const usersWithSolved = await User.find({
    problemSolved: { $exists: true, $not: { $size: 0 } }
  }).select('_id emailId problemSolved').lean();

  const userSolvedOrphans = [];
  let totalOrphanSolvedRefs = 0;
  for (const u of usersWithSolved) {
    const invalidRefs = (u.problemSolved || []).filter(pid => !validProblemIdSet.has(pid.toString()));
    if (invalidRefs.length > 0) {
      totalOrphanSolvedRefs += invalidRefs.length;
      userSolvedOrphans.push({
        userId: u._id,
        emailId: u.emailId,
        invalidRefs: invalidRefs.map(id => id.toString())
      });
    }
  }

  // Print Summary & Samples
  console.log(`[1] Orphan Submissions (Missing Problem): ${orphanSubByProblem.length}`);
  if (orphanSubByProblem.length > 0) {
    console.log('    Sample IDs:', orphanSubByProblem.slice(0, 5).map(s => s._id));
  }

  console.log(`[2] Orphan Submissions (Missing User): ${orphanSubByUser.length}`);
  if (orphanSubByUser.length > 0) {
    console.log('    Sample IDs:', orphanSubByUser.slice(0, 5).map(s => s._id));
  }

  console.log(`    Total Unique Orphan Submissions: ${allOrphanSubs.length}`);

  console.log(`\n[3] Orphan Solution Videos (Missing Problem): ${orphanVideos.length}`);
  if (orphanVideos.length > 0) {
    orphanVideos.slice(0, 5).forEach(v => {
      console.log(`    - Video ID: ${v._id}, problemId: ${v.problemId}, Cloudinary ID: ${v.cloudinaryPublicId || 'none'}`);
    });
  }

  console.log(`\n[4] Users with Orphan problemSolved entries: ${userSolvedOrphans.length} users (Total invalid refs: ${totalOrphanSolvedRefs})`);
  if (userSolvedOrphans.length > 0) {
    userSolvedOrphans.slice(0, 5).forEach(u => {
      console.log(`    - User: ${u.emailId} (${u.userId}), Invalid Problem IDs:`, u.invalidRefs);
    });
  }

  if (!isApply) {
    console.log(`\n[DRY RUN] No changes were made to the database.`);
    console.log(`To apply deletions and cleanup, run with --apply: npm run cleanup-orphans -- --apply\n`);
  } else {
    // 1. Delete orphan submissions
    const subIdsToDelete = allOrphanSubs.map(s => s._id);
    if (subIdsToDelete.length > 0) {
      const delSubs = await Submission.deleteMany({ _id: { $in: subIdsToDelete } });
      console.log(`[APPLIED] Deleted ${delSubs.deletedCount} orphan submissions.`);
    }

    // 2. Delete orphan solution videos (Cloudinary + DB)
    if (orphanVideos.length > 0) {
      for (const video of orphanVideos) {
        if (video.cloudinaryPublicId) {
          try {
            await deleteCloudinaryVideo(video.cloudinaryPublicId);
          } catch (err) {
            console.error(`Failed to delete Cloudinary asset ${video.cloudinaryPublicId}:`, err.message);
          }
        }
      }
      const videoIdsToDelete = orphanVideos.map(v => v._id);
      const delVideos = await SolutionVideo.deleteMany({ _id: { $in: videoIdsToDelete } });
      console.log(`[APPLIED] Deleted ${delVideos.deletedCount} orphan solution videos.`);
    }

    // 3. Clean orphan problemSolved references in Users
    let cleanedUserCount = 0;
    for (const u of userSolvedOrphans) {
      await User.updateOne(
        { _id: u.userId },
        { $pull: { problemSolved: { $in: u.invalidRefs } } }
      );
      cleanedUserCount++;
    }
    console.log(`[APPLIED] Cleaned orphan problemSolved references across ${cleanedUserCount} users.`);
    console.log(`\nCleanup completed successfully.\n`);
  }

  await mongoose.disconnect();
}

cleanupOrphans().catch(err => {
  console.error("Cleanup orphans error:", err);
  process.exit(1);
});
