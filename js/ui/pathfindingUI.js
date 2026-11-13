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
        var goal        = s.goal   || target.end;
        var guessNo = {}; log.forEach(function (g) { guessNo[g.bone] = g.n; });

        var howState = useState(false);
        var showHow = howState[0], setShowHow = howState[1];

        var inputRef = useRef(null);
        useEffect(function () {
            if (phase === 'playing' && inputRef.current) inputRef.current.focus();
        }, [phase]);

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
            e('div', { className: 'left' + (danger && phase === 'playing' ? ' danger' : '') },
                e('b', null, left), left === 1 ? ' guess left' : ' guesses left')
        );

        // ── MY ROUTE ──────────────────────────────────────────────────────────
        var step = 0;
        var chainItems = chain.map(function (item, idx) {
            var isFirst = item.bone === target.start;
            var isLast  = item.bone === target.end;
            var revealed = reveal && phase === 'lost' && !item.guessed && !isFirst && !isLast;
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
                        e('span', { className: 'nm ' + hlCls }, item.bone),
                        item.alts && item.alts.length
                            ? e('span', { className: 'alts' }, ' or ' + item.alts.join(' or '))
                            : null)
                    : e('span', null, '________'),
                isFirst ? e('span', { className: 'tag' }, 'start')
                : isLast ? e('span', { className: 'tag' }, 'goal')
                : revealed ? e('span', { className: 'tag' }, 'answer')
                : item.guessed && guessNo[item.bone] ? e('span', { className: 'tag' }, 'guess ' + guessNo[item.bone])
                : null
            );
        });

        // ── GUESS LOG: every guess in order, with what it did ────────────────
        var logItems = log.slice().reverse().map(function (g) {
            var why, cls;
            if (g.type === 'optimal') { cls = 'ok'; why = 'on the shortest route'; }
            else if (g.type === 'detour') {
                cls = 'detour';
                why = 'connects, but adds ' + g.extra + ' step' + (g.extra === 1 ? '' : 's') + (g.onRoute ? ' (used)' : '');
            } else {
                cls = 'bad';
                why = g.extra === null ? 'not linked to this route'
                    : 'too far off course to reach ' + goal + ' in time';
            }
            return e('div', { key: g.n, className: 'g-log ' + cls + (g.type === 'bad' ? ' shake' : '') },
                e('span', { className: 'num' }, g.n),
                e('div', { className: 'txt' },
                    e('b', null, g.bone),
                    e('span', { className: 'why' }, why)));
        });
        if (!logItems.length) logItems.push(e('div', { key: 'none', className: 'g-empty' }, 'your guesses show up here'));
        var mistakes = detours.length + bad.length;

        // ── PANEL BUTTONS ─────────────────────────────────────────────────────
        var hintBtn = h.onHint
            ? e('button', {
                type: 'button', className: 'nb-btn wide',
                onClick: h.onHint,
                disabled: hintUsed || phase !== 'playing'
              }, hintUsed ? '⚡ Hint used' : '⚡ Nerve hint')
            : null;

        var mainBtn = e('button', {
            type: 'button',
            className: 'nb-btn wide big ' + (phase === 'playing' ? '' : 'hl-btn'),
            onClick: reviewing ? h.onStopReview : phase === 'playing' ? h.onGiveUp : h.onNewGame ? h.onNewGame : h.onStopReview
        }, reviewing ? 'Results' : phase === 'playing' ? 'Give up' : h.onNewGame ? 'Next puzzle →' : 'Results');

        var rightPanel = e('aside', { className: 'g-panel' },
            e('div', { className: 'g-route' },
                e('span', { className: 'tape pink' }),
                e('div', { className: 'g-head' },
                    e('span', { className: 't' }, 'my route'),
                    e('span', { className: 'n' }, plural(guessesUsed, 'guess') + ' used')
                ),
                e('div', { className: 'g-list nb-scroll' }, chainItems)
            ),
            e('div', { className: 'g-notes' },
                e('div', { className: 'g-head' },
                    e('span', { className: 't' }, 'my guesses'),
                    e('span', { className: 'n' + (mistakes ? ' warn' : '') },
                        log.length ? (mistakes ? mistakes + ' mistake' + (mistakes === 1 ? '' : 's') : 'no mistakes') : '')
                ),
                e('div', { className: 'g-chipwrap nb-scroll' }, logItems)
            ),
            e('div', { className: 'g-btns' }, hintBtn, mainBtn)
        );

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

        var searchBar = e('div', { className: 'g-search' },
            e('label', { className: 'g-field' + (input && suggestions.length === 0 ? ' err' : '') },
                dropdown,
                e('span', { className: 'lbl' }, 'next:'),
                e('input', {
                    ref: inputRef, value: input,
                    onChange: h.onInputChange,
                    onKeyDown: h.onKeyDown,
                    disabled: phase !== 'playing',
                    'aria-label': 'Your guess',
                    autoComplete: 'off', spellCheck: false,
                    placeholder: phase === 'playing'
                        ? 'type a name that connects…'
                        : (h.onNewGame ? 'game over, hit Next puzzle →' : 'game over, tap Results to review')
                })
            )
        );

        // ── END OVERLAY ───────────────────────────────────────────────────────
        var overlay = null;
        if (phase !== 'playing' && !reveal && !reviewing) {
            var won = phase === 'won';
            var optimal = target.path.length - 2;
            var stars = grade ? grade.stars : won ? (guessesUsed - optimal === 0 ? 3 : guessesUsed - optimal <= 2 ? 2 : 1) : 0;
            var label = grade ? grade.label : won ? 'Path found!' : 'Flatline.';
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
                            return e('span', { key: g.n, className: 'chip ' + (g.type === 'optimal' ? 'ok' : g.type) }, g.n + '. ' + g.bone);
                        })) : null,
                    streakBlock,
                    e('div', { className: 'route' },
                        e('span', { className: 'hl-green' }, target.start),
                        e('span', { className: 'to' }, '→'),
                        e('span', { className: 'hl-pink' }, target.end)),
                    e('div', { className: 'row' },
                        phase === 'lost'
                            ? e('button', { type: 'button', className: 'nb-btn', onClick: h.onReveal }, '👁 Show the route')
                            : e('button', { type: 'button', className: 'nb-btn', onClick: h.onReview }, '👁 Review my route')
                    ),
                    h.onShare
                        ? e('div', { style: { marginBottom: 12 } },
                            gridText ? e('div', { className: 'g-grid' }, gridText) : null,
                            e('button', { type: 'button', className: 'nb-btn wide ' + (shared ? 'green' : ''), onClick: h.onShare },
                                shared ? '✓ Copied, go brag' : '📋 Copy & share'))
                        : null,
                    e('div', { className: 'row' },
                        h.onNewGame
                            ? e('button', { type: 'button', className: 'nb-btn big hl-btn', onClick: h.onNewGame }, 'Next puzzle →')
                            : null,
                        e('button', { type: 'button', className: 'nb-btn big ' + (h.onNewGame ? '' : 'dark'), onClick: home },
                            h.onNewGame ? 'Menu' : '← Back to the notes')
                    )
                )
            );
        }

        // ── REVIEW BANNER ─────────────────────────────────────────────────────
        var reviewBar = reviewing
            ? e('div', { className: 'g-review' },
                e('span', { className: 'hand' }, 'reviewing your route'),
                e('button', { type: 'button', className: 'nb-btn dark', onClick: h.onStopReview }, 'Back to results'))
            : null;

        return e(React.Fragment, null,
            navbar, challengeBar, rightPanel,
            reviewing ? reviewBar : searchBar,
            overlay, howModal);
    }

    window.PathfindingUI = PathfindingUI;
})();
