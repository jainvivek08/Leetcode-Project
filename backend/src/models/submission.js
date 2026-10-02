const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'c++', 'java', 'python3'],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong', 'tle', 'compile_error', 'runtime_error', 'error', 'judge_timeout', 'time_limit_exceeded'],
    default: 'pending'
  },
  runtime: {
    type: Number,  // milliseconds
    default: 0
  },
  memory: {
    type: Number,  // kB
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  testCasesTotal: {  
    type: Number,
    default: 0
  },
  failedTestCase: {
    type: new Schema({
      index: { type: Number },
      isHidden: { type: Boolean },
      input: { type: String, default: null },
      expectedOutput: { type: String, default: null },
      actualOutput: { type: String, default: null },
      status: { type: String },
    }, { _id: false }),
    default: undefined
  },
  runtimePercentile: {
    type: Number,
    default: null
  },
  memoryPercentile: {
    type: Number,
    default: null
  }
}, { 
  timestamps: true
});


submissionSchema.index({userId: 1, problemId: 1});
submissionSchema.index({problemId: 1, status: 1, runtime: 1});
submissionSchema.index({problemId: 1, status: 1, memory: 1});


const Submission = mongoose.model('submission',submissionSchema);

module.exports = Submission;