// ============================================================================
// ANATOMLE — Streak Manager
// Tracks daily puzzle streaks in localStorage.
// Keys:
//   anatomle_streak_count  — current streak integer
//   anatomle_streak_last   — "YYYY-MM-DD" UTC date of last win
//   anatomle_streak_best   — best ever streak integer
// ============================================================================

(function() {

    var KEYS = {
        count: 'anatomle_streak_count',
        last:  'anatomle_streak_last',
        best:  'anatomle_streak_best',
    };

    function getStreak() {
        try {
            return {
                count: parseInt(localStorage.getItem(KEYS.count) || '0', 10),
                last:  localStorage.getItem(KEYS.last) || null,
                best:  parseInt(localStorage.getItem(KEYS.best) || '0', 10),
            };
        } catch(e) {
            return { count: 0, last: null, best: 0 };
        }
    }

    function saveStreak(count, last, best) {
        try {
            localStorage.setItem(KEYS.count, count);
            localStorage.setItem(KEYS.last,  last);
            localStorage.setItem(KEYS.best,  best);
        } catch(e) {}
    }

    // Call after a daily puzzle is completed.
    // todayStr: "YYYY-MM-DD" UTC — must come from worldtimeapi, not new Date()
    // won: boolean
    // Returns { count, best, isNew } where isNew = streak just incremented
    function recordDailyResult(todayStr, won) {
        var s = getStreak();

        // Already recorded today — don't double count
        if (s.last === todayStr) {
            return { count: s.count, best: s.best, isNew: false };
        }

        if (!won) {
            // Loss — reset streak
            var newBest = Math.max(s.best, s.count);
            saveStreak(0, todayStr, newBest);
            return { count: 0, best: newBest, isNew: false };
        }

        // Win — check if yesterday was played
        var yesterday = getPreviousDay(todayStr);
        var isConsecutive = (s.last === yesterday);
        var newCount = isConsecutive ? s.count + 1 : 1;
        var newBest2 = Math.max(s.best, newCount);
        saveStreak(newCount, todayStr, newBest2);
        return { count: newCount, best: newBest2, isNew: true };
    }

    function getPreviousDay(dateStr) {
        var d = new Date(dateStr + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() - 1);
        return d.toISOString().slice(0, 10);
    }

    // Check if streak is still alive (last win was today or yesterday)
    function isStreakAlive(todayStr) {
        var s = getStreak();
        if (!s.last || s.count === 0) return false;
        var yesterday = getPreviousDay(todayStr);
        return s.last === todayStr || s.last === yesterday;
    }

    window.StreakManager = {
        get:            getStreak,
        record:         recordDailyResult,
        isAlive:        isStreakAlive,
    };

})();
