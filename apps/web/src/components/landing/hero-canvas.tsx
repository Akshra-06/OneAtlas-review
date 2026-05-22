"use client";
import { useEffect, useRef } from "react";

const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

const PALETTE = [
  "99,91,255",
  "255,89,150",
  "0,212,177",
  "122,115,255",
  "255,177,122",
  "248,188,66",
  "0,212,255",
];

export function HeroCanvas() {
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

    const mouse = { x: -9999, y: -9999 };
    const clicks: { x: number; y: number; r: number; a: number }[] = [];

    const blobs = [
      { x: 0.12, y: 0.25, r: 0.55, vx: 0.00016, vy: 0.0001, c: "99,91,255", a: 0.1, ph: 0 },
      { x: 0.82, y: 0.12, r: 0.5, vx: -0.0002, vy: 0.00013, c: "255,89,150", a: 0.09, ph: 1.5 },
      { x: 0.5, y: 0.85, r: 0.6, vx: 0.00013, vy: -0.0002, c: "0,212,177", a: 0.08, ph: 3 },
      { x: 0.78, y: 0.62, r: 0.42, vx: -0.00011, vy: 0.00019, c: "248,188,66", a: 0.08, ph: 4.5 },
      { x: 0.22, y: 0.65, r: 0.48, vx: 0.00019, vy: -0.00011, c: "122,115,255", a: 0.09, ph: 2 },
    ];

    const pts = Array.from({ length: 60 }, () => {
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      return {
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0002,
        vy: (Math.random() - 0.5) * 0.0002,
        r: 0.9 + Math.random() * 1.6,
        a: 0.18 + Math.random() * 0.42,
        c,
        ph: Math.random() * Math.PI * 2,
        sp: 0.006 + Math.random() * 0.012,
      };
    });

    const getW = () => canvas!.width / DPR;
    const getH = () => canvas!.height / DPR;

    const onMove = (e: MouseEvent) => {
      const r = section!.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
    };
    const onClick = (e: MouseEvent) => {
      const r = section!.getBoundingClientRect();
      clicks.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0, a: 0.55 });
    };
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    section.addEventListener("click", onClick);

    let frame = 0;
    let rafId: number;

    function tick() {
      frame++;
      const W = getW(),
        H = getH();
      ctx!.clearRect(0, 0, W, H);

      // blobs
      blobs.forEach((b) => {
        b.x = (b.x + b.vx + 1) % 1;
        b.y = (b.y + b.vy + 1) % 1;
        if (mouse.x > 0) {
          const dx = mouse.x / W - b.x,
            dy = mouse.y / H - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 0.5) {
            b.x += dx * 0.00005;
            b.y += dy * 0.00005;
          }
        }
        const r = b.r * (1 + 0.05 * Math.sin(frame * 0.008 + b.ph)) * Math.max(W, H);
        const bx = b.x * W,
          by = b.y * H;
        const g = ctx!.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, `rgba(${b.c},${b.a})`);
        g.addColorStop(0.55, `rgba(${b.c},${(b.a * 0.3).toFixed(3)})`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        ctx!.beginPath();
        ctx!.arc(bx, by, r, 0, Math.PI * 2);
        ctx!.fillStyle = g;
        ctx!.fill();
      });

      // dot grid
      const GS = 46;
      for (let gx = 0; gx < W + GS; gx += GS) {
        for (let gy = 0; gy < H + GS; gy += GS) {
          const md = Math.hypot(gx - mouse.x, gy - mouse.y);
          const prox = Math.max(0, 1 - md / 200);
          let nc = blobs[0].c,
            nd = Infinity;
          blobs.forEach((b) => {
            const d = Math.hypot(gx - b.x * W, gy - b.y * H);
            if (d < nd) {
              nd = d;
              nc = b.c;
            }
          });
          const a = 0.055 + prox * 0.4;
          ctx!.beginPath();
          ctx!.arc(gx, gy, prox > 0.2 ? 1.6 : 0.8, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${nc},${Math.min(a, 0.5).toFixed(3)})`;
          ctx!.fill();
        }
      }

      // particles + halos
      pts.forEach((p) => {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        const px = p.x * W,
          py = p.y * H;
        const dx = px - mouse.x,
          dy = py - mouse.y,
          d = Math.hypot(dx, dy);
        if (d < 100 && d > 0) {
          p.x += (dx / d) * 0.001;
          p.y += (dy / d) * 0.001;
        }
        const tw = p.a * (0.65 + 0.35 * Math.sin(frame * p.sp + p.ph));
        const halo = ctx!.createRadialGradient(px, py, 0, px, py, p.r * 6);
        halo.addColorStop(0, `rgba(${p.c},${(tw * 0.45).toFixed(3)})`);
        halo.addColorStop(1, `rgba(${p.c},0)`);
        ctx!.beginPath();
        ctx!.arc(px, py, p.r * 6, 0, Math.PI * 2);
        ctx!.fillStyle = halo;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(px, py, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.c},${Math.min(tw, 0.9).toFixed(3)})`;
        ctx!.fill();
      });

      // connections
      for (let i = 0; i < pts.length; i++) {
        const ax = pts[i].x * W,
          ay = pts[i].y * H;
        for (let j = i + 1; j < pts.length; j++) {
          const bx = pts[j].x * W,
            by = pts[j].y * H;
          const d = Math.hypot(ax - bx, ay - by);
          if (d < 120) {
            ctx!.beginPath();
            ctx!.moveTo(ax, ay);
            ctx!.lineTo(bx, by);
            ctx!.strokeStyle = `rgba(${pts[i].c},${(((1 - d / 120) * 0.08)).toFixed(3)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
        const md = Math.hypot(ax - mouse.x, ay - mouse.y);
        if (md < 150 && mouse.x > 0) {
          ctx!.beginPath();
          ctx!.moveTo(ax, ay);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.strokeStyle = `rgba(${pts[i].c},${(((1 - md / 150) * 0.16)).toFixed(3)})`;
          ctx!.lineWidth = 0.6;
          ctx!.stroke();
        }
      }

      // ripples
      for (let i = clicks.length - 1; i >= 0; i--) {
        const c = clicks[i];
        c.r += 3.5;
        c.a *= 0.93;
        if (c.a < 0.005) {
          clicks.splice(i, 1);
          continue;
        }
        ctx!.beginPath();
        ctx!.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(99,91,255,${c.a.toFixed(3)})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(c.x, c.y, c.r * 0.6, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(255,89,150,${(c.a * 0.55).toFixed(3)})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
      section.removeEventListener("click", onClick);
    };
  }, []);

  return <canvas ref={canvasRef} id="hero-canvas" />;
}
