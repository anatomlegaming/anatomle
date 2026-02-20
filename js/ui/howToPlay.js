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
    // Clean anatomical upper-body silhouette — clavicle, scapula, humerus
    // lit = array of bone ids that are currently highlighted
    // boneId: 0=clavicle, 1=scapula, 2=humerus
    function SkeletonSVG(props) {
        var lit  = props.lit  || [];
        var done = props.done || false;  // game won — target turns coral

        function boneColor(id) {
            if (!lit.includes(id)) return 'rgba(45,31,20,0.13)';
            if (id === 2 && done) return C.coral;
            return C.sage;
        }
        function boneWidth(id) { return lit.includes(id) ? 4.5 : 2.5; }
        function boneFill(id)  { return lit.includes(id) ? (id===2&&done ? C.coral+'22' : C.sage+'18') : 'none'; }

        var c0 = boneColor(0), c1 = boneColor(1), c2 = boneColor(2);
        var w0 = boneWidth(0), w1 = boneWidth(1), w2 = boneWidth(2);

        return e('svg', {
            viewBox:'0 0 200 250', width:'100%', height:'100%',
            style:{ display:'block' }
        },
            // Background grid — exact same as game viewport
            e('defs', null,
                e('pattern', { id:'htpGrid', width:18, height:18, patternUnits:'userSpaceOnUse' },
                    e('path', { d:'M 18 0 L 0 0 0 18', fill:'none', stroke:'rgba(45,31,20,0.045)', strokeWidth:0.5 })
                )
            ),
            e('rect', { width:200, height:250, fill:'url(#htpGrid)' }),

            // Spine (dashed centre line)
            e('line', { x1:100, y1:10, x2:100, y2:230,
                stroke:'rgba(45,31,20,0.09)', strokeWidth:2.5, strokeDasharray:'5 5' }),

            // Ribcage outline (faint)
            e('ellipse', { cx:100, cy:160, rx:38, ry:48,
                fill:'none', stroke:'rgba(45,31,20,0.07)', strokeWidth:1.5 }),
            e('path', { d:'M 100 112 Q 82 128 76 152 Q 82 174 100 180',
                fill:'none', stroke:'rgba(45,31,20,0.06)', strokeWidth:1 }),
            e('path', { d:'M 100 112 Q 118 128 124 152 Q 118 174 100 180',
                fill:'none', stroke:'rgba(45,31,20,0.06)', strokeWidth:1 }),

            // ── CLAVICLE (id 0) ──────────────────────────────────────────
            // Left clavicle
            e('path', {
                d:'M 100 62 C 84 56 72 58 64 64 C 60 67 61 73 66 74 C 72 76 80 72 90 68 L 100 66',
                fill:'none', stroke:c0, strokeWidth:w0, strokeLinecap:'round',
                style:{ transition:'stroke 0.35s, stroke-width 0.35s' }
            }),
            // Right clavicle
            e('path', {
                d:'M 100 62 C 116 56 128 58 136 64 C 140 67 139 73 134 74 C 128 76 120 72 110 68 L 100 66',
                fill:'none', stroke:c0, strokeWidth:w0, strokeLinecap:'round',
                style:{ transition:'stroke 0.35s, stroke-width 0.35s' }
            }),
            // Clavicle label tag
            lit.includes(0) && e('g', { style:{ animation:'htpFadeIn 0.3s ease' } },
                e('rect', { x:74, y:42, width:52, height:16, rx:5, fill:C.sage }),
                e('text', { x:100, y:54, textAnchor:'middle',
                    fontFamily:'DM Sans,sans-serif', fontSize:9, fontWeight:700,
                    fill:'white', letterSpacing:'0.05em' }, 'CLAVICLE')
            ),

            // ── SCAPULA (id 1) ───────────────────────────────────────────
            e('path', {
                d:'M 64 64 C 54 76 50 94 52 112 C 54 126 62 132 70 128 C 78 124 80 112 76 98 C 72 84 68 72 64 64 Z',
                fill:boneFill(1), stroke:c1, strokeWidth:w1, strokeLinejoin:'round',
                style:{ transition:'stroke 0.35s, fill 0.35s, stroke-width 0.35s' }
            }),
            // Spine of scapula
            e('path', {
                d:'M 52 112 L 74 106',
                fill:'none', stroke:c1, strokeWidth: lit.includes(1) ? 3 : 1.5, strokeLinecap:'round',
                style:{ transition:'stroke 0.35s' }
            }),
            lit.includes(1) && e('g', { style:{ animation:'htpFadeIn 0.3s ease' } },
                e('rect', { x:24, y:100, width:50, height:16, rx:5, fill:C.sage }),
                e('text', { x:49, y:112, textAnchor:'middle',
                    fontFamily:'DM Sans,sans-serif', fontSize:9, fontWeight:700,
                    fill:'white', letterSpacing:'0.05em' }, 'SCAPULA')
            ),

            // ── HUMERUS (id 2) ───────────────────────────────────────────
            // Head
            e('ellipse', { cx:66, cy:128, rx:10, ry:10,
                fill:boneFill(2), stroke:c2, strokeWidth: lit.includes(2) ? 4 : 2,
                style:{ transition:'stroke 0.35s, fill 0.35s' }
            }),
            // Shaft
            e('path', {
                d:'M 60 138 C 58 158 57 178 58 196 C 60 202 66 202 68 196 C 70 180 70 160 70 138',
                fill:boneFill(2), stroke:c2, strokeWidth:w2, strokeLinecap:'round',
                style:{ transition:'stroke 0.35s, fill 0.35s, stroke-width 0.35s' }
            }),
            // Distal end
            lit.includes(2) && e('ellipse', { cx:63, cy:197, rx:8, ry:5,
                fill:done ? C.coral+'44' : C.sage+'44', stroke:done?C.coral:C.sage, strokeWidth:2,
                style:{ animation:'htpFadeIn 0.3s ease', transition:'stroke 0.35s, fill 0.35s' }
            }),
            lit.includes(2) && e('g', { style:{ animation:'htpFadeIn 0.3s ease' } },
                e('rect', { x:22, y:188, width:56, height:16, rx:5,
                    fill: done ? C.coral : C.sage }),
                e('text', { x:50, y:200, textAnchor:'middle',
                    fontFamily:'DM Sans,sans-serif', fontSize:9, fontWeight:700,
                    fill:'white', letterSpacing:'0.05em' }, 'HUMERUS')
            ),

            // Target dashed ring — always visible when humerus not yet lit
            !lit.includes(2) && e('g', { style:{ opacity:0.45 } },
                e('ellipse', { cx:63, cy:197, rx:10, ry:7,
                    fill:'none', stroke:C.coral, strokeWidth:1.5, strokeDasharray:'3 2' }),
                e('text', { x:82, y:201, fontFamily:'DM Sans,sans-serif',
                    fontSize:8, fill:C.coral, fontWeight:700 }, 'TARGET')
            )
        );
    }

    // ── ANIMATED DEMO ─────────────────────────────────────────────────────────
    // Pixel-perfect miniature of the real game
    // Timeline (7s loop):
    //   0.0  — start state: clavicle green, target dashed ring
    //   1.0  — search bar types "Scap"
    //   2.0  — suggestion "Scapula" highlights → user hits enter
    //   2.6  — scapula appears in chain (green), SVG lights up
    //   3.8  — types "Hum"
    //   4.7  — suggestion "Humerus" highlighted
    //   5.2  — humerus appears → WIN state
    //   6.0  — "Path Found!" flash
    //   7.0  — reset

    function PathfindingDemo() {
        var phaseS = useState(0); var phase = phaseS[0]; var setPhase = phaseS[1];
        var typedS = useState(''); var typed = typedS[0]; var setTyped = typedS[1];
        var timers = useRef([]);

        function clear() { timers.current.forEach(clearTimeout); }

        function run() {
            clear();
            setPhase(0); setTyped('');
            var seq = [
                [900,  function(){ setPhase(1); }],           // start typing
                [1500, function(){ setTyped('Scap'); }],
                [2200, function(){ setPhase(2); setTyped(''); }], // scapula confirmed
                [3000, function(){ setPhase(3); }],           // start typing humerus
                [3700, function(){ setTyped('Hum'); }],
                [4400, function(){ setPhase(4); setTyped(''); }], // humerus confirmed → win
                [5000, function(){ setPhase(5); }],           // win banner
                [6800, function(){ setPhase(0); setTyped(''); }], // reset
            ];
            timers.current = seq.map(function(p){ return setTimeout(p[1], p[0]); });
        }

        useEffect(function(){
            run();
            var loop = setInterval(run, 7200);
            return function(){ clear(); clearInterval(loop); };
        }, []);

        var lit  = [0];
        if (phase >= 2) lit = [0, 1];
        if (phase >= 4) lit = [0, 1, 2];
        var done = phase >= 4;
        var showSugg = phase === 1 || phase === 3;
        var suggText = phase === 1 ? 'Scapula' : 'Humerus';

        // Exact chain item style from pathfindingUI.js
        function chainItem(label, state) {
            // state: 'start' | 'hidden' | 'found' | 'target-dim' | 'target-lit'
            var shown   = state !== 'hidden' && state !== 'target-dim';
            var isStart = state === 'start';
            var isEnd   = state === 'target-lit';
            var bg  = isStart ? 'rgba(90,138,106,0.12)'
                    : isEnd   ? 'rgba(232,96,60,0.1)'
                    : shown   ? 'rgba(90,138,106,0.08)'
                    : 'rgba(45,31,20,0.02)';
            var bdr = isStart ? 'rgba(90,138,106,0.35)'
                    : isEnd   ? 'rgba(232,96,60,0.3)'
                    : shown   ? 'rgba(90,138,106,0.25)'
                    : C.border;
            var col = isStart ? C.sage
                    : isEnd   ? C.coral
                    : shown   ? C.sage
                    : C.muted;
            var ico = isStart ? '📍' : isEnd ? '🎯' : shown ? '✓' : '·';
            return e('div', { style:{
                padding:'5px 8px', marginBottom:3, borderRadius:7,
                fontSize:9, fontWeight:700, fontFamily:'DM Sans,sans-serif',
                textTransform:'uppercase', letterSpacing:'0.04em',
                display:'flex', justifyContent:'space-between', alignItems:'center',
                opacity: (state === 'hidden' || state === 'target-dim') ? 0.2 : 1,
                background:bg, border:'1.5px solid '+bdr, color:col,
                transition:'all 0.35s'
            }},
                e('span', null, shown ? label : '???'),
                e('span', null, ico)
            );
        }

        var scapState  = phase >= 2 ? 'found' : 'hidden';
        var humState   = phase >= 4 ? 'target-lit' : 'target-dim';
        var guessCount = phase >= 4 ? 2 : phase >= 2 ? 1 : 0;

        return e('div', { style:{
            border:'2px solid '+C.border, borderRadius:14, overflow:'hidden',
            background:C.cream, userSelect:'none'
        }},

            // ── TOP: challenge bar (exact match) ─────────────────────────
            e('div', { style:{
                background:C.dark, padding:'7px 14px',
                display:'flex', alignItems:'center', justifyContent:'space-between'
            }},
                e('div', { style:{ display:'flex', alignItems:'center', gap:8 } },
                    e('span', { style:{
                        fontFamily:'Fraunces,serif', fontWeight:700, fontSize:12,
                        color:'#a8d5b5', fontStyle:'italic'
                    }}, 'Clavicle'),
                    e('span', { style:{ color:'rgba(253,246,236,0.25)', fontSize:9 } }, '→→→'),
                    e('span', { style:{
                        fontFamily:'Fraunces,serif', fontWeight:700, fontSize:12,
                        color:C.coral, fontStyle:'italic'
                    }}, 'Humerus'),
                    e('span', { style:{
                        fontFamily:'DM Sans,sans-serif', fontSize:8,
                        color:'rgba(253,246,236,0.3)', marginLeft:6
                    }}, 'Find the connecting path')
                ),
                e('div', { style:{ display:'flex', alignItems:'center', gap:4 } },
                    e('span', { style:{
                        fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18,
                        color:'rgba(253,246,236,0.85)'
                    }}, phase >= 5 ? '🏆' : (8 - guessCount)),
                    e('span', { style:{
                        fontFamily:'DM Sans,sans-serif', fontSize:8,
                        color:'rgba(253,246,236,0.35)', marginLeft:2
                    }}, 'left')
                )
            ),

            // ── MIDDLE: 3D panel + right panel side by side ───────────────
            e('div', { style:{ display:'flex', height:240 } },

                // 3D viewport
                e('div', { style:{
                    flex:'0 0 55%', position:'relative',
                    background:'radial-gradient(ellipse at 50% 40%, #f5e8d0 0%, #ede0c8 60%, #e4d4b8 100%)',
                    borderRight:'2px solid '+C.border,
                    display:'flex', alignItems:'center', justifyContent:'center'
                }},
                    e('div', { style:{ width:160, height:210 } },
                        e(SkeletonSVG, { lit:lit, done:done })
                    ),
                    // Win overlay
                    phase === 5 && e('div', { style:{
                        position:'absolute', inset:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        background:'rgba(90,138,106,0.13)',
                        animation:'htpWin 0.4s ease forwards'
                    }},
                        e('div', { style:{
                            fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22,
                            color:C.sage, letterSpacing:'-0.03em',
                            textShadow:'0 2px 8px rgba(90,138,106,0.3)'
                        }}, 'Path Found! ✓')
                    )
                ),

                // Right panel (exact structure from pathfindingUI.js)
                e('div', { style:{
                    flex:1, display:'flex', flexDirection:'column', background:C.cream
                }},
                    // Section header
                    e('div', { style:{
                        padding:'8px 12px 6px', borderBottom:'1px solid '+C.border,
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
                        }}, guessCount+' / 2')
                    ),

                    // Chain items
                    e('div', { style:{ flex:1, padding:'7px 10px', overflowY:'hidden' } },
                        chainItem('Clavicle', 'start'),
                        chainItem('Scapula',  scapState),
                        chainItem('Humerus',  humState)
                    ),

                    // Divider + small detours section
                    e('div', { style:{
                        borderTop:'1px solid '+C.border, padding:'5px 12px 3px',
                        flexShrink:0
                    }},
                        e('div', { style:{
                            fontFamily:'DM Sans,sans-serif', fontSize:8, color:C.golden,
                            textTransform:'uppercase', letterSpacing:'0.22em', fontWeight:700,
                            opacity:0.6
                        }}, '⚠ Detours · 0')
                    )
                )
            ),

            // ── BOTTOM: search bar (exact match) ─────────────────────────
            e('div', { style:{
                borderTop:'2px solid '+C.border, padding:'9px 12px',
                background:C.cream, position:'relative'
            }},
                // Suggestion dropdown
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
                // Input row
                e('div', { style:{ position:'relative' } },
                    e('span', { style:{
                        position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
                        fontSize:13, pointerEvents:'none',
                        color: typed ? C.coral : C.muted
                    }}, '🦴'),
                    e('div', { style:{
                        width:'100%', background:C.card,
                        border:'2px solid '+(typed ? C.coral : C.border),
                        borderRadius:9, padding:'8px 12px 8px 32px',
                        fontFamily:'DM Sans,sans-serif', fontSize:11,
                        color: typed ? C.ink : C.muted,
                        minHeight:34, transition:'border-color 0.2s',
                        display:'flex', alignItems:'center'
                    }},
                        typed
                            ? e('span', null,
                                typed,
                                e('span', { style:{
                                    display:'inline-block', width:1.5, height:13,
                                    background:C.ink, marginLeft:1, verticalAlign:'middle',
                                    animation:'htpBlink 0.7s step-end infinite'
                                }})
                              )
                            : e('span', { style:{ fontStyle:'italic', opacity:0.5 } },
                                phase === 5 ? 'Path complete!' : 'Type a bone name…')
                    )
                )
            )
        );
    }

    // ── HOW TO STEPS ──────────────────────────────────────────────────────────
    var STEPS = [
        { icon:'📍', head:'Start & End given',     body:'Each puzzle gives you two bones. Your goal is to find what connects them.' },
        { icon:'🔗', head:'Guess the stops',        body:'Type any bone that lies on the path. Each correct guess lights up the chain.' },
        { icon:'⚠️', head:'Detours cost guesses',   body:'Valid but non-optimal bones count as detours. Wrong bones lose a guess.' },
        { icon:'🏆', head:'Complete the chain',      body:'Reveal every stop between start and end to win. Fewest guesses wins.' },
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
