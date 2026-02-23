// ============================================================================
// ANATOMLE — Seeded Random Number Generator
// ============================================================================
// Mulberry32 algorithm — fast, good distribution, fully deterministic.
// Same seed always produces the same sequence of numbers.
// Used to generate the daily puzzle from a pre-assigned seed number.
// ============================================================================

function SeededRandom(seed) {
    this._seed = seed >>> 0;
}

SeededRandom.prototype.next = function() {
    var t = this._seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    this._seed = t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

SeededRandom.prototype.nextInt = function(min, max) {
    return Math.floor(this.next() * (max - min)) + min;
};

SeededRandom.prototype.pick = function(arr) {
    return arr[this.nextInt(0, arr.length)];
};

// ── DAILY GAME INITIALISER ────────────────────────────────────────────────────
// Given a seed and graph, deterministically find a start+end pair with a
// path length between minLength and maxLength.
// Tries up to 200 combinations before giving up (should never happen).

function initializeDailyGame(seed, graph, options) {
    options = options || {};
    var minLength = options.minLength || 4;
    var maxLength = options.maxLength || 8;

    var rng    = new SeededRandom(seed);
    var bones  = Object.keys(graph);
    var start, end, path;
    var attempts = 0;

    do {
        start = rng.pick(bones);
        end   = rng.pick(bones);
        path  = findShortestPath(start, end, graph);
        attempts++;
        if (attempts > 200) {
            console.warn('Daily game: could not find valid path in 200 attempts');
            break;
        }
    } while (
        !path ||
        path.length < minLength ||
        path.length > maxLength ||
        start === end
    );

    return { start: start, end: end, path: path };
}

window.SeededRandom      = SeededRandom;
window.initializeDailyGame = initializeDailyGame;
