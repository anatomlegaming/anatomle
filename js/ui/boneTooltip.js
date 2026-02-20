// ============================================================================
// ANATOMLE — BONE TOOLTIP + INFO CARD
// Pure React.createElement — no JSX, plain <script> tag
//
// Renders two things:
//   1. A floating name tooltip that follows the cursor / tap position
//   2. A info card modal that opens on click/tap showing description + Wikipedia link
//
// Usage:
//   Mount <window.BoneTooltipLayer /> once inside your game root.
//   Then call window.boneTooltip.show(name, x, y)   — on 3D hover / panel hover
//          window.boneTooltip.hide()                 — on mouse leave
//          window.boneTooltip.openCard(name)         — on click / tap
//
// The layer sits at z-index 700 (above game UI, below how-to modal at 800).
// ============================================================================
(function () {
    var e        = React.createElement;
    var useState = React.useState;
    var useEffect= React.useEffect;
    var useRef   = React.useRef;

    var C = {
        cream:   '#fdf6ec',
        card:    '#fff8f0',
        border:  '#e8d5c0',
        ink:     '#2d1f14',
        inkLight:'#4a3728',
        muted:   '#9a8070',
        coral:   '#e8603c',
        coralDk: '#c94d2b',
        sage:    '#5a8a6a',
        dark:    'rgba(45,31,20,0.94)',
    };

    // ── SHARED EVENT BUS ──────────────────────────────────────────────────────
    // Plain object so engines (non-React) can push events in.
    var _listeners = {};
    function emit(event, data) {
        (_listeners[event] || []).forEach(function(fn){ fn(data); });
    }
    function on(event, fn) {
        if (!_listeners[event]) _listeners[event] = [];
        _listeners[event].push(fn);
        return function(){ _listeners[event] = _listeners[event].filter(function(f){ return f !== fn; }); };
    }

    // Public API — called by engines and UI
    window.boneTooltip = {
        show:     function(name, x, y) { emit('show', { name:name, x:x, y:y }); },
        hide:     function()           { emit('hide'); },
        openCard: function(name)       { emit('openCard', { name:name }); },
    };

    // ── FLOATING NAME TOOLTIP ─────────────────────────────────────────────────
    function NameTooltip() {
        var vis  = useState(false); var visible = vis[0]; var setVisible = vis[1];
        var pos  = useState({ x:0, y:0 }); var position = pos[0]; var setPosition = pos[1];
        var nm   = useState(''); var name = nm[0]; var setName = nm[1];

        useEffect(function() {
            var offShow = on('show', function(d) {
                setName(d.name); setPosition({ x:d.x, y:d.y }); setVisible(true);
            });
            var offHide = on('hide', function() { setVisible(false); });
            return function() { offShow(); offHide(); };
        }, []);

        if (!visible || !name) return null;

        // Keep tooltip inside viewport
        var tx = position.x + 14;
        var ty = position.y - 36;
        if (tx + 180 > window.innerWidth)  tx = position.x - 180 - 8;
        if (ty < 8)                         ty = position.y + 16;

        return e('div', { style:{
            position:'fixed', left:tx, top:ty, zIndex:700,
            pointerEvents:'none',
            background:C.dark, borderRadius:8,
            padding:'6px 12px', border:'1px solid rgba(253,246,236,0.12)',
            boxShadow:'0 4px 16px rgba(45,31,20,0.25)',
            display:'flex', flexDirection:'column', gap:2,
            maxWidth:200, animation:'htpFadeIn 0.12s ease'
        }},
            e('span', { style:{
                fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:11,
                color:'rgba(253,246,236,0.95)', textTransform:'uppercase',
                letterSpacing:'0.06em', lineHeight:1.3
            }}, name),
            e('span', { style:{
                fontFamily:'DM Sans,sans-serif', fontSize:9,
                color:'rgba(253,246,236,0.45)', letterSpacing:'0.04em'
            }}, 'Click for more info')
        );
    }

    // ── INFO CARD MODAL ───────────────────────────────────────────────────────
    function InfoCard() {
        var openS  = useState(false); var open = openS[0]; var setOpen = openS[1];
        var nameS  = useState('');    var name = nameS[0]; var setName = nameS[1];
        var loadS  = useState(false); var loading = loadS[0]; var setLoading = loadS[1];
        var infoS  = useState(null);  var info = infoS[0]; var setInfo = infoS[1];
        var errS   = useState(false); var error = errS[0]; var setError = errS[1];

        useEffect(function() {
            var off = on('openCard', function(d) {
                setName(d.name);
                setOpen(true);
                setInfo(null);
                setError(false);
                setLoading(true);

                window.fetchBoneInfo(d.name).then(function(result) {
                    setInfo(result);
                    setLoading(false);
                }).catch(function() {
                    setError(true);
                    setLoading(false);
                });
            });
            return off;
        }, []);

        function close() { setOpen(false); }

        if (!open) return null;

        return e('div', {
            onClick: function(ev){ if (ev.target === ev.currentTarget) close(); },
            style:{
                position:'fixed', inset:0, zIndex:700,
                display:'flex', alignItems:'center', justifyContent:'center',
                padding:20, backdropFilter:'blur(10px)',
                background:'rgba(45,31,20,0.45)'
            }
        },
            e('div', { style:{
                background:C.cream, borderRadius:18, maxWidth:400, width:'100%',
                border:'2px solid '+C.border,
                boxShadow:'0 24px 56px rgba(45,31,20,0.22)',
                fontFamily:'DM Sans,sans-serif', overflow:'hidden',
                animation:'htpFadeIn 0.18s ease'
            }},
                // Header bar
                e('div', { style:{
                    padding:'16px 20px 12px',
                    borderBottom:'2px solid '+C.border,
                    background:C.card,
                    display:'flex', justifyContent:'space-between', alignItems:'flex-start'
                }},
                    e('div', null,
                        e('div', { style:{
                            fontFamily:'Fraunces,serif', fontWeight:900,
                            fontSize:20, color:C.ink, letterSpacing:'-0.03em',
                            lineHeight:1.1, marginBottom:3
                        }}, name),
                        e('div', { style:{
                            fontSize:9, color:C.muted, textTransform:'uppercase',
                            letterSpacing:'0.2em', fontWeight:700
                        }}, 'Bone Anatomy')
                    ),
                    e('button', { onClick:close, style:{
                        background:'none', border:'1.5px solid '+C.border,
                        borderRadius:'50%', width:30, height:30, cursor:'pointer',
                        color:C.muted, fontSize:16, display:'flex',
                        alignItems:'center', justifyContent:'center', flexShrink:0,
                        marginLeft:12
                    }}, '×')
                ),

                // Body
                e('div', { style:{ padding:'16px 20px 20px' } },
                    loading && e('div', { style:{
                        display:'flex', alignItems:'center', gap:10,
                        color:C.muted, fontSize:12, padding:'8px 0'
                    }},
                        e('div', { style:{
                            width:16, height:16, borderRadius:'50%',
                            border:'2px solid '+C.border,
                            borderTopColor:C.coral,
                            animation:'htpSpin 0.7s linear infinite'
                        }}),
                        'Loading…'
                    ),

                    !loading && error && e('div', { style:{
                        color:C.muted, fontSize:12, fontStyle:'italic', padding:'8px 0'
                    }}, 'Couldn\'t load description. Try the Wikipedia link below.'),

                    !loading && info && e('div', null,
                        // Description
                        e('p', { style:{
                            fontSize:13, color:C.inkLight, lineHeight:1.65,
                            margin:'0 0 16px'
                        }}, info.description),

                        // Divider
                        e('div', { style:{ borderTop:'1.5px solid '+C.border, marginBottom:14 } }),

                        // Wikipedia link
                        e('a', {
                            href: info.url,
                            target: '_blank',
                            rel: 'noopener noreferrer',
                            style:{
                                display:'inline-flex', alignItems:'center', gap:7,
                                padding:'9px 16px',
                                background:'linear-gradient(135deg,'+C.coral+','+C.coralDk+')',
                                color:'white', textDecoration:'none',
                                borderRadius:8, fontSize:11, fontWeight:700,
                                textTransform:'uppercase', letterSpacing:'0.1em',
                                boxShadow:'0 3px 10px rgba(232,96,60,0.25)'
                            }
                        },
                            e('span', null, '↗'),
                            'Read on Wikipedia'
                        )
                    )
                )
            )
        );
    }

    // ── ROOT LAYER ────────────────────────────────────────────────────────────
    // Mount once in game HTML — renders both tooltip and info card
    function BoneTooltipLayer() {
        return e(React.Fragment, null,
            e(NameTooltip),
            e(InfoCard)
        );
    }

    window.BoneTooltipLayer = BoneTooltipLayer;

    // CSS for spinner (htpFadeIn already injected by howToPlay.js, but guard it)
    if (!document.getElementById('htp-styles')) {
        var st = document.createElement('style');
        st.id  = 'htp-styles';
        st.textContent = '@keyframes htpFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }';
        document.head.appendChild(st);
    }
    // Spinner keyframe — add to existing style block or create new
    var existing = document.getElementById('htp-styles');
    if (existing && existing.textContent.indexOf('htpSpin') === -1) {
        existing.textContent += '\n@keyframes htpSpin { to{ transform: rotate(360deg) } }';
    }

})();
