const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { CANONICAL_TAGS, CANONICAL_TAGS_SET } = require('../src/utils/problemTags');
const { slugifyBase, generateUniqueSlug } = require('../src/utils/slugify');

const isApply = process.argv.includes('--apply');

// Tag mapping / normalization helper
function normalizeTagsToCanonical(tagsRaw) {
  let tagsList = [];
  if (Array.isArray(tagsRaw)) {
    tagsList = tagsRaw;
  } else if (typeof tagsRaw === 'string') {
    tagsList = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  // Canonical tag synonyms/case adjustments
  const normalized = tagsList.map((t) => {
    const lower = t.toLowerCase();
    if (lower === 'linkedlist') return 'linkedList';
    if (lower === 'hashtable') return 'hashTable';
    if (lower === 'binarysearch') return 'binarySearch';
    if (lower === 'twopointers') return 'twoPointers';
    if (lower === 'slidingwindow') return 'slidingWindow';
    if (lower === 'bitmanipulation') return 'bitManipulation';
    return t;
  });

  // Keep valid canonical tags, remove duplicates
  const valid = [...new Set(normalized.filter((t) => CANONICAL_TAGS_SET.has(t)))];
  return valid.length > 0 ? valid : ['array'];
}

async function migrate() {
  console.log(`=== Starting Problem Migration v6 (${isApply ? 'APPLY MODE' : 'DRY RUN'}) ===\n`);

  if (!process.env.DB_CONNECT_STRING) {
    console.error('ERROR: DB_CONNECT_STRING is not set in environment.');
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log('Connected to MongoDB Atlas.');

  const db = mongoose.connection.db;
  const problemsCol = db.collection('problems');
  const counterCol = db.collection('counters');

  const totalInDb = await problemsCol.countDocuments();
  console.log(`Found ${totalInDb} problem documents in the collection.\n`);

  if (isApply) {
    // Step B2: Create backup and verify counts
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = Date.now();
    const backupPath = path.join(backupDir, `problems_${timestamp}.json`);

    console.log('Creating full collection backup...');
    const allDocs = await problemsCol.find({}).sort({ _id: 1 }).toArray();
    fs.writeFileSync(backupPath, JSON.stringify(allDocs, null, 2), 'utf-8');

    // Verify backup file document count
    const backupContent = fs.readFileSync(backupPath, 'utf-8');
    const parsedBackup = JSON.parse(backupContent);

    if (parsedBackup.length !== totalInDb) {
      console.error(
        `FATAL: Backup verification failed! Collection has ${totalInDb} docs, but backup has ${parsedBackup.length} docs. Aborting migration.`
      );
      process.exit(1);
    }

    console.log(`Backup verified successfully!`);
    console.log(`  File: ${backupPath}`);
    console.log(`  Documents verified: ${parsedBackup.length} / ${totalInDb}\n`);
  }

  // Fetch problems ordered by _id ascending
  const rawProblems = await problemsCol.find({}).sort({ _id: 1 }).toArray();

  // Find used numbers and slugs to prevent collisions
  const usedNumbers = new Set();
  const usedSlugs = new Set();

  rawProblems.forEach((p) => {
    if (typeof p.problemNumber === 'number' && p.problemNumber > 0) {
      usedNumbers.add(p.problemNumber);
    }
    if (typeof p.slug === 'string' && p.slug.trim()) {
      usedSlugs.add(p.slug.trim());
    }
  });

  let nextAutoNumber = 1;
  const getNextAvailableNumber = () => {
    while (usedNumbers.has(nextAutoNumber)) {
      nextAutoNumber++;
    }
    usedNumbers.add(nextAutoNumber);
    return nextAutoNumber;
  };

  const plan = [];
  let maxAssignedNumber = 0;

  for (const prob of rawProblems) {
    let needsUpdate = false;
    const updates = {};

    // 1. Tags
    const currentTags = prob.tags;
    const isAlreadyArray = Array.isArray(currentTags);
    const newTags = normalizeTagsToCanonical(currentTags);

    const tagsMatch =
      isAlreadyArray &&
      currentTags.length === newTags.length &&
      currentTags.every((t, i) => t === newTags[i]);

    if (!tagsMatch) {
      needsUpdate = true;
      updates.tags = newTags;
    }

    // 2. Problem Number
    let pNumber = prob.problemNumber;
    if (typeof pNumber !== 'number' || pNumber <= 0) {
      needsUpdate = true;
      pNumber = getNextAvailableNumber();
      updates.problemNumber = pNumber;
    }
    if (pNumber > maxAssignedNumber) {
      maxAssignedNumber = pNumber;
    }

    // 3. Slug
    let pSlug = prob.slug;
    if (typeof pSlug !== 'string' || !pSlug.trim()) {
      needsUpdate = true;
      let base = slugifyBase(prob.title);
      let cand = base;
      let counter = 2;
      while (usedSlugs.has(cand)) {
        cand = `${base}-${counter++}`;
      }
      usedSlugs.add(cand);
      pSlug = cand;
      updates.slug = pSlug;
    }

    // 4. Constraints
    if (!Array.isArray(prob.constraints)) {
      needsUpdate = true;
      updates.constraints = [];
    }

    // 5. Time Limit
    if (typeof prob.timeLimit !== 'number') {
      needsUpdate = true;
      updates.timeLimit = 2;
    }

    // 6. Memory Limit
    if (typeof prob.memoryLimit !== 'number') {
      needsUpdate = true;
      updates.memoryLimit = 256;
    }

    plan.push({
      _id: prob._id,
      title: prob.title,
      oldTags: currentTags,
      newTags: updates.tags || currentTags,
      problemNumber: updates.problemNumber || prob.problemNumber,
      slug: updates.slug || prob.slug,
      needsUpdate,
      updates,
    });
  }

  // Print Migration Plan Table
  console.log('Migration Plan:');
  console.log('-------------------------------------------------------------------------------------------------------------------------');
  console.log(
    'No.'.padEnd(5) +
    'Title'.padEnd(32) +
    'Slug'.padEnd(30) +
    'Old Tags'.padEnd(20) +
    'New Tags'.padEnd(25) +
    'Status'
  );
  console.log('-------------------------------------------------------------------------------------------------------------------------');

  for (const item of plan) {
    const numStr = `#${item.problemNumber}`.padEnd(5);
    const titleStr = (item.title.length > 29 ? item.title.slice(0, 26) + '...' : item.title).padEnd(32);
    const slugStr = (item.slug.length > 28 ? item.slug.slice(0, 25) + '...' : item.slug).padEnd(30);
    const oldTagsStr = String(item.oldTags).padEnd(20);
    const newTagsStr = JSON.stringify(item.newTags).padEnd(25);
    const statusStr = item.needsUpdate ? (isApply ? 'UPDATED' : 'WILL UPDATE') : 'UP TO DATE';

    console.log(`${numStr}${titleStr}${slugStr}${oldTagsStr}${newTagsStr}${statusStr}`);
  }
  console.log('-------------------------------------------------------------------------------------------------------------------------\n');

  const updateCount = plan.filter((p) => p.needsUpdate).length;

  if (isApply) {
    if (updateCount > 0) {
      console.log(`Writing updates for ${updateCount} problems...`);
      for (const item of plan) {
        if (item.needsUpdate) {
          await problemsCol.updateOne(
            { _id: item._id },
            { $set: item.updates }
          );
        }
      }
      console.log('Problem collection updates written successfully.');
    } else {
      console.log('No problem documents required updating (already up to date).');
    }

    // Update Counter sequence to maxAssignedNumber
    console.log(`Setting Counter 'problemNumber' seq to ${maxAssignedNumber}...`);
    const existingCounter = await counterCol.findOne({ _id: 'problemNumber' });
    const currentSeq = existingCounter ? existingCounter.seq : 0;
    const finalSeq = Math.max(currentSeq, maxAssignedNumber);

    await counterCol.updateOne(
      { _id: 'problemNumber' },
      { $set: { seq: finalSeq } },
      { upsert: true }
    );
    console.log(`Counter 'problemNumber' set to ${finalSeq}.\n`);

    // Verify final state
    const finalDocs = await problemsCol.find({}).sort({ problemNumber: 1 }).toArray();
    console.log(`=== Migration Complete ===`);
    console.log(`Final Problem Count: ${finalDocs.length} (Expected: ${totalInDb})`);
    if (finalDocs.length === totalInDb) {
      console.log('SUCCESS: Final count matches collection count perfectly.');
    } else {
      console.error('WARNING: Document count mismatch!');
    }
  } else {
    console.log(`[DRY RUN] ${updateCount} problems need updates.`);
    console.log('Run with `node scripts/migrate_problems_v6.js --apply` to apply changes.');
  }

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
