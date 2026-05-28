"use client";
import { FileText, HelpCircle, BookOpen, Youtube, Zap, Code2, ArrowRight } from "lucide-react";

const IconContainer = ({ icon: Icon, bgColor, iconColor }: { icon: any; bgColor: string; iconColor: string }) => (
  <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: bgColor, transition: "transform .2s" }}>
    <Icon size={16} strokeWidth={1.5} style={{ color: iconColor }} />
  </div>
);

const items = [
  { label: "Docs", Icon: FileText, bg: "#FFF2EB", color: "#FF6600" },
  { label: "Help Center", Icon: HelpCircle, bg: "#FFF7E8", color: "#F59E0B" },
  { label: "Blog", Icon: BookOpen, bg: "#EEF5FF", color: "#3B82F6" },
  { label: "Updates", Icon: Zap, bg: "#E9FFF5", color: "#10B981" },
  { label: "API Reference", Icon: Code2, bg: "#F3F4F6", color: "#6B7280" },
  { label: "YouTube", Icon: Youtube, bg: "#FFF1F1", color: "#FF0000" },
];

export function ResourcesMegaMenu() {
  return (
    <div style={{ padding: 6, borderRadius: 12, background: "#fff", width: 200, border: "1px solid #E8E5E0", boxShadow: "0 8px 24px rgba(17,17,17,.04)" }}>
      {items.map(({ label, Icon, bg, color }) => (
        <a key={label} href="#" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#111111", textDecoration: "none", transition: "background .15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
          {label}
        </a>
      ))}
    </div>
  );
}