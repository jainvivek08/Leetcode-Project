/**
 * Update Problem Constraints and Limits (Time/Memory) for Seed Problems
 * 
 * - Sets timeLimit to 2000 (ms)
 * - Sets memoryLimit to 256000 (KB)
 * - Sets standard Markdown constraints string for each problem
 * - Creates pre-update backup
 * - Idempotent
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CONSTRAINTS_MAP = {
  'addition-of-two-numbers': '-10^9 <= a, b <= 10^9',
  'check-even-or-odd': '-10^9 <= n <= 10^9',
  'factorial-of-a-number': '0 <= n <= 20',
  'nth-fibonacci-number': '0 <= n <= 30',
  'palindrome-check': '1 <= s.length <= 10^5\ns consists only of lowercase English letters.',
  'count-vowels': '1 <= s.length <= 10^5\ns consists only of English letters.',
  'reverse-a-string': '1 <= s.length <= 10^5\ns consists of printable ASCII characters.',
  'two-sum-target': '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
  'two-sum': '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
  'reverse-linked-list': 'The number of nodes in the list is in the range [0, 5000].\n-5000 <= Node.val <= 5000',
  'merge-two-sorted-lists': 'The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth lists are sorted in non-decreasing order.',
  'climbing-stairs': '1 <= n <= 45',
  'maximum-subarray': '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
  'valid-parentheses': "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
  'longest-common-subsequence': '1 <= text1.length, text2.length <= 1000\ntext1 and text2 consist of only lowercase English characters.',
  'number-of-islands': "m == grid.length\nn == grid[i].length\n1 <= m, n <= 300\ngrid[i][j] is '0' or '1'.",
  'multiply-two-numbers': '-10^9 <= a, b <= 10^9',
};

async function updateLimitsAndConstraints() {
  console.log('=== Updating Problem Constraints & Limits ===\n');

  if (!process.env.DB_CONNECT_STRING) {
    console.error('ERROR: DB_CONNECT_STRING is not set.');
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_CONNECT_STRING);
  const db = mongoose.connection.db;
  const problemsCol = db.collection('problems');

  const problems = await problemsCol.find({}).sort({ problemNumber: 1 }).toArray();
  console.log(`Found ${problems.length} problems.`);

  // Create backup
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `problems_backup_pre_limits_${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(problems, null, 2), 'utf-8');
  console.log(`Backup saved to ${backupPath}\n`);

  let updatedCount = 0;
  for (const p of problems) {
    const slug = p.slug;
    const targetConstraints = CONSTRAINTS_MAP[slug] || '';
    const targetTimeLimit = 2000;
    const targetMemoryLimit = 256000;

    await problemsCol.updateOne(
      { _id: p._id },
      {
        $set: {
          constraints: targetConstraints,
          timeLimit: targetTimeLimit,
          memoryLimit: targetMemoryLimit,
        },
      }
    );
    updatedCount++;
    console.log(`Updated #${p.problemNumber} ${slug}: timeLimit=${targetTimeLimit}ms, memoryLimit=${targetMemoryLimit}KB`);
  }

  console.log(`\nSuccessfully updated ${updatedCount} problems.`);
  await mongoose.disconnect();
}

updateLimitsAndConstraints().catch(console.error);
