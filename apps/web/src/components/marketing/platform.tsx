"use client";
import { useEffect, useRef, useState } from "react";

export function Platform() {
  // platform glow follow
  const platformRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // stack 3D
  const sceneRef = useRef<HTMLDivElement>(null);
  const stack3dRef = useRef<HTMLDivElement>(null);
  const [layerOrder, setLayerOrder] = useState(0);
  const translateZs = [160, 110, 60, 10, -40];

  // terminal
  const tileHostingRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalIntervalRef = useRef<number | null>(null);

  // deploy step detail
  const [stepDetail, setStepDetail] = useState("");
  const [stepDetailVisible, setStepDetailVisible] = useState(false);

  // role dropdown
  const [selectedRole, setSelectedRole] = useState("admin");
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRowRef = useRef<HTMLDivElement>(null);

  // task row
  const [taskRowOpen, setTaskRowOpen] = useState(false);

  // orbit tooltip
  const [tooltipName, setTooltipName] = useState("Stripe");
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // speed counter
  const speedNumRef = useRef<HTMLDivElement>(null);
  const [speedCount, setSpeedCount] = useState(0);

  // Platform glow follow
  useEffect(() => {
    const sec = platformRef.current;
    const glow = glowRef.current;
    if (!sec || !glow) return;
    const onMove = (e: MouseEvent) => {
      const rect = sec.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      glow.style.background = `radial-gradient(600px at ${x}% ${y}%, rgba(99, 91, 255, 0.15), transparent 80%)`;
    };
    sec.addEventListener("mousemove", onMove);
    return () => sec.removeEventListener("mousemove", onMove);
  }, []);

  // Stack 3D rotation + click cycling
  useEffect(() => {
    const scene = sceneRef.current;
    const stack = stack3dRef.current;
    if (!scene || !stack) return;
    const onMove = (e: MouseEvent) => {
      const rect = scene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      stack.style.transform = `rotateX(${56 + y * 12}deg) rotateZ(${-32 + x * 12}deg)`;
    };
    const onLeave = () => {
      stack.style.transform = "";
    };
    scene.addEventListener("mousemove", onMove);
    scene.addEventListener("mouseleave", onLeave);
    return () => {
      scene.removeEventListener("mousemove", onMove);
      scene.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const handleStackClick = () => {
    setLayerOrder((p) => (p + 1) % 5);
  };

  // Apply layer transforms
  useEffect(() => {
    const stack = stack3dRef.current;
    if (!stack) return;
    const layers = stack.querySelectorAll<HTMLDivElement>(".layer");
    const reordered = translateZs
      .slice(layerOrder)
      .concat(translateZs.slice(0, layerOrder));
    layers.forEach((l, i) => {
      l.style.transform = `translateZ(${reordered[i]}px)`;
    });
  }, [layerOrder]);

  // Terminal logs on hover
  useEffect(() => {
    const tile = tileHostingRef.current;
    const terminal = terminalRef.current;
    if (!tile || !terminal) return;
    const logMessages = [
      "> building packages...",
      "> compiling assets...",
      "> deploying to edge...",
      "> warming caches...",
    ];
    let idx = 0;
    const onEnter = () => {
      if (terminalIntervalRef.current) return;
      terminalIntervalRef.current = window.setInterval(() => {
        const line = document.createElement("div");
        line.className = "terminal-line";
        line.textContent = logMessages[idx % logMessages.length];
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
        if (terminal.children.length > 10 && terminal.firstChild)
          terminal.firstChild.remove();
        idx++;
      }, 500);
    };
    const onLeave = () => {
      if (terminalIntervalRef.current) {
        clearInterval(terminalIntervalRef.current);
        terminalIntervalRef.current = null;
      }
    };
    tile.addEventListener("mouseenter", onEnter);
    tile.addEventListener("mouseleave", onLeave);
    return () => {
      tile.removeEventListener("mouseenter", onEnter);
      tile.removeEventListener("mouseleave", onLeave);
      if (terminalIntervalRef.current) clearInterval(terminalIntervalRef.current);
    };
  }, []);

  // Role dropdown click-outside
  useEffect(() => {
    const onDocClick = () => setRoleOpen(false);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Speed count-up on intersect
  useEffect(() => {
    const el = speedNumRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = 87;
          const duration = 1500;
          const startTime = performance.now();
          const update = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setSpeedCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
          obs.unobserve(entry.target);
        }
      });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleStepHover = (detail: string) => {
    setStepDetail(detail);
    setStepDetailVisible(true);
  };
  const handleStepLeave = () => setStepDetailVisible(false);

  const handleChipHover = (name: string) => {
    setTooltipName(name);
    setTooltipVisible(true);
  };
  const handleChipLeave = () => setTooltipVisible(false);

  return (
    <section className="platform-v2" ref={platformRef}>
      <div className="platform-glow" ref={glowRef} />
      <div className="pf-wrap">
        <header className="pf-head">
          <div>
            <span className="pf-eyebrow">
              <span className="num">02</span>Platform
            </span>
            <h2 className="pf-title" style={{ fontSize:"clamp(36px,5vw,70px)" }}>
              Everything you need,
              <br />
              <span className="grad">built-in.</span>
            </h2>
          </div>
          <div className="pf-meta">
            <p className="pf-sub" style={{ fontSize:16, maxWidth:420, color:"#425466", lineHeight:1.6 }}>
              A complete platform delivered as one product — database, auth, hosting, and AI tools all preconfigured and working together from day one.
            </p>
          </div>
        </header>

        <div className="pf-bento">
          {/* Hero tile with 3D stack */}
          <article className="pf-tile t-hero">
            <span className="pf-tile-tag">
              <span className="dot" />Core stack
            </span>
            <div className="hero-left">
              <div className="hero-pills">
                <span className="hero-pill">auto-schema</span>
                <span className="hero-pill">REST + GraphQL</span>
                <span className="hero-pill">RLS</span>
                <span className="hero-pill">realtime</span>
              </div>
              <div className="hero-body">
                <div className="pf-tile-title">AI-Native Backend.</div>
                <p className="pf-tile-desc">
                  Generate APIs, logic, automations, and storage instantly — no servers or boilerplate required.
                </p>
              </div>
              <a className="hero-cta" href="#">
                Open the stack
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
            <div className="hero-stack-col">
              <div className="stack-glow" />
              <div className="stack-scene" aria-hidden="true" ref={sceneRef} onClick={handleStackClick}>
                <div className="stack-float">
                  <div className="stack-3d" ref={stack3dRef}>
                    <div className="layer l1">
                      <div className="badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        </svg>
                      </div>
                      <div>
                        <div className="lname">Database</div>
                        <div className="lmeta">contacts · orders · users</div>
                      </div>
                    </div>
                    <div className="layer l2">
                      <div className="badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <div>
                        <div className="lname">Auth &amp; RLS</div>
                        <div className="lmeta">roles · sessions · SSO</div>
                      </div>
                    </div>
                    <div className="layer l3">
                      <div className="badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                      </div>
                      <div>
                        <div className="lname">REST + Realtime API</div>
                        <div className="lmeta">/api/* · websockets</div>
                      </div>
                    </div>
                    <div className="layer l4">
                      <div className="badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <div>
                        <div className="lname">Scheduled jobs</div>
                        <div className="lmeta">cron · queues · retries</div>
                      </div>
                    </div>
                    <div className="layer l5">
                      <div className="badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <div>
                        <div className="lname">Edge hosting</div>
                        <div className="lmeta">global · sub-100ms</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Hosting */}
          <article className="pf-tile t-hosting" ref={tileHostingRef}>
            <span className="pf-tile-tag">
              <span className="dot" />1-click hosting
            </span>
            <div className="pf-tile-visual">
              <div className="deploy-vis">
                <div className="deploy-url">
                  <span className="pad" />
                  <span className="addr">acme-tools.oneatlas.app</span>
                  <span className="pill-live">LIVE</span>
                </div>
                <div className="deploy-progress" />
                <div className="deploy-steps">
                  <span
                    className="ok"
                    onMouseEnter={() => handleStepHover("Compiled successfully (2.1s)")}
                    onMouseLeave={handleStepLeave}
                  >
                    ✓ build
                  </span>
                  <span
                    className="ok"
                    onMouseEnter={() => handleStepHover("Deployed to us-east-1 (4.5s)")}
                    onMouseLeave={handleStepLeave}
                  >
                    ✓ deploy
                  </span>
                  <span
                    onMouseEnter={() => handleStepHover("Propagating to edge...")}
                    onMouseLeave={handleStepLeave}
                  >
                    ⟳ warm edge
                  </span>
                </div>
                <div
                  className="step-detail"
                  style={{ opacity: stepDetailVisible ? 1 : 0 }}
                >
                  {stepDetail}
                </div>
                <div className="terminal-window" ref={terminalRef}>
                  <div className="terminal-line">&gt; build started</div>
                </div>
              </div>
            </div>
            <div className="pf-tile-body">
              <div className="pf-tile-title">One-Click Launch.</div>
              <p className="pf-tile-desc">
                Ship AI products globally in seconds — hosting, scaling, and infrastructure already handled.
              </p>
            </div>
          </article>

          {/* Auth */}
          <article className="pf-tile t-auth">
            <span className="pf-tile-tag">
              <span className="dot" />User management
            </span>
            <div className="pf-tile-visual">
              <div className="auth-vis">
                <div className="auth-avatars">
                  <div className="auth-av a1">A</div>
                  <div className="auth-av a2">M</div>
                  <div className="auth-av a3">L</div>
                  <div className="auth-av a4">R</div>
                  <div className="auth-av a5">+12</div>
                </div>
                <div
                  className="auth-role-row"
                  ref={roleRowRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRoleOpen((o) => !o);
                  }}
                >
                  <span className="k">role:</span>
                  <span>{selectedRole}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  <div className={`role-dropdown ${roleOpen ? "open" : ""}`}>
                    {["admin", "editor", "viewer"].map((r) => (
                      <span
                        key={r}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRole(r);
                          setRoleOpen(false);
                        }}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="pf-tile-body">
              <div className="pf-tile-title">Authentication &amp; Access Control.</div>
              <p className="pf-tile-desc">
                Built-in auth, permissions, and user roles ready from day one.
              </p>
            </div>
          </article>

          {/* Tasks */}
          <article className="pf-tile t-tasks">
            <span className="pf-tile-tag">
              <span className="dot" />Automated tasks
            </span>
            <div className="pf-tile-visual">
              <div className="cron-vis">
                <div className="cron-row">
                  <span className="ind run" />
                  <span className="nm">Send digest</span>
                  <span className="sch">every 1h</span>
                </div>
                <div className="cron-row">
                  <span className="ind done" />
                  <span className="nm">Sync inventory</span>
                  <span className="sch">0 */6 * * *</span>
                </div>
                <div className="cron-row">
                  <span className="ind idle" />
                  <span className="nm">Refresh KPIs</span>
                  <span className="sch">@daily</span>
                </div>
                <div className={`add-task-row ${taskRowOpen ? "open" : ""}`}>
                  <input type="text" placeholder="Job name" />
                  <input type="text" placeholder="cron expression" />
                  <button className="pf-btn-submit">Add</button>
                </div>
              </div>
            </div>
            <div className="pf-tile-body">
              <div className="pf-tile-title">Agents &amp; Automated Workflows.</div>
              <p className="pf-tile-desc">
                Let AI agents and automations run your operations in the background 24/7.
              </p>
              <button className="add-task-btn" onClick={() => setTaskRowOpen((o) => !o)}>
                + New Job
              </button>
            </div>
          </article>

          {/* Integrations orbit */}
          <article className="pf-tile t-int">
            <span className="pf-tile-tag">
              <span className="dot" />Integrations
            </span>
            <div className="pf-tile-visual">
              <div className="int-vis">
                <div className="orbit">
                  <div className="orbit-ring r2" />
                  <div className="orbit-ring r1" />
                  <div className="orbit-anim">
                    {[
                      { cls: "c1", name: "Stripe", glyph: "✦" },
                      { cls: "c2", name: "Google", glyph: "G" },
                      { cls: "c3", name: "Slack", glyph: "$" },
                      { cls: "c4", name: "Salesforce", glyph: "S" },
                      { cls: "c5", name: "Notion", glyph: "N" },
                      { cls: "c6", name: "Zapier", glyph: "Z" },
                    ].map((chip) => (
                      <span
                        key={chip.cls}
                        className={`chip-i ${chip.cls}`}
                        onMouseEnter={() => handleChipHover(chip.name)}
                        onMouseLeave={handleChipLeave}
                      >
                        {chip.glyph}
                      </span>
                    ))}
                  </div>
                  <div className="orbit-center">+</div>
                  <div
                    className="chip-tooltip"
                    style={{ opacity: tooltipVisible ? 1 : 0 }}
                  >
                    {tooltipName}
                  </div>
                </div>
              </div>
            </div>
            <div className="pf-tile-body">
              <div className="pf-tile-title">Deep Integrations.</div>
              <p className="pf-tile-desc">
                Connect AI models, payments, CRMs, email, and thousands of tools in just a few clicks.
              </p>
            </div>
          </article>

          {/* Speed */}
          <article className="pf-tile t-speed">
            <span className="pf-tile-tag">
              <span className="dot" />Edge speed
            </span>
            <div className="pf-tile-visual">
              <div className="speed-vis">
                <div className="speed-num" ref={speedNumRef}>
                  <span className="count">{speedCount}</span>
                  <small>ms</small>
                </div>
                <div className="speed-spark">
                  <svg viewBox="0 0 200 36" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="sparkG" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#9B6CFB" stopOpacity=".35" />
                        <stop offset="100%" stopColor="#9B6CFB" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,28 C20,24 30,20 50,22 C70,24 90,12 110,14 C130,16 150,8 170,10 L200,8 L200,36 L0,36 Z"
                      fill="url(#sparkG)"
                    />
                    <path
                      d="M0,28 C20,24 30,20 50,22 C70,24 90,12 110,14 C130,16 150,8 170,10 L200,8"
                      fill="none"
                      stroke="#9B6CFB"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="pf-tile-body">
              <div className="pf-tile-title">Visual Database &amp; Content Layer.</div>
              <p className="pf-tile-desc">
                Manage your app's data, content, and workflows visually without touching backend code.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
