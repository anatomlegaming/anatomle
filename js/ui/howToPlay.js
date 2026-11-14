// ============================================================================
// ANATOMLE — HOW TO PLAY (styles in css/notebook.css, .htp-*)
// Pure React.createElement — no JSX, loads as plain <script> tag
//
// window.HowToModal     — modal, pass show + onClose (+ optional kind: 'muscle')
// window.HowToContent   — the tutorial body
// window.useFirstVisit  — hook: returns [show, dismiss], remembers in localStorage
// window.HowToIcon      — small "How to play" button that opens the modal
// ============================================================================
(function () {
    var e        = React.createElement;
    var useState = React.useState;

    // v2: the tutorial was rewritten, so everyone sees it once more
    function useFirstVisit(gameKey) {
        var key  = 'anatomle_htp2_' + gameKey;
        var seen = false;
        try { seen = !!localStorage.getItem(key); } catch (_) {}
        var pair = useState(!seen);
        function dismiss() {
            try { localStorage.setItem(key, '1'); } catch (_) {}
            pair[1](false);
        }
        return [pair[0], dismiss];
    }

    function guessKind() {
        return /muscle/i.test(document.title) ? 'muscle' : 'bone';
    }

    function Step(props) {
        return e('div', { className: 'htp-step' },
            e('div', { className: 'htp-num' }, props.n),
            e('div', { className: 'htp-body' },
                e('h3', null, props.title),
                props.children));
    }

    function HowToContent(props) {
        var kind  = props.kind || guessKind();
        var muscle = kind === 'muscle';
        var a = muscle ? 'Biceps Brachii' : 'Clavicle';
        var b = muscle ? 'Triceps Brachii' : 'Radius';
        var mids = muscle ? ['Brachialis'] : ['Scapula', 'Humerus'];
        var things = muscle ? 'muscles' : 'bones';
        var link = muscle ? 'Muscles link if they attach to the same bone.'
                          : 'Bones link if they meet at a joint.';

        return e('div', { className: 'htp' },
            e('span', { className: 'tape pink', style: { top: -13, left: 40, transform: 'rotate(-3deg)' } }),
            e('div', { className: 'htp-head' },
                e('div', null,
                    e('h2', null, 'How to ', e('span', { className: 'hl-pink' }, 'play')),
                    e('div', { className: 'hand' }, 'one guess at a time')),
                e('button', { type: 'button', className: 'nb-btn htp-x', onClick: props.onClose, 'aria-label': 'Close' }, '×')),

            e('div', { className: 'htp-steps' },
                e(Step, { n: 1, title: 'Get from start to goal' },
                    e('div', { className: 'htp-demo' },
                        e('span', { className: 'hl-green' }, a), e('span', { className: 'hand to' }, ' to '),
                        e('span', { className: 'hl-pink' }, b)),
                    e('p', null, link)),

                e(Step, { n: 2, title: 'Guess the ' + things + ' in between' },
                    e('ul', { className: 'htp-key' },
                        e('li', null, e('i', { className: 'k ok' }), e('b', null, 'Green'), ' on the route'),
                        e('li', null, e('i', { className: 'k detour' }), e('b', null, 'Yellow'), ' works, but the long way'),
                        e('li', null, e('i', { className: 'k bad' }), e('b', null, 'Red'), ' wrong')),
                    e('p', { className: 'htp-note' }, 'Stuck? \uD83D\uDCA1 Hint shows the first letters of the next one. Each hint counts as a mistake. (Not in the Daily.)'),
                    e('p', { className: 'htp-warn' }, 'Every guess counts. If the ', e('b', null, 'more needed'),
                        ' count goes above your guesses left, the game ends.')),

                e(Step, { n: 3, title: 'Link them all up' },
                    e('div', { className: 'htp-demo chain' },
                        [a].concat(mids).concat([b]).map(function (x, i, arr) {
                            var cls = i === arr.length - 1 ? 'hl-pink' : 'hl-green';
                            return e('span', { key: x }, e('span', { className: cls }, x), i < arr.length - 1 ? e('span', { className: 'arrow' }, ' → ') : null);
                        })),
                    e('ul', { className: 'htp-grades' },
                        e('li', null, '🏆 ', e('b', null, 'Perfect'), ': no mistakes, in order'),
                        e('li', null, '🥇 ', e('b', null, 'Great'), ': no mistakes'),
                        e('li', null, '🥈 ', e('b', null, 'Nice'), ': 1 or 2 mistakes'),
                        e('li', null, '✓ ', e('b', null, 'Made it'), ': got there')))
            ),

            e('div', { className: 'htp-foot' },
                e('span', { className: 'hand' }, 'tip: click a coloured ' + kind + ' to learn about it'),
                e('button', { type: 'button', className: 'nb-btn big hl-btn', onClick: props.onClose }, 'Let’s play →'))
        );
    }

    function HowToModal(props) {
        if (!props.show) return null;
        return e('div', {
            className: 'htp-wrap',
            onClick: function (ev) { if (ev.target === ev.currentTarget) props.onClose(); }
        }, e(HowToContent, { onClose: props.onClose, kind: props.kind }));
    }

    function HowToIcon(props) {
        var st = useState(false);
        return e(React.Fragment, null,
            e('button', { type: 'button', className: 'nb-btn', onClick: function () { st[1](true); } }, 'How to play'),
            e(HowToModal, { show: st[0], kind: props && props.kind, onClose: function () { st[1](false); } }));
    }

    window.HowToIcon     = HowToIcon;
    window.HowToModal    = HowToModal;
    window.HowToContent  = HowToContent;
    window.useFirstVisit = useFirstVisit;
})();
