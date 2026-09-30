import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import {
  Compass,
  CheckCircle2,
  Clock,
  Circle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  Flame,
  Zap,
  Code2,
  TrendingUp,
  X,
  Copy,
  Check,
  CheckCheck,
  Target,
  Award,
  Filter,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import axiosClient from '../utils/axiosClient';

/**
 * Curated Roadmap Tracks Data
 * 4 Structured Learning Tracks with at least 4 Milestones and 3-4 Realistic DSA Problems each.
 */
const ROADMAP_TRACKS = [
  {
    id: 'beginner',
    title: 'Beginner DSA Track',
    badge: 'Step 0 - 1',
    icon: Zap,
    color: 'blue',
    summary: 'Basics, Math, Arrays, Strings',
    description:
      'Establish a rock-solid programming intuition. Master linear array memory layouts, modulo arithmetic, and time-space analysis.',
    milestones: [
      {
        id: 'b-m1',
        stepNumber: 'Step 01',
        title: 'Math & Bitwise Foundations',
        description: 'Modulo arithmetic, bit parity, divisors, and time complexity fundamentals.',
        guide: {
          title: 'Math & Bitwise Foundations Guide',
          complexity: 'Time: O(1) • Space: O(1)',
          pattern:
            'Use bitwise AND (n & 1) or modulo (n % 2) for parity checks. For digit reversal, extract last digit with (n % 10) and truncate with Math.floor(n / 10).',
          codeSnippet: `// Efficient Parity Check & Digit Reversal
const isEven = (n) => (n & 1) === 0;

let rev = 0;
while (n > 0) {
  rev = rev * 10 + (n % 10);
  n = Math.floor(n / 10);
}`,
        },
        problems: [
          {
            id: '6915634fd64afde0c9380820',
            title: 'Check Even or Odd',
            difficulty: 'Easy',
            topic: 'Math',
            linkId: '6915634fd64afde0c9380820',
          },
          {
            id: 'b-p1',
            title: 'Palindrome Number',
            difficulty: 'Easy',
            topic: 'Math',
            linkId: 'default-1614',
          },
          {
            id: 'b-p2',
            title: 'Fizz Buzz Simulation',
            difficulty: 'Easy',
            topic: 'Simulation',
            linkId: 'default-1614',
          },
          {
            id: 'b-p3',
            title: 'Count Primes (Sieve of Eratosthenes)',
            difficulty: 'Medium',
            topic: 'Math',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'b-m2',
        stepNumber: 'Step 02',
        title: 'Linear Arrays & In-Place Manipulations',
        description: 'Array memory layouts, prefix running sums, and two-pointer boundary swapping.',
        guide: {
          title: 'Two-Pointer & In-Place Swapping Guide',
          complexity: 'Time: O(N) • Space: O(1)',
          pattern:
            'Maintain a slow pointer for the insert boundary and a fast pointer for scanning. When non-zero elements are found, swap or assign and increment slow.',
          codeSnippet: `// Move Zeroes In-Place
let slow = 0;
for (let fast = 0; fast < nums.length; fast++) {
  if (nums[fast] !== 0) {
    [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
    slow++;
  }
}`,
        },
        problems: [
          {
            id: 'b-p4',
            title: 'Running Sum of 1d Array',
            difficulty: 'Easy',
            topic: 'Prefix Sum',
            linkId: 'default-1614',
          },
          {
            id: 'b-p5',
            title: 'Contains Duplicate',
            difficulty: 'Easy',
            topic: 'Hash Set',
            linkId: 'default-1614',
          },
          {
            id: 'b-p6',
            title: 'Move Zeroes',
            difficulty: 'Easy',
            topic: 'Two Pointers',
            linkId: 'default-1614',
          },
          {
            id: 'b-p7',
            title: 'Squares of a Sorted Array',
            difficulty: 'Easy',
            topic: 'Two Pointers',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'b-m3',
        stepNumber: 'Step 03',
        title: 'Strings & Frequency Counting',
        description: 'ASCII frequency maps, character arrays, and symmetric string scanning.',
        guide: {
          title: 'Fixed Array Frequency Counter Guide',
          complexity: 'Time: O(N) • Space: O(1) (26 letters)',
          pattern:
            'Instead of heavy hash maps for lowercase English strings, allocate an integer array of size 26 indexed by charCodeAt(i) - 97.',
          codeSnippet: `// Character Frequency Array Pattern
const count = new Array(26).fill(0);
for (const char of str) {
  count[char.charCodeAt(0) - 97]++;
}`,
        },
        problems: [
          {
            id: 'b-p8',
            title: 'Valid Anagram',
            difficulty: 'Easy',
            topic: 'String',
            linkId: 'default-1614',
          },
          {
            id: 'b-p9',
            title: 'Valid Palindrome',
            difficulty: 'Easy',
            topic: 'Two Pointers',
            linkId: 'default-1614',
          },
          {
            id: 'b-p10',
            title: 'Longest Common Prefix',
            difficulty: 'Easy',
            topic: 'String',
            linkId: 'default-1614',
          },
          {
            id: 'b-p11',
            title: 'Reverse Vowels of a String',
            difficulty: 'Easy',
            topic: 'Two Pointers',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'b-m4',
        stepNumber: 'Step 04',
        title: 'Sorting & Binary Search Intro',
        description: 'Comparison sorts, custom comparators, and logarithmic boundary search.',
        guide: {
          title: 'Binary Search Boundary Guide',
          complexity: 'Time: O(log N) • Space: O(1)',
          pattern:
            'Always calculate mid with low + Math.floor((high - low) / 2) to prevent integer overflow in large datasets.',
          codeSnippet: `// Binary Search Standard Invariant
let low = 0, high = nums.length - 1;
while (low <= high) {
  const mid = low + Math.floor((high - low) / 2);
  if (nums[mid] === target) return mid;
  if (nums[mid] < target) low = mid + 1;
  else high = mid - 1;
}
return -1;`,
        },
        problems: [
          {
            id: 'b-p12',
            title: 'Binary Search (704)',
            difficulty: 'Easy',
            topic: 'Binary Search',
            linkId: 'default-1614',
          },
          {
            id: 'b-p13',
            title: 'Search Insert Position',
            difficulty: 'Easy',
            topic: 'Binary Search',
            linkId: 'default-1614',
          },
          {
            id: 'b-p14',
            title: 'Merge Sorted Array',
            difficulty: 'Easy',
            topic: 'Two Pointers',
            linkId: 'default-1614',
          },
          {
            id: 'b-p15',
            title: 'First Bad Version',
            difficulty: 'Easy',
            topic: 'Binary Search',
            linkId: 'default-1614',
          },
        ],
      },
    ],
  },
  {
    id: 'core',
    title: 'Core DSA & Trees',
    badge: 'Step 2 - 3',
    icon: Layers,
    color: 'emerald',
    summary: 'Linked List, Stacks, Queues, Binary Trees',
    description:
      'Master dynamic pointer structures, recursive stack frames, monotonic evaluations, and hierarchical tree traversals.',
    milestones: [
      {
        id: 'c-m1',
        stepNumber: 'Step 01',
        title: 'Singly & Doubly Linked Lists',
        description: 'Sentinel dummy nodes, pointer reversals, and Floyd’s cycle detection algorithm.',
        guide: {
          title: 'Fast & Slow Pointer (Floyd’s Cycle)',
          complexity: 'Time: O(N) • Space: O(1)',
          pattern:
            'Initialize slow at head, fast at head. Advance slow by 1 step and fast by 2 steps. If slow === fast, a cycle exists.',
          codeSnippet: `// Floyd's Cycle Detection
let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow === fast) return true;
}
return false;`,
        },
        problems: [
          {
            id: 'c-p1',
            title: 'Reverse Linked List',
            difficulty: 'Easy',
            topic: 'Linked List',
            linkId: 'default-1614',
          },
          {
            id: 'c-p2',
            title: 'Merge Two Sorted Lists',
            difficulty: 'Easy',
            topic: 'Linked List',
            linkId: 'default-1614',
          },
          {
            id: 'c-p3',
            title: 'Linked List Cycle Detection',
            difficulty: 'Easy',
            topic: 'Two Pointers',
            linkId: 'default-1614',
          },
          {
            id: 'c-p4',
            title: 'Remove Nth Node From End of List',
            difficulty: 'Medium',
            topic: 'Linked List',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'c-m2',
        stepNumber: 'Step 02',
        title: 'Stacks & Monotonic Sequences',
        description: 'LIFO evaluation, parentheses nesting depth, and next greater element patterns.',
        guide: {
          title: 'Monotonic Stack Pattern',
          complexity: 'Time: O(N) • Space: O(N)',
          pattern:
            'Push indices onto a stack. When current element exceeds stack top value, pop top and record the distance/next greater value.',
          codeSnippet: `// Monotonic Stack for Next Greater Element
const stack = []; // stores indices
const res = new Array(nums.length).fill(-1);
for (let i = 0; i < nums.length; i++) {
  while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
    const prevIdx = stack.pop();
    res[prevIdx] = nums[i];
  }
  stack.push(i);
}`,
        },
        problems: [
          {
            id: 'default-1614',
            title: '1614. Maximum Nesting Depth of the Parentheses',
            difficulty: 'Easy',
            topic: 'Stack',
            linkId: 'default-1614',
          },
          {
            id: 'c-p5',
            title: 'Valid Parentheses',
            difficulty: 'Easy',
            topic: 'Stack',
            linkId: 'default-1614',
          },
          {
            id: 'c-p6',
            title: 'Min Stack Design',
            difficulty: 'Medium',
            topic: 'Stack Design',
            linkId: 'default-1614',
          },
          {
            id: 'c-p7',
            title: 'Daily Temperatures',
            difficulty: 'Medium',
            topic: 'Monotonic Stack',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'c-m3',
        stepNumber: 'Step 03',
        title: 'Queues & Sliding Window Deques',
        description: 'FIFO buffers, circular queues, and monotonic double-ended queue sliding windows.',
        guide: {
          title: 'Monotonic Deque Window Pattern',
          complexity: 'Time: O(N) • Space: O(K)',
          pattern:
            'Maintain elements in decreasing order in the deque. Remove indices outside window from front, and elements smaller than incoming num from back.',
          codeSnippet: `// Monotonic Deque Maximum Window
const deque = []; // stores indices
for (let i = 0; i < nums.length; i++) {
  while (deque.length && deque[0] < i - k + 1) deque.shift();
  while (deque.length && nums[deque[deque.length - 1]] < nums[i]) deque.pop();
  deque.push(i);
}`,
        },
        problems: [
          {
            id: 'c-p8',
            title: 'Implement Queue using Stacks',
            difficulty: 'Easy',
            topic: 'Queue',
            linkId: 'default-1614',
          },
          {
            id: 'c-p9',
            title: 'Design Circular Queue',
            difficulty: 'Medium',
            topic: 'Design',
            linkId: 'default-1614',
          },
          {
            id: 'c-p10',
            title: 'Sliding Window Maximum',
            difficulty: 'Hard',
            topic: 'Monotonic Deque',
            linkId: 'default-1614',
          },
          {
            id: 'c-p11',
            title: 'Moving Average from Data Stream',
            difficulty: 'Easy',
            topic: 'Queue',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'c-m4',
        stepNumber: 'Step 04',
        title: 'Binary Trees & Tree Traversals',
        description: 'Subtree divide & conquer, BFS level-order snapshots, and BST validations.',
        guide: {
          title: 'Queue-Based BFS Level Order Traversal',
          complexity: 'Time: O(N) • Space: O(N)',
          pattern:
            'Use a FIFO queue. Record queue.length at the start of each level loop to process all nodes of that depth in one batch.',
          codeSnippet: `// BFS Level-Order Traversal
if (!root) return [];
const queue = [root], levels = [];
while (queue.length) {
  const levelSize = queue.length, currentLevel = [];
  for (let i = 0; i < levelSize; i++) {
    const node = queue.shift();
    currentLevel.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  levels.push(currentLevel);
}`,
        },
        problems: [
          {
            id: 'c-p12',
            title: 'Invert Binary Tree',
            difficulty: 'Easy',
            topic: 'Binary Tree',
            linkId: 'default-1614',
          },
          {
            id: 'c-p13',
            title: 'Maximum Depth of Binary Tree',
            difficulty: 'Easy',
            topic: 'DFS',
            linkId: 'default-1614',
          },
          {
            id: 'c-p14',
            title: 'Binary Tree Level Order Traversal',
            difficulty: 'Medium',
            topic: 'BFS',
            linkId: 'default-1614',
          },
          {
            id: 'c-p15',
            title: 'Validate Binary Search Tree',
            difficulty: 'Medium',
            topic: 'BST',
            linkId: 'default-1614',
          },
        ],
      },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Algorithms',
    badge: 'Step 4 - 5',
    icon: Sparkles,
    color: 'purple',
    summary: 'Graphs, Dynamic Programming, Backtracking',
    description:
      'Tackle complex multi-step optimizations, cycle-free topological graphs, memoized recursions, and search space pruning.',
    milestones: [
      {
        id: 'a-m1',
        stepNumber: 'Step 01',
        title: 'Graph Traversals & Connectivity',
        description: 'Grid flood fills, multi-source BFS shortest path, and topological dependency sorts.',
        guide: {
          title: 'Connected Components via Grid DFS',
          complexity: 'Time: O(R * C) • Space: O(R * C)',
          pattern:
            'When finding a land cell ("1"), recursively mark its 4 neighbors as water ("0") in-place to avoid re-visiting.',
          codeSnippet: `// Grid DFS Sink Island Pattern
function dfs(r, c) {
  if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
  grid[r][c] = '0'; // sink visited
  dfs(r + 1, c); dfs(r - 1, c);
  dfs(r, c + 1); dfs(r - 1, c);
}`,
        },
        problems: [
          {
            id: 'a-p1',
            title: 'Number of Islands',
            difficulty: 'Medium',
            topic: 'Graph DFS',
            linkId: 'default-1614',
          },
          {
            id: 'a-p2',
            title: 'Clone Graph',
            difficulty: 'Medium',
            topic: 'Graph BFS',
            linkId: 'default-1614',
          },
          {
            id: 'a-p3',
            title: 'Rotting Oranges (Multi-source BFS)',
            difficulty: 'Medium',
            topic: 'Graph BFS',
            linkId: 'default-1614',
          },
          {
            id: 'a-p4',
            title: 'Course Schedule (Kahn’s Algorithm)',
            difficulty: 'Medium',
            topic: 'Topological Sort',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'a-m2',
        stepNumber: 'Step 02',
        title: 'Dynamic Programming (1D & 2D)',
        description: 'Overlapping subproblems, state transitions, and tabular space optimization.',
        guide: {
          title: 'Unbounded Knapsack / Coin Change',
          complexity: 'Time: O(amount * coins) • Space: O(amount)',
          pattern:
            'Initialize dp array of size amount + 1 with Infinity. Base case dp[0] = 0. For each coin, update dp[i] = min(dp[i], dp[i - coin] + 1).',
          codeSnippet: `// Coin Change 1D DP
const dp = new Array(amount + 1).fill(Infinity);
dp[0] = 0;
for (let i = 1; i <= amount; i++) {
  for (const coin of coins) {
    if (i - coin >= 0) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
}
return dp[amount] === Infinity ? -1 : dp[amount];`,
        },
        problems: [
          {
            id: 'a-p5',
            title: 'Climbing Stairs',
            difficulty: 'Easy',
            topic: '1D DP',
            linkId: 'default-1614',
          },
          {
            id: 'a-p6',
            title: 'Coin Change',
            difficulty: 'Medium',
            topic: '1D DP',
            linkId: 'default-1614',
          },
          {
            id: 'a-p7',
            title: 'Longest Increasing Subsequence',
            difficulty: 'Medium',
            topic: 'Binary Search DP',
            linkId: 'default-1614',
          },
          {
            id: 'a-p8',
            title: 'Unique Paths in Grid',
            difficulty: 'Medium',
            topic: '2D DP',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'a-m3',
        stepNumber: 'Step 03',
        title: 'Backtracking & Pruning Trees',
        description: 'Combinations, permutations, subsets, and dead-end state recovery.',
        guide: {
          title: 'Take / Skip Decision Tree Pattern',
          complexity: 'Time: O(2^N) • Space: O(N) Call Stack',
          pattern:
            'Push candidate element, recurse into next index, then pop element back (backtrack step) to explore the alternative branch.',
          codeSnippet: `// Subsets Backtracking
function backtrack(start, current) {
  result.push([...current]);
  for (let i = start; i < nums.length; i++) {
    current.push(nums[i]);
    backtrack(i + 1, current);
    current.pop(); // backtrack
  }
}`,
        },
        problems: [
          {
            id: 'a-p9',
            title: 'Subsets',
            difficulty: 'Medium',
            topic: 'Backtracking',
            linkId: 'default-1614',
          },
          {
            id: 'a-p10',
            title: 'Permutations',
            difficulty: 'Medium',
            topic: 'Backtracking',
            linkId: 'default-1614',
          },
          {
            id: 'a-p11',
            title: 'Combination Sum',
            difficulty: 'Medium',
            topic: 'Backtracking',
            linkId: 'default-1614',
          },
          {
            id: 'a-p12',
            title: 'Word Search in Grid',
            difficulty: 'Medium',
            topic: 'Backtracking',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'a-m4',
        stepNumber: 'Step 04',
        title: 'Greedy & Interval Scheduling',
        description: 'Activity selection, sorting intervals by endpoints, and jump game greedy reaches.',
        guide: {
          title: 'Interval Merging Technique',
          complexity: 'Time: O(N log N) • Space: O(N)',
          pattern:
            'Sort intervals by start time. Iterate: if current interval overlaps with previous interval in result, merge by taking max end time.',
          codeSnippet: `// Merge Intervals Pattern
intervals.sort((a, b) => a[0] - b[0]);
const merged = [intervals[0]];
for (let i = 1; i < intervals.length; i++) {
  const last = merged[merged.length - 1];
  if (intervals[i][0] <= last[1]) {
    last[1] = Math.max(last[1], intervals[i][1]);
  } else {
    merged.push(intervals[i]);
  }
}`,
        },
        problems: [
          {
            id: 'a-p13',
            title: 'Jump Game',
            difficulty: 'Medium',
            topic: 'Greedy',
            linkId: 'default-1614',
          },
          {
            id: 'a-p14',
            title: 'Merge Intervals',
            difficulty: 'Medium',
            topic: 'Intervals',
            linkId: 'default-1614',
          },
          {
            id: 'a-p15',
            title: 'Non-overlapping Intervals',
            difficulty: 'Medium',
            topic: 'Greedy',
            linkId: 'default-1614',
          },
          {
            id: 'a-p16',
            title: 'Gas Station Circuit',
            difficulty: 'Medium',
            topic: 'Greedy',
            linkId: 'default-1614',
          },
        ],
      },
    ],
  },
  {
    id: 'interview150',
    title: 'Top 150 Interview Essentials',
    badge: 'Tier-1 Prep',
    icon: Flame,
    color: 'amber',
    summary: 'The Most Frequently Asked FAANG & Tier-1 Problems',
    description:
      'High-yield patterns rigorously curated to prepare you for Google, Amazon, Microsoft, and top tech interviews.',
    milestones: [
      {
        id: 'i-m1',
        stepNumber: 'Step 01',
        title: 'Arrays & Hashing',
        description: 'Master element lookups, frequency counting, and two-sum hash map patterns.',
        guide: {
          title: 'One-Pass Hash Map Complement',
          complexity: 'Time: O(N) • Space: O(N)',
          pattern:
            'For each number, check if target - num exists in our map. If yes, return their indices; otherwise record num -> index.',
          codeSnippet: `// Two Sum One-Pass Hash Map
const map = new Map();
for (let i = 0; i < nums.length; i++) {
  const diff = target - nums[i];
  if (map.has(diff)) return [map.get(diff), i];
  map.set(nums[i], i);
}`,
        },
        problems: [
          {
            id: 'i-p1',
            title: 'Two Sum',
            difficulty: 'Easy',
            topic: 'Hash Map',
            linkId: 'default-1614',
          },
          {
            id: 'i-p2',
            title: 'Valid Anagram',
            difficulty: 'Easy',
            topic: 'Hash Map',
            linkId: 'default-1614',
          },
          {
            id: 'i-p3',
            title: 'Group Anagrams',
            difficulty: 'Medium',
            topic: 'Hash Map',
            linkId: 'default-1614',
          },
          {
            id: 'i-p4',
            title: 'Top K Frequent Elements',
            difficulty: 'Medium',
            topic: 'Bucket Sort / Heap',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'i-m2',
        stepNumber: 'Step 02',
        title: 'Two Pointers & Array Convergence',
        description: 'Boundary closing techniques, sorted array sweeping, and water trapping invariants.',
        guide: {
          title: '3Sum Sort & Two-Pointer Invariant',
          complexity: 'Time: O(N^2) • Space: O(1)',
          pattern:
            'Sort array first. Fix element i, then run left = i + 1, right = n - 1 inward. Skip duplicate values of i, left, and right to prevent duplicate triplets.',
          codeSnippet: `// 3Sum Converging Pointers
nums.sort((a, b) => a - b);
for (let i = 0; i < nums.length - 2; i++) {
  if (i > 0 && nums[i] === nums[i - 1]) continue;
  let left = i + 1, right = nums.length - 1;
  while (left < right) {
    const sum = nums[i] + nums[left] + nums[right];
    if (sum === 0) {
      res.push([nums[i], nums[left], nums[right]]);
      while (nums[left] === nums[left + 1]) left++;
      while (nums[right] === nums[right - 1]) right--;
      left++; right--;
    } else if (sum < 0) left++;
    else right--;
  }
}`,
        },
        problems: [
          {
            id: 'i-p5',
            title: 'Valid Palindrome',
            difficulty: 'Easy',
            topic: 'Two Pointers',
            linkId: 'default-1614',
          },
          {
            id: 'i-p6',
            title: '3Sum Triplet Zero',
            difficulty: 'Medium',
            topic: 'Two Pointers',
            linkId: 'default-1614',
          },
          {
            id: 'i-p7',
            title: 'Container With Most Water',
            difficulty: 'Medium',
            topic: 'Two Pointers',
            linkId: 'default-1614',
          },
          {
            id: 'i-p8',
            title: 'Trapping Rain Water',
            difficulty: 'Hard',
            topic: 'Two Pointers',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'i-m3',
        stepNumber: 'Step 03',
        title: 'Sliding Window Constraints',
        description: 'Dynamic expandable/shrinkable windows and frequency count constraints.',
        guide: {
          title: 'Dynamic Sliding Window Invariant',
          complexity: 'Time: O(N) • Space: O(K)',
          pattern:
            'Expand window rightward by adding nums[right] to state. While condition is violated, shrink window from left and update optimal answer.',
          codeSnippet: `// Longest Substring Without Repeating Characters
const map = new Map();
let left = 0, maxLen = 0;
for (let right = 0; right < s.length; right++) {
  if (map.has(s[right])) {
    left = Math.max(left, map.get(s[right]) + 1);
  }
  map.set(s[right], right);
  maxLen = Math.max(maxLen, right - left + 1);
}`,
        },
        problems: [
          {
            id: 'i-p9',
            title: 'Best Time to Buy and Sell Stock',
            difficulty: 'Easy',
            topic: 'Sliding Window',
            linkId: 'default-1614',
          },
          {
            id: 'i-p10',
            title: 'Longest Substring Without Repeating Characters',
            difficulty: 'Medium',
            topic: 'Sliding Window',
            linkId: 'default-1614',
          },
          {
            id: 'i-p11',
            title: 'Minimum Size Subarray Sum',
            difficulty: 'Medium',
            topic: 'Sliding Window',
            linkId: 'default-1614',
          },
          {
            id: 'i-p12',
            title: 'Minimum Window Substring',
            difficulty: 'Hard',
            topic: 'Sliding Window',
            linkId: 'default-1614',
          },
        ],
      },
      {
        id: 'i-m4',
        stepNumber: 'Step 04',
        title: 'Binary Search on Values & Ranges',
        description: 'Rotated sorted arrays, boundary condition invariants, and monotonic answer space.',
        guide: {
          title: 'Rotated Array Sorted Half Search',
          complexity: 'Time: O(log N) • Space: O(1)',
          pattern:
            'At least one half of a rotated sorted array is always sorted. Determine whether left half or right half is sorted, then check if target lies within that sorted range.',
          codeSnippet: `// Search in Rotated Sorted Array
let low = 0, high = nums.length - 1;
while (low <= high) {
  const mid = Math.floor(low + (high - low) / 2);
  if (nums[mid] === target) return mid;
  if (nums[low] <= nums[mid]) { // Left half sorted
    if (nums[low] <= target && target < nums[mid]) high = mid - 1;
    else low = mid + 1;
  } else { // Right half sorted
    if (nums[mid] < target && target <= nums[high]) low = mid + 1;
    else high = mid - 1;
  }
}
return -1;`,
        },
        problems: [
          {
            id: 'i-p13',
            title: 'Binary Search',
            difficulty: 'Easy',
            topic: 'Binary Search',
            linkId: 'default-1614',
          },
          {
            id: 'i-p14',
            title: 'Search in Rotated Sorted Array',
            difficulty: 'Medium',
            topic: 'Binary Search',
            linkId: 'default-1614',
          },
          {
            id: 'i-p15',
            title: 'Find Minimum in Rotated Sorted Array',
            difficulty: 'Medium',
            topic: 'Binary Search',
            linkId: 'default-1614',
          },
          {
            id: 'i-p16',
            title: 'Median of Two Sorted Arrays',
            difficulty: 'Hard',
            topic: 'Binary Search',
            linkId: 'default-1614',
          },
        ],
      },
    ],
  },
];

/**
 * RoadmapsPage Component
 * Comprehensive, structured learning paths with connected step timeline,
 * 3-state interactive problem checklist, and modal DSA cheat sheets.
 */
function RoadmapsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});

  // 1. Active Track State
  const [activeTrackId, setActiveTrackId] = useState('beginner');

  // 2. Expanded Accordion Milestones State (All expanded by default for smooth browsing)
  const [expandedMilestones, setExpandedMilestones] = useState({
    'b-m1': true,
    'b-m2': true,
    'b-m3': true,
    'b-m4': true,
    'c-m1': true,
    'c-m2': true,
    'c-m3': true,
    'c-m4': true,
    'a-m1': true,
    'a-m2': true,
    'a-m3': true,
    'a-m4': true,
    'i-m1': true,
    'i-m2': true,
    'i-m3': true,
    'i-m4': true,
  });

  // 3. User Progress: Map of problemId -> 'solved' | 'in_progress' | 'unsolved'
  const [userProgress, setUserProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('codequest_user_roadmap_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    // Seed initial progress for instant visual satisfaction
    return {
      '6915634fd64afde0c9380820': 'solved',
      'b-p1': 'solved',
      'b-p4': 'solved',
      'b-p5': 'in_progress',
      'default-1614': 'solved',
      'c-p1': 'solved',
      'c-p5': 'in_progress',
      'i-p1': 'solved',
      'i-p2': 'solved',
      'i-p6': 'in_progress',
    };
  });

  // Sync real solved problems from backend if logged in
  useEffect(() => {
    let isMounted = true;
    const fetchUserSolved = async () => {
      try {
        const { data: solvedProbs } = await axiosClient.get('/problem/problemSolvedByUser');
        if (isMounted && Array.isArray(solvedProbs)) {
          setUserProgress((prev) => {
            const next = { ...prev };
            solvedProbs.forEach((p) => {
              if (p._id) next[p._id] = 'solved';
            });
            return next;
          });
        }
      } catch {
        // Fallback to local progress
      }
    };
    if (user) fetchUserSolved();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Persist progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('codequest_user_roadmap_progress', JSON.stringify(userProgress));
    } catch {
      // Storage error fallback
    }
  }, [userProgress]);

  // 3-State Cycle Status Toggle: unsolved -> in_progress -> solved -> unsolved
  const cycleProblemStatus = (probId, e) => {
    if (e) e.stopPropagation();
    setUserProgress((prev) => {
      const current = prev[probId] || 'unsolved';
      let nextStatus = 'in_progress';
      if (current === 'unsolved') nextStatus = 'in_progress';
      else if (current === 'in_progress') nextStatus = 'solved';
      else nextStatus = 'unsolved';

      return {
        ...prev,
        [probId]: nextStatus,
      };
    });
  };

  // 4. Cheat Sheet / Guide Modal State
  const [activeGuide, setActiveGuide] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopySnippet = (snippet) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Currently selected track object
  const currentTrack = useMemo(() => {
    return ROADMAP_TRACKS.find((t) => t.id === activeTrackId) || ROADMAP_TRACKS[0];
  }, [activeTrackId]);

  // Track & Global Progress calculations
  const trackStats = useMemo(() => {
    let totalQuestions = 0;
    let solvedQuestions = 0;
    let inProgressQuestions = 0;

    currentTrack.milestones.forEach((m) => {
      m.problems.forEach((p) => {
        totalQuestions++;
        const status = userProgress[p.id] || userProgress[p.linkId] || 'unsolved';
        if (status === 'solved') {
          solvedQuestions++;
        } else if (status === 'in_progress') {
          inProgressQuestions++;
        }
      });
    });

    const percent =
      totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;

    return { totalQuestions, solvedQuestions, inProgressQuestions, percent };
  }, [currentTrack, userProgress]);

  // Global statistics across all 4 tracks
  const globalStats = useMemo(() => {
    let totalAllQuestions = 0;
    let totalAllSolved = 0;

    ROADMAP_TRACKS.forEach((track) => {
      track.milestones.forEach((m) => {
        m.problems.forEach((p) => {
          totalAllQuestions++;
          const status = userProgress[p.id] || userProgress[p.linkId] || 'unsolved';
          if (status === 'solved') {
            totalAllSolved++;
          }
        });
      });
    });

    const overallPercent =
      totalAllQuestions > 0 ? Math.round((totalAllSolved / totalAllQuestions) * 100) : 0;

    return { totalAllQuestions, totalAllSolved, overallPercent };
  }, [userProgress]);

  // Toggle individual milestone accordion
  const toggleMilestone = (milestoneId) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [milestoneId]: !prev[milestoneId],
    }));
  };

  // Expand / Collapse all milestones in current track
  const toggleAllMilestones = (expand) => {
    const next = { ...expandedMilestones };
    currentTrack.milestones.forEach((m) => {
      next[m.id] = expand;
    });
    setExpandedMilestones(next);
  };

  // Difficulty badge styler
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className="min-h-screen bg-[#fbfcff] antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      {/* 1. TOP GLOBAL NAVBAR */}
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ============================================================ */}
        {/* 1. HEADER SECTION                                            */}
        {/* ============================================================ */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold tracking-wide shadow-2xs">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>STRUCTURED LEARNING PATHS</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            DSA &amp; Problem Solving{' '}
            <span className="text-[#2563eb] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Roadmaps
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Step-by-step guided paths designed to take you from fundamentals to advanced algorithmic mastery. Complete curated milestones with interactive checklists, pattern cheat sheets, and hands-on coding practice.
          </p>
        </div>

        {/* ============================================================ */}
        {/* 2. OVERALL STATS BANNER                                      */}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Left summary metrics */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/80">
                    4 Tracks Available
                  </span>
                  <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/80">
                    Curated Curricula
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Overall Completed: {globalStats.totalAllSolved} / {globalStats.totalAllQuestions} Questions ({globalStats.overallPercent}%)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {currentTrack.title}: {trackStats.solvedQuestions} of {trackStats.totalQuestions} solved ({trackStats.percent}%)
                </p>
              </div>
            </div>

            {/* Right progress indicator for active track */}
            <div className="w-full md:w-72 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>{currentTrack.title} Progress</span>
                <span className="text-blue-600 font-mono">{trackStats.percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${trackStats.percent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Filter Tabs to Switch Tracks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
            {ROADMAP_TRACKS.map((track) => {
              const TrackIcon = track.icon;
              const isActive = track.id === activeTrackId;

              // Calculate track-specific completed percentage
              let trackTotal = 0;
              let trackSolved = 0;
              track.milestones.forEach((m) => {
                m.problems.forEach((p) => {
                  trackTotal++;
                  const s = userProgress[p.id] || userProgress[p.linkId] || 'unsolved';
                  if (s === 'solved') trackSolved++;
                });
              });
              const trackPercent = trackTotal > 0 ? Math.round((trackSolved / trackTotal) * 100) : 0;

              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setActiveTrackId(track.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-blue-50/80 border-blue-500/80 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {track.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {trackSolved}/{trackTotal}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <TrackIcon
                      className={`w-4 h-4 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <h4
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isActive ? 'text-blue-900' : 'text-slate-800'
                      }`}
                    >
                      {track.title}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {track.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. ROADMAP TIMELINE & MILESTONES                             */}
        {/* ============================================================ */}
        <div className="space-y-6">
          {/* Track Header & Expand/Collapse Control */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
                  {currentTrack.badge} Pathway
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentTrack.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {currentTrack.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toggleAllMilestones(true)}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={() => toggleAllMilestones(false)}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Timeline Milestones Track */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
            {currentTrack.milestones.map((milestone, mIdx) => {
              const isExpanded = !!expandedMilestones[milestone.id];

              // Calculate milestone completion
              const totalMilestoneProbs = milestone.problems.length;
              const solvedMilestoneProbs = milestone.problems.filter(
                (p) => (userProgress[p.id] || userProgress[p.linkId]) === 'solved'
              ).length;
              const isAllSolved =
                totalMilestoneProbs > 0 && solvedMilestoneProbs === totalMilestoneProbs;
              const milestonePercent =
                totalMilestoneProbs > 0
                  ? Math.round((solvedMilestoneProbs / totalMilestoneProbs) * 100)
                  : 0;

              return (
                <div key={milestone.id} className="relative group">
                  {/* Step Connector Marker Circle on Vertical Line */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-5 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-xs transition-colors z-10 ${
                      isAllSolved
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : solvedMilestoneProbs > 0
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-300 text-slate-500 group-hover:border-blue-500'
                    }`}
                  >
                    {isAllSolved ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <span>{mIdx + 1}</span>
                    )}
                  </div>

                  {/* Milestone Card */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-300">
                    {/* Milestone Card Header */}
                    <div
                      onClick={() => toggleMilestone(milestone.id)}
                      className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-200/60">
                            {milestone.stepNumber}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {milestone.title}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                          {milestone.description}
                        </p>
                      </div>

                      {/* Right Progress & Guide Trigger */}
                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                        {/* Milestone Progress Bar */}
                        <div className="w-36 sm:w-44 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500 font-mono">
                              {solvedMilestoneProbs} / {totalMilestoneProbs} Solved
                            </span>
                            <span
                              className={
                                isAllSolved
                                  ? 'text-emerald-600'
                                  : 'text-blue-600'
                              }
                            >
                              {milestonePercent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isAllSolved
                                  ? 'bg-emerald-500'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${milestonePercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Guide / Cheat Sheet Button */}
                        {milestone.guide && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGuide(milestone.guide);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition cursor-pointer shadow-2xs"
                            title="Open Algorithmic Guide & Pattern Cheatsheet"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="hidden sm:inline">Cheat Sheet</span>
                          </button>
                        )}

                        {/* Accordion Toggle Icon */}
                        <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Problem Rows Inside Milestone (When Expanded) */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/40 divide-y divide-slate-100">
                        {milestone.problems.map((problem, pIdx) => {
                          const status =
                            userProgress[problem.id] ||
                            userProgress[problem.linkId] ||
                            'unsolved';

                          return (
                            <div
                              key={problem.id}
                              className="px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-white transition-colors"
                            >
                              {/* Left: 3-State Status Icon & Title */}
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => cycleProblemStatus(problem.id, e)}
                                  className="transition cursor-pointer shrink-0"
                                  title={
                                    status === 'solved'
                                      ? 'Solved (Click to reset)'
                                      : status === 'in_progress'
                                      ? 'In Progress (Click to mark Solved)'
                                      : 'Unsolved (Click to mark In Progress)'
                                  }
                                >
                                  {status === 'solved' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                                  ) : status === 'in_progress' ? (
                                    <Clock className="w-5 h-5 text-amber-500 fill-amber-50" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                                  )}
                                </button>

                                <span className="text-xs font-mono text-slate-400 w-5 shrink-0 hidden sm:inline">
                                  {pIdx + 1}.
                                </span>

                                <Link
                                  to={`/solve/${problem.linkId}`}
                                  className={`text-xs sm:text-sm font-semibold truncate hover:text-blue-600 transition ${
                                    status === 'solved'
                                      ? 'text-slate-500 line-through'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  {problem.title}
                                </Link>
                              </div>

                              {/* Right: Topic, Difficulty Badge, Read Guide & Action Button */}
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="hidden md:inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {problem.topic}
                                </span>

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyBadge(
                                    problem.difficulty
                                  )}`}
                                >
                                  {problem.difficulty}
                                </span>

                                {milestone.guide && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveGuide(milestone.guide);
                                    }}
                                    className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2 py-1 rounded-lg transition"
                                    title="Read pattern guide"
                                  >
                                    <BookOpen className="w-3 h-3 text-indigo-500" />
                                    <span>Guide</span>
                                  </button>
                                )}

                                <Link
                                  to={`/solve/${problem.linkId}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl shadow-xs transition group cursor-pointer"
                                >
                                  <span>Solve</span>
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* 4. ALGORITHMIC GUIDE & CHEAT SHEET MODAL                     */}
      {/* ============================================================ */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeGuide.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveGuide(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="inline-block bg-blue-50 text-blue-700 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-blue-200/60">
                {activeGuide.complexity}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Core Pattern &amp; Intuition
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  {activeGuide.pattern}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  <span>Code Template (JavaScript)</span>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(activeGuide.codeSnippet)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#18181b] text-zinc-100 p-3.5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-zinc-800">
                  <code>{activeGuide.codeSnippet}</code>
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveGuide(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      <Footer />
    </div>
  );
}

export default RoadmapsPage;
