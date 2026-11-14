// ============================================================================
// ANATOMLE - Muscle Mini: the daily crossword  (styles in css/notebook.css, .mx-*)
// Pure React.createElement, loads as a plain <script> tag.
// Needs: React, MUSCLE_CLUES, buildMiniCrossword (js/core/miniCrossword.js).
// Optional: the upper limb 3D engine (window.update3D / focusPart), which
// lights up the muscle named in the selected clue.
//
//   ReactDOM.createRoot(el).render(React.createElement(MuscleMini, { title: 'muscle mini' }));
//
// Progress for the day (letters, time, checks, reveals) is kept in
// localStorage, so a reload carries on where the player left off.
// ============================================================================
(function () {
    var e = React.createElement;
    var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useMemo = React.useMemo;

    var KEY = 'anatomle_mini_';
    var STREAK = 'anatomle_mini_streak';
    var HOWTO = 'anatomle_mini_howto';
    var KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

    function utcDate(d) { return d.toISOString().slice(0, 10); }
    function prettyDate(s) {
        var d = new Date(s + 'T12:00:00Z');
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    }
    function clock(sec) {
        var m = Math.floor(sec / 60), s = sec % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }
    function load(k, fallback) {
        try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; }
    }
    function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
    function prevDay(s) { var d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - 1); return utcDate(d); }

    function recordStreak(date) {
        var s = load(STREAK, { count: 0, last: null, best: 0 });
        if (s.last === date) return { count: s.count, best: s.best, isNew: false };
        var count = s.last === prevDay(date) ? s.count + 1 : 1;
        var out = { count: count, last: date, best: Math.max(s.best, count) };
        save(STREAK, out);
        return { count: out.count, best: out.best, isNew: true };
    }

    function blank(p) {
        return p.cells.map(function (row) { return row.map(function () { return ''; }); });
    }

    function MuscleMini(props) {
        // ?date=YYYY-MM-DD plays another day (handy for testing)
        var date = useMemo(function () {
            var q = /[?&]date=(\d{4}-\d{2}-\d{2})/.exec(location.search);
            return q ? q[1] : utcDate(new Date());
        }, []);
        var p = useMemo(function () { return window.buildMiniCrossword(date); }, [date]);
        var saved = useMemo(function () { return load(KEY + date, null); }, [date]);

        var _f = useState(saved ? saved.fill : blank(p)), fill = _f[0], setFill = _f[1];
        var _w = useState({}), wrong = _w[0], setWrong = _w[1];                     // "r,c" -> true
        var _rv = useState(saved ? saved.revealed : {}), revealed = _rv[0], setRevealed = _rv[1];
        var _t = useState(saved ? saved.time : 0), time = _t[0], setTime = _t[1];
        var _ch = useState(saved ? saved.checks : 0), checks = _ch[0], setChecks = _ch[1];
        var _dn = useState(saved ? !!saved.done : false), done = _dn[0], setDone = _dn[1];
        var _ov = useState(false), showDone = _ov[0], setShowDone = _ov[1];
        var _st = useState(null), streak = _st[0], setStreak = _st[1];
        var _sh = useState(false), shared = _sh[0], setShared = _sh[1];
        var _nq = useState(false), notQuite = _nq[0], setNotQuite = _nq[1];
        var _mn = useState(null), menu = _mn[0], setMenu = _mn[1];                 // 'check' | 'reveal' | null
        var _hw = useState(!load(HOWTO, false)), howTo = _hw[0], setHowTo = _hw[1];
        var _md = useState(false), model = _md[0], setModel = _md[1];               // phones: the model sheet is open
        var _rs = useState(false), sure = _rs[0], setSure = _rs[1];                 // "Reset" asks once

        useEffect(function () {
            document.body.classList.toggle('show-model', model);
        }, [model]);
        // If the page held the model back (phones) and the screen becomes wide
        // enough to show it, start it then
        useEffect(function () {
            if (!window.matchMedia) return;
            var mq = window.matchMedia('(max-width: 760px)');
            function on() { if (!mq.matches && window.startUpperLimbModel) window.startUpperLimbModel(); }
            if (mq.addEventListener) mq.addEventListener('change', on); else mq.addListener(on);
            return function () { if (mq.removeEventListener) mq.removeEventListener('change', on); else mq.removeListener(on); };
        }, []);
        useEffect(function () {
            if (!sure) return;
            var t = setTimeout(function () { setSure(false); }, 3000);
            return function () { clearTimeout(t); };
        }, [sure]);

        var first = p.words[p.order[0]];
        var _s = useState({ r: first.r, c: first.c, dir: first.dir }), sel = _s[0], setSel = _s[1];

        var themeState = useState(window.AnatomleTheme ? window.AnatomleTheme.get() : 'light');
        useEffect(function () {
            function on(ev) { themeState[1](ev.detail); }
            window.addEventListener('anatomle-theme', on);
            return function () { window.removeEventListener('anatomle-theme', on); };
        }, []);
        var isDark = themeState[0] === 'dark';

        function cellAt(r, c) { return p.cells[r] && p.cells[r][c] ? p.cells[r][c] : null; }
        function wordOf(r, c, dir) {
            var cell = cellAt(r, c);
            if (!cell) return null;
            var id = cell[dir] !== null ? cell[dir] : cell[dir === 'across' ? 'down' : 'across'];
            return p.words[id];
        }
        var word = wordOf(sel.r, sel.c, sel.dir);
        var dir = word.dir;

        // ── save, tick, finish ───────────────────────────────────────────────
        useEffect(function () {
            save(KEY + date, { fill: fill, revealed: revealed, time: time, checks: checks, done: done });
        }, [fill, revealed, time, checks, done]);

        var paused = done || howTo;
        useEffect(function () {
            if (paused) return;
            var id = setInterval(function () {
                if (document.visibilityState === 'visible') setTime(function (t) { return t + 1; });
            }, 1000);
            return function () { clearInterval(id); };
        }, [paused]);

        var full = p.cells.every(function (row, r) { return row.every(function (cell, c) { return !cell || fill[r][c]; }); });
        var right = full && p.cells.every(function (row, r) { return row.every(function (cell, c) { return !cell || fill[r][c] === cell.letter; }); });
        useEffect(function () {
            if (done) return;
            if (right) {
                setDone(true); setShowDone(true); setNotQuite(false);
                setStreak(recordStreak(date));
            } else setNotQuite(full);
        }, [full, right]);
        useEffect(function () { if (saved && saved.done) setStreak(recordStreak(date)); }, []);

        // ── light up the clue's muscle on the 3D model ───────────────────────
        var muscle = word.muscle;
        useEffect(function () {
            var tries = 0, timer = null;
            function paint() {
                if (!window.update3D || !window.__modelIsReady) {
                    // keep waiting: on phones the model may only start loading later
                    timer = setTimeout(paint, tries++ < 60 ? 500 : 2000);
                    return;
                }
                window.update3D(muscle ? [{ name: muscle, type: 'end' }] : []);
            }
            paint();
            return function () { clearTimeout(timer); };
        }, [muscle]);

        // ── moving around ────────────────────────────────────────────────────
        function select(r, c) {
            var cell = cellAt(r, c);
            if (!cell) return;
            setMenu(null);
            if (r === sel.r && c === sel.c && cell.across !== null && cell.down !== null) {
                setSel({ r: r, c: c, dir: dir === 'across' ? 'down' : 'across' });
            } else {
                setSel({ r: r, c: c, dir: cell[dir] !== null ? dir : (dir === 'across' ? 'down' : 'across') });
            }
        }
        function goWord(step) {
            var i = p.order.indexOf(word.id);
            var w = p.words[p.order[(i + step + p.order.length) % p.order.length]];
            var spot = w.cells.filter(function (x) { return !fill[x[0]][x[1]]; })[0] || w.cells[0];
            setSel({ r: spot[0], c: spot[1], dir: w.dir });
        }
        function flip() {
            var cell = cellAt(sel.r, sel.c);
            if (cell.across !== null && cell.down !== null) setSel({ r: sel.r, c: sel.c, dir: dir === 'across' ? 'down' : 'across' });
        }
        function arrow(dr, dc) {
            var want = dr ? 'down' : 'across';
            var cell = cellAt(sel.r, sel.c);
            if (want !== dir && cell[want] !== null) { setSel({ r: sel.r, c: sel.c, dir: want }); return; }
            for (var r = sel.r + dr, c = sel.c + dc; r >= 0 && c >= 0 && r < p.rows && c < p.cols; r += dr, c += dc) {
                var n = cellAt(r, c);
                if (n) { setSel({ r: r, c: c, dir: n[want] !== null ? want : (want === 'across' ? 'down' : 'across') }); return; }
            }
        }

        function type(ch) {
            if (done) return;
            setMenu(null);
            var k = sel.r + ',' + sel.c;
            if (!revealed[k]) {
                var next = fill.map(function (row) { return row.slice(); });
                next[sel.r][sel.c] = ch;
                setFill(next);
                if (wrong[k] !== undefined) { var w2 = Object.assign({}, wrong); delete w2[k]; setWrong(w2); }
            }
            // next empty square in this word, else the next word
            var cells = word.cells, i = cells.findIndex(function (x) { return x[0] === sel.r && x[1] === sel.c; });
            for (var j = i + 1; j < cells.length; j++) {
                if (!fill[cells[j][0]][cells[j][1]]) { setSel({ r: cells[j][0], c: cells[j][1], dir: dir }); return; }
            }
            if (i + 1 < cells.length) { setSel({ r: cells[i + 1][0], c: cells[i + 1][1], dir: dir }); return; }
            goWord(1);
        }
        function erase() {
            if (done) return;
            setMenu(null);
            var k = sel.r + ',' + sel.c;
            var next = fill.map(function (row) { return row.slice(); });
            if (fill[sel.r][sel.c] && !revealed[k]) {
                next[sel.r][sel.c] = '';
            } else {
                var cells = word.cells, i = cells.findIndex(function (x) { return x[0] === sel.r && x[1] === sel.c; });
                if (i <= 0) return;
                var b = cells[i - 1];
                if (!revealed[b[0] + ',' + b[1]]) next[b[0]][b[1]] = '';
                setSel({ r: b[0], c: b[1], dir: dir });
            }
            setFill(next);
        }

        // keyboard
        var handler = useRef(null);
        handler.current = function (ev) {
            if (ev.metaKey || ev.ctrlKey || ev.altKey || howTo || showDone) return;
            var k = ev.key;
            if (/^[a-z]$/i.test(k)) { type(k.toUpperCase()); ev.preventDefault(); }
            else if (k === 'Backspace' || k === 'Delete') { erase(); ev.preventDefault(); }
            else if (k === 'ArrowLeft') { arrow(0, -1); ev.preventDefault(); }
            else if (k === 'ArrowRight') { arrow(0, 1); ev.preventDefault(); }
            else if (k === 'ArrowUp') { arrow(-1, 0); ev.preventDefault(); }
            else if (k === 'ArrowDown') { arrow(1, 0); ev.preventDefault(); }
            else if (k === 'Tab' || k === 'Enter') { goWord(ev.shiftKey ? -1 : 1); ev.preventDefault(); }
            else if (k === ' ') { flip(); ev.preventDefault(); }
        };
        useEffect(function () {
            function on(ev) { handler.current(ev); }
            window.addEventListener('keydown', on);
            return function () { window.removeEventListener('keydown', on); };
        }, []);

        // ── check and reveal ─────────────────────────────────────────────────
        function scopeCells(scope) {
            if (scope === 'square') return [[sel.r, sel.c]];
            if (scope === 'word') return word.cells;
            var all = [];
            p.cells.forEach(function (row, r) { row.forEach(function (cell, c) { if (cell) all.push([r, c]); }); });
            return all;
        }
        function check(scope) {
            setMenu(null);
            var w2 = Object.assign({}, wrong), any = false;
            scopeCells(scope).forEach(function (x) {
                var k = x[0] + ',' + x[1], v = fill[x[0]][x[1]];
                if (!v || revealed[k]) return;
                any = true;
                w2[k] = v !== p.cells[x[0]][x[1]].letter;
            });
            if (any) { setWrong(w2); setChecks(checks + 1); }
        }
        function reveal(scope) {
            setMenu(null);
            var next = fill.map(function (row) { return row.slice(); });
            var rv = Object.assign({}, revealed), w2 = Object.assign({}, wrong);
            scopeCells(scope).forEach(function (x) {
                var k = x[0] + ',' + x[1], want = p.cells[x[0]][x[1]].letter;
                if (next[x[0]][x[1]] === want) return;
                next[x[0]][x[1]] = want; rv[k] = true; delete w2[k];
            });
            setFill(next); setRevealed(rv); setWrong(w2);
        }
        function reset() {
            setMenu(null);
            if (!sure) { setSure(true); return; }
            setSure(false);
            setFill(blank(p)); setWrong({}); setRevealed({}); setChecks(0); setTime(0);
        }

        var reveals = Object.keys(revealed).length;
        function shareText() {
            var help = !checks && !reveals ? 'no help' :
                [checks ? checks + ' check' + (checks === 1 ? '' : 's') : null,
                 reveals ? reveals + ' reveal' + (reveals === 1 ? '' : 's') : null].filter(Boolean).join(', ');
            return 'Anatomle Muscle Mini · ' + prettyDate(date) + '\n⏱ ' + clock(time) + ' · ' + help + '\nhttps://anatomle.com/games/upper-limb.html';
        }
        function share() {
            var text = shareText();
            if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
                navigator.share({ text: text }).catch(function () {});
                return;
            }
            if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { setShared(true); }, function () {});
        }

        // ── render ───────────────────────────────────────────────────────────
        var inWord = {};
        word.cells.forEach(function (x) { inWord[x[0] + ',' + x[1]] = true; });

        var grid = e('div', {
                className: 'mx-grid' + (done ? ' solved' : ''),
                style: { gridTemplateColumns: 'repeat(' + p.cols + ', 1fr)', aspectRatio: p.cols + ' / ' + p.rows,
                         '--cols': p.cols, '--rows': p.rows },
                role: 'grid', 'aria-label': 'Crossword grid'
            },
            p.cells.map(function (row, r) {
                return row.map(function (cell, c) {
                    if (!cell) return e('div', { key: r + ',' + c, className: 'mx-cell block' });
                    var k = r + ',' + c;
                    var cls = 'mx-cell';
                    if (r === sel.r && c === sel.c) cls += ' sel';
                    else if (inWord[k]) cls += ' word';
                    if (wrong[k] === true) cls += ' bad';
                    if (wrong[k] === false) cls += ' good';
                    if (revealed[k]) cls += ' shown';
                    return e('div', { key: k, className: cls, role: 'gridcell', onMouseDown: function (ev) { ev.preventDefault(); select(r, c); } },
                        cell.num ? e('span', { className: 'mx-num' }, cell.num) : null,
                        e('span', { className: 'mx-ltr' }, fill[r][c]));
                });
            }));

        var clueBar = e('div', { className: 'mx-clue' },
            e('button', { type: 'button', className: 'mx-arr', 'aria-label': 'Previous clue', onClick: function () { goWord(-1); } }, '‹'),
            e('div', { className: 'mx-clue-txt', onClick: flip },
                e('span', { className: 'mx-clue-n' }, word.num + (dir === 'across' ? 'A' : 'D')),
                e('span', null, word.clue)),
            e('button', { type: 'button', className: 'mx-arr', 'aria-label': 'Next clue', onClick: function () { goWord(1); } }, '›'));

        function clueList(d) {
            return e('div', { className: 'mx-list' },
                e('div', { className: 'mx-list-h' }, d === 'across' ? 'Across' : 'Down'),
                p.order.filter(function (id) { return p.words[id].dir === d; }).map(function (id) {
                    var w = p.words[id];
                    var filled = w.cells.every(function (x) { return fill[x[0]][x[1]]; });
                    var cls = 'mx-li' + (w.id === word.id ? ' on' : '') + (filled ? ' filled' : '');
                    return e('div', { key: id, className: cls, onClick: function () {
                            var spot = w.cells.filter(function (x) { return !fill[x[0]][x[1]]; })[0] || w.cells[0];
                            setSel({ r: spot[0], c: spot[1], dir: w.dir });
                        } },
                        e('b', null, w.num), e('span', null, w.clue));
                }));
        }

        function menuBtn(kind, label, act) {
            return e('div', { className: 'mx-menu-wrap' },
                e('button', { type: 'button', className: 'nb-btn', disabled: done,
                    onClick: function () { setMenu(menu === kind ? null : kind); } }, label, ' ▾'),
                menu === kind ? e('div', { className: 'mx-menu' },
                    ['square', 'word', 'puzzle'].map(function (s) {
                        return e('button', { key: s, type: 'button', onClick: function () { act(s); } }, s);
                    })) : null);
        }
        var tools = e('div', { className: 'mx-tools' },
            menuBtn('check', 'Check', check),
            menuBtn('reveal', 'Reveal', reveal),
            e('button', { type: 'button', className: 'nb-btn mx-model-btn' + (model ? ' hl-btn' : ''), onClick: function () {
                setMenu(null);
                setModel(!model);
                if (model) return;
                if (window.startUpperLimbModel) window.startUpperLimbModel();
                // zoom to the clue's muscle once the model is there
                var tries = 0;
                (function zoom() {
                    if (window.__modelIsReady && window.focusPart) { if (muscle) window.focusPart(muscle); return; }
                    if (tries++ < 120) setTimeout(zoom, 250);
                })();
            } }, model ? 'Hide model' : 'Model'),
            done
                ? e('button', { type: 'button', className: 'nb-btn hl-btn', onClick: function () { setShowDone(true); } }, 'Results')
                : e('button', { type: 'button', className: 'nb-btn' + (sure ? ' hl-btn' : ''), onClick: reset }, sure ? 'Sure?' : 'Reset'));

        var keyboard = e('div', { className: 'mx-kb', 'aria-hidden': true },
            KEYS.map(function (row, i) {
                return e('div', { key: i, className: 'mx-kb-row' },
                    row.split('').map(function (ch) {
                        return e('button', { key: ch, type: 'button', tabIndex: -1, onClick: function () { type(ch); } }, ch);
                    }),
                    i === 2 ? e('button', { key: 'del', type: 'button', tabIndex: -1, className: 'wide', onClick: erase, 'aria-label': 'Delete' }, '⌫') : null);
            }));

        var navbar = e('header', { className: 'g-nav' },
            e('div', { className: 'brand' },
                e('a', { href: '../index.html', className: 'wordmark', title: 'Back to the notes' }, 'anatom', e('span', { className: 'le' }, 'le')),
                e('span', { className: 'mode' }, props.title || 'muscle mini')),
            e('div', { className: 'acts' },
                e('button', { type: 'button', className: 'nb-btn htp-btn', title: 'How to play', 'aria-label': 'How to play', onClick: function () { setHowTo(true); } },
                    e('span', { className: 'lbl-long' }, 'How to play'), e('span', { className: 'lbl-short' }, '?')),
                window.AnatomleTheme ? e('button', { type: 'button', className: 'nb-btn theme-toggle',
                    title: isDark ? 'Light mode' : 'Dark mode', 'aria-label': isDark ? 'Switch to light mode' : 'Switch to dark mode',
                    onClick: function () { window.AnatomleTheme.toggle(); } }, isDark ? '☀' : '☾') : null,
                e('a', { href: '../index.html', className: 'nb-btn dark' }, 'Menu')));

        var bar = e('div', { className: 'g-bar mx-bar' },
            e('div', { className: 'ends' },
                e('span', { className: 'bone' }, e('span', { className: 'hl' }, 'Muscle Mini')),
                e('span', { className: 'to' }, prettyDate(date))),
            muscle ? e('button', { type: 'button', className: 'mx-lit', title: 'Show it on the model',
                onClick: function () { if (window.focusPart) window.focusPart(muscle); } },
                e('i', null), muscle) : null,
            e('div', { className: 'counts' },
                e('span', { className: 'left' + (done ? ' mx-done-t' : '') }, e('b', null, clock(time)))));

        var panel = e('aside', { className: 'g-panel mx-panel' },
            clueBar,
            e('div', { className: 'mx-board' }, grid),
            notQuite && !done ? e('div', { className: 'mx-note' }, 'Every square is filled, but something is off. Try Check.') : null,
            tools,
            e('div', { className: 'g-notes mx-clues nb-scroll' }, clueList('across'), clueList('down')),
            keyboard);

        var overlay = null;
        if (howTo) {
            overlay = e('div', { className: 'g-over', onClick: function () { save(HOWTO, true); setHowTo(false); } },
                e('div', { className: 'g-card mx-how', role: 'dialog', 'aria-label': 'How to play', onClick: function (ev) { ev.stopPropagation(); } },
                    e('span', { className: 'tape pink' }),
                    e('h2', null, 'Muscle ', e('span', { className: 'hl' }, 'Mini')),
                    e('p', { className: 'detail' }, 'A small anatomy crossword, new every day.'),
                    e('ul', null,
                        e('li', null, 'Clues ask about upper limb muscles: what they attach to, their nerve, what they do.'),
                        e('li', null, 'Answers are short: bones, nerves, actions and other anatomy words.'),
                        e('li', null, 'Tap a square to pick it; tap it again (or the clue) to switch between across and down.'),
                        e('li', null, 'The muscle in the clue lights up on the model.'),
                        e('li', null, 'Stuck? Check or reveal a square, a word or the whole puzzle.')),
                    e('button', { type: 'button', className: 'nb-btn wide big hl-btn', onClick: function () { save(HOWTO, true); setHowTo(false); } }, 'Start')));
        } else if (showDone) {
            var clean = !checks && !reveals;
            overlay = e('div', { className: 'g-over' },
                e('div', { className: 'g-card', role: 'dialog', 'aria-label': 'Solved' },
                    e('span', { className: 'tape pink' }),
                    e('div', { className: 'emoji' }, clean ? '🎉' : '✅'),
                    e('h2', null, e('span', { className: clean ? 'hl-green' : 'hl' }, 'Solved')),
                    e('p', { className: 'detail' }, 'in ' + clock(time) + (clean ? ', with no help' :
                        ' · ' + [checks ? checks + ' check' + (checks === 1 ? '' : 's') : null, reveals ? reveals + ' revealed' : null].filter(Boolean).join(', '))),
                    streak ? e('div', { className: 'g-streak' },
                        e('span', { style: { fontSize: 26, lineHeight: 1 } }, '🔥'),
                        e('div', null,
                            e('div', { className: 'num' }, streak.count + ' day streak'),
                            e('div', { className: 'sub' }, 'Best: ' + streak.best + ' · new mini at midnight UTC'))) : null,
                    e('div', { className: 'row' },
                        e('button', { type: 'button', className: 'nb-btn big', onClick: share }, shared ? '✓ Copied' : '📋 Share')),
                    e('div', { className: 'row' },
                        e('button', { type: 'button', className: 'nb-btn', onClick: function () { setShowDone(false); } }, 'See the grid'),
                        e('a', { className: 'nb-btn dark', href: '../index.html' }, 'Menu'))));
        }

        return e(React.Fragment, null, navbar, bar, panel, overlay);
    }

    window.MuscleMini = MuscleMini;
})();
