const { app } = require('../src/index');
const main = require('../src/config/db');
const mongoose = require('mongoose');

let isConnected = false;

module.exports = async (req, res) => {
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

