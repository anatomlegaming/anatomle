// ============================================================================
// ANATOMLE - PATHFINDING UI  (Study Notebook look; styles in css/notebook.css)
// Pure React.createElement — no JSX, loads as plain <script> tag
// Used by: Full Skeleton, Daily, and the Myomle muscle game
// ============================================================================
(function () {
    var e = React.createElement;
    var useRef    = React.useRef;
    var useEffect = React.useEffect;
    var useState  = React.useState;

    // Letters that pop in one after another, for a freshly found name
    function Pop(text, key) {
        return e('span', { key: key, className: 'pop', 'aria-label': text },
            text.split('').map(function (ch, i) {
                return e('span', { key: i, 'aria-hidden': true, style: { animationDelay: (i * 38) + 'ms' } }, ch === ' ' ? '\u00A0' : ch);
            }));
    }

    function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 'es'); }

    function PathfindingUI(props) {
        var gameTitle = props.gameTitle;
        var s         = props.state;
        var h         = props.handlers;

        var target      = s.target;
        var chain       = s.chain;
        var left        = s.left;
        var max         = s.max;
        var bad         = s.bad;
        var detours     = s.detours;
        var input       = s.input;
        var selIdx      = s.selIdx;
        var phase       = s.phase;
        var reveal      = s.reveal;
        var suggestions = s.suggestions;
        var hintUsed    = s.hintUsed   || false;
        var shared      = s.shared     || false;
        var reviewing   = s.reviewing  || false;
        var guessesUsed = s.guessesUsed || (max - left);
        var streak      = s.streak || null;
        var grade       = s.grade  || null;   // {tier, stars, label, emoji, detail} from PathScoring
        var gridText    = s.grid   || null;
        var log         = s.log    || [];
        var need        = s.need === undefined ? null : s.need;
        var spare       = need === null ? null : left - need;   // guesses you can afford to waste
        var goal        = s.goal   || target.end;

        var howState = useState(false);
        var showHow = howState[0], setShowHow = howState[1];

        var inputRef = useRef(null);
        useEffect(function () {
            if (phase === 'playing' && inputRef.current) inputRef.current.focus();
        }, [phase]);

        // Visual feedback after each guess: a note above the guess box, and a
        // shake of the box on a wrong guess
        var last = log.length ? log[log.length - 1] : null;
        var fbState = useState(false), shaking = fbState[0], setShaking = fbState[1];
        useEffect(function () {
            if (!last || last.type !== 'bad') return;
            setShaking(true);
            var t = setTimeout(function () { setShaking(false); }, 450);
            return function () { clearTimeout(t); };
        }, [log.length]);

        var themeState = useState(window.AnatomleTheme ? window.AnatomleTheme.get() : 'light');
        useEffect(function () {
            function on(ev) { themeState[1](ev.detail); }
            window.addEventListener('anatomle-theme', on);
            return function () { window.removeEventListener('anatomle-theme', on); };
        }, []);
        var isDark = themeState[0] === 'dark';

        var things = /muscle/i.test(gameTitle) ? 'muscle' : 'bone';
        var danger = left <= 3;
        var home   = h.onHome ? h.onHome : function () { window.location.href = '../index.html'; };

        // ── NAVBAR ────────────────────────────────────────────────────────────
        var navbar = e('header', { className: 'g-nav' },
            e('div', { className: 'brand' },
                e('a', { href: '../index.html', className: 'wordmark', title: 'Back to the notes' },
                    'anatom', e('span', { className: 'le' }, 'le')),
                e('span', { className: 'mode' }, gameTitle)
            ),
            e('div', { className: 'acts' },
                window.HowToModal
                    ? e('button', { type: 'button', className: 'nb-btn', onClick: function () { setShowHow(true); } }, 'How to play')
                    : null,
                window.AnatomleTheme
                    ? e('button', { type: 'button', className: 'nb-btn theme-toggle',
                        title: isDark ? 'Light mode' : 'Dark mode',
                        'aria-label': isDark ? 'Switch to light mode' : 'Switch to dark mode',
                        onClick: function () { window.AnatomleTheme.toggle(); } }, isDark ? '\u2600' : '\u263E')
                    : null,
                e('a', { href: '../index.html', className: 'nb-btn dark' }, 'Menu')
            )
        );
        var howModal = window.HowToModal
            ? e(window.HowToModal, { show: showHow, onClose: function () { setShowHow(false); } })
            : null;

        // ── CHALLENGE BAR (above the 3D card) ─────────────────────────────────
        var challengeBar = e('div', { className: 'g-bar' },
            e('div', { className: 'ends' },
                e('span', { className: 'bone hl-green' }, target.start),
                e('span', { className: 'to' }, 'to'),
                e('span', { className: 'bone hl-pink' }, target.end)
            ),
            e('div', { className: 'counts' },
                e('div', { className: 'left' + (danger && phase === 'playing' ? ' danger' : '') },
                    e('b', null, left), left === 1 ? ' guess left' : ' guesses left'),
                phase === 'playing' && need !== null && isFinite(need)
                    ? e('div', { className: 'need ' + (spare <= 0 ? 'tight' : spare === 1 ? 'close' : ''),
                                 title: 'The fewest guesses that can still finish. If it beats your guesses left, the game ends.' },
                        e('b', null, need), ' more needed',
                        spare <= 0 ? ' \u00B7 no mistakes left' : spare === 1 ? ' \u00B7 1 mistake left' : '')
                    : null)
        );

        // ── MY ROUTE ──────────────────────────────────────────────────────────
        var step = 0;
        var chainItems = chain.map(function (item, idx) {
            var isFirst = item.bone === target.start;
            var isLast  = item.bone === target.end;
            var revealed = reviewing && phase !== 'playing' && !item.guessed && !isFirst && !isLast;
            var shown   = item.guessed || isFirst || isLast || revealed;
            var n = step++;

            var dotCls = isLast ? 'dot goal' : revealed ? 'dot reveal' : shown ? 'dot' : 'dot empty';
            var hlCls  = isLast ? 'hl-pink' : isFirst ? '' : item.guessed ? 'hl-green' : '';

            return e('div', { key: idx,
                className: 'g-row' + (shown ? ' clickable' : ' unknown'),
                onMouseEnter: function () { if (shown && window.highlight3D) window.highlight3D(item.bone, true); },
                onMouseLeave: function () { if (window.highlight3D) window.highlight3D(item.bone, false); },
                onClick:      function () { if (shown && window.boneTooltip) window.boneTooltip.openCard(item.bone); }
            },
                e('span', { className: dotCls }, shown ? n : ''),
                shown
                    ? e('span', null,
                        item.guessed && !isFirst && last && last.bone === item.bone
                            ? e('span', { className: 'nm ' + hlCls }, Pop(item.bone, 'pop' + item.bone))
                            : e('span', { className: 'nm ' + hlCls }, item.bone),
                        item.alts && item.alts.length
                            ? e('span', { className: 'alts' }, ' or ' + item.alts.join(' or '))
                            : null)
                    : e('span', null, '________'),
                isFirst ? e('span', { className: 'tag' }, 'start')
                : isLast ? e('span', { className: 'tag' }, 'goal')
                : revealed ? e('span', { className: 'tag' }, 'missed')
                : null
            );
        });

        // ── GUESS LOG: every guess in order, with what it did ────────────────
        var logItems = log.slice().reverse().map(function (g) {
            var why, cls;
            if (g.hint) { cls = 'hint'; why = 'hint (counts as a mistake)'; }
            else if (g.type === 'optimal') { cls = 'ok'; why = 'on the route'; }
            else if (g.type === 'detour') {
                cls = 'detour';
                why = 'long way (+' + g.extra + ')';
            } else {
                cls = 'bad';
                why = g.extra === null ? 'doesn\u2019t connect' : 'too far away';
            }
            return e('div', { key: g.n, className: 'g-log ' + cls + (g === last ? ' new' : '') },
                e('span', { className: 'num' }, g.n),
                e('div', { className: 'txt' },
                    e('b', null, g.bone),
                    e('span', { className: 'why' }, why)));
        });
        if (!logItems.length) logItems.push(e('div', { key: 'none', className: 'g-empty' }, 'nothing yet'));
        var mistakes = detours.length + bad.length + log.filter(function (g) { return g.hint; }).length;
        var found = chain.filter(function (c, i) { return i > 0 && i < chain.length - 1 && c.guessed; }).length;
        var slots = Math.max(chain.length - 2, 0);

        // ── FEEDBACK NOTE (latest guess) + COLOUR KEY ─────────────────────────
        var fbText, fbCls;
        if (!last) {
            fbCls = 'intro';
            fbText = 'Name a ' + things + ' that links them.';
        } else if (last.hint) {
            fbCls = 'hint';
            fbText = [e('b', { key: 'a' }, '\uD83D\uDCA1 ', Pop(last.bone, 'p')), ' is on the route'];
        } else if (last.type === 'optimal') {
            fbCls = 'ok';
            fbText = [e('b', { key: 'a' }, '\u2713 ', Pop(last.bone, 'p')), ' is on the route'];
        } else if (last.type === 'detour') {
            fbCls = 'detour';
            fbText = [e('b', { key: 'a' }, '~ ' + last.bone), ' works, but the long way'];
        } else {
            fbCls = 'bad';
            fbText = [e('b', { key: 'a' }, '\u2717 ' + last.bone), last.extra === null ? ' doesn\u2019t connect' : ' is too far away'];
        }
        if (last && phase === 'playing' && spare !== null && spare <= 0) {
            fbCls += ' warn';
            fbText = fbText.concat([e('span', { key: 'w', className: 'warnline' }, '\u26A0 No mistakes left')]);
        }
        var feedback = phase === 'playing' && !reviewing
            ? e('div', { key: 'fb' + log.length, className: 'g-feedback ' + fbCls, role: 'status', 'aria-live': 'polite' }, fbText)
            : null;

        var colourKey = reviewing
          ? e('div', { className: 'g-key', 'aria-hidden': true },
            e('span', null, e('i', { className: 'k start' }), 'start'),
            e('span', null, e('i', { className: 'k end' }), 'goal'),
            e('span', null, e('i', { className: 'k ok' }), 'you found'),
            e('span', null, e('i', { className: 'k reveal' }), 'missed'))
          : e('div', { className: 'g-key', 'aria-hidden': true },
            e('span', null, e('i', { className: 'k start' }), 'start'),
            e('span', null, e('i', { className: 'k end' }), 'goal'),
            e('span', null, e('i', { className: 'k ok' }), 'on route'),
            e('span', null, e('i', { className: 'k detour' }), 'long way'),
            e('span', null, e('i', { className: 'k bad' }), 'wrong'));

        // ── SEARCH BAR ────────────────────────────────────────────────────────
        var dropdown = suggestions.length > 0
            ? e('div', { className: 'g-drop nb-scroll', role: 'listbox' },
                suggestions.map(function (sug, i) {
                    return e('div', { key: sug, role: 'option', 'aria-selected': i === selIdx,
                        className: 'g-sug' + (i === selIdx ? ' sel' : ''),
                        onMouseDown: function (ev) { ev.preventDefault(); },
                        onClick: function () { h.onSubmit(sug); }
                    }, sug);
                }))
            : null;

        var searchBar = e('div', { className: 'g-search g-ask' + (log.length === 0 && phase === 'playing' ? ' fresh' : '') },
            e('div', { className: 'ask-head' },
                e('span', { className: 'ask-t' }, phase === 'playing' ? 'Your guess' : 'Game over'),
                phase === 'playing' ? e('span', { className: 'ask-k' }, 'Enter \u21B5') : null),
            e('label', { className: 'g-field' + (input && suggestions.length === 0 ? ' err' : '') + (shaking ? ' shake' : '') },
                dropdown,
                e('input', {
                    ref: inputRef, value: input,
                    onChange: h.onInputChange,
                    onKeyDown: h.onKeyDown,
                    disabled: phase !== 'playing',
                    'aria-label': 'Your guess',
                    autoComplete: 'off', spellCheck: false,
                    placeholder: phase === 'playing'
                        ? 'Type a ' + things + '…'
                        : 'Game over'
                })
            )
        );

        // ── PANEL BUTTONS ─────────────────────────────────────────────────────
        var hintBtn = h.onHint
            ? e('button', {
                type: 'button', className: 'nb-btn wide',
                onClick: h.onHint,
                disabled: hintUsed || phase !== 'playing'
              }, hintUsed ? '⚡ Hint used' : '⚡ Nerve hint')
            : null;

        var clueBtn = h.onClue
            ? e('button', {
                type: 'button', className: 'nb-btn wide',
                onClick: h.onClue, disabled: phase !== 'playing',
                title: 'Fills in the next ' + things + '. Uses a guess and counts as a mistake.'
              }, '\uD83D\uDCA1 Hint', e('span', { className: 'btn-sub' }, '\u2212 counts as a mistake'))
            : null;

        var mainBtn = e('button', {
            type: 'button',
            className: 'nb-btn wide big ' + (phase === 'playing' ? '' : 'hl-btn'),
            onClick: reviewing ? h.onStopReview : phase === 'playing' ? h.onGiveUp : h.onNewGame ? h.onNewGame : h.onStopReview
        }, reviewing ? 'Results' : phase === 'playing' ? 'Give up' : h.onNewGame ? 'Next puzzle →' : 'Results');

        var rightPanel = e('aside', { className: 'g-panel' },
            reviewing ? null : e('div', { className: 'g-guess' }, searchBar, feedback),
            e('div', { className: 'g-route' },
                e('span', { className: 'tape pink' }),
                e('div', { className: 'g-head' },
                    e('span', { className: 't' }, reviewing ? 'the shortest route' : 'the route'),
                    e('span', { className: 'n' }, found + '/' + slots)
                ),
                e('div', { className: 'g-list nb-scroll' }, chainItems)
            ),
            e('div', { className: 'g-notes' },
                e('div', { className: 'g-head' },
                    e('span', { className: 't' }, 'guesses'),
                    e('span', { className: 'n' + (mistakes ? ' warn' : '') },
                        log.length ? (mistakes ? mistakes + ' mistake' + (mistakes === 1 ? '' : 's') : 'no mistakes') : '')
                ),
                e('div', { className: 'g-chipwrap nb-scroll' }, logItems)
            ),
            reviewing
                ? e('div', { className: 'g-btns' },
                    e('button', { type: 'button', className: 'nb-btn wide big hl-btn', onClick: h.onStopReview }, '\u2190 Back to results'))
                : e('div', { className: 'g-btns' }, clueBtn, hintBtn, mainBtn)
        );

        // ── END OVERLAY ───────────────────────────────────────────────────────
        var overlay = null;
        if (phase !== 'playing' && !reviewing) {
            var won = phase === 'won';
            var optimal = target.path.length - 2;
            var stars = grade ? grade.stars : won ? (guessesUsed - optimal === 0 ? 3 : guessesUsed - optimal <= 2 ? 2 : 1) : 0;
            var label = grade ? grade.label : won ? 'Made it' : 'Out of guesses';
            var hlCls = !won ? 'hl-pink' : stars >= 3 ? 'hl-green' : 'hl';

            var streakBlock = null;
            if (streak) {
                var count = streak.count || 0;
                var lit   = won && count > 0;
                var isNew = streak.isNew && won;
                streakBlock = e('div', { className: 'g-streak', style: { animation: isNew ? 'streakPop .6s cubic-bezier(.34,1.56,.64,1) .3s both' : 'none' } },
                    e('span', { style: { fontSize: 26, lineHeight: 1, filter: lit ? 'none' : 'grayscale(1)', opacity: lit ? 1 : .45,
                        animation: lit ? 'flameDance 1.2s ease-in-out infinite' : 'none' } }, '🔥'),
                    e('div', null,
                        e('div', { className: 'num' }, count + ' day streak'),
                        e('div', { className: 'sub' }, lit ? (isNew ? 'Keep it going!' : 'Already counted today') : 'Play tomorrow to start a new streak')
                    )
                );
            }

            overlay = e('div', { className: 'g-over' },
                e('div', { className: 'g-card', role: 'dialog', 'aria-label': label },
                    e('span', { className: 'tape' + (won ? '' : ' pink') }),
                    e('div', { className: 'emoji' }, grade ? grade.emoji : won ? '🏆' : '💣'),
                    e('h2', null, e('span', { className: hlCls }, label)),
                    e('div', { className: 'stars', 'aria-label': stars + ' of 3 stars' },
                        [0, 1, 2].map(function (i) {
                            return e('span', { key: i, style: { opacity: i < stars ? 1 : .2, filter: i < stars ? 'none' : 'grayscale(1)' } }, '⭐');
                        })),
                    e('p', { className: 'detail' },
                        grade ? grade.detail
                        : won ? plural(guessesUsed, 'guess') + ', best possible is ' + optimal
                        : bad.length + ' wrong · ' + guessesUsed + ' total'),
                    log.length ? e('div', { className: 'g-trail' },
                        log.map(function (g) {
                            return e('span', { key: g.n, className: 'chip ' + (g.hint ? 'hint' : g.type === 'optimal' ? 'ok' : g.type) }, g.n + '. ' + g.bone);
                        })) : null,
                    streakBlock,
                    e('div', { className: 'route' },
                        e('span', { className: 'hl-green' }, target.start),
                        e('span', { className: 'to' }, '→'),
                        e('span', { className: 'hl-pink' }, target.end)),
                    e('div', { className: 'row' },
                        phase === 'lost'
                            ? e('button', { type: 'button', className: 'nb-btn', onClick: h.onReveal }, '👁 Show answer')
                            : e('button', { type: 'button', className: 'nb-btn', onClick: h.onReview }, '👁 See route')
                    ),
                    h.onShare
                        ? e('div', { style: { marginBottom: 12 } },
                            gridText ? e('div', { className: 'g-grid' }, gridText) : null,
                            e('button', { type: 'button', className: 'nb-btn wide ' + (shared ? 'green' : ''), onClick: h.onShare },
                                shared ? '✓ Copied' : '📋 Share'))
                        : null,
                    e('div', { className: 'row' },
                        h.onNewGame
                            ? e('button', { type: 'button', className: 'nb-btn big hl-btn', onClick: h.onNewGame }, 'Next puzzle →')
                            : null,
                        e('button', { type: 'button', className: 'nb-btn big ' + (h.onNewGame ? '' : 'dark'), onClick: home },
                            h.onNewGame ? 'Menu' : '← Menu')
                    )
                )
            );
        }

        return e(React.Fragment, null,
            navbar, challengeBar, colourKey, rightPanel,
            overlay, howModal);
    }

    window.PathfindingUI = PathfindingUI;
})();
