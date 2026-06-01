import { ArrowRight, Zap, MessageSquare, Settings2, Link2 } from 'lucide-react';

export default function HeroSection() {
  /*
    ViewBox: 1100 × 750 (Slightly widened to handle larger elements without clipping)
    Diamond center: (380, 375)

    Updated Layout Math for Right Side:
    - Inner Center Card: Scaled up to 156x156 (from 134)
    - Feature Cards: Width (CW) = 310px, Height (CH) = 108px
    - Vertical Rail: Shifted dynamically to x = 740 to support the massive layout scales
    - Horizontal Card Origin (CX): Starts at 770
  */

  const CYS  = [90, 280, 470, 660]; // Re-spaced vertically for larger cards
  const RAIL = 740;   
  const CX   = 770;   
  const CW   = 310;   
  const CH   = 108;    
  
  return (
    <section className="w-full min-h-screen bg-[#FAF9F7] font-sans antialiased overflow-hidden flex items-center">
      {/* 1. FORCE INTER GLOBALLY FOR THIS COMPONENT */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        
        .hero-container, 
        .hero-container *, 
        .hero-container text, 
        .hero-container span, 
        .hero-container h1 {
          font-family: 'Inter', sans-serif !important;
        }
      `}} />
      <div
        className="max-w-[1440px] mx-auto w-full px-10 sm:px-14 lg:px-20 py-14 grid gap-0 items-center hero-container"
        style={{ gridTemplateColumns: '1fr 1.15fr' }} // Prevents left side from shrinking under the larger layout weight
      >

        {/* ==================== LEFT — UNTOUCHED (EXACTLY ORIGINAL) ==================== */}
        <div className="flex flex-col items-start gap-7 pr-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-orange-200 rounded-full shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#FF6600]" strokeWidth={2.5} fill="#FF6600" />
            <span className="text-[12px] font-semibold text-[#FF6600] tracking-wide">One Atlas for Enterprises</span>
          </div>

          <h1 className="text-[68px] sm:text-[76px] lg:text-[50px] font-black tracking-[-0.035em] text-[#0B132B] leading-[1.0]">
            Software at the speed of <span className="text-[#FF6600]">thought.</span>
          </h1>

          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-orange-300 opacity-60" />
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold text-[14px] px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-[0_4px_20px_rgba(255,102,0,0.4)] hover:-translate-y-0.5">
              Start building <ArrowRight size={15} strokeWidth={2.5} />
            </button>
            <button className="inline-flex items-center gap-2.5 bg-white border border-[#E4E4E4] text-[#0B132B] font-semibold text-[14px] px-5 py-3.5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              Talk to sales
              <ArrowRight size={14} strokeWidth={2.5} className="text-slate-400" />
            </button>
          </div>

          <div className="flex items-stretch gap-4 mt-1 w-full" style={{ maxWidth: '370px' }}>
            {[
              { icon: MessageSquare, t1: 'Natural',  t2: 'Language' },
              { icon: Settings2,     t1: 'Business', t2: 'Logic' },
              { icon: Link2,         t1: 'Existing', t2: 'Systems' },
            ].map(({ icon: Icon, t1, t2 }) => (
              <div key={t1} className="flex-1 bg-white border border-[#E8E8E8] rounded-[20px] pt-6 pb-5 px-3 flex flex-col items-center gap-3 shadow-[0_3px_12px_rgba(0,0,0,0.055)] hover:shadow-[0_8px_22px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#FF6600]" strokeWidth={1.8} />
                </div>
                <p className="text-[13px] font-semibold text-[#0B132B] text-center leading-snug">{t1}<br/>{t2}</p>
              </div>
            ))}
          </div>
        </div>


        {/* ==================== RIGHT — SCALED & ALIGNED CONNECTIONS ==================== */}
        <div className="relative w-full" style={{ height: '750px' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1100 750"
            fill="none"
            
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="aura3" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#FF8020" stopOpacity="0.25"/>
                <stop offset="55%"  stopColor="#FF6600" stopOpacity="0.10"/>
                <stop offset="100%" stopColor="#FF6600" stopOpacity="0"/>
              </radialGradient>
              <linearGradient id="cgrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#FFA040"/>
                <stop offset="45%"  stopColor="#FF6600"/>
                <stop offset="100%" stopColor="#CC3D00"/>
              </linearGradient>
              <filter id="cshadow" x="-60%" y="-60%" width="220%" height="220%">
                <feDropShadow dx="0" dy="24" stdDeviation="24" floodColor="#FF6600" floodOpacity="0.45"/>
                <feDropShadow dx="0" dy="8"  stdDeviation="12" floodColor="#FF6600" floodOpacity="0.25"/>
              </filter>
            </defs>

            {/* Ambient glow centered to new focal structure */}
            <ellipse cx="380" cy="375" rx="340" ry="340" fill="url(#aura3)"/>

            {/* Concentric Diamonds (Scaled Stack) */}
            <polygon points="380,15 730,375 380,735 30,375" fill="#FEF2E8" stroke="#FDDEC8" strokeWidth="1.5" opacity="0.9"/>
            <polygon points="380,85 670,375 380,665 90,375" fill="#FDDFC0" stroke="#FBC89A" strokeWidth="1.5" opacity="0.85"/>
            <polygon points="380,155 600,375 380,595 160,375" fill="#FBC898" stroke="#F9A860" strokeWidth="1.5" opacity="0.8"/>

            {/* ── CENTER DIAMOND CARD (SCALED LOGO UP TO 156px) ── */}
            <g transform="translate(380,375) rotate(45)" filter="url(#cshadow)">
              <rect x="-78" y="-78" width="156" height="156" rx="32" fill="url(#cgrad)"/>
            </g>
            {/* Center Text */}
            <text
              x="380" y="401"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900" fontSize="78" fill="white" letterSpacing="-2"
            >A</text>

            {/* Top decorative spur */}
            <line x1="380" y1="15" x2="380" y2="-10" stroke="#FF6600" strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.35"/>
            <circle cx="380" cy="-10" r="3" fill="#FF6600" opacity="0.28"/>

            {/* ── CONNECTOR LINES SYSTEM (PRECISION RE-MATCHED) ── */}
            {/* Trunk line linking diamond edge (730,375) to rail coordinate */}
            <line x1="730" y1="375" x2={RAIL} y2="375" stroke="#FF6600" strokeWidth="2.5" strokeDasharray="5 4" strokeOpacity="0.8"/>
            
            {/* Main Vertical Rail */}
            <line x1={RAIL} y1={CYS[0]} x2={RAIL} y2={CYS[3]} stroke="#FF6600" strokeWidth="2.5" strokeDasharray="5 4" strokeOpacity="0.7"/>

            {/* Horizontal insertion leads into cards */}
            {CYS.map(cy => (
              <line key={cy} x1={RAIL} y1={cy} x2={CX} y2={cy} stroke="#FF6600" strokeWidth="2.5" strokeDasharray="5 4" strokeOpacity="0.8"/>
            ))}

            {/* Core Node Junction Dots */}
            <circle cx="730" cy="375" r="6.5" fill="#FF6600" />
            <circle cx={RAIL} cy="375" r="6.5" fill="#FF6600" />
            {CYS.map(cy => (
              <circle key={cy} cx={RAIL} cy={cy} r="6.5" fill="#FF6600" />
            ))}


            {/* ── MASSIVE FEATURE CARDS ── */}
            {(['AI MODELS', 'DATA & SYSTEMS', 'WORKFLOWS', 'PRODUCTION APPS'] as const).map((title, i) => (
              <foreignObject key={title} x={CX} y={CYS[i] - CH / 2} width={CW} height={CH}>
                <div
                  
                  style={{
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    background: 'white',
                    border: '1.5px solid #EBEBEB',
                    borderRadius: '22px',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '0 26px',
                    cursor: 'pointer',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  {/* Expanded Icon Container */}
                  <div style={{
                    width: '52px',
                    height: '52px',
                    minWidth: '52px',
                    background: '#FFF5EE',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 24 24" width="25" height="25" fill="none"
                      stroke="#FF6600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      {title === 'AI MODELS' && (
                        <>
                          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                          <path d="M19 3l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>
                        </>
                      )}
                      {title === 'DATA & SYSTEMS' && (
                        <>
                          <ellipse cx="12" cy="5" rx="9" ry="3"/>
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                        </>
                      )}
                      {title === 'WORKFLOWS' && (
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      )}
                      {title === 'PRODUCTION APPS' && (
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                      )}
                    </svg>
                  </div>

                  {/* Enhanced Higher-Impact Card Typography */}
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 900,
                    color: '#0B132B',
                    letterSpacing: '0.11em',
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                  }}>{title}</span>
                </div>
              </foreignObject>
            ))}
          </svg>
        </div>

      </div>
    </section>
  );
}
