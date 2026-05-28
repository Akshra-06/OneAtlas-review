"use client";
import {
  Database, Zap, Grid, Smartphone, Rocket, Upload, ArrowRight,
  FileText, BookOpen, Code2, Cpu, Shield, Package, Globe, Users, Boxes,
} from "lucide-react";

const IconContainer = ({ icon: Icon, bgColor, iconColor }: { icon: any; bgColor: string; iconColor: string }) => (
  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bgColor }}>
    <Icon className="w-7 h-7" strokeWidth={1.6} style={{ color: iconColor }} />
  </div>
);

export function ProductMegaMenu() {
  const leftItems = [
    ["Backend Platform", "Deploy apps with AI backend", Rocket, "#FFF2EB", "#FF6600"],
    ["Integrations", "Connect external services", Zap, "#E9FFF5", "#10B981"],
    ["Features", "Explore platform capabilities", Grid, "#EEF5FF", "#2563EB"],
    ["Mobile", "Build from mobile", Smartphone, "#FFF1F1", "#F97316"],
    ["Publish", "Deploy instantly", Upload, "#FFF7E8", "#F59E0B"],
  ];

  const tools = [
    ["Database", "Store and manage app data", Database, "#FFF2EB", "#FF6600"],
    ["Functions", "Run scalable server logic", Cpu, "#E9FFF5", "#10B981"],
    ["Auth", "Secure users and authentication", Shield, "#EEF5FF", "#2563EB"],
    ["Storage", "Upload and manage files", Package, "#FFF1F1", "#F97316"],
    ["Edge Runtime", "Deploy globally with low latency", Globe, "#FFF7E8", "#F59E0B"],
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 400px", gap: 40,
      padding: "32px 40px", width: "min(1100px, 90vw)",
      background: "#fff", borderRadius: 20, border: "1px solid #EDF1F6",
      boxShadow: "0 8px 40px rgba(10,37,64,.10)",
    }}>
      {/* Column 1 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "#697386", textTransform: "uppercase", marginBottom: 24 }}>
          EXPLORE PRODUCT
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {leftItems.map(([title, desc, Icon, bg, color]: any) => (
            <a href="#" key={title} style={{ display: "flex", gap: 16, alignItems: "flex-start", textDecoration: "none", borderRadius: 12, padding: "6px 8px", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0A2540", lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#697386", marginTop: 2 }}>{desc}</div>
              </div>
            </a>
          ))}
        </div>
        <a href="#" style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 6, color: "#FF6600", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
          View all product docs <ArrowRight size={14} />
        </a>
      </div>

      {/* Column 2 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "#697386", textTransform: "uppercase", marginBottom: 24 }}>
          POPULAR TOOLS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {tools.map(([title, desc, Icon, bg, color]: any) => (
            <a href="#" key={title} style={{ display: "flex", gap: 16, alignItems: "flex-start", textDecoration: "none", borderRadius: 12, padding: "6px 8px", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0A2540", lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#697386", marginTop: 2 }}>{desc}</div>
              </div>
            </a>
          ))}
        </div>
        <a href="#" style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 6, color: "#FF6600", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
          View all features <ArrowRight size={14} />
        </a>
      </div>

      {/* Right Card */}
      <div style={{ background: "#FFF8F4", border: "1px solid #F0ECE7", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#fff", border: "1px solid #EDF1F6", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex" }}>
            <div style={{ width: 44, borderRight: "1px solid #EDF1F6", background: "#FAFAFA", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "12px 0", borderRadius: "12px 0 0 12px" }}>
              <Globe size={14} color="#697386" />
              <Users size={14} color="#697386" />
              <Boxes size={14} color="#697386" />
              <Database size={14} color="#697386" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #EDF1F6" }}>
                <code style={{ fontSize: 12, lineHeight: 1.8, fontFamily: "JetBrains Mono, monospace" }}>
                  <span style={{ color: "#10B981" }}>SELECT</span> * <span style={{ color: "#FF5996" }}>FROM users</span><br />
                  <span style={{ color: "#2563EB" }}>WHERE</span> created_at<br />
                  &gt; now() - interval '7d';
                </code>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ borderRight: "1px solid #EDF1F6", padding: 12 }}>
                  <div style={{ fontSize: 11, color: "#697386", marginBottom: 8 }}>API Calls</div>
                  <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 50 }}>
                    {[12,18,15,25,22,32].map((v, i) => (
                      <div key={i} style={{ flex: 1, height: v * 1.4, background: "#C4B5FD", borderRadius: 3 }} />
                    ))}
                  </div>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 11, color: "#697386" }}>Requests</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#0A2540", lineHeight: 1.2 }}>13.2K</div>
                  <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>+12.5%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, color: "#0A2540", marginBottom: 6 }}>Start building in minutes</div>
        <div style={{ fontSize: 13, color: "#697386", marginBottom: 16, lineHeight: 1.6 }}>Create production-ready apps with our AI-powered platform</div>

        <a href="/signup" style={{ display: "block", textAlign: "center", background: "#FF6600", color: "#fff", fontWeight: 600, fontSize: 14, padding: "12px", borderRadius: 12, textDecoration: "none", marginBottom: 16 }}>
          Start Building →
        </a>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[["Docs", FileText, "#FF6600"], ["Changelog", BookOpen, "#10B981"], ["API Reference", Code2, "#2563EB"]].map(([label, Icon, color]: any) => (
            <a key={label} href="#" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500, color: "#0A2540", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FF6600")}
              onMouseLeave={e => (e.currentTarget.style.color = "#0A2540")}>
              <Icon size={15} color={color} /> {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
