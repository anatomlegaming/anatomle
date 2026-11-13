// ============================================================================
// ANATOMLE - Muscle Pathfinding Game (Myomle)
// ============================================================================
// Requires: React, UPPER_LIMB_MUSCLES (+ derived graphs), pathfinding.js,
//           gameLogic.js, replayIndex.js, upperLimbEngine.js, pathfindingUI.js
//
// Usage:
//   ReactDOM.createRoot(el).render(React.createElement(MuscleGame, {
//       graph: UPPER_LIMB_BONE_GRAPH, title: '…',
//       minPath: 4, maxPath: 8, bonus: 3, replayCode: 'ul', shareTitle: '…'
//   }));
//
// Rules match the daily puzzle: correct guesses are free, every off-path
// guess costs one, and the game is won as soon as the guessed muscles
// (optimal or detour) connect start to end.
// ============================================================================

(function () {
    var useState = React.useState, useEffect = React.useEffect,
        useMemo = React.useMemo, useRef = React.useRef;

    var ALL = Object.keys(UPPER_LIMB_MUSCLES);

    function newPuzzle(graph, minPath, maxPath) {
        return initializeGame(graph, { minLength: minPath, maxLength: maxPath });
    }

    function MuscleGame(props) {
        var graph = props.graph;

        var first = useMemo(function () { return newPuzzle(graph, props.minPath, props.maxPath); }, []);
        function chainFor(g) {
            return g.path.map(function (b, i) { return { bone: b, type: i === 0 ? 'start' : 'path', guessed: i === 0 }; });
        }
        function totalFor(g) { return calculateGuessCount(g.path.length, props.bonus); }

        var _t = useState(first), target = _t[0], setTarget = _t[1];
        var _c = useState(function () { return chainFor(first); }), chain = _c[0], setChain = _c[1];
        var _d = useState([]), detours = _d[0], setDetours = _d[1];
        var _b = useState([]), bad = _b[0], setBad = _b[1];
        var _l = useState(totalFor(first)), left = _l[0], setLeft = _l[1];
        var _m = useState(totalFor(first)), max = _m[0], setMax = _m[1];
        var _i = useState(''), input = _i[0], setInput = _i[1];
        var _s = useState(-1), selIdx = _s[0], setSelIdx = _s[1];
        var _p = useState('playing'), phase = _p[0], setPhase = _p[1];
        var _r = useState(false), reveal = _r[0], setReveal = _r[1];
        var _h = useState(false), hintUsed = _h[0], setHintUsed = _h[1];
        var _sh = useState(false), shared = _sh[0], setShared = _sh[1];
        var _rv = useState(false), reviewing = _rv[0], setReviewing = _rv[1];
        var _go = useState([]), guessOrder = _go[0], setGuessOrder = _go[1];

        var htp = window.useFirstVisit ? window.useFirstVisit('upper-limb') : [false, function () {}];

        // ── 3D highlights ────────────────────────────────────────────────────
        var highlightRef = useRef([]);
        var hintTimer = useRef(null);
        useEffect(function () {
            var h = [];
            var showReveal = reveal && phase === 'lost';
            chain.forEach(function (c, idx) {
                var isLast = idx === chain.length - 1;
                if (isLast) h.push({ name: c.bone, type: 'end' });
                else if (c.guessed) h.push({ name: c.bone, type: c.type });
                else if (showReveal) h.push({ name: c.bone, type: 'reveal' });
            });
            detours.forEach(function (d) { h.push({ name: d, type: 'detour' }); });
            bad.forEach(function (b) { h.push({ name: b, type: 'bad' }); });
            highlightRef.current = h;
            if (window.update3D) window.update3D(h);
        }, [chain, detours, bad, reveal, phase]);

        // The model loads asynchronously; paint the current state once it's in
        useEffect(function () {
            function onReady() { if (window.update3D) window.update3D(highlightRef.current); }
            window.addEventListener('modelReady', onReady);
            if (window.__modelIsReady) onReady();
            return function () {
                window.removeEventListener('modelReady', onReady);
                clearTimeout(hintTimer.current);
            };
        }, []);

        // ── Suggestions ──────────────────────────────────────────────────────
        var suggestions = useMemo(function () {
            var q = input.trim().toLowerCase();
            if (!q) return [];
            var guessed = chain.filter(function (c) { return c.guessed; }).map(function (c) { return c.bone; });
            var list = ALL.filter(function (m) {
                return m.toLowerCase().indexOf(q) !== -1 &&
                    guessed.indexOf(m) === -1 && m !== target.end &&
                    detours.indexOf(m) === -1 && bad.indexOf(m) === -1;
            });
            // Exact and prefix matches first, so "Brachialis" isn't buried
            list.sort(function (a, b) {
                function rank(x) { x = x.toLowerCase(); return x === q ? 0 : x.indexOf(q) === 0 ? 1 : 2; }
                return rank(a) - rank(b);
            });
            return list.slice(0, 8);
        }, [input, chain, target.end, detours, bad]);

        // ── Guessing ─────────────────────────────────────────────────────────
        function submit(guess) {
            if (phase !== 'playing' || !guess || ALL.indexOf(guess) === -1) return;
            var already = chain.some(function (c) { return c.guessed && c.bone === guess; });
            if (already || detours.indexOf(guess) !== -1 || bad.indexOf(guess) !== -1 || guess === target.end) return;

            setInput(''); setSelIdx(-1);
            setGuessOrder(function (o) { return o.concat([guess]); });

            if (target.path.indexOf(guess) !== -1) {
                var updated = chain.map(function (c) { return c.bone === guess ? Object.assign({}, c, { guessed: true }) : c; });
                setChain(updated);
                var optimal = updated.filter(function (c) { return c.guessed; }).map(function (c) { return c.bone; });
                if (canReachTargetWithGuessed(target.start, target.end, optimal, detours, graph)) setPhase('won');
                return;
            }

            var result = validateGuess(guess, target.path, target.start, target.end, graph);
            var nl = left - 1;
            setLeft(nl);

            if (result.type === 'detour') {
                var newDetours = detours.concat([guess]);
                setDetours(newDetours);
                var opt = chain.filter(function (c) { return c.guessed; }).map(function (c) { return c.bone; });
                if (canReachTargetWithGuessed(target.start, target.end, opt, newDetours, graph)) { setPhase('won'); return; }
            } else {
                setBad(function (p) { return p.concat([guess]); });
            }
            if (nl <= 0) setPhase('lost');
        }

        function handleKey(ev) {
            if (ev.key === 'ArrowDown') { ev.preventDefault(); setSelIdx(function (i) { return Math.min(i + 1, suggestions.length - 1); }); }
            else if (ev.key === 'ArrowUp') { ev.preventDefault(); setSelIdx(function (i) { return Math.max(i - 1, 0); }); }
            else if (ev.key === 'Enter') {
                var q = input.trim().toLowerCase();
                var exact = suggestions.filter(function (m) { return m.toLowerCase() === q; })[0];
                if (selIdx >= 0 && suggestions[selIdx]) submit(suggestions[selIdx]);
                else if (exact) submit(exact);
                else if (suggestions.length === 1) submit(suggestions[0]);
            }
            else if (ev.key === 'Escape') { setInput(''); setSelIdx(-1); }
        }

        function startNew() {
            var g = newPuzzle(graph, props.minPath, props.maxPath);
            clearTimeout(hintTimer.current);
            setTarget(g); setChain(chainFor(g));
            setDetours([]); setBad([]);
            setLeft(totalFor(g)); setMax(totalFor(g));
            setInput(''); setSelIdx(-1);
            setPhase('playing'); setReveal(false); setReviewing(false);
            setHintUsed(false); setShared(false); setGuessOrder([]);
            if (window.reset3D) window.reset3D();
        }

        function handleHint() {
            if (hintUsed || phase !== 'playing') return;
            setHintUsed(true);
            if (window.showNerveHint) window.showNerveHint(target.end);
            clearTimeout(hintTimer.current);
            hintTimer.current = setTimeout(function () {
                // Restore whatever the board looks like now, not when the hint started
                if (window.update3D) window.update3D(highlightRef.current);
            }, 4000);
        }

        function handleShare() {
            var dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            var used = guessOrder.length;
            var optimal = target.path.length - 2;
            var extra = used - optimal;
            var stars = phase === 'won' ? (extra === 0 ? '⭐⭐⭐' : extra <= 2 ? '⭐⭐' : '⭐') : '';
            var grid = ['🟢'];
            chain.slice(1, -1).forEach(function (c) { grid.push(c.guessed ? '🟦' : '⬜'); });
            detours.forEach(function () { grid.push('🟡'); });
            bad.forEach(function () { grid.push('🔴'); });
            grid.push('⬛');
            var result = phase === 'won' ? used + ' guess' + (used !== 1 ? 'es' : '') + ' ' + stars : '❌ ' + bad.length + ' wrong';
            var qs = window.encodeReplay ? window.encodeReplay(props.replayCode, target.start, target.end, target.path, guessOrder, detours, bad) : null;
            var replayLine = qs ? '\n\n🔁 Watch my path:\nhttps://anatomle.com/replay.html?' + qs : '';
            var text = props.shareTitle + '\n' + dateStr + '\n' + result + '\n' + grid.join('') + replayLine;
            navigator.clipboard.writeText(text).then(function () { setShared(true); });
        }

        var state = {
            target: target, chain: chain, left: left, max: max, bad: bad, detours: detours,
            input: input, selIdx: selIdx, phase: phase, reveal: reveal, suggestions: suggestions,
            hintUsed: hintUsed, shared: shared, reviewing: reviewing,
            guessesUsed: guessOrder.length
        };
        var handlers = {
            onInputChange: function (ev) { setInput(ev.target.value); setSelIdx(-1); },
            onKeyDown: handleKey,
            onSubmit: submit,
            onNewGame: startNew,
            onGiveUp: function () { setPhase('lost'); },
            onReveal: function () { setReveal(true); },
            onReview: function () { setReviewing(true); },
            onStopReview: function () { setReviewing(false); },
            onHint: handleHint,
            onShare: handleShare
        };

        return React.createElement(React.Fragment, null,
            window.HowToModal ? React.createElement(window.HowToModal, { show: htp[0], onClose: htp[1] }) : null,
            React.createElement(window.PathfindingUI, {
                gameTitle: props.title, state: state, handlers: handlers
            })
        );
    }

    window.MuscleGame = MuscleGame;
})();
