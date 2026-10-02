const { test, describe } = require('node:test');
const assert = require('node:assert');

/**
 * Mirror the exact percentile calculation logic implemented in userSubmission.js:
 * When totalAccepted > 1:
 *   percentile = Number(((slowerCount / totalAccepted) * 100).toFixed(1))
 *   if fasterCount === 0 => percentile = 100.0
 * When totalAccepted <= 1 => percentile = 100.0
 * Clamped cleanly: Math.min(100.0, Math.max(0.0, percentile))
 */
function computePercentile({ totalAccepted, slowerCount, fasterCount }) {
  let percentile = 100.0;
  if (totalAccepted > 1) {
    percentile = Number(((slowerCount / totalAccepted) * 100).toFixed(1));
    if (fasterCount === 0) {
      percentile = 100.0;
    }
  } else {
    percentile = 100.0;
  }
  return Math.min(100.0, Math.max(0.0, percentile));
}

describe('Percentile Engine Math Unit Tests', () => {
  test('returns 100.0% for the first submission on a problem (totalAccepted = 1)', () => {
    const res = computePercentile({ totalAccepted: 1, slowerCount: 0, fasterCount: 0 });
    assert.strictEqual(res, 100.0);
  });

  test('returns 100.0% if submission is tied for fastest (fasterCount = 0)', () => {
    const res = computePercentile({ totalAccepted: 10, slowerCount: 5, fasterCount: 0 });
    assert.strictEqual(res, 100.0);
  });

  test('calculates accurate percentile for standard distribution', () => {
    // 10 total accepted, 7 are slower, 2 faster, 1 self
    const res = computePercentile({ totalAccepted: 10, slowerCount: 7, fasterCount: 2 });
    assert.strictEqual(res, 70.0);
  });

  test('calculates accurate percentile for 0 slower submissions', () => {
    // 5 total accepted, 0 are slower, 4 faster
    const res = computePercentile({ totalAccepted: 5, slowerCount: 0, fasterCount: 4 });
    assert.strictEqual(res, 0.0);
  });

  test('clamps values cleanly between 0.0 and 100.0', () => {
    const minVal = computePercentile({ totalAccepted: 100, slowerCount: 0, fasterCount: 99 });
    assert.ok(minVal >= 0.0 && minVal <= 100.0);

    const maxVal = computePercentile({ totalAccepted: 100, slowerCount: 99, fasterCount: 0 });
    assert.strictEqual(maxVal, 100.0);
  });
});
