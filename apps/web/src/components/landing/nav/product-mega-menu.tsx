"use client";
import Link from "next/link";
import {
  Database, Zap, Grid, Smartphone, Rocket, Upload, ArrowRight,
  FileText, BookOpen, Code2, Cpu, Shield, Package, Globe, Users, Boxes,
} from "lucide-react";

const IconContainer = ({ icon: Icon, bgColor, iconColor }: { icon: any; bgColor: string; iconColor: string }) => (
  <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: bgColor }}>
    <Icon size={15} strokeWidth={1.8} style={{ color: iconColor }} />
  </div>
);

export function ProductMegaMenu() {
  const leftItems = [
    ["Backend Platform", Rocket, "#FFF2EB", "#FF6600"],
    ["Integrations", Zap, "#E9FFF5", "#10B981"],
    ["Features", Grid, "#EEF5FF", "#2563EB"],
    ["Mobile", Smartphone, "#FFF1F1", "#F97316"],
    ["Publish", Upload, "#FFF7E8", "#F59E0B"],
  ];

  const tools = [
    ["Database", Database, "#FFF2EB", "#FF6600"],
    ["Functions", Cpu, "#E9FFF5", "#10B981"],
    ["Auth", Shield, "#EEF5FF", "#2563EB"],
    ["Storage", Package, "#FFF1F1", "#F97316"],
    ["Edge Runtime", Globe, "#FFF7E8", "#F59E0B"],
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(10,37,64,.10)", border: "1px solid #f1f5f9", width: 540, padding: "18px", display: "grid", gridTemplateColumns: "180px 170px 140px", gap: 4 }}>
      {/* Column 1 */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid #f8fafc", paddingRight: 4 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>EXPLORE PRODUCT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {leftItems.map(([title, Icon, bg, color]: any) => (
              <div key={title} style={{ display: "flex", gap: 8, alignItems: "center", height: 40, cursor: "pointer", borderRadius: 8, padding: "4px 8px" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
                <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
              </div>
            ))}
          </div>
        </div>
        <Link href="/docs" style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 3, color: "#FF6600", fontWeight: 500, fontSize: 10.5, textDecoration: "none", padding: 0 }}>
  View docs <ArrowRight size={11} />
</Link>
      </div>

      {/* Column 2 */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 4 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>POPULAR TOOLS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {tools.map(([title, Icon, bg, color]: any) => (
              <div key={title} style={{ display: "flex", gap: 8, alignItems: "center", height: 40, cursor: "pointer", borderRadius: 8, padding: "4px 8px" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,102,0,.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <IconContainer icon={Icon} bgColor={bg} iconColor={color} />
                <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
              </div>
            ))}
          </div>
        </div>
        <button style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 3, color: "#FF6600", fontWeight: 500, fontSize: 10.5, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          View features <ArrowRight size={11} />
        </button>
      </div>

      {/* Column 3 */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingLeft: 4 }}>
        <div style={{ background: "#FFF8F4", border: "1px solid #F0ECE7", borderRadius: 10, padding: 8, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <div style={{ background: "#fff", border: "1px solid #F0ECE7", borderRadius: 6, padding: 6, marginBottom: 4, boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>Start building</div>
              <div style={{ fontSize: 8, color: "#94a3b8", marginBottom: 4, lineHeight: 1.2 }}>Build with AI platform</div>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden", maxHeight: 40 }}>
                <div style={{ display: "flex" }}>
                  <div style={{ width: 12, borderRight: "1px solid #e2e8f0", background: "#FAFAFA", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "2px 0" }}>
                    <Globe size={5} color="#94a3b8" />
                    <Users size={5} color="#94a3b8" />
                    <Boxes size={5} color="#94a3b8" />
                  </div>
                  <div style={{ flex: 1, padding: "2px 4px" }}>
                    <code style={{ fontSize: 7, fontFamily: "monospace", display: "block", marginBottom:6 }}>
                      <span style={{ color: "#10B981" }}>SEL</span> * <span style={{ color: "#EC4899" }}>FROM</span>
                    </code>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 5 }}>
                        {[8, 14, 10, 20,11,21].map((v, i) => <div key={i} style={{ width: 4, height: v * 0.4, background: "#C4B5FD", borderRadius: 1 }} />)}
                      </div>
                      <div style={{ fontSize: 8, fontWeight: 700, color: "#0f172a" }}>13K</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button style={{ width: "100%", height: 22, borderRadius: 6, background: "#FF6600", color: "#fff", fontWeight: 500, fontSize: 9.5, border: "none", cursor: "pointer", marginTop: 4 }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e65c00")}
            onMouseLeave={e => (e.currentTarget.style.background = "#FF6600")}>
            Start →
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 2 }}>
          {[["Docs", FileText, "#FF6600", "/docs"], ["Changelog", BookOpen, "#10B981", "/changelog"], ["API", Code2, "#2563EB", "/docs/api-reference"]].map(([label, Icon, color, href]: any) => (
  <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9.5, color: "#475569", cursor: "pointer", textDecoration: "none" }}
    onMouseEnter={e => (e.currentTarget.style.color = "#0f172a")}
    onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
    <Icon size={9.5} color={color} /> {label}
  </Link>
))}
        </div>
      </div>
    </div>
  );
}