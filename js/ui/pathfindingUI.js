// ============================================================================
// ANATOMLE - PATHFINDING UI (React.createElement only — no JSX)
// Loads as plain <script> tag, no Babel required
// ============================================================================
(function () {
    var e = React.createElement;
    var useRef    = React.useRef;
    var useEffect = React.useEffect;

    var C = {
        cream:     '#fdf6ec',
        card:      '#fff8f0',
        border:    '#e8d5c0',
        ink:       '#2d1f14',
        inkLight:  '#4a3728',
        muted:     '#9a8070',
        coral:     '#e8603c',
        coralDk:   '#c94d2b',
        golden:    '#f0a500',
        sage:      '#5a8a6a',
        purple:    '#8b5cf6',
        dark:      'rgba(45,31,20,0.94)',
    };
    var NAV=58, BAR=46, SRCH=68, PW=420, AW=160;

    function hd(icon, label, val, col) {
        return e('div', { style:{ padding:'10px 16px 8px', display:'flex',
            justifyContent:'space-between', alignItems:'center', flexShrink:0,
            borderBottom:'1px solid '+C.border } },
            e('div', { style:{ display:'flex', alignItems:'center', gap:6 } },
                e('span', { style:{ fontSize:12 } }, icon),
                e('span', { style:{ fontFamily:'DM Sans,sans-serif', fontSize:9, color:col,
                    textTransform:'uppercase', letterSpacing:'0.22em', fontWeight:700 } }, label)
            ),
            e('span', { style:{ fontFamily:'Fraunces,serif', fontSize:13, color:col, fontWeight:900 } }, val)
        );
    }

    function PathfindingUI(props) {
        var s  = props.state,
            h  = props.handlers,
            gt = props.gameTitle;

        var target=s.target, chain=s.chain, left=s.left, max=s.max,
            bad=s.bad, detours=s.detours, input=s.input, selIdx=s.selIdx,
            phase=s.phase, reveal=s.reveal, suggestions=s.suggestions;

        var inputRef = useRef(null);
        useEffect(function(){ if(phase==='playing' && inputRef.current) inputRef.current.focus(); }, [phase]);

        var guessed = chain.filter(function(c){ return c.guessed; });
        var danger  = left <= 3;

        // NAVBAR
        var nav = e('div', { style:{ position:'fixed', top:0, left:0, right:0, height:NAV, zIndex:300,
            background:C.cream, borderBottom:'2px solid '+C.border,
            display:'grid', gridTemplateColumns:'1fr auto 1fr',
            alignItems:'center', padding:'0 20px',
            boxShadow:'0 2px 16px rgba(45,31,20,0.07)' } },
            e('div', null),
            e('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 } },
                e('div', { style:{ display:'flex', alignItems:'baseline' } },
                    e('span', { style:{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22, color:C.ink, letterSpacing:'-0.04em' } }, 'Anat'),
                    e('span', { style:{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22, color:C.coral, letterSpacing:'-0.04em', fontStyle:'italic' } }, 'om'),
                    e('span', { style:{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22, color:C.ink, letterSpacing:'-0.04em' } }, 'le')
                ),
                e('span', { style:{ fontFamily:'DM Sans,sans-serif', fontSize:8, color:C.muted,
                    textTransform:'uppercase', letterSpacing:'0.25em' } }, gt)
            ),
            e('div', { style:{ display:'flex', justifyContent:'flex-end' } },
                e('a', { href:'../index.html', style:{ fontFamily:'DM Sans,sans-serif', fontSize:9,
                    color:C.muted, textDecoration:'none', textTransform:'uppercase',
                    letterSpacing:'0.12em', padding:'6px 14px',
                    border:'1.5px solid '+C.border, borderRadius:999 } }, '\u2190 Menu')
            )
        );

        // CHALLENGE BAR
        var bar = e('div', { style:{ position:'fixed', top:NAV, left:0, right:PW+AW, height:BAR,
            zIndex:200, background:C.dark, backdropFilter:'blur(6px)',
            display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px' } },
            e('div', { style:{ display:'flex', alignItems:'center', gap:10 } },
                e('span', { style:{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:14, color:'#a8d5b5', fontStyle:'italic' } }, target.start),
                e('span', { style:{ color:'rgba(253,246,236,0.25)', margin:'0 4px' } }, '\u2192\u2192\u2192'),
                e('span', { style:{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:14, color:C.coral, fontStyle:'italic' } }, target.end),
                e('span', { style:{ fontFamily:'DM Sans,sans-serif', fontSize:9, color:'rgba(253,246,236,0.3)', marginLeft:10 } }, 'Find the path')
            ),
            e('div', { style:{ display:'flex', alignItems:'center', gap:6 } },
                e('span', { style:{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22,
                    color: danger ? C.coral : 'rgba(253,246,236,0.9)', lineHeight:1 } }, left),
                e('span', { style:{ fontFamily:'DM Sans,sans-serif', fontSize:9,
                    color:'rgba(253,246,236,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' } }, ' guesses left')
            )
        );

        // CHAIN ITEMS
        var chainItems = chain.map(function(item, idx){
            var isFirst = item.bone === target.start;
            var isLast  = item.bone === target.end;
            var shown   = item.guessed || isLast || (reveal && phase==='lost');
            var bg  = isFirst ? 'rgba(90,138,106,0.12)' : isLast ? 'rgba(232,96,60,0.1)' : item.guessed ? 'rgba(90,138,106,0.08)' : 'rgba(45,31,20,0.02)';
            var bdr = isFirst ? 'rgba(90,138,106,0.35)' : isLast ? 'rgba(232,96,60,0.3)' : item.guessed ? 'rgba(90,138,106,0.25)' : C.border;
            var col = isFirst ? C.sage : isLast ? C.coral : item.guessed ? C.sage : C.muted;
            var ico = isFirst ? '\uD83D\uDCCD' : isLast ? '\uD83C\uDFAF' : item.guessed ? '\u2713' : '\u00B7';
            return e('div', { key:idx, style:{ padding:'6px 10px', marginBottom:3, borderRadius:8,
                fontSize:10, fontWeight:600, fontFamily:'DM Sans,sans-serif',
                textTransform:'uppercase', letterSpacing:'0.04em',
                display:'flex', justifyContent:'space-between', alignItems:'center',
                opacity: shown ? 1 : 0.2, background:bg,
                border:'1.5px solid '+bdr, color:col } },
                e('span', null, shown ? item.bone : '???'),
                e('span', null, ico)
            );
        });

        var detourItems = detours.length === 0
            ? [e('div', { key:'x', style:{ fontFamily:'DM Sans,sans-serif', fontSize:9, color:C.muted, textAlign:'center', marginTop:6, fontStyle:'italic' } }, 'None yet')]
            : detours.map(function(b){ return e('div', { key:b, style:{ padding:'5px 10px', marginBottom:3, borderRadius:8,
                background:'rgba(240,165,0,0.08)', border:'1.5px solid rgba(240,165,0,0.3)',
                fontSize:10, color:C.golden, fontWeight:600, fontFamily:'DM Sans,sans-serif',
                textTransform:'uppercase', letterSpacing:'0.04em' } }, '\u26A0 '+b); });

        var badItems = bad.length === 0
            ? [e('div', { key:'x', style:{ fontFamily:'DM Sans,sans-serif', fontSize:9, color:C.muted, textAlign:'center', marginTop:6, fontStyle:'italic' } }, 'None yet')]
            : bad.map(function(b){ return e('div', { key:b, className:'shake', style:{ padding:'5px 10px', marginBottom:3, borderRadius:8,
                background:'rgba(201,77,43,0.07)', border:'1.5px solid rgba(201,77,43,0.25)',
                fontSize:10, color:C.coralDk, fontWeight:600, fontFamily:'DM Sans,sans-serif',
                textTransform:'uppercase', letterSpacing:'0.04em' } }, '\u2717 '+b); });

        // RIGHT PANEL
        var panel = e('div', { style:{ position:'fixed', top:NAV, right:AW, width:PW, bottom:0, zIndex:200,
            background:C.cream, borderLeft:'2px solid '+C.border, display:'flex', flexDirection:'column',
            boxShadow:'-4px 0 24px rgba(45,31,20,0.07)' } },
            e('div', { style:{ flex:'1 1 0', overflow:'hidden', display:'flex', flexDirection:'column', borderBottom:'2px solid '+C.border } },
                hd('\uD83E\uDDB4', 'Path', guessed.length+' / '+(chain.length-1), C.sage),
                e('div', { className:'scr', style:{ overflowY:'auto', flex:1, padding:'8px 14px' } }, chainItems)
            ),
            e('div', { style:{ flex:'0 0 auto', maxHeight:'26%', overflow:'hidden', display:'flex', flexDirection:'column', borderBottom:'2px solid '+C.border } },
                hd('\u26A0', 'Detours', detours.length, C.golden),
                e('div', { className:'scr', style:{ overflowY:'auto', flex:1, padding:'6px 14px' } }, detourItems)
            ),
            e('div', { style:{ flex:'0 0 auto', maxHeight:'24%', overflow:'hidden', display:'flex', flexDirection:'column', borderBottom:'2px solid '+C.border } },
                hd('\u2717', 'Wrong', bad.length, C.coralDk),
                e('div', { className:'scr', style:{ overflowY:'auto', flex:1, padding:'6px 14px' } }, badItems)
            ),
            e('div', { style:{ padding:14, flexShrink:0 } },
                e('button', {
                    onClick: phase==='playing' ? h.onGiveUp : h.onNewGame,
                    style:{ width:'100%', padding:'12px 0', borderRadius:10,
                        background: phase==='playing' ? 'rgba(45,31,20,0.05)' : 'linear-gradient(135deg,'+C.coral+','+C.coralDk+')',
                        color: phase==='playing' ? C.muted : 'white',
                        border: phase==='playing' ? '1.5px solid '+C.border : 'none',
                        fontFamily:'Fraunces,serif', fontWeight:900, fontSize:12,
                        textTransform:'uppercase', letterSpacing:'0.15em', cursor:'pointer' }
                }, phase==='playing' ? 'Give Up' : 'Next Case \u2192')
            )
        );

        // SEARCH BAR
        var dropdown = suggestions.length > 0
            ? e('div', { style:{ position:'absolute', bottom:'100%', left:0, right:0,
                background:C.cream, border:'2px solid '+C.border, borderBottom:'none',
                zIndex:400, maxHeight:220, overflowY:'auto',
                borderRadius:'12px 12px 0 0', boxShadow:'0 -8px 24px rgba(45,31,20,0.1)' } },
                suggestions.map(function(s,i){ return e('div', { key:s,
                    onClick: function(){ h.onSubmit(s); },
                    style:{ padding:'10px 16px', fontSize:11, fontWeight:600,
                        fontFamily:'DM Sans,sans-serif', textTransform:'uppercase',
                        letterSpacing:'0.08em', cursor:'pointer',
                        color: i===selIdx ? 'white' : C.ink,
                        background: i===selIdx ? 'linear-gradient(135deg,'+C.coral+','+C.coralDk+')' : 'transparent',
                        borderBottom:'1px solid '+C.border } }, s); })
              )
            : null;

        var search = e('div', { style:{ position:'fixed', bottom:0, left:0, right:PW+AW, height:SRCH,
            zIndex:250, background:C.cream, borderTop:'2px solid '+C.border,
            padding:'11px 16px', display:'flex', alignItems:'center',
            boxShadow:'0 -2px 12px rgba(45,31,20,0.06)' } },
            e('div', { style:{ flex:1, position:'relative' } },
                dropdown,
                e('div', { style:{ position:'relative' } },
                    e('span', { style:{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)',
                        fontSize:15, pointerEvents:'none', color: phase!=='playing' ? C.muted : C.coral } }, '\uD83E\uDDB4'),
                    e('input', { ref:inputRef, value:input,
                        onChange:h.onInputChange, onKeyDown:h.onKeyDown,
                        disabled: phase!=='playing',
                        placeholder: phase==='playing' ? 'Type a bone name\u2026 select from list \u2191' : 'Game over \u2014 click Next Case \u2192',
                        style:{ width:'100%', background: phase!=='playing' ? 'rgba(45,31,20,0.04)' : C.card,
                            border:'2px solid '+(input && suggestions.length===0 ? C.coralDk : C.border),
                            borderRadius:10, padding:'10px 14px 10px 38px',
                            color:C.ink, fontFamily:'DM Sans,sans-serif', fontSize:12,
                            outline:'none', opacity: phase!=='playing' ? 0.55 : 1 } })
                )
            )
        );

        // OVERLAY
        var overlay = (phase !== 'playing' && !reveal)
            ? e('div', { style:{ position:'fixed', inset:0, zIndex:600,
                display:'flex', alignItems:'center', justifyContent:'center',
                backdropFilter:'blur(16px)',
                background: phase==='won' ? 'rgba(253,246,236,0.82)' : 'rgba(45,31,20,0.78)' } },
                e('div', { style:{ textAlign:'center', padding:'44px 40px',
                    background:C.cream, border:'2px solid '+C.border,
                    borderRadius:24, maxWidth:440, width:'90%',
                    boxShadow:'0 32px 64px rgba(45,31,20,0.18)' } },
                    e('div', { style:{ fontSize:50, marginBottom:10, lineHeight:1 } },
                        phase==='won' ? (detours.length===0 ? '\uD83C\uDFC6' : '\u2713') : '\uD83D\uDCA3'),
                    e('h2', { style:{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:34,
                        color: phase==='won' ? C.ink : C.coralDk,
                        margin:'0 0 6px', letterSpacing:'-0.03em', lineHeight:1 } },
                        phase==='won' ? (detours.length===0 ? 'Perfect Path!' : 'Path Found!') : 'Flatline.'),
                    e('p', { style:{ fontFamily:'DM Sans,sans-serif', color:C.muted, fontSize:13, marginBottom:20 } },
                        phase==='won'
                            ? (detours.length===0
                                ? 'Optimal route! '+(max-left)+'/'+max+' guesses.'
                                : 'Via '+detours.length+' detour'+(detours.length!==1?'s':'')+'. '+(max-left)+'/'+max+' guesses.')
                            : 'Path not found. '+bad.length+' wrong guess'+(bad.length!==1?'es':'')+'.'),
                    e('div', { style:{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:24,
                        padding:'8px 18px', background:'rgba(45,31,20,0.05)', borderRadius:999,
                        border:'1.5px solid '+C.border } },
                        e('span', { style:{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.sage } }, target.start),
                        e('span', { style:{ color:C.muted, fontSize:11 } }, '\u2192'),
                        e('span', { style:{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.coral } }, target.end)
                    ),
                    phase==='lost' ? e('div', { style:{ marginBottom:14 } },
                        e('button', { onClick:h.onReveal,
                            style:{ padding:'8px 20px', background:'transparent', color:C.purple,
                                border:'1.5px solid '+C.purple, borderRadius:999,
                                fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:10,
                                textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer' } },
                            '\uD83D\uDC41 Reveal Path')
                    ) : null,
                    e('div', { style:{ display:'flex', gap:10, justifyContent:'center' } },
                        e('button', { onClick:h.onNewGame,
                            style:{ padding:'12px 26px',
                                background:'linear-gradient(135deg,'+C.coral+','+C.coralDk+')',
                                color:'white', border:'none', borderRadius:10,
                                fontFamily:'Fraunces,serif', fontWeight:900, fontSize:12,
                                textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer',
                                boxShadow:'0 4px 12px rgba(232,96,60,0.3)' } }, 'Next Case'),
                        e('a', { href:'../index.html',
                            style:{ padding:'12px 26px', background:'rgba(45,31,20,0.05)',
                                color:C.inkLight, border:'1.5px solid '+C.border, borderRadius:10,
                                fontFamily:'Fraunces,serif', fontWeight:700, fontSize:12,
                                textTransform:'uppercase', letterSpacing:'0.1em',
                                textDecoration:'none', display:'flex', alignItems:'center' } }, 'Menu')
                    )
                )
              )
            : null;

        return e(React.Fragment, null, nav, bar, panel, search, overlay);
    }

    window.PathfindingUI = PathfindingUI;
})();
