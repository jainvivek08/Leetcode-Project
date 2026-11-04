const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.DB_CONNECT_STRING, { serverSelectionTimeoutMS: 5000 });
}

module.exports = main;


