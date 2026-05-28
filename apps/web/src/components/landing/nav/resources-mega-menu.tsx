"use client";
import { FileText, HelpCircle, BookOpen, Youtube, ArrowRight, Zap, Code2 } from "lucide-react";

const IconContainer = ({ icon: Icon, bgColor, iconColor }: { icon: any; bgColor: string; iconColor: string }) => (
  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: bgColor }}>
    <Icon size={20} strokeWidth={1.7} style={{ color: iconColor }} />
  </div>
);

export function ResourcesMegaMenu() {
  const resources = [
    ["Docs", "Full platform documentation and guides", FileText, "#FFF2EB", "#FF6600"],
    ["Help Center", "Answers to common questions", HelpCircle, "#FFF7E8", "#F59E0B"],
    ["Blog", "Product updates, tips and stories", BookOpen, "#EEF5FF", "#2563EB"],
    ["Updates", "Latest features and changelog", Zap, "#E9FFF5", "#10B981"],
    ["API Reference", "Full API and SDK reference", Code2, "#F3F4F6", "#6B7280"],
    ["YouTube", "Video tutorials and walkthroughs", Youtube, "#FFF1F1", "#FF0000"],
  ];

  return (
    <div style={{
      padding: "28px 32px", width: 480,
      background: "#fff", borderRadius: 20, border: "1px solid #EDF1F6",
      boxShadow: "0 8px 40px rgba(10,37,64,.10)",
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "#697386", textTransform: "uppercase", marginBottom: 20 }}>
        RESOURCES
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {resources.map(([title, desc, Icon, bg, color]: any) => (
          <a href="#" key={title} style={{ display: "flex", gap: 14, alignItems: "center", textDecoration: "none", borderRadius: 12, padding: "8px 10px", transition: "background .15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0A2540", lineHeight: 1.3 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#697386", marginTop: 2 }}>{desc}</div>
            </div>
            <ArrowRight size={14} color="#D1D5DB" style={{ marginLeft: "auto", flexShrink: 0 }} />
          </a>
        ))}
      </div>
    </div>
  );
}