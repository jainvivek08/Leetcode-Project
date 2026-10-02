const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Validates that tests run against an isolated test database distinct from production DB.
 */
function getTestMongoUri() {
  const testUri = process.env.MONGO_TEST_URI;
  const mainUri = process.env.DB_CONNECT_STRING;

  if (!testUri || !testUri.trim() || (mainUri && testUri.trim() === mainUri.trim())) {
    throw new Error("Tests must run against an isolated test database (MONGO_TEST_URI != DB_CONNECT_STRING)");
  }

  return testUri.trim();
}

/**
 * Connects mongoose to the isolated test database.
 */
async function connectTestDb() {
  const uri = getTestMongoUri();
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
  }
}

/**
 * Cleanly disconnects mongoose from the test database.
 */
async function disconnectTestDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  getTestMongoUri,
  connectTestDb,
  disconnectTestDb,
};
