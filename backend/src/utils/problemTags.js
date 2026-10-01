/**
 * Canonical problem tags list (camelCase).
 * All tags used across CodeQuest must belong to this list.
 */
const CANONICAL_TAGS = [
  'array',
  'string',
  'hashTable',
  'linkedList',
  'stack',
  'queue',
  'tree',
  'graph',
  'dp',
  'greedy',
  'backtracking',
  'binarySearch',
  'twoPointers',
  'slidingWindow',
  'sorting',
  'recursion',
  'math',
  'bitManipulation',
  'heap',
  'trie',
];

const CANONICAL_TAGS_SET = new Set(CANONICAL_TAGS);

const isValidTag = (tag) => {
  return typeof tag === 'string' && CANONICAL_TAGS_SET.has(tag.trim());
};

module.exports = {
  CANONICAL_TAGS,
  CANONICAL_TAGS_SET,
  isValidTag,
};
