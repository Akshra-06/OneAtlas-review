"use client";
import { StepsCanvas } from "./steps-canvas";

const ANIM_HEIGHT = 160;

function Anim1() {
  return (
    <div style={{ height: ANIM_HEIGHT, background: "rgba(99,91,255,0.04)", border: "1px solid rgba(99,91,255,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 20px", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, flex: 1 }}>
        <div style={{ height: 6, width: "90%", borderRadius: 3, background: "rgba(99,91,255,0.2)" }} />
        <div style={{ height: 6, width: "70%", borderRadius: 3, background: "rgba(99,91,255,0.12)" }} />
        <div style={{ height: 6, width: "80%", borderRadius: 3, background: "rgba(99,91,255,0.08)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ animation: "arrowPulse 2s ease-in-out infinite" }}>
          <path d="M5 12h14M12 5l7 7-7 7" stroke="#635BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{ fontSize: 9, color: "#635BFF", fontWeight: 700, letterSpacing: "0.06em" }}>AI</div>
      </div>
      <div style={{ flex: 1, background: "#fff", borderRadius: 8, border: "1px solid rgba(99,91,255,0.15)", padding: 10, boxShadow: "0 4px 16px rgba(99,91,255,0.1)", animation: "fadeIn 2s ease-out infinite" }}>
        <div style={{ height: 5, width: "60%", borderRadius: 3, background: "linear-gradient(90deg,#635BFF,#a855f7)", marginBottom: 6 }} />
        <div style={{ height: 4, width: "90%", borderRadius: 3, background: "rgba(0,0,0,0.06)", marginBottom: 4 }} />
        <div style={{ height: 4, width: "75%", borderRadius: 3, background: "rgba(0,0,0,0.06)", marginBottom: 4 }} />
        <div style={{ height: 16, width: "45%", borderRadius: 6, background: "linear-gradient(90deg,#635BFF,#a855f7)", marginTop: 6 }} />
      </div>
    </div>
  );
}

function Anim2() {
  const services = [
    { icon: "🔐", color: "#635BFF" },
    { icon: "🗄️", color: "#a855f7" },
    { icon: "⚡", color: "#10b981" },
    { icon: "📦", color: "#f59e0b" },
  ];
  return (
    <div style={{ height: ANIM_HEIGHT, background: "rgba(99,91,255,0.04)", border: "1px solid rgba(99,91,255,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
        {services.map((s, i) => (
          <div key={i} style={{ background: "#fff", border: `1px solid ${s.color}22`, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 2px 8px ${s.color}10`, animation: "fadeUp 3s ease-out infinite", animationDelay: `${i * 0.4}s` }}>
            <span style={{ fontSize: 16 }}>{s.icon}</span>
            <div>
              <div style={{ width: 30, height: 4, borderRadius: 2, background: s.color, opacity: 0.6 }} />
              <div style={{ width: 20, height: 3, borderRadius: 2, background: "rgba(0,0,0,0.08)", marginTop: 3 }} />
            </div>
            <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#10b981", animation: "slowPulse 2s ease-in-out infinite", animationDelay: `${i * 0.3}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Anim3() {
  return (
    <div style={{ height: ANIM_HEIGHT, background: "rgba(99,91,255,0.04)", border: "1px solid rgba(99,91,255,0.1)", borderRadius: 12, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 16, padding: "0 20px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#635BFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99,91,255,0.3)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#635BFF" }}>Build</div>
        </div>
        <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg,#635BFF,#a855f7)", margin: "0 8px", marginBottom: 18, maxWidth: 40 }} />
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(168,85,247,0.3)", animation: "fadeIn 3s ease-out infinite", animationDelay: "0.8s" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#a855f7" }}>Staging</div>
        </div>
        <div style={{ flex: 1, height: 2, background: "rgba(0,0,0,0.08)", margin: "0 8px", marginBottom: 18, maxWidth: 40, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#a855f7,#10b981)", animation: "grow 3s ease-in-out infinite", animationDelay: "1.5s" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(16,185,129,0.3)", animation: "fadeIn 3s ease-out infinite", animationDelay: "1.6s" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#10b981" }}>Live</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "#fff", borderRadius: 20, border: "1px solid rgba(16,185,129,0.2)", boxShadow: "0 2px 8px rgba(16,185,129,0.1)" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "slowPulse 2s ease-in-out infinite" }} />
        <div style={{ width: 60, height: 4, borderRadius: 2, background: "rgba(16,185,129,0.3)" }} />
      </div>
    </div>
  );
}

function Anim4() {
  const models = [
    { emoji: "🤖", color: "#10A37F", active: false },
    { emoji: "✦", color: "#D97757", active: true },
    { emoji: "💎", color: "#4285F4", active: false },
  ];
  return (
    <div style={{ height: ANIM_HEIGHT, background: "rgba(99,91,255,0.04)", border: "1px solid rgba(99,91,255,0.1)", borderRadius: 12, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 10, padding: "0 16px", overflow: "hidden" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#635BFF,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,91,255,0.3)", animation: "slowPulse 2.5s ease-in-out infinite" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a5 5 0 0 1 5 5c0 1-.3 2-.8 2.8A4 4 0 0 1 20 13a4 4 0 0 1-4 4h-1v3h-6v-3H8a4 4 0 0 1-4-4 4 4 0 0 1 3.8-3.2A5 5 0 0 1 7 7a5 5 0 0 1 5-5z"/>
        </svg>
      </div>
      <div style={{ display: "flex", gap: 8, width: "100%" }}>
        {models.map((m, i) => (
          <div key={i} style={{ flex: 1, background: m.active ? "#fff" : "rgba(255,255,255,0.5)", border: `1.5px solid ${m.active ? m.color + "50" : "rgba(0,0,0,0.07)"}`, borderRadius: 10, padding: "8px 6px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 5, boxShadow: m.active ? `0 4px 14px ${m.color}20` : "none", animation: m.active ? "selectedGlow 2.5s ease-in-out infinite" : "none" }}>
            <span style={{ fontSize: 16 }}>{m.emoji}</span>
            <div style={{ width: "70%", height: 3, borderRadius: 2, background: m.active ? m.color : "rgba(0,0,0,0.08)" }} />
            {m.active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, animation: "slowPulse 1.5s ease-in-out infinite" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

const STEPS = [
  { n: "01 / 04", cls: "s1", title: "From idea to working software", desc: "Describe what to build. OneAtlas generates it instantly.", Anim: Anim1 },
  { n: "02 / 04", cls: "s2", title: "Backend, already in motion", desc: "Auth, database, APIs and storage — auto-structured from day one.", Anim: Anim2 },
  { n: "03 / 04", cls: "s3", title: "Built to go live fast", desc: "Hosting, deployment, and scaling — all built in.", Anim: Anim3 },
  { n: "04 / 04", cls: "s4", title: "AI-native by default", desc: "AI models route and run inside your product automatically.", Anim: Anim4 },
];

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
          {STEPS.map(({ n, cls, title, desc, Anim }) => (
            <div key={n} className={`step-item ${cls}`}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <span className={`step-counter ${cls}-counter`}>{n}</span>
              </div>
              <h3 className="step-title">{title}</h3>
              <p className="step-desc" style={{ marginBottom: 14 }}>{desc}</p>
              <Anim />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes arrowPulse { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
        @keyframes fadeIn { 0%{opacity:0} 40%{opacity:1} 100%{opacity:0.9} }
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(6px)} 30%{opacity:1;transform:translateY(0)} 100%{opacity:0.9} }
        @keyframes slowPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.1)} }
        @keyframes grow { 0%{width:0%} 100%{width:100%} }
        @keyframes selectedGlow { 0%,100%{box-shadow:0 4px 10px rgba(217,119,87,0.15)} 50%{box-shadow:0 4px 20px rgba(217,119,87,0.35)} }
      `}</style>
    </section>
  );
}