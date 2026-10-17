/**
 * Calendar-Day Streak Utilities
 * Enforces strict midnight-to-midnight (raat 12 baje cutoff) streak calculations.
 */

/**
 * Calculates calendar day difference between two dates based on midnight cutoff.
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {number} difference in days
 */
function getCalendarDayDiff(date1, date2) {
  const d1Midnight = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2Midnight = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((d1Midnight - d2Midnight) / (1000 * 60 * 60 * 24));
}

/**
 * Updates streak on an accepted problem submission.
 * - If first problem solved: streakCount = 1, lastSolvedDate = now
 * - If diffDays === 0: already solved today, keep streak
 * - If diffDays === 1: solved next calendar day, streakCount += 1, lastSolvedDate = now
 * - If diffDays >= 2: broken streak, resets streakCount = 1, lastSolvedDate = now
 * 
 * @param {Object} user - User mongoose document or object
 * @param {Date} [now] - Current date/time
 * @returns {Object} mutated user object
 */
function updateStreakOnSolve(user, now = new Date()) {
  if (!user.lastSolvedDate) {
    user.streakCount = 1;
    user.lastSolvedDate = now;
  } else {
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastMidnight = new Date(user.lastSolvedDate.getFullYear(), user.lastSolvedDate.getMonth(), user.lastSolvedDate.getDate());
    const diffDays = Math.round((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already solved today, keep current streak
    } else if (diffDays === 1) {
      // Consecutive day solved before midnight!
      user.streakCount = (user.streakCount || 0) + 1;
      user.lastSolvedDate = now;
    } else {
      // 2 or more days gap: Streak broken, restart new streak
      user.streakCount = 1;
      user.lastSolvedDate = now;
    }
  }
  return user;
}

/**
 * Validates user streak on profile fetch or session check.
 * If more than 1 day has elapsed since lastSolvedDate, streak is broken and reset to 0.
 * 
 * @param {Object} user - User mongoose document or object
 * @param {Date} [now] - Current date/time
 * @returns {boolean} true if streak was reset to 0, false otherwise
 */
function validateStreak(user, now = new Date()) {
  if (user && user.lastSolvedDate) {
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastMidnight = new Date(user.lastSolvedDate.getFullYear(), user.lastSolvedDate.getMonth(), user.lastSolvedDate.getDate());
    const diffDays = Math.round((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      user.streakCount = 0; // Display 0 until they solve a new question
      return true;
    }
  }
  return false;
}

module.exports = {
  getCalendarDayDiff,
  updateStreakOnSolve,
  validateStreak,
};
