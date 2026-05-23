"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="var(--indigo)" opacity="0.12" />
    <polyline points="4.5 8.5 7 11 11.5 5.5" stroke="var(--indigo)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <line x1="4" y1="8" x2="12" y2="8" stroke="var(--ink-soft)" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const PLANS = [
  {
    key: "explorer",
    name: "Explorer",
    desc: "Perfect for testing ideas, learning the platform, and building your first AI-powered products.",
    price: "$0",
    priceSuffix: "",
    billing: "",
    cta: "Start Building Free",
    ctaStyle: "dark",
    popular: false,
  },
  {
    key: "studio",
    name: "Studio",
    desc: "Built for founders and creators launching production-ready applications.",
    price: "$24",
    priceSuffix: "/month",
    billing: "Billed annually",
    cta: "Upgrade to Studio",
    ctaStyle: "ghost",
    popular: false,
  },
  {
    key: "scale",
    name: "Scale",
    desc: "Designed for startups and fast-moving teams building serious AI software.",
    price: "$59",
    priceSuffix: "/month",
    billing: "Billed annually",
    cta: "Start Scaling",
    ctaStyle: "gradient",
    popular: true,
  },
  {
    key: "orbit",
    name: "Orbit",
    desc: "For high-growth companies running AI products at scale.",
    price: "$149",
    priceSuffix: "/month",
    billing: "Billed annually",
    cta: "Contact Sales",
    ctaStyle: "ghost",
    popular: false,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    desc: "Custom infrastructure, governance, and deployment solutions for modern organizations.",
    price: "Custom",
    priceSuffix: "",
    billing: "",
    cta: "Talk to Enterprise Sales",
    ctaStyle: "ghost",
    popular: false,
  },
];

const FEATURES = [
  {
    label: "AI Build Credits / month",
    explorer: "30 credits",
    studio: "150 credits",
    scale: "500 credits",
    orbit: "1,500 credits",
    enterprise: "Custom",
  },
  {
    label: "Automation Credits / month",
    explorer: "200 credits",
    studio: "5,000 credits",
    scale: "20,000 credits",
    orbit: "75,000 credits",
    enterprise: "Custom",
  },
  {
    label: "Projects",
    explorer: "Unlimited",
    studio: "Unlimited",
    scale: "Unlimited",
    orbit: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    label: "Visual App Builder",
    explorer: true,
    studio: true,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Built-in Database & Authentication",
    explorer: true,
    studio: true,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "One-click Deployment",
    explorer: true,
    studio: true,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Core AI Generation Tools",
    explorer: true,
    studio: true,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Custom Domains",
    explorer: false,
    studio: true,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Backend Functions & API Workflows",
    explorer: false,
    studio: true,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "In-app Code Editing",
    explorer: false,
    studio: true,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "GitHub Synchronization",
    explorer: false,
    studio: true,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Remove OneAtlas Branding",
    explorer: false,
    studio: true,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Faster Build & Deployment",
    explorer: false,
    studio: true,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Advanced AI Model Access",
    explorer: false,
    studio: false,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Production-grade Hosting",
    explorer: false,
    studio: false,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Shared Team Workspace",
    explorer: false,
    studio: false,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "App Analytics & Monitoring",
    explorer: false,
    studio: false,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "SEO & Performance Optimization",
    explorer: false,
    studio: false,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Staging Environments",
    explorer: false,
    studio: false,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Early Access to New Features",
    explorer: false,
    studio: false,
    scale: true,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Premium AI Model Routing",
    explorer: false,
    studio: false,
    scale: false,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Dedicated Infrastructure Priority",
    explorer: false,
    studio: false,
    scale: false,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Advanced Permissions & Access Controls",
    explorer: false,
    studio: false,
    scale: false,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Enterprise Authentication (SSO/SAML)",
    explorer: false,
    studio: false,
    scale: false,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Audit Logs & Usage Insights",
    explorer: false,
    studio: false,
    scale: false,
    orbit: true,
    enterprise: true,
  },
  {
    label: "White-glove Migration Support",
    explorer: false,
    studio: false,
    scale: false,
    orbit: true,
    enterprise: true,
  },
  {
    label: "Private Cloud / Dedicated Hosting",
    explorer: false,
    studio: false,
    scale: false,
    orbit: false,
    enterprise: true,
  },
  {
    label: "Compliance & Security Controls",
    explorer: false,
    studio: false,
    scale: false,
    orbit: false,
    enterprise: true,
  },
  {
    label: "Custom Integrations & Workflows",
    explorer: false,
    studio: false,
    scale: false,
    orbit: false,
    enterprise: true,
  },
  {
    label: "SLA-backed Uptime Guarantees",
    explorer: false,
    studio: false,
    scale: false,
    orbit: false,
    enterprise: true,
  },
  {
    label: "Flexible Procurement & Billing",
    explorer: false,
    studio: false,
    scale: false,
    orbit: false,
    enterprise: true,
  },
  {
    label: "Custom AI Model Deployment",
    explorer: false,
    studio: false,
    scale: false,
    orbit: false,
    enterprise: true,
  },
  {
    label: "Support",
    explorer: "Community",
    studio: "Standard",
    scale: "Priority",
    orbit: "Slack-based",
    enterprise: "Dedicated",
  },
];

type PlanKey = "explorer" | "studio" | "scale" | "orbit" | "enterprise";

function renderCell(val: string | boolean | undefined) {
  if (val === true) return <div style={{ display: "flex", justifyContent: "center" }}><CheckIcon /></div>;
  if (val === false) return <div style={{ display: "flex", justifyContent: "center" }}><DashIcon /></div>;
  return <span style={{ fontSize: 13, color: "var(--ink-soft)", display: "block", textAlign: "center" }}>{val}</span>;
}

const COL_W = "16%";

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section style={{ padding: "96px 0 0", background: "var(--page-bg, #f8f9fc)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 48 }}
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
            Pricing
          </span>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 16,
            color: "var(--ink)",
          }}>
            Simple pricing.{" "}
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Unlimited possibilities.
            </span>
          </h2>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", maxWidth: 600, margin: "0 auto" }}>
            Choose the perfect plan for your stage — from experimentation to enterprise-scale AI infrastructure.
          </p>
        </motion.div>

        {/* ── Toggle ── */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex",
            background: "var(--card-bg, #fff)",
            border: "1px solid var(--border)",
            borderRadius: 999,
            padding: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <button
              onClick={() => setYearly(false)}
              style={{
                padding: "8px 22px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                background: !yearly ? "var(--ink)" : "transparent",
                color: !yearly ? "#fff" : "var(--ink-soft)",
                transition: "all 0.2s",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              style={{
                padding: "8px 22px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                background: yearly ? "var(--ink)" : "transparent",
                color: yearly ? "#fff" : "var(--ink-soft)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Yearly
              <span style={{
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
              }}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* ── Comparison Table ── */}
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
            boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 960 }}>

              {/* ── Plan Headers ── */}
              <thead>
                <tr>
                  {/* Feature label col */}
                  <th style={{
                    textAlign: "left",
                    padding: "28px 24px 24px",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--ink)",
                    borderBottom: "1px solid var(--border)",
                    width: "20%",
                    verticalAlign: "bottom",
                  }}>
                    Features
                  </th>

                  {PLANS.map((plan) => (
                    <th
                      key={plan.key}
                      style={{
                        width: COL_W,
                        padding: "0 14px 24px",
                        borderBottom: "1px solid var(--border)",
                        verticalAlign: "bottom",
                        position: "relative",
                        background: plan.popular
                          ? "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, rgba(99,102,241,0.02) 100%)"
                          : "transparent",
                        borderLeft: plan.popular ? "1px solid rgba(99,102,241,0.18)" : "none",
                        borderRight: plan.popular ? "1px solid rgba(99,102,241,0.18)" : "none",
                      }}
                    >
                      {plan.popular && (
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "linear-gradient(135deg, #6366f1, #a855f7)",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "5px 16px",
                          borderRadius: "0 0 12px 12px",
                          whiteSpace: "nowrap" as const,
                          letterSpacing: "0.05em",
                          boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                        }}>
                          Most Popular
                        </div>
                      )}

                      <div style={{ paddingTop: plan.popular ? 36 : 28 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                          {plan.name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 14, lineHeight: 1.5 }}>
                          {plan.desc}
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: 4 }}>
                          <span style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)" }}>
                            {plan.price}
                          </span>
                          {plan.priceSuffix && (
                            <span style={{ fontSize: 13, color: "var(--ink-soft)", marginLeft: 2 }}>
                              {plan.priceSuffix}
                            </span>
                          )}
                        </div>
                        {plan.billing && (
                          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 14 }}>
                            {plan.billing}
                          </div>
                        )}
                        {!plan.billing && <div style={{ height: 14, marginBottom: 14 }} />}

                        {/* CTA Button */}
                        <button style={{
                          width: "100%",
                          padding: "10px 0",
                          borderRadius: 10,
                          border: plan.ctaStyle === "ghost" ? "1.5px solid var(--border)" : "none",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          background:
                            plan.ctaStyle === "gradient" ? "linear-gradient(135deg, #6366f1, #a855f7)" :
                            plan.ctaStyle === "dark" ? "var(--ink)" :
                            "transparent",
                          color: plan.ctaStyle === "ghost" ? "var(--indigo)" : "#fff",
                          transition: "all 0.2s",
                          boxShadow: plan.ctaStyle === "gradient" ? "0 4px 16px rgba(99,102,241,0.35)" : "none",
                        }}>
                          {plan.cta}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* ── Feature Rows ── */}
              <tbody>
                {FEATURES.map((feat, i) => (
                  <tr
                    key={feat.label}
                    style={{
                      borderBottom: i < FEATURES.length - 1 ? "1px solid var(--border)" : "none",
                      background: i % 2 !== 0 ? "rgba(0,0,0,0.012)" : "transparent",
                    }}
                  >
                    {/* Feature name */}
                    <td style={{
                      padding: "13px 24px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--ink)",
                    }}>
                      {feat.label}
                    </td>

                    {/* Plan values */}
                    {(["explorer", "studio", "scale", "orbit", "enterprise"] as PlanKey[]).map((planKey) => {
                      const plan = PLANS.find(p => p.key === planKey)!;
                      const isPopular = plan.popular;
                      return (
                        <td
                          key={planKey}
                          style={{
                            padding: "13px 14px",
                            textAlign: "center" as const,
                            background: isPopular
                              ? i % 2 !== 0 ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.03)"
                              : "transparent",
                            borderLeft: isPopular ? "1px solid rgba(99,102,241,0.15)" : "none",
                            borderRight: isPopular ? "1px solid rgba(99,102,241,0.15)" : "none",
                          }}
                        >
                          {renderCell(feat[planKey] as string | boolean)}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* ── CTA row at bottom ── */}
                <tr style={{ borderTop: "2px solid var(--border)" }}>
                  <td style={{ padding: "24px" }} />
                  {PLANS.map((plan) => (
                    <td
                      key={plan.key}
                      style={{
                        padding: "24px 14px",
                        textAlign: "center" as const,
                        background: plan.popular ? "rgba(99,102,241,0.04)" : "transparent",
                        borderLeft: plan.popular ? "1px solid rgba(99,102,241,0.15)" : "none",
                        borderRight: plan.popular ? "1px solid rgba(99,102,241,0.15)" : "none",
                      }}
                    >
                      <button style={{
                        padding: "10px 18px",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        background: plan.ctaStyle === "gradient" ? "linear-gradient(135deg, #6366f1, #a855f7)" : "transparent",
                        color: plan.ctaStyle === "gradient" ? "#fff" : "var(--indigo)",
                        boxShadow: plan.ctaStyle === "gradient" ? "0 4px 16px rgba(99,102,241,0.35)" : "none",
                        whiteSpace: "nowrap" as const,
                      }}>
                        {plan.cta}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Bottom CTA Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            marginTop: 64,
            borderRadius: 24,
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #1e1b4b 100%)",
            padding: "60px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Glow orbs */}
          <div style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, right: 220, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Left content */}
          <div style={{ position: "relative", zIndex: 1, maxWidth: 500 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 style={{ fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 14 }}>
              Ready to build the future with{" "}
              <span style={{ background: "linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                OneAtlas
              </span>?
            </h3>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.7 }}>
              From idea to production — build, deploy, and scale AI applications faster with the all-in-one platform.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
              <button style={{ padding: "14px 30px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "#fff", boxShadow: "0 4px 20px rgba(99,102,241,0.5)" }}>
                Start for Free
              </button>
              <button style={{ padding: "14px 30px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.22)", cursor: "pointer", fontSize: 15, fontWeight: 700, background: "transparent", color: "#fff" }}>
                Talk to Sales
              </button>
            </div>
          </div>

          {/* Right illustration */}
          <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
            <div style={{ width: 290, height: 210, background: "rgba(255,255,255,0.05)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "visible" }}>
              <div style={{ width: "88%", padding: 16 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  {["#6366f1","#a855f7","#ec4899"].map((c, i) => (
                    <div key={i} style={{ flex: 1, height: 6, borderRadius: 4, background: c, opacity: 0.85 }} />
                  ))}
                </div>
                {[75, 50, 85, 40, 65].map((h, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.1)" }} />
                    <div style={{ flex: 1, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.08)" }}>
                      <div style={{ width: `${h}%`, height: "100%", borderRadius: 4, background: i === 2 ? "linear-gradient(90deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.22)" }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ flex: 1, height: 38, borderRadius: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  ))}
                </div>
              </div>
              {/* Floating badge top-right */}
              <div style={{ position: "absolute", top: -16, right: -16, background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 12, padding: "9px 12px", boxShadow: "0 4px 16px rgba(99,102,241,0.5)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </div>
              {/* Floating badge bottom-left */}
              <div style={{ position: "absolute", bottom: -16, left: -16, background: "#1e1b4b", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 12, padding: "9px 13px", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Trusted by ── */}
        <div style={{ textAlign: "center", padding: "52px 0 96px" }}>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 24, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
            Trusted by builders at every stage
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 48, flexWrap: "wrap" as const }}>
            {["ACME", "PULSE", "OVAL", "Layer", "Echo", "Cloudrail"].map((brand) => (
              <span key={brand} style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-soft)", opacity: 0.45, letterSpacing: "0.06em" }}>
                {brand}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}