"use client";
import { useEffect, useRef } from "react";

const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

const COLS: [number, number, number][] = [
  [138, 43, 226],
  [251, 146, 60],
  [244, 63, 94],
  [20, 184, 166],
  [250, 204, 21],
  [168, 85, 247],
];

export function StepsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const section = canvas.parentElement;
    if (!section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const r = section!.getBoundingClientRect();
      canvas!.width = r.width * DPR;
      canvas!.height = r.height * DPR;
      canvas!.style.width = r.width + "px";
      canvas!.style.height = r.height + "px";
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const blobs = [
      { x: 0.1, y: 0.2, r: 0.5, vx: 0.00014, vy: 0.00009, c: COLS[0].join(","), a: 0.09 },
      { x: 0.85, y: 0.1, r: 0.45, vx: -0.00018, vy: 0.00012, c: COLS[1].join(","), a: 0.09 },
      { x: 0.5, y: 0.8, r: 0.55, vx: 0.00012, vy: -0.00015, c: COLS[2].join(","), a: 0.07 },
      { x: 0.8, y: 0.65, r: 0.4, vx: -0.0001, vy: 0.00014, c: COLS[3].join(","), a: 0.08 },
      { x: 0.25, y: 0.6, r: 0.38, vx: 0.00016, vy: -0.0001, c: COLS[4].join(","), a: 0.07 },
    ];
    const pts = Array.from({ length: 45 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      r: 0.8 + Math.random() * 1.4,
      a: 0.15 + Math.random() * 0.4,
      c: COLS[Math.floor(Math.random() * COLS.length)].join(","),
      ph: Math.random() * Math.PI * 2,
      sp: 0.007 + Math.random() * 0.012,
    }));

    const getW = () => canvas!.width / DPR;
    const getH = () => canvas!.height / DPR;

    let frame = 0;
    let rafId: number;

    function tick() {
      frame++;
      const W = getW(),
        H = getH();
      ctx!.clearRect(0, 0, W, H);
      blobs.forEach((b) => {
        b.x = (b.x + b.vx + 1) % 1;
        b.y = (b.y + b.vy + 1) % 1;
        const bx = b.x * W,
          by = b.y * H,
          br = b.r * Math.max(W, H);
        const g = ctx!.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, `rgba(${b.c},${b.a})`);
        g.addColorStop(0.6, `rgba(${b.c},${(b.a * 0.3).toFixed(3)})`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        ctx!.beginPath();
        ctx!.arc(bx, by, br, 0, Math.PI * 2);
        ctx!.fillStyle = g;
        ctx!.fill();
      });
      const GS = 48;
      for (let gx = 0; gx < W + GS; gx += GS) {
        for (let gy = 0; gy < H + GS; gy += GS) {
          let nc = blobs[0].c,
            nd = Infinity;
          blobs.forEach((b) => {
            const d = Math.hypot(gx - b.x * W, gy - b.y * H);
            if (d < nd) {
              nd = d;
              nc = b.c;
            }
          });
          const a = Math.max(0.04, Math.min(0.18, 70 / nd));
          ctx!.beginPath();
          ctx!.arc(gx, gy, 0.85, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${nc},${a.toFixed(3)})`;
          ctx!.fill();
        }
      }
      pts.forEach((p) => {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        const px = p.x * W,
          py = p.y * H;
        const tw = p.a * (0.65 + 0.35 * Math.sin(frame * p.sp + p.ph));
        const h = ctx!.createRadialGradient(px, py, 0, px, py, p.r * 5);
        h.addColorStop(0, `rgba(${p.c},${(tw * 0.4).toFixed(3)})`);
        h.addColorStop(1, `rgba(${p.c},0)`);
        ctx!.beginPath();
        ctx!.arc(px, py, p.r * 5, 0, Math.PI * 2);
        ctx!.fillStyle = h;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(px, py, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.c},${Math.min(tw, 0.8).toFixed(3)})`;
        ctx!.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        const ax = pts[i].x * W,
          ay = pts[i].y * H;
        for (let j = i + 1; j < pts.length; j++) {
          const bx = pts[j].x * W,
            by = pts[j].y * H,
            d = Math.hypot(ax - bx, ay - by);
          if (d < 100) {
            ctx!.beginPath();
            ctx!.moveTo(ax, ay);
            ctx!.lineTo(bx, by);
            ctx!.strokeStyle = `rgba(${pts[i].c},${(((1 - d / 100) * 0.07)).toFixed(3)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.7,
      }}
    />
  );
}
