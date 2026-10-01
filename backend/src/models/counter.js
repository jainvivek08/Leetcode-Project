const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model('counter', counterSchema);

/**
 * Atomically increments and returns the next sequence number for a given counter key.
 * @param {string} counterName - e.g. 'problemNumber'
 * @returns {Promise<number>}
 */
async function getNextSequence(counterName) {
  const counter = await Counter.findOneAndUpdate(
    { _id: counterName },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return counter.seq;
}

module.exports = {
  Counter,
  getNextSequence,
};
