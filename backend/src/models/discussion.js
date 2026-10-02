const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const discussionSchema = new Schema({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  codeSnippet: {
    type: String,
    default: '',
    maxlength: 20000,
  },
  language: {
    type: String,
    default: '',
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
  }],
  comments: [commentSchema],
}, {
  timestamps: true,
});

discussionSchema.index({ problemId: 1, createdAt: -1 });

const Discussion = mongoose.model('discussion', discussionSchema);

module.exports = Discussion;
