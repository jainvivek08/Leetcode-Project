/**
 * Migration Script: Add Python3 startCode & Fix Semantic Tags for 17 Seed Problems
 * 
 * Features:
 * - Standalone and idempotent
 * - Creates a verified JSON backup before writing to MongoDB
 * - Adds Python3 startCode (sys.stdin parsing) to all 17 seed problems
 * - Fixes semantic tag mismatches:
 *     - 'Reverse a String' -> ['string']
 *     - 'Valid Parentheses' -> ['stack']
 * - Preserves all other fields (test cases, reference solutions, problemNumber, etc.) 100% intact
 * 
 * Usage:
 *   node backend/scripts/migrate_seed_problems.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { isValidTag } = require('../src/utils/problemTags');

const isDryRun = process.argv.includes('--dry-run');

// Tag corrections for semantic mismatches
const TAG_CORRECTIONS = {
  'reverse-a-string': ['string'],
  'valid-parentheses': ['stack']
};

// Python3 starter code templates for each seed problem
const PYTHON3_STARTERS = {
  'addition-of-two-numbers': `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    a = int(input_data[0])
    b = int(input_data[1])
    # Write your code here to calculate and print the sum
    

if __name__ == '__main__':
    main()
`,

  'check-even-or-odd': `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    # Write your code here to print "Even" or "Odd"
    

if __name__ == '__main__':
    main()
`,

  'factorial-of-a-number': `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    # Write your code here to compute and print the factorial of n
    

if __name__ == '__main__':
    main()
`,

  'nth-fibonacci-number': `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    # Write your code here to compute and print the nth Fibonacci number
    

if __name__ == '__main__':
    main()
`,

  'palindrome-check': `import sys

def main():
    s = sys.stdin.read().strip()
    if not s:
        return
    # Write your code here to check palindrome and print "Yes" or "No"
    

if __name__ == '__main__':
    main()
`,

  'count-vowels': `import sys

def main():
    s = sys.stdin.read().strip()
    # Write your code here to count vowels and print the count
    

if __name__ == '__main__':
    main()
`,

  'reverse-a-string': `import sys

def main():
    s = sys.stdin.read().strip()
    # Write your code here to reverse the string and print it
    

if __name__ == '__main__':
    main()
`,

  'two-sum-target': `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    nums = [int(x) for x in input_data[1:n+1]]
    target = int(input_data[n+1])
    # Write your code here to find two indices that add up to target
    

if __name__ == '__main__':
    main()
`,

  'two-sum': `import sys

def main():
    lines = sys.stdin.read().strip().splitlines()
    if not lines:
        return
    nums = [int(x) for x in lines[0].split()]
    target = int(lines[1].strip())
    # Write your code here to find two indices that add up to target
    

if __name__ == '__main__':
    main()
`,

  'reverse-linked-list': `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    values = [int(x) for x in input_data]
    # Write your code here to reverse the list and print elements space-separated
    

if __name__ == '__main__':
    main()
`,

  'merge-two-sorted-lists': `import sys

def main():
    lines = sys.stdin.read().strip().splitlines()
    if not lines:
        return
    list1 = [int(x) for x in lines[0].split()] if len(lines) > 0 and lines[0].strip() else []
    list2 = [int(x) for x in lines[1].split()] if len(lines) > 1 and lines[1].strip() else []
    # Write your code here to merge the two sorted lists and print elements space-separated
    

if __name__ == '__main__':
    main()
`,

  'climbing-stairs': `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    # Write your code here to calculate distinct ways to climb n stairs
    

if __name__ == '__main__':
    main()
`,

  'maximum-subarray': `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    nums = [int(x) for x in input_data]
    # Write your code here to find maximum subarray sum and print the result
    

if __name__ == '__main__':
    main()
`,

  'valid-parentheses': `import sys

def main():
    s = sys.stdin.read().strip()
    # Write your code here to check valid parentheses and print "true" or "false"
    

if __name__ == '__main__':
    main()
`,

  'longest-common-subsequence': `import sys

def main():
    lines = sys.stdin.read().strip().splitlines()
    if not lines:
        return
    s1 = lines[0].strip()
    s2 = lines[1].strip() if len(lines) > 1 else ""
    # Write your code here to find length of longest common subsequence
    

if __name__ == '__main__':
    main()
`,

  'number-of-islands': `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    r = int(input_data[0])
    c = int(input_data[1])
    grid = []
    idx = 2
    for _ in range(r):
        grid.append(input_data[idx:idx+c])
        idx += c
    # Write your code here to count islands and print the result
    

if __name__ == '__main__':
    main()
`,

  'multiply-two-numbers': `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    a = int(input_data[0])
    b = int(input_data[1])
    # Write your code here to multiply a and b and print the product
    

if __name__ == '__main__':
    main()
`
};

// Validate all tags upfront
function validateTagCorrections() {
  for (const [slug, tags] of Object.entries(TAG_CORRECTIONS)) {
    for (const tag of tags) {
      if (!isValidTag(tag)) {
        throw new Error(`Invalid tag "${tag}" configured for slug "${slug}"`);
      }
    }
  }
}

async function migrateSeedProblems() {
  console.log(`=======================================================`);
  console.log(` Seed Problems Migration (Python3 startCode & Tag Fix)`);
  console.log(` Mode: ${isDryRun ? 'DRY RUN' : 'APPLY (Direct MongoDB Update)'}`);
  console.log(`=======================================================\n`);

  validateTagCorrections();

  if (!process.env.DB_CONNECT_STRING) {
    console.error('ERROR: DB_CONNECT_STRING is not set in environment.');
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_CONNECT_STRING);
  console.log('Connected to MongoDB Atlas.');

  const db = mongoose.connection.db;
  const problemsCol = db.collection('problems');

  const allProblems = await problemsCol.find({}).sort({ problemNumber: 1 }).toArray();
  console.log(`Loaded ${allProblems.length} problems from database.\n`);

  if (!isDryRun) {
    // Create pre-migration backup
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `problems_backup_pre_python3_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(allProblems, null, 2), 'utf-8');

    // Verify backup count
    const backupContent = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    if (backupContent.length !== allProblems.length) {
      throw new Error(`Backup verification failed: wrote ${backupContent.length} docs, expected ${allProblems.length}`);
    }
    console.log(`[BACKUP] Safely exported ${backupContent.length} problems to:\n  ${backupPath}\n`);
  }

  let pythonAddedCount = 0;
  let pythonExistingCount = 0;
  let tagsUpdatedCount = 0;
  let tagsUnchangedCount = 0;

  console.log('--- Processing Problems ---');
  for (const p of allProblems) {
    const slug = p.slug;
    const starterTemplate = PYTHON3_STARTERS[slug];
    if (!starterTemplate) {
      console.warn(`[WARN] No Python3 starter code template configured for slug "${slug}". Skipping Python3.`);
    }

    let modified = false;
    let newStartCode = Array.isArray(p.startCode) ? [...p.startCode] : [];
    let updatedTags = Array.isArray(p.tags) ? [...p.tags] : [];

    // 1. Check Python3 startCode
    const existingPyIdx = newStartCode.findIndex(
      (sc) => sc && sc.language && sc.language.toLowerCase() === 'python3'
    );

    let pyAction = 'none';
    if (existingPyIdx === -1) {
      if (starterTemplate) {
        newStartCode.push({
          language: 'Python3',
          initialCode: starterTemplate
        });
        modified = true;
        pyAction = 'added';
        pythonAddedCount++;
      }
    } else {
      pyAction = 'already present';
      pythonExistingCount++;
    }

    // 2. Check semantic tags correction
    let tagAction = 'unchanged';
    if (TAG_CORRECTIONS[slug]) {
      const targetTags = TAG_CORRECTIONS[slug];
      const currentTagsSorted = [...updatedTags].sort().join(',');
      const targetTagsSorted = [...targetTags].sort().join(',');

      if (currentTagsSorted !== targetTagsSorted) {
        updatedTags = targetTags;
        modified = true;
        tagAction = `updated (${JSON.stringify(p.tags)} -> ${JSON.stringify(targetTags)})`;
        tagsUpdatedCount++;
      } else {
        tagAction = `already correct (${JSON.stringify(updatedTags)})`;
        tagsUnchangedCount++;
      }
    } else {
      tagsUnchangedCount++;
    }

    console.log(
      `#${p.problemNumber || '?'} ${p.slug}: Python3 [${pyAction}], Tags: [${tagAction}]`
    );

    // 3. Apply DB update idempotently
    if (modified && !isDryRun) {
      await problemsCol.updateOne(
        { _id: p._id },
        {
          $set: {
            startCode: newStartCode,
            tags: updatedTags
          }
        }
      );
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total Problems Evaluated: ${allProblems.length}`);
  console.log(`Python3 startCode Added:   ${pythonAddedCount}`);
  console.log(`Python3 Already Present:   ${pythonExistingCount}`);
  console.log(`Tags Updated:              ${tagsUpdatedCount}`);
  console.log(`Tags Already Correct:      ${tagsUnchangedCount}`);

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB. Done!');
}

migrateSeedProblems().catch((err) => {
  console.error('\nFATAL Migration Error:', err);
  process.exit(1);
});
