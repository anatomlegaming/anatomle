// ============================================================================
// ANATOMLE - Path Game (shared scoring + React hook)
// ============================================================================
// One set of rules for every pathfinding game (Full Skeleton, Daily, Myomle).
//
// Every guess costs one. Each guess is graded on its own:
//   optimal - the bone lies on ANY shortest route from start to end   (green)
//   detour  - it lies on a longer route that still fits in the total
//             guess allowance                                         (yellow)
//   bad     - no winning route can use it                             (red)
//
// The game is won as soon as the start and end are joined by guessed bones
// (optimal or detour). The result is then graded:
//   3 stars  Perfect!        shortest route, no mistakes, guessed in order
//                            (each guess touches the one before, walking from
//                            the start, or backwards from the goal)
//   2 stars  Great!          shortest route, no mistakes, but out of order
//   2 stars  Nice!           shortest route, one or two mistakes
//   1 star   Made it         a longer route, or 3+ mistakes
//   Out of guesses           ran out of guesses
//   Gave up                  pressed Give up with guesses left
//   Too far to finish        ended early: the goal needs more bones than
//                            there are guesses left (the game shows a live
//                            "need at least N more" counter so this is no surprise)
// A "mistake" is any guess that wasn't optimal.
//
// Requires: React (for usePathGame only). No other dependencies.
// ============================================================================

(function () {

    // ── GRAPH HELPERS ────────────────────────────────────────────────────────

    // Links are anatomical contacts, so they always go both ways. Fill in any
    // reverse link the data forgot so routes work in both directions.
    function symmetric(graph) {
        var out = {};
        Object.keys(graph).forEach(function (a) { out[a] = (graph[a] || []).slice(); });
        Object.keys(graph).forEach(function (a) {
            (graph[a] || []).forEach(function (b) {
                if (!out[b]) out[b] = [];
                if (out[b].indexOf(a) === -1) out[b].push(a);
            });
        });
        return out;
    }

    function distances(from, graph) {
        var d = {}; d[from] = 0;
        var q = [from];
        for (var i = 0; i < q.length; i++) {
            var x = q[i];
            (graph[x] || []).forEach(function (y) {
                if (d[y] === undefined) { d[y] = d[x] + 1; q.push(y); }
            });
        }
        return d;
    }

    // Precompute everything needed to grade guesses for one puzzle
    function analyze(start, end, graph) {
        var dS = distances(start, graph), dE = distances(end, graph);
        return { start: start, end: end, graph: graph, dS: dS, dE: dE, L: dS[end] };
    }

    // Number of guesses allowed: one per bone on the shortest route, plus a bonus
    function allowance(a, bonus) { return (a.L - 1) + (bonus + 1); }

    function classify(bone, a, maxGuesses) {
        var s = a.dS[bone], t = a.dE[bone];
        if (s === undefined || t === undefined) return 'bad';
        if (s + t === a.L) return 'optimal';
        // A route through this bone needs (s + t - 1) guessed bones
        return (s + t - 1) <= maxGuesses ? 'detour' : 'bad';
    }

    // Shortest chain from start to end using only the given bones, or null
    function routeThrough(a, bones) {
        var allowed = {}; bones.forEach(function (b) { allowed[b] = true; });
        allowed[a.start] = true; allowed[a.end] = true;
        var prev = {}; prev[a.start] = null;
        var q = [a.start];
        for (var i = 0; i < q.length; i++) {
            var x = q[i];
            if (x === a.end) {
                var route = [];
                for (var n = x; n !== null; n = prev[n]) route.unshift(n);
                return route;
            }
            (a.graph[x] || []).forEach(function (y) {
                if (allowed[y] && !(y in prev)) { prev[y] = x; q.push(y); }
            });
        }
        return null;
    }

    // Fewest new bones still needed to join start and end, given the bones
    // already guessed (good ones are free, wrong ones can't be used).
    // 0-1 BFS: stepping onto an unguessed bone costs 1.
    function stillNeeded(a, good, bad) {
        var free = {}; good.forEach(function (b) { free[b] = true; });
        var banned = {}; (bad || []).forEach(function (b) { banned[b] = true; });
        free[a.end] = true;
        var dist = {}; dist[a.start] = 0;
        var dq = [a.start];
        while (dq.length) {
            var x = dq.shift();
            if (x === a.end) return dist[x];
            (a.graph[x] || []).forEach(function (y) {
                if (banned[y]) return;
                var w = free[y] ? 0 : 1, nd = dist[x] + w;
                if (dist[y] === undefined || nd < dist[y]) {
                    dist[y] = nd;
                    if (w === 0) dq.unshift(y); else dq.push(y);
                }
            });
        }
        return Infinity;
    }

    // A shortest route that reuses as many of the player's correct guesses as
    // possible. Used to fill the empty slots and for "Reveal Path".
    function bestShortestRoute(a, guessed) {
        var g = {}; guessed.forEach(function (b) { g[b] = true; });
        var layers = [];
        Object.keys(a.dS).forEach(function (n) {
            if (a.dE[n] !== undefined && a.dS[n] + a.dE[n] === a.L) {
                (layers[a.dS[n]] = layers[a.dS[n]] || []).push(n);
            }
        });
        var score = {}, prev = {};
        score[a.start] = 0; prev[a.start] = null;
        for (var i = 1; i <= a.L; i++) {
            (layers[i] || []).forEach(function (n) {
                var best = -1, from = null;
                (layers[i - 1] || []).forEach(function (p) {
                    if (score[p] !== undefined && (a.graph[p] || []).indexOf(n) !== -1 && score[p] > best) {
                        best = score[p]; from = p;
                    }
                });
                if (from !== null) { score[n] = best + (g[n] ? 1 : 0); prev[n] = from; }
            });
        }
        var route = [];
        for (var n = a.end; n !== null && n !== undefined; n = prev[n]) route.unshift(n);
        return route;
    }

    // Right-panel chain: one slot per step of the shortest route. A slot shows
    // every correct guess at that distance from the start (several shortest
    // routes can run side by side), otherwise the bone it would be.
    function buildChain(a, optimal) {
        var fill = bestShortestRoute(a, optimal);
        return fill.map(function (bone, i) {
            if (i === 0) return { bone: bone, type: 'start', guessed: true };
            if (i === a.L) return { bone: bone, type: 'path', guessed: false };
            var here = optimal.filter(function (b) { return a.dS[b] === i; });
            if (here.length) return { bone: here[0], alts: here.slice(1), type: 'path', guessed: true };
            return { bone: bone, type: 'path', guessed: false };
        });
    }

    // How many steps a guess adds over the shortest route (0 = on it).
    // null when the bone has no route to both ends at all.
    function extraSteps(bone, a) {
        var s = a.dS[bone], t = a.dE[bone];
        if (s === undefined || t === undefined) return null;
        return s + t - a.L;
    }

    // True when the guesses walk the route one step at a time, from the start
    // forwards or from the goal backwards, with nothing wasted.
    function inOrder(a, bones) {
        if (bones.length !== a.L - 1) return false;
        function walk(from, dist) {
            var prev = from;
            for (var i = 0; i < bones.length; i++) {
                var b = bones[i];
                if (dist[b] !== i + 1 || (a.graph[prev] || []).indexOf(b) === -1) return false;
                prev = b;
            }
            return true;
        }
        return walk(a.start, a.dS) || walk(a.end, a.dE);
    }

    function grade(phase, a, route, mistakes, used, ordered, left, need) {
        var steps = a.L - 1;
        if (phase === 'lost') {
            if (left > 0 && need > left)
                return { tier: 0, stars: 0, label: 'Too far to finish', emoji: '🚧', early: true,
                         detail: 'You needed ' + need + ' more but had ' + left + ' left.' };
            if (left > 0)
                return { tier: 0, stars: 0, label: 'Gave up', emoji: '🏳️',
                         detail: mistakes + ' mistake' + (mistakes !== 1 ? 's' : '') };
            return { tier: 0, stars: 0, label: 'Out of guesses', emoji: '💣',
                     detail: mistakes + ' mistake' + (mistakes !== 1 ? 's' : '') };
        }
        if (phase !== 'won') return null;
        var shortest = route && route.length - 1 === a.L;
        var usedTxt = used + ' guess' + (used !== 1 ? 'es' : '');
        if (shortest && mistakes === 0 && ordered)
            return { tier: 3, stars: 3, label: 'Perfect!', emoji: '🏆', detail: usedTxt + ' · no mistakes · in order' };
        if (shortest && mistakes === 0)
            return { tier: 2, stars: 2, label: 'Great!', emoji: '🥇',
                     detail: usedTxt + ' · no mistakes · out of order' };
        if (shortest && mistakes <= 2)
            return { tier: 2, stars: 2, label: 'Nice!', emoji: '🥈',
                     detail: usedTxt + ' · ' + mistakes + ' mistake' + (mistakes !== 1 ? 's' : '') };
        return { tier: 1, stars: 1, label: 'Made it', emoji: '✓',
                 detail: shortest
                    ? usedTxt + ' · ' + mistakes + ' mistakes'
                    : 'Took ' + (route.length - 2) + ' steps · shortest is ' + steps };
    }

    var GRID = { optimal: '🟩', detour: '🟨', bad: '🟥' };

    window.PathScoring = {
        symmetric: symmetric, analyze: analyze, allowance: allowance, classify: classify,
        routeThrough: routeThrough, bestShortestRoute: bestShortestRoute,
        buildChain: buildChain, grade: grade, GRID: GRID, stillNeeded: stillNeeded,
        extraSteps: extraSteps, inOrder: inOrder
    };

    // ── REACT HOOK ───────────────────────────────────────────────────────────
    // opts:
    //   graph        adjacency list
    //   names        guessable names (default: graph keys)
    //   bonus        extra guesses beyond the shortest route (default 2)
    //   newPuzzle    () => {start, end} for unlimited play (omit for daily)
    //   puzzle       fixed {start, end} (daily)
    //   saved        {guesses, phase, reveal, shared} to restore (daily)
    //   onChange     (snapshot) => void, called after every change (daily save)
    //   replayCode   code for replay links ('fs', 'ul')
    //   shareTitle   first line of share text
    //   shareDate    date line (default: today, en-GB)
    //   replayExtra  extra query string for the replay link
    //   hints        allow hints (default: on for unlimited play, off for daily).
    //                A hint fills in the next missing bone. It uses a guess and
    //                counts as a mistake, so it lowers the score.
    if (typeof React === 'undefined') return;
    var useState = React.useState, useEffect = React.useEffect,
        useMemo = React.useMemo, useRef = React.useRef;

    function usePathGame(opts) {
        var graph = useMemo(function () { return symmetric(opts.graph); }, [opts.graph]);
        var names = opts.names || Object.keys(opts.graph);
        var bonus = opts.bonus === undefined ? 2 : opts.bonus;

        var _p = useState(function () { return opts.puzzle || (opts.newPuzzle && opts.newPuzzle()) || null; }),
            puzzle = _p[0], setPuzzle = _p[1];
        var saved = opts.saved || {};
        var _g = useState(saved.guesses || []), guesses = _g[0], setGuesses = _g[1];
        var _ph = useState(saved.phase || 'playing'), phase = _ph[0], setPhase = _ph[1];
        var _rv = useState(saved.reveal || false), reveal = _rv[0], setReveal = _rv[1];
        var _sh = useState(saved.shared || false), shared = _sh[0], setShared = _sh[1];
        var _rw = useState(false), reviewing = _rw[0], setReviewing = _rw[1];
        var _in = useState(''), input = _in[0], setInput = _in[1];
        var _si = useState(-1), selIdx = _si[0], setSelIdx = _si[1];

        // A fixed puzzle (daily) can arrive after the first render
        useEffect(function () {
            if (opts.puzzle && (!puzzle || opts.puzzle.start !== puzzle.start || opts.puzzle.end !== puzzle.end)) {
                setPuzzle(opts.puzzle);
                var sv = opts.saved || {};
                setGuesses(sv.guesses || []); setPhase(sv.phase || 'playing');
                setReveal(sv.reveal || false); setShared(sv.shared || false);
            }
        }, [opts.puzzle && opts.puzzle.start, opts.puzzle && opts.puzzle.end]);

        var a = useMemo(function () { return puzzle ? analyze(puzzle.start, puzzle.end, graph) : null; },
                        [puzzle && puzzle.start, puzzle && puzzle.end, graph]);
        var max = a ? allowance(a, bonus) : 0;
        var left = max - guesses.length;

        var optimal = guesses.filter(function (g) { return g.type === 'optimal'; }).map(function (g) { return g.bone; });
        var detours = guesses.filter(function (g) { return g.type === 'detour'; }).map(function (g) { return g.bone; });
        var bad     = guesses.filter(function (g) { return g.type === 'bad'; }).map(function (g) { return g.bone; });
        var hinted = guesses.filter(function (g) { return g.hint; }).length;
        var mistakes = detours.length + bad.length + hinted;
        var hintsOn = opts.hints === undefined ? !!opts.newPuzzle : !!opts.hints;

        var chain = useMemo(function () { return a ? buildChain(a, optimal) : []; }, [a, guesses]);
        var route = useMemo(function () { return a ? routeThrough(a, optimal.concat(detours)) : null; }, [a, guesses]);
        var ordered = a ? inOrder(a, guesses.map(function (g) { return g.bone; })) : false;
        var need = a ? stillNeeded(a, optimal.concat(detours), bad) : 0;
        var result = a ? grade(phase, a, route, mistakes, guesses.length, ordered, left, need) : null;
        // Every guess in order, with how far off the shortest route it was
        var log = a ? guesses.map(function (g, i) {
            return { n: i + 1, bone: g.bone, type: g.type, hint: !!g.hint, extra: extraSteps(g.bone, a), onRoute: !!(route && route.indexOf(g.bone) !== -1) };
        }) : [];
        var grid = '🟢' + guesses.map(function (g) { return g.hint ? '💡' : GRID[g.type]; }).join('') +
                   (phase === 'won' ? '🎯' : phase === 'lost' ? '❌' : '');

        // Report changes (daily uses this to save progress)
        var onChangeRef = useRef(opts.onChange); onChangeRef.current = opts.onChange;
        useEffect(function () {
            if (puzzle && onChangeRef.current) onChangeRef.current({ guesses: guesses, phase: phase, reveal: reveal, shared: shared, grade: result });
        }, [guesses, phase, reveal, shared]);

        // ── 3D highlights ────────────────────────────────────────────────────
        var highlightRef = useRef([]);
        useEffect(function () {
            if (!a) return;
            var h = [{ name: a.start, type: 'start' }];
            if (reviewing && phase !== 'playing') {
                // Review: one correct route only. Bones you found stay green,
                // the ones you missed show in purple. Guesses stay in the side list.
                chain.forEach(function (c, i) {
                    if (i === 0 || i === chain.length - 1) return;
                    h.push({ name: c.bone, type: c.guessed ? 'path' : 'reveal' });
                });
            } else {
                optimal.forEach(function (b) { h.push({ name: b, type: 'path' }); });
                detours.forEach(function (b) { h.push({ name: b, type: 'detour' }); });
                bad.forEach(function (b) { h.push({ name: b, type: 'bad' }); });
            }
            h.push({ name: a.end, type: 'end' });
            highlightRef.current = h;
            try { window.update3D && window.update3D(h); } catch (e) {}
        }, [a, guesses, reviewing, phase]);

        useEffect(function () {
            function onReady() { try { window.update3D && window.update3D(highlightRef.current); } catch (e) {} }
            window.addEventListener('modelReady', onReady);
            if (window.__modelIsReady) onReady();
            return function () { window.removeEventListener('modelReady', onReady); };
        }, []);

        // Frame the start and end bones whenever a new puzzle starts
        useEffect(function () {
            if (!puzzle || !window.panToGameBones) return;
            function pan(delay) { setTimeout(function () { window.panToGameBones(puzzle.start, puzzle.end, 1800); }, delay); }
            if (window.__modelIsReady) { pan(100); return; }
            function onReady() { window.removeEventListener('modelReady', onReady); pan(400); }
            window.addEventListener('modelReady', onReady);
            return function () { window.removeEventListener('modelReady', onReady); };
        }, [puzzle && puzzle.start, puzzle && puzzle.end]);

        // ── Suggestions ──────────────────────────────────────────────────────
        // Once the game ends, clear the box and close the dropdown
        useEffect(function () {
            if (phase !== 'playing') { setInput(''); setSelIdx(-1); }
        }, [phase]);

        var suggestions = useMemo(function () {
            var q = input.trim().toLowerCase();
            if (!q || !puzzle || phase !== 'playing') return [];
            var used = {}; guesses.forEach(function (g) { used[g.bone] = true; });
            var list = names.filter(function (n) {
                return n.toLowerCase().indexOf(q) !== -1 && !used[n] && n !== puzzle.start && n !== puzzle.end;
            });
            // Exact and prefix matches first
            list.sort(function (x, y) {
                function rank(s) { s = s.toLowerCase(); return s === q ? 0 : s.indexOf(q) === 0 ? 1 : 2; }
                return rank(x) - rank(y);
            });
            return list.slice(0, 8);
        }, [input, guesses, puzzle, phase]);

        // ── Actions ──────────────────────────────────────────────────────────
        function submit(bone, isHint) {
            if (phase !== 'playing' || !a || !bone || names.indexOf(bone) === -1) return;
            if (bone === a.start || bone === a.end) return;
            if (guesses.some(function (g) { return g.bone === bone; })) return;
            setInput(''); setSelIdx(-1);

            var type = isHint ? 'optimal' : classify(bone, a, max);
            var entry = { bone: bone, type: type };
            if (isHint) entry.hint = true;
            var next = guesses.concat([entry]);
            setGuesses(next);

            var good = next.filter(function (g) { return g.type !== 'bad'; }).map(function (g) { return g.bone; });
            if (routeThrough(a, good)) setPhase('won');
            // lose as soon as the goal is out of reach with the guesses left
            else if (next.length >= max ||
                     stillNeeded(a, good, next.filter(function (g) { return g.type === 'bad'; }).map(function (g) { return g.bone; })) > max - next.length)
                setPhase('lost');
        }

        // Fill in the first missing bone of the best route through what is found
        function hint() {
            if (!hintsOn || phase !== 'playing' || !a) return;
            var good = guesses.filter(function (g) { return g.type !== 'bad'; }).map(function (g) { return g.bone; });
            var r = bestShortestRoute(a, good) || [];
            var done = {}; good.forEach(function (b) { done[b] = true; });
            var missing = r.slice(1, -1).filter(function (b) { return !done[b]; });
            if (missing.length) submit(missing[0], true);
        }

        function handleKey(ev) {
            if (ev.key === 'ArrowDown') { ev.preventDefault(); setSelIdx(function (i) { return Math.min(i + 1, suggestions.length - 1); }); }
            else if (ev.key === 'ArrowUp') { ev.preventDefault(); setSelIdx(function (i) { return Math.max(i - 1, 0); }); }
            else if (ev.key === 'Enter') {
                var q = input.trim().toLowerCase();
                var exact = suggestions.filter(function (n) { return n.toLowerCase() === q; })[0];
                if (selIdx >= 0 && suggestions[selIdx]) submit(suggestions[selIdx]);
                else if (exact) submit(exact);
                else if (suggestions.length === 1) submit(suggestions[0]);
            }
            else if (ev.key === 'Escape') { setInput(''); setSelIdx(-1); }
        }

        function startReview() {
            setReviewing(true);
            // frame the whole route
            var bones = chain.map(function (c) { return c.bone; });
            setTimeout(function () {
                if (!(window.focusPart && window.focusPart(bones, 1200)) && puzzle && window.panToGameBones)
                    window.panToGameBones(puzzle.start, puzzle.end, 1200);
            }, 50);
        }

        function startNew() {
            if (!opts.newPuzzle) return;
            setPuzzle(opts.newPuzzle());
            setGuesses([]); setPhase('playing'); setReveal(false); setShared(false); setReviewing(false);
            setInput(''); setSelIdx(-1);
            try { window.reset3D && window.reset3D(); } catch (e) {}
        }

        function share() {
            if (!a || !result) return;
            var dateLine = opts.shareDate ||
                new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            var stars = result.tier > 0 ? new Array(result.stars + 1).join('⭐') + ' ' : '❌ ';
            var line = stars + result.label.replace(/[!.]$/, '') + ' · ' + guesses.length + '/' + max + ' guesses';
            var qs = window.encodeReplay && opts.replayCode
                ? window.encodeReplay(opts.replayCode, a.start, a.end, chain.map(function (c) { return c.bone; }),
                                      guesses.map(function (g) { return g.bone; }), detours, bad)
                : null;
            var link = qs ? '\n\n🔁 Watch my path:\nhttps://anatomle.com/replay.html?' + qs + (opts.replayExtra || '') : '';
            var text = opts.shareTitle + '\n' + dateLine + '\n' + line + '\n' + grid + link;
            navigator.clipboard.writeText(text).then(function () { setShared(true); });
        }

        var target = puzzle ? { start: puzzle.start, end: puzzle.end, path: chain.map(function (c) { return c.bone; }) }
                            : { start: '', end: '', path: [] };

        return {
            ready: !!a,
            puzzle: puzzle, guesses: guesses, phase: phase, grade: result,
            startNew: startNew,
            state: {
                target: target, chain: chain, left: left, max: max, bad: bad, detours: detours,
                input: input, selIdx: selIdx, phase: phase, reveal: reveal, suggestions: suggestions,
                shared: shared, reviewing: reviewing, guessesUsed: guesses.length,
                grade: result, grid: grid, log: log, goal: a ? a.end : '', need: need,
                hints: hintsOn, hintsUsed: hinted
            },
            handlers: {
                onInputChange: function (ev) { setInput(ev.target.value); setSelIdx(-1); },
                onKeyDown: handleKey,
                onSubmit: submit,
                onNewGame: opts.newPuzzle ? startNew : null,
                onGiveUp: function () { if (phase === 'playing') setPhase('lost'); },
                onReveal: function () { setReveal(true); startReview(); },
                onReview: function () { startReview(); },
                onStopReview: function () { setReviewing(false); setReveal(false); },
                onShare: share,
                onClue: hintsOn ? hint : null
            }
        };
    }

    window.usePathGame = usePathGame;
})();
