/**
 * Canonical problem tags in CodeQuest (in sync with backend).
 */
export const CANONICAL_TAGS = [
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

export const TAG_LABELS = {
  array: 'Array',
  string: 'String',
  hashTable: 'Hash Table',
  linkedList: 'Linked List',
  stack: 'Stack',
  queue: 'Queue',
  tree: 'Tree',
  graph: 'Graph',
  dp: 'Dynamic Programming',
  greedy: 'Greedy',
  backtracking: 'Backtracking',
  binarySearch: 'Binary Search',
  twoPointers: 'Two Pointers',
  slidingWindow: 'Sliding Window',
  sorting: 'Sorting',
  recursion: 'Recursion',
  math: 'Math',
  bitManipulation: 'Bit Manipulation',
  heap: 'Heap',
  trie: 'Trie',
};

/**
 * Returns the human-readable display label for a tag, falling back to the raw value.
 * @param {string} tag
 * @returns {string}
 */
export const tagLabel = (tag) => {
  if (!tag) return '';
  return TAG_LABELS[tag] || tag;
};

/**
 * Normalizes tags from any format (string | array | undefined | null) into a clean string array.
 * @param {string | string[] | undefined | null} tags
 * @returns {string[]}
 */
export const normalizeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags
      .map((t) => (typeof t === 'string' ? t.trim() : String(t)))
      .filter(Boolean);
  }
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
};
