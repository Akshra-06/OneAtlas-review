"use client";

import React, { useEffect, useRef } from "react";
import styles from "./SecurityPage.module.css";
import { Nav } from "@/components/landing/nav/nav";
import { Footer } from "@/components/landing/footer/footer";

// ─── ICON COMPONENTS ───
const ChevronDown = () => (
  <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ArrowRight = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);



// ─── HERO ───
function HeroBadge() {
  return (
    <div className={styles.heroBadge}>
      <span className={styles.badgeDot} />
      <span>Secure infrastructure for modern AI applications</span>
    </div>
  );
}

const NODE_CARDS = [
  {
    title: "Isolated runtimes",
    sub: "Each execution runs in its own isolated environment",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Smart routing",
    sub: "Requests routed to the best available provider",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="19" r="2.5" /><path d="M8.5 19h7a3.5 3.5 0 100-7h-7a3.5 3.5 0 110-7H15" /><circle cx="18" cy="5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Data protection",
    sub: "Encryption in transit and at rest by default",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "High availability",
    sub: "Globally distributed for reliability",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: "Access controls",
    sub: "Granular permissions and workspace isolation",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M5 21v-1a5 5 0 015-5h2" /><rect x="14.5" y="16" width="6.5" height="5.5" rx="1.2" /><path d="M16 16v-1.4a1.7 1.7 0 013.4 0V16" />
      </svg>
    ),
  },
  {
    title: "Operational visibility",
    sub: "Real-time monitoring and request visibility",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

function OrbitalDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function build() {
      const svgEl = svgRef.current;
      const wrapEl = wrapRef.current;
      if (!svgEl || !wrapEl) return;

      const rect = wrapEl.getBoundingClientRect();
      const SIZE = rect.width;
      if (SIZE === 0) return;

      const CX = SIZE / 2;
      const CY = SIZE / 2;
      svgEl.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
      svgEl.innerHTML = "";

      const ns = "http://www.w3.org/2000/svg";
      const mk = (tag: string) => document.createElementNS(ns, tag);
      const set = (el: SVGElement, attrs: Record<string, string | number>) => {
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
        return el;
      };

      const scale = SIZE / 540;

      // Rings
      [68, 118, 175, 232].forEach((r) => {
        svgEl.appendChild(
          set(mk("circle"), { cx: CX, cy: CY, r: r * scale, fill: "none", stroke: "#E5E7EB", "stroke-width": "1" })
        );
      });

      // Dots on rings
      const dots = [
        { angle: -90, r: 68, c: "#FF6600", s: 4 },
        { angle: 30, r: 118, c: "#D1D5DB", s: 3 },
        { angle: 150, r: 175, c: "#D1D5DB", s: 3 },
        { angle: -60, r: 175, c: "#FF6600", s: 4 },
        { angle: 80, r: 232, c: "#D1D5DB", s: 3 },
        { angle: 200, r: 232, c: "#E5E7EB", s: 3 },
        { angle: -140, r: 118, c: "#E5E7EB", s: 3 },
      ];
      dots.forEach((d) => {
        const rad = (d.angle * Math.PI) / 180;
        svgEl.appendChild(
          set(mk("circle"), {
            cx: CX + d.r * scale * Math.cos(rad),
            cy: CY + d.r * scale * Math.sin(rad),
            r: d.s,
            fill: d.c,
          })
        );
      });

      // Node card positions
      const CARD_W = 210;
      const CARD_H = 66;
      const cardR = 218 * scale;
      const angles = [-120, -60, -178, -2, 120, 60];

      angles.forEach((deg, i) => {
        const card = document.getElementById(`nc${i}`);
        if (!card) return;
        const rad = (deg * Math.PI) / 180;
        const cardCX = CX + cardR * Math.cos(rad);
        const cardCY = CY + cardR * Math.sin(rad);

        card.style.left = `${cardCX - CARD_W / 2}px`;
        card.style.top = `${cardCY - CARD_H / 2}px`;
        card.style.width = `${CARD_W}px`;

        const sx = CX + 45 * scale * Math.cos(rad);
        const sy = CY + 45 * scale * Math.sin(rad);
        const ex = cardCX - Math.cos(rad) * (CARD_W * 0.46);
        const ey = cardCY - Math.sin(rad) * (CARD_H * 0.55);

        const line = set(mk("line"), {
          x1: sx, y1: sy, x2: ex, y2: ey,
          stroke: "#E5E7EB", "stroke-width": "1.5",
          "stroke-dasharray": "5 3", "stroke-linecap": "round",
        });
        svgEl.appendChild(line);

        const pathId = `mp${i}`;
        const mpath = set(mk("path"), {
          id: pathId,
          d: `M ${sx} ${sy} L ${ex} ${ey}`,
          fill: "none", stroke: "none",
        });
        svgEl.appendChild(mpath);

        const travDot = mk("circle");
        set(travDot, { r: "3", fill: "#FF6600", opacity: "0.85" });
        const anim = mk("animateMotion");
        set(anim, {
          dur: `${2.8 + i * 0.35}s`,
          repeatCount: "indefinite",
          begin: `${i * 0.45}s`,
        });
        const mpref = mk("mpath");
        mpref.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${pathId}`);
        anim.appendChild(mpref);
        travDot.appendChild(anim);
        svgEl.appendChild(travDot);
      });
    }

    document.fonts.ready.then(build);
    window.addEventListener("resize", build);
    return () => window.removeEventListener("resize", build);
  }, []);

  return (
    <div className={styles.orbitalWrap} id="orbital" ref={wrapRef}>
      <svg className={styles.orbitalSvg} ref={svgRef} />
      <div className={styles.orbitalCenter}>
        <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
          <path d="M20 7 L33 33 H7 Z" stroke="#fff" strokeWidth="2.8" strokeLinejoin="round" fill="none" />
          <line x1="11.5" y1="26.5" x2="28.5" y2="26.5" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      </div>
      {NODE_CARDS.map((card, i) => (
        <div key={i} className={styles.nodeCard} id={`nc${i}`}>
          <div className={styles.nodeInner}>
            <div className={styles.nodeIconWrap}>{card.icon}</div>
            <div>
              <div className={styles.nodeTitle}>{card.title}</div>
              <div className={styles.nodeSub}>{card.sub}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Logos() {
  const logos = [
    { name: "OpenAI", file: "/logos/openai.png" },
    { name: "Anthropic", file: "/logos/anthropic.png" },
    { name: "Meta", file: "/logos/meta.png" },
    { name: "Google Cloud", file: "/logos/google-cloud.png" },
    { name: "Cloudflare", file: "/logos/cloudflare.png" },
    { name: "Vercel", file: "/logos/vercel.png" },
  ];
  return (
    <div className={styles.logosWrap}>
      <p className={styles.logosLabel}>Built on trusted AI and cloud infrastructure</p>
      <div className={styles.logosRow}>
        {logos.map((logo) => (
          <div key={logo.name} className={styles.logoItem}>
            <img src={logo.file} alt={logo.name} className={styles.logoImg} />
            <span className={styles.logoName}>{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div>
          <HeroBadge />
          <h1 className={styles.heroH1}>
            Security that helps<br />
            AI teams ship<br />
            <em>confidently</em>
          </h1>
          <p className={styles.heroP}>
            Built with modern security practices to help protect your applications, users, and data.
            We handle infrastructure, isolation, and operational safeguards—so you can focus on building.
          </p>
          <div className={styles.heroActions}>
            <a href="#" className={styles.btnPrimary}>
              Start building free <ArrowRight />
            </a>
            <a href="#features" className={styles.btnSecondary}>Learn more</a>
          </div>
        </div>
        <div className={styles.orbitalHide} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <OrbitalDiagram />
        </div>
      </div>
      <Logos />
    </section>
  );
}

// ─── BUILT FOR AI ───
interface BuiltForCard {
  title: string;
  desc: string;
  color: string;
  gradientColors: string;
  icon: React.ReactNode;
}

const BUILT_FOR_CARDS: BuiltForCard[] = [
  {
    title: "Your data",
    desc: "Customer data is isolated and not used for model training.",
    color: "#6366f1",
    gradientColors: "#7c3aed,#6366f1,#818cf8",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Your users",
    desc: "Secure authentication and role-based access controls.",
    color: "#ec4899",
    gradientColors: "#ec4899,#f472b6,#f9a8d4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    title: "Your apps",
    desc: "Workloads run in isolated environments with scoped access.",
    color: "#f97316",
    gradientColors: "#f97316,#fb923c,#fdba74",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "Your team",
    desc: "Granular permissions and visibility across workspaces.",
    color: "#14b8a6",
    gradientColors: "#14b8a6,#2dd4bf,#5eead4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

function BuiltForAI() {
  return (
    <section className={styles.section}>
      <div className={`${styles.cardWrap} ${styles.reveal}`} style={{ padding: "48px 44px 52px", position: "relative", overflow: "hidden" }}>
        <div className={styles.builtForGrid} style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 32, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <h2 className={styles.sectionTitleLarge}>
              Built for AI<br />applications
            </h2>
            <div className={styles.shimmerBar}>
              <div className={styles.shimmerBarInner} />
            </div>
          </div>
          <div className={styles.builtForCards} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {BUILT_FOR_CARDS.map((card, i) => (
              <div key={i} className={styles.bfModern}>
                <div
                  className={styles.bfGradientTop}
                  style={{ background: `linear-gradient(90deg, ${card.gradientColors})` }}
                />
                <div className={styles.bfIconWrap}>
                  <div className={styles.bfIconOuter} style={{ background: `${card.color}0F` }} />
                  <div className={styles.bfIconInner}>{card.icon}</div>
                  <div
                    className={styles.bfPulseRing}
                    style={{
                      borderColor: `${card.color}14`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                </div>
                <h3 className={styles.bfTitle}>{card.title}</h3>
                <p className={styles.bfDesc}>{card.desc}</p>
                <div className={styles.bfArrow}>
                  <span style={{ color: card.color }}>Learn more</span>
                  <ArrowRight size={12} color={card.color} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PIPELINE ───
interface PipelineStep {
  label: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
  active?: boolean;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    label: "Client", sub: "Request origin", color: "#FF6600", active: true,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M15.5 9a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" /><path d="M5.2 19.4A8 8 0 0119 19" /></svg>,
  },
  {
    label: "Edge", sub: "TLS termination", color: "#3b82f6",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>,
  },
  {
    label: "Routing", sub: "Smart dispatch", color: "#8b5cf6",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="2.5" /><path d="M8.5 19h7a3.5 3.5 0 100-7h-7a3.5 3.5 0 110-7H15" /><circle cx="18" cy="5" r="2.5" /></svg>,
  },
  {
    label: "Runtime", sub: "Isolated execution", color: "#f97316",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  },
  {
    label: "Datastore", sub: "Encrypted at rest", color: "#22c55e",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
  },
  {
    label: "Observability", sub: "Real-time logs", color: "#14b8a6",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>,
  },
];

interface SecurityBadge {
  label: string;
  color: string;
  icon: React.ReactNode;
}

const SECURITY_BADGES: SecurityBadge[] = [
  {
    label: "TLS 1.2+ everywhere", color: "#22c55e",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  },
  {
    label: "Encrypted channels", color: "#6366f1",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  },
  {
    label: "Least-privilege access", color: "#ec4899",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="4.5" /><path d="M21 2l-9.6 9.6" /></svg>,
  },
  {
    label: "Audit logs", color: "#f59e0b",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  },
  {
    label: "Region-aware routing", color: "#14b8a6",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 010 20" /></svg>,
  },
];

function Pipeline() {
  return (
    <section className={styles.section}>
      <div className={`${styles.cardWrap} ${styles.reveal}`} style={{ padding: "48px 44px 52px", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div className={styles.pipelineGlow} />

        {/* Header */}
        <div className={styles.pipelineHeader}>
          <p className={styles.eyebrow}>Request flow</p>
          <h2 className={styles.sectionTitleLarge}>How requests are processed securely</h2>
          <p className={styles.pipelineSub}>
            Every request passes through layered security controls before reaching its destination.
          </p>
        </div>

        {/* Pipeline track */}
        <div className={styles.pipelineTrack}>
          <div className={styles.trackLine}>
            <div className={styles.trackLineBase} />
            <div className={styles.travelDot} />
          </div>
          <div className={styles.stepsRow}>
            {PIPELINE_STEPS.map((step, i) => (
              <div key={i} className={styles.pipeNode}>
                <div className={styles.pipeNodeIcon}>
                  {step.active && <div className={styles.activeIndicator} />}
                  {step.icon}
                </div>
                <div style={{ textAlign: "center" }}>
                  <span className={styles.pipeNodeLabel}>{step.label}</span>
                  <span className={styles.pipeNodeSub}>{step.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className={styles.badgesRow}>
          {SECURITY_BADGES.map((badge, i) => (
            <div key={i} className={styles.glassBadge}>
              <div className={styles.glassBadgeIcon} style={{ background: `${badge.color}14` }}>
                {badge.icon}
              </div>
              <span className={styles.glassBadgeLabel}>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECURITY FEATURES ───
interface FeatureItem {
  title: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
}

const FEATURE_ITEMS: FeatureItem[] = [
  {
    title: "Access & identity", desc: "SSO, RBAC, and secure session management.", color: "#FF6600",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6600" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
  {
    title: "Runtime isolation", desc: "Sandboxed environments with network controls.", color: "#22c55e",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>,
  },
  {
    title: "Secrets management", desc: "Encrypted and scoped to authorized environments.", color: "#3b82f6",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="4.5" /><path d="M21 2l-9.6 9.6M15.5 7.5l3 3" /></svg>,
  },
  {
    title: "Data access control", desc: "Row-level security and granular permissions.", color: "#8b5cf6",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
  },
  {
    title: "Audit & logs", desc: "Full request visibility and operational logs.", color: "#f59e0b",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  },
  {
    title: "Best practices", desc: "Encryption, zero-trust, and defense in depth.", color: "#14b8a6",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>,
  },
];

function SecurityFeatures() {
  return (
    <section className={styles.section} id="features">
      <div className={`${styles.cardWrap} ${styles.reveal}`}>
        <div className={styles.featuresLayout} style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 48, alignItems: "start", padding: "4px 0" }}>
          <div style={{ position: "relative" }}>
            <p className={styles.eyebrow}>Security</p>
            <h2 className={styles.sectionTitleLarge}>
              Security<br />features
            </h2>
            <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginTop: 16 }}>
              Six layers of protection across your entire stack.
            </p>
            <a href="#" className={styles.viewAllLink}>
              View all <ArrowRight size={13} />
            </a>
            <div className={styles.shieldWatermark}>
              <svg width="120" height="120" viewBox="0 0 24 24" fill="#111">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURE_ITEMS.map((feat, i) => {
              const isRightCol = i % 2 === 1;
              const isLastRow = i >= FEATURE_ITEMS.length - 2;
              return (
                <div
                  key={i}
                  className={styles.secFeatItem}
                  style={{
                    borderBottom: isLastRow ? "none" : "1px solid #E5E7EB",
                    borderRight: isRightCol ? "none" : "1px solid #E5E7EB",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 8 }}>
                    <div className={styles.featIconWrap} style={{ background: `${feat.color}14` }}>
                      {feat.icon}
                    </div>
                    <span className={styles.featTitle}>{feat.title}</span>
                  </div>
                  <p className={styles.featDesc}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───
function CTA() {
  return (
    <section className={styles.ctaSection}>
      <div className={`${styles.ctaWrap} ${styles.reveal}`}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaH2}>
            Build AI products on infrastructure designed for reliability and security.
          </h2>
          <p className={styles.ctaP}>
            Focus on product development while OneAtlas handles execution, routing, isolation, and operational safeguards.
          </p>
        </div>
        <a href="#" className={styles.btnWhite}>
          Start building free <ArrowRight />
        </a>
      </div>
    </section>
  );
}

// ─── SCROLL REVEAL HOOK ───
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.visible);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(`.${styles.reveal}`).forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${i * 0.06}s`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
}

// ─── PAGE EXPORT ───
export default function SecurityPage() {
  useScrollReveal();

  return (
    <div className={styles.page}>
      <Nav />
      <Hero />
      <BuiltForAI />
      <Pipeline />
      <SecurityFeatures />
      <CTA />
      <Footer />
    </div>
  );
}