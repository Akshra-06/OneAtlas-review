"use client";
import { useEffect, useRef, useState } from "react";
import { ModelData } from "./model-data";

// x and y are PERCENTAGES (0–100) of the canvas width/height
// This makes nodes always align with SVG edges on any screen size
const VB_W = 1000;
const VB_H = 480;

const isMobile = false;
const scale = isMobile ? 0.65 : 1;

const layout = [
  { i: 0, xp:  8, yp: 38, r: 30 * scale, z: 0.6 },
  { i: 1, xp: 20, yp: 70, r: 30 * scale, z: 1.0 },
  { i: 2, xp: 29, yp: 18, r: 30 * scale, z: 0.45 },
  { i: 3, xp: 40, yp: 56, r: 30 * scale, z: 0.8 },
  { i: 4, xp: 56, yp: 80, r: 30 * scale, z: 0.4 },
  { i: 5, xp: 58, yp: 22, r: 30 * scale, z: 0.9 },
  { i: 6, xp: 72, yp: 62, r: 30 * scale, z: 0.55 },
  { i: 7, xp: 82, yp: 24, r: 30 * scale, z: 0.75 },
  { i: 8, xp: 90, yp: 72, r: 30 * scale, z: 0.5 },
];

// SVG x/y derived from the same percentages × viewBox size
const svgNodes = layout.map((n) => ({
  x: (n.xp / 100) * VB_W,
  y: (n.yp / 100) * VB_H,
  z: n.z,
}));

const edges = [
  [0,1],[0,2],[1,2],[1,3],[2,3],[3,4],[3,5],[4,6],
  [5,6],[5,7],[6,7],[7,8],[2,5],[1,4],[6,8],
];

const palette = ["#635BFF","#9B6CFB","#FF5996","#FF9173"];

export function ModelsStrip() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const parallax = (z: number) => ({
    dx: (mouse.x - 0.5) * 36 * z,
    dy: (mouse.y - 0.5) * 24 * z,
  });

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        background: "#F5F5EE",
        overflow: "hidden",
        isolation: "isolate",
        padding: "64px 0",
      }}
    >


      {/* Header */}
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", marginBottom: 28, padding: "0 24px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #E5E7EB", padding: "7px 14px 7px 12px", borderRadius: 999, fontSize: 13, fontWeight: 500, color: "#FF6600" }}>
  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6600", boxShadow: "0 0 0 4px rgba(255,102,0,.18)", animation: "pulse 2s ease-in-out infinite", display: "inline-block" }} />
  The Model Universe
</div>
        <h2 style={{ margin: "18px 0 0", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1.05, color: "#111111" }}>
          Every frontier model{" "}
          <span style={{
            color: "#FF6600",
            WebkitTextFillColor: "#FF6600",
          
          }}>
            OneAtlas.
          </span>
        </h2>
      </div>

      {/* Canvas — nodes sit on top of SVG, both use same % coords */}
      <div
        ref={wrapRef}
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(200px, 24vw, 280px)",
          zIndex: 2,
        }}
      >
        {/* SVG edges — uses viewBox matching percentage × VB_W/VB_H */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={palette[0]} stopOpacity="0" />
              <stop offset="50%" stopColor={palette[1]} stopOpacity=".55" />
              <stop offset="100%" stopColor={palette[2]} stopOpacity="0" />
            </linearGradient>
          </defs>
          {edges.map(([a, b], idx) => {
            const A = svgNodes[a], B = svgNodes[b];
            const pA = parallax(A.z), pB = parallax(B.z);
            return (
              <line
                key={idx}
                x1={A.x + pA.dx} y1={A.y + pA.dy}
                x2={B.x + pB.dx} y2={B.y + pB.dy}
                stroke="url(#edgeGrad)"
                strokeWidth="1.2"
                strokeDasharray="3 6"
                style={{ animation: `csDash 6s linear infinite`, animationDelay: `${idx * 0.18}s` }}
              />
            );
          })}
        </svg>

        {/* Nodes — positioned with left/top as percentages to match SVG */}
        {layout.map((pos, idx) => {
          const m = ModelData[pos.i];
          const { dx, dy } = parallax(pos.z);
          const isHover = hovered === idx;
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: `${pos.xp}%`,
                top: `${pos.yp}%`,
                transform: `translate(-50%, -50%)`,
                zIndex: 2,
                cursor: "pointer",
                animation: `none`,
                animationDelay: `${idx * 0.4}s`,
                animationDirection: idx % 2 === 0 ? "alternate" : "alternate-reverse",
                filter: "none",
                transition: "filter .3s",
              }}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{
                width: pos.r * 2,
                height: pos.r * 2,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: `radial-gradient(circle at 30% 30%, ${m.soft}, white 70%)`,
                boxShadow: `0 12px 32px -8px ${m.color}55, 0 0 0 1px ${m.color}22, inset 0 0 0 1px rgba(255,255,255,.9)`,
                color: m.color,
                transform: isHover ? "scale(1.14)" : "scale(1)",
                transition: "transform .4s cubic-bezier(.22,1,.36,1)",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", inset: "-40%",
                  borderRadius: "50%",
                  filter: "blur(18px)",
                  zIndex: -1,
                  opacity: isHover ? 1.4 : 0.9,
                  background: `radial-gradient(circle, ${m.color}33, transparent 70%)`,
                  transition: "opacity .3s",
                }} />
                {m.mark(Math.round(pos.r * 0.85))}
              </div>
              <div style={{
              position: "absolute",
              left: "50%",
              top: "calc(100% + 8px)",
               transform: `translateX(-50%) translateY(${isHover ? "2px" : "0"})`,
                 whiteSpace: "nowrap",
            maxWidth: "80px",
              
                  textOverflow: "ellipsis",
                textAlign: "center",
                transition: "opacity .25s, transform .25s",
                opacity: hovered !== null && !isHover ? 0.75 : 1,
              }}>
                <div style={{ fontSize: "clamp(9px, 2.2vw, 13px)", fontWeight: 700, color: isHover ? "#FF6600" : "#111111", letterSpacing: "-.01em", lineHeight: 1.1, maxWidth: 120, textAlign: "center" }}>
                {m.name}
                </div>
                <div style={{ fontSize: "clamp(8px, 1.8vw, 11px)", color: "#697386", marginTop: 2, fontWeight: 500 }}>
                  {m.vendor}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes csDrift {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(0, 0) scale(1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes csDash { to { stroke-dashoffset: -36; } }
        @keyframes csFloat {
          from { translate: 0 0; }
          to   { translate: 0 0; }
        }
      `}</style>
    </section>
  );
}