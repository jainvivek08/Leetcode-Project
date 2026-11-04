const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { EJSON } = require('bson');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/user');
const Problem = require('../src/models/problem');
const Submission = require('../src/models/submission');
const Discussion = require('../src/models/discussion');
const SolutionVideo = require('../src/models/solutionVideo');
const Counter = require('../src/models/counter');

const CANONICAL_COLLECTIONS = new Set([
  'users',
  'problems',
  'submissions',
  'discussions',
  'solutionvideos',
  'counters',
]);

/**
 * UnionFind Helper for grouping duplicate problem candidates
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
 * Score problem document for canonical selection
 */
function scoreProblem(p) {
  let score = 0;
  const startCodeCount = Array.isArray(p.startCode) ? p.startCode.length : 0;
  score += startCodeCount * 100;

  const refSolCount = Array.isArray(p.referenceSolution) ? p.referenceSolution.length : 0;
  score += refSolCount * 100;

  const visCount = Array.isArray(p.visibleTestCases) ? p.visibleTestCases.length : 0;
  const hidCount = Array.isArray(p.hiddenTestCases) ? p.hiddenTestCases.length : 0;
  score += (visCount + hidCount) * 10;

  if (p.description && p.description.trim().length > 0) {
    score += 50;
  }
  if (typeof p.problemNumber === 'number' && !isNaN(p.problemNumber)) {
    score += 20;
  }
  if (p.slug && p.slug.trim().length > 0) {
    score += 20;
  }
  return score;
}

async function organizeDatabase() {
  const isApply = process.argv.includes('--apply');

  console.log(`\n======================================================`);
  console.log(`=== CODEQUEST DATABASE ORGANIZER & CLEANUP ===`);
  console.log(`Mode: ${isApply ? 'APPLY MODE (Executing Changes)' : 'DRY-RUN MODE (Preview Only - No Changes)'}`);
  console.log(`======================================================\n`);

  if (!isApply) {
    console.log('NOTE: Running in dry-run mode. Pass --apply to persist changes.\n');
  }

  const dbUri = process.env.DB_CONNECT_STRING || process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!dbUri) {
    console.error('ERROR: No MongoDB connection string found in backend/.env (checked DB_CONNECT_STRING, MONGO_URI, DATABASE_URL).');
    process.exit(1);
  }

  console.log('Connecting to MongoDB database...');
  await mongoose.connect(dbUri);
  const db = mongoose.connection.db;
  console.log(`Connected successfully to database: "${db.databaseName}".\n`);

  // ==========================================================
  // STEP 1: CREATE TIMESTAMPED BACKUP
  // ==========================================================
  console.log('--- STEP 1: Generating JSON Backup ---');
  const backupDir = path.join(__dirname, 'backups', `organize_db_backup_${Date.now()}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const initialCollections = await db.listCollections().toArray();
  for (const col of initialCollections) {
    const docs = await db.collection(col.name).find({}).toArray();
    let serialized;
    try {
      serialized = docs.map((doc) => EJSON.serialize(doc, { relaxed: true }));
    } catch {
      serialized = docs;
    }
    const backupFile = path.join(backupDir, `${col.name}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(serialized, null, 2), 'utf-8');
  }
  console.log(`Backup completed for ${initialCollections.length} collections -> ${backupDir}\n`);

  // ==========================================================
  // STEP 2: ORGANIZE CANONICAL USERS
  // ==========================================================
  console.log('--- STEP 2: Organizing User Accounts (1 Admin + 1 Demo User) ---');
  const adminEmail = 'admin@codequest.com';
  const adminPasswordRaw = 'AdminPassword123!';
  const adminHashedPassword = await bcrypt.hash(adminPasswordRaw, 10);

  const demoEmail = 'user@codequest.com';
  const demoPasswordRaw = 'UserPassword123!';
  const demoHashedPassword = await bcrypt.hash(demoPasswordRaw, 10);

  const existingUsers = await User.find({}).lean();
  console.log(`Initial User Count: ${existingUsers.length}`);

  let adminUser;
  let demoUser;

  if (isApply) {
    // 1) Ensure Admin Account
    adminUser = await User.findOne({ emailId: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        emailId: adminEmail,
        password: adminHashedPassword,
        role: 'admin',
        streakCount: 0,
        lastSolvedDate: null,
        problemSolved: [],
        bookmarks: [],
        bio: 'CodeQuest Platform Administrator',
      });
      console.log(`Created canonical Admin account: ${adminEmail}`);
    } else {
      adminUser.firstName = 'Admin';
      adminUser.lastName = 'User';
      adminUser.role = 'admin';
      adminUser.password = adminHashedPassword;
      adminUser.streakCount = 0;
      adminUser.lastSolvedDate = null;
      await adminUser.save();
      console.log(`Updated canonical Admin account: ${adminEmail}`);
    }

    // 2) Ensure Standard Demo User Account
    demoUser = await User.findOne({ emailId: demoEmail });
    if (!demoUser) {
      demoUser = await User.create({
        firstName: 'Demo',
        lastName: 'User',
        emailId: demoEmail,
        password: demoHashedPassword,
        role: 'user',
        streakCount: 0,
        lastSolvedDate: null,
        problemSolved: [],
        bookmarks: [],
        bio: 'CodeQuest Demo Problem Solver',
      });
      console.log(`Created canonical Demo User account: ${demoEmail}`);
    } else {
      demoUser.firstName = 'Demo';
      demoUser.lastName = 'User';
      demoUser.role = 'user';
      demoUser.password = demoHashedPassword;
      demoUser.streakCount = 0;
      demoUser.lastSolvedDate = null;
      await demoUser.save();
      console.log(`Updated canonical Demo User account: ${demoEmail}`);
    }

    // 3) Delete all other non-canonical users
    const usersToDelete = await User.find({
      _id: { $nin: [adminUser._id, demoUser._id] },
    }).lean();

    const delUsersResult = await User.deleteMany({
      _id: { $nin: [adminUser._id, demoUser._id] },
    });
    console.log(`Deleted ${delUsersResult.deletedCount} non-canonical user(s):`);
    usersToDelete.forEach((u) => console.log(`   - ${u.emailId} (${u.role})`));
  } else {
    console.log(`[DRY-RUN] Would ensure Admin (${adminEmail}) and Demo User (${demoEmail}).`);
    const usersToDelete = existingUsers.filter(
      (u) => u.emailId !== adminEmail && u.emailId !== demoEmail
    );
    console.log(`[DRY-RUN] Would delete ${usersToDelete.length} non-canonical user(s):`);
    usersToDelete.forEach((u) => console.log(`   - ${u.emailId} (${u.role})`));
    adminUser = existingUsers.find((u) => u.emailId === adminEmail) || { _id: new mongoose.Types.ObjectId() };
    demoUser = existingUsers.find((u) => u.emailId === demoEmail) || { _id: new mongoose.Types.ObjectId() };
  }
  console.log('');

  // ==========================================================
  // STEP 3: CLEAN & DEDUPLICATE PROBLEMS
  // ==========================================================
  console.log('--- STEP 3: Cleaning & Deduplicating Problems ---');

  // Purge test problems
  const testProblems = await Problem.find({
    $or: [
      { problemNumber: { $gte: 1000 } },
      { title: { $regex: /runtime test|test problem/i } },
      { slug: 'undefined' },
      { slug: null },
    ],
  }).lean();

  if (testProblems.length > 0) {
    console.log(`Found ${testProblems.length} test problem(s):`);
    testProblems.forEach((tp) => console.log(`   - #${tp.problemNumber}: ${tp.title} (ID: ${tp._id})`));
    if (isApply) {
      await Problem.deleteMany({ _id: { $in: testProblems.map((tp) => tp._id) } });
      console.log(`Purged ${testProblems.length} test problem(s).`);
    } else {
      console.log(`[DRY-RUN] Would purge ${testProblems.length} test problem(s).`);
    }
  }

  // Deduplicate curriculum problems
  const problems = await Problem.find({}).sort({ problemNumber: 1, _id: 1 }).lean();
  const uf = new UnionFind();
  const byNumber = new Map();
  const bySlug = new Map();
  const byTitle = new Map();

  for (const p of problems) {
    const pId = p._id.toString();
    uf.find(pId);

    if (typeof p.problemNumber === 'number' && !isNaN(p.problemNumber)) {
      if (byNumber.has(p.problemNumber)) {
        uf.union(pId, byNumber.get(p.problemNumber));
      } else {
        byNumber.set(p.problemNumber, pId);
      }
    }

    if (p.slug && typeof p.slug === 'string') {
      const normSlug = p.slug.trim().toLowerCase();
      if (normSlug && normSlug !== 'undefined') {
        if (bySlug.has(normSlug)) {
          uf.union(pId, bySlug.get(normSlug));
        } else {
          bySlug.set(normSlug, pId);
        }
      }
    }

    if (p.title && typeof p.title === 'string') {
      const normTitle = p.title.replace(/^#?\d+\.\s*/, '').trim().toLowerCase();
      if (normTitle) {
        if (byTitle.has(normTitle)) {
          uf.union(pId, byTitle.get(normTitle));
        } else {
          byTitle.set(normTitle, pId);
        }
      }
    }
  }

  const clusters = new Map();
  for (const p of problems) {
    const pId = p._id.toString();
    const root = uf.find(pId);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(p);
  }

  const duplicatesToDelete = [];
  for (const [rootId, group] of clusters.entries()) {
    if (group.length > 1) {
      group.sort((a, b) => scoreProblem(b) - scoreProblem(a));
      const canonical = group[0];
      const dupes = group.slice(1);
      console.log(`Duplicate group found for "${canonical.title}" (#${canonical.problemNumber}):`);
      console.log(`   Canonical: ID ${canonical._id}`);
      dupes.forEach((d) => {
        console.log(`   Duplicate to remove: ID ${d._id}`);
        duplicatesToDelete.push(d._id);
      });
    }
  }

  if (duplicatesToDelete.length > 0) {
    if (isApply) {
      await Problem.deleteMany({ _id: { $in: duplicatesToDelete } });
      console.log(`Deleted ${duplicatesToDelete.length} duplicate problem(s).`);
    } else {
      console.log(`[DRY-RUN] Would delete ${duplicatesToDelete.length} duplicate problem(s).`);
    }
  } else {
    console.log('No problem duplicates detected. Curriculum problems are clean.');
  }

  // Ensure unique indexes on problemNumber and slug
  const problemIndexes = await db.collection('problems').indexes();
  const probNumIdx = problemIndexes.find((idx) => idx.key && idx.key.problemNumber === 1);
  if (probNumIdx && !probNumIdx.unique && isApply) {
    await db.collection('problems').dropIndex(probNumIdx.name);
  }
  if (isApply) {
    try {
      await db.collection('problems').createIndex(
        { problemNumber: 1 },
        { unique: true, sparse: true, background: true }
      );
      await db.collection('problems').createIndex(
        { slug: 1 },
        { unique: true, sparse: true, background: true }
      );
      console.log('Verified unique indexes on problems: { problemNumber: 1 } and { slug: 1 }.');
    } catch (idxErr) {
      console.warn('Index notice:', idxErr.message);
    }
  }

  // Synchronize Counter Sequence
  const remainingProblems = await Problem.find({}).sort({ problemNumber: -1 }).lean();
  const maxProbNumber = remainingProblems[0]?.problemNumber || 17;
  if (isApply) {
    await db.collection('counters').updateOne(
      { _id: 'problemNumber' },
      { $set: { seq: maxProbNumber } },
      { upsert: true }
    );
    console.log(`Updated problemNumber sequence counter to ${maxProbNumber}.`);
  }
  console.log('');

  // ==========================================================
  // STEP 4: CLEAN SUBMISSIONS & DISCUSSIONS
  // ==========================================================
  console.log('--- STEP 4: Cleaning Submissions & Discussions ---');
  const validUserIds = [adminUser._id.toString(), demoUser._id.toString()];
  const validProblemIds = remainingProblems.map((p) => p._id.toString());

  // 1) Submissions
  const allSubmissions = await Submission.find({}).lean();
  const orphanSubs = allSubmissions.filter((s) => {
    const uIdStr = s.userId?.toString();
    const pIdStr = s.problemId?.toString();
    return !validUserIds.includes(uIdStr) || !validProblemIds.includes(pIdStr);
  });

  console.log(`Total Submissions: ${allSubmissions.length}`);
  console.log(`Orphan/Test Submissions: ${orphanSubs.length}`);

  if (orphanSubs.length > 0) {
    if (isApply) {
      const delSubsResult = await Submission.deleteMany({
        _id: { $in: orphanSubs.map((s) => s._id) },
      });
      console.log(`Purged ${delSubsResult.deletedCount} orphan submission(s).`);
    } else {
      console.log(`[DRY-RUN] Would purge ${orphanSubs.length} orphan submission(s).`);
    }
  }

  // 2) Discussions
  const allDiscussions = await Discussion.find({}).lean();
  console.log(`Total Discussions: ${allDiscussions.length}`);
  for (const disc of allDiscussions) {
    const pIdStr = disc.problemId?.toString();
    const uIdStr = disc.userId?.toString();
    if (!validProblemIds.includes(pIdStr)) {
      if (isApply) {
        await Discussion.deleteOne({ _id: disc._id });
        console.log(`Removed discussion with missing problem ID: ${disc.title}`);
      }
    } else if (!validUserIds.includes(uIdStr)) {
      if (isApply) {
        await Discussion.updateOne({ _id: disc._id }, { $set: { userId: demoUser._id } });
        console.log(`Remapped discussion "${disc.title}" to Demo User (${demoEmail}).`);
      }
    }
  }
  console.log('');

  // ==========================================================
  // STEP 5: DROP NON-CANONICAL / TEST / UNUSED COLLECTIONS
  // ==========================================================
  console.log('--- STEP 5: Purging Non-Canonical / Test Collections ---');
  const currentCollections = await db.listCollections().toArray();
  const nonCanonicalCollections = currentCollections.filter(
    (c) => !CANONICAL_COLLECTIONS.has(c.name) && !c.name.startsWith('system.')
  );

  console.log(`Found ${nonCanonicalCollections.length} non-canonical collection(s):`);
  for (const col of nonCanonicalCollections) {
    const count = await db.collection(col.name).countDocuments();
    if (isApply) {
      try {
        await db.collection(col.name).drop();
        console.log(`   ✔ Dropped collection: "${col.name}" (${count} documents)`);
      } catch (err) {
        console.warn(`   ✖ Could not drop "${col.name}": ${err.message}`);
      }
    } else {
      console.log(`   [DRY-RUN] Would drop collection: "${col.name}" (${count} documents)`);
    }
  }
  console.log('');

  // ==========================================================
  // STEP 6: EXPORT UPDATED COMPASS DATA (IF DIRECTORY EXISTS)
  // ==========================================================
  const compassDir = path.join(__dirname, '..', '..', 'DataPart', 'mongodb_compass_data');
  if (isApply && fs.existsSync(compassDir)) {
    console.log('--- STEP 6: Refreshing Compass Data Exports ---');
    const exportCols = ['users', 'problems', 'submissions', 'discussions', 'solutionvideos', 'counters'];
    for (const cName of exportCols) {
      const docs = await db.collection(cName).find({}).toArray();
      const serialized = docs.map((doc) => EJSON.serialize(doc, { relaxed: true }));
      const filePath = path.join(compassDir, `${cName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(serialized, null, 2), 'utf-8');
    }
    console.log(`Updated Compass export files in ${compassDir}.\n`);
  }

  // ==========================================================
  // SUMMARY REPORT
  // ==========================================================
  const finalCollections = await db.listCollections().toArray();
  console.log(`======================================================`);
  console.log(`=== DATABASE CLEANUP SUMMARY ===`);
  console.log(`======================================================`);
  console.log(`Canonical Collections Active (${finalCollections.length}):`);
  for (const c of finalCollections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`   - ${c.name.padEnd(16)}: ${count} docs`);
  }

  const finalUsers = await User.find({}, { password: 0 }).lean();
  console.log(`\nActive Accounts (${finalUsers.length}):`);
  finalUsers.forEach((u) => {
    console.log(`   - ${u.role.toUpperCase().padEnd(6)} | ${u.emailId} | ${u.firstName} ${u.lastName || ''} | Streak: ${u.streakCount}`);
  });

  console.log(`\nCredentials:`);
  console.log(`   Admin:     ${adminEmail} / ${adminPasswordRaw}`);
  console.log(`   Demo User: ${demoEmail} / ${demoPasswordRaw}`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
  console.log('Disconnected cleanly from MongoDB.');
}

organizeDatabase().catch((err) => {
  console.error('Fatal error during database organization:', err);
  process.exit(1);
});
