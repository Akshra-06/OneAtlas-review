"use client";
import {
  Bot, Users, BarChart3, ShoppingCart, FileText, Sparkles,
  TrendingUp, Package, MessageSquare, User, LayoutDashboard,
  Store, Monitor, Workflow, Rocket, Video, ArrowRight,
} from "lucide-react";

const IconContainer = ({ icon: Icon, bgColor, iconColor }: { icon: any; bgColor: string; iconColor: string }) => (
  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: bgColor }}>
    <Icon size={20} strokeWidth={1.7} style={{ color: iconColor }} />
  </div>
);

export function TemplatesMegaMenu() {
  const business = [
    ["Productivity", "Workflows, task systems and business operations", BarChart3, "#FFF2EB", "#FF6600"],
    ["AI Agents", "Autonomous assistants and AI-powered workflows", Bot, "#E9FFF5", "#10B981"],
    ["Internal Tools", "Admin panels, dashboards and company systems", Package, "#EEF5FF", "#2563EB"],
    ["CRM & Sales", "Lead management, outreach and automation", Users, "#FFF1F1", "#F97316"],
    ["Finance", "Billing, analytics and financial management", TrendingUp, "#E9FFF5", "#10B981"],
    ["Ecommerce", "Stores, inventory and marketplace platforms", ShoppingCart, "#FFF2EB", "#FF6600"],
    ["Content & Media", "AI content generation and publishing apps", FileText, "#EEF5FF", "#2563EB"],
    ["Community & Social", "Communities, memberships and engagement platforms", Users, "#FFF7E8", "#F59E0B"],
  ];

  const builds = [
    ["AI Chat Apps", "ChatGPT-style assistants and copilots", MessageSquare, "#FFF2EB", "#FF6600"],
    ["Client Portals", "Customer-facing management systems", User, "#E9FFF5", "#10B981"],
    ["Admin Dashboards", "Analytics and operations interfaces", LayoutDashboard, "#EEF5FF", "#2563EB"],
    ["Marketplace Apps", "Two-sided marketplaces and listings", Store, "#FFF1F1", "#F97316"],
    ["Landing Pages", "Marketing sites and startup launch pages", Monitor, "#FFF7E8", "#F59E0B"],
    ["Automation Systems", "Business workflow automation tools", Workflow, "#F3F4F6", "#6B7280"],
    ["SaaS Starters", "Production-ready SaaS foundations", Rocket, "#FFF2EB", "#FF6600"],
    ["Creator Platforms", "Content, creator and subscription systems", Video, "#E9FFF5", "#10B981"],
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 400px", gap: 40,
      padding: "24px 30px", width: "min(1400px, 90vw)",
      background: "#fff", borderRadius: 20, border: "1px solid #EDF1F6",
      boxShadow: "0 8px 40px rgba(10,37,64,.10)", overflow: "hidden",
    }}>
      {/* Column 1 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "#697386", textTransform: "uppercase", marginBottom: 24 }}>
          BUSINESS & AI
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {business.map(([title, desc, Icon, bg, color]: any) => (
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
      </div>

      {/* Column 2 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "#697386", textTransform: "uppercase", marginBottom: 24 }}>
          POPULAR BUILDS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {builds.map(([title, desc, Icon, bg, color]: any) => (
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
      </div>

      {/* Right Card */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, overflowY: "auto", maxHeight: 600 }}>
        <div style={{ background: "#FFF8F4", border: "1px solid #F0ECE7", borderRadius: 20, padding: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #EDF1F6", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 36, borderRadius: 8, background: "#FFD4B8" }} />)}
              {[1,2,3].map(i => <div key={i} style={{ height: 44, borderRadius: 8, background: "#FFBC8F" }} />)}
            </div>
            <div style={{ height: 10, background: "#FFE8D6", borderRadius: 99, marginBottom: 8 }} />
            <div style={{ height: 10, width: "70%", background: "#FFE8D6", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0A2540", marginBottom: 6 }}>Build production-ready apps</div>
          <p style={{ fontSize: 13, color: "#697386", lineHeight: 1.7, marginBottom: 16 }}>
            Start with templates that scale from prototype to production
          </p>
          <a href="#" style={{ display: "block", textAlign: "center", background: "#FF6600", color: "#fff", fontWeight: 600, fontSize: 14, padding: "12px", borderRadius: 12, textDecoration: "none" }}>
            Use Template →
          </a>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            ["NEW THIS WEEK", Sparkles, "#FFF7E8", "#F59E0B"],
            ["COMPARE ONEATLAS", BarChart3, "#FFF2EB", "#FF6600"],
          ].map(([title, Icon, bg, color]: any) => (
            <a href="#" key={title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", borderRadius: 12, padding: "6px 8px", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0A2540", letterSpacing: ".02em" }}>{title}</div>
              </div>
              <ArrowRight size={16} color="#697386" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}