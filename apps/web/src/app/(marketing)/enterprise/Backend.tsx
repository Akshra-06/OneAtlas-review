import {  
  Database, 
  CreditCard, 
  GitBranch, 
  UserCheck, 
  Folder, 
  Code2, 
  Link2, 
  TrendingUp, 
  Globe,
   
} from 'lucide-react';

export default function BackendTrustSection() {
  
  return (
    <section className="w-full bg-[#FAFAFA] text-slate-900 font-sans antialiased relative flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-[60px] overflow-hidden select-none border-t border-slate-200/40">
      
      <div className="max-w-[1440px] w-full grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-12 lg:gap-6 items-center relative z-10">
        
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="flex flex-col items-start text-left w-full">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50/70 border border-orange-100 rounded-full mb-7">
            <span className="w-3 h-3 rounded-full border border-orange-500/20 flex items-center justify-center p-0.5 bg-white">
              <span className="w-full h-full rounded-full bg-orange-500" />
            </span>
            <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase">Modern backend</span>
          </div>

          {/* Headline */}
          <h2 className="text-[32px] sm:text-[38px] font-black tracking-[-0.03em] text-[#0A1124] leading-[1.1] mb-5">
  Built on a backend your <span className="text-[#FF6600]">IT team</span> can trust.
</h2>
          
          {/* Description */}
          <p className="text-[14px] font-medium text-slate-500 leading-relaxed max-w-[360px] mb-10">
            Every OneAtlas application includes the infrastructure to run securely at scale.
          </p>

          

          <div
  style={{
    marginTop: 24,
    width: 520,
    background: '#FFFFFF',
    border: '1px solid #EAEAEA',
    borderRadius: 20,
    padding: 0,
    boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
    overflow: 'hidden'
  }}
>
  {[
    {
      icon: '👤',
      title: 'Authentication'
    },
    {
      icon: '📋',
      title: 'Audit Logging'
    },
    {
      icon: '🗄️',
      title: 'Secure Storage'
    }
  ].map((item, index) => (
    <div
      key={item.title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        borderBottom:
          index !== 2 ? '1px solid #F1F1F1' : 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: '#FFF5EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22
          }}
        >
          {item.icon}
        </div>

        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0A1124'
          }}
        >
          {item.title}
        </span>
      </div>

      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: '50%',
          background: '#EAF8EA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#22C55E',
          fontSize: 20,
          fontWeight: 700
        }}
      >
        ✓
      </div>
    </div>
  ))}
</div>
        </div>

        {/* ==================== RIGHT COLUMN: ARCHITECTURE DIAGRAM ==================== */}
        {/* 
          Layout plan (SVG viewBox 860 x 640):
          Center hub at (430, 320).
          
          Node positions (cx, cy) — used for both SVG pins and absolute card placement:
            TOP:          (430,  68)
            TOP-LEFT:     (165, 175)
            TOP-RIGHT:    (695, 175)
            MID-LEFT:     (110, 320)
            MID-RIGHT:    (750, 320)
            BOT-LEFT:     (165, 465)
            BOT-RIGHT:    (695, 465)
            BOTTOM:       (430, 572)

          Hub edges (where connector lines meet the hub card, hub card is ~190x150):
            top    edge: (430, 245)
            left   edge: (335, 320)
            right  edge: (525, 320)
            bottom edge: (430, 395)

          Card dimensions: w=190 h=72
        -->
        */}
        <div className="relative w-full" style={{ height: '640px' }}>

          {/* Ambient glow */}
          <div className="absolute pointer-events-none" style={{
            left: '50%', top: '320px',
            transform: 'translate(-50%, -50%)',
            width: '600px', height: '600px',
            background: 'radial-gradient(circle at center, rgba(255,102,0,0.13) 0%, rgba(255,102,0,0.05) 35%, transparent 65%)',
          }} />

          {/* 
            SVG coordinate system — viewBox 860 × 640
            ─────────────────────────────────────────
            Hub card:  center (430, 320), size 190 × 160
              → left edge   x = 335   (430 - 95)
              → right edge  x = 525   (430 + 95)
              → top edge    y = 240   (320 - 80)
              → bottom edge y = 400   (320 + 80)

            Rectangular "spine" corners:
              TL = (335, 240)   TR = (525, 240)
              BL = (335, 400)   BR = (525, 400)

            Card centers (cx, cy):
              TOP         (430,  60)
              TOP-LEFT    (160, 175)   right edge of card ≈ x=255
              TOP-RIGHT   (700, 175)   left  edge of card ≈ x=605
              MID-LEFT    (110, 320)   right edge of card ≈ x=205
              MID-RIGHT   (750, 320)   left  edge of card ≈ x=655
              BOT-LEFT    (160, 465)   right edge of card ≈ x=255
              BOT-RIGHT   (700, 465)   left  edge of card ≈ x=605
              BOTTOM      (430, 580)

            Connector logic (matches image):
              • TOP/BOTTOM: straight vertical spur from spine midpoint
              • MID-LEFT/RIGHT: straight horizontal spur from spine midpoint  
              • Diagonal cards: L-shaped — horizontal to spine x, then vertical to spine y
                  TOP-LEFT  → right to x=335, up   to y=240
                  TOP-RIGHT → left  to x=525, up   to y=240
                  BOT-LEFT  → right to x=335, down to y=400
                  BOT-RIGHT → left  to x=525, down to y=400
          */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 860 640"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* ── RECTANGULAR SPINE around hub (dashed border) ── */}
            <rect
              x="335" y="240" width="190" height="160"
              rx="6"
              stroke="#FF6600" strokeWidth="1.5" strokeDasharray="6 5"
              strokeOpacity="0.35" fill="none"
            />

            {/* ── TOP spur: spine top-mid (430,240) → card bottom (430,96) ── */}
            <line x1="430" y1="240" x2="430" y2="96"
              stroke="#FF6600" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.4" strokeLinecap="round"/>

            {/* ── BOTTOM spur: spine bottom-mid (430,400) → card top (430,544) ── */}
            <line x1="430" y1="400" x2="430" y2="544"
              stroke="#FF6600" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.4" strokeLinecap="round"/>

            {/* ── MID-LEFT spur: spine left-mid (335,320) → card right (205,320) ── */}
            <line x1="335" y1="320" x2="205" y2="320"
              stroke="#FF6600" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.4" strokeLinecap="round"/>

            {/* ── MID-RIGHT spur: spine right-mid (525,320) → card left (655,320) ── */}
            <line x1="525" y1="320" x2="655" y2="320"
              stroke="#FF6600" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.4" strokeLinecap="round"/>

            {/* ── TOP-LEFT L-path: card right (255,175) → corner (335,175) → spine TL (335,240) ── */}
            <polyline points="255,175 335,175 335,240"
              stroke="#FF6600" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.35"
              strokeLinecap="round" strokeLinejoin="round" fill="none"/>

            {/* ── TOP-RIGHT L-path: card left (605,175) → corner (525,175) → spine TR (525,240) ── */}
            <polyline points="605,175 525,175 525,240"
              stroke="#FF6600" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.35"
              strokeLinecap="round" strokeLinejoin="round" fill="none"/>

            {/* ── BOT-LEFT L-path: card right (255,465) → corner (335,465) → spine BL (335,400) ── */}
            <polyline points="255,465 335,465 335,400"
              stroke="#FF6600" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.35"
              strokeLinecap="round" strokeLinejoin="round" fill="none"/>

            {/* ── BOT-RIGHT L-path: card left (605,465) → corner (525,465) → spine BR (525,400) ── */}
            <polyline points="605,465 525,465 525,400"
              stroke="#FF6600" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.35"
              strokeLinecap="round" strokeLinejoin="round" fill="none"/>

            {/* ── SPINE CORNER DOTS (4 corners of rectangle) ── */}
            <circle cx="335" cy="240" r="4.5" fill="#FF6600" opacity="0.85"/>
            <circle cx="525" cy="240" r="4.5" fill="#FF6600" opacity="0.85"/>
            <circle cx="335" cy="400" r="4.5" fill="#FF6600" opacity="0.85"/>
            <circle cx="525" cy="400" r="4.5" fill="#FF6600" opacity="0.85"/>

            {/* ── SPINE MID-EDGE DOTS (where spurs meet spine) ── */}
            <circle cx="430" cy="240" r="4.5" fill="#FF6600" opacity="0.85"/>
            <circle cx="430" cy="400" r="4.5" fill="#FF6600" opacity="0.85"/>
            <circle cx="335" cy="320" r="4.5" fill="#FF6600" opacity="0.85"/>
            <circle cx="525" cy="320" r="4.5" fill="#FF6600" opacity="0.85"/>

            {/* ── CARD-SIDE CONTACT PINS ── */}
            {/* TOP card bottom-center */}
            <circle cx="430" cy="96"  r="3" fill="#FF6600" opacity="0.7"/>
            {/* BOTTOM card top-center */}
            <circle cx="430" cy="544" r="3" fill="#FF6600" opacity="0.7"/>
            {/* MID-LEFT card right-center */}
            <circle cx="205" cy="320" r="3" fill="#FF6600" opacity="0.7"/>
            {/* MID-RIGHT card left-center */}
            <circle cx="655" cy="320" r="3" fill="#FF6600" opacity="0.7"/>
            {/* TOP-LEFT card right-center */}
            <circle cx="255" cy="175" r="3" fill="#FF6600" opacity="0.7"/>
            {/* TOP-RIGHT card left-center */}
            <circle cx="605" cy="175" r="3" fill="#FF6600" opacity="0.7"/>
            {/* BOT-LEFT card right-center */}
            <circle cx="255" cy="465" r="3" fill="#FF6600" opacity="0.7"/>
            {/* BOT-RIGHT card left-center */}
            <circle cx="605" cy="465" r="3" fill="#FF6600" opacity="0.7"/>
          </svg>

          {/* ── NODE CARDS ── All positioned as % of 860×640 viewBox mapped to container ── */}
          {/* 
            Formula: left = (cx / 860 * 100)%, top = (cy / 640 * 100)%
            Card w=190 h=72 → translate(-50%,-50%) centers on (cx,cy)
          */}

          {/* Shared card style via inline — reused across all 8 nodes */}
          {(
            [
              { icon: UserCheck,  label: 'Authentication', cx: 430,  cy: 60  },
              { icon: Database,   label: 'Database',       cx: 160,  cy: 175 },
              { icon: Folder,     label: 'Storage',        cx: 700,  cy: 175 },
              { icon: CreditCard, label: 'Payments',       cx: 110,  cy: 320 },
              { icon: Code2,      label: 'APIs',           cx: 750,  cy: 320 },
              { icon: GitBranch,  label: 'Workflows',      cx: 160,  cy: 465 },
              { icon: Link2,      label: 'Integrations',   cx: 700,  cy: 465 },
              { icon: TrendingUp, label: 'Scaling',        cx: 430,  cy: 580 },
            ] as { icon: React.ElementType; label: string; cx: number; cy: number }[]
          ).map(({ icon: Icon, label, cx, cy }) => (
            <div
              key={label}
              className="absolute bg-white border border-[#EDEDED] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.012)] flex items-center gap-3.5 transition-transform duration-300 hover:-translate-y-0.5 z-10"
              style={{
                left: `${(cx / 860) * 100}%`,
                top:  `${(cy / 640) * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: '190px',
                height: '72px',
                padding: '0 18px',
              }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-orange-50 text-[#FF6600]">
                <Icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[15px] font-black text-slate-800 tracking-tight whitespace-nowrap">{label}</span>
            </div>
          ))}

          {/* ── CENTER HUB ── */}
          <div
            className="absolute bg-white border border-slate-200/90 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] flex flex-col items-center justify-center gap-4 z-20"
            style={{
              left: `${(430 / 860) * 100}%`,
              top:  `${(320 / 640) * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: '190px',
              height: '160px',
            }}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-[#FF6600] flex items-center justify-center shadow-[0_4px_14px_rgba(255,102,0,0.25)] border border-orange-500/30">
              <Globe className="text-white w-7 h-7" strokeWidth={2} />
            </div>
            <span className="text-[16px] font-black tracking-tight text-[#0A1124]">OneAtlas</span>
          </div>

        </div>
      </div>
    </section>
  );
}
