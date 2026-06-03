import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1240px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
        serif: ["var(--font-instrument-serif)", "Instrument Serif", "serif"],
      },
      colors: {
        indigo: {
          DEFAULT: "#635BFF",
          dark: "#0A2540",
          deep: "#1A1F36",
        },
        cream: { DEFAULT: "#F6F9FC", 2: "#EFF3F8" },
        ink: { DEFAULT: "#0A2540", soft: "#425466", mute: "#697386" },
        line: { DEFAULT: "#E3E8EE", soft: "#EDF1F6" },
        coral: { DEFAULT: "#FF5996", soft: "#FFE3EE" },
        peach: { DEFAULT: "#FFB17A", soft: "#FFE9DC" },
        mint: { DEFAULT: "#00D4B1", soft: "#E0FBF4" },
        sky: { DEFAULT: "#00D4FF", deep: "#00B8E6" },
        gold: { DEFAULT: "#F8BC42", soft: "#FFF4DE" },
        violet: "#7A73FF",
        lilac: "#E8E7FF",
        emerald: "#00A37A",
        "grad-1": "#635BFF",
        "grad-2": "#9B6CFB",
        "grad-3": "#FF5996",
        "grad-4": "#FF9173",
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "14px",
        lg: "22px",
        xl: "28px",
        pill: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(10,37,64,.04), 0 1px 1px rgba(10,37,64,.02)",
        DEFAULT: "0 2px 4px rgba(10,37,64,.04), 0 8px 24px rgba(10,37,64,.06)",
        lg: "0 12px 40px rgba(10,37,64,.10), 0 4px 12px rgba(10,37,64,.05)",
      },
      maxWidth: { container: "1240px" },
      keyframes: {
        pulse: {
          "50%": { boxShadow: "0 0 0 7px rgba(99,91,255,.06)" },
        },
        scroll: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        blink: {
          "0%, 80%, 100%": { opacity: "0" },
          "40%": { opacity: "1" },
        },
        stepBlob: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(-20px, 20px) scale(1.12)" },
          "100%": { transform: "translate(10px, -15px) scale(.9)" },
        },
        blobDrift: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(12px,-16px) scale(1.08)" },
          "100%": { transform: "translate(-8px,10px) scale(.94)" },
        },
        pfGradShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        stackFloat: {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-10px)" },
        },
        pfPulseGlow: {
          from: { opacity: ".55", transform: "scale(.95)" },
          to: { opacity: ".85", transform: "scale(1.05)" },
        },
        deployRun: {
          "0%": { left: "-40%" },
          "100%": { left: "100%" },
        },
        pfPulseDot: {
          "50%": { boxShadow: "0 0 0 6px rgba(248,188,66,.08)" },
        },
        pfOrbitSpin: { to: { transform: "rotate(360deg)" } },
        pfOrbitCounter: { to: { transform: "rotate(-360deg)" } },
      },
      animation: {
        pulse: "pulse 2s ease-in-out infinite",
        scroll: "scroll 38s linear infinite",
        spin: "spin 1.2s linear infinite",
        blink: "blink 1.2s infinite",
        "step-blob": "stepBlob 8s ease-in-out infinite alternate",
        "blob-drift": "blobDrift 8s ease-in-out infinite alternate",
        "pf-grad-shift": "pfGradShift 9s ease-in-out infinite",
        "stack-float": "stackFloat 8s ease-in-out infinite alternate",
        "pf-pulse-glow": "pfPulseGlow 6s ease-in-out infinite alternate",
        "deploy-run": "deployRun 2.4s ease-in-out infinite",
        "pf-pulse-dot": "pfPulseDot 1.4s ease-in-out infinite",
        "pf-orbit-spin": "pfOrbitSpin 28s linear infinite",
        "pf-orbit-counter": "pfOrbitCounter 28s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
