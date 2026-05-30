/**
 * Dock.tsx
 * ---------------------------------------------------------------------------
 * OneAtlas — Documentation landing page.
 * A single self-contained React + TypeScript component covering the entire
 * design: top nav, left sidebar, hero with an animated 3D solar system,
 * audience cards, animated "Get started" step cards (typing + workflow flow),
 * core-capability cards, right sidebar and the bottom AI bar.
 *
 * Styles live in the sibling Dock.css (imported below). Drop both files in
 * together and render <Dock /> anywhere in a React 17/18 app.
 * (The Inter font is pulled from Google Fonts inside the stylesheet.)
 * ---------------------------------------------------------------------------
 */
"use client";
import React, { useEffect, useRef, useState } from "react";
import "./Docs.css";
import { color } from "framer-motion";


/* ======================================================================== */
/*  Typewriter                                                              */
/* ======================================================================== */

interface Token {
  t: string;
  c?: "kw" | "str" | "fn" | "flag";
}

interface TypeCodeProps {
  tokens: Token[];
  speed?: number;
  startDelay?: number;
  hold?: number;
  onDone?: () => void;
  onReset?: () => void;
}

/** Types a token sequence character-by-character, preserving highlight, looping. */
const TypeCode: React.FC<TypeCodeProps> = ({
  tokens,
  speed = 42,
  startDelay = 400,
  hold = 2400,
  onDone,
  onReset,
}) => {
  const [rendered, setRendered] = useState<Token[]>([]);
  const cbRef = useRef({ onDone, onReset });
  cbRef.current = { onDone, onReset };

  useEffect(() => {
    let timer: number;
    let cancelled = false;

    const run = () => {
      let ti = 0;
      let ci = 0;
      const acc: Token[] = [];
      cbRef.current.onReset?.();
      setRendered([]);

      const step = () => {
        if (cancelled) return;
        if (ti >= tokens.length) {
          cbRef.current.onDone?.();
          timer = window.setTimeout(run, hold);
          return;
        }
        const tok = tokens[ti];
        if (ci === 0) acc.push({ t: "", c: tok.c });
        ci += 1;
        acc[acc.length - 1] = { t: tok.t.slice(0, ci), c: tok.c };
        setRendered([...acc]);
        if (ci >= tok.t.length) {
          ti += 1;
          ci = 0;
        }
        timer = window.setTimeout(step, speed);
      };

      timer = window.setTimeout(step, startDelay);
    };

    run();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {rendered.map((tk, i) =>
        tk.c ? (
          <span key={i} className={tk.c}>
            {tk.t}
          </span>
        ) : (
          <span key={i}>{tk.t}</span>
        )
      )}
      <span className="caret" />
    </>
  );
};

/* ======================================================================== */
/*  Reusable inline-SVG icon                                                */
/* ======================================================================== */

type IconProps = {
  size?: number;
  stroke?: string;
  fill?: string;
  sw?: number;
  children: React.ReactNode;
};

const Svg: React.FC<IconProps> = ({ size = 14, stroke = "currentColor", fill = "none", sw = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw}>
    {children}
  </svg>
);

/* ======================================================================== */
/*  Data                                                                    */
/* ======================================================================== */

const AGENT_TOKENS: Token[] = [
  { t: "agent", c: "kw" }, { t: " " }, { t: "Researcher", c: "fn" }, { t: " {\n  " },
  { t: "role", c: "kw" }, { t: ": " }, { t: '"Web Researcher"', c: "str" }, { t: ",\n  " },
  { t: "tools", c: "kw" }, { t: ": [ " }, { t: "search", c: "fn" }, { t: ", " },
  { t: "scrape", c: "fn" }, { t: " ]\n" }, { t: "}" },
];

const DEPLOY_TOKENS: Token[] = [
  { t: " " }, { t: "atlas", c: "fn" }, { t: " " }, { t: "deploy", c: "kw" }, { t: " " },
  { t: "--env", c: "flag" }, { t: " production" },
];

/* ======================================================================== */
/*  Deploy card (owns its success-status state)                             */
/* ======================================================================== */

const DeployCard: React.FC = () => {
  const [show, setShow] = useState(false);
  const timer = useRef<number>();

  return (
    <div className="step-card" style={{ minWidth: 0, overflow: "hidden", width: "100%" }}>
      <div className="step-top">
        <div className="step-num s3">3</div>
        <span className="step-title">Deploy to the world</span>
        <span className="step-copy-btn">
          <Svg>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </Svg>
        </span>
      </div>
      <p className="step-desc">One command to deploy your app to production.</p>
      <div className="step-preview">
        <div className="code-head">
          <span className="dot" style={{ background: "#FF6600" }} />
          <span className="dot" style={{ background: "#E5E7EB" }} />
          <span className="dot" style={{ background: "#E5E7EB" }} />
          <span className="fname">terminal</span>
        </div>
        <div className="code-body term-body" style={{ fontSize: 10.5, padding: "10px 10px" }}>
          <div>
            <span className="prompt">$</span>
            <TypeCode
              tokens={DEPLOY_TOKENS}
              speed={55}
              hold={3000}
              onDone={() => {
                timer.current = window.setTimeout(() => setShow(true), 450);
              }}
              onReset={() => {
                window.clearTimeout(timer.current);
                setShow(false);
              }}
            />
          </div>
          <div className={`deploy-status${show ? " show" : ""}`}>
            <span className="deploy-dot" />
            Deployment successful
          </div>
        </div>
      </div>
    </div>
  );
};

/* ======================================================================== */
/*  Main component                                                          */
/* ======================================================================== */

const Dock: React.FC = () => {
  return (
    <div className="page">
        {/* ===== TOP NAV ===== */}
        <nav className="top-nav">
          <div className="logo">
            <div className="logo-icon" />
            <span>OneAtlas</span>
          </div>
          <div className="search-bar">
            <span className="search-icon">
              <Svg>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </Svg>
            </span>
            <span style={{ whiteSpace: "nowrap" }}>Search docs, APIs, examples...</span>
            <div className="search-keys">
              <span className="key-badge">⌘K</span>
              <span className="ai-badge">✦ AI</span>
            </div>
          </div>
          <div className="nav-links">
            <a href="#">API</a>
            <a href="#">Examples</a>
            <a href="#">Guides</a>
            <a href="#">Changelog</a>
          </div>
          <button className="settings-btn">
            <Svg size={18}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </Svg>
          </button>
          <button className="cta-btn">
            Start Building <span>→</span>
          </button>
        </nav>

        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="left-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Get Started</div>
            <div className="sidebar-item active">
              <span className="item-icon">
                <Svg>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </Svg>
              </span>
              Welcome
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </Svg>
              </span>
              Quickstart
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </Svg>
              </span>
              What is OneAtlas?
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </Svg>
              </span>
              How it works
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Build</div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </Svg>
              </span>
              Agents
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </Svg>
              </span>
              Workflows
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </Svg>
              </span>
              Tools
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </Svg>
              </span>
              Knowledge
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <path d="M7 7h10M7 12h10M7 17h6" />
                </Svg>
              </span>
              Memory
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </Svg>
              </span>
              Evaluations
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Deploy</div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </Svg>
              </span>
              Deployments
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </Svg>
              </span>
              Environments
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </Svg>
              </span>
              Scaling
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </Svg>
              </span>
              Observability
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Integrations</div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </Svg>
              </span>
              Databases
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </Svg>
              </span>
              APIs &amp; Webhooks
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
                </Svg>
              </span>
              Third-party Tools
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Reference</div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </Svg>
              </span>
              API Reference
              <span className="api-tag">API</span>
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 7h4v4H7zM13 7h4M13 11h4M7 15h10" />
                </Svg>
              </span>
              SDKs
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </Svg>
              </span>
              CLI
            </div>
            <div className="sidebar-item">
              <span className="item-icon">
                <Svg>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </Svg>
              </span>
              Error Codes
            </div>
          </div>

          <div className="sidebar-bottom">
            <div className="changelog-link">
              <div className="changelog-icon">
                <Svg>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </Svg>
              </div>
              <div>
                <div className="cl-text">Changelog</div>
                <div className="cl-sub">Latest updates to OneAtlas</div>
              </div>
              <span className="cl-arrow">→</span>
            </div>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="main-content">
          {/* Hero */}
          <section className="hero">
            <div className="hero-text">
              <div className="hero-badge">✦ AI-Native Development Platform</div>
              <h1>
                Build and ship
                <br />
                AI apps, <span className="gradient">faster.</span>
              </h1>
              <p className="hero-desc">
                OneAtlas gives you the tools to build, deploy, and scale production-ready AI applications.
              </p>
              <div className="hero-actions">
                <button className="cta-btn">
                  Start Building <span>→</span>
                </button>
                <a href="#" className="watch-link">
                  <span className="play-circle">▶</span>
                  Watch overview
                </a>
              </div>
            </div>

            <div className="hero-diagram">
              <div className="orbital-container">
                <div className="ss-scene">
                  <div className="ss-glow" />
                  

                  {/* star particles */}
                  <div className="ss-star" style={{ width: 5, height: 5, top: 46, left: 320, opacity: 0.5, animationDelay: "0s" }} />
                  <div className="ss-star" style={{ width: 3, height: 3, top: 90, left: 366, opacity: 0.4, animationDelay: "1.2s" }} />
                  <div className="ss-star" style={{ width: 4, height: 4, top: 64, left: 48, opacity: 0.4, animationDelay: "2.1s" }} />
                  <div className="ss-star" style={{ width: 3, height: 3, top: 280, left: 354, opacity: 0.35, animationDelay: "0.6s" }} />
                  <div className="ss-star" style={{ width: 4, height: 4, top: 308, left: 44, opacity: 0.4, animationDelay: "1.8s" }} />
                  <div className="ss-star" style={{ width: 3, height: 3, top: 200, left: 14, opacity: 0.3, animationDelay: "2.6s" }} />

                  {/* 3D orbital system */}
                  <div className="ss-3d">
                    <div className="ss-stage">
                      <div className="ss-orbit o4" style={{ background: "#F5F5EE" }}>
                        <div className="ss-spin s4" style={{ animationDelay: "-6s", background: "#F5F5EE" }}>
                          <div className="ss-planet p-lg" style={{ background: "#9CA3AF" }} />
                        </div>
                      </div>
                      <div className="ss-orbit o3" style={{ background: "#F5F5EE" }}>
                        <div className="ss-spin s3" style={{ animationDelay: "-14s", background: "#F5F5EE" }}>
                          <div className="ss-planet p-md" style={{ background: "#D97706" }} />
                        </div>
                      </div>
                      <div className="ss-orbit o2" style={{ background: "#F5F5EE" }}>
                        <div className="ss-spin s2" style={{ animationDelay: "-9s", background: "#F5F5EE" }}>
                          <div className="ss-planet p-sm" style={{ background: "#FF6600" }} />
                        </div>
                      </div>
                      <div className="ss-orbit o1" style={{ background: "#F5F5EE" }}>
                        <div className="ss-spin s1" style={{ animationDelay: "-3s", background: "#F5F5EE" }}>
                          <div className="ss-planet p-xs" style={{ background: "#059669" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ss-core" />

                  {/* labels */}
                  <div className="ss-label" style={{ top: 50, left: 140, animationDelay: "0s" }}>
                    <span className="l-dot" style={{ background: "#059669" }}>
                      <Svg size={12} stroke="#fff" sw={2.5}>
                        <polyline points="20 6 9 17 4 12" />
                      </Svg>
                    </span>
                    Deploy
                  </div>
                  <div className="ss-label" style={{ top: 90, right: 30, animationDelay: "1.5s" }}>
                    <span className="l-dot" style={{ background: "#4B5563" }}>
                      <Svg size={12} stroke="#fff" sw={2.5}>
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </Svg>
                    </span>
                    Workflows
                  </div>
                  <div className="ss-label" style={{ top: 190, left: 22, animationDelay: "2.3s" }}>
                    <span className="l-dot" style={{ background: "#FF6600" }}>
                      <Svg size={12} stroke="#fff" sw={2.5}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </Svg>
                    </span>
                    Agents
                  </div>
                  <div className="ss-label" style={{ top: 208, right: 26, animationDelay: "0.8s" }}>
                    <span className="l-dot" style={{ background: "#D97706" }}>
                      <Svg size={12} stroke="#fff" sw={2.5}>
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </Svg>
                    </span>
                    Tools
                  </div>
                  <div className="ss-label" style={{ bottom: 48, left: 150, animationDelay: "1.9s" }}>
                    <span className="l-dot" style={{ background: "#6B7280" }}>
                      <Svg size={12} stroke="#fff" sw={2.5}>
                        <rect x="2" y="2" width="20" height="20" rx="2" />
                        <path d="M7 7h4v4H7z" />
                      </Svg>
                    </span>
                    Memory
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Audience cards */}
          <div className="audience-row">
            <div className="audience-card">
              <div className="audience-icon" style={{ background: "#FFF4EB", color: "#FF6600" }}>
                <Svg size={16}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </Svg>
              </div>
              <div>
                <h4>For Founders</h4>
                <p>Ship products faster</p>
              </div>
            </div>
            <div className="audience-card">
              <div className="audience-icon" style={{ background: "#F5F5EE", color: "#4B5563" }}>
                <Svg size={16}>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </Svg>
              </div>
              <div>
                <h4>For Engineers</h4>
                <p>Build with power &amp; control</p>
              </div>
            </div>
            <div className="audience-card">
              <div className="audience-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
                <Svg size={16}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </Svg>
              </div>
              <div>
                <h4>For AI Teams</h4>
                <p>Operate at scale</p>
              </div>
            </div>
            <div className="audience-card">
              <div className="audience-icon" style={{ background: "#D1FAE5", color: "#059669" }}>
                <Svg size={16}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </Svg>
              </div>
              <div>
                <h4>For Enterprises</h4>
                <p>Secure &amp; govern</p>
              </div>
            </div>
          </div>

          {/* Get started */}
          <section className="section-header">
            <h2>Get started in minutes</h2>
            <p>Go from idea to running application.</p>
          </section>

          <div className="steps-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {/* Step 1 */}
            <div className="step-card" style={{ minWidth: 0, overflow: "hidden", width: "100%" }}>
              <div className="step-top">
                <div className="step-num s1">1</div>
                <span className="step-title">Create your first agent</span>
                <span className="step-copy-btn">
                  <Svg>
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </Svg>
                </span>
              </div>
              <p className="step-desc">Define an agent, give it tools and watch it work.</p>
              <div className="step-preview">
                <div className="code-head">
                  <span className="dot" style={{ background: "#FF6600" }} />
                  <span className="dot" style={{ background: "#E5E7EB" }} />
                  <span className="dot" style={{ background: "#E5E7EB" }} />
                  <span className="fname">agent.atlas</span>
                </div>
                <div className="code-body"style={{ fontSize: 11 }}>
                  <TypeCode tokens={AGENT_TOKENS} speed={40} hold={2600} />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-card" style={{ minWidth: 0, overflow: "hidden", width: "100%" }}>
              <div className="step-top">
                <div className="step-num s2">2</div>
                <span className="step-title">Build a workflow</span>
                <span className="step-copy-btn">
                  <Svg>
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </Svg>
                </span>
              </div>
              <p className="step-desc">Connect agents, data and logic in a powerful workflow.</p>
              <div className="step-preview">
                <div className="code-head">
                  <span className="dot" style={{ background: "#FF6600" }} />
                  <span className="dot" style={{ background: "#E5E7EB" }} />
                  <span className="dot" style={{ background: "#E5E7EB" }} />
                  <span className="fname">workflow.atlas</span>
                </div>
                <div className="code-body wf-body">
                 <div className="workflow-icons" style={{ gap: 6, padding: "0 8px" }}>
                    <div className="wf-icon" style={{ background: "#FFF4EB", color: "#FF6600", animationDelay: "0s", width: 32, height: 32 }}>
                      <Svg size={16} fill="currentColor" stroke="none">
                        <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z" />
                      </Svg>
                    </div>
                    <div className="wf-conn" style={{ width: 24 }} />
                    <div className="wf-icon" style={{ background: "#F5F5EE", color: "#4B5563", animationDelay: "0.5s", width: 32, height: 32 }}>
                      <Svg size={16}>
                        <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
                      </Svg>
                    </div>
                    <div className="wf-conn c2" style={{ width: 24 }} />
                    <div className="wf-icon" style={{ background: "#D1FAE5", color: "#059669", animationDelay: "1s", width: 32, height: 32 }}>
                      <Svg size={16} sw={2.5}>
                        <polyline points="20 6 9 17 4 12" />
                      </Svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <DeployCard />
          </div>

          {/* Capabilities */}
          <section className="section-header">
            <h2>Explore core capabilities</h2>
          </section>

          <div className="capabilities-row">
            <div className="cap-card">
              <div className="cap-icon" style={{ background: "#FFF4EB", color: "#FF6600" }}>
                <Svg size={16}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </Svg>
              </div>
              <h4>Agents</h4>
              <p>Autonomous AI that gets work done</p>
            </div>
            <div className="cap-card">
              <div className="cap-icon" style={{ background: "#F5F5EE", color: "#4B5563" }}>
                <Svg size={16}>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </Svg>
              </div>
              <h4>Workflows</h4>
              <p>Orchestrate complex processes</p>
            </div>
            <div className="cap-card">
              <div className="cap-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
                <Svg size={16}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </Svg>
              </div>
              <h4>Knowledge</h4>
              <p>Connect and query your data</p>
            </div>
            <div className="cap-card">
              <div className="cap-icon" style={{ background: "#F5F5EE", color: "#6B7280" }}>
                <Svg size={16}>
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </Svg>
              </div>
              <h4>Deployments</h4>
              <p>Ship reliably at any scale</p>
            </div>
            <div className="cap-card">
              <div className="cap-icon" style={{ background: "#F5F5EE", color: "#4B5563" }}>
                <Svg size={16}>
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
                </Svg>
              </div>
              <h4>Integrations</h4>
              <p>Plug into your favorite tools</p>
            </div>
          </div>
        </main>

        {/* ===== RIGHT SIDEBAR ===== */}
        <aside className="right-sidebar">
          <div className="rs-section">
            <h3>
              <Svg stroke="#FF6600">
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z" />
              </Svg>
              AI Assistant
            </h3>
            <p>Get answers, generate code, and understand concepts instantly.</p>
            <button className="ask-btn">
              Ask Atlas <span>→</span>
            </button>
          </div>

          <div className="rs-divider" />

          <div className="rs-section">
            <h3>On this page</h3>
            <div className="rs-links">
              <a href="#">Get started in minutes</a>
              <a href="#">Explore core capabilities</a>
              <a href="#">Why OneAtlas?</a>
              <a href="#">What&apos;s next?</a>
            </div>
          </div>

          <div className="rs-divider" />

          <div className="rs-section">
            <h3>Quick actions</h3>
            <div className="rs-action">
              <span className="act-icon">
                <Svg size={13}>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </Svg>
              </span>
              Run API example
            </div>
            <div className="rs-action">
              <span className="act-icon">
                <Svg size={13}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </Svg>
              </span>
              Copy page link
            </div>
            <div className="rs-action">
              <span className="act-icon">
                <Svg size={13}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </Svg>
              </span>
              Download SDK
            </div>
            <div className="rs-action">
              <span className="act-icon">
                <Svg size={13}>
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </Svg>
              </span>
              Report an issue
            </div>
          </div>

          <div className="rs-divider" />

          <div className="rs-section">
            <h3>Popular guides</h3>
            <div className="rs-guide">
              <span>Building your first agent</span>
              <span className="arrow">→</span>
            </div>
            <div className="rs-guide">
              <span>Working with tools</span>
              <span className="arrow">→</span>
            </div>
            <div className="rs-guide">
              <span>Deploying to production</span>
              <span className="arrow">→</span>
            </div>
            <div className="rs-guide">
              <span>Memory and context</span>
              <span className="arrow">→</span>
            </div>
          </div>

          <div className="rs-divider" />

          <div className="atlas-cloud">
            <h4>Atlas Cloud</h4>
            <p>Deploy globally with one click.</p>
            <a href="#" className="learn-link">
              Learn more →
            </a>
            <div className="cloud-decor" />
          </div>
        </aside>

        {/* ===== BOTTOM BAR ===== */}
        <footer className="bottom-bar">
          <div className="ai-input-icon">
            <Svg size={12} fill="currentColor" stroke="none">
              <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z" />
            </Svg>
          </div>
          <input className="ai-input" type="text" placeholder="Ask Atlas anything about this page..." readOnly />
          <div className="ai-suggestions">
            <div className="ai-sug">
              <Svg size={12}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </Svg>
              Explain
            </div>
            <div className="ai-sug">
              <Svg size={12}>
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </Svg>
              Generate code
            </div>
            <div className="ai-sug">
              <Svg size={12}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </Svg>
              Find example
            </div>
          </div>
          <div className="ai-send">
            <Svg size={12} fill="currentColor" stroke="none">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </Svg>
          </div>
      </footer>
    </div>
  );
};

export default Dock;
