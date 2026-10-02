const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { CANONICAL_TAGS_SET, isValidTag } = require('../src/utils/problemTags');

const isApply = process.argv.includes('--apply');

// Slug -> New Tags map
const NEW_TAGS_MAP = {
  'addition-of-two-numbers': ['math'],
  'check-even-or-odd': ['math'],
  'factorial-of-a-number': ['math', 'recursion'],
  'nth-fibonacci-number': ['recursion', 'dp'],
  'palindrome-check': ['string', 'twoPointers'],
  'count-vowels': ['string'],
  'reverse-a-string': ['string', 'twoPointers'],
  'two-sum-target': ['array', 'hashTable'],
  'two-sum': ['array', 'hashTable'],
  'reverse-linked-list': ['linkedList'],
  'merge-two-sorted-lists': ['linkedList'],
  'climbing-stairs': ['dp', 'math'],
  'maximum-subarray': ['array', 'dp'],
  'valid-parentheses': ['string', 'stack'],
  'longest-common-subsequence': ['string', 'dp'],
  'number-of-islands': ['graph', 'array'],
  'multiply-two-numbers': ['math'],
};

// Validate all tags against CANONICAL_TAGS_SET before writing
function validateMapTags() {
  const invalidEntries = [];
  for (const [slug, tags] of Object.entries(NEW_TAGS_MAP)) {
    if (!Array.isArray(tags) || tags.length === 0) {
      invalidEntries.push({ slug, error: 'Tags must be a non-empty array' });
      continue;
    }
    for (const tag of tags) {
      if (!isValidTag(tag)) {
        invalidEntries.push({ slug, tag, error: `Invalid tag "${tag}"` });
      }
    }
  }

  if (invalidEntries.length > 0) {
    console.error('FATAL: Tag validation failed! Invalid tag(s) detected in NEW_TAGS_MAP:');
    console.error(JSON.stringify(invalidEntries, null, 2));
    process.exit(1);
  }
}

async function run() {
  console.log(`=== Problem Tags Fix & Counter Reset (${isApply ? 'APPLY MODE' : 'DRY RUN'}) ===\n`);

  // 1. Validate tags upfront
  validateMapTags();

  if (!process.env.DB_CONNECT_STRING) {
    console.error('ERROR: DB_CONNECT_STRING is not set in environment.');
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_CONNECT_STRING);
  const db = mongoose.connection.db;
  const problemsCol = db.collection('problems');
  const counterCol = db.collection('counters');

  const totalInDb = await problemsCol.countDocuments();
  const rawProblems = await problemsCol.find({}).sort({ problemNumber: 1, _id: 1 }).toArray();

  // Check for slugs in NEW_TAGS_MAP that don't exist in the DB
  const existingSlugs = new Set(rawProblems.map((p) => p.slug).filter(Boolean));
  for (const slug of Object.keys(NEW_TAGS_MAP)) {
    if (!existingSlugs.has(slug)) {
      console.warn(`WARNING: Slug "${slug}" in NEW_TAGS_MAP does not exist in DB. Skipping.`);
    }
  }

  // Calculate tag updates
  const plan = [];
  let maxProblemNumber = 0;

  for (const prob of rawProblems) {
    if (typeof prob.problemNumber === 'number' && prob.problemNumber > maxProblemNumber) {
      maxProblemNumber = prob.problemNumber;
    }

    const currentTags = Array.isArray(prob.tags) ? prob.tags : [];
    const targetTags = prob.slug ? NEW_TAGS_MAP[prob.slug] : null;

    let needsUpdate = false;
    if (targetTags) {
      const isIdentical =
        currentTags.length === targetTags.length &&
        currentTags.every((t, i) => t === targetTags[i]);
      if (!isIdentical) {
        needsUpdate = true;
      }
    }

    plan.push({
      _id: prob._id,
      problemNumber: prob.problemNumber,
      slug: prob.slug,
      oldTags: currentTags,
      targetTags: targetTags || currentTags,
      needsUpdate,
    });
  }

  // Check Counter
  const counterDoc = await counterCol.findOne({ _id: 'problemNumber' });
  const currentSeq = counterDoc ? counterDoc.seq : 0;
  const counterNeedsUpdate = currentSeq > maxProblemNumber;
  const targetSeq = counterNeedsUpdate ? maxProblemNumber : currentSeq;

  // Print Table
  console.log('---------------------------------------------------------------------------------------------------------');
  console.log(
    'No.'.padEnd(6) +
    'Slug'.padEnd(32) +
    'Old Tags'.padEnd(25) +
    'New Tags'.padEnd(25) +
    'Status'
  );
  console.log('---------------------------------------------------------------------------------------------------------');

  for (const item of plan) {
    const numStr = `#${item.problemNumber !== undefined ? item.problemNumber : '?'}`.padEnd(6);
    const slugStr = (item.slug || 'no-slug').padEnd(32);
    const oldTagsStr = JSON.stringify(item.oldTags).padEnd(25);
    const newTagsStr = JSON.stringify(item.targetTags).padEnd(25);
    const statusStr = item.needsUpdate ? (isApply ? 'UPDATED' : 'WILL UPDATE') : 'NO CHANGE';
    console.log(`${numStr}${slugStr}${oldTagsStr}${newTagsStr}${statusStr}`);
  }
  console.log('---------------------------------------------------------------------------------------------------------\n');

  console.log('Counter "problemNumber":');
  console.log(`  Current seq: ${currentSeq}`);
  console.log(`  Max problemNumber in DB: ${maxProblemNumber}`);
  console.log(
    `  Target seq:  ${targetSeq} ${
      counterNeedsUpdate
        ? isApply
          ? '(RESET to max)'
          : '(WILL RESET because current > max)'
        : '(NO CHANGE)'
    }\n`
  );

  const updateCount = plan.filter((p) => p.needsUpdate).length;

  if (updateCount === 0 && !counterNeedsUpdate) {
    console.log('Nothing to do: all problem tags and counter sequence are already up to date.\n');
    await mongoose.disconnect();
    return;
  }

  if (isApply) {
    // 1. Export backup before any writes
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = Date.now();
    const backupPath = path.join(backupDir, `problems_${timestamp}.json`);

    console.log(`Exporting collection backup to: ${backupPath}`);
    const allDocs = await problemsCol.find({}).sort({ _id: 1 }).toArray();
    fs.writeFileSync(backupPath, JSON.stringify(allDocs, null, 2), 'utf-8');

    // 2. Verify backup
    const backupContent = fs.readFileSync(backupPath, 'utf-8');
    const parsedBackup = JSON.parse(backupContent);

    if (parsedBackup.length !== totalInDb) {
      console.error(
        `FATAL: Backup verification failed! Collection has ${totalInDb} docs, but backup has ${parsedBackup.length} docs. Aborting.`
      );
      process.exit(1);
    }
    console.log(`Backup verified: ${parsedBackup.length} of ${totalInDb} documents backed up successfully.\n`);

    // 3. Apply Tag Updates
    if (updateCount > 0) {
      console.log(`Applying tag updates to ${updateCount} problem(s)...`);
      for (const item of plan) {
        if (item.needsUpdate) {
          await problemsCol.updateOne(
            { _id: item._id },
            { $set: { tags: item.targetTags } }
          );
        }
      }
      console.log(`Successfully updated tags for ${updateCount} problem(s).`);
    }

    // 4. Update Counter
    if (counterNeedsUpdate) {
      console.log(`Resetting counter 'problemNumber' seq from ${currentSeq} to ${targetSeq}...`);
      await counterCol.updateOne(
        { _id: 'problemNumber' },
        { $set: { seq: targetSeq } },
        { upsert: true }
      );
      console.log(`Counter 'problemNumber' seq set to ${targetSeq}.`);
    }

    console.log('\n=== Apply Finished Successfully ===');
  } else {
    console.log(`[DRY RUN] ${updateCount} problem(s) will be updated, counter will reset to ${targetSeq}.`);
    console.log('Run with `node backend/scripts/fix_tags_v6b.js --apply` to execute.');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
