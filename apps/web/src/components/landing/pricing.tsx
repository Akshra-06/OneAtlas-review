"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const CHECK = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
);

const PLANS = [
  {
    key: "explorer",
    name: "Explorer",
    desc: "For testing ideas and first AI products.",
    price: "$0",
    suffix: "",
    billing: "",
    cta: "Start Building Free",
    popular: false,
    prevPlan: null,
    features: [
      "30 AI build credits",
      "200 automation credits",
      "Unlimited projects",
      "Visual app builder",
      "Built-in database & auth",
      "One-click deployment",
      "Hosted on OneAtlas domain",
      "Core AI generation tools",
    ],
  },
  {
    key: "studio",
    name: "Studio",
    desc: "For founders launching production apps.",
    price: "$24",
    suffix: "/month",
    billing: "Billed annually",
    cta: "Upgrade to Studio",
    popular: false,
    prevPlan: "Explorer",
    features: [
      "150 AI build credits",
      "5,000 automation credits",
      "Custom domains",
      "Backend functions & APIs",
      "In-app code editing",
      "GitHub synchronization",
      "Remove OneAtlas branding",
      "Faster build & deployment",
      "Standard support",
    ],
  },
  {
    key: "scale",
    name: "Scale",
    desc: "For startups building serious AI software.",
    price: "$59",
    suffix: "/month",
    billing: "Billed annually",
    cta: "Start Scaling",
    popular: true,
    prevPlan: "Studio",
    features: [
      "500 AI build credits",
      "20,000 automation credits",
      "Advanced AI model access",
      "Production-grade hosting",
      "Shared team workspace",
      "App analytics & monitoring",
      "SEO optimization",
      "Staging environments",
      "Priority support",
      "Early access to new features",
    ],
  },
  {
    key: "orbit",
    name: "Orbit",
    desc: "For high-growth companies at scale.",
    price: "$149",
    suffix: "/month",
    billing: "Billed annually",
    cta: "Contact Sales",
    popular: false,
    prevPlan: "Scale",
    features: [
      "1,500 AI build credits",
      "75,000 automation credits",
      "Premium AI model routing",
      "Dedicated infrastructure",
      "Advanced permissions",
      "Enterprise SSO/SAML",
      "Audit logs & usage insights",
      "Dedicated onboarding",
      "Slack-based support",
      "White-glove migration",
    ],
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section style={{ padding: "64px 0", background: "#F5F5EE", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #E5E7EB", padding: "7px 14px 7px 12px", borderRadius: 999, fontSize: 13, fontWeight: 500, color: "#FF6600", marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6600", boxShadow: "0 0 0 4px rgba(255,102,0,.18)", animation: "pulse 2s ease-in-out infinite", display: "inline-block" }} />
            Pricing
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.035em", marginBottom: 16, color: "#111111" }}>
            Simple pricing.{" "}
            <span style={{ color: "#FF6600" }}>
              Unlimited possibilities.
            </span>
          </h2>
          <p style={{ fontSize: 18, color: "#6B7280", maxWidth: 520, margin: "0 auto", lineHeight: 1.7, fontWeight: 400 }}>
            Choose the perfect plan for your stage.
          </p>
        </motion.div>

        {/* Toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 999, padding: 4 }}>
            <button
              onClick={() => setYearly(false)}
              style={{ padding: "8px 24px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, background: !yearly ? "#111111" : "transparent", color: !yearly ? "#fff" : "#6B7280", transition: "all 0.2s" }}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              style={{ padding: "8px 24px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, background: yearly ? "#111111" : "transparent", color: yearly ? "#fff" : "#6B7280", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}
            >
              Yearly
              <span style={{ background: "#FF6600", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
          className="pricing-grid"
        >
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                border: plan.popular ? "1.5px solid #FF6600" : "1px solid #E5E7EB",
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column" as const,
                position: "relative",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 4px 24px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#FF6600", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 999, whiteSpace: "nowrap" as const, letterSpacing: "0.04em" }}>
                  Most Popular
                </div>
              )}

              {/* Plan name & desc */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: "#111111", margin: "0 0 8px" }}>{plan.name}</h3>
               <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.4, margin: "0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{plan.desc}</p>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, color: "#111111", letterSpacing: "-0.03em" }}>{plan.price}</span>
                  {plan.suffix && <span style={{ fontSize: 15, color: "#6B7280", marginLeft: 2 }}>{plan.suffix}</span>}
                </div>
                {plan.billing
                  ? <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{plan.billing}</div>
                  : <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Free forever</div>
                }
              </div>

              {/* CTA */}
              <button
                style={{
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 12,
                  border: plan.popular ? "none" : "1px solid #E5E7EB",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 28,
                  background: plan.popular ? "#FF6600" : "#fff",
                  color: plan.popular ? "#fff" : "#111111",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
  if (plan.popular) {
    (e.currentTarget as HTMLElement).style.background = "#E65C00";
  } else {
    (e.currentTarget as HTMLElement).style.background = "#FF6600";
    (e.currentTarget as HTMLElement).style.color = "#fff";
    (e.currentTarget as HTMLElement).style.border = "1px solid #FF6600";
  }
}}
onMouseLeave={e => {
  if (plan.popular) {
    (e.currentTarget as HTMLElement).style.background = "#FF6600";
  } else {
    (e.currentTarget as HTMLElement).style.background = "#fff";
    (e.currentTarget as HTMLElement).style.color = "#111111";
    (e.currentTarget as HTMLElement).style.border = "1px solid #E5E7EB";
  }
}}
              >
                {plan.cta}
              </button>

              {/* Divider */}
              <div style={{ height: 1, background: "#E5E7EB", marginBottom: 24 }} />

              {/* Features */}
              <div style={{ flex: 1 }}>
                {plan.prevPlan && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", marginBottom: 14, letterSpacing: "0.02em" }}>
                    Everything in {plan.prevPlan}, plus:
                  </div>
                )}
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" as const, gap: 12 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#111111", lineHeight: 1.5 }}>
                      <span style={{ color: plan.popular ? "#FF6600" : "#6B7280", flexShrink: 0, marginTop: 1 }}><CHECK /></span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Bottom CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginTop: 64, borderRadius: 24, background: "#FF6600", padding: "36px 56px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" as const }}
        >
          <div style={{ maxWidth: 600 }}>
  <h3 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 12, letterSpacing: "-0.02em" }}>
    Enterprise
  </h3>
  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", marginBottom: 16, lineHeight: 1.6 }}>
    Custom infrastructure & deployment solutions for modern organizations.
  </p>
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {[
      "Private cloud or dedicated hosting",
      "Custom integrations & workflows",
      "SLA-backed uptime guarantees",
    ].map(item => (
      <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.90)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {item}
      </div>
    ))}
  </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
            <button style={{ padding: "14px 28px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, background: "#111111", color: "#fff", transition: "background 0.2s" }}
  onMouseEnter={e => (e.currentTarget.style.background = "#333")}
  onMouseLeave={e => (e.currentTarget.style.background = "#111111")}
>
  Talk to Enterprise Sales
</button>
          </div>
        </motion.div>

      </div>

      <style>{`
        @media (max-width: 1024px) { .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .pricing-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}