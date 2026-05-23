"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const PARTICLES = [
  { x: "62%", y: "18%", color: "#ec4899", size: 5 },
  { x: "75%", y: "12%", color: "#6366f1", size: 4 },
  { x: "45%", y: "22%", color: "#6366f1", size: 3 },
  { x: "55%", y: "55%", color: "#f59e0b", size: 4 },
  { x: "68%", y: "68%", color: "#6366f1", size: 3 },
  { x: "30%", y: "72%", color: "#10b981", size: 3 },
  { x: "20%", y: "45%", color: "#a855f7", size: 3 },
  { x: "38%", y: "85%", color: "#ec4899", size: 3 },
];

// Google Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Mail Icon
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

// GitHub Icon
const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

// Apple Icon
const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

// Microsoft Icon
const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
    <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
    <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
    <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
  </svg>
);

// Slack Icon
const SlackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
  </svg>
);

// Discord Icon
const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/>
  </svg>
);

// SSO Icon
const SSOIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const SOCIAL_BUTTONS = [
  { icon: <GithubIcon />, label: "GitHub" },
  { icon: <AppleIcon />, label: "Apple" },
  { icon: <MicrosoftIcon />, label: "Microsoft" },
  { icon: <SlackIcon />, label: "Slack" },
  { icon: <DiscordIcon />, label: "Discord" },
  { icon: <SSOIcon />, label: "SSO" },
];

export default function SignupPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f0ff 0%, #faf5ff 40%, #f0f9ff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Page background glow */}
      <div style={{ position: "absolute", top: "20%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: "100%",
          maxWidth: 1100,
          minHeight: 620,
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px)",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 8px 60px rgba(99,102,241,0.1), 0 2px 20px rgba(0,0,0,0.06)",
          display: "grid",
          gridTemplateColumns: "55% 45%",
          overflow: "hidden",
        }}
        className="auth-container"
      >

        {/* ── LEFT HERO PANEL ── */}
        <div style={{
          position: "relative",
          padding: "40px 48px",
          background: "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 30%, #fce7f3 60%, #e0f2fe 100%)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column" as const,
        }}>

          {/* Big planet orb bottom left */}
          <div style={{
            position: "absolute",
            bottom: -80,
            left: -60,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 40%, #f9a8d4 0%, #c4b5fd 40%, #93c5fd 80%, transparent 100%)",
            opacity: 0.7,
            filter: "blur(2px)",
          }} />

          {/* Dashed orbital ring */}
          <svg style={{ position: "absolute", bottom: -40, left: -40, width: 380, height: 380, opacity: 0.3 }} viewBox="0 0 380 380">
            <circle cx="190" cy="190" r="170" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="6 5" />
            <circle cx="190" cy="190" r="130" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 6" />
          </svg>

          {/* Floating particles */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: p.color,
                boxShadow: `0 0 6px ${p.color}`,
              }}
            />
          ))}

          {/* Sparkle near heading */}
          <motion.div
            animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "42%",
              left: "68%",
              fontSize: 22,
              color: "#6366f1",
            }}
          >
            ✦
          </motion.div>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 32, height: 32,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ink, #1a1a2e)" }}>OneAtlas</span>
          </div>

          {/* Beta badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 999,
              padding: "6px 14px",
              marginBottom: 28,
              width: "fit-content",
              position: "relative",
              zIndex: 1,
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1" }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>Now in public beta</span>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ position: "relative", zIndex: 1, marginBottom: 24 }}
          >
            <h1 style={{
              fontSize: "clamp(36px, 4vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.1,
              color: "var(--ink, #0f172a)",
              margin: 0,
            }}>
              Software creation
              <br />
              for{" "}
              <span style={{
                background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                modern teams
              </span>
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: 16,
              color: "var(--ink-soft, #64748b)",
              lineHeight: 1.7,
              maxWidth: 340,
              position: "relative",
              zIndex: 1,
            }}
          >
            Describe workflows, dashboards, or internal tools. OneAtlas builds and deploys them for you.
          </motion.p>
        </div>

        {/* ── RIGHT AUTH CARD ── */}
        <div style={{
          background: "rgba(255,255,255,0.92)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 44px",
        }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ width: "100%", maxWidth: 380 }}
          >
            {/* Title */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink, #0f172a)", marginBottom: 8 }}>
                Create your account
              </h2>
              <p style={{ fontSize: 15, color: "var(--ink-soft, #64748b)" }}>
                Start building with OneAtlas.
              </p>
            </div>

            {/* Google button */}
            <motion.button
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 12,
                border: "1.5px solid #e2e8f0",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                fontSize: 15,
                fontWeight: 600,
                color: "var(--ink, #0f172a)",
                cursor: "pointer",
                marginBottom: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "border-color 0.2s",
              }}
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>

            {/* Email button */}
            <motion.button
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(99,102,241,0.15)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 12,
                border: "1.5px solid #e2e8f0",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                fontSize: 15,
                fontWeight: 600,
                color: "var(--ink, #0f172a)",
                cursor: "pointer",
                marginBottom: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "border-color 0.2s",
              }}
            >
              <MailIcon />
              Continue with Email
            </motion.button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              <span style={{ fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" as const }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>

            {/* Social icon buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28 }}>
              {SOCIAL_BUTTONS.map((btn, i) => (
                <motion.button
                  key={i}
                  whileHover={{ y: -3, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  title={btn.label}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    transition: "all 0.2s",
                    fontSize: btn.label === "SSO" ? 11 : 14,
                    fontWeight: btn.label === "SSO" ? 700 : 400,
                    color: btn.label === "SSO" ? "var(--ink, #0f172a)" : "inherit",
                    flexDirection: "column" as const,
                    gap: 2,
                  }}
                >
                  {btn.icon}
                  {btn.label === "SSO" && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#64748b" }}>SSO</span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Legal text */}
            <p style={{ fontSize: 12.5, color: "#94a3b8", textAlign: "center", lineHeight: 1.6, marginBottom: 16 }}>
              By creating an account, you agree to our{" "}
              <Link href="/terms" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
                Privacy Policy
              </Link>
              .
            </p>

            {/* Sign in link */}
            <p style={{ fontSize: 13.5, color: "#94a3b8", textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#6366f1", fontWeight: 700, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .auth-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}