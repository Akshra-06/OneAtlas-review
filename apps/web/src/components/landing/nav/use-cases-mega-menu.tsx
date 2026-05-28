"use client";
import {
  ArrowRight, Sparkles, Layers, Settings, Megaphone, DollarSign,
  GraduationCap, Heart, ShoppingCart, Play, Zap, Rocket, BarChart3,
  Target, Users, PenTool, Code, Cog, ChevronRight, FolderOpen,
} from "lucide-react";

const IconContainer = ({ icon: Icon, bgColor, iconColor }: { icon: any; bgColor: string; iconColor: string }) => (
  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: bgColor }}>
    <Icon size={12} strokeWidth={1.8} style={{ color: iconColor }} />
  </div>
);

export function UseCasesMegaMenu() {
  const categories = [
    ["Operations", Settings, "#FFF7E8", "#F59E0B"],
    ["Marketing & Sales", Megaphone, "#E9FFF5", "#10B981"],
    ["Finance", DollarSign, "#FFF2EB", "#FF6600"],
    ["Education", GraduationCap, "#EEF5FF", "#2563EB"],
    ["Healthcare", Heart, "#FFF1F1", "#F97316"],
    ["E-commerce & Retail", ShoppingCart, "#FFF2EB", "#FF6600"],
    ["Entertainment", Play, "#FFF1F1", "#F97316"],
    ["Productivity", Zap, "#E9FFF5", "#10B981"],
  ];

  const roles = [
    ["Founders", Rocket, "#FFF2EB", "#FF6600"],
    ["Marketers", BarChart3, "#E9FFF5", "#10B981"],
    ["Sales", Target, "#FFF1F1", "#F97316"],
    ["Ops", Cog, "#FFF7E8", "#F59E0B"],
    ["Product Managers", Layers, "#EEF5FF", "#2563EB"],
    ["People", Users, "#F3F4F6", "#6B7280"],
    ["Designers", PenTool, "#FFF1F1", "#F97316"],
    ["Developers", Code, "#FFF2EB", "#FF6600"],
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(10,37,64,.10)", border: "1px solid #f1f5f9", width: 420, padding: "10px", display: "grid", gridTemplateColumns: "150px 130px 110px", gap: 4, alignItems: "stretch" }}>
      {/* Column 1 */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid #f8fafc", paddingRight: 4 }}>
        <div>
          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>By Category</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {categories.map(([title, Icon, bg, color]: any) => (
              <div key={title} style={{ display: "flex", gap: 6, alignItems: "center", height: 23, cursor: "pointer", borderRadius: 6, padding: "2px 4px" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
                <div style={{ fontSize: 10.5, fontWeight: 500, color: "#0f172a", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
              </div>
            ))}
          </div>
        </div>
        <button style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 3, color: "#FF6600", fontWeight: 700, fontSize: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          View all <ArrowRight size={10} />
        </button>
      </div>

      {/* Column 2 */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 4 }}>
        <div>
          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>By Role</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {roles.map(([title, Icon, bg, color]: any) => (
              <div key={title} style={{ display: "flex", gap: 6, alignItems: "center", height: 23, cursor: "pointer", borderRadius: 6, padding: "2px 4px" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
                <div style={{ fontSize: 10.5, fontWeight: 500, color: "#0f172a", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
              </div>
            ))}
          </div>
        </div>
        <button style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 3, color: "#FF6600", fontWeight: 700, fontSize: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          View all <ArrowRight size={10} />
        </button>
      </div>

      {/* Column 3 */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", paddingLeft: 2 }}>
        <div style={{ background: "#FFF8F4", border: "1px solid #F0ECE7", borderRadius: 10, padding: 6, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <div style={{ background: "#fff", border: "1px solid #F0ECE7", borderRadius: 6, padding: 6, marginBottom: 6, boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
              <Sparkles size={9} color="#FF6600" style={{ marginBottom: 2 }} />
              <div style={{ fontSize: 7, fontWeight: 700, color: "#94a3b8", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 2 }}>Featured</div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>AI CRM Starter</div>
            </div>
            <p style={{ fontSize: 8.5, color: "#64748b", lineHeight: 1.4, wordBreak: "break-word", overflowWrap: "break-word" }}>Manage leads with</p>
            <p style={{ fontSize: 8.5, color: "#64748b", lineHeight: 1.4, wordBreak: "break-word", overflowWrap: "break-word" }}>AI insights.</p>
          </div>
          <button style={{ width: "100%", height: 20, borderRadius: 6, background: "#FF6600", color: "#fff", fontWeight: 700, fontSize: 9, border: "none", cursor: "pointer", marginTop: 8 }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e65c00")}
            onMouseLeave={e => (e.currentTarget.style.background = "#FF6600")}>
            Explore →
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 2 }}>
          {[["Use Cases", FolderOpen, "#fb923c"], ["Recent", Sparkles, "#fbbf24"], ["Templates", ArrowRight, "#10B981"]].map(([label, Icon, color]: any) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", height: 16 }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 9, color: "#475569" }}>
                <Icon size={9} color={color} /><span>{label}</span>
              </div>
              <ChevronRight size={7} color="#cbd5e1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}