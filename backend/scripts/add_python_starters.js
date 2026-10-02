const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const isApply = process.argv.includes('--apply');

function generatePython3Starter(problem) {
  const title = problem.title || 'Solution';
  // Try to derive function name from slug or title
  let funcName = 'solve';
  if (problem.slug) {
    funcName = problem.slug.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  }

  return {
    language: 'Python3',
    initialCode: `import sys

class Solution:
    def ${funcName}(self):
        """
        Problem: ${title}
        Write your solution here.
        """
        pass

if __name__ == '__main__':
    # Read standard input if needed
    input_data = sys.stdin.read().split()
    if input_data:
        sol = Solution()
        # Call solution
`
  };
}

async function run() {
  console.log(`=== Python3 Starter Code Migration (${isApply ? 'APPLY MODE' : 'DRY RUN'}) ===\n`);

  if (!process.env.DB_CONNECT_STRING) {
    console.error('ERROR: DB_CONNECT_STRING is not set in environment.');
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_CONNECT_STRING);
  const db = mongoose.connection.db;
  const problemsCol = db.collection('problems');

  const totalInDb = await problemsCol.countDocuments();
  const rawProblems = await problemsCol.find({}).sort({ problemNumber: 1, _id: 1 }).toArray();

  const toUpdate = [];

  for (const prob of rawProblems) {
    const startCode = Array.isArray(prob.startCode) ? prob.startCode : [];
    const hasPython = startCode.some(
      (sc) => sc && typeof sc.language === 'string' && (sc.language.toLowerCase() === 'python' || sc.language.toLowerCase() === 'python3')
    );

    if (!hasPython) {
      toUpdate.push({
        _id: prob._id,
        problemNumber: prob.problemNumber,
        title: prob.title,
        slug: prob.slug,
        existingLangs: startCode.map((s) => s.language),
        starterToAdd: generatePython3Starter(prob)
      });
    }
  }

  console.log(`Inspected ${totalInDb} problem(s).`);
  console.log(`Problems with Python3: ${totalInDb - toUpdate.length}`);
  console.log(`Problems missing Python3: ${toUpdate.length}\n`);

  if (toUpdate.length === 0) {
    console.log('✓ All problems already contain Python3 starter code. Nothing to update.');
    await mongoose.disconnect();
    return;
  }

  console.log('-----------------------------------------------------------------------------------------');
  console.log('No.    Slug / Title                                 Existing Languages       Action');
  console.log('-----------------------------------------------------------------------------------------');
  for (const item of toUpdate) {
    const num = item.problemNumber ? `#${item.problemNumber}` : 'N/A';
    const name = (item.slug || item.title || '').slice(0, 42);
    const langs = item.existingLangs.join(', ') || 'None';
    console.log(`${num.padEnd(6)} ${name.padEnd(44)} [${langs}] -> ADD Python3`);
  }
  console.log('-----------------------------------------------------------------------------------------\n');

  if (isApply) {
    // 1. Create backups directory in backend/backups/
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = Date.now();
    const backupPath = path.join(backupDir, `problem_starters_backup_${timestamp}.json`);

    console.log(`Creating safety backup at: ${backupPath}`);
    fs.writeFileSync(backupPath, JSON.stringify(rawProblems, null, 2), 'utf-8');

    // 2. Verify backup
    const backupContent = fs.readFileSync(backupPath, 'utf-8');
    const parsedBackup = JSON.parse(backupContent);
    if (parsedBackup.length !== totalInDb) {
      console.error(
        `FATAL: Backup verification failed! Collection has ${totalInDb} docs, but backup has ${parsedBackup.length} docs. Aborting.`
      );
      process.exit(1);
    }
    console.log(`✓ Backup verified successfully: ${parsedBackup.length} problems saved.\n`);

    // 3. Apply updates to MongoDB
    console.log(`Applying Python3 starters to ${toUpdate.length} problem(s)...`);
    for (const item of toUpdate) {
      await problemsCol.updateOne(
        { _id: item._id },
        { $push: { startCode: item.starterToAdd } }
      );
    }
    console.log(`✓ Successfully updated ${toUpdate.length} problem(s) with Python3 starter code.\n`);
    console.log('=== Migration Finished Successfully ===');
  } else {
    console.log(`[DRY RUN] ${toUpdate.length} problem(s) will be updated with Python3 starter templates.`);
    console.log('Run with `node backend/scripts/add_python_starters.js --apply` to execute.');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Python3 starter migration failed:', err);
  process.exit(1);
});
