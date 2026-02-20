// ============================================================================
// ANATOMLE - PATHFINDING UI
// Pure React.createElement — no JSX, loads as plain <script> tag
// Supports: skeleton game, upper limb standard, upper limb nerve challenge
// Features: mode badge, nerve hint button, nerve supply log, share button
// ============================================================================
(function () {
    var e = React.createElement;
    var useRef    = React.useRef;
    var useEffect = React.useEffect;

    var C = {
        cream:    '#fdf6ec',
        card:     '#fff8f0',
        border:   '#e8d5c0',
        ink:      '#2d1f14',
        inkLight: '#4a3728',
        muted:    '#9a8070',
        coral:    '#e8603c',
        coralDk:  '#c94d2b',
        golden:   '#f0a500',
        sage:     '#5a8a6a',
        purple:   '#8b5cf6',
        cyan:     '#06b6d4',
        cyanDk:   '#0891b2',
        dark:     'rgba(45,31,20,0.94)',
    };
    var NAV=58, BAR=46, SRCH=68, PW=420, AW=160;

    // ── SECTION HEADER ────────────────────────────────────────────────────────
    function SectionHead(icon, label, val, col) {
        return e('div', { style:{
            padding:'10px 16px 8px', display:'flex',
            justifyContent:'space-between', alignItems:'center',
            flexShrink:0, borderBottom:'1px solid '+C.border
        }},
            e('div', { style:{ display:'flex', alignItems:'center', gap:6 } },
                e('span', { style:{ fontSize:12 } }, icon),
                e('span', { style:{
                    fontFamily:'DM Sans,sans-serif', fontSize:9, color:col,
                    textTransform:'uppercase', letterSpacing:'0.22em', fontWeight:700
                }}, label)
            ),
            e('span', { style:{
                fontFamily:'Fraunces,serif', fontSize:13, color:col, fontWeight:900
            }}, val)
        );
    }

    // ── MAIN COMPONENT ────────────────────────────────────────────────────────
    function PathfindingUI(props) {
        var gameTitle = props.gameTitle;
        var mode      = props.mode || 'standard'; // 'standard' | 'nerve'
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
        var supplyLog   = s.supplyLog  || null;

        var isNerve  = mode === 'nerve';
        var accent   = isNerve ? C.cyan    : C.coral;
        var accentDk = isNerve ? C.cyanDk  : C.coralDk;

        var inputRef = useRef(null);
        useEffect(function () {
            if (phase === 'playing' && inputRef.current) inputRef.current.focus();
        }, [phase]);

        var guessed = chain.filter(function (c) { return c.guessed; });
        var danger  = left <= 3;

        // ── NAVBAR ────────────────────────────────────────────────────────────
        var navbar = e('div', { style:{
            position:'fixed', top:0, left:0, right:0, height:NAV, zIndex:300,
            background:C.cream, borderBottom:'2px solid '+C.border,
            display:'grid', gridTemplateColumns:'1fr auto 1fr',
            alignItems:'center', padding:'0 20px',
            boxShadow:'0 2px 16px rgba(45,31,20,0.07)'
        }},
            // Left: mode badge
            e('div', { style:{ display:'flex', alignItems:'center' } },
                e('span', { style:{
                    fontFamily:'DM Sans,sans-serif', fontSize:9, fontWeight:700,
                    textTransform:'uppercase', letterSpacing:'0.12em',
                    color: isNerve ? C.cyan : C.muted,
                    padding:'4px 12px',
                    border:'1.5px solid '+(isNerve ? C.cyan : C.border),
                    borderRadius:999, lineHeight:1.4
                }}, isNerve ? '\uD83E\uDDE0 Nerve Challenge' : '\u26A1 Standard')
            ),
            // Centre: logo — clickable back to menu
            e('a', { href:'../index.html', style:{
                display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                textDecoration:'none', cursor:'pointer'
            }},
                e('div', { style:{ display:'flex', alignItems:'baseline' } },
                    e('span', { style:{
                        fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22,
                        color:C.ink, letterSpacing:'-0.04em'
                    }}, 'Anat'),
                    e('span', { style:{
                        fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22,
                        color:accent, letterSpacing:'-0.04em', fontStyle:'italic'
                    }}, 'om'),
                    e('span', { style:{
                        fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22,
                        color:C.ink, letterSpacing:'-0.04em'
                    }}, 'le')
                ),
                e('span', { style:{
                    fontFamily:'DM Sans,sans-serif', fontSize:8, color:C.muted,
                    textTransform:'uppercase', letterSpacing:'0.25em'
                }}, gameTitle)
            ),
            // Right: how-to icon + menu button
            e('div', { style:{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:8 } },
                typeof window.HowToIcon !== 'undefined'
                    ? e(window.HowToIcon, { gameType:'pathfinding', tooltip:false })
                    : null,
                e('a', { href:'../index.html', style:{
                    fontFamily:'DM Sans,sans-serif', fontSize:10, fontWeight:700,
                    color:C.inkLight, textDecoration:'none',
                    textTransform:'uppercase', letterSpacing:'0.1em',
                    padding:'7px 16px',
                    background:C.card,
                    border:'1.5px solid '+C.border,
                    borderRadius:999,
                    transition:'all 0.18s'
                }}, '\u2190 Menu')
            )
        );

        // ── CHALLENGE BAR — path centred over 3D area, guesses to its right ──
        // 3D area occupies: left=0 → right=PW+AW
        // Centre of 3D area from left edge = (viewport - PW - AW) / 2
        // Expressed as: left: calc(50% - (PW+AW)/2) then shift back by half of own width
        var BAR_H = BAR + 8;
        var challengeBar = e('div', { style:{
            position:'fixed', top:NAV, left:0, right:PW+AW, height:BAR_H,
            zIndex:200, background:C.dark, backdropFilter:'blur(6px)',
            display:'flex', alignItems:'center',
            padding:'0 20px'
        }},
            // Path — centred within this bar (which already only spans the 3D area)
            e('div', { style:{
                flex:1, display:'flex', alignItems:'center',
                justifyContent:'center', gap:12
            }},
                e('span', { style:{
                    fontFamily:'Fraunces,serif', fontWeight:700, fontSize:18,
                    color:'#a8d5b5', fontStyle:'italic'
                }}, target.start),
                e('span', { style:{
                    color:'rgba(253,246,236,0.3)', fontSize:14, letterSpacing:'0.1em'
                }}, '\u2192\u2192\u2192'),
                e('span', { style:{
                    fontFamily:'Fraunces,serif', fontWeight:700, fontSize:18,
                    color:accent, fontStyle:'italic'
                }}, target.end)
            ),
            // Guess count — right side of the bar (right edge of 3D area)
            e('div', { style:{
                display:'flex', alignItems:'baseline', gap:5, flexShrink:0
            }},
                e('span', { style:{
                    fontFamily:'Fraunces,serif', fontWeight:900, fontSize:26,
                    color: danger ? accent : 'rgba(253,246,236,0.92)', lineHeight:1
                }}, left),
                e('span', { style:{
                    fontFamily:'DM Sans,sans-serif', fontSize:10,
                    color:'rgba(253,246,236,0.4)', textTransform:'uppercase', letterSpacing:'0.1em'
                }}, 'left')
            )
        );

        // ── CHAIN ITEMS ───────────────────────────────────────────────────────
        var chainItems = chain.map(function (item, idx) {
            var isFirst = item.bone === target.start;
            var isLast  = item.bone === target.end;
            var shown   = item.guessed || isLast || (reveal && phase === 'lost');

            var bg  = isFirst ? 'rgba(90,138,106,0.12)'
                    : isLast  ? 'rgba(232,96,60,0.1)'
                    : item.guessed ? 'rgba(90,138,106,0.08)'
                    : 'rgba(45,31,20,0.02)';
            var bdr = isFirst ? 'rgba(90,138,106,0.35)'
                    : isLast  ? 'rgba(232,96,60,0.3)'
                    : item.guessed ? 'rgba(90,138,106,0.25)'
                    : C.border;
            var col = isFirst ? C.sage
                    : isLast  ? accent
                    : item.guessed ? C.sage
                    : C.muted;
            var ico = isFirst ? '\uD83D\uDCCD'
                    : isLast  ? '\uD83C\uDFAF'
                    : item.guessed ? '\u2713'
                    : '\u00B7';

            // Nerve supply tag (nerve mode only, when shown)
            var supplyTag = null;
            if (isNerve && shown && item.bone &&
                typeof UPPER_LIMB_MUSCLES !== 'undefined' &&
                UPPER_LIMB_MUSCLES[item.bone]) {
                var supply = UPPER_LIMB_MUSCLES[item.bone].supply;
                if (supply) {
                    supplyTag = e('span', { style:{
                        fontSize:8, color:C.cyan, fontFamily:'DM Sans,sans-serif',
                        opacity:0.85, marginLeft:6, fontWeight:600
                    }}, '\u2022 ' + supply);
                }
            }

            return e('div', { key:idx, style:{
                padding:'6px 10px', marginBottom:3, borderRadius:8,
                fontSize:11, fontWeight:600, fontFamily:'DM Sans,sans-serif',
                textTransform:'uppercase', letterSpacing:'0.04em',
                display:'flex', justifyContent:'space-between', alignItems:'center',
                opacity: shown ? 1 : 0.2,
                background:bg, border:'1.5px solid '+bdr, color:col
            }},
                e('div', { style:{ display:'flex', alignItems:'center', flexWrap:'wrap' } },
                    e('span', null, shown ? item.bone : '???'),
                    supplyTag
                ),
                e('span', { style:{ fontSize:16, lineHeight:1 } }, ico)
            );
        });

        // ── DETOUR ITEMS ──────────────────────────────────────────────────────
        var detourItems = detours.length === 0
            ? [e('div', { key:'none', style:{
                fontFamily:'DM Sans,sans-serif', fontSize:9, color:C.muted,
                textAlign:'center', marginTop:6, fontStyle:'italic'
              }}, 'None yet')]
            : detours.map(function (b) {
                var supply = (isNerve &&
                    typeof UPPER_LIMB_MUSCLES !== 'undefined' &&
                    UPPER_LIMB_MUSCLES[b]) ? UPPER_LIMB_MUSCLES[b].supply : null;
                return e('div', { key:b, style:{
                    padding:'5px 10px', marginBottom:3, borderRadius:8,
                    background:'rgba(240,165,0,0.08)',
                    border:'1.5px solid rgba(240,165,0,0.3)',
                    fontSize:10, color:C.golden, fontWeight:600,
                    fontFamily:'DM Sans,sans-serif',
                    textTransform:'uppercase', letterSpacing:'0.04em',
                    display:'flex', justifyContent:'space-between', alignItems:'center'
                }},
                    e('span', null, '\u26A0 '+b),
                    supply ? e('span', { style:{ fontSize:8, opacity:0.7 } }, supply) : null
                );
            });

        // ── BAD ITEMS ─────────────────────────────────────────────────────────
        var badItems = bad.length === 0
            ? [e('div', { key:'none', style:{
                fontFamily:'DM Sans,sans-serif', fontSize:9, color:C.muted,
                textAlign:'center', marginTop:6, fontStyle:'italic'
              }}, 'None yet')]
            : bad.map(function (b) {
                return e('div', { key:b, className:'shake', style:{
                    padding:'5px 10px', marginBottom:3, borderRadius:8,
                    background:'rgba(201,77,43,0.07)',
                    border:'1.5px solid rgba(201,77,43,0.25)',
                    fontSize:10, color:C.coralDk, fontWeight:600,
                    fontFamily:'DM Sans,sans-serif',
                    textTransform:'uppercase', letterSpacing:'0.04em'
                }}, '\u2717 '+b);
            });

        // ── HINT BUTTON ───────────────────────────────────────────────────────
        var hintBtn = e('button', {
            onClick: h.onHint || function(){},
            disabled: hintUsed || phase !== 'playing' || !h.onHint,
            style:{
                width:'100%', padding:'8px 0', borderRadius:8, marginBottom:8,
                background: hintUsed ? 'rgba(45,31,20,0.03)' : 'rgba(6,182,212,0.08)',
                color: hintUsed ? C.muted : C.cyan,
                border:'1.5px solid '+(hintUsed ? C.border : C.cyan),
                fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:9,
                textTransform:'uppercase', letterSpacing:'0.15em',
                cursor: (hintUsed || !h.onHint) ? 'default' : 'pointer',
                opacity: hintUsed ? 0.5 : 1,
                display: h.onHint ? 'block' : 'none'
            }
        }, hintUsed ? '\u26A1 Hint Used' : '\u26A1 Nerve Hint');

        // ── RIGHT PANEL ───────────────────────────────────────────────────────
        var rightPanel = e('div', { style:{
            position:'fixed', top:NAV, right:AW, width:PW, bottom:0, zIndex:200,
            background:C.cream, borderLeft:'2px solid '+C.border,
            display:'flex', flexDirection:'column',
            boxShadow:'-4px 0 24px rgba(45,31,20,0.07)'
        }},
            // Path section
            e('div', { style:{
                flex:'1 1 0', overflow:'hidden', display:'flex',
                flexDirection:'column', borderBottom:'2px solid '+C.border
            }},
                SectionHead(isNerve ? '\uD83E\uDDE0' : '\uD83E\uDDB4',
                    'Path', guessed.length+' / '+(chain.length-1), C.sage),
                e('div', { className:'scr', style:{ overflowY:'auto', flex:1, padding:'8px 14px' } },
                    chainItems)
            ),
            // Detours section
            e('div', { style:{
                flex:'0 0 auto', maxHeight:'22%', overflow:'hidden',
                display:'flex', flexDirection:'column', borderBottom:'2px solid '+C.border
            }},
                SectionHead('\u26A0', 'Detours', detours.length, C.golden),
                e('div', { className:'scr', style:{ overflowY:'auto', flex:1, padding:'6px 14px' } },
                    detourItems)
            ),
            // Wrong section
            e('div', { style:{
                flex:'0 0 auto', maxHeight:'20%', overflow:'hidden',
                display:'flex', flexDirection:'column', borderBottom:'2px solid '+C.border
            }},
                SectionHead('\u2717', 'Wrong', bad.length, C.coralDk),
                e('div', { className:'scr', style:{ overflowY:'auto', flex:1, padding:'6px 14px' } },
                    badItems)
            ),
            // Buttons
            e('div', { style:{ padding:'10px 14px 14px', flexShrink:0 } },
                hintBtn,
                e('button', {
                    onClick: phase === 'playing' ? (h.onGiveUp || h.onNewGame) : h.onNewGame,
                    style:{
                        width:'100%', padding:'12px 0', borderRadius:10,
                        background: phase === 'playing'
                            ? 'rgba(45,31,20,0.05)'
                            : 'linear-gradient(135deg,'+accent+','+accentDk+')',
                        color: phase === 'playing' ? C.muted : 'white',
                        border: phase === 'playing' ? '1.5px solid '+C.border : 'none',
                        fontFamily:'Fraunces,serif', fontWeight:900, fontSize:12,
                        textTransform:'uppercase', letterSpacing:'0.15em', cursor:'pointer'
                    }
                }, phase === 'playing' ? 'Give Up' : 'Next Case \u2192')
            )
        );

        // ── SEARCH BAR ────────────────────────────────────────────────────────
        var dropdown = suggestions.length > 0
            ? e('div', { style:{
                position:'absolute', bottom:'100%', left:0, right:0,
                background:C.cream, border:'2px solid '+C.border, borderBottom:'none',
                zIndex:400, maxHeight:220, overflowY:'auto',
                borderRadius:'12px 12px 0 0',
                boxShadow:'0 -8px 24px rgba(45,31,20,0.1)'
              }},
                suggestions.map(function (sug, i) {
                    return e('div', { key:sug,
                        onClick: function () { h.onSubmit(sug); },
                        style:{
                            padding:'10px 16px', fontSize:11, fontWeight:600,
                            fontFamily:'DM Sans,sans-serif', textTransform:'uppercase',
                            letterSpacing:'0.08em', cursor:'pointer',
                            color: i === selIdx ? 'white' : C.ink,
                            background: i === selIdx
                                ? 'linear-gradient(135deg,'+accent+','+accentDk+')'
                                : 'transparent',
                            borderBottom:'1px solid '+C.border
                        }
                    }, sug);
                })
              )
            : null;

        var searchBar = e('div', { style:{
            position:'fixed', bottom:0, left:0, right:PW+AW, height:SRCH,
            zIndex:250, background:C.cream, borderTop:'2px solid '+C.border,
            padding:'11px 16px', display:'flex', alignItems:'center',
            boxShadow:'0 -2px 12px rgba(45,31,20,0.06)'
        }},
            e('div', { style:{ flex:1, position:'relative' } },
                dropdown,
                e('div', { style:{ position:'relative' } },
                    e('span', { style:{
                        position:'absolute', left:13, top:'50%',
                        transform:'translateY(-50%)', fontSize:15,
                        pointerEvents:'none',
                        color: phase !== 'playing' ? C.muted : accent
                    }}, isNerve ? '\uD83E\uDDE0' : '\uD83E\uDDB4'),
                    e('input', {
                        ref: inputRef, value: input,
                        onChange: h.onInputChange,
                        onKeyDown: h.onKeyDown,
                        disabled: phase !== 'playing',
                        placeholder: phase === 'playing'
                            ? 'Type a name\u2026 select from list \u2191'
                            : 'Game over \u2014 click Next Case \u2192',
                        style:{
                            width:'100%',
                            background: phase !== 'playing' ? 'rgba(45,31,20,0.04)' : C.card,
                            border:'2px solid '+(input && suggestions.length === 0 ? C.coralDk : C.border),
                            borderRadius:10, padding:'10px 14px 10px 38px',
                            color:C.ink, fontFamily:'DM Sans,sans-serif', fontSize:12,
                            outline:'none', opacity: phase !== 'playing' ? 0.55 : 1
                        }
                    })
                )
            )
        );

        // ── END OVERLAY ───────────────────────────────────────────────────────
        var overlay = (phase !== 'playing' && !reveal)
            ? e('div', { style:{
                position:'fixed', inset:0, zIndex:600,
                display:'flex', alignItems:'center', justifyContent:'center',
                backdropFilter:'blur(16px)',
                background: phase === 'won'
                    ? 'rgba(253,246,236,0.82)'
                    : 'rgba(45,31,20,0.78)'
              }},
                e('div', { style:{
                    textAlign:'center', padding:'44px 40px',
                    background:C.cream, border:'2px solid '+C.border,
                    borderRadius:24, maxWidth:460, width:'90%',
                    boxShadow:'0 32px 64px rgba(45,31,20,0.18)'
                }},
                    // Emoji
                    e('div', { style:{ fontSize:48, marginBottom:10, lineHeight:1 } },
                        phase === 'won'
                            ? (detours.length === 0 ? '\uD83C\uDFC6' : '\u2713')
                            : '\uD83D\uDCA3'),
                    // Headline
                    e('h2', { style:{
                        fontFamily:'Fraunces,serif', fontWeight:900, fontSize:32,
                        color: phase === 'won' ? C.ink : C.coralDk,
                        margin:'0 0 6px', letterSpacing:'-0.03em', lineHeight:1
                    }},
                        phase === 'won'
                            ? (detours.length === 0 ? 'Perfect Path!' : 'Path Found!')
                            : 'Flatline.'),
                    // Subtext
                    e('p', { style:{
                        fontFamily:'DM Sans,sans-serif', color:C.muted,
                        fontSize:13, marginBottom:18
                    }},
                        phase === 'won'
                            ? (detours.length === 0
                                ? 'Optimal route! '+(max-left)+'/'+max+' guesses.'
                                : 'Via '+detours.length+' detour'+(detours.length !== 1?'s':'')+'. '+(max-left)+'/'+max+'.')
                            : bad.length+' wrong guess'+(bad.length !== 1?'es':'')+'.'),
                    // Route pill
                    e('div', { style:{
                        display:'inline-flex', alignItems:'center', gap:8, marginBottom:20,
                        padding:'7px 18px', background:'rgba(45,31,20,0.05)',
                        borderRadius:999, border:'1.5px solid '+C.border
                    }},
                        e('span', { style:{
                            fontFamily:'Fraunces,serif', fontWeight:700,
                            fontSize:13, color:C.sage
                        }}, target.start),
                        e('span', { style:{ color:C.muted, fontSize:11 } }, '\u2192'),
                        e('span', { style:{
                            fontFamily:'Fraunces,serif', fontWeight:700,
                            fontSize:13, color:accent
                        }}, target.end)
                    ),
                    // Nerve supply recap (nerve mode only)
                    (isNerve && supplyLog && supplyLog.length > 0)
                        ? e('div', { style:{
                            marginBottom:16, padding:'10px 14px',
                            background:'rgba(6,182,212,0.05)',
                            border:'1.5px solid rgba(6,182,212,0.2)',
                            borderRadius:10, textAlign:'left'
                          }},
                            e('div', { style:{
                                fontFamily:'DM Sans,sans-serif', fontSize:8, color:C.cyan,
                                textTransform:'uppercase', letterSpacing:'0.2em',
                                marginBottom:6, fontWeight:700
                            }}, '\uD83E\uDDE0 Nerve Supply'),
                            supplyLog.map(function (item, i) {
                                return e('div', { key:i, style:{
                                    fontFamily:'DM Sans,sans-serif', fontSize:10,
                                    color: item.detour ? C.golden : C.inkLight,
                                    marginBottom:2, display:'flex', justifyContent:'space-between'
                                }},
                                    e('span', { style:{ fontWeight:600 } }, item.muscle),
                                    e('span', { style:{ color:C.cyan, fontSize:9 } }, item.supply)
                                );
                            })
                          )
                        : null,
                    // Reveal button (lost only)
                    phase === 'lost'
                        ? e('div', { style:{ marginBottom:12 } },
                            e('button', { onClick: h.onReveal, style:{
                                padding:'8px 20px', background:'transparent',
                                color:C.purple, border:'1.5px solid '+C.purple,
                                borderRadius:999, fontFamily:'DM Sans,sans-serif',
                                fontWeight:600, fontSize:9, textTransform:'uppercase',
                                letterSpacing:'0.1em', cursor:'pointer'
                            }}, '\uD83D\uDC41 Reveal Path')
                          )
                        : null,
                    // Share button
                    h.onShare
                        ? e('div', { style:{ marginBottom:12 } },
                            e('button', { onClick: h.onShare, style:{
                                padding:'8px 20px',
                                background: shared ? 'rgba(90,138,106,0.1)' : 'transparent',
                                color: shared ? C.sage : C.muted,
                                border:'1.5px solid '+(shared ? C.sage : C.border),
                                borderRadius:999, fontFamily:'DM Sans,sans-serif',
                                fontWeight:600, fontSize:9, textTransform:'uppercase',
                                letterSpacing:'0.1em', cursor:'pointer'
                            }}, shared ? '\u2713 Copied!' : '\uD83D\uDCCB Share Result')
                          )
                        : null,
                    // Action buttons
                    e('div', { style:{ display:'flex', gap:10, justifyContent:'center' } },
                        e('button', { onClick: h.onNewGame, style:{
                            padding:'12px 26px',
                            background:'linear-gradient(135deg,'+accent+','+accentDk+')',
                            color:'white', border:'none', borderRadius:10,
                            fontFamily:'Fraunces,serif', fontWeight:900, fontSize:12,
                            textTransform:'uppercase', letterSpacing:'0.1em',
                            cursor:'pointer',
                            boxShadow:'0 4px 12px rgba(232,96,60,0.25)'
                        }}, 'Next Case'),
                        e('a', { href:'../index.html', style:{
                            padding:'12px 26px', background:'rgba(45,31,20,0.05)',
                            color:C.inkLight, border:'1.5px solid '+C.border,
                            borderRadius:10, fontFamily:'Fraunces,serif', fontWeight:700,
                            fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em',
                            textDecoration:'none', display:'flex', alignItems:'center'
                        }}, 'Menu')
                    )
                )
              )
            : null;

        return e(React.Fragment, null, navbar, challengeBar, rightPanel, searchBar, overlay);
    }

    window.PathfindingUI = PathfindingUI;
})();
