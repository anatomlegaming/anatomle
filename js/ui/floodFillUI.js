// ============================================================================
// ANATOMLE - FLOOD FILL UI TEMPLATE
// ============================================================================
// For flood-fill games (Skull, Hand, Foot)
// Displays: Correct bones | Not adjacent bones
//
// USAGE:
//   import FloodFillUI from './floodFillUI.js'
//   <FloodFillUI
//     gameTitle="💀 Skull"
//     accentColor="#f59e0b"
//     state={gameState}
//     handlers={gameHandlers}
//   />

var useRef = React.useRef, useEffect = React.useEffect;

function FloodFillUI({ gameTitle, accentColor, state, handlers }) {
    const {
        start,        // starting bone
        total,        // total bones in this mode
        guessed,      // Set of found bones
        bad,          // failed guesses (not adjacent)
        left,         // guesses left
        max,          // max guesses
        input,        // search input
        selIdx,       // selected suggestion index
        phase,        // 'playing' | 'won' | 'lost'
        reveal,       // show solution?
        suggestions   // filtered bone list
    } = state;

    const {
        onInputChange,
        onKeyDown,
        onSubmit,
        onNewGame,
        onReveal
    } = handlers;

    const inputRef = useRef(null);
    useEffect(() => { if (phase === 'playing') inputRef.current?.focus(); }, [phase]);

    const NAV_H = 56, BAR_H = 48, SRCH_H = 64, PANEL_W = 280;
    const pct = Math.round((guessed.size / total) * 100);
    const foundList = [...guessed].filter(b => b !== start);

    const secHead = (label, count, color) => (
        <div style={{padding:'9px 14px 6px',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
            <span style={{fontSize:8,color,textTransform:'uppercase',letterSpacing:'0.25em',fontWeight:700}}>{label}</span>
            <span style={{fontSize:10,color,fontWeight:700}}>{count}</span>
        </div>
    );

    return (
        <>
        {/* NAVBAR */}
        <div style={{position:'fixed',top:0,left:0,right:0,height:NAV_H,zIndex:200,
            background:'rgba(10,15,30,0.98)',borderBottom:'1px solid #1e293b',
            display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px'}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
                <h1 style={{fontSize:22,fontWeight:900,color:'white',margin:0,letterSpacing:'-0.05em',textTransform:'uppercase'}}>Anatomle</h1>
                <span style={{fontSize:9,color:accentColor,letterSpacing:'0.3em',textTransform:'uppercase',opacity:0.9}}>{gameTitle}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:20}}>
                <span style={{fontSize:10,color:'#94a3b8'}}>{guessed.size}/{total} found</span>
                <a href="../index.html" style={{fontSize:9,color:'#64748b',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.2em'}}>← Menu</a>
            </div>
        </div>

        {/* CHALLENGE BAR */}
        <div style={{position:'fixed',top:NAV_H,left:0,right:PANEL_W,height:BAR_H,zIndex:100,
            background:'rgba(10,15,30,0.92)',borderBottom:'1px solid #1e293b',
            display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 18px'}}>
            <span style={{fontSize:10,color:'#94a3b8'}}>
                Start: <span style={{color:'#34d399',fontWeight:700}}>{start}</span>
                &nbsp;·&nbsp; Name any bone <span style={{color:'#60a5fa',fontWeight:600}}>touching</span> a found bone
            </span>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:90,height:5,background:'#1e293b',borderRadius:3,overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:pct===100?'#10b981':accentColor,transition:'width .4s'}}/>
                </div>
                <span style={{fontSize:10,fontWeight:700,color:left<5?'#f87171':'#34d399'}}>{left} guesses</span>
            </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{position:'fixed',top:NAV_H,right:0,width:PANEL_W,bottom:0,zIndex:100,
            background:'rgba(10,15,30,0.98)',borderLeft:'1px solid #1e293b',display:'flex',flexDirection:'column'}}>

            {/* Correct / Found */}
            <div style={{flex:'1 1 0',overflow:'hidden',display:'flex',flexDirection:'column',borderBottom:'1px solid #1e293b'}}>
                {secHead('✓ Correct', guessed.size, '#34d399')}
                <div className="scr" style={{overflowY:'auto',flex:1,padding:'0 12px 10px'}}>
                    {/* Start bone */}
                    <div style={{padding:'5px 9px',marginBottom:3,background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:3,fontSize:9,color:'#34d399',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',display:'flex',justifyContent:'space-between'}}>
                        <span>{start}</span><span>📍</span>
                    </div>
                    {/* Other found bones */}
                    {foundList.map(b => (
                        <div key={b} style={{padding:'5px 9px',marginBottom:3,background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:3,fontSize:9,color:'#93c5fd',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>{b}</div>
                    ))}
                </div>
            </div>

            {/* Failed / Not adjacent */}
            <div style={{flex:'0 0 auto',maxHeight:'38%',overflow:'hidden',display:'flex',flexDirection:'column',borderBottom:'1px solid #1e293b'}}>
                {secHead('✗ Not Adjacent', bad.length, '#f87171')}
                <div className="scr" style={{overflowY:'auto',flex:1,padding:'0 12px 10px'}}>
                    {bad.length === 0 && <div style={{fontSize:9,color:'#1e293b',textAlign:'center',marginTop:6}}>None yet</div>}
                    {bad.map(b => (
                        <div key={b} className="shake" style={{padding:'5px 9px',marginBottom:3,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:3,fontSize:9,color:'#fca5a5',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>{b}</div>
                    ))}
                </div>
            </div>

            {/* New game button */}
            <div style={{padding:12,flexShrink:0}}>
                <button onClick={onNewGame} style={{width:'100%',padding:'11px 0',background:'white',color:'black',border:'none',fontFamily:'EB Garamond,serif',fontWeight:900,fontSize:10,textTransform:'uppercase',letterSpacing:'0.2em',cursor:'pointer'}}>
                    New Game
                </button>
            </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{position:'fixed',bottom:0,left:0,right:PANEL_W,height:SRCH_H,zIndex:150,
            background:'rgba(10,15,30,0.98)',borderTop:'1px solid #1e293b',padding:'10px 14px',display:'flex',alignItems:'center'}}>
            <div style={{flex:1,position:'relative'}}>
                {/* Suggestions popup */}
                {suggestions.length > 0 && (
                    <div style={{position:'absolute',bottom:'100%',left:0,right:0,background:'#0f172a',border:'1px solid #334155',borderBottom:'none',zIndex:300,maxHeight:280,overflowY:'auto'}}>
                        {suggestions.map((s,i) => (
                            <div key={s} onClick={() => onSubmit(s)}
                                style={{padding:'10px 14px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',
                                    cursor:'pointer',color:i===selIdx?'white':'#94a3b8',
                                    background:i===selIdx?accentColor:'transparent',
                                    borderBottom:'1px solid #1e293b',transition:'background .1s'}}>
                                {s}
                            </div>
                        ))}
                    </div>
                )}
                <input ref={inputRef}
                    value={input}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    disabled={phase !== 'playing'}
                    placeholder={phase==='playing' ? "Type to search, then select from list above ↑" : "Game over — click New Game"}
                    style={{width:'100%',background:'#1e293b',border:'1px solid #334155',padding:'10px 14px',
                        color:'white',fontFamily:'EB Garamond,serif',fontSize:11,fontStyle:'italic',outline:'none',
                        borderColor: input && suggestions.length===0 ? '#ef4444' : '#334155'}}
                />
            </div>
        </div>

        {/* END OVERLAY */}
        {phase !== 'playing' && !reveal && (
            <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(18px)'}}
                className={phase==='won'?'win-bg':'loss-bg'}>
                <div style={{textAlign:'center',padding:48,background:'rgba(10,15,30,0.95)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:24,maxWidth:420}}>
                    <h2 style={{fontSize:46,fontWeight:900,color:'white',margin:'0 0 8px',letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                        {phase==='won' ? '✓ Complete!' : '✗ Incomplete'}
                    </h2>
                    <p style={{color:'#94a3b8',fontSize:14,marginBottom:24}}>
                        {phase==='won'
                            ? `All ${total} bones identified! ${max-left} guesses used.`
                            : `Found ${guessed.size}/${total} bones. ${bad.length} non-adjacent guess${bad.length!==1?'es':''}.`}
                    </p>
                    {phase==='lost' && (
                        <div style={{marginBottom:20}}>
                            <button onClick={onReveal} style={{padding:'10px 22px',background:'#a855f7',color:'white',border:'none',fontWeight:900,fontSize:10,textTransform:'uppercase',cursor:'pointer',letterSpacing:'0.15em',fontFamily:'EB Garamond,serif'}}>
                                👁 Reveal Missing
                            </button>
                        </div>
                    )}
                    <div style={{display:'flex',gap:12,justifyContent:'center'}}>
                        <button onClick={onNewGame} style={{padding:'13px 32px',background:'white',color:'black',border:'none',fontWeight:900,fontSize:10,textTransform:'uppercase',letterSpacing:'0.15em',cursor:'pointer',fontFamily:'EB Garamond,serif'}}>
                            Play Again
                        </button>
                        <a href="../index.html" style={{padding:'13px 32px',background:'#1e293b',color:'white',fontWeight:900,fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em',textDecoration:'none',display:'flex',alignItems:'center',fontFamily:'EB Garamond,serif'}}>
                            Menu
                        </a>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

// Export for module usage
if (typeof window !== 'undefined') {
    window.FloodFillUI = FloodFillUI;
}
