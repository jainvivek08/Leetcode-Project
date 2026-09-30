const mongoose = require('mongoose');
const { EJSON } = require('bson');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dataDir = path.join(__dirname, '..', '..', 'DataPart', 'mongodb_compass_data');

async function seedCompassData() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.DB_CONNECT_STRING);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    const collections = ['users', 'problems', 'submissions', 'solutionvideos'];

    for (const colName of collections) {
      const filePath = path.join(dataDir, `${colName}.json`);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}, skipping...`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      if (!fileContent.trim()) {
        console.log(`Skipping empty file: ${colName}.json`);
        continue;
      }

      const parsed = JSON.parse(fileContent);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        console.log(`No records to import for: ${colName}`);
        continue;
      }

      // Deserialize EJSON to restore ObjectIds and Dates
      const docs = parsed.map(item => EJSON.deserialize(item, { relaxed: true }));

      console.log(`Importing ${docs.length} documents into '${colName}'...`);
      const collection = db.collection(colName);

      // Clean existing and insert fresh
      await collection.deleteMany({});
      await collection.insertMany(docs);
      console.log(`Successfully seeded ${docs.length} documents into '${colName}'!`);
    }

    console.log('\nAll MongoDB collections updated and seeded successfully!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedCompassData();
