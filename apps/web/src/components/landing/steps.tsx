"use client";
import { StepsCanvas } from "./steps-canvas";

/* ── Card 1: UI assembling from prompt ── */
function Card1Anim() {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ display: "flex", gap: 5, marginBottom: 12, alignItems: "center" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#635BFF", animation: "dot-pulse 2s ease-in-out infinite" }} />
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: "linear-gradient(90deg,#635BFF,#a855f7)", animation: "grow-right 3s ease-in-out infinite", transformOrigin: "left" }} />
      </div>
      {/* Nav row */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[25, 15, 15, 35].map((w, i) => (
          <div key={i} style={{ width: `${w}%`, height: 6, borderRadius: 3, background: i === 3 ? "rgba(99,91,255,0.12)" : "rgba(0,0,0,0.06)", animation: `fade-up 3s ease-out infinite`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      {/* Hero block */}
      <div style={{ height: 36, borderRadius: 8, background: "linear-gradient(90deg,rgba(99,91,255,0.08),rgba(168,85,247,0.05))", border: "1px solid rgba(99,91,255,0.08)", marginBottom: 8, animation: "fade-up 3s ease-out infinite", animationDelay: "0.5s" }} />
      {/* Two columns */}
      <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
        <div style={{ flex: 1, height: 22, borderRadius: 7, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.05)", animation: "fade-up 3s ease-out infinite", animationDelay: "0.7s" }} />
        <div style={{ flex: 1, height: 22, borderRadius: 7, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.05)", animation: "fade-up 3s ease-out infinite", animationDelay: "0.9s" }} />
      </div>
      {/* Button row */}
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        <div style={{ width: "28%", height: 20, borderRadius: 20, background: "linear-gradient(135deg,#635BFF,#a855f7)", animation: "fade-up 3s ease-out infinite", animationDelay: "1.1s", boxShadow: "0 4px 10px rgba(99,91,255,0.2)" }} />
      </div>
    </div>
  );
}

/* ── Card 2: Data connections forming ── */
function Card2Anim() {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
      <svg viewBox="0 0 240 110" fill="none" style={{ width: "100%", height: 110 }}>
        {/* Left node — client */}
        <rect x="8" y="42" width="32" height="26" rx="6" fill="rgba(99,91,255,0.08)" stroke="rgba(99,91,255,0.3)" strokeWidth="1.2"/>
        <rect x="14" y="49" width="20" height="3" rx="1.5" fill="rgba(99,91,255,0.4)" />
        <rect x="14" y="56" width="14" height="3" rx="1.5" fill="rgba(99,91,255,0.2)" />

        {/* Center orchestrator */}
        <rect x="84" y="38" width="32" height="34" rx="8" fill="rgba(99,91,255,0.1)" stroke="#635BFF" strokeWidth="1.5"/>
        <circle cx="100" cy="55" r="8" fill="rgba(99,91,255,0.15)" stroke="#635BFF" strokeWidth="1.2"/>
        <circle cx="100" cy="55" r="3.5" fill="#635BFF" style={{ animation: "dot-pulse 1.5s ease-in-out infinite" }}/>

        {/* Right nodes */}
        <rect x="192" y="14" width="28" height="20" rx="5" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
        <rect x="192" y="44" width="28" height="20" rx="5" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.3)" strokeWidth="1"/>
        <rect x="192" y="74" width="28" height="20" rx="5" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.3)" strokeWidth="1"/>

        {/* Left → center line */}
        <line x1="40" y1="55" x2="84" y2="55" stroke="rgba(99,91,255,0.3)" strokeWidth="1.2" strokeDasharray="4 3" style={{ animation: "dash-flow 2s linear infinite" }}/>

        {/* Center → right lines */}
        <line x1="116" y1="50" x2="158" y2="24" stroke="rgba(168,85,247,0.3)" strokeWidth="1.2" strokeDasharray="4 3" style={{ animation: "dash-flow 2s linear infinite", animationDelay: "0.2s" }}/>
        <line x1="116" y1="55" x2="158" y2="54" stroke="rgba(16,185,129,0.3)" strokeWidth="1.2" strokeDasharray="4 3" style={{ animation: "dash-flow 2s linear infinite", animationDelay: "0.5s" }}/>
        <line x1="116" y1="60" x2="158" y2="84" stroke="rgba(245,158,11,0.3)" strokeWidth="1.2" strokeDasharray="4 3" style={{ animation: "dash-flow 2s linear infinite", animationDelay: "0.8s" }}/>

        {/* Traveling dots */}
        <circle r="3" fill="#635BFF" style={{ offsetPath: "path('M40,55 L84,55')", animation: "travel 2s linear infinite", offsetDistance: "0%" }}/>
        <circle r="2.5" fill="#a855f7" style={{ offsetPath: "path('M116,50 L158,24')", animation: "travel 2.5s linear infinite", animationDelay: "0.3s", offsetDistance: "0%" }}/>
        <circle r="2.5" fill="#10b981" style={{ offsetPath: "path('M116,55 L158,54')", animation: "travel 2s linear infinite", animationDelay: "0.8s", offsetDistance: "0%" }}/>
        <circle r="2.5" fill="#f59e0b" style={{ offsetPath: "path('M116,60 L158,84')", animation: "travel 2.5s linear infinite", animationDelay: "1.2s", offsetDistance: "0%" }}/>
      </svg>
    </div>
  );
}

/* ── Card 3: Deployment pipeline ── */
function Card3Anim() {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
      <svg viewBox="0 0 200 110" fill="none" style={{ width: "100%", height: 110 }}>
        {/* Pipeline track */}
        <line x1="20" y1="55" x2="180" y2="55" stroke="rgba(0,0,0,0.06)" strokeWidth="2"/>
        {/* Animated fill */}
        <line x1="20" y1="55" x2="180" y2="55" stroke="url(#pipeGrad)" strokeWidth="2" style={{ animation: "pipe-fill 3s ease-in-out infinite" }}/>
        <defs>
          <linearGradient id="pipeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#635BFF"/>
            <stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>

        {/* Stage 1 — Build (done) */}
        <circle cx="48" cy="55" r="14" fill="linear-gradient(135deg,#635BFF,#a855f7)" style={{ animation: "none" }}/>
        <circle cx="48" cy="55" r="14" fill="#635BFF"/>
        <polyline points="42,55 47,60 55,50" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="33" y="74" width="30" height="4" rx="2" fill="rgba(0,0,0,0.07)"/>

        {/* Stage 2 — Staging (done) */}
        <circle cx="100" cy="55" r="14" fill="#a855f7"/>
        <polyline points="94,55 99,60 107,50" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="85" y="74" width="30" height="4" rx="2" fill="rgba(0,0,0,0.07)"/>

        {/* Stage 3 — Production (active) */}
        <circle cx="152" cy="55" r="14" fill="rgba(99,91,255,0.08)" stroke="#635BFF" strokeWidth="1.5" style={{ animation: "ring-pulse 2s ease-in-out infinite" }}/>
        <circle cx="152" cy="55" r="6" fill="rgba(99,91,255,0.3)" style={{ animation: "dot-pulse 1.5s ease-in-out infinite" }}/>
        <circle cx="152" cy="55" r="3" fill="#635BFF"/>
        <rect x="137" y="74" width="30" height="4" rx="2" fill="rgba(99,91,255,0.15)"/>

        {/* Moving deploy dot */}
        <circle r="4" fill="white" stroke="#635BFF" strokeWidth="1.5" style={{ offsetPath: "path('M20,55 L180,55')", animation: "travel 3s ease-in-out infinite", offsetDistance: "0%", filter: "drop-shadow(0 0 4px rgba(99,91,255,0.5))" }}/>

        {/* Status indicator top right */}
        <circle cx="185" cy="18" r="5" fill="#10b981" style={{ animation: "dot-pulse 2s ease-in-out infinite" }}/>
        <rect x="168" y="28" width="24" height="3" rx="1.5" fill="rgba(16,185,129,0.3)"/>
        <rect x="172" y="34" width="16" height="3" rx="1.5" fill="rgba(16,185,129,0.2)"/>
      </svg>
    </div>
  );
}

/* ── Card 4: AI model routing ── */
function Card4Anim() {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 14, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
      <svg viewBox="0 0 200 110" fill="none" style={{ width: "100%", height: 110 }}>
        {/* Central router */}
        <circle cx="100" cy="55" r="18" fill="rgba(99,91,255,0.08)" stroke="#635BFF" strokeWidth="1.5"/>
        <circle cx="100" cy="55" r="10" fill="rgba(99,91,255,0.15)" style={{ animation: "ring-pulse 2s ease-in-out infinite" }}/>
        <circle cx="100" cy="55" r="5" fill="#635BFF"/>

        {/* Outer model nodes */}
        {/* GPT — top left */}
        <circle cx="36" cy="25" r="12" fill="rgba(16,163,127,0.08)" stroke="rgba(16,163,127,0.4)" strokeWidth="1.2"/>
        <circle cx="36" cy="25" r="5" fill="rgba(16,163,127,0.5)" style={{ animation: "dot-pulse 2.2s ease-in-out infinite", animationDelay: "0s" }}/>

        {/* Claude — right */}
        <circle cx="172" cy="38" r="14" fill="rgba(217,119,87,0.12)" stroke="rgba(217,119,87,0.5)" strokeWidth="1.8"/>
        <circle cx="172" cy="38" r="6" fill="#D97757" style={{ animation: "dot-pulse 1.8s ease-in-out infinite", animationDelay: "0.3s" }}/>
        {/* Selected glow */}
        <circle cx="172" cy="38" r="18" fill="none" stroke="rgba(217,119,87,0.2)" strokeWidth="1" style={{ animation: "ring-pulse 1.8s ease-in-out infinite" }}/>

        {/* Gemini — bottom left */}
        <circle cx="36" cy="85" r="12" fill="rgba(66,133,244,0.08)" stroke="rgba(66,133,244,0.4)" strokeWidth="1.2"/>
        <circle cx="36" cy="85" r="5" fill="rgba(66,133,244,0.5)" style={{ animation: "dot-pulse 2.4s ease-in-out infinite", animationDelay: "0.6s" }}/>

        {/* Llama — bottom right */}
        <circle cx="164" cy="84" r="11" fill="rgba(8,102,255,0.08)" stroke="rgba(8,102,255,0.3)" strokeWidth="1"/>
        <circle cx="164" cy="84" r="4.5" fill="rgba(8,102,255,0.4)" style={{ animation: "dot-pulse 2.6s ease-in-out infinite", animationDelay: "0.9s" }}/>

        {/* Mistral — top right */}
        <circle cx="164" cy="22" r="10" fill="rgba(250,82,15,0.08)" stroke="rgba(250,82,15,0.3)" strokeWidth="1"/>
        <circle cx="164" cy="22" r="4" fill="rgba(250,82,15,0.4)" style={{ animation: "dot-pulse 2s ease-in-out infinite", animationDelay: "0.5s" }}/>

        {/* Connection lines */}
        <line x1="48" y1="30" x2="82" y2="48" stroke="rgba(16,163,127,0.2)" strokeWidth="1" strokeDasharray="3 3" style={{ animation: "dash-flow 2s linear infinite" }}/>
        <line x1="158" y1="42" x2="118" y2="52" stroke="rgba(217,119,87,0.4)" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: "dash-flow 1.8s linear infinite" }}/>
        <line x1="48" y1="80" x2="82" y2="62" stroke="rgba(66,133,244,0.2)" strokeWidth="1" strokeDasharray="3 3" style={{ animation: "dash-flow 2.2s linear infinite", animationDelay: "0.5s" }}/>
        <line x1="153" y1="80" x2="118" y2="62" stroke="rgba(8,102,255,0.15)" strokeWidth="1" strokeDasharray="3 3" style={{ animation: "dash-flow 2.4s linear infinite", animationDelay: "0.8s" }}/>
        <line x1="154" y1="26" x2="118" y2="48" stroke="rgba(250,82,15,0.15)" strokeWidth="1" strokeDasharray="3 3" style={{ animation: "dash-flow 2s linear infinite", animationDelay: "0.3s" }}/>

        {/* Signal traveling to Claude (selected) */}
        <circle r="3.5" fill="#D97757" style={{ offsetPath: "path('M100,55 L158,42')", animation: "travel 1.8s ease-in-out infinite", offsetDistance: "0%", filter: "drop-shadow(0 0 4px rgba(217,119,87,0.7))" }}/>
        <circle r="2.5" fill="#635BFF" style={{ offsetPath: "path('M48,30 L82,48')", animation: "travel 2.5s linear infinite", animationDelay: "0.4s", offsetDistance: "0%" }}/>
      </svg>
    </div>
  );
}

export function Steps() {
  return (
    <section className="section" style={{ position: "relative", overflow: "hidden", background: "#FAFBFF" }}>
      <StepsCanvas />
      <div className="container-x" style={{ position: "relative", zIndex: 1 }}>
        <div className="steps-head">
          <span className="eyebrow">Meet OneAtlas</span>
          <h2 className="section-title">
            From idea to live app in <span className="grad">4 steps</span>
          </h2>
        </div>
        <div className="steps-grid">
          <div className="step-item s1">
            <div className="step-eyebrow"><span className="step-counter s1-counter">01 / 04</span></div>
            <h3 className="step-title">From idea to working software</h3>
            <p className="step-desc">Describe what you want to build. OneAtlas generates the full product foundation instantly.</p>
            <Card1Anim />
          </div>
          <div className="step-item s2">
            <div className="step-eyebrow"><span className="step-counter s2-counter">02 / 04</span></div>
            <h3 className="step-title" style={{ whiteSpace: "nowrap", fontSize: "clamp(14px, 1.4vw, 18px)" }}>Your backend, already in motion</h3>
            <p className="step-desc">Auth, databases, APIs, and storage are auto-structured behind the scenes from day one.</p>
            <Card2Anim />
          </div>
          <div className="step-item s3">
            <div className="step-eyebrow"><span className="step-counter s3-counter">03 / 04</span></div>
            <h3 className="step-title">Built to go live fast</h3>
            <p className="step-desc">Hosting, deployment, domains, and scaling are built in — go from building to live instantly.</p>
            <Card3Anim />
          </div>
          <div className="step-item s4">
            <div className="step-eyebrow"><span className="step-counter s4-counter">04 / 04</span></div>
            <h3 className="step-title">AI-native by default</h3>
            <p className="step-desc">AI models, agents, and workflows run inside your product automatically — no configuration needed.</p>
            <Card4Anim />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes dot-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        @keyframes ring-pulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes grow-right { 0%{transform:scaleX(0);opacity:0} 30%{opacity:1} 70%{transform:scaleX(1);opacity:1} 100%{transform:scaleX(1);opacity:0.7} }
        @keyframes fade-up { 0%{opacity:0;transform:translateY(5px)} 30%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0.7} }
        @keyframes dash-flow { to{stroke-dashoffset:-14} }
        @keyframes travel { 0%{offset-distance:0%;opacity:1} 80%{opacity:1} 100%{offset-distance:100%;opacity:0} }
        @keyframes pipe-fill { 0%{stroke-dasharray:0 200} 60%{stroke-dasharray:160 200} 100%{stroke-dasharray:160 200} }
      `}</style>
    </section>
  );
}