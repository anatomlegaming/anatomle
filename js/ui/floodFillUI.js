// ============================================================================
// ANATOMLE - FLOOD FILL UI TEMPLATE (REDESIGNED)
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

const { useRef, useEffect } = React;

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

    const NAV_H = 80;
    const PANEL_W = 380;
    const SEARCH_BOTTOM = 40;  // dead space below search
    const SEARCH_H = 80;

    const pct = Math.round((guessed.size / total) * 100);
    const foundList = [...guessed].filter(b => b !== start);

    const secHead = (label, count, color) => (
        <div style={{padding:'16px 20px 10px',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0,borderBottom:'1px solid #1e293b'}}>
            <span style={{fontSize:11,color,textTransform:'uppercase',letterSpacing:'0.25em',fontWeight:800}}>{label}</span>
            <span style={{fontSize:13,color,fontWeight:800}}>{count}</span>
        </div>
    );

    return (
        <>
        {/* TOP NAVBAR - centered title and goal */}
        <div style={{position:'fixed',top:0,left:0,right:0,height:NAV_H,zIndex:200,
            background:'rgba(10,15,30,0.98)',borderBottom:'1px solid #1e293b',
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6}}>
            
            <div style={{display:'flex',alignItems:'center',gap:16}}>
                <h1 style={{fontSize:32,fontWeight:900,color:'white',margin:0,letterSpacing:'-0.05em',textTransform:'uppercase'}}>Anatomle</h1>
                <span style={{fontSize:13,color:accentColor,letterSpacing:'0.3em',textTransform:'uppercase',fontWeight:700}}>{gameTitle}</span>
            </div>

            <div style={{fontSize:13,color:'#94a3b8',textAlign:'center'}}>
                Start: <span style={{color:'#34d399',fontWeight:700}}>{start}</span>
                <span style={{margin:'0 8px',color:'#475569'}}>·</span>
                Name any bone <span style={{color:'#60a5fa',fontWeight:700}}>touching</span> a found bone
                <span style={{margin:'0 8px',color:'#475569'}}>·</span>
                <a href="../index.html" style={{fontSize:11,color:'#64748b',textDecoration:'none',textTransform:'uppercase',letterSpacing:'0.2em',fontWeight:700}}>← Menu</a>
            </div>
        </div>

        {/* PROGRESS BAR - fixed below navbar, above 3D view */}
        <div style={{position:'fixed',top:NAV_H,left:0,right:PANEL_W,height:60,zIndex:100,
            background:'rgba(10,15,30,0.92)',borderBottom:'1px solid #1e293b',
            display:'flex',alignItems:'center',justifyContent:'center',gap:20,padding:'0 30px'}}>
            
            <span style={{fontSize:13,color:'#94a3b8',fontWeight:600}}>{guessed.size}/{total} found</span>
            
            <div style={{display:'flex',alignItems:'center',gap:12,flex:'0 0 280px'}}>
                <div style={{flex:1,height:8,background:'#1e293b',borderRadius:4,overflow:'hidden',border:'1px solid #334155'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:pct===100?'#10b981':accentColor,transition:'width .4s'}}/>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:pct===100?'#10b981':accentColor,minWidth:45,textAlign:'right'}}>
                    {pct}%
                </span>
            </div>

            <span style={{fontSize:13,fontWeight:700,color:left<5?'#f87171':'#34d399',minWidth:110}}>
                {left} guesses left
            </span>
        </div>

        {/* RIGHT PANEL - larger */}
        <div style={{position:'fixed',top:NAV_H,right:0,width:PANEL_W,bottom:0,zIndex:100,
            background:'rgba(10,15,30,0.98)',borderLeft:'1px solid #1e293b',display:'flex',flexDirection:'column'}}>

            {/* Correct / Found */}
            <div style={{flex:'1 1 0',overflow:'hidden',display:'flex',flexDirection:'column'}}>
                {secHead('✓ Correct', guessed.size, '#34d399')}
                <div className="scr" style={{overflowY:'auto',flex:1,padding:'12px 16px'}}>
                    {/* Start bone */}
                    <div style={{padding:'10px 14px',marginBottom:6,background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:4,fontSize:12,color:'#34d399',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.05em',display:'flex',justifyContent:'space-between'}}>
                        <span>{start}</span><span>📍</span>
                    </div>
                    {/* Other found bones */}
                    {foundList.map(b => (
                        <div key={b} style={{padding:'10px 14px',marginBottom:6,background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:4,fontSize:12,color:'#93c5fd',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.05em'}}>{b}</div>
                    ))}
                </div>
            </div>

            {/* Failed / Not adjacent */}
            <div style={{flex:'0 0 auto',maxHeight:'40%',overflow:'hidden',display:'flex',flexDirection:'column',borderTop:'1px solid #1e293b'}}>
                {secHead('✗ Not Adjacent', bad.length, '#f87171')}
                <div className="scr" style={{overflowY:'auto',flex:1,padding:'12px 16px'}}>
                    {bad.length === 0 && <div style={{fontSize:11,color:'#475569',textAlign:'center',marginTop:8}}>None yet</div>}
                    {bad.map(b => (
                        <div key={b} className="shake" style={{padding:'10px 14px',marginBottom:6,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:4,fontSize:12,color:'#fca5a5',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.05em'}}>{b}</div>
                    ))}
                </div>
            </div>

            {/* New game button */}
            <div style={{padding:16,flexShrink:0,borderTop:'1px solid #1e293b'}}>
                <button onClick={onNewGame} style={{width:'100%',padding:'14px 0',background:'white',color:'black',border:'none',fontFamily:'EB Garamond,serif',fontWeight:900,fontSize:12,textTransform:'uppercase',letterSpacing:'0.2em',cursor:'pointer',borderRadius:4,transition:'all .2s'}}>
                    New Game
                </button>
            </div>
        </div>

        {/* SEARCH BAR - centered, not stretched, with dead space below */}
        <div style={{position:'fixed',bottom:SEARCH_BOTTOM,left:'50%',transform:'translateX(-50%)',
            width:'min(700px, calc(100vw - ' + (PANEL_W + 80) + 'px))',
            height:SEARCH_H,zIndex:150,
            background:'rgba(10,15,30,0.98)',border:'1px solid #334155',borderRadius:8,
            padding:'16px 20px',display:'flex',alignItems:'center',boxShadow:'0 4px 20px rgba(0,0,0,0.5)'}}>
            
            <div style={{flex:1,position:'relative'}}>
                {/* Suggestions popup */}
                {suggestions.length > 0 && (
                    <div style={{position:'absolute',bottom:'100%',left:0,right:0,marginBottom:8,
                        background:'#0f172a',border:'1px solid #334155',borderRadius:6,
                        zIndex:300,maxHeight:320,overflowY:'auto',boxShadow:'0 -4px 20px rgba(0,0,0,0.5)'}}>
                        {suggestions.map((s,i) => (
                            <div key={s} onClick={() => onSubmit(s)}
                                style={{padding:'12px 18px',fontSize:13,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',
                                    cursor:'pointer',color:i===selIdx?'white':'#94a3b8',
                                    background:i===selIdx?accentColor:'transparent',
                                    borderBottom:i<suggestions.length-1?'1px solid #1e293b':'none',
                                    transition:'background .1s'}}>
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
                    style={{width:'100%',background:'#1e293b',border:'2px solid',
                        borderColor: input && suggestions.length===0 ? '#ef4444' : '#334155',
                        padding:'14px 18px',
                        color:'white',fontFamily:'EB Garamond,serif',fontSize:14,fontStyle:'italic',
                        outline:'none',borderRadius:6,transition:'border-color .2s'}}
                />
            </div>
        </div>

        {/* END OVERLAY */}
        {phase !== 'playing' && !reveal && (
            <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(20px)'}}
                className={phase==='won'?'win-bg':'loss-bg'}>
                <div style={{textAlign:'center',padding:56,background:'rgba(10,15,30,0.95)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:24,maxWidth:480}}>
                    <h2 style={{fontSize:52,fontWeight:900,color:'white',margin:'0 0 12px',letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                        {phase==='won' ? '✓ Complete!' : '✗ Incomplete'}
                    </h2>
                    <p style={{color:'#94a3b8',fontSize:15,marginBottom:28,lineHeight:1.6}}>
                        {phase==='won'
                            ? `All ${total} bones identified! ${max-left} guesses used.`
                            : `Found ${guessed.size}/${total} bones. ${bad.length} non-adjacent guess${bad.length!==1?'es':''}.`}
                    </p>
                    {phase==='lost' && (
                        <div style={{marginBottom:24}}>
                            <button onClick={onReveal} style={{padding:'12px 26px',background:'#a855f7',color:'white',border:'none',fontWeight:900,fontSize:11,textTransform:'uppercase',cursor:'pointer',letterSpacing:'0.15em',fontFamily:'EB Garamond,serif',borderRadius:6,transition:'all .2s'}}>
                                👁 Reveal Missing
                            </button>
                        </div>
                    )}
                    <div style={{display:'flex',gap:14,justifyContent:'center'}}>
                        <button onClick={onNewGame} style={{padding:'15px 36px',background:'white',color:'black',border:'none',fontWeight:900,fontSize:11,textTransform:'uppercase',letterSpacing:'0.15em',cursor:'pointer',fontFamily:'EB Garamond,serif',borderRadius:6,transition:'all .2s'}}>
                            Play Again
                        </button>
                        <a href="../index.html" style={{padding:'15px 36px',background:'#1e293b',color:'white',fontWeight:900,fontSize:11,textTransform:'uppercase',letterSpacing:'0.1em',textDecoration:'none',display:'flex',alignItems:'center',fontFamily:'EB Garamond,serif',borderRadius:6,transition:'all .2s'}}>
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
