const mongoose = require('mongoose');
const { EJSON } = require('bson');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const exportDir = path.join(__dirname, '..', '..', 'DataPart', 'mongodb_compass_data');

async function exportCompassData() {
  try {
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.DB_CONNECT_STRING);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;

    // Collections to export
    const collections = ['users', 'problems', 'submissions', 'solutionvideos'];

    for (const colName of collections) {
      console.log(`Exporting collection: ${colName}...`);
      const docs = await db.collection(colName).find({}).toArray();

      // Serialize using relaxed EJSON (standard MongoDB Compass format)
      const serialized = docs.map(doc => EJSON.serialize(doc, { relaxed: true }));
      const filePath = path.join(exportDir, `${colName}.json`);

      fs.writeFileSync(filePath, JSON.stringify(serialized, null, 2), 'utf-8');
      console.log(`Saved ${docs.length} documents to ${filePath}`);
    }

    console.log('\nAll MongoDB Compass files exported successfully!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Export error:', err);
    process.exit(1);
  }
}

exportCompassData();
