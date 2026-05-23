"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  {
    label: "Platform",
    items: [
      {
        q: "What is OneAtlas?",
        a: "OneAtlas is an AI-native platform for building full-stack apps, internal tools, client portals, and AI workflows without managing engineering complexity.",
      },
      {
        q: "Who is OneAtlas built for?",
        a: "OneAtlas is built for founders, startups, agencies, operators, product teams, and businesses that want to ship software faster with smaller teams.",
      },
      {
        q: "Do I need to know how to code?",
        a: "No. You can build and launch applications using prompts, visual editing, and AI-assisted workflows.",
      },
      {
        q: "What makes OneAtlas different from no-code tools?",
        a: "OneAtlas combines AI generation, backend infrastructure, database, authentication, workflows, hosting, and deployment in one platform — instead of stitching multiple tools together.",
      },
    ],
  },
  {
    label: "Building Apps",
    items: [
      {
        q: "What can I build with OneAtlas?",
        a: "You can build CRMs, dashboards, AI assistants, admin panels, customer portals, workflow systems, onboarding tools, support platforms, and custom business software.",
      },
      {
        q: "Can I build AI-powered products?",
        a: "Yes. OneAtlas supports AI agents, copilots, document analysis, automated workflows, conversational interfaces, and AI-driven business operations.",
      },
      {
        q: "Can I edit the app after it's generated?",
        a: "Yes. You can continuously modify layouts, workflows, logic, data structures, permissions, and UI as your product evolves.",
      },
      {
        q: "Can I connect external APIs and services?",
        a: "Yes. OneAtlas supports integrations with APIs, payment providers, CRMs, analytics tools, databases, and third-party platforms.",
      },
    ],
  },
  {
    label: "Deployment & Scale",
    items: [
      {
        q: "Does OneAtlas handle hosting and deployment?",
        a: "Yes. Hosting, deployment, scaling, infrastructure, and environment setup are managed automatically.",
      },
      {
        q: "Does OneAtlas include a database and backend?",
        a: "Yes. Every app includes a built-in database, backend logic, APIs, authentication, and storage layer.",
      },
      {
        q: "Can I use OneAtlas for production applications?",
        a: "Yes. OneAtlas is designed for real-world business applications, not just prototypes or demos.",
      },
      {
        q: "Can teams collaborate inside OneAtlas?",
        a: "Yes. Teams can collaborate across apps, workflows, operations, and shared workspaces with role-based access control.",
      },
    ],
  },
  {
    label: "Security & Ownership",
    items: [
      {
        q: "Is my business data secure?",
        a: "Yes. OneAtlas includes authentication, permissions, protected infrastructure, and secure access controls built into the platform.",
      },
      {
        q: "Do I own the apps I create?",
        a: "Yes. You retain ownership of your applications, workflows, data, and operational logic.",
      },
      {
        q: "Can I export or extend my application outside OneAtlas?",
        a: "Yes. OneAtlas gives teams the flexibility to extend, evolve, and scale applications beyond the platform when needed.",
      },
    ],
  },
];

// Floating illustration SVG
const FAQIllustration = () => (
  <div style={{ position: "relative", width: "100%", height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
    {/* Glow orbs */}
    <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
    <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)", top: "30%", right: "15%" }} />

    {/* Orbital dashed rings */}
    <svg style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }} viewBox="0 0 400 400">
      <ellipse cx="200" cy="200" rx="150" ry="60" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="1.5" strokeDasharray="6 4" />
      <ellipse cx="200" cy="200" rx="110" ry="44" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="1" strokeDasharray="4 4" />
    </svg>

    {/* Big 3D question mark */}
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        fontSize: 140,
        fontWeight: 900,
        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #818cf8 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        lineHeight: 1,
        filter: "drop-shadow(0 20px 40px rgba(99,102,241,0.3))",
        userSelect: "none",
        zIndex: 2,
        position: "relative",
      }}
    >
      ?
    </motion.div>

    {/* Floating chat bubble - top left */}
    <motion.div
      animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      style={{
        position: "absolute",
        top: "18%",
        left: "8%",
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "10px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        backdropFilter: "blur(8px)",
        display: "flex",
        gap: 5,
        alignItems: "center",
      }}
    >
      {["#6366f1", "#a855f7", "#ec4899"].map((c, i) => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
      ))}
    </motion.div>

    {/* Floating chat bubble - top right */}
    <motion.div
      animate={{ y: [0, -6, 0], x: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      style={{
        position: "absolute",
        top: "14%",
        right: "6%",
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "10px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        backdropFilter: "blur(8px)",
        display: "flex",
        gap: 5,
        alignItems: "center",
      }}
    >
      {["#f59e0b", "#f59e0b", "#d1d5db"].map((c, i) => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
      ))}
    </motion.div>

    {/* Database icon - bottom left */}
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      style={{
        position: "absolute",
        bottom: "22%",
        left: "10%",
        width: 56,
        height: 56,
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))",
        border: "1px solid rgba(99,102,241,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
        boxShadow: "0 8px 24px rgba(99,102,241,0.15)",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    </motion.div>

    {/* Checkmark icon - right */}
    <motion.div
      animate={{ y: [0, -6, 0], rotate: [0, 3, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      style={{
        position: "absolute",
        bottom: "30%",
        right: "8%",
        width: 52,
        height: 52,
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.12))",
        border: "1px solid rgba(99,102,241,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
        boxShadow: "0 8px 24px rgba(99,102,241,0.12)",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </motion.div>

    {/* Security shield - top center */}
    <motion.div
      animate={{ y: [0, 7, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      style={{
        position: "absolute",
        top: "8%",
        left: "42%",
        width: 44,
        height: 44,
        borderRadius: 14,
        background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))",
        border: "1px solid rgba(99,102,241,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    </motion.div>

    {/* Base platform */}
    <div style={{
      position: "absolute",
      bottom: "12%",
      left: "50%",
      transform: "translateX(-50%)",
      width: 80,
      height: 14,
      borderRadius: 999,
      background: "linear-gradient(90deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
      filter: "blur(4px)",
    }} />
  </div>
);

export function FAQ() {
  const [openKey, setOpenKey] = useState<string | null>("0-0");

  const toggle = (key: string) => setOpenKey(openKey === key ? null : key);

  return (
    <section style={{ padding: "96px 0", background: "var(--page-bg, #f8f9fc)", position: "relative", overflow: "hidden" }}>
      {/* Background orbs */}
      <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <span style={{
            display: "inline-block",
            background: "rgba(99,102,241,0.1)",
            color: "var(--indigo)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            padding: "4px 14px",
            borderRadius: 999,
            marginBottom: 20,
            border: "1px solid rgba(99,102,241,0.2)",
          }}>
            FAQ
          </span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "var(--ink)", marginBottom: 14, lineHeight: 1.15 }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", maxWidth: 520, margin: "0 auto" }}>
            Everything you need to know about building, launching, and scaling with OneAtlas.
          </p>
        </motion.div>

        {/* ── Two column layout ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: 48,
          alignItems: "start",
        }}
          className="faq-grid"
        >
          {/* ── LEFT: Accordion ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {CATEGORIES.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 32 }}>
                {/* Category label */}
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  color: "var(--indigo)",
                  marginBottom: 12,
                  paddingLeft: 4,
                }}>
                  {cat.label}
                </div>

                {/* Items */}
                <div style={{
                  background: "var(--card-bg, #fff)",
                  borderRadius: 20,
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                }}>
                  {cat.items.map((item, ii) => {
                    const key = `${ci}-${ii}`;
                    const isOpen = openKey === key;
                    const isLast = ii === cat.items.length - 1;

                    return (
                      <div key={ii} style={{ borderBottom: !isLast ? "1px solid var(--border)" : "none" }}>
                        <button
                          onClick={() => toggle(key)}
                          style={{
                            width: "100%",
                            padding: "18px 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                            background: isOpen ? "rgba(99,102,241,0.03)" : "transparent",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left" as const,
                            transition: "background 0.2s",
                          }}
                        >
                          <span style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: isOpen ? "var(--indigo)" : "var(--ink)",
                            lineHeight: 1.4,
                            transition: "color 0.2s",
                          }}>
                            {item.q}
                          </span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ flexShrink: 0 }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isOpen ? "var(--indigo)" : "var(--ink-soft)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              key="content"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.28, ease: "easeInOut" }}
                              style={{ overflow: "hidden" }}
                            >
                              <div style={{
                                padding: "0 20px 18px",
                                fontSize: 14,
                                color: "var(--ink-soft)",
                                lineHeight: 1.7,
                              }}>
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── RIGHT: Floating Illustration ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ position: "sticky", top: 100 }}
          >
            <div style={{
              background: "var(--card-bg, #fff)",
              borderRadius: 24,
              border: "1px solid var(--border)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
              overflow: "hidden",
              padding: "16px 0",
            }}>
              <FAQIllustration />
            </div>

            {/* Mini stats below illustration */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 16,
            }}>
              {[
                { label: "Questions answered", value: "15+" },
                { label: "Response time", value: "< 2hrs" },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: "var(--card-bg, #fff)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--indigo)", marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            marginTop: 64,
            background: "var(--card-bg, #fff)",
            borderRadius: 24,
            border: "1px solid var(--border)",
            padding: "40px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap" as const,
            boxShadow: "0 4px 32px rgba(99,102,241,0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Gradient border glow */}
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: 24,
            padding: 1,
            background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3), rgba(236,72,153,0.2))",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            pointerEvents: "none",
          }} />

          <div>
            <h3 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>
              Still have questions?
            </h3>
            <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>
              Our team is here to help you build faster with OneAtlas.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexShrink: 0, flexWrap: "wrap" as const }}>
            <button style={{
              padding: "13px 28px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
              transition: "transform 0.2s",
            }}>
              Talk to Sales
            </button>
            <button style={{
              padding: "13px 28px",
              borderRadius: 12,
              border: "1.5px solid var(--border)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              background: "transparent",
              color: "var(--ink)",
              transition: "all 0.2s",
            }}>
              Contact Support
            </button>
          </div>
        </motion.div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .faq-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}