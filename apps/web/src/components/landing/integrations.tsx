"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const INTEGRATIONS = [
  {
    name: "Salesforce",
    category: "Customer Operations",
    desc: "Sync pipeline data, automate workflows, and build internal tools directly on top of your CRM.",
    color: "#00A1E0",
    gradient: "linear-gradient(135deg, rgba(0,161,224,0.15), rgba(0,161,224,0.05))",
    glow: "rgba(0,161,224,0.25)",
    letter: "SF",
    bg: "#00A1E0",
    size: "large",
  },
  {
    name: "Slack",
    category: "Team Communication",
    desc: "Trigger alerts, approvals, and live updates directly inside the channels your team already uses.",
    color: "#E01E5A",
    gradient: "linear-gradient(135deg, rgba(224,30,90,0.12), rgba(54,197,240,0.08))",
    glow: "rgba(224,30,90,0.2)",
    letter: "SL",
    bg: "#E01E5A",
    size: "normal",
  },
  {
    name: "Notion",
    category: "Knowledge & Workspaces",
    desc: "Connect docs and databases to power portals, dashboards, internal systems, and AI workflows.",
    color: "#333333",
    gradient: "linear-gradient(135deg, rgba(0,0,0,0.08), rgba(99,102,241,0.06))",
    glow: "rgba(99,102,241,0.2)",
    letter: "N",
    bg: "#333333",
    size: "normal",
  },
  {
    name: "Google Sheets",
    category: "Live Spreadsheet Data",
    desc: "Turn spreadsheets into connected app data for reporting, operations, and workflow automation.",
    color: "#34A853",
    gradient: "linear-gradient(135deg, rgba(52,168,83,0.12), rgba(52,168,83,0.04))",
    glow: "rgba(52,168,83,0.2)",
    letter: "GS",
    bg: "#34A853",
    size: "large",
  },
  {
    name: "HubSpot",
    category: "Revenue Workflows",
    desc: "Manage leads, automate customer journeys, and streamline sales operations across teams.",
    color: "#FF7A59",
    gradient: "linear-gradient(135deg, rgba(255,122,89,0.12), rgba(255,122,89,0.04))",
    glow: "rgba(255,122,89,0.2)",
    letter: "HS",
    bg: "#FF7A59",
    size: "normal",
  },
  {
    name: "Gmail",
    category: "Automated Email Flows",
    desc: "Send onboarding emails, notifications, summaries, and customer communication automatically.",
    color: "#EA4335",
    gradient: "linear-gradient(135deg, rgba(234,67,53,0.12), rgba(66,133,244,0.06))",
    glow: "rgba(234,67,53,0.2)",
    letter: "GM",
    bg: "#EA4335",
    size: "normal",
  },
  {
    name: "Twilio",
    category: "Customer Messaging",
    desc: "Build OTPs, reminders, alerts, and SMS workflows directly into your product experience.",
    color: "#F22F46",
    gradient: "linear-gradient(135deg, rgba(242,47,70,0.12), rgba(242,47,70,0.04))",
    glow: "rgba(242,47,70,0.2)",
    letter: "TW",
    bg: "#F22F46",
    size: "normal",
  },
  {
    name: "Google Drive",
    category: "Documents & Storage",
    desc: "Store files, sync exports, and manage app-generated documents from one connected workspace.",
    color: "#4285F4",
    gradient: "linear-gradient(135deg, rgba(66,133,244,0.12), rgba(52,168,83,0.06))",
    glow: "rgba(66,133,244,0.2)",
    letter: "GD",
    bg: "#4285F4",
    size: "large",
  },
]
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
} as const;

function IntegrationCard({ integration, index }: { integration: typeof INTEGRATIONS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: hovered ? integration.gradient : "var(--card-bg, #fff)",
        border: `1px solid ${hovered ? integration.color + "40" : "var(--border)"}`,
        borderRadius: 20,
        padding: integration.size === "large" ? "28px 28px" : "24px 24px",
        cursor: "pointer",
        overflow: "hidden",
        transition: "all 0.3s ease",
        boxShadow: hovered
          ? `0 8px 40px ${integration.glow}, 0 2px 12px rgba(0,0,0,0.06)`
          : "0 2px 12px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* Glow blob on hover */}
      <div style={{
        position: "absolute",
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${integration.glow} 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s ease",
        pointerEvents: "none",
      }} />

      {/* Animated border beam on hover */}
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: 20,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s",
        background: `linear-gradient(135deg, ${integration.color}20, transparent, ${integration.color}10)`,
        pointerEvents: "none",
      }} />

      {/* Icon */}
      <div style={{
        width: 52,
        height: 52,
        minWidth: 52,
        minHeight: 52,
        borderRadius: 14,
        background: integration.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        transition: "all 0.3s ease",
        boxShadow: hovered ? `0 4px 16px ${integration.glow}` : "0 2px 8px rgba(0,0,0,0.1)",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "0.02em",
          lineHeight: 1,
          userSelect: "none",
        }}>
          {integration.letter}
        </span>
      </div>

      {/* Content */}
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        color: hovered ? integration.color : "var(--ink-soft)",
        marginBottom: 6,
        transition: "color 0.3s",
      }}>
        {integration.category}
      </div>
      <div style={{
        fontSize: integration.size === "large" ? 18 : 16,
        fontWeight: 700,
        color: "var(--ink)",
        marginBottom: 8,
      }}>
        {integration.name}
      </div>
      <div style={{
        fontSize: 13,
        color: "var(--ink-soft)",
        lineHeight: 1.65,
      }}>
        {integration.desc}
      </div>

      {/* Connect arrow on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -8 }}
        transition={{ duration: 0.2 }}
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: integration.color,
        }}
      >
        Connect
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

export function Integrations() {
  return (
    <section style={{ padding: "96px 0", background: "var(--page-bg, #f8f9fc)", position: "relative", overflow: "hidden" }}>

      {/* Background atmosphere */}
      <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Subtle grid background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
        backgroundImage: "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

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
            Integrations
          </span>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, color: "var(--ink)", marginBottom: 16, lineHeight: 1.1 }}>
            Plug into the tools you{" "}
            <span style={{ background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              already run
            </span>
          </h2>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
            OneAtlas works with the systems your team already depends on — CRM, communication, spreadsheets, documents, and customer workflows. Connect your stack instantly without rebuilding infrastructure or managing APIs.
          </p>
        </motion.div>

        {/* ── Bento Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "auto auto",
            gap: 16,
          }}
          className="int-grid"
        >
          {/* Row 1: large, normal, normal, large */}
          <div style={{ gridColumn: "span 2" }}>
            <IntegrationCard integration={INTEGRATIONS[0]} index={0} />
          </div>
          <div>
            <IntegrationCard integration={INTEGRATIONS[1]} index={1} />
          </div>
          <div>
            <IntegrationCard integration={INTEGRATIONS[2]} index={2} />
          </div>

          {/* Row 2: normal, normal, large */}
          <div>
            <IntegrationCard integration={INTEGRATIONS[4]} index={4} />
          </div>
          <div>
            <IntegrationCard integration={INTEGRATIONS[5]} index={5} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <IntegrationCard integration={INTEGRATIONS[3]} index={3} />
          </div>

          {/* Row 3: normal, large, normal */}
          <div>
            <IntegrationCard integration={INTEGRATIONS[6]} index={6} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <IntegrationCard integration={INTEGRATIONS[7]} index={7} />
          </div>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            <motion.div
              variants={cardVariants}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))",
                border: "1px dashed rgba(99,102,241,0.25)",
                borderRadius: 20,
                padding: "24px",
                display: "flex",
                flexDirection: "column" as const,
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center" as const,
                gap: 12,
              }}
            >
              <div style={{ fontSize: 28 }}>+</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--indigo)" }}>More coming</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Stripe, Discord, LinkedIn & more</div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Bottom text + CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap" as const,
            gap: 16,
            padding: "24px 28px",
            background: "var(--card-bg, #fff)",
            borderRadius: 16,
            border: "1px solid var(--border)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>
            Also connects to{" "}
            <strong style={{ color: "var(--ink)" }}>Stripe, Discord, LinkedIn, Google Calendar, TikTok, Resend, REST APIs, Webhooks</strong>, and more.
          </p>
          <button style={{
            padding: "11px 24px",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            color: "#fff",
            whiteSpace: "nowrap" as const,
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            transition: "transform 0.2s",
          }}>
            Explore All Integrations →
          </button>
        </motion.div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .int-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .int-grid > div[style*="span 2"] {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 560px) {
          .int-grid {
            grid-template-columns: 1fr !important;
          }
          .int-grid > div[style*="span 2"] {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </section>
  );
}