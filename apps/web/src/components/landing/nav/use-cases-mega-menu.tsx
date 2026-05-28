"use client";
import {
  ArrowRight, Sparkles, Layers, Settings, Megaphone, DollarSign,
  GraduationCap, Heart, ShoppingCart, Play, Zap, Rocket, BarChart3,
  Target, Users, PenTool, Code, Cog,
} from "lucide-react";

const IconContainer = ({ icon: Icon, bgColor, iconColor }: { icon: any; bgColor: string; iconColor: string }) => (
  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: bgColor }}>
    <Icon size={20} strokeWidth={1.7} style={{ color: iconColor }} />
  </div>
);

export function UseCasesMegaMenu() {
  const categories = [
    ["Operations", "Streamline workflows and processes", Settings, "#FFF7E8", "#F59E0B"],
    ["Marketing & Sales", "Automate campaigns and grow revenue", Megaphone, "#E9FFF5", "#10B981"],
    ["Finance", "Manage finances, invoicing and budgets", DollarSign, "#FFF2EB", "#FF6600"],
    ["Education", "Teach, learn and manage education", GraduationCap, "#EEF5FF", "#2563EB"],
    ["Healthcare", "Improve patient and wellness outcomes", Heart, "#FFF1F1", "#F97316"],
    ["E-commerce & Retail", "Manage stores and customer experience", ShoppingCart, "#FFF2EB", "#FF6600"],
    ["Entertainment", "Engage audiences and grow communities", Play, "#FFF1F1", "#F97316"],
    ["Productivity", "Build tools for personal and team productivity", Zap, "#E9FFF5", "#10B981"],
  ];

  const roles = [
    ["Founders", "Ship before you pitch.", Rocket, "#FFF2EB", "#FF6600"],
    ["Marketers", "Launch pages in minutes.", BarChart3, "#E9FFF5", "#10B981"],
    ["Sales", "Build and scale revenue", Target, "#FFF1F1", "#F97316"],
    ["Ops", "Tools for workflows", Cog, "#FFF7E8", "#F59E0B"],
    ["Product Managers", "Plan, prioritize and deliver", Layers, "#EEF5FF", "#2563EB"],
    ["People", "HR tools your team loves.", Users, "#F3F4F6", "#6B7280"],
    ["Designers", "Your designs, built.", PenTool, "#FFF1F1", "#F97316"],
    ["Developers", "Build, ship and scale fast.", Code, "#FFF2EB", "#FF6600"],
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 380px", gap: 40,
      padding: "32px 40px", width: "min(1100px, 90vw)",
      background: "#fff", borderRadius: 20, border: "1px solid #EDF1F6",
      boxShadow: "0 8px 40px rgba(10,37,64,.10)",
    }}>
      {/* Column 1 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "#697386", textTransform: "uppercase", marginBottom: 24 }}>
          BY CATEGORY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {categories.map(([title, desc, Icon, bg, color]: any) => (
            <a href="#" key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start", textDecoration: "none", borderRadius: 12, padding: "6px 8px", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0A2540", lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#697386", marginTop: 2 }}>{desc}</div>
              </div>
            </a>
          ))}
        </div>
        <a href="#" style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 6, color: "#FF6600", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
          See all categories <ArrowRight size={14} />
        </a>
      </div>

      {/* Column 2 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "#697386", textTransform: "uppercase", marginBottom: 24 }}>
          BY ROLE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {roles.map(([title, desc, Icon, bg, color]: any) => (
            <a href="#" key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start", textDecoration: "none", borderRadius: 12, padding: "6px 8px", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0A2540", lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#697386", marginTop: 2 }}>{desc}</div>
              </div>
            </a>
          ))}
        </div>
        <a href="#" style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 6, color: "#FF6600", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
          See all roles <ArrowRight size={14} />
        </a>
      </div>

      {/* Right Card */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ background: "#FFF8F4", border: "1px solid #F0ECE7", borderRadius: 20, padding: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #EDF1F6", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <Sparkles size={24} color="#FF6600" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#697386", textTransform: "uppercase", marginBottom: 6 }}>FEATURED</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0A2540" }}>AI CRM Starter</div>
          </div>
          <p style={{ fontSize: 13, color: "#697386", lineHeight: 1.7, marginBottom: 16 }}>
            Manage leads and customer relationships with AI-powered insights
          </p>
          <a href="#" style={{ display: "block", textAlign: "center", background: "#FF6600", color: "#fff", fontWeight: 600, fontSize: 14, padding: "12px", borderRadius: 12, textDecoration: "none" }}>
            Explore template →
          </a>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            ["Use Cases", "Explore all categories and 60+ use cases", Layers, "#FFF2EB", "#FF6600"],
            ["Recently Added", "Latest use cases added this week", Sparkles, "#FFF7E8", "#F59E0B"],
            ["Use Case Templates", "Start from proven templates", ArrowRight, "#E9FFF5", "#10B981"],
          ].map(([title, desc, Icon, bg, color]: any) => (
            <a href="#" key={title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", borderRadius: 12, padding: "6px 8px", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0A2540" }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#697386" }}>{desc}</div>
                </div>
              </div>
              <ArrowRight size={16} color="#697386" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}