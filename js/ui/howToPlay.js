// ============================================================================
// ANATOMLE — HOW TO PLAY  (pathfinding edition)
// Pure React.createElement — no JSX, loads as plain <script> tag
//
// window.HowToIcon      — ⓘ button. tooltip=true for index hover, else in-game modal
// window.HowToModal     — standalone modal, pass show + onClose
// window.useFirstVisit  — hook: returns [show, dismiss], uses localStorage
// ============================================================================
(function () {
    var e         = React.createElement;
    var useState  = React.useState;
    var useEffect = React.useEffect;
    var useRef    = React.useRef;

    // Exact colours from pathfindingUI.js
    var C = {
        cream:   '#fdf6ec',
        card:    '#fff8f0',
        border:  '#e8d5c0',
        ink:     '#2d1f14',
        muted:   '#9a8070',
        coral:   '#e8603c',
        coralDk: '#c94d2b',
        golden:  '#f0a500',
        sage:    '#5a8a6a',
        dark:    'rgba(45,31,20,0.94)',
    };

    // Inject shared keyframes once
    if (!document.getElementById('htp-styles')) {
        var st = document.createElement('style');
        st.id  = 'htp-styles';
        st.textContent = [
            '@keyframes htpBlink   { 0%,100%{opacity:1} 50%{opacity:0} }',
            '@keyframes htpFadeIn  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }',
            '@keyframes htpPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(90,138,106,0.5)} 50%{box-shadow:0 0 0 6px rgba(90,138,106,0)} }',
            '@keyframes htpWin     { 0%{opacity:0;transform:scale(0.85)} 60%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }',
        ].join('\n');
        document.head.appendChild(st);
    }

    // ── FIRST VISIT HOOK ──────────────────────────────────────────────────────
    function useFirstVisit(gameKey) {
        var key     = 'anatomle_htp_' + gameKey;
        var seen    = false;
        try { seen = !!localStorage.getItem(key); } catch(_) {}
        var pair    = useState(!seen);
        var show    = pair[0]; var setShow = pair[1];
        function dismiss() {
            try { localStorage.setItem(key, '1'); } catch(_) {}
            setShow(false);
        }
        return [show, dismiss];
    }

    // ── SKELETON SVG ──────────────────────────────────────────────────────────
    // 4 bones: Clavicle(0), Scapula(1), Humerus(2), Radius(3=end)
    // lit = array of bone ids highlighted green
    // done = true → end bone (Radius) lights coral
    function SkeletonSVG(props) {
        var lit  = props.lit  || [];
        var done = props.done || false;

        function col(id) {
            if (id === 3) return done ? C.coral : 'rgba(45,31,20,0.13)';
            return lit.includes(id) ? C.sage : 'rgba(45,31,20,0.13)';
        }
        function w(id) {
            if (id === 3) return done ? 4.5 : 2;
            return lit.includes(id) ? 4.5 : 2.5;
        }
        function fill(id) {
            if (id === 3) return done ? C.coral+'22' : 'none';
            return lit.includes(id) ? C.sage+'18' : 'none';
        }

        return e('svg', {
            viewBox:'0 0 200 260', width:'100%', height:'100%',
            style:{ display:'block' }
        },
            e('defs', null,
                e('pattern', { id:'htpGrid', width:18, height:18, patternUnits:'userSpaceOnUse' },
                    e('path', { d:'M 18 0 L 0 0 0 18', fill:'none', stroke:'rgba(45,31,20,0.045)', strokeWidth:0.5 })
                )
            ),
            e('rect', { width:200, height:260, fill:'url(#htpGrid)' }),

            // Spine
            e('line', { x1:100, y1:10, x2:100, y2:240,
                stroke:'rgba(45,31,20,0.09)', strokeWidth:2.5, strokeDasharray:'5 5' }),

            // Ribcage
            e('ellipse', { cx:100, cy:155, rx:36, ry:44,
                fill:'none', stroke:'rgba(45,31,20,0.07)', strokeWidth:1.5 }),

            // ── CLAVICLE (0) ──
            e('path', {
                d:'M 100 62 C 84 56 72 58 64 64 C 60 67 61 73 66 74 C 72 76 80 72 90 68 L 100 66',
                fill:'none', stroke:col(0), strokeWidth:w(0), strokeLinecap:'round',
                style:{ transition:'stroke 0.35s, stroke-width 0.35s' }
            }),
            e('path', {
                d:'M 100 62 C 116 56 128 58 136 64 C 140 67 139 73 134 74 C 128 76 120 72 110 68 L 100 66',
                fill:'none', stroke:col(0), strokeWidth:w(0), strokeLinecap:'round',
                style:{ transition:'stroke 0.35s, stroke-width 0.35s' }
            }),
            lit.includes(0) && e('g', { style:{ animation:'htpFadeIn 0.3s ease' } },
                e('rect', { x:74, y:42, width:52, height:15, rx:4, fill:C.sage }),
                e('text', { x:100, y:53, textAnchor:'middle', fontFamily:'DM Sans,sans-serif', fontSize:8, fontWeight:700, fill:'white', letterSpacing:'0.05em' }, 'CLAVICLE')
            ),

            // ── SCAPULA (1) ──
            e('path', {
                d:'M 64 64 C 54 76 50 94 52 112 C 54 126 62 132 70 128 C 78 124 80 112 76 98 C 72 84 68 72 64 64 Z',
                fill:fill(1), stroke:col(1), strokeWidth:w(1), strokeLinejoin:'round',
                style:{ transition:'stroke 0.35s, fill 0.35s, stroke-width 0.35s' }
            }),
            e('path', { d:'M 52 112 L 74 106', fill:'none', stroke:col(1), strokeWidth:lit.includes(1)?3:1.5, strokeLinecap:'round', style:{ transition:'stroke 0.35s' } }),
            lit.includes(1) && e('g', { style:{ animation:'htpFadeIn 0.3s ease' } },
                e('rect', { x:22, y:100, width:50, height:15, rx:4, fill:C.sage }),
                e('text', { x:47, y:111, textAnchor:'middle', fontFamily:'DM Sans,sans-serif', fontSize:8, fontWeight:700, fill:'white', letterSpacing:'0.05em' }, 'SCAPULA')
            ),

            // ── HUMERUS (2) ──
            e('ellipse', { cx:66, cy:128, rx:9, ry:9,
                fill:fill(2), stroke:col(2), strokeWidth:lit.includes(2)?4:2,
                style:{ transition:'stroke 0.35s, fill 0.35s' }
            }),
            e('path', {
                d:'M 60 137 C 58 155 57 172 58 188 C 60 193 66 193 68 188 C 70 172 70 155 70 137',
                fill:fill(2), stroke:col(2), strokeWidth:w(2), strokeLinecap:'round',
                style:{ transition:'stroke 0.35s, fill 0.35s, stroke-width 0.35s' }
            }),
            lit.includes(2) && e('g', { style:{ animation:'htpFadeIn 0.3s ease' } },
                e('rect', { x:22, y:155, width:52, height:15, rx:4, fill:C.sage }),
                e('text', { x:48, y:166, textAnchor:'middle', fontFamily:'DM Sans,sans-serif', fontSize:8, fontWeight:700, fill:'white', letterSpacing:'0.05em' }, 'HUMERUS')
            ),

            // ── RADIUS (3 = end) ──
            // Elbow joint
            e('ellipse', { cx:63, cy:192, rx:7, ry:7,
                fill:fill(3), stroke:col(3), strokeWidth:done?4:1.5,
                style:{ transition:'stroke 0.4s, fill 0.4s, stroke-width 0.4s' }
            }),
            // Shaft
            e('path', {
                d:'M 58 199 C 56 214 56 228 58 240 C 60 244 64 244 65 240 C 67 228 67 214 66 199',
                fill:fill(3), stroke:col(3), strokeWidth:w(3), strokeLinecap:'round',
                style:{ transition:'stroke 0.4s, fill 0.4s, stroke-width 0.4s' }
            }),
            // Target ring — always show when not yet won
            !done && e('g', { style:{ opacity:0.5 } },
                e('ellipse', { cx:63, cy:192, rx:11, ry:11,
                    fill:'none', stroke:C.coral, strokeWidth:1.5, strokeDasharray:'3 2' }),
                e('text', { x:82, y:196, fontFamily:'DM Sans,sans-serif', fontSize:8, fill:C.coral, fontWeight:700 }, 'TARGET')
            ),
            done && e('g', { style:{ animation:'htpFadeIn 0.3s ease' } },
                e('rect', { x:22, y:232, width:48, height:15, rx:4, fill:C.coral }),
                e('text', { x:46, y:243, textAnchor:'middle', fontFamily:'DM Sans,sans-serif', fontSize:8, fontWeight:700, fill:'white', letterSpacing:'0.05em' }, 'RADIUS')
            )
        );
    }

    // ── ANIMATED DEMO ─────────────────────────────────────────────────────────
    // Path: Clavicle(start, given) → Scapula(guess1) → Humerus(guess2) → Radius(end, auto-reveals on win)
    // The end bone is NEVER typed — it auto-lights when the chain is complete.
    //
    // Timeline (9s loop):
    //   0.0  — start: clavicle green, radius dashed ring, rest hidden
    //   1.0  — types "Scap"
    //   1.8  — suggestion highlights
    //   2.5  — Scapula confirmed → chain row appears green, SVG lights
    //   4.0  — types "Hum"
    //   4.8  — suggestion highlights
    //   5.5  — Humerus confirmed → chain row appears green, SVG lights
    //   6.2  — WIN: Radius auto-reveals coral, "Path Found!" flash
    //   8.5  — reset

    function PathfindingDemo() {
        var phaseS = useState(0); var phase = phaseS[0]; var setPhase = phaseS[1];
        var typedS = useState(''); var typed = typedS[0]; var setTyped = typedS[1];
        var timers = useRef([]);

        function clear() { timers.current.forEach(clearTimeout); }

        function run() {
            clear();
            setPhase(0); setTyped('');
            var seq = [
                [900,  function(){ setPhase(1); }],              // cursor appears in input
                [1500, function(){ setTyped('Scap'); }],          // types Scap
                [2300, function(){ setPhase(2); setTyped(''); }], // Scapula confirmed
                [3800, function(){ setPhase(3); }],               // cursor again
                [4400, function(){ setTyped('Hum'); }],           // types Hum
                [5200, function(){ setPhase(4); setTyped(''); }], // Humerus confirmed
                [5900, function(){ setPhase(5); }],               // WIN — radius auto-reveals
                [8300, function(){ setPhase(0); setTyped(''); }], // reset
            ];
            timers.current = seq.map(function(p){ return setTimeout(p[1], p[0]); });
        }

        useEffect(function(){
            run();
            var loop = setInterval(run, 9000);
            return function(){ clear(); clearInterval(loop); };
        }, []);

        // SVG: which bones are lit green
        var lit = [0]; // clavicle always green (it's the start)
        if (phase >= 2) lit = [0, 1];
        if (phase >= 4) lit = [0, 1, 2];
        var done = phase >= 5; // radius auto-reveals coral on win

        // Suggestion text shown above input
        var showSugg = phase === 1 || phase === 3;
        var suggText = phase === 1 ? 'Scapula' : 'Humerus';

        // Guess count shown in bar (we have 8 guesses, used 1 per correct)
        var guessesUsed = phase >= 4 ? 2 : phase >= 2 ? 1 : 0;
        var guessesLeft = 8 - guessesUsed;

        // Chain panel row renderer — matches pathfindingUI.js exactly
        function chainRow(label, state) {
            // states: 'start' | 'hidden' | 'found' | 'end-dim' | 'end-lit'
            var isStart  = state === 'start';
            var isEndLit = state === 'end-lit';
            var isEndDim = state === 'end-dim';
            var shown    = state === 'start' || state === 'found' || state === 'end-lit';
            var bg  = isStart  ? 'rgba(90,138,106,0.12)'
                    : isEndLit ? 'rgba(232,96,60,0.1)'
                    : shown    ? 'rgba(90,138,106,0.08)'
                    : 'rgba(45,31,20,0.02)';
            var bdr = isStart  ? 'rgba(90,138,106,0.35)'
                    : isEndLit ? 'rgba(232,96,60,0.3)'
                    : isEndDim ? 'rgba(232,96,60,0.2)'  // always slightly coral-tinted
                    : shown    ? 'rgba(90,138,106,0.25)'
                    : C.border;
            var col = isStart  ? C.sage
                    : isEndLit ? C.coral
                    : isEndDim ? C.coral
                    : shown    ? C.sage
                    : C.muted;
            var ico = isStart  ? '📍'
                    : isEndLit ? '🎯'
                    : isEndDim ? '🎯'
                    : shown    ? '✓'
                    : '·';
            return e('div', { style:{
                padding:'5px 8px', marginBottom:3, borderRadius:7,
                fontSize:9, fontWeight:700, fontFamily:'DM Sans,sans-serif',
                textTransform:'uppercase', letterSpacing:'0.04em',
                display:'flex', justifyContent:'space-between', alignItems:'center',
                opacity: (state === 'hidden') ? 0.2 : isEndDim ? 0.35 : 1,
                background:bg, border:'1.5px solid '+bdr, color:col,
                transition:'all 0.4s'
            }},
                e('span', null, shown || isEndDim ? label : '???'),
                e('span', { style:{ fontSize:13 } }, ico)
            );
        }

        var scapState = phase >= 2 ? 'found'   : 'hidden';
        var humState  = phase >= 4 ? 'found'   : 'hidden';
        var radState  = phase >= 5 ? 'end-lit' : 'end-dim'; // always shown, just dim/lit

        return e('div', { style:{
            border:'2px solid '+C.border, borderRadius:14, overflow:'hidden',
            background:C.cream, userSelect:'none'
        }},

            // ── Challenge bar ─────────────────────────────────────────────
            e('div', { style:{
                background:C.dark, padding:'8px 14px',
                display:'flex', alignItems:'center', justifyContent:'space-between'
            }},
                e('div', { style:{ display:'flex', alignItems:'center', gap:8 } },
                    e('span', { style:{
                        fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13,
                        color:'#a8d5b5', fontStyle:'italic'
                    }}, 'Clavicle'),
                    e('span', { style:{ color:'rgba(253,246,236,0.25)', fontSize:9 } }, '→→→'),
                    e('span', { style:{
                        fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13,
                        color:C.coral, fontStyle:'italic'
                    }}, 'Radius'),
                    e('span', { style:{
                        fontFamily:'DM Sans,sans-serif', fontSize:8,
                        color:'rgba(253,246,236,0.3)', marginLeft:6
                    }}, 'Find the connecting path')
                ),
                e('div', { style:{ display:'flex', alignItems:'baseline', gap:4 } },
                    e('span', { style:{
                        fontFamily:'Fraunces,serif', fontWeight:900, fontSize:20,
                        color:'rgba(253,246,236,0.85)'
                    }}, done ? '🏆' : guessesLeft),
                    !done && e('span', { style:{
                        fontFamily:'DM Sans,sans-serif', fontSize:8,
                        color:'rgba(253,246,236,0.35)', marginLeft:2
                    }}, 'left')
                )
            ),

            // ── 3D + panel ────────────────────────────────────────────────
            e('div', { style:{ display:'flex', height:260 } },

                // 3D viewport
                e('div', { style:{
                    flex:'0 0 55%', position:'relative',
                    background:'radial-gradient(ellipse at 50% 40%, #f5e8d0 0%, #ede0c8 60%, #e4d4b8 100%)',
                    borderRight:'2px solid '+C.border,
                    display:'flex', alignItems:'center', justifyContent:'center'
                }},
                    e('div', { style:{ width:160, height:240 } },
                        e(SkeletonSVG, { lit:lit, done:done })
                    ),
                    done && e('div', { style:{
                        position:'absolute', inset:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        background:'rgba(90,138,106,0.13)',
                        animation:'htpWin 0.4s ease forwards'
                    }},
                        e('div', { style:{
                            fontFamily:'Fraunces,serif', fontWeight:900, fontSize:20,
                            color:C.sage, letterSpacing:'-0.03em',
                            textShadow:'0 2px 8px rgba(90,138,106,0.3)'
                        }}, 'Path Found! ✓')
                    )
                ),

                // Right panel
                e('div', { style:{ flex:1, display:'flex', flexDirection:'column', background:C.cream } },
                    // Header
                    e('div', { style:{
                        padding:'7px 12px 5px', borderBottom:'1px solid '+C.border,
                        display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0
                    }},
                        e('div', { style:{ display:'flex', alignItems:'center', gap:5 } },
                            e('span', { style:{ fontSize:11 } }, '🦴'),
                            e('span', { style:{
                                fontFamily:'DM Sans,sans-serif', fontSize:8, color:C.sage,
                                textTransform:'uppercase', letterSpacing:'0.22em', fontWeight:700
                            }}, 'Path')
                        ),
                        e('span', { style:{
                            fontFamily:'Fraunces,serif', fontSize:12, color:C.sage, fontWeight:900
                        }}, guessesUsed+' / 2')
                    ),
                    // Chain rows — 4 bones, end always visible
                    e('div', { style:{ flex:1, padding:'7px 10px', overflowY:'hidden' } },
                        chainRow('Clavicle', 'start'),
                        chainRow('Scapula',  scapState),
                        chainRow('Humerus',  humState),
                        chainRow('Radius',   radState)
                    ),
                    // Detours row
                    e('div', { style:{
                        borderTop:'1px solid '+C.border, padding:'5px 12px 4px', flexShrink:0
                    }},
                        e('div', { style:{
                            fontFamily:'DM Sans,sans-serif', fontSize:8, color:C.golden,
                            textTransform:'uppercase', letterSpacing:'0.22em', fontWeight:700, opacity:0.6
                        }}, '⚠ Detours · 0')
                    )
                )
            ),

            // ── Search bar ────────────────────────────────────────────────
            e('div', { style:{
                borderTop:'2px solid '+C.border, padding:'9px 12px',
                background:C.cream, position:'relative'
            }},
                showSugg && e('div', { style:{
                    position:'absolute', bottom:'100%', left:12, right:12,
                    background:C.cream, border:'2px solid '+C.border,
                    borderBottom:'none', borderRadius:'10px 10px 0 0', overflow:'hidden',
                    boxShadow:'0 -6px 20px rgba(45,31,20,0.08)'
                }},
                    e('div', { style:{
                        padding:'8px 12px', fontSize:10, fontWeight:600,
                        fontFamily:'DM Sans,sans-serif', textTransform:'uppercase',
                        letterSpacing:'0.08em', color:'white',
                        background:'linear-gradient(135deg,'+C.coral+','+C.coralDk+')'
                    }}, suggText + ' ↵ Enter')
                ),
                e('div', { style:{ position:'relative' } },
                    e('span', { style:{
                        position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
                        fontSize:13, pointerEvents:'none',
                        color: typed ? C.coral : C.muted
                    }}, '🦴'),
                    e('div', { style:{
                        width:'100%', background: done ? 'rgba(45,31,20,0.04)' : C.card,
                        border:'2px solid '+(typed ? C.coral : C.border),
                        borderRadius:9, padding:'8px 12px 8px 32px',
                        fontFamily:'DM Sans,sans-serif', fontSize:11,
                        color: typed ? C.ink : C.muted,
                        minHeight:34, transition:'border-color 0.2s',
                        display:'flex', alignItems:'center',
                        opacity: done ? 0.5 : 1
                    }},
                        done
                            ? e('span', { style:{ fontStyle:'italic', opacity:0.6 } }, 'Path complete!')
                            : typed
                                ? e('span', null, typed,
                                    e('span', { style:{
                                        display:'inline-block', width:1.5, height:13,
                                        background:C.ink, marginLeft:1, verticalAlign:'middle',
                                        animation:'htpBlink 0.7s step-end infinite'
                                    }})
                                  )
                                : e('span', { style:{ fontStyle:'italic', opacity:0.5 } }, 'Type a bone name…')
                    )
                )
            )
        );
    }

    // ── HOW TO STEPS ──────────────────────────────────────────────────────────
    var STEPS = [
        { icon:'📍', head:'Start & End given',    body:'Each puzzle gives you two bones. The start is revealed — the end is shown but locked. Find what connects them.' },
        { icon:'🔗', head:'Guess the stops',       body:'Type any bone that lies on the connecting path. Each correct guess lights up that step in the chain.' },
        { icon:'⚠️', head:'Every guess counts',    body:'Straying off the optimal path is penalised — and taking a wildly wrong turn will hit your score hard. Choose carefully.' },
        { icon:'🏆', head:'Complete the chain',    body:'Fill every stop between start and end to win. The fewer guesses used, the better your result.' },
    ];

    // ── MODAL CONTENT ─────────────────────────────────────────────────────────
    function HowToContent(props) {
        var onClose = props.onClose;
        return e('div', { style:{
            background:C.cream, borderRadius:20, maxWidth:520, width:'95vw',
            border:'2px solid '+C.border, overflow:'hidden',
            boxShadow:'0 32px 64px rgba(45,31,20,0.2)',
            fontFamily:'DM Sans,sans-serif', maxHeight:'90vh', overflowY:'auto'
        }},
            // Header
            e('div', { style:{
                padding:'18px 22px 14px', borderBottom:'2px solid '+C.border,
                display:'flex', justifyContent:'space-between', alignItems:'center',
                background:C.card, flexShrink:0
            }},
                e('div', null,
                    e('div', { style:{ lineHeight:1 } },
                        e('span', { style:{
                            fontFamily:'Fraunces,serif', fontWeight:900,
                            fontSize:24, color:C.ink, letterSpacing:'-0.04em'
                        }}, 'How to '),
                        e('span', { style:{
                            fontFamily:'Fraunces,serif', fontWeight:900,
                            fontSize:24, color:C.coral, letterSpacing:'-0.04em', fontStyle:'italic'
                        }}, 'Play')
                    ),
                    e('div', { style:{
                        fontFamily:'DM Sans,sans-serif', fontSize:10, color:C.muted,
                        textTransform:'uppercase', letterSpacing:'0.18em', marginTop:4
                    }}, 'Pathfinding · Osteomle')
                ),
                e('button', { onClick:onClose, style:{
                    background:'none', border:'1.5px solid '+C.border,
                    borderRadius:'50%', width:32, height:32, cursor:'pointer',
                    color:C.muted, fontSize:18, display:'flex',
                    alignItems:'center', justifyContent:'center',
                    flexShrink:0, transition:'all 0.2s'
                }}, '×')
            ),

            e('div', { style:{ padding:'18px 22px' } },
                // Demo animation
                e('div', { style:{ marginBottom:18 } },
                    e(PathfindingDemo)
                ),

                // Steps grid
                e('div', { style:{
                    display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18
                }},
                    STEPS.map(function(s, i) {
                        return e('div', { key:i, style:{
                            padding:'12px 13px', borderRadius:11,
                            background:C.card, border:'1.5px solid '+C.border
                        }},
                            e('div', { style:{ fontSize:20, marginBottom:6, lineHeight:1 } }, s.icon),
                            e('div', { style:{
                                fontFamily:'Fraunces,serif', fontWeight:700,
                                fontSize:13, color:C.ink, marginBottom:3, lineHeight:1.2
                            }}, s.head),
                            e('div', { style:{ fontSize:11, color:C.muted, lineHeight:1.5 } }, s.body)
                        );
                    })
                ),

                // Colour key
                e('div', { style:{
                    display:'flex', gap:14, flexWrap:'wrap', marginBottom:18,
                    padding:'10px 12px', background:C.card,
                    border:'1.5px solid '+C.border, borderRadius:10
                }},
                    [
                        { col:C.sage,    label:'On the optimal path' },
                        { col:C.golden,  label:'Detour (valid, longer)' },
                        { col:C.coralDk, label:'Wrong bone' },
                        { col:'#8b5cf6', label:'Revealed after loss' },
                    ].map(function(k, i) {
                        return e('div', { key:i, style:{
                            display:'flex', alignItems:'center', gap:6
                        }},
                            e('div', { style:{
                                width:9, height:9, borderRadius:'50%',
                                background:k.col, flexShrink:0
                            }}),
                            e('span', { style:{ fontSize:10, color:C.muted } }, k.label)
                        );
                    })
                ),

                // CTA
                e('button', { onClick:onClose, style:{
                    width:'100%', padding:'13px 0', borderRadius:10,
                    background:'linear-gradient(135deg,'+C.coral+','+C.coralDk+')',
                    color:'white', border:'none', cursor:'pointer',
                    fontFamily:'Fraunces,serif', fontWeight:900,
                    fontSize:14, textTransform:'uppercase', letterSpacing:'0.1em',
                    boxShadow:'0 4px 14px rgba(232,96,60,0.28)'
                }}, "Let's Play →")
            )
        );
    }

    // ── FULL MODAL ────────────────────────────────────────────────────────────
    function HowToModal(props) {
        if (!props.show) return null;
        return e('div', {
            onClick: function(ev){ if (ev.target === ev.currentTarget) props.onClose(); },
            style:{
                position:'fixed', inset:0, zIndex:800,
                display:'flex', alignItems:'center', justifyContent:'center',
                padding:20, backdropFilter:'blur(14px)',
                background:'rgba(45,31,20,0.52)'
            }
        },
            e(HowToContent, { onClose:props.onClose })
        );
    }

    // ── ⓘ ICON BUTTON ────────────────────────────────────────────────────────
    // tooltip=true  → index mode: hover shows compact popover, no modal
    // tooltip=false → in-game: click opens full modal
    function HowToIcon(props) {
        var tooltip    = !!props.tooltip;
        var modalState = useState(false);
        var showModal  = modalState[0]; var setShowModal = modalState[1];
        var hoverState = useState(false);
        var hovered    = hoverState[0]; var setHovered   = hoverState[1];

        return e('div', { style:{ position:'relative', display:'inline-flex' } },
            // The ⓘ button itself
            e('button', {
                onClick:      function(){ if (!tooltip) setShowModal(true); },
                onMouseEnter: function(){ setHovered(true); },
                onMouseLeave: function(){ setHovered(false); },
                title: 'How to play',
                style:{
                    width:28, height:28, borderRadius:'50%',
                    background: hovered ? 'rgba(232,96,60,0.08)' : 'transparent',
                    border:'1.5px solid '+(hovered ? C.coral : C.border),
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', transition:'all 0.18s', flexShrink:0,
                    color: hovered ? C.coral : C.muted,
                    fontFamily:'Georgia,serif', fontWeight:700, fontSize:14,
                    fontStyle:'italic'
                }
            }, 'i'),

            // Tooltip popover (index hover mode)
            tooltip && hovered && e('div', { style:{
                position:'absolute', bottom:'calc(100% + 10px)', right:0,
                width:300, background:C.cream,
                border:'2px solid '+C.border, borderRadius:14,
                boxShadow:'0 16px 40px rgba(45,31,20,0.16)',
                padding:'14px 16px', zIndex:900,
                pointerEvents:'none', textAlign:'left'
            }},
                e('div', { style:{
                    fontFamily:'Fraunces,serif', fontWeight:900,
                    fontSize:15, color:C.ink, marginBottom:6, letterSpacing:'-0.02em'
                }}, 'How to Play'),
                e('div', { style:{
                    fontSize:11, color:C.muted, lineHeight:1.55, marginBottom:12
                }}, 'Find the hidden path between two bones. Guess connecting bones one at a time — each correct answer reveals a step in the chain.'),
                e('div', { style:{ display:'flex', flexDirection:'column', gap:7 } },
                    [
                        { ico:'📍', txt:'Start bone is shown' },
                        { ico:'🔗', txt:'Guess bones that connect them' },
                        { ico:'🎯', txt:'Reach the target to win' },
                        { ico:'⚠️', txt:'Wrong or long-route guesses cost you' },
                    ].map(function(row, i){
                        return e('div', { key:i, style:{
                            display:'flex', alignItems:'center', gap:8,
                            fontSize:11, color:C.ink
                        }},
                            e('span', { style:{ fontSize:13 } }, row.ico),
                            e('span', null, row.txt)
                        );
                    })
                ),
                // Caret arrow
                e('div', { style:{
                    position:'absolute', bottom:-7, right:10,
                    width:12, height:12, background:C.cream,
                    border:'2px solid '+C.border, borderTop:'none', borderLeft:'none',
                    transform:'rotate(45deg)'
                }})
            ),

            // Full modal for in-game icon
            !tooltip && e(HowToModal, {
                show:showModal,
                onClose: function(){ setShowModal(false); }
            })
        );
    }

    // ── EXPORTS ───────────────────────────────────────────────────────────────
    window.HowToIcon     = HowToIcon;
    window.HowToModal    = HowToModal;
    window.HowToContent  = HowToContent;
    window.useFirstVisit = useFirstVisit;

})();
