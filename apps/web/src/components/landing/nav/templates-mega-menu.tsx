"use client";
import {
  Bot, Users, BarChart3, ShoppingCart, FileText, Sparkles,
  TrendingUp, Package, MessageSquare, User, LayoutDashboard,
  Store, Monitor, Workflow, Rocket, Video, ArrowRight, ChevronRight,
} from "lucide-react";

const IconContainer = ({ icon: Icon, bgColor, iconColor }: { icon: any; bgColor: string; iconColor: string }) => (
  <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: bgColor }}>
    <Icon size={15} strokeWidth={1.6} style={{ color: iconColor }} />
  </div>
);

export function TemplatesMegaMenu() {
  const business = [
    ["Productivity", BarChart3, "#FFF2EB", "#FF6600"],
    ["AI Agents", Bot, "#E9FFF5", "#10B981"],
    ["Internal Tools", Package, "#EEF5FF", "#2563EB"],
    ["CRM & Sales", Users, "#FFF1F1", "#F97316"],
    ["Finance", TrendingUp, "#E9FFF5", "#10B981"],
    ["Ecommerce", ShoppingCart, "#FFF2EB", "#FF6600"],
    ["Content & Media", FileText, "#EEF5FF", "#2563EB"],
    ["Community & Social", Users, "#FFF7E8", "#F59E0B"],
  ];

  const builds = [
    ["AI Chat Apps", MessageSquare, "#FFF2EB", "#FF6600"],
    ["Client Portals", User, "#E9FFF5", "#10B981"],
    ["Admin Dashboards", LayoutDashboard, "#EEF5FF", "#2563EB"],
    ["Marketplace Apps", Store, "#FFF1F1", "#F97316"],
    ["Landing Pages", Monitor, "#FFF7E8", "#F59E0B"],
    ["Automation Systems", Workflow, "#F3F4F6", "#6B7280"],
    ["SaaS Starters", Rocket, "#FFF2EB", "#FF6600"],
    ["Creator Platforms", Video, "#E9FFF5", "#10B981"],
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(10,37,64,.10)", border: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "200px 200px 160px", gap: 24, padding: "10px", alignItems: "stretch" }}>
      {/* Column 1 */}
      <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #f8fafc", paddingRight: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>BUSINESS & AI</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {business.map(([title, Icon, bg, color]: any) => (
            <div key={title} style={{ display: "flex", gap: 8, alignItems: "flex-start", minHeight: 40, cursor: "pointer", borderRadius: 8, padding: "4px 8px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
              <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", lineHeight: 1.3, whiteSpace: "normal", wordBreak: "break-word" }}>{title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2 */}
      <div style={{ display: "flex", flexDirection: "column", paddingRight: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>POPULAR BUILDS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {builds.map(([title, Icon, bg, color]: any) => (
            <div key={title} style={{ display: "flex", gap: 8, alignItems: "flex-start", minHeight: 40, cursor: "pointer", borderRadius: 8, padding: "4px 8px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
              <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", lineHeight: 1.3, whiteSpace: "normal", wordBreak: "break-word"}}>{title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3 */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", paddingLeft: 2 }}>
        <div style={{ background: "#FFF8F4", border: "1px solid #F0ECE7", borderRadius: 10, padding: "10px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ background: "#fff", border: "1px solid #F0ECE7", borderRadius: 6, padding: 6, marginBottom: 6, boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 6 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 16, borderRadius: 4, background: "#FFE0CC" }} />)}
              {[1,2,3].map(i => <div key={i} style={{ height: 20, borderRadius: 4, background: "#FFBC8F" }} />)}
            </div>
            <div style={{ height: 5, background: "#FFE8D6", borderRadius: 99, marginBottom: 4 }} />
            <div style={{ height: 5, width: "70%", background: "#FFE8D6", borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>Build ready apps</div>
            <p style={{ fontSize: 9, color: "#64748b", lineHeight: 1.4, wordBreak:"break-word" }}>Start with templates</p>
            <p style={{ fontSize: 9, color: "#64748b", lineHeight: 1.4, wordBreak:"break-word" }}>that scale to production.</p>
          </div>
          <button style={{ width: "100%", height: 24, borderRadius: 6, background: "#FF6600", color: "#fff", fontWeight: 500, fontSize: 10, border: "none", cursor: "pointer", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e65c00")}
            onMouseLeave={e => (e.currentTarget.style.background = "#FF6600")}>
            Use Template →
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 2 }}>
          {[["NEW", Sparkles, "#fbbf24"], ["COMPARE", BarChart3, "#FF6600"]].map(([label, Icon, color]: any) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 8.5, fontWeight: 700, color: "#475569", letterSpacing: ".05em" }}>
                <Icon size={10} color={color} />{label}
              </div>
              <ChevronRight size={9} color="#cbd5e1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}