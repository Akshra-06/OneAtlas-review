"use client";
import { useState } from "react";
import { HeroCanvas } from "./hero-canvas";

const MODELS = [
  "Automatic",
  "GPT-5.5",
  "GPT-5.4 Mini",
  "Claude Sonnet 4.6",
  "Claude Opus 4.6",
  "Gemini 3.1 Pro",
  "Gemini 3 Flash",
  "DeepSeek V4",
  "Llama 4 Scout",
  "Mistral Small",
];

const CHIPS = [
  "Sales CRM",
  "KPI Dashboard",
  "Employee onboarding app",
  "Customer support portal",
  "Inventory tracker",
  "Approval Workflow",
];

const MODES = ["Build", "Plan"];

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
}
function IconDash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="13" rx="2"/>
      <path d="M8 20h8M12 17v3"/>
      <path d="M8 12l3 3 5-5"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2"/>
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
      <circle cx="17" cy="9" r="2.6"/>
      <path d="M21 19c0-2.7-2-4.5-4-4.5"/>
    </svg>
  );
}
function IconBrief() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2"/>
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
      <path d="M3 13h18"/>
    </svg>
  );
}
function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.5"/>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>
    </svg>
  );
}

const PREMIUM_CARDS = [
  { label: "Internal Tool", tone: "t-tool",  Icon: IconGrid  },
  { label: "Dashboard",     tone: "t-dash",  Icon: IconDash  },
  { label: "Client Portal", tone: "t-port",  Icon: IconUsers },
  { label: "CRM App",       tone: "t-crm",   Icon: IconBrief },
  { label: "AI Workflow",   tone: "t-ai",    Icon: IconSpark },
  { label: "Admin Panel",   tone: "t-admin", Icon: IconShield},
];

export function Hero() {
  const [showModels, setShowModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Automatic");
  const [mode, setMode] = useState("Build");

  return (
    <section className="hero">
      <HeroCanvas />
      <div className="hero-inner">
        <div className="pill">
          <span className="dot" />
          Now in public beta
        </div>
        <h1 className="hero-title" style={{ whiteSpace: "nowrap" }}>
          Where ideas become <span className="grad">tools</span>
        </h1>
        <p className="hero-sub">
          Describe what your team needs. OneAtlas generates a production-ready
          internal tool and deploys it instantly.
        </p>

        <div className="prompt-card">
          <textarea
            className="prompt-input"
            placeholder="Describe the internal tool your team needs…"
          />
          <div className="prompt-row">
            <div className="prompt-row-left">

              {/* Attach File */}
              <button className="icon-btn" aria-label="Attach File" title="Attach File">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              {/* Mode Toggle */}
              <div style={{ display: "flex", background: "#F1F0FF", borderRadius: 8, padding: 2, gap: 2 }}>
                {MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: mode === m ? "white" : "transparent",
                      color: mode === m ? "#635BFF" : "#697386",
                      boxShadow: mode === m ? "0 1px 4px rgba(99,91,255,.15)" : "none",
                      transition: "all .15s",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Model Selector */}
              <div style={{ position: "relative" }}>
                <button
                  className="model-chip"
                  onClick={() => setShowModels(!showModels)}
                >
                  <img
                    src={({
                      "Automatic": "/models/anthropic1.png",
                      "GPT-5.5": "/models/openai.png",
                      "GPT-5.4 Mini": "/models/openai.png",
                      "Claude Sonnet 4.6": "/models/anthropic1.png",
                      "Claude Opus 4.6": "/models/anthropic1.png",
                      "Gemini 3.1 Pro": "/models/gemini.png",
                      "Gemini 3 Flash": "/models/gemini.png",
                      "DeepSeek V4": "/models/deepseek.png",
                      "Llama 4 Scout": "/models/meta.png",
                      "Mistral Small": "/models/mistral.png",
                    } as Record<string, string>)[selectedModel] ?? ""}
                    alt={selectedModel}
                    style={{ width: 16, height: 16, objectFit: "contain", borderRadius: 4 }}
                  />
                  {selectedModel}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {showModels && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    background: "white",
                    border: "1px solid rgba(99,91,255,.15)",
                    borderRadius: 16,
                    boxShadow: "0 16px 40px rgba(10,37,64,.14), 0 0 0 1px rgba(99,91,255,.08)",
                    zIndex: 50,
                    width: 240,
                    overflow: "hidden",
                    animation: "dropIn .2s cubic-bezier(.22,1,.36,1)",
                  }}>
                    {/* Header */}
                    <div style={{
                      padding: "10px 14px 8px",
                      borderBottom: "1px solid #F1F0FF",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".12em",
                      color: "#635BFF",
                    }}>
                      SELECT MODEL
                    </div>
                    {/* Scrollable list */}
                    <div style={{ maxHeight: 260, overflowY: "auto", padding: "6px 6px" }}>
                      {MODELS.map((m) => {
                        const isSelected = selectedModel === m;
                        const meta: Record<string, { color: string; bg: string; vendor: string; logo: string }> = {
                          "Automatic":        { color: "#635BFF", bg: "#F1F0FF", vendor: "OneAtlas",   logo: "https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg" },
                          "GPT-5.5":          { color: "#10A37F", bg: "#D9F0E8", vendor: "OpenAI",    logo: "/models/openai.png" },
                          "GPT-5.4 Mini":     { color: "#10A37F", bg: "#D9F0E8", vendor: "OpenAI",    logo: "/models/openai.png" },
                          "Claude Sonnet 4.6":{ color: "#D97757", bg: "#FBE5DA", vendor: "Anthropic", logo: "/models/anthropic1.png" },
                          "Claude Opus 4.6":  { color: "#C0622F", bg: "#F9D5C0", vendor: "Anthropic", logo: "/models/anthropic1.png" },
                          "Gemini 3.1 Pro":   { color: "#4285F4", bg: "#DCE7FB", vendor: "Google",    logo: "/models/gemini.png" },
                          "Gemini 3 Flash":   { color: "#34A853", bg: "#D5EFE0", vendor: "Google",    logo: "/models/gemini.png" },
                          "DeepSeek V4":      { color: "#4D6BFE", bg: "#DEE4FE", vendor: "DeepSeek",  logo: "/models/deepseek.png" },
                          "Llama 4 Scout":    { color: "#0866FF", bg: "#D9E7FF", vendor: "Meta",      logo: "/models/meta.png" },
                          "Mistral Small":    { color: "#FA520F", bg: "#FDDCCC", vendor: "Mistral AI",logo: "/models/mistral.png" },
                        };
                        const info = meta[m] ?? { color: "#635BFF", bg: "#F1F0FF", vendor: "", logo: "" };
                        return (
                          <button
                            key={m}
                            onClick={() => { setSelectedModel(m); setShowModels(false); }}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              borderRadius: 10,
                              background: isSelected ? info.bg : "transparent",
                              border: "none",
                              cursor: "pointer",
                              transition: "background .15s",
                            }}
                            onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "#F8F8FF"; }}
                            onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                          >
                            {/* Logo */}
                            <div style={{
                              width: 30, height: 30,
                              borderRadius: 8,
                              background: info.bg,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              boxShadow: `0 0 0 1px ${info.color}22`,
                              padding: 5,
                            }}>
                              <img src={info.logo} alt={m} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            </div>
                            {/* Text */}
                            <div style={{ textAlign: "left", flex: 1 }}>
                              <div style={{ fontSize: 12.5, fontWeight: isSelected ? 700 : 500, color: isSelected ? info.color : "#0A2540", lineHeight: 1.2 }}>{m}</div>
                              <div style={{ fontSize: 10.5, color: "#97A3B4", marginTop: 1 }}>{info.vendor}</div>
                            </div>
                            {/* Selected check */}
                            {isSelected && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={info.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <style>{`
                      @keyframes dropIn {
                        from { opacity: 0; transform: translateY(-6px) scale(.97); }
                        to   { opacity: 1; transform: translateY(0) scale(1); }
                      }
                    `}</style>
                  </div>
                )}
              </div>
            </div>

            <div className="prompt-row-right">
              {/* Voice mode */}
              <button className="icon-btn" aria-label="Voice mode">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
              <button className="send-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Premium 6 Chips */}
        <div className="premium-chips">
          {PREMIUM_CARDS.map(({ label, tone, Icon }) => (
            <button key={label} className={`pc ${tone}`} type="button" aria-label={label}>
              <div className="pc-ico"><Icon /></div>
              <div className="pc-label">{label}</div>
            </button>
          ))}
        </div>

        {/* Try example chips */}
        <div className="try-row">
          <span className="try-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Try an example
          </span>
          {CHIPS.map((chip) => (
            <button key={chip} className="try-chip">{chip}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
