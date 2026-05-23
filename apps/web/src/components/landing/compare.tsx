"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const ROWS = [
  { feature: "Speed to Launch", oneatlas: "Ship full-stack apps in hours", others: "Weeks of setup and development" },
  { feature: "AI-Native Building", oneatlas: "AI handles the heavy lifting", others: "AI limited to simple generation" },
  { feature: "Production Readiness", oneatlas: "Real apps, ready to scale", others: "Mostly prototypes and demos" },
  { feature: "Full Stack Included", oneatlas: "Database, authentication, hosting, APIs, and workflows built in", others: "Requires stitching multiple tools together" },
  { feature: "Iteration Speed", oneatlas: "Edit, deploy, and improve instantly", others: "Slow development cycles" },
  { feature: "Infrastructure Management", oneatlas: "Scaling, deployment, backend, and environments handled automatically", others: "Self-managed infrastructure complexity" },
  { feature: "Team Accessibility", oneatlas: "Anyone on the team can build and operate workflows", others: "Requires technical specialists" },
  { feature: "Operational Efficiency", oneatlas: "One workspace from idea to launch", others: "Fragmented tools and disconnected workflows" },
  { feature: "Integrations", oneatlas: "Native connections across business tools and APIs", others: "Requires manual setup and middleware" },
  { feature: "Automation", oneatlas: "Built-in AI workflows and operational automations", others: "Limited workflow orchestration" },
  { feature: "Collaboration", oneatlas: "Shared workspaces with permissions and real-time collaboration", others: "Siloed tooling and scattered communication" },
  { feature: "Scalability", oneatlas: "Built for production growth from day one", others: "Often requires rebuilding later" },
  { feature: "Deployment", oneatlas: "One-click deployment with managed hosting", others: "Complex deployment pipelines" },
  { feature: "Security & Access", oneatlas: "Integrated authentication and permissions", others: "Requires additional security tooling" },
  { feature: "Ownership & Flexibility", oneatlas: "Full control over apps, workflows, and operations", others: "Vendor limitations and fragmented architecture" },
];

const CheckIcon = () => (
  <div style={{
    width: 22, height: 22, minWidth: 22, minHeight: 22, borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
    overflow: "hidden",
  }}>
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{width:11,height:11,display:"block"}}>
      <polyline points="2 6.5 5 9.5 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const CrossIcon = () => (
  <div style={{
    width: 22, height: 22, minWidth: 22, minHeight: 22, borderRadius: "50%",
    background: "rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.08)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  }}>
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{width:10,height:10,display:"block"}}>
      <line x1="3" y1="3" x2="9" y2="9" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9" y1="3" x2="3" y2="9" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  </div>
);

export function Compare() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <section style={{ padding: "96px 0", background: "var(--page-bg, #f8f9fc)", position: "relative", overflow: "hidden" }}>

      {/* Background atmosphere */}
      <div style={{ position: "absolute", top: -150, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.35,
        backgroundImage: "linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 56 }}
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
            Why OneAtlas?
          </span>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, color: "var(--ink)", marginBottom: 16, lineHeight: 1.1 }}>
            How we{" "}
            <span style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              stack up
            </span>
          </h2>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            See how OneAtlas compares to traditional app builders across the features that matter most.
          </p>
        </motion.div>

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: "var(--card-bg, #fff)",
            borderRadius: 24,
            border: "1px solid var(--border)",
            overflow: "hidden",
            boxShadow: "0 4px 40px rgba(0,0,0,0.07)",
          }}
        >
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            borderBottom: "2px solid var(--border)",
            background: "rgba(0,0,0,0.015)",
          }}>
            <div style={{ padding: "20px 24px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--ink-soft)" }}>
              Feature
            </div>

            {/* OneAtlas column header — highlighted */}
            <div style={{
              padding: "20px 24px",
              background: "linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.03) 100%)",
              borderLeft: "1px solid rgba(99,102,241,0.15)",
              borderRight: "1px solid rgba(99,102,241,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                fontSize: 11, fontWeight: 800, color: "#fff",
              }}>
                OA
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>OneAtlas</span>
            </div>

            <div style={{ padding: "20px 24px", fontSize: 15, fontWeight: 600, color: "var(--ink-soft)", display: "flex", alignItems: "center" }}>
              Others
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                borderBottom: i < ROWS.length - 1 ? "1px solid var(--border)" : "none",
                background: hoveredRow === i ? "rgba(99,102,241,0.02)" : "transparent",
                transition: "background 0.2s",
              }}
            >
              {/* Feature name */}
              <div style={{
                padding: "18px 24px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--ink)",
                display: "flex",
                alignItems: "center",
              }}>
                {row.feature}
              </div>

              {/* OneAtlas value */}
              <div style={{
                padding: "18px 24px",
                background: hoveredRow === i
                  ? "rgba(99,102,241,0.06)"
                  : "rgba(99,102,241,0.025)",
                borderLeft: "1px solid rgba(99,102,241,0.12)",
                borderRight: "1px solid rgba(99,102,241,0.12)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "background 0.2s",
              }}>
                <CheckIcon />
                <span style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.5, fontWeight: 500 }}>
                  {row.oneatlas}
                </span>
              </div>

              {/* Others value */}
              <div style={{
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <CrossIcon />
                <span style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5, opacity: 0.8 }}>
                  {row.others}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            marginTop: 48,
            borderRadius: 24,
            background: "var(--card-bg, #fff)",
            border: "1px solid var(--border)",
            padding: "40px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            flexWrap: "wrap" as const,
            boxShadow: "0 4px 32px rgba(99,102,241,0.07)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Gradient glow border */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 24,
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1), rgba(236,72,153,0.08))",
            padding: 1,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            pointerEvents: "none",
          }} />

          {/* Glow orb */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>
              Build faster without the engineering bottlenecks.
            </h3>
            <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 480, lineHeight: 1.6 }}>
              OneAtlas combines AI generation, infrastructure, workflows, deployment, and operations into one unified platform.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexShrink: 0, flexWrap: "wrap" as const, position: "relative", zIndex: 1 }}>
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
              whiteSpace: "nowrap" as const,
            }}>
              Start Building
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
              whiteSpace: "nowrap" as const,
            }}>
              Book a Demo
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}