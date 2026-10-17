const { test, describe } = require('node:test');
const assert = require('node:assert');
const { updateStreakOnSolve, validateStreak, getCalendarDayDiff } = require('../src/utils/streakUtils');

describe('Strict Calendar-Day Streak Logic (Raat 12 Baje Cutoff)', () => {
  test('First problem solved sets streak to 1 and records lastSolvedDate', () => {
    const user = {
      streakCount: 0,
      lastSolvedDate: null,
    };
    const solveTime = new Date('2026-10-01T14:30:00Z');
    updateStreakOnSolve(user, solveTime);

    assert.strictEqual(user.streakCount, 1);
    assert.strictEqual(user.lastSolvedDate.getTime(), solveTime.getTime());
  });

  test('Second problem solved on the same day keeps streak at 1', () => {
    const day1Solve1 = new Date('2026-10-01T09:00:00Z');
    const user = {
      streakCount: 1,
      lastSolvedDate: day1Solve1,
    };

    // Second solve 6 hours later on same calendar day
    const day1Solve2 = new Date('2026-10-01T15:00:00Z');
    updateStreakOnSolve(user, day1Solve2);

    assert.strictEqual(user.streakCount, 1, 'Streak should remain 1 when solving again on same calendar day');
    assert.strictEqual(user.lastSolvedDate.getTime(), day1Solve1.getTime(), 'lastSolvedDate should remain first solve of day');
  });

  test('Next day solve (diffDays === 1) increases streak to 2', () => {
    const day1Solve = new Date('2026-10-01T23:45:00');
    const user = {
      streakCount: 1,
      lastSolvedDate: day1Solve,
    };

    // Solved next calendar day morning (after midnight)
    const day2Solve = new Date('2026-10-02T08:15:00');
    updateStreakOnSolve(user, day2Solve);

    assert.strictEqual(user.streakCount, 2, 'Streak should increment by 1 on consecutive calendar day');
    assert.strictEqual(user.lastSolvedDate.getTime(), day2Solve.getTime());
  });

  test('Midnight cutoff precision: 23:59:59 PM today to 00:00:01 AM tomorrow is diffDays === 1', () => {
    const todayNight = new Date(2026, 9, 1, 23, 59, 59); // Oct 1, 23:59:59
    const tomorrowMorning = new Date(2026, 9, 2, 0, 0, 1);  // Oct 2, 00:00:01

    assert.strictEqual(getCalendarDayDiff(tomorrowMorning, todayNight), 1);

    const user = {
      streakCount: 1,
      lastSolvedDate: todayNight,
    };

    updateStreakOnSolve(user, tomorrowMorning);
    assert.strictEqual(user.streakCount, 2, 'Consecutive day past 12 AM midnight cutoff must increment streak');
  });

  test('Missing a day resets streak to 0 while idle (validation on user fetch/profile)', () => {
    const day1Solve = new Date('2026-10-01T12:00:00');
    const user = {
      streakCount: 3,
      lastSolvedDate: day1Solve,
    };

    // User checks profile 2 days later without having solved anything
    const day3Check = new Date('2026-10-03T10:00:00');
    const wasBroken = validateStreak(user, day3Check);

    assert.strictEqual(wasBroken, true);
    assert.strictEqual(user.streakCount, 0, 'Streak must display 0 when more than 1 calendar day is missed');
  });

  test('Validation does NOT break streak on same day or next day', () => {
    const todaySolve = new Date(2026, 9, 1, 14, 0, 0);
    const user = {
      streakCount: 4,
      lastSolvedDate: todaySolve,
    };

    // Same day check
    const sameDayCheck = new Date(2026, 9, 1, 20, 0, 0);
    assert.strictEqual(validateStreak(user, sameDayCheck), false);
    assert.strictEqual(user.streakCount, 4);

    // Next day check before midnight (still active, user has until 11:59:59 PM to solve)
    const nextDayCheck = new Date(2026, 9, 2, 18, 0, 0);
    assert.strictEqual(validateStreak(user, nextDayCheck), false);
    assert.strictEqual(user.streakCount, 4, 'Streak is preserved on day+1 until the calendar day concludes');
  });

  test('Missing a day (diffDays >= 2) resets streak to 1 on next solve', () => {
    const day1Solve = new Date('2026-10-01T10:00:00');
    const user = {
      streakCount: 5,
      lastSolvedDate: day1Solve,
    };

    // Solved 3 days later (missed Oct 2 and Oct 3)
    const day4Solve = new Date('2026-10-04T16:00:00');
    updateStreakOnSolve(user, day4Solve);

    assert.strictEqual(user.streakCount, 1, 'Broken streak must restart at 1 on new solve');
    assert.strictEqual(user.lastSolvedDate.getTime(), day4Solve.getTime());
  });

  test('Multi-day progression with consecutive solves and eventual gap', () => {
    const user = {
      streakCount: 0,
      lastSolvedDate: null,
    };

    // Day 1
    updateStreakOnSolve(user, new Date(2026, 9, 1, 10, 0, 0));
    assert.strictEqual(user.streakCount, 1);

    // Day 1 second solve
    updateStreakOnSolve(user, new Date(2026, 9, 1, 18, 0, 0));
    assert.strictEqual(user.streakCount, 1);

    // Day 2 solve
    updateStreakOnSolve(user, new Date(2026, 9, 2, 11, 0, 0));
    assert.strictEqual(user.streakCount, 2);

    // Day 3 solve
    updateStreakOnSolve(user, new Date(2026, 9, 3, 21, 0, 0));
    assert.strictEqual(user.streakCount, 3);

    // Day 4 idle (no solve), checked on Day 5 -> streak broken to 0
    validateStreak(user, new Date(2026, 9, 5, 8, 0, 0));
    assert.strictEqual(user.streakCount, 0);

    // Day 5 solve -> starts new streak of 1
    updateStreakOnSolve(user, new Date(2026, 9, 5, 14, 0, 0));
    assert.strictEqual(user.streakCount, 1);
  });
});
