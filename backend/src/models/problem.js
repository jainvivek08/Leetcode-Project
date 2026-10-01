const mongoose = require('mongoose');
const { Schema } = mongoose;
const { CANONICAL_TAGS, CANONICAL_TAGS_SET } = require('../utils/problemTags');

const problemSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  tags: {
    type: [String],
    required: true,
    validate: [
      {
        validator: function (val) {
          return Array.isArray(val) && val.length >= 1 && val.length <= 6;
        },
        message: 'A problem must have between 1 and 6 tags.',
      },
      {
        validator: function (val) {
          return (
            Array.isArray(val) &&
            val.every((t) => typeof t === 'string' && CANONICAL_TAGS_SET.has(t))
          );
        },
        message: function (props) {
          const invalidTags = (props.value || []).filter(
            (t) => !CANONICAL_TAGS_SET.has(t)
          );
          return `Invalid tag(s): ${invalidTags.join(', ')}. Valid tags: ${CANONICAL_TAGS.join(', ')}`;
        },
      },
    ],
  },
  problemNumber: {
    type: Number,
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true,
  },
  constraints: {
    type: [String],
    default: [],
    validate: [
      {
        validator: function (val) {
          return !val || (Array.isArray(val) && val.length <= 20);
        },
        message: 'Constraints list cannot exceed 20 items.',
      },
      {
        validator: function (val) {
          return (
            !val ||
            (Array.isArray(val) &&
              val.every((c) => typeof c === 'string' && c.length <= 300))
          );
        },
        message: 'Each constraint cannot exceed 300 characters.',
      },
    ],
  },
  timeLimit: {
    type: Number,
    default: 2,
    min: [1, 'Time limit must be at least 1 second.'],
    max: [10, 'Time limit cannot exceed 10 seconds.'],
  },
  memoryLimit: {
    type: Number,
    default: 256,
    min: [64, 'Memory limit must be at least 64 MB.'],
    max: [512, 'Memory limit cannot exceed 512 MB.'],
  },
  visibleTestCases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
      explanation: {
        type: String,
        required: true,
      },
    },
  ],
  hiddenTestCases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
    },
  ],
  startCode: [
    {
      language: {
        type: String,
        required: true,
      },
      initialCode: {
        type: String,
        required: true,
      },
    },
  ],
  referenceSolution: [
    {
      language: {
        type: String,
        required: true,
      },
      completeCode: {
        type: String,
        required: true,
      },
    },
  ],
  problemCreator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
});

problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ title: 1 });
problemSchema.index({ problemNumber: 1 }, { unique: true, sparse: true });
problemSchema.index({ slug: 1 }, { unique: true, sparse: true });

const Problem = mongoose.model('problem', problemSchema);

module.exports = Problem;
