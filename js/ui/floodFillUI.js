// ============================================================================
// ANATOMLE - FLOOD FILL UI TEMPLATE
// ============================================================================
// Rewritten with React.createElement (no JSX) so it works as a plain <script>
// tag without needing Babel to process it.
// ============================================================================

(function() {
    var useRef    = React.useRef;
    var useEffect = React.useEffect;
    var e         = React.createElement;

    function secHead(label, count, color) {
        return e('div', { style: { padding:'9px 14px 6px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 } },
            e('span', { style: { fontSize:8, color:color, textTransform:'uppercase', letterSpacing:'0.25em', fontWeight:700 } }, label),
            e('span', { style: { fontSize:10, color:color, fontWeight:700 } }, count)
        );
    }

    function FloodFillUI(props) {
        var gameTitle   = props.gameTitle;
        var accentColor = props.accentColor;
        var state       = props.state;
        var handlers    = props.handlers;

        var start       = state.start;
        var total       = state.total;
        var guessed     = state.guessed;
        var bad         = state.bad;
        var left        = state.left;
        var max         = state.max;
        var input       = state.input;
        var selIdx      = state.selIdx;
        var phase       = state.phase;
        var reveal      = state.reveal;
        var suggestions = state.suggestions;

        var onInputChange = handlers.onInputChange;
        var onKeyDown     = handlers.onKeyDown;
        var onSubmit      = handlers.onSubmit;
        var onNewGame     = handlers.onNewGame;
        var onReveal      = handlers.onReveal;

        var inputRef = useRef(null);
        useEffect(function() {
            if (phase === 'playing' && inputRef.current) inputRef.current.focus();
        }, [phase]);

        var NAV_H = 56, BAR_H = 48, SRCH_H = 64, PANEL_W = 280;
        var pct = Math.round((guessed.size / total) * 100);
        var foundList = Array.from(guessed).filter(function(b) { return b !== start; });

        // ── NAVBAR ───────────────────────────────────────────────────────
        var navbar = e('div', {
            style: { position:'fixed', top:0, left:0, right:0, height:NAV_H, zIndex:200,
                background:'rgba(10,15,30,0.98)', borderBottom:'1px solid #1e293b',
                display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px' }
        },
            e('div', { style: { display:'flex', alignItems:'center', gap:14 } },
                e('h1', { style: { fontSize:22, fontWeight:900, color:'white', margin:0, letterSpacing:'-0.05em', textTransform:'uppercase' } }, 'Anatomle'),
                e('span', { style: { fontSize:9, color:accentColor, letterSpacing:'0.3em', textTransform:'uppercase', opacity:0.9 } }, gameTitle)
            ),
            e('div', { style: { display:'flex', alignItems:'center', gap:20 } },
                e('span', { style: { fontSize:10, color:'#94a3b8' } }, guessed.size + '/' + total + ' found'),
                e('a', { href:'../index.html', style: { fontSize:9, color:'#64748b', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.2em' } }, '\u2190 Menu')
            )
        );

        // ── CHALLENGE BAR ────────────────────────────────────────────────
        var progressBar = e('div', { style: { width:90, height:5, background:'#1e293b', borderRadius:3, overflow:'hidden' } },
            e('div', { style: { width: pct + '%', height:'100%', background: pct === 100 ? '#10b981' : accentColor, transition:'width .4s' } })
        );

        var challengeBar = e('div', {
            style: { position:'fixed', top:NAV_H, left:0, right:PANEL_W, height:BAR_H, zIndex:100,
                background:'rgba(10,15,30,0.92)', borderBottom:'1px solid #1e293b',
                display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 18px' }
        },
            e('span', { style: { fontSize:10, color:'#94a3b8' } },
                'Start: ',
                e('span', { style: { color:'#34d399', fontWeight:700 } }, start),
                ' \u00B7 Name any bone ',
                e('span', { style: { color:'#60a5fa', fontWeight:600 } }, 'touching'),
                ' a found bone'
            ),
            e('div', { style: { display:'flex', alignItems:'center', gap:10 } },
                progressBar,
                e('span', { style: { fontSize:10, fontWeight:700, color: left < 5 ? '#f87171' : '#34d399' } }, left + ' guesses')
            )
        );

        // ── RIGHT PANEL ──────────────────────────────────────────────────

        // Start bone row
        var startRow = e('div', {
            style: { padding:'5px 9px', marginBottom:3, background:'rgba(16,185,129,0.12)',
                border:'1px solid rgba(16,185,129,0.3)', borderRadius:3, fontSize:9, color:'#34d399',
                fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em',
                display:'flex', justifyContent:'space-between' }
        },
            e('span', null, start),
            e('span', null, '\uD83D\uDCCD')
        );

        var foundItems = foundList.map(function(b) {
            return e('div', { key:b, style: { padding:'5px 9px', marginBottom:3, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:3, fontSize:9, color:'#93c5fd', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' } }, b);
        });

        var badItems = bad.length === 0
            ? [e('div', { key:'none', style: { fontSize:9, color:'#1e293b', textAlign:'center', marginTop:6 } }, 'None yet')]
            : bad.map(function(b) {
                return e('div', { key:b, className:'shake', style: { padding:'5px 9px', marginBottom:3, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:3, fontSize:9, color:'#fca5a5', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' } }, b);
            });

        var rightPanel = e('div', {
            style: { position:'fixed', top:NAV_H, right:0, width:PANEL_W, bottom:0, zIndex:100,
                background:'rgba(10,15,30,0.98)', borderLeft:'1px solid #1e293b', display:'flex', flexDirection:'column' }
        },
            // Correct / Found section
            e('div', { style: { flex:'1 1 0', overflow:'hidden', display:'flex', flexDirection:'column', borderBottom:'1px solid #1e293b' } },
                secHead('\u2713 Correct', guessed.size, '#34d399'),
                e('div', { className:'scr', style: { overflowY:'auto', flex:1, padding:'0 12px 10px' } },
                    startRow,
                    foundItems
                )
            ),
            // Failed / Not adjacent section
            e('div', { style: { flex:'0 0 auto', maxHeight:'38%', overflow:'hidden', display:'flex', flexDirection:'column', borderBottom:'1px solid #1e293b' } },
                secHead('\u2717 Not Adjacent', bad.length, '#f87171'),
                e('div', { className:'scr', style: { overflowY:'auto', flex:1, padding:'0 12px 10px' } }, badItems)
            ),
            // New game button
            e('div', { style: { padding:12, flexShrink:0 } },
                e('button', {
                    onClick: onNewGame,
                    style: { width:'100%', padding:'11px 0', background:'white', color:'black', border:'none',
                        fontFamily:'EB Garamond,serif', fontWeight:900, fontSize:10, textTransform:'uppercase',
                        letterSpacing:'0.2em', cursor:'pointer' }
                }, 'New Game')
            )
        );

        // ── SEARCH BAR ───────────────────────────────────────────────────
        var suggestionDropdown = suggestions.length > 0
            ? e('div', {
                style: { position:'absolute', bottom:'100%', left:0, right:0, background:'#0f172a',
                    border:'1px solid #334155', borderBottom:'none', zIndex:300, maxHeight:280, overflowY:'auto' }
              },
                suggestions.map(function(s, i) {
                    return e('div', {
                        key: s,
                        onClick: function() { onSubmit(s); },
                        style: { padding:'10px 14px', fontSize:10, fontWeight:700, textTransform:'uppercase',
                            letterSpacing:'0.08em', cursor:'pointer',
                            color: i === selIdx ? 'white' : '#94a3b8',
                            background: i === selIdx ? accentColor : 'transparent',
                            borderBottom:'1px solid #1e293b', transition:'background .1s' }
                    }, s);
                })
              )
            : null;

        var searchBar = e('div', {
            style: { position:'fixed', bottom:0, left:0, right:PANEL_W, height:SRCH_H, zIndex:150,
                background:'rgba(10,15,30,0.98)', borderTop:'1px solid #1e293b',
                padding:'10px 14px', display:'flex', alignItems:'center' }
        },
            e('div', { style: { flex:1, position:'relative' } },
                suggestionDropdown,
                e('input', {
                    ref: inputRef,
                    value: input,
                    onChange: onInputChange,
                    onKeyDown: onKeyDown,
                    disabled: phase !== 'playing',
                    placeholder: phase === 'playing' ? 'Type to search, then select from list above \u2191' : 'Game over \u2014 click New Game',
                    style: { width:'100%', background:'#1e293b', padding:'10px 14px',
                        color:'white', fontFamily:'EB Garamond,serif', fontSize:11, fontStyle:'italic', outline:'none',
                        border: '1px solid ' + (input && suggestions.length === 0 ? '#ef4444' : '#334155') }
                })
            )
        );

        // ── END OVERLAY ──────────────────────────────────────────────────
        var overlay = (phase !== 'playing' && !reveal)
            ? e('div', {
                style: { position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'center',
                    justifyContent:'center', backdropFilter:'blur(18px)' },
                className: phase === 'won' ? 'win-bg' : 'loss-bg'
              },
                e('div', {
                    style: { textAlign:'center', padding:48, background:'rgba(10,15,30,0.95)',
                        border:'1px solid rgba(255,255,255,0.07)', borderRadius:24, maxWidth:420 }
                },
                    e('h2', { style: { fontSize:46, fontWeight:900, color:'white', margin:'0 0 8px', letterSpacing:'-0.05em', textTransform:'uppercase' } },
                        phase === 'won' ? '\u2713 Complete!' : '\u2717 Incomplete'
                    ),
                    e('p', { style: { color:'#94a3b8', fontSize:14, marginBottom:24 } },
                        phase === 'won'
                            ? 'All ' + total + ' bones identified! ' + (max - left) + ' guesses used.'
                            : 'Found ' + guessed.size + '/' + total + ' bones. ' + bad.length + ' non-adjacent guess' + (bad.length !== 1 ? 'es' : '') + '.'
                    ),
                    phase === 'lost'
                        ? e('div', { style: { marginBottom:20 } },
                            e('button', {
                                onClick: onReveal,
                                style: { padding:'10px 22px', background:'#a855f7', color:'white', border:'none',
                                    fontWeight:900, fontSize:10, textTransform:'uppercase', cursor:'pointer',
                                    letterSpacing:'0.15em', fontFamily:'EB Garamond,serif' }
                            }, '\uD83D\uDC41 Reveal Missing')
                          )
                        : null,
                    e('div', { style: { display:'flex', gap:12, justifyContent:'center' } },
                        e('button', {
                            onClick: onNewGame,
                            style: { padding:'13px 32px', background:'white', color:'black', border:'none',
                                fontWeight:900, fontSize:10, textTransform:'uppercase', letterSpacing:'0.15em',
                                cursor:'pointer', fontFamily:'EB Garamond,serif' }
                        }, 'Play Again'),
                        e('a', {
                            href:'../index.html',
                            style: { padding:'13px 32px', background:'#1e293b', color:'white', fontWeight:900,
                                fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em',
                                textDecoration:'none', display:'flex', alignItems:'center', fontFamily:'EB Garamond,serif' }
                        }, 'Menu')
                    )
                )
              )
            : null;

        return e(React.Fragment, null, navbar, challengeBar, rightPanel, searchBar, overlay);
    }

    window.FloodFillUI = FloodFillUI;
})();
