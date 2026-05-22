"use client";
import { useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════════
   CONSTELLATION BACKGROUND
════════════════════════════════════════════════ */
function Constellation() {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const NS = "http://www.w3.org/2000/svg";
    const N = 36;
    let W = window.innerWidth, H = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const points = Array.from({ length: N }).map(() => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
    }));
    const dotEls = points.map(() => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("r", "1.4"); c.setAttribute("fill", "rgba(100,87,241,.4)");
      svg.appendChild(c); return c;
    });
    let lineEls: SVGLineElement[] = [];
    function ensureLines(count: number, svgEl: SVGSVGElement) {
      while (lineEls.length < count) {
        const l = document.createElementNS(NS, "line");
        l.setAttribute("stroke", "rgba(100,87,241,.18)"); l.setAttribute("stroke-width", "1");
        svgEl.appendChild(l); lineEls.push(l);
      }
      for (let i = count; i < lineEls.length; i++) {
        lineEls[i].setAttribute("x1","0"); lineEls[i].setAttribute("x2","0");
        lineEls[i].setAttribute("y1","0"); lineEls[i].setAttribute("y2","0");
      }
    }
    let rafId: number;
    function step() {
      for (const p of points) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      dotEls.forEach((d, i) => {
        d.setAttribute("cx", points[i].x.toFixed(1)); d.setAttribute("cy", points[i].y.toFixed(1));
      });
      const connections: { a: number; b: number; d: number }[] = [];
      for (let i = 0; i < points.length; i++)
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x, dy = points[i].y - points[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 160) connections.push({ a: i, b: j, d });
        }
      if (svg) ensureLines(connections.length, svg);
      connections.forEach((c, idx) => {
        const a = points[c.a], b = points[c.b], el = lineEls[idx];
        el.setAttribute("x1", a.x.toFixed(1)); el.setAttribute("y1", a.y.toFixed(1));
        el.setAttribute("x2", b.x.toFixed(1)); el.setAttribute("y2", b.y.toFixed(1));
        el.setAttribute("stroke", `rgba(100,87,241,${(0.18*(1-c.d/160)).toFixed(2)})`);
      });
      rafId = requestAnimationFrame(step);
    }
    step();
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; svg.setAttribute("viewBox",`0 0 ${W} ${H}`); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize); };
  }, []);
  return <svg ref={svgRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} preserveAspectRatio="none" />;
}

/* ════════════════════════════════════════════════
   GLOW CARD
════════════════════════════════════════════════ */
function GlowCard({ children, className="", style={} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    if (glowRef.current)
      glowRef.current.style.background = `radial-gradient(320px circle at ${e.clientX-r.left}px ${e.clientY-r.top}px, rgba(100,87,241,.08), transparent 60%)`;
  };
  return (
    <article ref={ref as React.RefObject<HTMLElement>} className={`sp-card ${className}`} style={{ height:"100%", ...style }} onMouseMove={onMove}>
      <div ref={glowRef} className="sp-card-glow" />
      {children}
    </article>
  );
}

/* ─── SHARED HELPERS ─────────────────────────── */
const P = 20; // base card padding
function Badge({ bg, icon, shadow }: { bg:string; icon:React.ReactNode; shadow?:string }) {
  return (
    <div style={{ width:44, height:44, borderRadius:13, background:bg, display:"grid", placeItems:"center", marginBottom:14, flexShrink:0, boxShadow: shadow||"none" }}>
      {icon}
    </div>
  );
}
function AccentBar({ grad }: { grad:string }) {
  return <div style={{ width:28, height:3, borderRadius:2, background:grad, margin:"8px 0 10px" }} />;
}

/* ════════════════════════════════════════════════
   CARD 1 — Startup teams  (large left, row 1)
════════════════════════════════════════════════ */
function StartupCard() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p+1)%4), 1500);
    return () => clearInterval(id);
  }, []);
  const steps = [
    { label:"Database", color:"#635BFF", bg:"rgba(99,91,255,.1)"  },
    { label:"Auth",     color:"#00A37A", bg:"rgba(0,163,122,.1)"  },
    { label:"UI",       color:"#FF5996", bg:"rgba(255,89,150,.1)" },
    { label:"Deploy",   color:"#9B6CFB", bg:"rgba(155,108,251,.1)"},
  ];
  return (
    <GlowCard style={{ display:"flex", flexDirection:"column", background:"white" }}>
      <div style={{ padding:`${P}px ${P}px 0`, flex:1 }}>
        <Badge bg="linear-gradient(135deg,#635BFF,#9B6CFB)" shadow="0 6px 16px -4px rgba(99,91,255,.4)"
          icon={<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} />
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"var(--indigo)", margin:"0 0 6px", opacity:.9 }}>Startup teams</p>
        <h3 style={{ margin:0, fontSize:20, fontWeight:800, letterSpacing:"-.025em", color:"var(--ink)", lineHeight:1.2 }}>Ship before momentum fades</h3>
        <AccentBar grad="linear-gradient(90deg,var(--indigo),var(--violet))" />
        <p style={{ fontSize:13, color:"var(--ink-soft)", lineHeight:1.58, margin:"0 0 5px" }}>Launch new products, validate concepts, and iterate quickly without slowing down on development.</p>
        <p style={{ fontSize:11.5, color:"var(--ink-mute)", lineHeight:1.5, margin:0 }}>Generate complete applications, databases, authentication, and interfaces from simple instructions.</p>
      </div>
      {/* Pipeline */}
      <div style={{ margin:`14px ${P}px ${P}px`, background:"linear-gradient(160deg,rgba(240,238,254,.65),rgba(248,247,255,.45))", borderRadius:16, border:"1px solid rgba(99,91,255,.1)", padding:"12px 12px 10px" }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-mute)", margin:"0 0 10px" }}>Build pipeline</p>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          {steps.map((s, i) => (
            <div key={s.label} style={{ display:"flex", alignItems:"center", gap:4, flex:1 }}>
              <div style={{ flex:1, background:"white", border:`1.5px solid ${i===active ? s.color : "var(--line-soft)"}`, borderRadius:11, padding:"8px 4px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:4, boxShadow: i===active ? `0 4px 14px -4px ${s.color}44` : "none", transition:"all .45s cubic-bezier(.22,1,.36,1)", transform: i===active ? "translateY(-2px) scale(1.05)" : "scale(1)" }}>
                <div style={{ width:24, height:24, borderRadius:7, background: i<=active ? s.bg : "var(--cream-2)", color:s.color, display:"grid", placeItems:"center", transition:"all .4s" }}>
                  {i < active
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="3"><path d="M5 12l5 5L20 7"/></svg>
                    : i === active
                    ? <div style={{ width:7, height:7, borderRadius:"50%", background:s.color, boxShadow:`0 0 0 3px ${s.color}30`, animation:"spHeartbeat 1.4s ease-in-out infinite" }} />
                    : <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--line)" }} />
                  }
                </div>
                <span style={{ fontSize:9, fontWeight:700, color: i===active ? s.color : i<active ? "var(--ink)" : "var(--ink-mute)", letterSpacing:".02em", transition:"color .3s" }}>{s.label}</span>
                <span style={{ fontSize:8, fontWeight:700, padding:"1px 5px", borderRadius:999, background: i<active ? "rgba(0,163,122,.12)" : i===active ? `${s.color}18` : "transparent", color: i<active ? "#007964" : i===active ? s.color : "transparent", transition:"all .3s" }}>
                  {i<active ? "Done" : i===active ? "Live" : "·"}
                </span>
              </div>
              {i < steps.length-1 && <div style={{ fontSize:11, color: i<active ? "var(--indigo)" : "var(--line)", fontWeight:700, flexShrink:0, transition:"color .4s" }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   CARD 2 — Product & innovation  (top-right)
════════════════════════════════════════════════ */
function ProductCard() {
  return (
    <GlowCard style={{ background:"white" }}>
      <div style={{ padding:P }}>
        <Badge bg="linear-gradient(135deg,var(--coral-soft),#FFD0DF)" shadow="0 4px 12px -4px rgba(255,89,150,.22)"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>} />
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"var(--coral)", margin:"0 0 6px", opacity:.9 }}>Product &amp; innovation teams</p>
        <h3 style={{ margin:0, fontSize:18, fontWeight:800, letterSpacing:"-.022em", color:"var(--ink)", lineHeight:1.2 }}>Test ideas in real environments</h3>
        <AccentBar grad="linear-gradient(90deg,var(--coral),var(--peach))" />
        <p style={{ fontSize:13, color:"var(--ink-soft)", lineHeight:1.55, margin:"0 0 6px" }}>Explore new features, workflows, and experiments without waiting through engineering backlogs.</p>
        <p style={{ fontSize:11.5, color:"var(--ink-mute)", lineHeight:1.5, margin:0 }}>Turn rough concepts into usable software your team can review, refine, and deploy instantly.</p>
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   CARD 3 — Marketing & growth  (bottom-right)
════════════════════════════════════════════════ */
function MarketingCard() {
  return (
    <GlowCard style={{ background:"white" }}>
      <div style={{ padding:P }}>
        <Badge bg="linear-gradient(135deg,var(--mint-soft),#C6F8EE)" shadow="0 4px 12px -4px rgba(0,212,177,.22)"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.2" strokeLinecap="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>} />
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"var(--emerald)", margin:"0 0 6px", opacity:.9 }}>Marketing &amp; growth teams</p>
        <h3 style={{ margin:0, fontSize:18, fontWeight:800, letterSpacing:"-.022em", color:"var(--ink)", lineHeight:1.2 }}>Launch without dependencies</h3>
        <AccentBar grad="linear-gradient(90deg,var(--mint),var(--emerald))" />
        <p style={{ fontSize:13, color:"var(--ink-soft)", lineHeight:1.55, margin:"0 0 6px" }}>Create launch pages, acquisition funnels, and branded web experiences at the speed campaigns move.</p>
        <p style={{ fontSize:11.5, color:"var(--ink-mute)", lineHeight:1.5, margin:0 }}>Publish optimized pages with hosting, analytics, SEO, and forms already connected.</p>
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   CARD 4 — Agencies  (row 2 left)
════════════════════════════════════════════════ */
function AgenciesCard() {
  const [widths, setWidths] = useState([0,0,0]);
  useEffect(() => {
    const t = setTimeout(() => setWidths([78,52,92]), 400);
    const iv = setInterval(() => setWidths([
      Math.max(40,Math.min(97,78+(Math.random()-.5)*14)),
      Math.max(25,Math.min(78,52+(Math.random()-.5)*12)),
      Math.max(78,Math.min(99,92+(Math.random()-.5)*7)),
    ]), 2400);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);
  const rows = [
    { name:"Brand site",   dot:"#00D4B1", label:"In progress", sc:"var(--emerald)", sb:"var(--mint-soft)",  wi:0, bar:"linear-gradient(90deg,#00D4B1,#00A37A)" },
    { name:"SaaS landing", dot:"#F8BC42", label:"Review",      sc:"#A36F00",        sb:"var(--gold-soft)",  wi:1, bar:"linear-gradient(90deg,#F8BC42,#FFB17A)" },
    { name:"Mobile app",   dot:"#C8D0DC", label:"Done",        sc:"var(--ink-mute)",sb:"var(--cream-2)",    wi:2, bar:"linear-gradient(90deg,#C8D0DC,#D8E0EC)"  },
  ];
  return (
    <GlowCard style={{ display:"flex", flexDirection:"column", position:"relative", background:"white" }}>
      <div style={{ position:"absolute", top:16, right:16, width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,var(--peach),var(--coral))", display:"grid", placeItems:"center", boxShadow:"0 6px 16px rgba(255,89,150,.36)", zIndex:3, animation:"rolesBadgePop 3s ease-in-out infinite alternate" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      </div>
      <div style={{ padding:`${P}px ${P}px 0`, flex:1 }}>
        <Badge bg="linear-gradient(135deg,var(--peach-soft),#FFDECE)" shadow="0 4px 12px -4px rgba(255,177,122,.28)"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--peach)" strokeWidth="2.2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg>} />
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#C45A1F", margin:"0 0 6px", opacity:.9 }}>Agencies &amp; service businesses</p>
        <h3 style={{ margin:0, fontSize:20, fontWeight:800, letterSpacing:"-.025em", color:"var(--ink)", lineHeight:1.18 }}>Deliver custom software at scale</h3>
        <AccentBar grad="linear-gradient(90deg,var(--peach),var(--coral))" />
        <p style={{ fontSize:13, color:"var(--ink-soft)", lineHeight:1.55, margin:"0 0 5px" }}>Build client-facing platforms, dashboards, and workflows faster while handling more projects simultaneously.</p>
        <p style={{ fontSize:11.5, color:"var(--ink-mute)", lineHeight:1.5, margin:0 }}>Reduce repetitive setup work and accelerate delivery using AI-assisted app generation.</p>
      </div>
      <div style={{ margin:`12px ${P}px ${P}px`, background:"linear-gradient(160deg,rgba(255,233,220,.5),rgba(255,248,244,.4))", borderRadius:14, border:"1px solid rgba(255,177,122,.12)", padding:"11px 12px" }}>
        <p style={{ fontSize:9, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-mute)", margin:"0 0 9px" }}>Projects</p>
        {rows.map((p, i) => (
          <div key={p.name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom: i<2 ? 7 : 0, padding:"6px 10px", background:"white", borderRadius:9, border:"1px solid var(--line-soft)", boxShadow:"0 1px 3px rgba(10,37,64,.04)" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:p.dot, flexShrink:0 }} />
            <span style={{ flex:1, fontSize:12, fontWeight:600, color:"var(--ink)" }}>{p.name}</span>
            <div style={{ width:52, height:4, background:"var(--line-soft)", borderRadius:2, overflow:"hidden", flexShrink:0 }}>
              <div style={{ height:"100%", width:`${widths[p.wi]}%`, background:p.bar, borderRadius:2, transition:"width 2s cubic-bezier(.34,1.2,.64,1)" }} />
            </div>
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5, background:p.sb, color:p.sc, whiteSpace:"nowrap" }}>{p.label}</span>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   CARD 5 — Operations  (row 2 center)
════════════════════════════════════════════════ */
function OperationsCard() {
  const [nodeIdx, setNodeIdx] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setNodeIdx(p => p>=3 ? 0 : p+1), 1400);
    return () => clearInterval(id);
  }, []);
  const nodes = ["Request","Approve","Done"];
  const fillW = nodeIdx === 0 ? "0%" : nodeIdx === 1 ? "0%" : nodeIdx === 2 ? "50%" : "100%";
  return (
    <GlowCard style={{ display:"flex", flexDirection:"column", background:"white" }}>
      <div style={{ padding:`${P}px ${P}px 0`, flex:1 }}>
        <Badge bg="linear-gradient(135deg,#EEF9FF,#D0EFFF)" shadow="0 4px 12px -4px rgba(0,184,230,.2)"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sky-deep)" strokeWidth="2.2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} />
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"var(--sky-deep)", margin:"0 0 6px", opacity:.9 }}>Operations &amp; business teams</p>
        <h3 style={{ margin:0, fontSize:20, fontWeight:800, letterSpacing:"-.025em", color:"var(--ink)", lineHeight:1.18 }}>Automate the work behind the scenes</h3>
        <AccentBar grad="linear-gradient(90deg,var(--sky),var(--sky-deep))" />
        <p style={{ fontSize:13, color:"var(--ink-soft)", lineHeight:1.55, margin:"0 0 5px" }}>Replace fragmented tools and manual processes with software built around how your company actually works.</p>
        <p style={{ fontSize:11.5, color:"var(--ink-mute)", lineHeight:1.5, margin:0 }}>Create approval systems, CRMs, onboarding tools, reporting dashboards, and operational workflows visually.</p>
      </div>
      {/* Nodes */}
      <div style={{ margin:`12px ${P}px ${P}px`, background:"linear-gradient(160deg,rgba(238,249,255,.65),rgba(248,253,255,.5))", borderRadius:14, border:"1px solid rgba(0,184,230,.12)", padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", position:"relative" }}>
          <div style={{ position:"absolute", left:17, right:17, top:15, height:2, background:"repeating-linear-gradient(90deg,rgba(0,184,230,.28) 0 4px,transparent 4px 9px)", zIndex:0 }} />
          <div style={{ position:"absolute", left:17, top:15, height:2, background:"linear-gradient(90deg,var(--sky),var(--sky-deep))", borderRadius:2, transition:"width .7s cubic-bezier(.22,1,.36,1)", zIndex:1, width:fillW }} />
          {nodes.map((n, i) => (
            <div key={n} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, zIndex:2, position:"relative" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background: i<nodeIdx ? "linear-gradient(135deg,var(--sky),var(--sky-deep))" : "white", border:`2px solid ${i<nodeIdx ? "transparent" : i===nodeIdx ? "var(--sky-deep)" : "var(--line)"}`, display:"grid", placeItems:"center", boxShadow: i===nodeIdx ? "0 0 0 4px rgba(0,184,230,.18), 0 3px 10px -4px rgba(0,184,230,.4)" : i<nodeIdx ? "0 3px 10px -4px rgba(0,184,230,.38)" : "none", transition:"all .5s cubic-bezier(.22,1,.36,1)" }}>
                {i<nodeIdx
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
                  : i===nodeIdx
                  ? <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--sky-deep)", animation:"spHeartbeat 1.4s ease-in-out infinite" }} />
                  : <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--line)" }} />
                }
              </div>
              <span style={{ fontSize:10, fontWeight:700, color: i<=nodeIdx ? "var(--sky-deep)" : "var(--ink-mute)", whiteSpace:"nowrap", letterSpacing:".02em", transition:"color .4s" }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   CARD 6 — Independent builders  (row 2 right)
════════════════════════════════════════════════ */
function BuildersCard() {
  const [pulse, setPulse] = useState(0);
  const [shimmer, setShimmer] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPulse(p => (p+1)%4), 900);
    const id2 = setInterval(() => { setShimmer(true); setTimeout(() => setShimmer(false), 700); }, 3000);
    return () => { clearInterval(id); clearInterval(id2); };
  }, []);
  const blocks = [
    "linear-gradient(135deg,#F0EFFE,#E4E0FF)",
    "linear-gradient(135deg,var(--coral-soft),#FFCDD9)",
    "linear-gradient(135deg,var(--mint-soft),#C4F5E6)",
    "linear-gradient(135deg,var(--gold-soft),#FFE5A6)",
  ];
  return (
    <GlowCard style={{ display:"flex", flexDirection:"column", background:"white" }}>
      <div style={{ padding:`${P}px ${P}px 0`, flex:1 }}>
        <Badge bg="linear-gradient(135deg,#F4F2FF,#EAE6FF)" shadow="0 4px 12px -4px rgba(122,115,255,.24)"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2.2" strokeLinecap="round"><path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M7 11v5c0 1 2 3 5 3s5-2 5-3v-5"/></svg>} />
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"var(--violet)", margin:"0 0 6px", opacity:.9 }}>Independent builders</p>
        <h3 style={{ margin:0, fontSize:20, fontWeight:800, letterSpacing:"-.025em", color:"var(--ink)", lineHeight:1.18 }}>Create products without technical overhead</h3>
        <AccentBar grad="linear-gradient(90deg,var(--violet),var(--indigo))" />
        <p style={{ fontSize:13, color:"var(--ink-soft)", lineHeight:1.55, margin:"0 0 5px" }}>Bring side projects, AI ideas, and business concepts to life without becoming a full-stack engineer.</p>
        <p style={{ fontSize:11.5, color:"var(--ink-mute)", lineHeight:1.5, margin:0 }}>Design, customize, and launch production-ready applications from a single workspace.</p>
      </div>
      {/* Workspace */}
      <div style={{ margin:`12px ${P}px ${P}px`, background:"white", borderRadius:12, border:"1px solid var(--line-soft)", padding:"10px 11px", boxShadow:"0 2px 8px -4px rgba(10,37,64,.07)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%)", transform: shimmer ? "translateX(130%)" : "translateX(-130%)", transition: shimmer ? "transform .65s ease" : "none", pointerEvents:"none", zIndex:5 }} />
        <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:8 }}>
          {["#FF6058","#FFBD2D","#28C940"].map(c => <div key={c} style={{ width:7, height:7, borderRadius:"50%", background:c }} />)}
          <div style={{ flex:1, height:9, background:"var(--line-soft)", borderRadius:4, marginLeft:7 }} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
          {blocks.map((bg, i) => (
            <div key={i} style={{ height:24, borderRadius:6, background:bg, transition:"opacity .4s, transform .4s", opacity: i===pulse ? 1 : .6, transform: i===pulse ? "scale(1.04)" : "scale(1)" }} />
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
          <div style={{ fontSize:9.5, color:"var(--emerald)", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--mint)", boxShadow:"0 0 0 3px rgba(0,212,177,.22)", animation:"spHeartbeat 1.6s ease-in-out infinite" }} />
            Live
          </div>
          <button style={{ padding:"4px 10px", borderRadius:7, background:"linear-gradient(135deg,var(--violet),var(--indigo))", color:"white", fontSize:10, fontWeight:700, border:"none", cursor:"pointer", boxShadow:"0 3px 9px rgba(99,91,255,.36)" }}>Publish →</button>
        </div>
        <div style={{ position:"absolute", top:-9, right:11, background:"linear-gradient(135deg,var(--indigo),var(--violet))", color:"white", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:7, boxShadow:"0 3px 9px rgba(99,91,255,.36)" }}>&lt;/&gt;</div>
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   PIPELINE — UNCHANGED
════════════════════════════════════════════════ */
function Pipeline() {
  const steps = [
    { num:1, title:"Capture", desc:"Drop a sketch, a doc, a Loom. Atlas reads context like a teammate.", icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6457f1" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> },
    { num:2, title:"Design",  desc:"Live prototypes you can click within seconds — no Figma round-trips.", icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a463f6" strokeWidth="2"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M7 12h6M7 15h4"/></svg> },
    { num:3, title:"Build",   desc:"Real code, real components, real types. Editable end-to-end.", icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e95aa8" strokeWidth="2"><path d="M4 17l5-5-5-5"/><path d="M12 19h8"/></svg> },
    { num:4, title:"Ship",    desc:"One click to a global edge. Versioned, monitored, reversible.", icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M5 13l4 4L19 7"/><circle cx="12" cy="12" r="9"/></svg> },
  ];
  return (
    <div className="sp-pipeline-section">
      <div className="sp-section-head">
        <h2>From spark to <span className="sp-grad">live product</span></h2>
        <p>OneAtlas runs the full pipeline so your team can focus on building, not configuring infrastructure.</p>
      </div>
      <div className="sp-pipeline">
        <div className="sp-signal" />
        <div className="sp-pipe-track">
          {steps.map(s => (
            <div key={s.num} className="sp-pipe-step">
              <div className="sp-pipe-icon">
                <div className="sp-pipe-ring" /><div className="sp-pipe-num">{s.num}</div>{s.icon}
              </div>
              <div className="sp-pipe-title">{s.title}</div>
              <p className="sp-pipe-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════════ */
export function RolesBento() {
  return (
    <section className="sp-section">
      <div className="sp-bg" aria-hidden="true">
        <div className="sp-bg-grid" />
        <div className="sp-blob sp-b1" /><div className="sp-blob sp-b2" />
        <div className="sp-blob sp-b3" /><div className="sp-blob sp-b4" />
        <Constellation />
        <div className="sp-noise" />
      </div>

      <div className="container-x" style={{ position:"relative", zIndex:1 }}>
        {/* Header */}
        <div className="sp-hero">
          <div className="sp-eyebrow"><span className="sp-pulse" />Built for people who move fast</div>
          <h2 className="sp-hero-title">OneAtlas turns ideas into <span className="sp-grad">working software</span></h2>
          <p className="sp-hero-sub">Create AI apps, internal tools, customer portals, automations, and full products — without managing codebases, infrastructure, or complex workflows.</p>
        </div>

        {/* ROW 1: Large LEFT (55%) + 2 stacked RIGHT (45%) */}
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:12, marginBottom:12 }}>
          <StartupCard />
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ flex:1 }}><ProductCard /></div>
            <div style={{ flex:1 }}><MarketingCard /></div>
          </div>
        </div>

        {/* ROW 2: 3 equal cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          <AgenciesCard />
          <OperationsCard />
          <BuildersCard />
        </div>

        <Pipeline />
      </div>

      <style>{`
        @keyframes rolesBadgePop {
          from { transform:rotate(-4deg) scale(1); }
          to   { transform:rotate(4deg) scale(1.07); }
        }
        @media (max-width:900px) {
          .sp-section .container-x > div[style*="1.4fr"] { grid-template-columns:1fr !important; }
          .sp-section .container-x > div[style*="1fr 1fr 1fr"] { grid-template-columns:1fr !important; }
        }
      `}</style>
    </section>
  );
}