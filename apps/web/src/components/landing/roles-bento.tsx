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
      c.setAttribute("r", "1.4");
      c.setAttribute("fill", "rgba(100,87,241,.4)");
      svg.appendChild(c);
      return c;
    });
      let lineEls: SVGLineElement[] = [];
      function ensureLines(count: number, svgEl: SVGSVGElement) {
      while (lineEls.length < count) {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("stroke", "rgba(100,87,241,.18)");
      l.setAttribute("stroke-width", "1");
      svgEl.appendChild(l);
      lineEls.push(l);
    }
      for (let i = count; i < lineEls.length; i++) {
        lineEls[i].setAttribute("x1", "0"); lineEls[i].setAttribute("x2", "0");
        lineEls[i].setAttribute("y1", "0"); lineEls[i].setAttribute("y2", "0");
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
        d.setAttribute("cx", points[i].x.toFixed(1));
        d.setAttribute("cy", points[i].y.toFixed(1));
      });
      const connections: { a: number; b: number; d: number }[] = [];
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x, dy = points[i].y - points[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) connections.push({ a: i, b: j, d });
        }
      }
      if (svg) ensureLines(connections.length, svg);
      connections.forEach((c, idx) => {
        const a = points[c.a], b = points[c.b];
        const el = lineEls[idx];
        el.setAttribute("x1", a.x.toFixed(1)); el.setAttribute("y1", a.y.toFixed(1));
        el.setAttribute("x2", b.x.toFixed(1)); el.setAttribute("y2", b.y.toFixed(1));
        el.setAttribute("stroke", `rgba(100,87,241,${(0.18 * (1 - c.d / 160)).toFixed(2)})`);
      });
      rafId = requestAnimationFrame(step);
    }
    step();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <svg
      ref={svgRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      preserveAspectRatio="none"
    />
  );
}

/* ════════════════════════════════════════════════
   CARD WRAPPER — mouse-tracked glow
════════════════════════════════════════════════ */
function GlowCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(380px circle at ${x}px ${y}px, rgba(100,87,241,.13), transparent 55%)`;
    }
  };

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className={`sp-card ${className}`}
      style={style}
      onMouseMove={onMove}
    >
      <div ref={glowRef} className="sp-card-glow" />
      {children}
    </article>
  );
}

/* ════════════════════════════════════════════════
   CARD 1 — Product Managers (version history)
════════════════════════════════════════════════ */
function PMCard() {
  return (
    <GlowCard>
      <div className="sp-card-body">
        <h3>
          <span className="sp-badge sp-badge-indigo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/>
              <path d="M6 9v6"/><path d="M6 12c0 3.5 3 6 6 6h3.5"/>
            </svg>
          </span>
          Product managers
        </h3>
        <p className="sp-lead">Go from insight to prototype in hours and test ideas with your team before the day is over.</p>
      </div>
      <div className="sp-visual">
        <div className="sp-vh-head">
          <div className="sp-vh-title">Version history</div>
          <div className="sp-vh-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            Search versions
          </div>
        </div>
        <div className="sp-vh-section">BOOKMARKED · 4</div>
        <div className="sp-tree">
          <div className="sp-commit sp-commit-live">
            <div className="sp-commit-title">Landing page · v4 <span className="sp-branch-label">main</span></div>
            <div className="sp-commit-meta">Published · Jun 7 6:00PM</div>
            <span className="sp-revert">Open</span>
          </div>
          <div className="sp-commit sp-commit-indigo sp-commit-branch">
            <div className="sp-commit-title">Hero CTA experiment</div>
            <div className="sp-commit-meta">Mira · 12 min ago</div>
            <span className="sp-revert">Revert</span>
          </div>
          <div className="sp-commit sp-commit-indigo">
            <div className="sp-commit-title">Pricing copy revision</div>
            <div className="sp-commit-meta">Jaden · 2h ago</div>
            <span className="sp-revert">Revert</span>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   CARD 2 — Entrepreneurs (deploy + share)
════════════════════════════════════════════════ */
function EntreCard() {
  return (
    <GlowCard>
      <div className="sp-card-body">
        <h3>
          <span className="sp-badge sp-badge-pink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 13l4 4L19 7"/><path d="M5 19h14" strokeOpacity=".5"/>
            </svg>
          </span>
          Entrepreneurs
        </h3>
        <p className="sp-lead">Launch a full business in days, not months. From landing page to product, all in one flow.</p>
      </div>
      <div className="sp-visual">
        <div className="sp-deploy-card" style={{ position: "relative" }}>
          <span className="sp-build-tag">● LIVE</span>
          <div className="sp-deploy-title">Publish your project</div>
          <div className="sp-deploy-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18"/></svg>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>https://dunder-mifflin.com</span>
          </div>
          <div className="sp-deploy-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            <span>Deployed <strong style={{ color: "var(--sp-ink)" }}>42s ago</strong> · build #128</span>
          </div>
          <div className="sp-deploy-row">
            <span className="sp-status-dot" />
            <span style={{ color: "#22c55e", fontWeight: 600 }}>Up to date</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--sp-muted)" }}>edge · 14 regions</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--sp-muted)" }}>Share with friends and coworkers</div>
          <div className="sp-share-row">
            {[
              <svg key="x" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.52 7.451L22 22h-6.797l-4.46-5.83L5.643 22H2.886l7.013-8.012L2 2h6.984l4.03 5.341L18.244 2zM17.18 20.27h1.6L7.96 3.64H6.243L17.18 20.27z"/></svg>,
              <svg key="li" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 18H6V10h2.5v8zM7.25 8.7a1.45 1.45 0 110-2.9 1.45 1.45 0 010 2.9zM18.5 18H16v-4.3c0-1.05-.02-2.4-1.46-2.4-1.46 0-1.69 1.14-1.69 2.32V18H10.4V10h2.36v1.1h.03c.33-.62 1.13-1.27 2.33-1.27 2.49 0 2.95 1.64 2.95 3.77V18z"/></svg>,
              <svg key="sl" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2a2 2 0 100 4h2V4a2 2 0 00-2-2zm5 5a2 2 0 104 0V5a2 2 0 10-4 0v2zM7 9a2 2 0 100 4h7a2 2 0 100-4H7zm10 7a2 2 0 10-4 0v2a2 2 0 104 0v-2zM10 22a2 2 0 102-2H10v2zM3 11a2 2 0 100 4 2 2 0 000-4z"/></svg>,
              <svg key="em" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>,
              <svg key="lk" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1-1"/></svg>,
            ].map((icon, i) => (
              <button key={i} className="sp-share-btn">{icon}</button>
            ))}
          </div>
          <button className="sp-update-btn">Push update</button>
        </div>
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   CARD 3 — Marketers (animated chart)
════════════════════════════════════════════════ */
function MarketersCard() {
  return (
    <GlowCard>
      <div className="sp-card-body">
        <h3>
          <span className="sp-badge sp-badge-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>
            </svg>
          </span>
          Marketers
        </h3>
        <p className="sp-lead">Spin up high-performing campaign pages in hours, with SEO and hosting built in.</p>
      </div>
      <div className="sp-visual">
        <div className="sp-chart-head">
          <div>
            <div className="sp-chart-title">Unique visitors</div>
            <div className="sp-chart-stat">
              <span className="sp-chart-big">12,438</span>
              <span className="sp-chart-delta">▲ 38.2%</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span className="sp-range-pill">7D</span>
            <span className="sp-range-pill sp-range-active">30D</span>
          </div>
        </div>
        <div className="sp-chart-wrap">
          <svg viewBox="0 0 320 130" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id="spChartGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6457f1"/>
                <stop offset="100%" stopColor="#e95aa8"/>
              </linearGradient>
              <linearGradient id="spChartArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b7cff" stopOpacity=".35"/>
                <stop offset="100%" stopColor="#8b7cff" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <g stroke="rgba(15,17,38,.06)" strokeWidth="1">
              <line x1="0" y1="32" x2="320" y2="32"/>
              <line x1="0" y1="65" x2="320" y2="65"/>
              <line x1="0" y1="98" x2="320" y2="98"/>
            </g>
            <path className="sp-chart-area" d="M0,100 L40,90 L80,82 L120,72 L160,55 L200,46 L240,32 L280,28 L320,22 L320,130 L0,130 Z" fill="url(#spChartArea)"/>
            <path className="sp-chart-path" d="M0,100 L40,90 L80,82 L120,72 L160,55 L200,46 L240,32 L280,28 L320,22" fill="none" stroke="url(#spChartGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {([
              [40, 90, 0.6], [120, 72, 1.0], [200, 46, 1.4], [280, 28, 1.7],
            ] as [number, number, number][]).map(([cx, cy, delay], i) => (
              <circle key={i} cx={cx} cy={cy} r="4" fill="#fff" stroke="#6457f1" strokeWidth="2.5" className="sp-chart-dot" style={{ animationDelay: `${delay}s` }}/>
            ))}
            <circle cx="320" cy="22" r="5" fill="#fff" stroke="#6457f1" strokeWidth="2.5" className="sp-chart-dot sp-chart-dot-live" style={{ animationDelay: "2s" }}/>
          </svg>
          <div className="sp-chart-tip" style={{ left: "100%", top: 22 }}>May 16 · 12.4k</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--sp-muted)", marginTop: 8, fontFamily: "JetBrains Mono, monospace" }}>
          <span>Apr 16</span><span>Apr 30</span><span>May 9</span><span>May 16</span>
        </div>
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   CARD 4 — Agencies (3D card stack)
════════════════════════════════════════════════ */
function AgenciesCard() {
  return (
    <GlowCard>
      <div className="sp-card-body">
        <h3>
          <span className="sp-badge sp-badge-amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/>
            </svg>
          </span>
          Agencies
        </h3>
        <p className="sp-lead">Multiply your impact: deliver more projects, faster, without scaling headcount.</p>
      </div>
      <div className="sp-visual" style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 24 }}>
        <div className="sp-stack">
          <div className="sp-proj sp-p1">
            <h4>Northwind Co.</h4>
            <p>We craft extraordinary digital experiences</p>
            <div className="sp-corner sp-corner-orange"/>
          </div>
          <div className="sp-proj sp-p2">
            <h4>Studio Halcyon</h4>
            <p>Learn like you&apos;re chatting with a smart friend</p>
            <div className="sp-corner sp-corner-amber"/>
          </div>
          <div className="sp-proj sp-p3">
            <h4>Inkwell AI</h4>
            <p>500,000+ prompts shipped this quarter</p>
            <div className="sp-corner sp-corner-green"/>
          </div>
          <div className="sp-stack-tag">
            <span className="sp-stack-dot"/>3 client projects · all healthy
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   CARD 5 — Students (auto-progress checklist)
════════════════════════════════════════════════ */
const PLAN_ITEMS = [
  "Analyze current project structure",
  "Design todo component structure",
  "Create data types and interfaces",
  "Implement todo state management",
  "Wire up filtering & persistence",
];

function StudentsCard() {
  const [activeIdx, setActiveIdx] = useState(3);
  const [doneCount, setDoneCount] = useState(3);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx(prev => {
        const next = prev + 1;
        if (next >= PLAN_ITEMS.length) {
          // reset
          setTimeout(() => { setActiveIdx(3); setDoneCount(3); }, 1800);
          return prev;
        }
        setDoneCount(next);
        return next;
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const getState = (i: number) => {
    if (i < activeIdx) return "done";
    if (i === activeIdx) return "active";
    return "pending";
  };

  return (
    <GlowCard>
      <div className="sp-card-body">
        <h3>
          <span className="sp-badge sp-badge-violet">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M7 11v5c0 1 2 3 5 3s5-2 5-3v-5"/>
            </svg>
          </span>
          Students &amp; builders
        </h3>
        <p className="sp-lead">Learn by doing. Take ideas from class or side projects and turn them into fully working apps.</p>
      </div>
      <div className="sp-visual">
        <div className="sp-plan-panel">
          <div className="sp-plan-title">
            Plan <span className="sp-badge-mini">AUTO-RUN</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--sp-muted)", fontFamily: "JetBrains Mono, monospace" }}>
              {doneCount}/{PLAN_ITEMS.length} complete
            </span>
          </div>
          {PLAN_ITEMS.map((item, i) => {
            const state = getState(i);
            return (
              <div key={item} className={`sp-plan-item sp-plan-${state}`}>
                <div className="sp-check">
                  {state === "done" && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                      <path d="M5 12l5 5L20 7"/>
                    </svg>
                  )}
                </div>
                {item}
                <span className="sp-step">0{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </GlowCard>
  );
}

/* ════════════════════════════════════════════════
   PIPELINE SECTION
════════════════════════════════════════════════ */
function Pipeline() {
  const steps = [
    {
      num: 1, title: "Capture", desc: "Drop a sketch, a doc, a Loom. Atlas reads context like a teammate.",
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6457f1" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
    },
    {
      num: 2, title: "Design", desc: "Live prototypes you can click within seconds — no Figma round-trips.",
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a463f6" strokeWidth="2"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M7 12h6M7 15h4"/></svg>,
    },
    {
      num: 3, title: "Build", desc: "Real code, real components, real types. Editable end-to-end.",
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e95aa8" strokeWidth="2"><path d="M4 17l5-5-5-5"/><path d="M12 19h8"/></svg>,
    },
    {
      num: 4, title: "Ship", desc: "One click to a global edge. Versioned, monitored, reversible.",
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M5 13l4 4L19 7"/><circle cx="12" cy="12" r="9"/></svg>,
    },
  ];

  return (
    <div className="sp-pipeline-section">
      <div className="sp-section-head">
        <h2>From spark to <span className="sp-grad">live product</span></h2>
        <p>Atlas runs the full pipeline in the background while you stay in flow. Watch ideas travel.</p>
      </div>
      <div className="sp-pipeline">
        <div className="sp-signal"/>
        <div className="sp-pipe-track">
          {steps.map(s => (
            <div key={s.num} className="sp-pipe-step">
              <div className="sp-pipe-icon">
                <div className="sp-pipe-ring"/>
                <div className="sp-pipe-num">{s.num}</div>
                {s.icon}
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
      {/* Background */}
      <div className="sp-bg" aria-hidden="true">
        <div className="sp-bg-grid"/>
        <div className="sp-blob sp-b1"/>
        <div className="sp-blob sp-b2"/>
        <div className="sp-blob sp-b3"/>
        <div className="sp-blob sp-b4"/>
        <Constellation />
        <div className="sp-noise"/>
      </div>

      <div className="container-x" style={{ position: "relative", zIndex: 1 }}>
        {/* Hero text */}
        <div className="sp-hero">
          <div className="sp-eyebrow">
            <span className="sp-pulse"/>
            New: ship your first build in under 90 seconds
          </div>
          <h2 className="sp-hero-title">
            OneAtlas gives you <span className="sp-grad">superpowers</span>
          </h2>
          <p className="sp-hero-sub">
            From idea to live product, Atlas adapts to the way you work — turning every vision into something real &amp; fast.
          </p>
        </div>

        {/* Row 1 — 3 cards */}
        <div className="sp-grid-3">
          <PMCard />
          <EntreCard />
          <MarketersCard />
        </div>

        {/* Row 2 — 2 cards */}
        <div className="sp-grid-2">
          <AgenciesCard />
          <StudentsCard />
        </div>

        {/* Pipeline */}
        <Pipeline />
      </div>
    </section>
  );
}