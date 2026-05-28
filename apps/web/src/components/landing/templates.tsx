"use client";
import { useState, useEffect, useRef } from "react";
import TEMPLATE_SVGS from "./template-svgs";

/* ─── DATA ─────────────────────────────────────────────── */
interface Template {
  id: string; cat: string; catCls: string; accent: string;
  title: string; desc: string; time: string; team: string;
  filters: string[]; preview: string; glow: string;
}

const FILTERS = ["All","AI Apps","Dashboards","CRM","Internal Tools","Ecommerce","Productivity","Client Apps","Marketplaces"];

const TEMPLATES: Template[] = [
  // ── EXISTING 9 ──
  { id:"ai-support",  cat:"AI APPS",        catCls:"sky",    accent:"#FF6600", title:"AI Support Agent",          desc:"Resolves tickets autonomously — queue, live status, priority, and AI replies.",         time:"~2 min", team:"2–20", filters:["AI Apps"],        preview:"support",   glow:"" },
  { id:"kpi",         cat:"DASHBOARDS",     catCls:"coral",  accent:"#FF6600", title:"KPI Dashboard",             desc:"Live charts, KPI tiles, and date-range filters — MAU, growth %, and revenue.",          time:"~1 min", team:"Any",  filters:["Dashboards"],     preview:"bars",      glow:"" },
  { id:"crm",         cat:"CRM",            catCls:"indigo", accent:"#FF6600", title:"Sales Pipeline CRM",        desc:"Kanban pipeline with contacts, deal values, and AI lead scoring built in.",               time:"~2 min", team:"2–50", filters:["CRM"],             preview:"kanban",    glow:"" },
  { id:"admin",       cat:"INTERNAL TOOLS", catCls:"gold",   accent:"#FF6600", title:"Admin Panel",               desc:"Manage users, roles, and permissions with live toggles and search filtering.",            time:"~2 min", team:"IT",   filters:["Internal Tools"], preview:"admin",     glow:"" },
  { id:"inventory",   cat:"ECOMMERCE",      catCls:"mint",   accent:"#FF6600", title:"Inventory Manager",         desc:"Track SKUs, monitor stock levels, and trigger reorder alerts automatically.",            time:"~2 min", team:"5+",   filters:["Ecommerce"],      preview:"inventory", glow:"" },
  { id:"approval",    cat:"INTERNAL TOOLS", catCls:"peach",  accent:"#FF6600", title:"Approval Workflow",         desc:"Multi-step approvals with escalation rules, Slack alerts, and SLA timers.",              time:"~3 min", team:"Any",  filters:["Internal Tools"], preview:"flow",      glow:"" },
  { id:"pm",          cat:"PRODUCTIVITY",   catCls:"violet", accent:"#FF6600", title:"Project Management Tool",   desc:"Sprints, tasks, deadlines, and assignees — keep the team aligned and shipping.",         time:"~2 min", team:"3–30", filters:["Productivity"],    preview:"checklist", glow:"" },
  { id:"portal",      cat:"CLIENT APPS",    catCls:"sky",    accent:"#FF6600", title:"Customer Portal",           desc:"Self-serve hub for clients — order tracking, document access, and requests.",            time:"~2 min", team:"Any",  filters:["Client Apps"],    preview:"portal",    glow:"" },
  // { id:"saas",        cat:"DASHBOARDS",     catCls:"coral",  accent:"#FF6600", title:"SaaS Analytics Dashboard",  desc:"Track MRR, churn, active users, and growth metrics in one live view.",                   time:"~1 min", team:"Any",  filters:["Dashboards"],     preview:"saas",      glow:"" },

  // ── AI APPS ──
  { id:"ai-chatbot",      cat:"AI APPS", catCls:"sky",   accent:"#FF6600", title:"AI Chatbot",              desc:"Conversational AI with flow builder, NLP routing, and live handoff.",           time:"~2 min", team:"Any",  filters:["AI Apps"], preview:"dashboard", glow:"" },
  { id:"ai-research",     cat:"AI APPS", catCls:"sky",   accent:"#FF6600", title:"AI Research Assistant",   desc:"Search knowledge bases, academic papers, and internal docs with AI.",            time:"~2 min", team:"Any",  filters:["AI Apps"], preview:"dashboard", glow:"" },
  { id:"ai-workflow",     cat:"AI APPS", catCls:"sky",   accent:"#FF6600", title:"AI Workflow Copilot",     desc:"Automate data pipelines, content generation, and AI task queues.",               time:"~3 min", team:"Any",  filters:["AI Apps"], preview:"dashboard", glow:"" },
  { id:"ai-document",     cat:"AI APPS", catCls:"sky",   accent:"#FF6600", title:"AI Document Analyzer",    desc:"OCR, entity extraction, risk flags, and compliance checks on any document.",     time:"~2 min", team:"Any",  filters:["AI Apps"], preview:"dashboard", glow:"" },
  { id:"ai-content",      cat:"AI APPS", catCls:"sky",   accent:"#FF6600", title:"AI Content Generator",    desc:"Write blog posts, emails, social posts, and scripts with AI assistance.",        time:"~1 min", team:"Any",  filters:["AI Apps"], preview:"dashboard", glow:"" },

  // ── DASHBOARDS ──
  { id:"saas-analytics",  cat:"DASHBOARDS", catCls:"coral", accent:"#FF6600", title:"SaaS Analytics",        desc:"MRR, churn rate, NPS, active users, and feature adoption in one view.",         time:"~1 min", team:"Any",  filters:["Dashboards"], preview:"dashboard", glow:"" },
  { id:"revenue-tracker", cat:"DASHBOARDS", catCls:"coral", accent:"#FF6600", title:"Revenue Tracker",       desc:"Total revenue, quarterly breakdown, invoices, and channel performance.",        time:"~1 min", team:"Any",  filters:["Dashboards"], preview:"dashboard", glow:"" },
  { id:"marketing-ana",   cat:"DASHBOARDS", catCls:"coral", accent:"#FF6600", title:"Marketing Analytics",   desc:"Campaign ROI, audience growth, social channels, and marketing KPIs.",          time:"~1 min", team:"Any",  filters:["Dashboards"], preview:"dashboard", glow:"" },
  { id:"exec-reports",    cat:"DASHBOARDS", catCls:"coral", accent:"#FF6600", title:"Executive Reports",     desc:"Net revenue, gross margin, EBITDA, and department performance at a glance.",    time:"~1 min", team:"Any",  filters:["Dashboards"], preview:"dashboard", glow:"" },
  { id:"live-monitor",    cat:"DASHBOARDS", catCls:"coral", accent:"#FF6600", title:"Live Monitoring",        desc:"Real-time activity, weekly trends, completion rate, and active users.",         time:"~1 min", team:"Any",  filters:["Dashboards"], preview:"dashboard", glow:"" },

  // ── CRM ──
  { id:"lead-tracker",    cat:"CRM", catCls:"indigo", accent:"#FF6600", title:"Lead Tracker",              desc:"Score, track, and manage leads through your sales funnel automatically.",       time:"~2 min", team:"2–50", filters:["CRM"], preview:"dashboard", glow:"" },
  { id:"client-mgmt",     cat:"CRM", catCls:"indigo", accent:"#FF6600", title:"Client Management",         desc:"Manage contacts, accounts, and relationships with full CRM functionality.",     time:"~2 min", team:"2–50", filters:["CRM"], preview:"dashboard", glow:"" },
  { id:"cs-dashboard",    cat:"CRM", catCls:"indigo", accent:"#FF6600", title:"Customer Success Dashboard", desc:"Track NPS, health scores, renewals, and customer success metrics.",            time:"~2 min", team:"CS",   filters:["CRM"], preview:"dashboard", glow:"" },
  { id:"deal-mgmt",       cat:"CRM", catCls:"indigo", accent:"#FF6600", title:"Deal Management Tool",      desc:"Forecast deals, track pipeline stages, and manage sales operations.",           time:"~2 min", team:"Sales",filters:["CRM"], preview:"dashboard", glow:"" },
  { id:"proposal-gen",    cat:"CRM", catCls:"indigo", accent:"#FF6600", title:"Proposal Generator",        desc:"Create, send, and track proposals and quotes with e-signature support.",        time:"~2 min", team:"Sales",filters:["CRM"], preview:"dashboard", glow:"" },

  // ── INTERNAL TOOLS ──
  { id:"team-workspace",  cat:"INTERNAL TOOLS", catCls:"gold", accent:"#FF6600", title:"Team Workspace",       desc:"Shared workspace for collaboration, wikis, tasks, and team communication.",   time:"~2 min", team:"Any",  filters:["Internal Tools"], preview:"dashboard", glow:"" },
  { id:"ops-tracker",     cat:"INTERNAL TOOLS", catCls:"gold", accent:"#FF6600", title:"Operations Tracker",   desc:"Track ops KPIs, workflows, and business processes in real time.",              time:"~2 min", team:"Ops",  filters:["Internal Tools"], preview:"dashboard", glow:"" },
  { id:"resource-plan",   cat:"INTERNAL TOOLS", catCls:"gold", accent:"#FF6600", title:"Resource Planner",     desc:"Plan, allocate, and schedule resources across projects and teams.",           time:"~2 min", team:"Any",  filters:["Internal Tools"], preview:"dashboard", glow:"" },
  { id:"knowledge-base",  cat:"INTERNAL TOOLS", catCls:"gold", accent:"#FF6600", title:"Company Knowledge Base",desc:"Centralized wiki, docs, and knowledge management for your team.",           time:"~2 min", team:"Any",  filters:["Internal Tools"], preview:"dashboard", glow:"" },

  // ── ECOMMERCE ──
  { id:"order-tracking",  cat:"ECOMMERCE", catCls:"mint", accent:"#FF6600", title:"Order Tracking System",   desc:"Track orders, shipments, and logistics with real-time status updates.",        time:"~2 min", team:"5+",   filters:["Ecommerce"], preview:"dashboard", glow:"" },
  { id:"product-catalog", cat:"ECOMMERCE", catCls:"mint", accent:"#FF6600", title:"Product Catalog",          desc:"Manage products, categories, pricing, and inventory in one place.",           time:"~2 min", team:"5+",   filters:["Ecommerce"], preview:"dashboard", glow:"" },
  { id:"supplier-portal", cat:"ECOMMERCE", catCls:"mint", accent:"#FF6600", title:"Supplier Portal",          desc:"B2B portal for suppliers to manage orders, invoices, and communications.",    time:"~2 min", team:"5+",   filters:["Ecommerce"], preview:"dashboard", glow:"" },
  { id:"retail-dash",     cat:"ECOMMERCE", catCls:"mint", accent:"#FF6600", title:"Retail Dashboard",         desc:"Sales analytics, inventory levels, and retail performance metrics.",          time:"~1 min", team:"Any",  filters:["Ecommerce"], preview:"dashboard", glow:"" },
  { id:"subscription",    cat:"ECOMMERCE", catCls:"mint", accent:"#FF6600", title:"Subscription Storefront",  desc:"Manage subscriptions, billing cycles, and SaaS storefronts.",                 time:"~2 min", team:"Any",  filters:["Ecommerce"], preview:"dashboard", glow:"" },

  // ── PRODUCTIVITY ──
  { id:"task-tracker",    cat:"PRODUCTIVITY", catCls:"violet", accent:"#FF6600", title:"Task Tracker",          desc:"Track tasks, goals, and progress across teams and projects.",                time:"~1 min", team:"Any",  filters:["Productivity"], preview:"dashboard", glow:"" },
  { id:"sprint-planner",  cat:"PRODUCTIVITY", catCls:"violet", accent:"#FF6600", title:"Sprint Planner",        desc:"Plan agile sprints, manage backlogs, and track velocity.",                   time:"~2 min", team:"3–20", filters:["Productivity"], preview:"dashboard", glow:"" },
  { id:"notes-workspace", cat:"PRODUCTIVITY", catCls:"violet", accent:"#FF6600", title:"Notes Workspace",       desc:"Personal and team notes, wikis, and knowledge management.",                  time:"~1 min", team:"Any",  filters:["Productivity"], preview:"dashboard", glow:"" },
  { id:"calendar-mgr",    cat:"PRODUCTIVITY", catCls:"violet", accent:"#FF6600", title:"Calendar Manager",      desc:"Schedule events, manage calendars, and coordinate team availability.",       time:"~1 min", team:"Any",  filters:["Productivity"], preview:"dashboard", glow:"" },
  { id:"collab-hub",      cat:"PRODUCTIVITY", catCls:"violet", accent:"#FF6600", title:"Team Collaboration Hub", desc:"Centralized hub for team communication, files, and project updates.",      time:"~2 min", team:"Any",  filters:["Productivity"], preview:"dashboard", glow:"" },

  // ── CLIENT APPS ──
  { id:"employee-dash",   cat:"CLIENT APPS", catCls:"sky", accent:"#FF6600", title:"Employee Dashboard",      desc:"HR portal for employees — payslips, leave, tasks, and announcements.",       time:"~2 min", team:"HR",   filters:["Client Apps"], preview:"dashboard", glow:"" },
  { id:"vendor-workspace",cat:"CLIENT APPS", catCls:"sky", accent:"#FF6600", title:"Vendor Workspace",        desc:"B2B workspace for vendors to manage orders, docs, and communications.",      time:"~2 min", team:"Any",  filters:["Client Apps"], preview:"dashboard", glow:"" },
  { id:"member-app",      cat:"CLIENT APPS", catCls:"sky", accent:"#FF6600", title:"Member App",              desc:"Membership portal with profiles, benefits, and community features.",         time:"~2 min", team:"Any",  filters:["Client Apps"], preview:"dashboard", glow:"" },
  { id:"partner-hub",     cat:"CLIENT APPS", catCls:"sky", accent:"#FF6600", title:"Partner Hub",             desc:"Collaboration hub for partners — deals, resources, and communications.",     time:"~2 min", team:"Any",  filters:["Client Apps"], preview:"dashboard", glow:"" },
  { id:"onboarding-app",  cat:"CLIENT APPS", catCls:"sky", accent:"#FF6600", title:"Client Onboarding App",   desc:"Streamlined onboarding workflow for new clients with tasks and docs.",        time:"~2 min", team:"Any",  filters:["Client Apps"], preview:"dashboard", glow:"" },

  // ── MARKETPLACES ──
  { id:"job-marketplace",  cat:"MARKETPLACES", catCls:"mint", accent:"#FF6600", title:"Job Marketplace",       desc:"Post jobs, manage applications, and hire candidates in one platform.",        time:"~2 min", team:"Any",  filters:["Marketplaces"], preview:"dashboard", glow:"" },
  { id:"freelancer-platform",cat:"MARKETPLACES",catCls:"mint", accent:"#FF6600", title:"Freelancer Platform",  desc:"Connect freelancers with clients — gigs, proposals, and payments.",           time:"~2 min", team:"Any",  filters:["Marketplaces"], preview:"dashboard", glow:"" },
  { id:"vendor-marketplace",cat:"MARKETPLACES", catCls:"mint", accent:"#FF6600", title:"Vendor Marketplace",   desc:"B2B marketplace for vendors, buyers, and product listings.",                  time:"~2 min", team:"Any",  filters:["Marketplaces"], preview:"dashboard", glow:"" },
  { id:"booking-platform", cat:"MARKETPLACES", catCls:"mint", accent:"#FF6600", title:"Booking Platform",      desc:"Schedule and manage bookings, availability, and service listings.",           time:"~2 min", team:"Any",  filters:["Marketplaces"], preview:"dashboard", glow:"" },
  { id:"service-directory",cat:"MARKETPLACES", catCls:"mint", accent:"#FF6600", title:"Service Directory",     desc:"Searchable directory of services, providers, and listings.",                  time:"~1 min", team:"Any",  filters:["Marketplaces"], preview:"dashboard", glow:"" },
  { id:"community-mkt",    cat:"MARKETPLACES", catCls:"mint", accent:"#FF6600", title:"Community Marketplace", desc:"Peer-to-peer marketplace for community buying, selling, and trading.",       time:"~2 min", team:"Any",  filters:["Marketplaces"], preview:"dashboard", glow:"" },
];

const LAUNCH_STEPS = [
  { label:"Creating workspace", t:600 },
  { label:"Provisioning database", t:900 },
  { label:"Seeding sample data", t:800 },
  { label:"Wiring auth & roles", t:700 },
  { label:"Ready to open", t:400 },
];

/* ─── HELPERS ───────────────────────────────────────────── */
function LiveTag({ label }: { label: string }) {
  return (
    <span style={{ position:"absolute", top:12, right:12, zIndex:5, display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,.9)", border:"1px solid #EDF1F6", padding:"3px 8px 3px 6px", borderRadius:999, fontSize:9.5, fontWeight:700, letterSpacing:".08em", color:"#697386", backdropFilter:"blur(6px)" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:"#00D4B1", boxShadow:"0 0 0 3px rgba(0,212,177,.2)", animation:"tplPulse 1.6s ease-in-out infinite", display:"inline-block" }} />
      {label}
    </span>
  );
}

/* ─── PREVIEW COMPONENTS ────────────────────────────────── */
function KanbanPreview({ hover }: { hover: boolean }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(hover);
  useEffect(() => { hoverRef.current = hover; }, [hover]);

  const [cols, setCols] = useState([
    { label:"Lead",   count:2, cards:[{cls:"indigo",who:"Aria Tech",amt:"$24.5k"},{cls:"violet",who:"Northwind",amt:"$18.2k"}] },
    { label:"Active", count:2, cards:[{cls:"coral",who:"Lumen Co.",amt:"$42.8k"},{cls:"sky",who:"Mosaic",amt:"$31.0k"}] },
    { label:"Won",    count:1, cards:[{cls:"mint",who:"Helix",amt:"$56.4k"}] },
  ]);
  const [cursorPos, setCursorPos] = useState({ left:"50%", top:"60%" });
  const [kpis] = useState([{l:"Pipeline",v:"$284k"},{l:"Closing",v:"12"},{l:"Win Rate",v:"38%"}]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCols(prev => {
        const next = prev.map(c => ({ ...c, cards: [...c.cards] }));
        const allCards: { card: typeof next[0]["cards"][0]; colIdx: number }[] = [];
        next.forEach((col, ci) => col.cards.forEach(card => allCards.push({ card, colIdx: ci })));
        if (!allCards.length) return prev;
        const picked = allCards[Math.floor(Math.random() * allCards.length)];
        const dir = Math.random() < 0.7 ? 1 : -1;
        const newColIdx = Math.min(next.length - 1, Math.max(0, picked.colIdx + dir));
        if (newColIdx === picked.colIdx) return prev;
        next[picked.colIdx].cards = next[picked.colIdx].cards.filter(c => c !== picked.card);
        next[newColIdx].cards.push(picked.card);
        next.forEach(c => { c.count = c.cards.length; });
        return next;
      });
      setCursorPos({ left: (20 + Math.random() * 60) + "%", top: (20 + Math.random() * 60) + "%" });
    }, hoverRef.current ? 1500 : 2400);
    return () => clearInterval(interval);
  }, []);

  const colColors: Record<string, string> = { indigo:"#635BFF", coral:"#FF5996", mint:"#00D4B1", gold:"#F8BC42", violet:"#7A73FF", sky:"#00C2E8" };

  return (
    <div ref={previewRef} style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", gap:8 }}>
      <LiveTag label="LIVE PIPELINE" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, height:128 }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ background:"rgba(255,255,255,.7)", border:"1px solid #EDF1F6", borderRadius:10, padding:"8px 8px 6px", display:"flex", flexDirection:"column", gap:6, backdropFilter:"blur(6px)" }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", color:"#697386", textTransform:"uppercase", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>{col.label}</span>
              <span style={{ background:"#EFF3F8", color:"#425466", padding:"1px 5px", borderRadius:99, fontSize:9, minWidth:14, textAlign:"center", transition:"all .3s" }}>{col.count}</span>
            </div>
            {col.cards.map((card, ki) => (
              <div key={ki} style={{ background:"#fff", border:`1px solid #EDF1F6`, borderLeft:`3px solid ${colColors[card.cls] || "#635BFF"}`, borderRadius:6, padding:"5px 7px", fontSize:10, color:"#0A2540", boxShadow:"0 1px 2px rgba(10,37,64,.04)", display:"flex", flexDirection:"column", gap:1, transition:"transform .55s cubic-bezier(.22,1,.36,1)" }}>
                <span style={{ fontSize:9, color:"#697386", lineHeight:1.1 }}>{card.who}</span>
                <span style={{ fontWeight:700, fontSize:10.5 }}>{card.amt}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:6, marginTop:8 }}>
        {kpis.map(k => (
          <div key={k.l} style={{ flex:1, background:"rgba(255,255,255,.7)", border:"1px solid #EDF1F6", borderRadius:8, padding:"6px 8px" }}>
            <div style={{ fontSize:9, color:"#697386", letterSpacing:".06em", textTransform:"uppercase", fontWeight:600, lineHeight:1 }}>{k.l}</div>
            <div style={{ fontSize:13, fontWeight:800, color:"#0A2540", letterSpacing:"-.02em", lineHeight:1.2, marginTop:2 }}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{ position:"absolute", ...cursorPos, width:14, height:18, zIndex:7, pointerEvents:"none", filter:"drop-shadow(0 2px 4px rgba(0,0,0,.15))", transition:"left .9s cubic-bezier(.4,0,.2,1), top .9s cubic-bezier(.4,0,.2,1)" }}>
        <svg viewBox="0 0 14 18" style={{ width:"100%", height:"100%" }}><path d="M2 1 L2 14 L5 11 L7 16 L9 15 L7 10 L11 10 Z" fill="#fff" stroke="#0A2540" strokeWidth="1"/></svg>
      </div>
    </div>
  );
}

function FlowPreview({ hover }: { hover: boolean }) {
  const hoverRef = useRef(hover);
  useEffect(() => { hoverRef.current = hover; }, [hover]);
  const [pos, setPos] = useState(1);
  const labels = ["Submit","Manager","Finance","Paid"];

  useEffect(() => {
    const interval = setInterval(() => {
      setPos(p => { const n = p + 1; return n >= 4 ? 1 : n; });
    }, hoverRef.current ? 1300 : 2200);
    return () => clearInterval(interval);
  }, []);

  const fillWidth = (pos / 3 * 100) + "%";
  return (
    <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", gap:12 }}>
      <LiveTag label="4 IN QUEUE" />
      <div style={{ background:"#fff", border:"1px solid #EDF1F6", borderRadius:9, padding:"8px 10px", display:"flex", alignItems:"center", gap:8, fontSize:11 }}>
        <span style={{ width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#FFB17A,#FF5996)", display:"grid", placeItems:"center", color:"#fff", fontSize:10, fontWeight:700 }}>M</span>
        <span style={{ fontWeight:600, color:"#0A2540", flex:1, fontSize:11 }}>Maya P. · Q4 software stack</span>
        <span style={{ fontWeight:700, fontFamily:"JetBrains Mono,monospace", fontSize:11 }}>$1,840</span>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", color:"#FF5996", padding:"2px 6px", background:"#FFE3EE", borderRadius:5 }}>Step {pos+1}/4</span>
      </div>
      <div style={{ position:"relative", height:34, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 6px" }}>
        <div style={{ position:"absolute", left:18, right:18, top:"50%", height:2, background:"#E3E8EE", borderRadius:2, transform:"translateY(-50%)" }}/>
        <div style={{ position:"absolute", left:18, top:"50%", height:2, width:fillWidth, background:"linear-gradient(90deg,#FFB17A,#FF5996)", borderRadius:2, transform:"translateY(-50%)", transition:"width 1.4s cubic-bezier(.4,0,.2,1)" }}/>
        <div style={{ position:"absolute", top:"50%", left:18, transform:"translate(-50%,-50%)", width:10, height:10, borderRadius:"50%", background:"radial-gradient(circle,#fff,#F8BC42)", boxShadow:"0 0 0 3px rgba(248,188,66,.4), 0 0 12px rgba(248,188,66,.6)", zIndex:2, animation:"tplTokenSlide 5s linear infinite" }}/>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:26, height:26, borderRadius:"50%", background: i<pos ? "linear-gradient(135deg,#FFB17A,#FF5996)" : "#fff", border: i<pos ? "transparent" : i===pos ? "2px solid #FF5996" : "2px solid #E3E8EE", display:"grid", placeItems:"center", fontSize:10, fontWeight:700, color: i<pos ? "#fff" : i===pos ? "#FF5996" : "#697386", position:"relative", zIndex:1, boxShadow: i===pos ? "0 0 0 4px rgba(255,89,150,.16)" : undefined, transition:"all .35s" }}>
            {i < pos ? "✓" : i+1}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9.5, color:"#697386", fontWeight:500 }}>
        {labels.map((l, i) => <span key={l} style={{ flex:1, textAlign:"center", color: i===pos ? "#FF5996" : undefined, fontWeight: i===pos ? 700 : undefined }}>{l}</span>)}
      </div>
      <div style={{ display:"flex", gap:6 }}>
        {[{l:"Pending",v:"7"},{l:"Auto-approved",v:"42"},{l:"Avg",v:"4h"}].map(s => (
          <div key={s.l} style={{ flex:1, background:"rgba(255,255,255,.7)", border:"1px solid #EDF1F6", borderRadius:8, padding:"5px 8px" }}>
            <div style={{ fontSize:9, color:"#697386", letterSpacing:".06em", textTransform:"uppercase", fontWeight:600, lineHeight:1 }}>{s.l}</div>
            <div style={{ fontSize:12, fontWeight:800, color:"#0A2540", marginTop:2 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const BAR_TARGETS = [40,55,30,68,45,82,68];
function BarsPreview({ hover }: { hover: boolean }) {
  const hoverRef = useRef(hover);
  useEffect(() => { hoverRef.current = hover; }, [hover]);
  const [heights, setHeights] = useState(BAR_TARGETS.map(() => 0));
  const [tipIdx, setTipIdx] = useState(5);

  useEffect(() => {
    setTimeout(() => setHeights(BAR_TARGETS), 100);
    const interval = setInterval(() => {
      setHeights(BAR_TARGETS.map(t => Math.max(18, Math.min(95, t + (Math.random()-0.5)*14))));
      setTipIdx(p => (p+1) % BAR_TARGETS.length);
    }, hoverRef.current ? 900 : 1700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:8, position:"relative" }}>
      <LiveTag label="STREAMING" />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:9.5, color:"#697386", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", lineHeight:1 }}>Monthly Active Users</div>
          <div style={{ fontSize:18, fontWeight:800, color:"#0A2540", letterSpacing:"-.02em", lineHeight:1.1, marginTop:2 }}>42,180</div>
        </div>
        <div style={{ fontSize:10, color:"#00A37A", fontWeight:700, background:"#E0FBF4", padding:"2px 6px", borderRadius:5, display:"inline-flex", alignItems:"center", gap:3, marginTop:4 }}>↑ 12.4%</div>
      </div>
      <div style={{ position:"relative", flex:1, minHeight:0 }}>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"flex-end", gap:5, padding:"0 0 4px" }}>
          {heights.map((h, i) => (
            <div key={i} style={{ flex:1, height: h+"%", borderRadius:"5px 5px 2px 2px", background: i===5 ? "linear-gradient(180deg,#FF5996,#FF9173)" : i<=3 ? "linear-gradient(180deg,#FFC8DC,#FFE3EE)" : "linear-gradient(180deg,#FF5996,#FF8AB1)", transition:"height .8s cubic-bezier(.34,1.56,.64,1)" }}/>
          ))}
        </div>
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
          <path d="M3,46 L17,38 L31,50 L45,28 L58,40 L72,12 L86,22" fill="none" stroke="#635BFF" strokeWidth="1.8" strokeDasharray="200" strokeDashoffset="200" style={{ animation:"tplLineDraw 2.4s cubic-bezier(.4,0,.2,1) forwards", filter:"drop-shadow(0 2px 6px rgba(99,91,255,.25))" }}/>
          {[3,17,31,45,58,72,86].map((x,i) => (
            <circle key={i} cx={x} cy={[46,38,50,28,40,12,22][i]} r="1.6" fill="#fff" stroke="#635BFF" strokeWidth="1.5" style={{ opacity:0, animation:`tplDotFade .4s forwards ${0.4+i*0.18}s` }}/>
          ))}
        </svg>
        <div style={{ position:"absolute", background:"#0A2540", color:"#fff", fontSize:10, fontWeight:600, padding:"3px 7px", borderRadius:5, pointerEvents:"none", transform:"translate(-50%,-110%)", whiteSpace:"nowrap", fontFamily:"JetBrains Mono,monospace", left:((tipIdx+.5)/heights.length*100)+"%", bottom:heights[tipIdx]+"%", transition:"left 1.6s cubic-bezier(.4,0,.2,1), bottom .4s", zIndex:3 }}>
          {Math.round(heights[tipIdx])}
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9.5, color:"#697386", fontFamily:"JetBrains Mono,monospace" }}>
        <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
      </div>
    </div>
  );
}

function InventoryPreview({ hover }: { hover: boolean }) {
  const hoverRef = useRef(hover);
  useEffect(() => { hoverRef.current = hover; }, [hover]);
  const [widths, setWidths] = useState([0,0,0]);
  const [alertIdx, setAlertIdx] = useState(2);
  const targets = [86,48,18];

  useEffect(() => {
    setTimeout(() => setWidths(targets), 300);
    const interval = setInterval(() => {
      const i = Math.floor(Math.random()*3);
      setWidths(prev => { const n=[...prev]; n[i]=Math.max(8,Math.min(98,targets[i]+(Math.random()-.5)*22)); return n; });
      if (Math.random()<.35) setAlertIdx(p => (p+1)%3);
    }, hoverRef.current ? 1000 : 1800);
    return () => clearInterval(interval);
  }, []);

  const rows = [
    { sku:"A-1284", name:"Walnut Desk · oak", count:"1,240" },
    { sku:"A-0931", name:"Mesh Chair v2", count:"580" },
    { sku:"A-7522", name:"Standing Riser · alu", count:"120" },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
      <LiveTag label="3,420 SKUs" />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6, marginTop:4 }}>
        <span style={{ fontSize:9.5, color:"#697386", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase" }}>Stock Levels</span>
        <span style={{ fontSize:11, fontWeight:700, color:"#0A2540", fontFamily:"JetBrains Mono,monospace" }}>1,240 units</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {rows.map((row,i) => (
          <div key={row.sku} style={{ background: i===alertIdx ? "linear-gradient(90deg,#FFE3EE 0%, #fff 60%)" : "#fff", border:`1px solid ${i===alertIdx?"rgba(255,89,150,.3)":"#EDF1F6"}`, borderRadius:8, padding:"7px 9px", display:"flex", alignItems:"center", gap:8, fontSize:11, position:"relative", overflow:"hidden" }}>
            <span style={{ background:"#E0FBF4", color:"#00A37A", fontFamily:"JetBrains Mono,monospace", fontSize:9.5, fontWeight:600, padding:"2px 6px", borderRadius:4, flexShrink:0 }}>{row.sku}</span>
            <span style={{ fontWeight:600, color:"#0A2540", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:10.5, paddingRight: i===alertIdx ? 84 : 0 }}>{row.name}</span>
            <span style={{ width:54, height:5, background:"#EFF3F8", borderRadius:99, overflow:"hidden", flexShrink:0, position:"relative" }}>
              <span style={{ display:"block", height:"100%", width:widths[i]+"%", background: i===alertIdx ? "linear-gradient(90deg,#FF5996,#FF8AB1)" : "linear-gradient(90deg,#00D4B1,#00A37A)", borderRadius:99, transition:"width 1.4s cubic-bezier(.34,1.56,.64,1)" }}/>
            </span>
            <span style={{ fontSize:10, color:"#697386", fontFamily:"JetBrains Mono,monospace", width:38, textAlign:"right", flexShrink:0 }}>{row.count}</span>
            {i===alertIdx && <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"#FF5996", color:"#fff", padding:"2px 7px", borderRadius:5, fontSize:9, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", boxShadow:"0 4px 12px rgba(255,89,150,.4)", zIndex:5 }}>Reorder</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistPreview({ hover }: { hover: boolean }) {
  const hoverRef = useRef(hover);
  useEffect(() => { hoverRef.current = hover; }, [hover]);
  const [done, setDone] = useState(1);
  const items = [
    { label:"Auth flow polish", chip:"@MAYA" },
    { label:"Settings page redesign", chip:"@JORDAN" },
    { label:"API rate-limit alerts", chip:"@SAM" },
    { label:"QA pass + ship notes", chip:"@RILEY" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDone(p => { const n=p+1; return n>items.length?0:n; });
    }, hoverRef.current ? 800 : 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:8 }}>
      <LiveTag label="SPRINT 24" />
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#7A73FF,#635BFF)", color:"#fff", fontSize:10, fontWeight:700, display:"grid", placeItems:"center", flexShrink:0 }}>PM</span>
        <span style={{ fontSize:11, color:"#0A2540", fontWeight:700 }}>Web Refresh<small style={{ display:"block", fontSize:9.5, color:"#697386", fontWeight:500, lineHeight:1.1 }}>Sprint 24 · Due Fri</small></span>
        <span style={{ marginLeft:"auto", fontSize:9.5, color:"#697386", fontFamily:"JetBrains Mono,monospace", fontWeight:600 }}>{done}/4</span>
      </div>
      <div style={{ height:4, background:"#EFF3F8", borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:(done/items.length*100)+"%", background:"linear-gradient(90deg,#7A73FF,#635BFF)", borderRadius:99, transition:"width .6s cubic-bezier(.4,0,.2,1)" }}/>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5, flex:1, overflow:"hidden" }}>
        {items.map((item,i) => {
          const isDone = i<done;
          return (
            <div key={item.label} style={{ background: isDone ? "linear-gradient(90deg,#EDEBFF 0%, #fff 70%)" : "#fff", border:"1px solid #EDF1F6", borderRadius:7, padding:"6px 9px", display:"flex", alignItems:"center", gap:8, transition:"color .3s, background .3s" }}>
              <span style={{ width:14, height:14, borderRadius:4, border: isDone ? "1.5px solid #7A73FF" : "1.5px solid #E3E8EE", background: isDone ? "#7A73FF" : "#fff", display:"grid", placeItems:"center", flexShrink:0, transition:"all .3s" }}>
                {isDone && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
              <span style={{ flex:1, fontSize:10.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textDecoration: isDone ? "line-through" : "none", color: isDone ? "#0A2540" : "#425466" }}>{item.label}</span>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", background:"#EDEBFF", color:"#4A40B8", padding:"2px 6px", borderRadius:4 }}>{item.chip}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SupportPreview({ hover }: { hover: boolean }) {
  const hoverRef = useRef(hover);
  useEffect(() => { hoverRef.current = hover; }, [hover]);
  const nextId = useRef(4822);
  const SUP_TITLES = ["Webhook returning 500 errors","SSO redirect loop on iOS","Bulk import stuck at 92%","API rate limit unclear","2FA SMS not arriving","Widget rendering blank"];
  const [tickets, setTickets] = useState([
    { id:4821, title:"Login fails on Safari 17.x", pri:"high", status:"open", key:1 },
    { id:4820, title:"Export CSV column missing",   pri:"med",  status:"prog", key:2 },
    { id:4819, title:"Typo on settings page",       pri:"low",  status:"done", key:3 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickets(prev => {
        const updated = prev.map((t,i) => { if(i===0&&t.status==="open") return {...t,status:"prog"}; if(i===0&&t.status==="prog") return {...t,status:"done"}; return t; });
        const trimmed = updated.length>=4 ? updated.slice(0,updated.length-1) : updated;
        return [{ id:nextId.current++, title:SUP_TITLES[Math.floor(Math.random()*SUP_TITLES.length)], pri:["high","med","low"][Math.floor(Math.random()*3)], status:"open", key:Date.now() }, ...trimmed];
      });
    }, hoverRef.current ? 1300 : 2400);
    return () => clearInterval(interval);
  }, []);

  const priColor = (p:string) => p==="high"?"#FF5996":p==="med"?"#F8BC42":"#00D4B1";
  const stBg = (s:string) => s==="open"?"#FFE3EE":s==="prog"?"#FFF4DE":"#E0FBF4";
  const stColor = (s:string) => s==="open"?"#C41763":s==="prog"?"#A36F00":"#00A37A";
  const stLabel = (s:string) => s==="open"?"Open":s==="prog"?"In Prog":"Done";

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:8 }}>
      <LiveTag label="AI ONLINE" />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, color:"#0A2540", fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#00D4B1", boxShadow:"0 0 0 3px rgba(0,212,177,.2)", display:"inline-block" }}/>
          23 open · AI handling 18
        </span>
        <span style={{ fontSize:9.5, color:"#697386", fontFamily:"JetBrains Mono,monospace", fontWeight:600 }}>Avg <b style={{ color:"#0A2540" }}>42s</b></span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 7px", background:"linear-gradient(90deg,rgba(0,194,232,.12),rgba(99,91,255,.10))", border:"1px solid rgba(0,194,232,.25)", borderRadius:6, fontSize:9.5, color:"#0099C7", fontWeight:600, letterSpacing:".04em" }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z"/></svg>
        <span>AI drafting reply to #4821…</span>
        <span style={{ display:"inline-flex", gap:2, marginLeft:"auto" }}>
          {[0,1,2].map(i => <i key={i} style={{ width:3, height:3, borderRadius:"50%", background:"#0099C7", opacity:.4, animation:`tplAiDot 1.1s ease-in-out ${i*0.18}s infinite`, display:"inline-block" }}/>)}
        </span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5, flex:1, overflow:"hidden" }}>
        {tickets.map(tk => (
          <div key={tk.key} style={{ background:"#fff", border:"1px solid #EDF1F6", borderRadius:7, padding:"6px 9px", display:"flex", alignItems:"center", gap:7, fontSize:11 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", flexShrink:0, background:priColor(tk.pri), boxShadow:`0 0 0 3px ${priColor(tk.pri)}29` }}/>
            <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:9.5, color:"#697386", fontWeight:600 }}>#{tk.id}</span>
            <span style={{ flex:1, color:"#0A2540", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:10.5 }}>{tk.title}</span>
            <span style={{ fontSize:8.5, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", padding:"2px 5px", borderRadius:4, flexShrink:0, background:stBg(tk.status), color:stColor(tk.status) }}>{stLabel(tk.status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPreview({ hover }: { hover: boolean }) {
  const hoverRef = useRef(hover);
  useEffect(() => { hoverRef.current = hover; }, [hover]);
  const [query, setQuery] = useState("");
  const [toggles, setToggles] = useState([true,true,false,true]);
  const users = [
    { initials:"MP", av:"a", name:"Maya Patel",   role:"admin",  roleCls:"rgba(99,91,255,.12)", roleColor:"#4A40B8" },
    { initials:"JD", av:"b", name:"Jordan Diaz",  role:"editor", roleCls:"#FFF4DE",             roleColor:"#A36F00" },
    { initials:"SK", av:"c", name:"Sam Kim",      role:"viewer", roleCls:"#EFF3F8",             roleColor:"#697386" },
    { initials:"RW", av:"d", name:"Riley Wong",   role:"editor", roleCls:"#FFF4DE",             roleColor:"#A36F00" },
  ];
  const avColors = ["linear-gradient(135deg,#FF5996,#FFB17A)","linear-gradient(135deg,#635BFF,#7A73FF)","linear-gradient(135deg,#00D4B1,#00A37A)","linear-gradient(135deg,#F8BC42,#FF8AB1)"];
  const queryChars = "maya";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= queryChars.length) { setQuery(queryChars.slice(0, i)); i++; }
      else { setTimeout(() => { setQuery(""); i = 0; }, 1200); }
    }, hoverRef.current ? 180 : 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * toggles.length);
      setToggles(prev => { const n=[...prev]; n[idx]=!n[idx]; return n; });
    }, hoverRef.current ? 1200 : 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = users.filter(u => !query || u.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:7 }}>
      <LiveTag label="248 USERS" />
      <div style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", border:"1px solid #EDF1F6", borderRadius:8, padding:"5px 9px", fontSize:11, color:"#697386", height:24 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <span style={{ flex:1, fontFamily:"JetBrains Mono,monospace", fontSize:10.5, color:"#0A2540" }}>{query}<span style={{ display:"inline-block", width:1, height:11, background:"#F8BC42", marginLeft:1, verticalAlign:"middle", animation:"tplCaret 1s steps(1) infinite" }}/></span>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", background:"#FFF4DE", color:"#A36F00", padding:"2px 6px", borderRadius:4 }}>FILTER</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5, flex:1, overflow:"hidden" }}>
        {users.map((u, i) => {
          const isHidden = query && !u.name.toLowerCase().includes(query.toLowerCase());
          return (
            <div key={u.name} style={{ background:"#fff", border:"1px solid #EDF1F6", borderRadius:7, padding:"6px 9px", display:"flex", alignItems:"center", gap:8, fontSize:11, opacity: isHidden ? 0.18 : 1, transform: isHidden ? "translateX(-4px)" : "none", transition:"opacity .35s, transform .35s" }}>
              <span style={{ width:22, height:22, borderRadius:"50%", background:avColors[i], display:"grid", placeItems:"center", color:"#fff", fontSize:9.5, fontWeight:700, flexShrink:0 }}>{u.initials}</span>
              <span style={{ fontWeight:600, color:"#0A2540", fontSize:10.5, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</span>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", padding:"2px 6px", borderRadius:4, background:u.roleCls, color:u.roleColor, flexShrink:0 }}>{u.role}</span>
              <div onClick={() => setToggles(prev => { const n=[...prev]; n[i]=!n[i]; return n; })} style={{ width:24, height:14, borderRadius:99, background: toggles[i] ? "linear-gradient(90deg,#F8BC42,#FF8AB1)" : "#EFF3F8", position:"relative", flexShrink:0, cursor:"pointer", transition:"background .35s" }}>
                <span style={{ position:"absolute", left: toggles[i] ? 12 : 2, top:2, width:10, height:10, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 2px rgba(10,37,64,.18)", transition:"left .35s cubic-bezier(.34,1.56,.64,1)" }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PortalPreview({ hover }: { hover: boolean }) {
  const hoverRef = useRef(hover);
  useEffect(() => { hoverRef.current = hover; }, [hover]);
  const [trackPos, setTrackPos] = useState(2);
  const [activeTab, setActiveTab] = useState(1);
  const [docStates, setDocStates] = useState(["pending","signed"]);
  const stops = ["Ordered","Packed","Shipped","Delivered"];
  const docNames = ["Service Agreement.pdf","Invoice Q4.pdf"];
  const docStateOptions = [
    { cls:"pending", label:"Pending", bg:"#FFF4DE", color:"#A36F00" },
    { cls:"signed",  label:"Signed",  bg:"#E0FBF4", color:"#00A37A" },
    { cls:"review",  label:"Review",  bg:"#DFF6FC", color:"#0099C7" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.random();
      if (r < 0.33) setTrackPos(p => p+1 >= 4 ? 1 : p+1);
      else if (r < 0.66) setActiveTab(p => (p+1) % 3);
      else setDocStates(prev => prev.map((s,i) => i === Math.floor(Math.random()*2) ? docStateOptions[(docStateOptions.findIndex(d=>d.cls===s)+1)%3].cls : s));
    }, hoverRef.current ? 1100 : 1900);
    return () => clearInterval(interval);
  }, []);

  const fillWidth = (trackPos/3*100)+"%";
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:7 }}>
      <LiveTag label="SHIPPED" />
      <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,.7)", border:"1px solid #EDF1F6", borderRadius:8, padding:3 }}>
        {["Overview","Orders","Docs"].map((tab,i) => (
          <span key={tab} onClick={() => setActiveTab(i)} style={{ flex:1, textAlign:"center", fontSize:10, fontWeight:600, color: i===activeTab ? "#0A2540" : "#697386", padding:"4px 6px", borderRadius:5, background: i===activeTab ? "#fff" : "transparent", boxShadow: i===activeTab ? "0 1px 2px rgba(10,37,64,.06)" : "none", transition:"all .35s", cursor:"pointer", letterSpacing:".02em" }}>{tab}</span>
        ))}
      </div>
      <div style={{ background:"#fff", border:"1px solid #EDF1F6", borderRadius:8, padding:"7px 9px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:10, marginBottom:5 }}>
          <span style={{ fontFamily:"JetBrains Mono,monospace", color:"#697386", fontWeight:600 }}>Order #2841</span>
          <span style={{ color:"#0099C7", fontWeight:700 }}>ETA Thu 14:20</span>
        </div>
        <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 4px", height:14 }}>
          <div style={{ position:"absolute", left:8, right:8, top:"50%", height:2, background:"#E3E8EE", borderRadius:2, transform:"translateY(-50%)" }}/>
          <div style={{ position:"absolute", left:8, top:"50%", height:2, width:fillWidth, background:"linear-gradient(90deg,#00C2E8,#00D4B1)", borderRadius:2, transform:"translateY(-50%)", transition:"width 1s cubic-bezier(.4,0,.2,1)" }}/>
          {[0,1,2,3].map(i => (
            <span key={i} style={{ width:8, height:8, borderRadius:"50%", background: i<trackPos ? "#00C2E8" : "#fff", border: i<trackPos ? "1.5px solid #00C2E8" : i===trackPos ? "1.5px solid #00D4B1" : "1.5px solid #E3E8EE", position:"relative", zIndex:1, boxShadow: i===trackPos ? "0 0 0 3px rgba(0,212,177,.22)" : undefined, transition:"all .35s" }}/>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:8.5, color:"#697386", fontWeight:600, letterSpacing:".04em", marginTop:3, padding:"0 1px" }}>
          {stops.map((s,i) => <span key={s} style={{ color: i===trackPos ? "#00A37A" : undefined, fontWeight: i===trackPos ? 700 : undefined }}>{s}</span>)}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {docNames.map((name,i) => {
          const state = docStateOptions.find(d=>d.cls===docStates[i]) || docStateOptions[0];
          return (
            <div key={name} style={{ background:"#fff", border:"1px solid #EDF1F6", borderRadius:6, padding:"5px 8px", display:"flex", alignItems:"center", gap:6, fontSize:10.5 }}>
              <span style={{ width:14, height:14, borderRadius:3, background:"#DFF6FC", display:"grid", placeItems:"center", color:"#0099C7", flexShrink:0 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
              <span style={{ flex:1, color:"#0A2540", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:10 }}>{name}</span>
              <span style={{ fontSize:8.5, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", padding:"2px 5px", borderRadius:4, background:state.bg, color:state.color, transition:"all .4s" }}>{state.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SaasPreview({ hover }: { hover: boolean }) {
  const hoverRef = useRef(hover);
  useEffect(() => { hoverRef.current = hover; }, [hover]);
  const [mrr, setMrr] = useState(48290);
  const [churn, setChurn] = useState(2.1);
  const [active, setActive] = useState(12400);

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.random();
      if (r < 0.33) setMrr(v => v + Math.floor(Math.random()*180+20));
      else if (r < 0.66) setActive(v => v + Math.floor(Math.random()*60+10));
      else setChurn(v => Math.max(1.4, Math.min(2.6, v + (Math.random()*0.2-0.1))));
    }, hoverRef.current ? 900 : 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:8, position:"relative" }}>
      <LiveTag label="LIVE" />
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:8 }}>
        <div>
          <div style={{ fontSize:9.5, color:"#697386", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", lineHeight:1 }}>MRR</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#0A2540", letterSpacing:"-.025em", lineHeight:1, marginTop:3, fontFamily:"JetBrains Mono,monospace" }}>${mrr.toLocaleString()}</div>
        </div>
        <div style={{ fontSize:10, color:"#00A37A", fontWeight:700, background:"#E0FBF4", padding:"2px 6px", borderRadius:5, display:"inline-flex", alignItems:"center", gap:3, marginBottom:2 }}>↗ 14.8%</div>
      </div>
      <div style={{ flex:1, minHeight:0, background:"rgba(255,255,255,.6)", border:"1px solid #EDF1F6", borderRadius:8, overflow:"hidden", padding:4, position:"relative" }}>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
          <defs>
            <linearGradient id="saasGradTpl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF5996" stopOpacity="0.35"/><stop offset="100%" stopColor="#FF5996" stopOpacity="0"/></linearGradient>
            <linearGradient id="saasStrokeTpl" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FF5996"/><stop offset="100%" stopColor="#9B6CFB"/></linearGradient>
          </defs>
          <path fill="url(#saasGradTpl)" d="M2,32 L14,28 L26,30 L38,22 L50,24 L62,16 L74,12 L86,8 L98,5 L98,40 L2,40 Z" style={{ opacity:0, animation:"tplSaasArea 1.6s ease-out forwards .3s" }}/>
          <path fill="none" stroke="url(#saasStrokeTpl)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2,32 L14,28 L26,30 L38,22 L50,24 L62,16 L74,12 L86,8 L98,5" strokeDasharray="280" strokeDashoffset="280" style={{ animation:"tplSaasLine 2s cubic-bezier(.4,0,.2,1) forwards" }}/>
          <circle fill="#fff" stroke="#FF5996" strokeWidth="1.6" cx="98" cy="5" r="2" style={{ opacity:0, animation:"tplDotFade .5s forwards 2s" }}/>
        </svg>
        <div style={{ position:"absolute", top:6, right:8, background:"#0A2540", color:"#fff", fontSize:9, fontWeight:600, padding:"2px 6px", borderRadius:4, fontFamily:"JetBrains Mono,monospace", opacity:0, animation:"tplSaasTip .4s forwards 2.1s" }}>+$6,210</div>
      </div>
      <div style={{ display:"flex", gap:6 }}>
        <div style={{ flex:1, background:"rgba(255,255,255,.7)", border:"1px solid #EDF1F6", borderRadius:8, padding:"6px 8px" }}>
          <div style={{ fontSize:9, color:"#697386", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", lineHeight:1 }}>Churn</div>
          <div style={{ fontSize:13, fontWeight:800, color:"#0A2540", letterSpacing:"-.02em", lineHeight:1.2, marginTop:3, display:"flex", alignItems:"baseline", gap:3 }}>{churn.toFixed(1)}<small style={{ fontSize:9.5, fontWeight:700, color:"#00A37A" }}>↓ 0.4</small></div>
        </div>
        <div style={{ flex:1, background:"rgba(255,255,255,.7)", border:"1px solid #EDF1F6", borderRadius:8, padding:"6px 8px" }}>
          <div style={{ fontSize:9, color:"#697386", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", lineHeight:1 }}>Active</div>
          <div style={{ fontSize:13, fontWeight:800, color:"#0A2540", letterSpacing:"-.02em", lineHeight:1.2, marginTop:3, display:"flex", alignItems:"baseline", gap:3 }}>{active.toLocaleString()}<small style={{ fontSize:9.5, fontWeight:700, color:"#00A37A" }}>↗ 8%</small></div>
        </div>
      </div>
    </div>
  );
}

function DashboardPreview({ hover }: { hover: boolean }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setActive(p => (p+1)%3), hover ? 1200 : 2000);
    return () => clearInterval(interval);
  }, [hover]);
  const stats = [42, 18, "94%", "Active"];
  const bars = [60,80,45,90,55,75,85];
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:8, fontSize:11 }}>
      <div style={{ display:"flex", gap:6 }}>
        <div style={{ width:80, display:"flex", flexDirection:"column", gap:4 }}>
          {["Dashboard","Overview","Analytics","Settings","Reports"].map((l,i) => (
            <div key={l} style={{ fontSize:9.5, color: i===0?"#FF6600":"#697386", fontWeight: i===0?600:400, padding:"3px 8px", borderRadius:5, background: i===0?"rgba(255,102,0,.08)":"transparent", cursor:"pointer" }}>{l}</div>
          ))}
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ display:"flex", gap:5 }}>
            {stats.map((s,i) => (
              <div key={i} style={{ flex:1, background: i===active?"#FF6600":"#fff", border:`1px solid ${i===active?"#FF6600":"#E5E7EB"}`, borderRadius:8, padding:"5px 8px", textAlign:"center", transition:"all .3s" }}>
                <div style={{ fontSize:12, fontWeight:700, color: i===active?"#fff":"#111111" }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:8, padding:"8px 10px" }}>
            <div style={{ fontSize:9.5, fontWeight:600, color:"#697386", marginBottom:6 }}>Recent Activity</div>
            {["Item one — updated just now","Item two — 5 minutes ago","Item three — 30 minutes ago"].map((item,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 0", fontSize:9.5, color:"#425466" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background: i===0?"#FF6600":"#E5E7EB", flexShrink:0 }}/>
                {item}
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:8, padding:"8px 10px" }}>
              <div style={{ fontSize:9, fontWeight:600, color:"#697386", marginBottom:6 }}>Weekly Trend</div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:28 }}>
                {bars.map((h,i) => (
                  <div key={i} style={{ flex:1, height:`${h}%`, borderRadius:2, background: i===bars.length-2?"#FF6600":"#FFD4B8", transition:"height .6s" }}/>
                ))}
              </div>
            </div>
            <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:8, padding:"8px 10px" }}>
              <div style={{ fontSize:9, fontWeight:600, color:"#697386", marginBottom:6 }}>Quick Stats</div>
              {["Completion rate","Active users","Tasks closed"].map((s,i) => (
                <div key={s} style={{ marginBottom:4 }}>
                  <div style={{ fontSize:8.5, color:"#697386", marginBottom:2 }}>{s}</div>
                  <div style={{ height:3, background:"#F5F5EE", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${[72,58,45][i]}%`, background:"#FF6600", borderRadius:99 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SvgPreview({ id }: { id: string }) {
  const svg = TEMPLATE_SVGS[id] || "";
  if (!svg) return null;
  return (
    <div
      style={{ width:"100%", height:"100%", overflow:"hidden" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const PREVIEW_MAP: Record<string, React.FC<{hover:boolean}>> = {
  kanban: KanbanPreview, flow: FlowPreview, bars: BarsPreview,
  inventory: InventoryPreview, checklist: ChecklistPreview,
  support: SupportPreview, admin: AdminPreview,
  portal: PortalPreview, saas: SaasPreview,
  dashboard: DashboardPreview,
};

/* ─── LAUNCH MODAL ──────────────────────────────────────── */
function LaunchModal({ tmpl, onClose }: { tmpl: Template | null; onClose: () => void }) {
  const [states, setStates] = useState<("idle"|"run"|"done")[]>(LAUNCH_STEPS.map(()=>"idle"));
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [times, setTimes] = useState<string[]>(LAUNCH_STEPS.map(()=>""));

  useEffect(() => {
    if (!tmpl) return;
    setStates(LAUNCH_STEPS.map(()=>"idle")); setProgress(0); setReady(false); setTimes(LAUNCH_STEPS.map(()=>""));
    function runStep(i: number) {
      if (i >= LAUNCH_STEPS.length) { setReady(true); return; }
      const t0 = performance.now();
      setStates(prev => { const n=[...prev]; if(i>0) n[i-1]="done"; n[i]="run"; return n; });
      setProgress(((i+1)/LAUNCH_STEPS.length)*100);
      let rafId = requestAnimationFrame(function tick() {
        setTimes(prev => { const n=[...prev]; n[i]=((performance.now()-t0)/1000).toFixed(1)+"s"; return n; });
        rafId = requestAnimationFrame(tick);
      });
      setTimeout(() => { cancelAnimationFrame(rafId); runStep(i+1); }, LAUNCH_STEPS[i].t);
    }
    const tid = setTimeout(()=>runStep(0), 50);
    return () => clearTimeout(tid);
  }, [tmpl]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if(e.key==="Escape") onClose(); };
    document.addEventListener("keydown",fn); return ()=>document.removeEventListener("keydown",fn);
  }, [onClose]);

  if (!tmpl) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(10,37,64,.55)", backdropFilter:"blur(8px)", display:"grid", placeItems:"center", padding:24, opacity: tmpl ? 1 : 0, transition:"opacity .3s" }} onClick={e=>{ if((e.target as HTMLElement).style.position==="fixed") onClose(); }}>
      <div style={{ width:"min(520px,100%)", background:"#fff", borderRadius:24, boxShadow:"0 30px 80px rgba(10,37,64,.4)", overflow:"hidden" }}>
        <div style={{ height:4, background:"#EDF1F6", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", left:0, top:0, height:"100%", width:progress+"%", background:"linear-gradient(90deg,#635BFF,#FF5996)", transition:"width .6s cubic-bezier(.4,0,.2,1)" }}/>
        </div>
        <div style={{ padding:"24px 28px 20px", borderBottom:"1px solid #EDF1F6", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:13, display:"grid", placeItems:"center", color:"#fff", fontWeight:800, fontSize:16, boxShadow:"0 8px 22px rgba(99,91,255,.32)", background:tmpl.accent, flexShrink:0 }}>
            {tmpl.title.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()}
          </div>
          <div>
            <h4 style={{ margin:0, fontSize:18, fontWeight:700, letterSpacing:"-.015em", color:"#0A2540" }}>{ready?"Workspace ready":`Launching ${tmpl.title}…`}</h4>
            <p style={{ margin:"2px 0 0", fontSize:13, color:"#697386" }}>{ready?"Open your new project to start configuring":`Setting up workspace with ${tmpl.cat.toLowerCase()} scaffold`}</p>
          </div>
        </div>
        <div style={{ padding:"8px 28px 22px" }}>
          {LAUNCH_STEPS.map((s,i)=>(
            <div key={s.label} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom: i<LAUNCH_STEPS.length-1?"1px dashed #EDF1F6":undefined }}>
              <span style={{ width:22, height:22, borderRadius:"50%", border: states[i]==="done"?"none":states[i]==="run"?"2px solid #635BFF":"2px solid #E3E8EE", background: states[i]==="done"?"#00D4B1":"#fff", flexShrink:0, display:"grid", placeItems:"center", transition:"all .3s" }}>
                {states[i]==="done" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                {states[i]==="run" && <span style={{ width:10, height:10, borderRadius:"50%", border:"2px solid #635BFF", borderTopColor:"transparent", animation:"tplSpin .8s linear infinite", display:"block" }}/>}
              </span>
              <span style={{ flex:1, fontSize:14, color: states[i]==="idle"?"#697386":"#0A2540", fontWeight: states[i]==="idle"?400:500 }}>{s.label}</span>
              <span style={{ fontSize:11, color:"#697386", fontFamily:"JetBrains Mono,monospace" }}>{times[i]}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:"18px 28px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, background:"#F6F9FC" }}>
          <button onClick={onClose} style={{ fontSize:13, color:"#697386", padding:"8px 14px", borderRadius:999, transition:"background .15s" }}>Cancel</button>
          <div style={{ fontSize:13, color:"#425466" }}>Setup time <strong style={{ color:"#0A2540", fontWeight:700 }}>{tmpl.time}</strong></div>
          <a href="#" style={{ background: ready?"linear-gradient(135deg,#635BFF,#FF5996)":"#0A2540", color:"#fff", fontSize:13, fontWeight:600, padding:"10px 18px", borderRadius:999, opacity: ready?1:.35, pointerEvents: ready?"auto":"none", display:"inline-flex", alignItems:"center", gap:6, boxShadow: ready?"0 6px 18px rgba(99,91,255,.32)":undefined, transition:"opacity .3s" }}>Open project →</a>
        </div>
      </div>
    </div>
  );
}

/* ─── CARD ──────────────────────────────────────────────── */
function TemplateCard({ t, onLaunch }: { t: Template; onLaunch: (t: Template) => void }) {
  const [hover, setHover] = useState(false);
  const PreviewComp = PREVIEW_MAP[t.preview];
  return (
    <div
      style={{ position:"relative", background:"#fff", border: hover?"1px solid rgba(255,102,0,.18)":"1px solid #E5E7EB", borderRadius:28, overflow:"hidden", transition:"transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s, border-color .35s", boxShadow: hover?"0 1px 0 #fff inset, 0 2px 6px rgba(10,37,64,.05), 0 28px 60px -20px rgba(10,37,64,.16)":"0 1px 0 #fff inset, 0 2px 4px rgba(10,37,64,.03), 0 8px 22px -10px rgba(10,37,64,.06)", display:"flex", flexDirection:"column", isolation:"isolate", minHeight:"auto", transform: hover?"translateY(-4px)":"none" }}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    >
      <div style={{ position:"absolute", top:0, left:0, width:64, height:4, borderRadius:"0 0 4px 0", zIndex:3, background:"#FF6600" }}/>
      <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", opacity: hover?1:0, transition:"opacity .4s", background:"transparent" }}/>
  {/* Preview */}
  <div style={{ padding:"16px 24px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
    <h3 style={{ fontSize:18, fontWeight:700, letterSpacing:"-.02em", color:"#0A2540", margin:0, lineHeight:1.25 }}>{t.title}</h3>
    <span className={`tplv2-cat ${t.catCls}`}>{t.cat}</span>
  </div>
  <div style={{ position:"relative", height:220, background:"#0F0A2E", borderBottom:"1px solid #EDF1F6", overflow:"hidden", flexShrink:0 }}>
    <div className="tpl-svg-wrap" style={{ width:"100%", height:"100%", lineHeight:0 }} dangerouslySetInnerHTML={{ __html: TEMPLATE_SVGS[t.id] || "" }} />
  </div>
  {/* Body */}
  <div style={{ marginTop:"auto", padding:"12px 24px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
  <a href="#" style={{ fontSize:13, fontWeight:600, color:"#FF6600", display:"inline-flex", alignItems:"center", gap:4 }}>View App →</a>
  <button onClick={()=>onLaunch(t)} style={{ display:"inline-flex", alignItems:"center", gap: hover?10:6, background:"#0A2540", color:"#fff", padding:"9px 16px", borderRadius:999, fontSize:13, fontWeight:600, transition:"transform .2s, box-shadow .2s, gap .2s", boxShadow:"0 4px 12px rgba(10,37,64,.18)", transform: hover?"translateY(-1px)":"none" }}>
      Use template
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </div>
</div>
  );
}

/* ─── MAIN SECTION ──────────────────────────────────────── */
export function Templates() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [launchTmpl, setLaunchTmpl] = useState<Template | null>(null);
  const visible = TEMPLATES.filter(t => activeFilter==="All" || t.filters.includes(activeFilter));

  return (
    <>
      <section style={{ padding:"64px 32px", position:"relative", background:"#F5F5EE", overflow:"hidden" }}>
        <div style={{ maxWidth:1240, margin:"0 auto", position:"relative", zIndex:1 }}>
          {/* Eyebrow */}
          <div style={{ textAlign:"center", marginBottom:8 }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:8, background:"white", border:"1px solid #E5E7EB", padding:"7px 14px 7px 12px", borderRadius:999, fontSize:13, fontWeight:500, color:"#FF6600" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#FF6600", boxShadow:"0 0 0 4px rgba(255,102,0,.18)", animation:"tplPulse 2s ease-in-out infinite", display:"inline-block" }}/>
                Templates
              </span>
          </div>

          {/* Head */}
          <div style={{ textAlign:"center", margin:"18px 0 24px" }}>
            <h2 style={{ fontSize:"clamp(32px,4vw,44px)", fontWeight:800, letterSpacing:"-.035em", lineHeight:1.05, margin:"0", color:"#111111" }}>
              Ship faster from a <span style={{ color:"#FF6600", WebkitTextFillColor:"#FF6600" }}>proven base</span>
            </h2>
          </div>

          {/* Filters */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <div style={{ display:"inline-flex", background:"#fff", border:"1px solid #E3E8EE", padding:5, borderRadius:999, boxShadow:"0 1px 2px rgba(10,37,64,.04)" }}>
            {FILTERS.map(f => (
            <button key={f} onClick={()=>setActiveFilter(f)} style={{ padding:"9px 18px", borderRadius:999, fontSize:14, fontWeight:500, color: activeFilter===f?"#fff":"#697386", background: activeFilter===f?"#111111":"transparent", transition:"color .15s, background .15s", whiteSpace:"nowrap" }}>{f}</button>
              ))}
            </div>
    <a href="#" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#FF6600", fontWeight:600, fontSize:15, whiteSpace:"nowrap", transition:"gap .2s" }}>Browse all {TEMPLATES.length} templates →</a>
  </div>
  <div style={{ fontSize:13, color:"#697386", fontWeight:500 }}>Showing <strong style={{ color:"#111111", fontWeight:700 }}>{Math.min(visible.length, 6)}</strong> templates</div>
</div>

          {/* Grid */}
          <div className="tpl-grid-resp" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {visible.slice(0, 6).map(t => <TemplateCard key={t.id} t={t} onLaunch={setLaunchTmpl}/>)}
          </div>
        </div>
      </section>

      {/* Animations */}
      <style>{`
        .tpl-svg-wrap svg { width: 100% !important; height: 100% !important; display: block !important; }
        @keyframes tplPulse { 50% { box-shadow: 0 0 0 7px rgba(99,91,255,.06); } }
        @keyframes tplOrb1  { from{transform:translate(0,0) scale(1)} to{transform:translate(80px,60px) scale(1.15)} }
        @keyframes tplOrb2  { from{transform:translate(0,0) scale(1)} to{transform:translate(-90px,50px) scale(.9)} }
        @keyframes tplOrb3  { from{transform:translate(0,0) scale(1)} to{transform:translate(-60px,-40px) scale(1.1)} }
        @keyframes tplOrb4  { from{transform:translate(0,0) scale(1)} to{transform:translate(50px,-50px) scale(1.05)} }
        @keyframes tplDotDrift { from{background-position:0 0,70px 90px} to{background-position:140px 140px,270px 290px} }
        @keyframes tplTokenSlide { 0%{left:18px;opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{left:calc(100% - 18px);opacity:0} }
        @keyframes tplLineDraw { to { stroke-dashoffset: 0; } }
        @keyframes tplDotFade { to { opacity: 1; } }
        @keyframes tplAiDot { 40% { opacity: 1; transform: translateY(-2px); } }
        @keyframes tplCaret { 50% { opacity: 0; } }
        @keyframes tplSpin { to { transform: rotate(360deg); } }
        @keyframes tplSaasLine { to { stroke-dashoffset: 0; } }
        @keyframes tplSaasArea { to { opacity: .85; } }
        @keyframes tplSaasTip { to { opacity: 1; } }
        @media (max-width:1100px) { .tpl-grid-resp { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width:720px)  { .tpl-grid-resp { grid-template-columns: 1fr !important; } }
        @media (max-width:768px) {
        .tpl-head-grid { grid-template-columns: 1fr !important; }
         .tpl-grid-resp { grid-template-columns: 1fr !important; }
}
      `}</style>

      {launchTmpl && <LaunchModal tmpl={launchTmpl} onClose={()=>setLaunchTmpl(null)}/>}
    </>
  );
}