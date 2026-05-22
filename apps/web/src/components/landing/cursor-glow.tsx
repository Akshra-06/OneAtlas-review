"use client";
import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const el = glowRef.current;
      if (!el) return;
      el.style.left = e.clientX + "px";
      el.style.top = e.clientY + "px";
    };
    document.addEventListener("mousemove", handle);
    return () => document.removeEventListener("mousemove", handle);
  }, []);

  return <div ref={glowRef} className="cursor-glow" />;
}
