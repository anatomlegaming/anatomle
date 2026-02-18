// ============================================================================
// ANATOMLE - PATHFINDING UI (warm palette, rebalanced layout)
// ============================================================================
// Layout constants — must match full-skeleton.html #cv positioning:
//   NAV_H   = 58px
//   BAR_H   = 46px
//   SRCH_H  = 68px
//   PANEL_W = 420px  (game panel)
//   AD_W    = 160px  (future slot, handled by HTML)
//   Right edge of panel = right:160px (AD_W)
// ============================================================================

(function() {
    var useRef    = React.useRef;
    var useEffect = React.useEffect;
    var e         = React.createElement;

    var C = {
        cream:      '#fdf6ec',
        cardBg:     '#fff8f0',
        border:     '#e8d5c0',
        ink:        '#2d1f14',
        inkLight:   '#4a3728',
        muted:      '#9a8070',
        coral:      '#e8603c',
        coralDark:  '#c94d2b',
        golden:     '#f0a500',
        sage:       '#5a8a6a',
        reveal:     '#8b5cf6',
    };

    // Layout — keep in sync with #cv in full-skeleton.html
    var NAV_H   = 58;
    var BAR_H   = 46;
    var SRCH_H  = 68;
    var PANEL_W = 420;  // wider panel
    var AD_W    = 160;  // future ad slot width
    var RIGHT   = AD_W; // panel's right edge offset

    function secHead(icon, label, count, color) {
        return e('div', {
            style: { padding:'10px 16px 8px', display:'flex', justifyContent:'space-between',
                alignItems:'center', flexShrink:0, borderBottom:'1px solid ' + C.border }
        },
            e('div', { style: { display:'flex', alignItems:'center', gap:6 } },
                e('span', { style: { fontSize:12 } }, icon),
                e('span', { style: { fontFamily:'DM Sans, sans-serif', fontSize:9, color:color,
                    textTransform:'uppercase', letterSpacing:'0.22em', fontWeight:700 } }, label)
            ),
            e('span', { style: { fontFamily:'Fraunces, serif', fontSize:13,
                color:color, fontWeight:900 } }, count)
        );
    }

    function PathfindingUI(props) {
        var gameTitle   = props.gameTitle;
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

        var guessedCount = chain.filter(function(c) { return c.guessed; }).length;
        var pathLen      = chain.length;
        var pct          = pathLen > 1 ? Math.round(((guessedCount - 1) / (pathLen - 1)) * 100) : 0;
        var guessesUsed  = max - left;
        var dangerZone   = left <= 2;

        // ── NAVBAR — centred title, no guesses counter here ──────────────
        var navbar = e('div', {
            style: { position:'fixed', top:0, left:0, right:0, height:NAV_H, zIndex:300,
                background:C.cream, borderBottom:'2px solid ' + C.border,
                display:'grid', gridTemplateColumns:'1fr auto 1fr',
                alignItems:'center', padding:'0 20px',
                boxShadow:'0 2px 16px rgba(45,31,20,0.07)' }
        },
            // Left — empty spacer (keeps title centred)
            e('div', null),
            // Centre — Anatomle + mode
            e('div', { style: { display:'flex', flexDirection:'column', alignItems:'center', gap:2 } },
                e('div', { style: { display:'flex', alignItems:'baseline' } },
                    e('span', { style: { fontFamily:'Fraunces, serif', fontWeight:900, fontSize:22,
                        color:C.ink, letterSpacing:'-0.04em' } }, 'Anat'),
                    e('span', { style: { fontFamily:'Fraunces, serif', fontWeight:900, fontSize:22,
                        color:C.coral, letterSpacing:'-0.04em', fontStyle:'italic' } }, 'om'),
                    e('span', { style: { fontFamily:'Fraunces, serif', fontWeight:900, fontSize:22,
                        color:C.ink, letterSpacing:'-0.04em' } }, 'le')
                ),
                e('span', { style: { fontFamily:'DM Sans, sans-serif', fontSize:8, color:C.muted,
                    textTransform:'uppercase', letterSpacing:'0.25em', lineHeight:1 } }, gameTitle)
            ),
            // Right — menu link
            e('div', { style: { display:'flex', justifyContent:'flex-end' } },
                e('a', {
                    href:'../index.html',
                    style: { fontFamily:'DM Sans, sans-serif', fontSize:9, color:C.muted,
                        textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.12em',
                        padding:'6px 14px', border:'1.5px solid ' + C.border, borderRadius:999,
                        transition:'all 0.2s' },
                    onMouseEnter: function(ev) { ev.currentTarget.style.color=C.ink; ev.currentTarget.style.borderColor=C.ink; },
                    onMouseLeave: function(ev) { ev.currentTarget.style.color=C.muted; ev.currentTarget.style.borderColor=C.border; }
                }, '\u2190 Menu')
            )
        );

        // ── CHALLENGE BAR — route + guesses left together ────────────────
        var challengeBar = e('div', {
            style: { position:'fixed', top:NAV_H, left:0, right: PANEL_W + AD_W, height:BAR_H,
                zIndex:200, background:'rgba(45,31,20,0.94)', backdropFilter:'blur(6px)',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'0 20px' }
        },
            // Route
            e('div', { style: { display:'flex', alignItems:'center', gap:8 } },
                e('span', { style: { fontFamily:'DM Sans, sans-serif', fontSize:9,
                    color:'rgba(253,246,236,0.45)', textTransform:'uppercase',
                    letterSpacing:'0.2em', marginRight:2 } }, 'Route'),
                e('span', { style: { fontFamily:'Fraunces, serif', fontWeight:700,
                    fontSize:14, color:'#a8d5b5', fontStyle:'italic' } }, target.start || '\u2026'),
                e('span', { style: { fontFamily:'DM Sans, sans-serif',
                    color:'rgba(253,246,236,0.25)', fontSize:12, margin:'0 4px' } }, '\u2192\u2192\u2192'),
                e('span', { style: { fontFamily:'Fraunces, serif', fontWeight:700,
                    fontSize:14, color:C.coral, fontStyle:'italic' } }, target.end || '\u2026')
            ),
            // Guesses left — now lives here
            e('div', { style: { display:'flex', alignItems:'center', gap:12 } },
                e('div', { style: { display:'flex', alignItems:'center', gap:6 } },
                    e('span', { style: { fontFamily:'Fraunces, serif', fontWeight:900, fontSize:22,
                        color: dangerZone ? C.coral : 'rgba(253,246,236,0.9)',
                        lineHeight:1, transition:'color 0.3s' } }, left),
                    e('span', { style: { fontFamily:'DM Sans, sans-serif', fontSize:9,
                        color:'rgba(253,246,236,0.4)', textTransform:'uppercase',
                        letterSpacing:'0.12em' } }, 'guesses left')
                ),
                // Progress bar
                e('div', { style: { display:'flex', alignItems:'center', gap:6 } },
                    e('span', { style: { fontFamily:'DM Sans, sans-serif', fontSize:9,
                        color:'rgba(253,246,236,0.35)', textTransform:'uppercase',
                        letterSpacing:'0.08em' } }, guessedCount + '/' + pathLen),
                    e('div', { style: { width:60, height:4, background:'rgba(255,255,255,0.1)',
                        borderRadius:4, overflow:'hidden' } },
                        e('div', { style: { width: pct + '%', height:'100%',
                            background: pct === 100 ? C.sage : C.coral,
                            transition:'width 0.4s ease', borderRadius:4 } })
                    )
                )
            )
        );

        // ── RIGHT PANEL ──────────────────────────────────────────────────
        var chainItems = chain.map(function(item, idx) {
            var isLast  = item.bone === target.end;
            var isStart = item.type === 'start';
            var shown   = item.guessed || isLast || (reveal && phase === 'lost');
            var wasRevealed = !item.guessed && !isLast && reveal && phase === 'lost';

            var bg, bc, color, icon;
            if (isStart) {
                bg='rgba(90,138,106,0.12)'; bc='rgba(90,138,106,0.35)'; color=C.sage; icon='\uD83D\uDCCD';
            } else if (isLast) {
                bg='rgba(232,96,60,0.1)'; bc='rgba(232,96,60,0.3)'; color=C.coral; icon='\uD83C\uDFAF';
            } else if (wasRevealed) {
                bg='rgba(139,92,246,0.07)'; bc='rgba(139,92,246,0.25)'; color=C.reveal; icon='\u2022';
            } else if (item.guessed) {
                bg='rgba(90,138,106,0.12)'; bc='rgba(90,138,106,0.35)'; color=C.sage; icon='\u2713';
            } else {
                bg='rgba(45,31,20,0.04)'; bc=C.border; color=C.muted; icon='\u00B7';
            }

            return e('div', { key:idx,
                style: { padding:'6px 10px', marginBottom:3, borderRadius:8,
                    fontSize:10, fontWeight:600, fontFamily:'DM Sans, sans-serif',
                    textTransform:'uppercase', letterSpacing:'0.04em',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    opacity: shown ? 1 : 0.32,
                    background:bg, border:'1.5px solid '+bc, color:color, transition:'all 0.25s' }
            },
                e('span', null, shown ? item.bone : '? ? ?'),
                e('span', { style:{fontSize:12} }, icon)
            );
        });

        var detourItems = detours.length === 0
            ? [e('div', { key:'none', style:{ fontFamily:'DM Sans, sans-serif', fontSize:9,
                color:C.muted, textAlign:'center', marginTop:6, fontStyle:'italic' } }, 'None yet')]
            : detours.map(function(b) {
                return e('div', { key:b, style:{ padding:'5px 10px', marginBottom:3, borderRadius:8,
                    background:'rgba(240,165,0,0.08)', border:'1.5px solid rgba(240,165,0,0.28)',
                    fontSize:10, color:C.golden, fontWeight:600,
                    fontFamily:'DM Sans, sans-serif', textTransform:'uppercase', letterSpacing:'0.04em',
                    display:'flex', alignItems:'center', gap:6 } },
                    e('span', null, '\u26A0'), b);
            });

        var badItems = bad.length === 0
            ? [e('div', { key:'none', style:{ fontFamily:'DM Sans, sans-serif', fontSize:9,
                color:C.muted, textAlign:'center', marginTop:6, fontStyle:'italic' } }, 'None yet')]
            : bad.map(function(b) {
                return e('div', { key:b, className:'shake', style:{ padding:'5px 10px', marginBottom:3,
                    borderRadius:8, background:'rgba(201,77,43,0.07)',
                    border:'1.5px solid rgba(201,77,43,0.25)',
                    fontSize:10, color:C.coralDark, fontWeight:600,
                    fontFamily:'DM Sans, sans-serif', textTransform:'uppercase', letterSpacing:'0.04em',
                    display:'flex', alignItems:'center', gap:6 } },
                    e('span', null, '\u2717'), b);
            });

        var rightPanel = e('div', {
            style: { position:'fixed', top:NAV_H, right:RIGHT, width:PANEL_W, bottom:0, zIndex:200,
                background:C.cream, borderLeft:'2px solid '+C.border,
                display:'flex', flexDirection:'column',
                boxShadow:'-4px 0 24px rgba(45,31,20,0.07)' }
        },
            e('div', { style:{ flex:'1 1 0', overflow:'hidden', display:'flex',
                flexDirection:'column', borderBottom:'2px solid '+C.border } },
                secHead('\uD83E\uDDEC', 'Path Bones', guessedCount + ' / ' + pathLen, C.sage),
                e('div', { className:'scr', style:{ overflowY:'auto', flex:1, padding:'10px 14px' } }, chainItems)
            ),
            e('div', { style:{ flex:'0 0 auto', maxHeight:'24%', overflow:'hidden',
                display:'flex', flexDirection:'column', borderBottom:'2px solid '+C.border } },
                secHead('\u26A0', 'Detours', detours.length, C.golden),
                e('div', { className:'scr', style:{ overflowY:'auto', flex:1, padding:'8px 14px' } }, detourItems)
            ),
            e('div', { style:{ flex:'0 0 auto', maxHeight:'20%', overflow:'hidden',
                display:'flex', flexDirection:'column', borderBottom:'2px solid '+C.border } },
                secHead('\u2717', 'Wrong', bad.length, C.coralDark),
                e('div', { className:'scr', style:{ overflowY:'auto', flex:1, padding:'8px 14px' } }, badItems)
            ),
            e('div', { style:{ padding:14, flexShrink:0 } },
                e('button', {
                    onClick: onNewGame,
                    style:{ width:'100%', padding:'12px 0',
                        background:'linear-gradient(135deg,'+C.coral+','+C.coralDark+')',
                        color:'white', border:'none', borderRadius:10,
                        fontFamily:'Fraunces, serif', fontWeight:900, fontSize:12,
                        textTransform:'uppercase', letterSpacing:'0.15em',
                        cursor:'pointer', boxShadow:'0 4px 12px rgba(232,96,60,0.28)',
                        transition:'all 0.2s' },
                    onMouseEnter:function(ev){ev.currentTarget.style.transform='translateY(-1px)';ev.currentTarget.style.boxShadow='0 6px 18px rgba(232,96,60,0.4)';},
                    onMouseLeave:function(ev){ev.currentTarget.style.transform='translateY(0)';ev.currentTarget.style.boxShadow='0 4px 12px rgba(232,96,60,0.28)';}
                }, 'Next Case \u2192')
            )
        );

        // ── SEARCH BAR ───────────────────────────────────────────────────
        var dropdown = suggestions.length > 0
            ? e('div', {
                style:{ position:'absolute', bottom:'100%', left:0, right:0,
                    background:C.cream, border:'2px solid '+C.border, borderBottom:'none',
                    zIndex:400, maxHeight:220, overflowY:'auto',
                    borderRadius:'12px 12px 0 0',
                    boxShadow:'0 -8px 24px rgba(45,31,20,0.1)' }
              },
                suggestions.map(function(s, i) {
                    return e('div', {
                        key:s, onClick:function(){ onSubmit(s); },
                        style:{ padding:'10px 16px', fontSize:11, fontWeight:600,
                            fontFamily:'DM Sans, sans-serif', textTransform:'uppercase',
                            letterSpacing:'0.08em', cursor:'pointer',
                            color: i===selIdx ? 'white' : C.ink,
                            background: i===selIdx
                                ? 'linear-gradient(135deg,'+C.coral+','+C.coralDark+')'
                                : 'transparent',
                            borderBottom:'1px solid '+C.border, transition:'all 0.1s' }
                    }, s);
                })
              )
            : null;

        var searchBar = e('div', {
            style:{ position:'fixed', bottom:0, left:0, right: PANEL_W + AD_W, height:SRCH_H,
                zIndex:250, background:C.cream, borderTop:'2px solid '+C.border,
                padding:'11px 16px', display:'flex', alignItems:'center',
                boxShadow:'0 -2px 12px rgba(45,31,20,0.06)' }
        },
            e('div', { style:{ flex:1, position:'relative' } },
                dropdown,
                e('div', { style:{ position:'relative' } },
                    e('span', { style:{ position:'absolute', left:13, top:'50%',
                        transform:'translateY(-50%)', fontSize:15, pointerEvents:'none',
                        color: phase !== 'playing' ? C.muted : C.coral } }, '\uD83E\uDDB4'),
                    e('input', {
                        ref:inputRef, value:input,
                        onChange:onInputChange, onKeyDown:onKeyDown,
                        disabled: phase !== 'playing',
                        placeholder: phase==='playing'
                            ? 'Type a bone name\u2026 select from list above \u2191'
                            : 'Game over \u2014 click Next Case \u2192',
                        style:{ width:'100%',
                            background: phase !== 'playing' ? 'rgba(45,31,20,0.04)' : C.cardBg,
                            border:'2px solid '+(input && suggestions.length===0 ? C.coralDark : C.border),
                            borderRadius:10, padding:'10px 14px 10px 38px',
                            color:C.ink, fontFamily:'DM Sans, sans-serif', fontSize:12,
                            outline:'none', transition:'border-color 0.2s',
                            opacity: phase !== 'playing' ? 0.55 : 1 }
                    })
                )
            )
        );

        // ── END OVERLAY ──────────────────────────────────────────────────
        var won    = phase === 'won';
        var lost   = phase === 'lost';
        var perfect = won && detours.length === 0;

        var overlay = (phase !== 'playing' && !reveal)
            ? e('div', {
                style:{ position:'fixed', inset:0, zIndex:600,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    backdropFilter:'blur(16px)',
                    background: won ? 'rgba(253,246,236,0.82)' : 'rgba(45,31,20,0.78)' }
              },
                e('div', {
                    style:{ textAlign:'center', padding:'44px 40px',
                        background:C.cream, border:'2px solid '+C.border,
                        borderRadius:24, maxWidth:440, width:'90%',
                        boxShadow:'0 32px 64px rgba(45,31,20,0.18)' }
                },
                    e('div', { style:{ fontSize:50, marginBottom:10, lineHeight:1 } },
                        won ? (perfect ? '\uD83C\uDFC6' : '\u2705') : '\uD83D\uDCA3'),
                    e('h2', { style:{ fontFamily:'Fraunces, serif', fontWeight:900, fontSize:34,
                        color: won ? C.ink : C.coralDark, margin:'0 0 6px',
                        letterSpacing:'-0.03em', lineHeight:1 } },
                        won ? (perfect ? 'Perfect Path!' : 'Path Found!') : 'Flatlined.'),
                    e('p', { style:{ fontFamily:'DM Sans, sans-serif', color:C.muted,
                        fontSize:13, marginBottom:20, lineHeight:1.6 } },
                        won
                            ? (perfect
                                ? 'Optimal route \u2014 '+guessesUsed+' of '+max+' guesses.'
                                : 'Via '+detours.length+' detour'+(detours.length!==1?'s':'')+'. '+guessesUsed+'/'+max+' guesses.')
                            : 'Path not completed. '+bad.length+' wrong guess'+(bad.length!==1?'es':'')+'.'),
                    e('div', { style:{ display:'inline-flex', alignItems:'center', gap:8,
                        marginBottom:24, padding:'8px 18px',
                        background:'rgba(45,31,20,0.05)', borderRadius:999,
                        border:'1.5px solid '+C.border } },
                        e('span', { style:{ fontFamily:'Fraunces, serif', fontWeight:700,
                            fontSize:12, color:C.sage } }, target.start),
                        e('span', { style:{ color:C.muted, fontSize:11 } }, '\u2192\u2192\u2192'),
                        e('span', { style:{ fontFamily:'Fraunces, serif', fontWeight:700,
                            fontSize:12, color:C.coral } }, target.end)
                    ),
                    lost ? e('div', { style:{ marginBottom:14 } },
                        e('button', {
                            onClick:onReveal,
                            style:{ padding:'8px 20px', background:'transparent',
                                color:C.muted, border:'1.5px solid '+C.border, borderRadius:999,
                                fontFamily:'DM Sans, sans-serif', fontWeight:600,
                                fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em',
                                cursor:'pointer', transition:'all 0.2s' },
                            onMouseEnter:function(ev){ev.currentTarget.style.color=C.ink;ev.currentTarget.style.borderColor=C.ink;},
                            onMouseLeave:function(ev){ev.currentTarget.style.color=C.muted;ev.currentTarget.style.borderColor=C.border;}
                        }, '\uD83D\uDC41 Reveal Answer')
                    ) : null,
                    e('div', { style:{ display:'flex', gap:10, justifyContent:'center' } },
                        e('button', {
                            onClick:onNewGame,
                            style:{ padding:'12px 26px',
                                background:'linear-gradient(135deg,'+C.coral+','+C.coralDark+')',
                                color:'white', border:'none', borderRadius:10,
                                fontFamily:'Fraunces, serif', fontWeight:900, fontSize:12,
                                textTransform:'uppercase', letterSpacing:'0.1em',
                                cursor:'pointer', boxShadow:'0 4px 12px rgba(232,96,60,0.3)' }
                        }, 'Next Case'),
                        e('a', { href:'../index.html', style:{ padding:'12px 26px',
                            background:'rgba(45,31,20,0.05)', color:C.inkLight,
                            border:'1.5px solid '+C.border, borderRadius:10,
                            fontFamily:'Fraunces, serif', fontWeight:700, fontSize:12,
                            textTransform:'uppercase', letterSpacing:'0.1em',
                            textDecoration:'none', display:'flex', alignItems:'center' }
                        }, 'Menu')
                    )
                )
              )
            : null;

        return e(React.Fragment, null, navbar, challengeBar, rightPanel, searchBar, overlay);
    }

    window.PathfindingUI = PathfindingUI;
})();
