// ============================================================================
// ANATOMLE - Muscle Mini: daily crossword generator
// ============================================================================
// Builds a small crossword (at most 8 x 8) from MUSCLE_CLUES. The same date
// always gives the same grid, so every player gets the same puzzle, and any
// date works, so the daily puzzle never runs out.
//
//   var p = buildMiniCrossword('2026-11-14');
//   p.rows, p.cols               grid size
//   p.cells[r][c]                null for a black square, else
//                                {r, c, letter, num, across, down}  (word ids)
//   p.words[id]                  {id, dir:'across'|'down', num, r, c, answer,
//                                 clue, muscles:[…], cells:[[r,c]…]}
//   p.order                      word ids, across first then down, by number
//
// Works in the browser (window.buildMiniCrossword) and in Node (module.exports)
// so it can be tested from the command line.
// ============================================================================

(function (root) {
    var MAX = 8;          // the grid is never bigger than MAX x MAX
    var TARGET = 10;      // stop adding words once there are this many
    var TRIES = 40;       // grids tried per day; the best one wins

    function rng(seed) {
        var s = seed >>> 0;
        return function () {
            var t = s += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    function hash(str) {
        var h = 0x811c9dc5;
        for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
        h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
        h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
        h ^= h >>> 16;
        return h >>> 0;
    }
    function shuffle(arr, rand) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(rand() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    // { ANSWER: [{clue, muscle}, …] }
    function bank(rows) {
        var out = {};
        rows.forEach(function (r) {
            if (mentions(r[1], r[0])) return;   // a clue never gives itself away
            (out[r[0]] = out[r[0]] || []).push({ clue: r[1], muscles: [].concat(r[2] || []) });
        });
        return out;
    }

    // Does this clue give away the word? (any word in the clue that starts
    // with it, so ULNAR is given away by "flexor carpi ulnaris" too)
    function mentions(clue, word) {
        return new RegExp('\\b' + word, 'i').test(clue);
    }
    function freeClues(options, words) {
        return options.filter(function (o) {
            return !words.some(function (w) { return mentions(o.clue, w); });
        });
    }

    // One attempt at a grid. Cells live in a map keyed "r,c" on an open
    // canvas; the bounding box is checked against MAX as words go in.
    function attempt(clues, rand) {
        var answers = shuffle(Object.keys(clues), rand);
        var grid = {};      // "r,c" -> {letter, across: id|null, down: id|null}
        var words = [];
        var box = { r0: 0, r1: 0, c0: 0, c1: 0 };

        function at(r, c) { return grid[r + ',' + c]; }

        function fits(word, r, c, dir) {
            var dr = dir === 'down' ? 1 : 0, dc = dir === 'across' ? 1 : 0;
            var n = word.length, crosses = 0;
            if (at(r - dr, c - dc) || at(r + dr * n, c + dc * n)) return -1;   // must not run on
            var nb = { r0: Math.min(box.r0, r), r1: Math.max(box.r1, r + dr * (n - 1)),
                       c0: Math.min(box.c0, c), c1: Math.max(box.c1, c + dc * (n - 1)) };
            if (nb.r1 - nb.r0 + 1 > MAX || nb.c1 - nb.c0 + 1 > MAX) return -1;
            for (var i = 0; i < n; i++) {
                var rr = r + dr * i, cc = c + dc * i, cell = at(rr, cc);
                if (cell) {
                    if (cell.letter !== word[i] || cell[dir] !== null) return -1;
                    crosses++;
                } else if (at(rr + dc, cc + dr) || at(rr - dc, cc - dr)) {
                    return -1;   // a new letter may not touch a word alongside it
                }
            }
            return crosses;
        }

        function place(word, r, c, dir, option) {
            var dr = dir === 'down' ? 1 : 0, dc = dir === 'across' ? 1 : 0;
            var id = words.length, cells = [];
            for (var i = 0; i < word.length; i++) {
                var rr = r + dr * i, cc = c + dc * i, k = rr + ',' + cc;
                if (!grid[k]) grid[k] = { letter: word[i], across: null, down: null };
                grid[k][dir] = id;
                cells.push([rr, cc]);
            }
            box = { r0: Math.min(box.r0, r), r1: Math.max(box.r1, r + dr * (word.length - 1)),
                    c0: Math.min(box.c0, c), c1: Math.max(box.c1, c + dc * (word.length - 1)) };
            words.push({ answer: word, dir: dir, r: r, c: c, cells: cells, clue: option.clue, muscles: option.muscles });
        }

        // Pick a clue for a new word that names none of the words already in,
        // and swap out any placed clue that names the new word.
        function clueFor(word) {
            var placed = words.map(function (w) { return w.answer; });
            var own = freeClues(clues[word], placed);
            if (!own.length) return null;
            var swaps = [];
            for (var i = 0; i < words.length; i++) {
                if (!mentions(words[i].clue, word)) continue;
                var alt = freeClues(clues[words[i].answer], placed.concat(word));
                if (!alt.length) return null;
                swaps.push([i, alt[Math.floor(rand() * alt.length)]]);
            }
            return { option: own[Math.floor(rand() * own.length)], swaps: swaps };
        }

        // Start with a long word across the middle
        var first = answers.filter(function (w) { return w.length >= 5; })[0];
        place(first, 0, 0, 'across', clues[first][Math.floor(rand() * clues[first].length)]);
        var used = {}; used[first] = true;

        var progress = true;
        while (words.length < TARGET && progress) {
            progress = false;
            for (var a = 0; a < answers.length && words.length < TARGET; a++) {
                var word = answers[a];
                if (used[word]) continue;
                if (words.some(function (w) { return w.answer.indexOf(word) >= 0 || word.indexOf(w.answer) >= 0; })) continue;
                // every spot where this word crosses a letter already down
                var best = null;
                Object.keys(grid).forEach(function (k) {
                    var p = k.split(',').map(Number), cell = grid[k];
                    for (var i = 0; i < word.length; i++) {
                        if (word[i] !== cell.letter) continue;
                        ['across', 'down'].forEach(function (dir) {
                            if (cell[dir] !== null) return;
                            var r = dir === 'down' ? p[0] - i : p[0], c = dir === 'across' ? p[1] - i : p[1];
                            var x = fits(word, r, c, dir);
                            if (x < 1) return;
                            var score = x * 10 + rand() * 6;
                            if (!best || score > best.score) best = { r: r, c: c, dir: dir, score: score };
                        });
                    }
                });
                if (!best) continue;
                var pick = clueFor(word);
                if (!pick) continue;
                pick.swaps.forEach(function (s) { words[s[0]].clue = s[1].clue; words[s[0]].muscles = s[1].muscles; });
                place(word, best.r, best.c, best.dir, pick.option);
                used[word] = true;
                progress = true;
            }
        }
        return { grid: grid, words: words, box: box };
    }

    function score(g) {
        var cells = Object.keys(g.grid), crossed = 0;
        cells.forEach(function (k) { if (g.grid[k].across !== null && g.grid[k].down !== null) crossed++; });
        var w = g.box.c1 - g.box.c0 + 1, h = g.box.r1 - g.box.r0 + 1;
        var balance = { across: 0, down: 0 };
        g.words.forEach(function (x) { balance[x.dir]++; });
        var anatomy = g.words.filter(function (x) { return x.muscles.length; }).length;
        var tiny = g.words.filter(function (x) { return x.answer.length === 3; }).length;
        return g.words.length * 12 + crossed * 6 + anatomy * 5 - tiny * 5 + cells.length * 1.5 / (w * h) * 20
             - Math.abs(balance.across - balance.down) * 4 - Math.abs(w - h) * 3;
    }

    // Turn the open canvas into a rows x cols grid with crossword numbers
    function finish(g, date) {
        var rows = g.box.r1 - g.box.r0 + 1, cols = g.box.c1 - g.box.c0 + 1;
        var cells = [];
        for (var r = 0; r < rows; r++) { cells.push([]); for (var c = 0; c < cols; c++) cells[r].push(null); }
        Object.keys(g.grid).forEach(function (k) {
            var p = k.split(',').map(Number), src = g.grid[k];
            var r = p[0] - g.box.r0, c = p[1] - g.box.c0;
            cells[r][c] = { r: r, c: c, letter: src.letter, num: null, across: src.across, down: src.down };
        });
        var words = g.words.map(function (w, id) {
            return { id: id, dir: w.dir, num: null, r: w.r - g.box.r0, c: w.c - g.box.c0, answer: w.answer,
                     clue: w.clue, muscles: w.muscles,
                     cells: w.cells.map(function (x) { return [x[0] - g.box.r0, x[1] - g.box.c0]; }) };
        });
        var n = 0;
        for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) {
            var starts = words.filter(function (w) { return w.r === r && w.c === c; });
            if (!starts.length) continue;
            n++;
            cells[r][c].num = n;
            starts.forEach(function (w) { w.num = n; });
        }
        var order = words.slice().sort(function (a, b) {
            return a.dir === b.dir ? a.num - b.num : (a.dir === 'across' ? -1 : 1);
        }).map(function (w) { return w.id; });
        return { date: date, rows: rows, cols: cols, cells: cells, words: words, order: order };
    }

    function buildMiniCrossword(date, rows) {
        // a top-level const is not a window property, so look it up by name
        rows = rows || (typeof MUSCLE_CLUES !== 'undefined' ? MUSCLE_CLUES : root.MUSCLE_CLUES);
        var clues = bank(rows);
        var rand = rng(hash('anatomle-mini:' + date));
        var best = null, bestScore = -Infinity;
        for (var i = 0; i < TRIES; i++) {
            var g = attempt(clues, rand);
            var s = score(g);
            if (s > bestScore) { best = g; bestScore = s; }
        }
        return finish(best, date);
    }

    root.buildMiniCrossword = buildMiniCrossword;
    if (typeof module !== 'undefined' && module.exports) module.exports = buildMiniCrossword;
})(typeof window !== 'undefined' ? window : globalThis);
