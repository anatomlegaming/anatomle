// ============================================================================
// ANATOMLE - PATHFINDING UI TEMPLATE
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

    function PathfindingUI(props) {
        var gameTitle   = props.gameTitle;
        var accentColor = props.accentColor;
        var state       = props.state;
        var handlers    = props.handlers;

        var target      = state.target;
        var chain       = state.chain;
        var left        = state.left;
        var max         = state.max;
        var bad         = state.bad;
        var detours     = state.detours;
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
        var guessedPath = chain.filter(function(c) { return c.guessed; });

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
                e('span', { style: { fontSize:10, fontWeight:700, color: left < 4 ? '#f87171' : '#34d399' } }, left + ' guesses left'),
                e('a', { href:'../index.html', style: { fontSize:9, color:'#64748b', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.2em' } }, '\u2190 Menu')
            )
        );

        // ── CHALLENGE BAR ────────────────────────────────────────────────
        var challengeBar = e('div', {
            style: { position:'fixed', top:NAV_H, left:0, right:PANEL_W, height:BAR_H, zIndex:100,
                background:'rgba(10,15,30,0.92)', borderBottom:'1px solid #1e293b',
                display:'flex', alignItems:'center', padding:'0 18px', gap:6 }
        },
            e('span', { style: { color:'#34d399', fontWeight:700, fontSize:10 } }, target.start),
            e('span', { style: { color:'#334155', fontSize:10, margin:'0 4px' } }, '\u2192\u2192\u2192'),
            e('span', { style: { color:'#f59e0b', fontWeight:700, fontSize:10 } }, target.end),
            e('span', { style: { color:'#475569', fontSize:9, marginLeft:8 } }, 'Find the connecting path')
        );

        // ── RIGHT PANEL ──────────────────────────────────────────────────

        var pathItems = chain.map(function(item, idx) {
            var isLast = item.bone === target.end;
            var shown  = item.guessed || isLast || (reveal && phase === 'lost');
            var bg     = isLast ? 'rgba(245,158,11,0.1)' : item.guessed ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)';
            var border = '1px solid ' + (isLast ? 'rgba(245,158,11,0.3)' : item.guessed ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)');
            var color  = item.type === 'start' ? '#34d399' : isLast ? '#fbbf24' : item.guessed ? '#93c5fd' : '#334155';
            var icon   = item.type === 'start' ? '\uD83D\uDCCD' : isLast ? '\uD83C\uDFAF' : item.guessed ? '\uD83E\uDDEC' : '\u00B7';
            return e('div', {
                key: idx,
                style: { padding:'5px 9px', marginBottom:3, borderRadius:3, fontSize:9, fontWeight:700,
                    textTransform:'uppercase', letterSpacing:'0.04em', display:'flex', justifyContent:'space-between',
                    opacity: shown ? 1 : 0.2, background: bg, border: border, color: color }
            },
                e('span', null, shown ? item.bone : '???'),
                e('span', null, icon)
            );
        });

        var detourItems = detours.length === 0
            ? [e('div', { key:'none', style: { fontSize:9, color:'#1e293b', textAlign:'center', marginTop:4 } }, 'None yet')]
            : detours.map(function(b) {
                return e('div', { key:b, style: { padding:'5px 9px', marginBottom:3, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.25)', borderRadius:3, fontSize:9, color:'#fdba74', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' } }, b);
            });

        var badItems = bad.length === 0
            ? [e('div', { key:'none', style: { fontSize:9, color:'#1e293b', textAlign:'center', marginTop:4 } }, 'None yet')]
            : bad.map(function(b) {
                return e('div', { key:b, className:'shake', style: { padding:'5px 9px', marginBottom:3, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:3, fontSize:9, color:'#fca5a5', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' } }, b);
            });

        var rightPanel = e('div', {
            style: { position:'fixed', top:NAV_H, right:0, width:PANEL_W, bottom:0, zIndex:100,
                background:'rgba(10,15,30,0.98)', borderLeft:'1px solid #1e293b', display:'flex', flexDirection:'column' }
        },
            e('div', { style: { flex:'1 1 0', overflow:'hidden', display:'flex', flexDirection:'column', borderBottom:'1px solid #1e293b' } },
                secHead('\u2713 Path Bones', guessedPath.length, '#34d399'),
                e('div', { className:'scr', style: { overflowY:'auto', flex:1, padding:'0 12px 10px' } }, pathItems)
            ),
            e('div', { style: { flex:'0 0 auto', maxHeight:'28%', overflow:'hidden', display:'flex', flexDirection:'column', borderBottom:'1px solid #1e293b' } },
                secHead('\u26A0 Suboptimal', detours.length, '#fb923c'),
                e('div', { className:'scr', style: { overflowY:'auto', flex:1, padding:'0 12px 8px' } }, detourItems)
            ),
            e('div', { style: { flex:'0 0 auto', maxHeight:'25%', overflow:'hidden', display:'flex', flexDirection:'column', borderBottom:'1px solid #1e293b' } },
                secHead('\u2717 Failed', bad.length, '#f87171'),
                e('div', { className:'scr', style: { overflowY:'auto', flex:1, padding:'0 12px 8px' } }, badItems)
            ),
            e('div', { style: { padding:12, flexShrink:0 } },
                e('button', {
                    onClick: onNewGame,
                    style: { width:'100%', padding:'11px 0', background:'white', color:'black', border:'none',
                        fontFamily:'EB Garamond,serif', fontWeight:900, fontSize:10, textTransform:'uppercase',
                        letterSpacing:'0.2em', cursor:'pointer' }
                }, 'Next Case')
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
                            background: i === selIdx ? '#1d4ed8' : 'transparent',
                            borderBottom:'1px solid #1e293b' }
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
                    placeholder: phase === 'playing' ? 'Type a bone name, then select from list above \u2191' : 'Game over \u2014 click Next Case',
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
                    e('h2', { style: { fontSize:42, fontWeight:900, color:'white', margin:'0 0 8px', letterSpacing:'-0.05em', textTransform:'uppercase' } },
                        phase === 'won' ? (detours.length === 0 ? '\u2713 Perfect Path' : '\u2713 Path Found') : '\u2717 Flatline'
                    ),
                    e('p', { style: { color:'#94a3b8', fontSize:14, marginBottom:24 } },
                        phase === 'won'
                            ? (detours.length === 0
                                ? 'Optimal route! ' + (max - left) + '/' + max + ' guesses.'
                                : 'Path via ' + detours.length + ' detour' + (detours.length !== 1 ? 's' : '') + '. ' + (max - left) + '/' + max + ' guesses.')
                            : 'Path not found. ' + bad.length + ' failed attempt' + (bad.length !== 1 ? 's' : '') + '.'
                    ),
                    phase === 'lost'
                        ? e('div', { style: { marginBottom:20 } },
                            e('button', {
                                onClick: onReveal,
                                style: { padding:'10px 22px', background:'#a855f7', color:'white', border:'none',
                                    fontWeight:900, fontSize:10, textTransform:'uppercase', cursor:'pointer',
                                    letterSpacing:'0.15em', fontFamily:'EB Garamond,serif' }
                            }, '\uD83D\uDC41 Reveal Path')
                          )
                        : null,
                    e('div', { style: { display:'flex', gap:12, justifyContent:'center' } },
                        e('button', {
                            onClick: onNewGame,
                            style: { padding:'13px 32px', background:'white', color:'black', border:'none',
                                fontWeight:900, fontSize:10, textTransform:'uppercase', letterSpacing:'0.15em',
                                cursor:'pointer', fontFamily:'EB Garamond,serif' }
                        }, 'Next Case'),
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

    window.PathfindingUI = PathfindingUI;
})();
