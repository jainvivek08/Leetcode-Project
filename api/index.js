const { app } = require('../backend/src/index');
const main = require('../backend/src/config/db');

let mongoose;
try {
  mongoose = require('mongoose');
} catch {
  mongoose = require('../backend/node_modules/mongoose');
}

let isConnected = false;

module.exports = async (req, res) => {
  // Establish / reuse MongoDB connection across serverless invocations
  if (!isConnected || mongoose.connection.readyState !== 1) {
    try {
      if (process.env.DB_CONNECT_STRING) {
        await main();
        isConnected = true;
      }
    } catch (err) {
      console.error('MongoDB serverless connection error:', err.message);
    }
  }

  return app(req, res);
};
