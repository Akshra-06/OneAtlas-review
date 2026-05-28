"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  {
    label: "Platform",
    items: [
      { q: "What is OneAtlas?", a: "OneAtlas is an AI-native platform for building full-stack apps, internal tools, client portals, and AI workflows without managing engineering complexity." },
      { q: "Who is OneAtlas built for?", a: "OneAtlas is built for founders, startups, agencies, operators, product teams, and businesses that want to ship software faster with smaller teams." },
      { q: "Do I need to know how to code?", a: "No. You can build and launch applications using prompts, visual editing, and AI-assisted workflows." },
      { q: "What makes OneAtlas different from no-code tools?", a: "OneAtlas combines AI generation, backend infrastructure, database, authentication, workflows, hosting, and deployment in one platform." },
    ],
  },
  {
    label: "Building Apps",
    items: [
      { q: "What can I build with OneAtlas?", a: "You can build CRMs, dashboards, AI assistants, admin panels, customer portals, workflow systems, onboarding tools, support platforms, and custom business software." },
      { q: "Can I build AI-powered products?", a: "Yes. OneAtlas supports AI agents, copilots, document analysis, automated workflows, conversational interfaces, and AI-driven business operations." },
      { q: "Can I edit the app after it's generated?", a: "Yes. You can continuously modify layouts, workflows, logic, data structures, permissions, and UI as your product evolves." },
      { q: "Can I connect external APIs and services?", a: "Yes. OneAtlas supports integrations with APIs, payment providers, CRMs, analytics tools, databases, and third-party platforms." },
    ],
  },
  {
    label: "Deployment & Scale",
    items: [
      { q: "Does OneAtlas handle hosting and deployment?", a: "Yes. Hosting, deployment, scaling, infrastructure, and environment setup are managed automatically." },
      { q: "Does OneAtlas include a database and backend?", a: "Yes. Every app includes a built-in database, backend logic, APIs, authentication, and storage layer." },
      { q: "Can I use OneAtlas for production applications?", a: "Yes. OneAtlas is designed for real-world business applications, not just prototypes or demos." },
      { q: "Can teams collaborate inside OneAtlas?", a: "Yes. Teams can collaborate across apps, workflows, operations, and shared workspaces with role-based access control." },
    ],
  },
  {
    label: "Security & Ownership",
    items: [
      { q: "Is my business data secure?", a: "Yes. OneAtlas includes authentication, permissions, protected infrastructure, and secure access controls built into the platform." },
      { q: "Do I own the apps I create?", a: "Yes. You retain ownership of your applications, workflows, data, and operational logic." },
      { q: "Can I export or extend my application outside OneAtlas?", a: "Yes. OneAtlas gives teams the flexibility to extend, evolve, and scale applications beyond the platform when needed." },
    ],
  },
];

export function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section style={{ padding: "64px 0", background: "#F5F5EE", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #E5E7EB", padding: "7px 14px 7px 12px", borderRadius: 999, fontSize: 13, fontWeight: 500, color: "#FF6600", marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6600", boxShadow: "0 0 0 4px rgba(255,102,0,.18)", animation: "pulse 2s ease-in-out infinite", display: "inline-block" }} />
            FAQ
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.035em", marginBottom: 16, color: "#111111" }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: 18, color: "#6B7280", maxWidth: 480, margin: "0 auto", lineHeight: 1.7, fontWeight: 400 }}>
            Everything you need to know about OneAtlas.
          </p>
        </motion.div>

        {/* Main layout: Left nav + Right accordion */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 64, alignItems: "start" }} className="faq-layout">

          {/* Left: Category navigation */}
          <div style={{ position: "sticky", top: 100 }}>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
              {CATEGORIES.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveCategory(i); setOpenIndex(null); }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left" as const,
                    fontSize: 15,
                    fontWeight: activeCategory === i ? 600 : 500,
                    color: activeCategory === i ? "#FF6600" : "#6B7280",
                    background: activeCategory === i ? "rgba(255,102,0,0.06)" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    if (activeCategory !== i) (e.currentTarget as HTMLElement).style.background = "#fff";
                  }}
                  onMouseLeave={e => {
                    if (activeCategory !== i) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>

          {/* Right: Accordion */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ background: "#FFFFFF", borderRadius: 24, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 4px 24px rgba(0,0,0,0.03)" }}>
              {CATEGORIES[activeCategory].items.map((item, i) => {
                const isOpen = openIndex === i;
                const isLast = i === CATEGORIES[activeCategory].items.length - 1;

                return (
                  <div key={i} style={{ borderBottom: !isLast ? "1px solid #ECECEC" : "none" }}>
                    <button
                      onClick={() => toggle(i)}
                      style={{
                        width: "100%",
                        padding: "16px 28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left" as const,
                        transition: "background 0.2s",
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 600, color: isOpen ? "#FF6600" : "#111111", lineHeight: 1.4, transition: "color 0.2s" }}>
                        {item.q}
                      </span>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isOpen ? "#FF6600" : "#9CA3AF"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                          <div style={{ padding: "0 28px 16px", fontSize: 15, color: "#6B7280", lineHeight: 1.7 }}>
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .faq-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}