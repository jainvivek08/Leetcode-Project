const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Problem = require('../src/models/problem');
const Submission = require('../src/models/submission');
const User = require('../src/models/user');
const SolutionVideo = require('../src/models/solutionVideo');
const Discussion = require('../src/models/discussion');

/**
 * Disjoint-set / Union-Find helper to cluster duplicates
 */
class UnionFind {
  constructor() {
    this.parent = new Map();
  }

  find(id) {
    if (!this.parent.has(id)) {
      this.parent.set(id, id);
      return id;
    }
    if (this.parent.get(id) !== id) {
      this.parent.set(id, this.find(this.parent.get(id)));
    }
    return this.parent.get(id);
  }

  union(id1, id2) {
    const root1 = this.find(id1);
    const root2 = this.find(id2);
    if (root1 !== root2) {
      this.parent.set(root1, root2);
    }
  }
}

/**
 * Score a problem document for canonical selection.
 * Higher score = more complete / better candidate to keep.
 */
function scoreProblem(p) {
  let score = 0;
  // Completeness of startCode
  const startCodeCount = Array.isArray(p.startCode) ? p.startCode.length : 0;
  score += startCodeCount * 100;

  // Completeness of referenceSolution
  const refSolCount = Array.isArray(p.referenceSolution) ? p.referenceSolution.length : 0;
  score += refSolCount * 100;

  // Visible & hidden test cases
  const visCount = Array.isArray(p.visibleTestCases) ? p.visibleTestCases.length : 0;
  const hidCount = Array.isArray(p.hiddenTestCases) ? p.hiddenTestCases.length : 0;
  score += (visCount + hidCount) * 10;

  // Description completeness
  if (p.description && p.description.trim().length > 0) {
    score += 50;
  }

  // Valid problemNumber
  if (typeof p.problemNumber === 'number' && !isNaN(p.problemNumber)) {
    score += 20;
  }

  // Valid slug
  if (p.slug && p.slug.trim().length > 0) {
    score += 20;
  }

  return score;
}

/**
 * Get timestamp from document (createdAt or ObjectId timestamp)
 */
function getDocTimestamp(doc) {
  if (doc.createdAt) {
    return new Date(doc.createdAt).getTime();
  }
  if (doc._id && typeof doc._id.getTimestamp === 'function') {
    return doc._id.getTimestamp().getTime();
  }
  return 0;
}

async function dedupProblems() {
  const isApply = process.argv.includes('--apply');
  console.log(`\n======================================================`);
  console.log(`=== PROBLEM DEDUPLICATION SCRIPT (${isApply ? 'APPLY MODE' : 'DRY-RUN MODE'}) ===`);
  console.log(`======================================================\n`);

  if (!isApply) {
    console.log('NOTE: Running in dry-run mode. Pass --apply to persist changes.\n');
  }

  const dbUri = process.env.DB_CONNECT_STRING;
  if (!dbUri) {
    console.error('ERROR: DB_CONNECT_STRING is not set in environment or backend/.env');
    process.exit(1);
  }

  await mongoose.connect(dbUri);
  console.log('Connected to MongoDB.\n');

  // 1. Fetch all problems
  const problems = await Problem.find({}).sort({ problemNumber: 1, _id: 1 }).lean();
  console.log(`Total problem documents in collection: ${problems.length}`);

  // 2. Cluster duplicates using Union-Find
  const uf = new UnionFind();
  const byNumber = new Map();
  const bySlug = new Map();
  const byTitle = new Map();

  for (const p of problems) {
    const pId = p._id.toString();
    uf.find(pId); // Initialize in set

    // Group by problemNumber
    if (typeof p.problemNumber === 'number' && !isNaN(p.problemNumber)) {
      if (byNumber.has(p.problemNumber)) {
        uf.union(pId, byNumber.get(p.problemNumber));
      } else {
        byNumber.set(p.problemNumber, pId);
      }
    }

    // Group by slug
    if (p.slug && typeof p.slug === 'string') {
      const normSlug = p.slug.trim().toLowerCase();
      if (normSlug) {
        if (bySlug.has(normSlug)) {
          uf.union(pId, bySlug.get(normSlug));
        } else {
          bySlug.set(normSlug, pId);
        }
      }
    }

    // Group by normalized title
    if (p.title && typeof p.title === 'string') {
      const normTitle = p.title.trim().toLowerCase();
      if (normTitle) {
        if (byTitle.has(normTitle)) {
          uf.union(pId, byTitle.get(normTitle));
        } else {
          byTitle.set(normTitle, pId);
        }
      }
    }
  }

  // 3. Collect groups
  const groupsMap = new Map();
  for (const p of problems) {
    const root = uf.find(p._id.toString());
    if (!groupsMap.has(root)) {
      groupsMap.set(root, []);
    }
    groupsMap.get(root).push(p);
  }

  // Filter for groups with duplicates (size > 1)
  const duplicateGroups = Array.from(groupsMap.values()).filter((g) => g.length > 1);

  console.log(`Duplicate groups found: ${duplicateGroups.length}\n`);

  const duplicatesToDelete = [];
  const remappings = []; // { duplicateId, canonicalId, dupDoc, canonicalDoc }

  for (const group of duplicateGroups) {
    // Sort group: highest score first, then oldest timestamp
    group.sort((a, b) => {
      const scoreDiff = scoreProblem(b) - scoreProblem(a);
      if (scoreDiff !== 0) return scoreDiff;
      // Older document preferred for tie
      return getDocTimestamp(a) - getDocTimestamp(b);
    });

    const canonical = group[0];
    const dups = group.slice(1);

    console.log(`[Duplicate Group] "${canonical.title}" (#${canonical.problemNumber || 'N/A'})`);
    console.log(`  -> CANONICAL: ID ${canonical._id} | Score: ${scoreProblem(canonical)} | startCode: ${(canonical.startCode || []).length} | refSol: ${(canonical.referenceSolution || []).length}`);

    for (const dup of dups) {
      console.log(`  -> DUPLICATE TO REMOVE: ID ${dup._id} | Score: ${scoreProblem(dup)} | Title: "${dup.title}" | #${dup.problemNumber || 'N/A'}`);
      duplicatesToDelete.push(dup._id);
      remappings.push({
        duplicateId: dup._id,
        canonicalId: canonical._id,
        dupDoc: dup,
        canonicalDoc: canonical,
      });
    }
    console.log('');
  }

  // 4. Create pre-clean JSON backup if in apply mode or if duplicates exist
  if (duplicateGroups.length > 0 || isApply) {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `problems_backup_pre_dedup_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(problems, null, 2), 'utf-8');
    console.log(`Pre-deduplication backup saved to: ${backupPath}\n`);
  }

  // 5. Apply remappings and deletions
  if (duplicateGroups.length > 0) {
    for (const item of remappings) {
      const dupSubCount = await Submission.countDocuments({ problemId: item.duplicateId });
      console.log(`Remapping references for duplicate ${item.duplicateId} -> canonical ${item.canonicalId}...`);
      console.log(`  Found ${dupSubCount} submission(s) to remap.`);

      if (isApply) {
        // Remap submissions
        if (dupSubCount > 0) {
          const subRes = await Submission.updateMany(
            { problemId: item.duplicateId },
            { $set: { problemId: item.canonicalId } }
          );
          console.log(`  Remapped ${subRes.modifiedCount} submission(s).`);
        }

        // Remap user problemSolved
        await User.updateMany(
          { problemSolved: item.duplicateId },
          { $addToSet: { problemSolved: item.canonicalId } }
        );
        await User.updateMany(
          { problemSolved: item.duplicateId },
          { $pull: { problemSolved: item.duplicateId } }
        );

        // Remap user bookmarks
        await User.updateMany(
          { bookmarks: item.duplicateId },
          { $addToSet: { bookmarks: item.canonicalId } }
        );
        await User.updateMany(
          { bookmarks: item.duplicateId },
          { $pull: { bookmarks: item.duplicateId } }
        );

        // Remap solution videos
        await SolutionVideo.updateMany(
          { problemId: item.duplicateId },
          { $set: { problemId: item.canonicalId } }
        );

        // Remap discussions
        await Discussion.updateMany(
          { problemId: item.duplicateId },
          { $set: { problemId: item.canonicalId } }
        );

        // Delete duplicate problem document
        const delRes = await Problem.deleteOne({ _id: item.duplicateId });
        console.log(`  Deleted duplicate problem ${item.duplicateId} (deletedCount: ${delRes.deletedCount}).`);
      }
    }
  } else {
    console.log('No duplicate problem documents exist in the database.');
  }

  // 6. Clean up any remaining orphan submissions pointing to non-existent problem IDs
  const currentProblems = await Problem.find({}, '_id').lean();
  const currentProblemIds = currentProblems.map((p) => p._id);
  const orphanSubs = await Submission.find({
    $or: [
      { problemId: { $exists: false } },
      { problemId: null },
      { problemId: { $nin: currentProblemIds } },
    ],
  }).lean();

  console.log(`\nOrphan submissions check: found ${orphanSubs.length} orphan submission(s).`);
  if (orphanSubs.length > 0 && isApply) {
    const orphanIds = orphanSubs.map((s) => s._id);
    const delSubs = await Submission.deleteMany({ _id: { $in: orphanIds } });
    console.log(`Cleaned up ${delSubs.deletedCount} orphan submission(s).`);
  }

  // 7. Ensure Safe Unique Indexes on problemNumber and slug
  console.log('\n--- Ensuring Safe Unique Constraints in Database ---');
  const existingIndexes = await Problem.collection.indexes();

  // Handle problemNumber index
  const probNumIdx = existingIndexes.find((idx) => idx.key && idx.key.problemNumber === 1);
  if (probNumIdx && !probNumIdx.unique) {
    console.log(`Existing index "${probNumIdx.name}" on problemNumber is NOT unique. Dropping to recreate with unique constraint...`);
    if (isApply) {
      await Problem.collection.dropIndex(probNumIdx.name);
      console.log(`Dropped index "${probNumIdx.name}".`);
    }
  }

  if (isApply) {
    try {
      await Problem.collection.createIndex(
        { problemNumber: 1 },
        { unique: true, sparse: true, background: true }
      );
      console.log('Created unique index: { problemNumber: 1 } (sparse: true).');
    } catch (idxErr) {
      console.error('Failed to create unique index on problemNumber:', idxErr.message);
    }
  } else {
    console.log('[DRY-RUN] Would create unique index on { problemNumber: 1 } (sparse: true).');
  }

  // Handle slug index
  const slugIdx = existingIndexes.find((idx) => idx.key && idx.key.slug === 1);
  if (slugIdx && !slugIdx.unique) {
    console.log(`Existing index "${slugIdx.name}" on slug is NOT unique. Dropping to recreate with unique constraint...`);
    if (isApply) {
      await Problem.collection.dropIndex(slugIdx.name);
      console.log(`Dropped index "${slugIdx.name}".`);
    }
  }

  if (isApply) {
    try {
      await Problem.collection.createIndex(
        { slug: 1 },
        { unique: true, sparse: true, background: true }
      );
      console.log('Created unique index: { slug: 1 } (sparse: true).');
    } catch (idxErr) {
      console.error('Failed to create unique index on slug:', idxErr.message);
    }
  } else {
    console.log('[DRY-RUN] Would create unique index on { slug: 1 } (sparse: true).');
  }

  // Verification summary
  const finalProblemCount = await Problem.countDocuments();
  console.log(`\n======================================================`);
  console.log(`=== DEDUPLICATION COMPLETE ===`);
  console.log(`  Initial Problems Count: ${problems.length}`);
  console.log(`  Duplicates Identified:  ${duplicatesToDelete.length}`);
  console.log(`  Duplicates Removed:     ${isApply ? duplicatesToDelete.length : 0}`);
  console.log(`  Final Problems Count:   ${finalProblemCount}`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

dedupProblems().catch((err) => {
  console.error('Error during deduplication:', err);
  process.exit(1);
});
