"use client";
import React from "react";

type Item = {
  name: string;
  category: string;
  description: string;
  chip: "purple" | "mint" | "peach" | "pink" | "cream" | "blue" | "rose" | "yellow";
  icon: React.ReactNode;
};

const items: Item[] = [
  {
    name: "Salesforce",
    category: "CRM",
    description: "Pipeline data and automate workflows on top of your CRM.",
    chip: "blue",
    icon: <img src="/logos/salesforce.png" alt="Salesforce" width={36} height={36} style={{ objectFit: "contain" }} />,
  },
  {
    name: "Slack",
    category: "Communication",
    description: "Trigger alerts and live updates inside your team's channels.",
    chip: "purple",
    icon: <img src="/logos/slack.png" alt="Slack" width={36} height={36} style={{ objectFit: "contain" }} />,
  },
  {
    name: "Notion",
    category: "Knowledge",
    description: "Connect docs and databases to power portals and workflows.",
    chip: "cream",
    icon: <img src="/logos/notion.png" alt="Notion" width={36} height={36} style={{ objectFit: "contain" }} />,
  },
  {
    name: "Google Sheets",
    category: "Data",
    description: "Turn spreadsheets into live app data.",
    chip: "mint",
    icon: <img src="/logos/google-sheets.png" alt="Google Sheets" width={36} height={36} style={{ objectFit: "contain" }} />,
  },
  {
    name: "HubSpot",
    category: "Marketing",
    description: "Manage leads and automate customer journeys.",
    chip: "peach",
    icon: <img src="/logos/hubspot.png" alt="HubSpot" width={36} height={36} style={{ objectFit: "contain" }} />,
  },
  {
    name: "Gmail",
    category: "Email",
    description: "Send onboarding emails and notifications automatically.",
    chip: "rose",
    icon: <img src="/logos/gmail.png" alt="Gmail" width={36} height={36} style={{ objectFit: "contain" }} />,
  },
];

const chipColors: Record<Item["chip"], string> = {
  purple: "#ece9ff",
  mint:   "#d8f4e7",
  peach:  "#ffe2d0",
  pink:   "#ffe0e7",
  cream:  "#f1ece3",
  blue:   "#dde9ff",
  rose:   "#ffd9d9",
  yellow: "#fff2c9",
};

export function Integrations() {
  return (
    <section style={{ background: "#F5F5EE", padding: "64px 0", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 48px" }}>

        {/* Top layout: left + right */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 48, alignItems: "center" }} className="oa-int-layout">

          {/* Left */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#F26522", marginBottom: 16 }}>
              Integrations
            </div>
            <h2 style={{ fontSize: "30px", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.2, color: "#111111", margin: "0 0 20px" }}>
              Plug into the tools you already run<span style={{ color: "#F26522" }}>.</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#6B7280", margin: "0 0 32px" }}>
              OneAtlas works with the systems your team already depends on. Connect your stack instantly without rebuilding infrastructure or managing APIs.
            </p>
            {/* <a href="#" style={{ color: "#FF6600", fontWeight: 600, fontSize: 15, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
              View all integrations →
            </a> */}
          </div>

          {/* Right: cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8, alignItems: "stretch" }} className="oa-int-cards">
            {items.map((it) => (
              <article
                key={it.name}
                style={{
                  background: "#fff",
                  border: "1px solid #e7e9ee",
                  borderRadius: 16,
                  padding: "20px 16px 18px",
                  display: "flex",
                  flexDirection: "column" as const,
                  transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 28px -10px rgba(15,17,21,0.14)";
                  (e.currentTarget as HTMLElement).style.borderColor = "#d0d5e0";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "#e7e9ee";
                }}
              >
                {/* Icon */}
                <div style={{ width: 48, height: 48, borderRadius: 12, background: chipColors[it.chip], display: "grid", placeItems: "center", marginBottom: 18 }}>
                  {it.icon}
                </div>
                {/* Name */}
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f1115", margin: "0 0 4px", letterSpacing: "-0.01em" }}>{it.name}</h3>
                {/* Category */}
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#8a93a3", marginBottom: 10 }}>{it.category}</div>
                {/* Description */}
                <p style={{ fontSize: 12, lineHeight: 1.55, color: "#5a6473", margin: "0 0 18px", flex: 1 }}>{it.description}</p>
                {/* Arrow */}
                <div style={{ color: "#F26522", fontSize: 18, fontWeight: 400 }}>→</div>
              </article>
            ))}
          </div>

        </div>

        {/* Bottom strip */}
        <div style={{ marginTop: 24, paddingTop: 0, borderTop: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" as const }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 14, color: "#5a6473", fontWeight: 500, whiteSpace: "nowrap" as const }}>Also connects to</span>
            {/* Stripe */}
            <img src="/logos/bottom/stripe.png" alt="Stripe" style={{ height: 42, width: "auto", objectFit: "contain" }} />

            {/* Discord */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <img src="/logos/bottom/discord.png" alt="Discord" style={{ height: 20, width: "auto", objectFit: "contain" }} />
              <span style={{ fontSize: 13, color: "#1a1d24", fontWeight: 600 }}>Discord</span>
            </div>

            {/* LinkedIn */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <img src="/logos/bottom/linkedin.png" alt="LinkedIn" style={{ height: 20, width: "auto", objectFit: "contain" }} />
              <span style={{ fontSize: 13, color: "#1a1d24", fontWeight: 600 }}>LinkedIn</span>
            </div>

            {/* Google Calendar */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <img src="/logos/bottom/google-calendar.png" alt="Google Calendar" style={{ height: 20, width: "auto", objectFit: "contain" }} />
              <span style={{ fontSize: 13, color: "#1a1d24", fontWeight: 600 }}>Google Calendar</span>
            </div>

            {/* TikTok */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <img src="/logos/bottom/tiktok.png" alt="TikTok" style={{ height: 20, width: "auto", objectFit: "contain" }} />
              <span style={{ fontSize: 13, color: "#1a1d24", fontWeight: 600 }}>TikTok</span>
            </div>

            {/* Zapier */}
            <img src="/logos/bottom/zapier.png" alt="Zapier" style={{ height: 36, width: "auto", objectFit: "contain" }} />

            {/* Webhooks */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <img src="/logos/bottom/webhooks.png" alt="Webhooks" style={{ height: 20, width: "auto", objectFit: "contain" }} />
              <span style={{ fontSize: 13, color: "#1a1d24", fontWeight: 600 }}>Webhooks</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1d24" }}>+ 100 more</span>
          </div>
          <a href="#" style={{ fontSize: 14, fontWeight: 600, color: "#FF6600", textDecoration: "none", whiteSpace: "nowrap" as const }}>View all integrations →</a>
        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) { .oa-int-layout { grid-template-columns: 1fr !important; } }
        @media (max-width: 1024px) { .oa-int-cards { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .oa-int-cards { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .oa-int-cards { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}