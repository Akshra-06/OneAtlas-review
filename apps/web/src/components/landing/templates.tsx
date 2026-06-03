"use client";
import { useState, useEffect, useRef } from "react";
import { getDemoDashboardPreviews, TemplatePreviews } from "@/services/templates";

/* ─── types ─────────────────────────────────── */
interface Template {
  id: string; cat: string; catCls: string; accent: string;
  title: string; desc: string; time: string; team: string;
  filters: string[]; preview: keyof TemplatePreviews; glow: string;
}

const FILTERS = ["All", "CRUD Apps", "Dashboards", "Admin Panels", "Workflows", "Portals"];

const TEMPLATES: Template[] = [
  { id:"crm",       cat:"CRUD APPS",  catCls:"indigo", accent:"linear-gradient(90deg,#635BFF,#9B6CFB)", title:"Sales CRM",            desc:"Track pipeline, manage contacts, and close deals — with AI scoring built in.",              time:"~2 min", team:"2–50", filters:["CRUD Apps"],  preview:"kanban",    glow:"radial-gradient(40% 50% at 20% 80%, rgba(99,91,255,.18), transparent 70%)" },
  { id:"expense",   cat:"WORKFLOWS",  catCls:"peach",  accent:"linear-gradient(90deg,#FFB17A,#FF5996)", title:"Expense Approval",     desc:"Multi-step approvals with automatic escalation and Slack alerts.",                          time:"~3 min", team:"Any",  filters:["Workflows"],  preview:"flow",      glow:"radial-gradient(40% 50% at 80% 20%, rgba(255,177,122,.18), transparent 70%)" },
  { id:"analytics", cat:"DASHBOARDS", catCls:"coral",  accent:"linear-gradient(90deg,#FF5996,#FF9173)", title:"Analytics Report",     desc:"Live charts, KPI tiles, and date-range comparisons — no SQL required.",                     time:"~1 min", team:"Any",  filters:["Dashboards"], preview:"bars",      glow:"radial-gradient(40% 50% at 50% 30%, rgba(255,89,150,.16), transparent 70%)" },
  { id:"inventory", cat:"CRUD APPS",  catCls:"mint",   accent:"linear-gradient(90deg,#00D4B1,#00A37A)", title:"Inventory Manager",    desc:"Track SKUs, set reorder thresholds, and trigger purchase orders.",                          time:"~2 min", team:"5+",   filters:["CRUD Apps"],  preview:"inventory", glow:"radial-gradient(40% 50% at 50% 30%, rgba(0,212,177,.14), transparent 70%)" },
  { id:"hr",        cat:"PORTALS",    catCls:"violet", accent:"linear-gradient(90deg,#7A73FF,#9B6CFB)", title:"HR Onboarding Portal", desc:"A self-serve hub for new hires — tasks, docs, and day-one checklist.",                      time:"~2 min", team:"HR",   filters:["Portals"],    preview:"checklist", glow:"radial-gradient(40% 50% at 50% 30%, rgba(122,115,255,.16), transparent 70%)" },
  { id:"support",   cat:"CRUD APPS",  catCls:"sky",    accent:"linear-gradient(90deg,#00C2E8,#635BFF)", title:"Support Queue",        desc:"Triage tickets, assign agents, track SLAs, and notify customers automatically.",            time:"~2 min", team:"2–20", filters:["CRUD Apps"],  preview:"support",   glow:"radial-gradient(40% 50% at 50% 30%, rgba(0,194,232,.14), transparent 70%)" },
];

const LAUNCH_STEPS = [
  { label:"Creating workspace",    t:600 },
  { label:"Provisioning database", t:900 },
  { label:"Seeding sample data",   t:800 },
  { label:"Wiring auth & roles",   t:700 },
  { label:"Ready to open",         t:400 },
];

function animCounter(el: HTMLElement) {
  if (el.dataset._animated) return;
  el.dataset._animated = "1";
  const target = parseFloat(el.dataset.counter!);
  const fmt = el.dataset.fmt;
  const suffix = el.dataset.suffix || "";
  const prefix = el.dataset.prefix || "";
  const tail = el.querySelector("small")?.outerHTML || "";
  const start = performance.now(), dur = 1200;
  function step(t: number) {
    const p = Math.min(1, (t - start) / dur);
    const v = target * (1 - Math.pow(1 - p, 3));
    const txt = fmt === "comma" ? Math.round(v).toLocaleString() : Math.round(v);
    el.innerHTML = `${prefix}${txt}${suffix}${tail}`;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function animAll(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-counter]").forEach(animCounter);
}

function KanbanPreview({ hover, data }: { hover: boolean; data?: TemplatePreviews["kanban"] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    setTimeout(() => animAll(root), 400);
  }, [data]);

  const cols = data?.cols || [
    { label:"Lead", cards:[{who:"Stark",amt:"$12k",cls:"indigo",stage:"lead"},{who:"Wayne",amt:"$8k",cls:"indigo",stage:"lead"}] },
    { label:"Active", cards:[{who:"Cyberdyne",amt:"$45k",cls:"sky",stage:"qualified"},{who:"Initech",amt:"$21k",cls:"sky",stage:"proposal"}] },
    { label:"Won", cards:[{who:"Acme",amt:"$150k",cls:"mint",stage:"won"}] },
  ];

  const pipelineRaw = data?.pipelineValue ? data.pipelineValue.replace(/[^0-9.]/g, '') : "284";
  
  return (
    <div ref={rootRef} style={{position:"relative",height:"100%",display:"flex",flexDirection:"column",gap:8}}>
      <LiveTag label="LIVE PIPELINE"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,height:128}}>
        {cols.map((col: NonNullable<TemplatePreviews["kanban"]>["cols"][0]) => (
          <div key={col.label} className="kv2-col" style={{background:"rgba(255,255,255,.7)",border:"1px solid var(--line-soft)",borderRadius:10,padding:"8px 8px 6px",display:"flex",flexDirection:"column",gap:6,backdropFilter:"blur(6px)",position:"relative"}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",color:"var(--ink-mute)",textTransform:"uppercase",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{col.label}</span>
              <span className="kv2-count" style={{background:"var(--cream-2)",color:"var(--ink-soft)",padding:"1px 5px",borderRadius:99,fontSize:9,minWidth:14,textAlign:"center",transition:"all .3s"}}>{col.cards.length}</span>
            </div>
            {col.cards.map((cd, i) => (
              <div key={`${cd.who}-${i}`} className="kv2-card" style={{background:"#fff",border:"1px solid var(--line-soft)",borderRadius:6,padding:"5px 7px",fontSize:10,color:"var(--ink)",boxShadow:"0 1px 2px rgba(10,37,64,.04)",display:"flex",flexDirection:"column",gap:1,transition:"transform .55s cubic-bezier(.22,1,.36,1), box-shadow .3s",borderLeft:`3px solid var(--${cd.cls})`}}>
                <span style={{fontSize:9,color:"var(--ink-mute)",lineHeight:1.1}}>{cd.who}</span>
                <span style={{fontWeight:700,fontSize:10.5}}>{cd.amt}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        {[
          {l:"Pipeline",counter:pipelineRaw,pre:"$",suf:"k"},
          {l:"Closing",counter:data?.closing?.toString() || "12",suf:""},
          {l:"Win Rate",counter:data?.winRate?.toString() || "38",suf:"%"}
        ].map(kpi=>(
          <div key={kpi.l} style={{flex:1,background:"rgba(255,255,255,.7)",border:"1px solid var(--line-soft)",borderRadius:8,padding:"6px 8px"}}>
            <div style={{fontSize:9,color:"var(--ink-mute)",letterSpacing:".06em",textTransform:"uppercase",fontWeight:600,lineHeight:1}}>{kpi.l}</div>
            <div style={{fontSize:13,fontWeight:800,color:"var(--ink)",letterSpacing:"-.02em",lineHeight:1.2,marginTop:2}} data-counter={kpi.counter} data-prefix={kpi.pre||""} data-suffix={kpi.suf}>{kpi.pre||""}0{kpi.suf}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowPreview({ hover, data }: { hover: boolean; data?: TemplatePreviews["flow"] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pos = 1;
  const labels = ["Submit","Manager","Finance","Paid"];
  useEffect(() => {
    const root = rootRef.current; if (root) setTimeout(() => animAll(root), 400);
  }, [data]);
  return (
    <div ref={rootRef} style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:12,height:"100%",position:"relative"}}>
      <LiveTag label={`${data?.queue ?? 4} IN QUEUE`}/>
      <div style={{background:"#fff",border:"1px solid var(--line-soft)",borderRadius:9,padding:"8px 10px",display:"flex",alignItems:"center",gap:8,fontSize:11}}>
        <span style={{width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,var(--peach),var(--coral))",display:"grid",placeItems:"center",color:"#fff",fontSize:10,fontWeight:700,flexShrink:0}}>M</span>
        <span style={{fontWeight:600,color:"var(--ink)",flex:1,fontSize:11}}>{data?.activeTx?.who ?? "Maya P."} · {data?.activeTx?.desc ?? "Q4 software stack"}</span>
        <span style={{fontWeight:700,fontFamily:"JetBrains Mono,monospace",fontSize:11}}>{data?.activeTx?.amt ?? "$1,840"}</span>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"var(--coral)",padding:"2px 6px",background:"var(--coral-soft)",borderRadius:5}}>Step {pos+1}/4</span>
      </div>
      <div style={{position:"relative",height:34,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6px"}}>
        <div style={{position:"absolute",left:18,right:18,top:"50%",height:2,background:"var(--line)",borderRadius:2,transform:"translateY(-50%)"}}/>
        <div style={{position:"absolute",left:18,top:"50%",height:2,width:(pos/3*100)+"%",background:"linear-gradient(90deg,var(--peach),var(--coral))",borderRadius:2,transform:"translateY(-50%)",transition:"width 1.4s cubic-bezier(.4,0,.2,1)"}}/>
        <div style={{position:"absolute",top:"50%",left:18,transform:"translate(-50%,-50%)",width:10,height:10,borderRadius:"50%",background:"radial-gradient(circle,#fff,var(--gold))",boxShadow:"0 0 0 3px rgba(248,188,66,.4), 0 0 12px rgba(248,188,66,.6)",zIndex:2,animation:"tokenV2 5s linear infinite"}}/>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:26,height:26,borderRadius:"50%",background:i<pos?"linear-gradient(135deg,var(--peach),var(--coral))":"#fff",border:i<pos?"transparent":i===pos?"2px solid var(--coral)":"2px solid var(--line)",display:"grid",placeItems:"center",fontSize:10,fontWeight:700,color:i<pos?"#fff":i===pos?"var(--coral)":"var(--ink-mute)",position:"relative",zIndex:1,boxShadow:i===pos?"0 0 0 4px rgba(255,89,150,.16)":undefined,transition:"all .35s"}}>
            {i < pos ? "✓" : i+1}
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9.5,color:"var(--ink-mute)",fontWeight:500}}>
        {labels.map((l,i)=><span key={l} style={{flex:1,textAlign:"center",color:i===pos?"var(--coral)":undefined,fontWeight:i===pos?700:undefined}}>{l}</span>)}
      </div>
      <div style={{display:"flex",gap:6}}>
        {[
          {l:"Pending",v:data?.pending?.toString() ?? "7"},
          {l:"Auto-approved",v:data?.autoApproved?.toString() ?? "42"},
          {l:"Avg",v:data?.avgHours?.toString() ?? "4",suf:"h"}
        ].map(s=>(
          <div key={s.l} style={{flex:1,background:"rgba(255,255,255,.7)",border:"1px solid var(--line-soft)",borderRadius:8,padding:"5px 8px"}}>
            <div style={{fontSize:9,color:"var(--ink-mute)",letterSpacing:".06em",textTransform:"uppercase",fontWeight:600,lineHeight:1}}>{s.l}</div>
            <div style={{fontSize:12,fontWeight:800,color:"var(--ink)",marginTop:2}} data-counter={s.v} data-suffix={s.suf||""}>0{s.suf||""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarsPreview({ hover, data }: { hover: boolean; data?: TemplatePreviews["bars"] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heights = data?.trend || [40,55,30,68,45,82,68];
  const tipIdx = 5;
  useEffect(() => {
    const root = rootRef.current; if (root) setTimeout(() => animAll(root), 400);
  }, [data]);
  const tipH = heights[tipIdx];
  return (
    <div ref={rootRef} style={{height:"100%",display:"flex",flexDirection:"column",gap:8,position:"relative"}}>
      <LiveTag label="STREAMING"/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:9.5,color:"var(--ink-mute)",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",lineHeight:1}}>Monthly Active Users</div>
          <div style={{fontSize:18,fontWeight:800,color:"var(--ink)",letterSpacing:"-.02em",lineHeight:1.1,marginTop:2}} data-counter={data?.mau ?? "42180"} data-fmt="comma">0</div>
        </div>
        <div style={{fontSize:10,color:"var(--emerald)",fontWeight:700,background:"var(--mint-soft)",padding:"2px 6px",borderRadius:5,display:"inline-flex",alignItems:"center",gap:3,marginTop:4}}>↑ 12.4%</div>
      </div>
      <div style={{position:"relative",flex:1,minHeight:0}}>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"flex-end",gap:5,padding:"0 0 4px"}}>
          {heights.map((h: number,i: number)=>(
            <div key={i} style={{flex:1,height:h+"%",borderRadius:"5px 5px 2px 2px",background:i===5?"linear-gradient(180deg,#FF5996,#FF9173)":i<=3?"linear-gradient(180deg,#FFC8DC,#FFE3EE)":"linear-gradient(180deg,var(--coral),#FF8AB1)",transition:"height .8s cubic-bezier(.34,1.56,.64,1)"}}/>
          ))}
        </div>
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
          <path d="M3,46 L17,38 L31,50 L45,28 L58,40 L72,12 L86,22" fill="none" stroke="var(--indigo)" strokeWidth="1.8" style={{filter:"drop-shadow(0 2px 6px rgba(99,91,255,.25))"}}/>
          {[3,17,31,45,58,72,86].map((x,i)=>(
            <circle key={i} cx={x} cy={[46,38,50,28,40,12,22][i]} r="1.6" fill="#fff" stroke="var(--indigo)" strokeWidth="1.5"/>
          ))}
        </svg>
        <div style={{position:"absolute",background:"var(--ink)",color:"#fff",fontSize:10,fontWeight:600,padding:"3px 7px",borderRadius:5,pointerEvents:"none",transform:"translate(-50%,-110%)",whiteSpace:"nowrap",fontFamily:"JetBrains Mono,monospace",left:((tipIdx+.5)/heights.length*100)+"%",bottom:tipH+"%",transition:"left 1.6s cubic-bezier(.4,0,.2,1), bottom .4s",zIndex:3}}>
          {Math.round(tipH)}
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9.5,color:"var(--ink-mute)",fontFamily:"JetBrains Mono,monospace"}}>
        <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
      </div>
    </div>
  );
}

function InventoryPreview({ hover, data }: { hover: boolean; data?: TemplatePreviews["inventory"] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const items = data?.items || [
    {sku:"A-1284",name:"Walnut Desk · oak",   target:86,count:"1,240"},
    {sku:"A-0931",name:"Mesh Chair v2",        target:48,count:"580"  },
    {sku:"A-7522",name:"Standing Riser · alu",target:18,count:"120"  },
  ];
  const widths = items.map((i: NonNullable<TemplatePreviews["inventory"]>["items"][0]) => i.target);
  const alertIdx = 2;
  useEffect(() => {
    const root = rootRef.current; if (root) setTimeout(() => animAll(root), 400);
  }, [data]);
  return (
    <div ref={rootRef} style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <LiveTag label={`${data?.totalSkus ?? "3,420"} SKUs`}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,marginTop:4}}>
        <span style={{fontSize:9.5,color:"var(--ink-mute)",fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"}}>Stock Levels</span>
        <span style={{fontSize:11,fontWeight:700,color:"var(--ink)",fontFamily:"JetBrains Mono,monospace"}} data-counter={data?.stockLevels?.replace(/[^0-9]/g,"") ?? "1240"} data-fmt="comma" data-suffix=" units">0 units</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {items.map((row: NonNullable<TemplatePreviews["inventory"]>["items"][0], i: number) =>(
          <div key={row.sku} style={{background:i===alertIdx?"linear-gradient(90deg,var(--coral-soft) 0%, #fff 60%)":"#fff",border:`1px solid ${i===alertIdx?"rgba(255,89,150,.3)":"var(--line-soft)"}`,borderRadius:8,padding:"7px 9px",display:"flex",alignItems:"center",gap:8,fontSize:11,position:"relative",overflow:"hidden"}}>
            <span style={{background:"var(--mint-soft)",color:"var(--emerald)",fontFamily:"JetBrains Mono,monospace",fontSize:9.5,fontWeight:600,padding:"2px 6px",borderRadius:4,flexShrink:0}}>{row.sku}</span>
            <span style={{fontWeight:600,color:"var(--ink)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:10.5,paddingRight:i===alertIdx?84:0}}>{row.name}</span>
            <span style={{width:54,height:5,background:"var(--cream-2)",borderRadius:99,overflow:"hidden",flexShrink:0,position:"relative"}}>
              <span style={{display:"block",height:"100%",width:widths[i]+"%",background:i===alertIdx?"linear-gradient(90deg,var(--coral),#FF8AB1)":"linear-gradient(90deg,var(--mint),var(--emerald))",borderRadius:99,transition:"width 1.4s cubic-bezier(.34,1.56,.64,1)"}}/>
            </span>
            <span style={{fontSize:10,color:"var(--ink-mute)",fontFamily:"JetBrains Mono,monospace",width:38,textAlign:"right",flexShrink:0}}>{row.count}</span>
            {i===alertIdx&&<span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"var(--coral)",color:"#fff",padding:"2px 7px",borderRadius:5,fontSize:9,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",boxShadow:"0 4px 12px rgba(255,89,150,.4)",zIndex:5}}>Reorder</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistPreview({ hover, data }: { hover: boolean; data?: TemplatePreviews["checklist"] }) {
  const done = data?.done ?? 1;
  const total = data?.total ?? 4;
  const candidate = data?.candidate ?? "Jordan Diaz";
  const role = data?.role ?? "Product Designer";
  const tasks = data?.tasks || [{title:"Sign offer letter",day:"Day 1"},{title:"Set up workstation",day:"Day 1"},{title:"Meet your buddy",day:"Day 2"},{title:"Complete IT training",day:"Day 3"}];
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",gap:8}}>
      <LiveTag label="DAY 1 of 5"/>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,var(--violet),var(--indigo))",color:"#fff",fontSize:10,fontWeight:700,display:"grid",placeItems:"center",flexShrink:0}}>JD</span>
        <span style={{fontSize:11,color:"var(--ink)",fontWeight:700}}>{candidate}<small style={{display:"block",fontSize:9.5,color:"var(--ink-mute)",fontWeight:500,lineHeight:1.1}}>{role} · Joined Mon</small></span>
        <span style={{marginLeft:"auto",fontSize:9.5,color:"var(--ink-mute)",fontFamily:"JetBrains Mono,monospace",fontWeight:600}}>{done}/{total}</span>
      </div>
      <div style={{height:4,background:"var(--cream-2)",borderRadius:99,overflow:"hidden"}}>
        <div style={{height:"100%",width:(done/total*100)+"%",background:"linear-gradient(90deg,var(--violet),var(--indigo))",borderRadius:99,transition:"width .6s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5,flex:1,overflow:"hidden"}}>
        {tasks.map((task: NonNullable<TemplatePreviews["checklist"]>["tasks"][0], i: number)=>{ const item = task.title; const day = task.day;
          const isDone = i<done;
          return (
            <div key={item} style={{background:isDone?"linear-gradient(90deg,#EDEBFF 0%, #fff 70%)":"#fff",border:"1px solid var(--line-soft)",borderRadius:7,padding:"6px 9px",display:"flex",alignItems:"center",gap:8,transition:"color .3s, background .3s"}}>
              <span style={{width:14,height:14,borderRadius:4,border:isDone?"1.5px solid var(--violet)":"1.5px solid var(--line)",background:isDone?"var(--violet)":"#fff",display:"grid",placeItems:"center",flexShrink:0,transition:"all .3s"}}>
                {isDone&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
              <span style={{flex:1,fontSize:10.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textDecorationLine:isDone?"line-through":"none",textDecorationColor:"rgba(122,115,255,.6)"}}>{item}</span>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",background:"#EDEBFF",color:"#4A40B8",padding:"2px 6px",borderRadius:4}}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SupportPreview({ hover, data }: { hover: boolean; data?: TemplatePreviews["support"] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tickets = data?.tickets || [
    {id:"4821",title:"Login fails on Safari 17.x",pri:"high",status:"open",key:"1"},
    {id:"4820",title:"Export CSV column missing",  pri:"med", status:"prog",key:"2"},
    {id:"4819",title:"Typo on settings page",      pri:"low", status:"done",key:"3"},
  ];
  useEffect(() => {
    const root = rootRef.current; if (root) setTimeout(() => animAll(root), 400);
  }, [data]);
  const priColor = (p:string) => p==="high"?"var(--coral)":p==="med"?"var(--gold)":"var(--mint)";
  const priShadow = (p:string) => p==="high"?"0 0 0 3px rgba(255,89,150,.16)":p==="med"?"0 0 0 3px rgba(248,188,66,.18)":"0 0 0 3px rgba(0,212,177,.14)";
  const stBg = (s:string) => s==="open"?"var(--coral-soft)":s==="prog"?"var(--gold-soft)":"var(--mint-soft)";
  const stColor = (s:string) => s==="open"?"#C41763":s==="prog"?"#A36F00":"var(--emerald)";
  const stLabel = (s:string) => s==="open"?"Open":s==="prog"?"In Prog":"Done";
  return (
    <div ref={rootRef} style={{height:"100%",display:"flex",flexDirection:"column",gap:8}}>
      <LiveTag label="QUEUE LIVE"/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:10,color:"var(--ink)",fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"var(--mint)",boxShadow:"0 0 0 3px rgba(0,212,177,.2)",display:"inline-block"}}/>
          {data?.openTickets ?? 23} open tickets
        </span>
        <span style={{fontSize:9.5,color:"var(--ink-mute)",fontFamily:"JetBrains Mono,monospace",fontWeight:600}}>Avg wait <b style={{color:"var(--ink)",fontWeight:700}} data-counter="4" data-suffix="m 12s">{data?.avgWait ?? "4m 12s"}</b></span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5,flex:1,overflow:"hidden"}}>
        {tickets.map((tk: NonNullable<TemplatePreviews["support"]>["tickets"][0]) =>(
          <div key={tk.key} style={{background:"#fff",border:"1px solid var(--line-soft)",borderRadius:7,padding:"6px 9px",display:"flex",alignItems:"center",gap:7,fontSize:11}}>
            <span style={{width:6,height:6,borderRadius:"50%",flexShrink:0,background:priColor(tk.pri),boxShadow:priShadow(tk.pri)}}/>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:9.5,color:"var(--ink-mute)",fontWeight:600}}>#{tk.id}</span>
            <span style={{flex:1,color:"var(--ink)",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:10.5}}>{tk.title}</span>
            <span style={{fontSize:8.5,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",padding:"2px 5px",borderRadius:4,flexShrink:0,background:stBg(tk.status),color:stColor(tk.status)}}>{stLabel(tk.status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveTag({ label }: { label: string }) {
  return (
    <span style={{position:"absolute",top:12,right:12,zIndex:5,display:"inline-flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.9)",border:"1px solid var(--line-soft)",padding:"3px 8px 3px 6px",borderRadius:999,fontSize:9.5,fontWeight:700,letterSpacing:".08em",color:"var(--ink-mute)",backdropFilter:"blur(6px)"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:"var(--mint)",boxShadow:"0 0 0 3px rgba(0,212,177,.2)",animation:"pulse 1.6s ease-in-out infinite",display:"inline-block"}}/>
      {label}
    </span>
  );
}

const PREVIEW_MAP: Record<keyof TemplatePreviews, React.ElementType> = {
  kanban: KanbanPreview, flow: FlowPreview, bars: BarsPreview,
  inventory: InventoryPreview, checklist: ChecklistPreview, support: SupportPreview,
};

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
    <div className={`tpl-launch-overlay ${tmpl?"open":""}`} onClick={e=>{ if((e.target as HTMLElement).classList.contains("tpl-launch-overlay")) onClose(); }}>
      <div className="tpl-launch-card">
        <div style={{height:4,background:"var(--line-soft)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",left:0,top:0,height:"100%",width:progress+"%",background:"linear-gradient(90deg,var(--indigo),var(--coral))",transition:"width .6s cubic-bezier(.4,0,.2,1)"}}/>
        </div>
        <div style={{padding:"24px 28px 20px",borderBottom:"1px solid var(--line-soft)",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:48,height:48,borderRadius:13,display:"grid",placeItems:"center",color:"#fff",fontWeight:800,fontSize:16,boxShadow:"0 8px 22px rgba(99,91,255,.32)",background:tmpl.accent,flexShrink:0}}>
            {tmpl.title.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()}
          </div>
          <div>
            <h4 style={{margin:0,fontSize:18,fontWeight:700,letterSpacing:"-.015em",color:"var(--ink)"}}>{ready?"Workspace ready":`Launching ${tmpl.title}…`}</h4>
            <p style={{margin:"2px 0 0",fontSize:13,color:"var(--ink-mute)"}}>{ready?"Open your new project to start configuring":`Setting up workspace with ${tmpl.cat.toLowerCase()} scaffold`}</p>
          </div>
        </div>
        <div style={{padding:"8px 28px 22px"}}>
          {LAUNCH_STEPS.map((s,i)=>(
            <div key={s.label} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<LAUNCH_STEPS.length-1?"1px dashed var(--line-soft)":undefined}}>
              <span style={{width:22,height:22,borderRadius:"50%",border:states[i]==="done"?"none":states[i]==="run"?"2px solid var(--indigo)":"2px solid var(--line)",background:states[i]==="done"?"var(--mint)":"#fff",flexShrink:0,display:"grid",placeItems:"center",transition:"all .3s"}}>
                {states[i]==="done" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                {states[i]==="run"  && <span style={{width:10,height:10,borderRadius:"50%",border:"2px solid var(--indigo)",borderTopColor:"transparent",animation:"spinV2 .8s linear infinite",display:"block"}}/>}
              </span>
              <span style={{flex:1,fontSize:14,color:states[i]==="idle"?"var(--ink-soft)":"var(--ink)",fontWeight:states[i]==="idle"?400:500}}>{s.label}</span>
              <span style={{fontSize:11,color:"var(--ink-mute)",fontFamily:"JetBrains Mono,monospace"}}>{times[i]}</span>
            </div>
          ))}
        </div>
        <div style={{padding:"18px 28px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,background:"var(--cream)"}}>
          <button onClick={onClose} style={{fontSize:13,color:"var(--ink-mute)",padding:"8px 14px",borderRadius:999,transition:"background .15s"}}>Cancel</button>
          <div style={{fontSize:13,color:"var(--ink-soft)"}}>Setup time <strong style={{color:"var(--ink)",fontWeight:700}}>{tmpl.time}</strong></div>
          <a href="#" style={{background:ready?"linear-gradient(135deg,var(--indigo),var(--coral))":"var(--ink)",color:"#fff",fontSize:13,fontWeight:600,padding:"10px 18px",borderRadius:999,opacity:ready?1:.35,pointerEvents:ready?"auto":"none",display:"inline-flex",alignItems:"center",gap:6,boxShadow:ready?"0 6px 18px rgba(99,91,255,.32)":undefined,transition:"opacity .3s"}}>Open project →</a>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ t, onLaunch, data }: { t: Template; onLaunch: (t: Template) => void; data?: TemplatePreviews[keyof TemplatePreviews] }) {
  const [hover, setHover] = useState(false);
  const PreviewComp = PREVIEW_MAP[t.preview];
  return (
    <div className={`tplv2-card ${hover?"hovering":""}`} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <div style={{position:"absolute",top:0,left:0,width:64,height:4,borderRadius:"0 0 4px 0",zIndex:3,background:t.accent}}/>
      <div style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none",opacity:hover?1:0,transition:"opacity .4s",background:t.glow}}/>
      <div className="tplv2-preview">
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(circle at 12% 18%, rgba(99,91,255,.08), transparent 40%),radial-gradient(circle at 88% 82%, rgba(255,89,150,.06), transparent 40%)"}}/>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"linear-gradient(125deg, transparent 30%, rgba(255,255,255,.55) 50%, transparent 70%)",transform:hover?"translateX(130%)":"translateX(-130%)",transition:"transform .9s cubic-bezier(.22,1,.36,1)"}}/>
        <div style={{position:"relative",zIndex:1,height:"100%",padding:14}}>
          <PreviewComp hover={hover} data={data}/>
        </div>
      </div>
      <div className="tplv2-body">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span className={`tplv2-cat ${t.catCls}`}>{t.cat}</span>
        </div>
        <h3 style={{fontSize:20,fontWeight:700,letterSpacing:"-.02em",color:"var(--ink)",margin:"2px 0 0",lineHeight:1.25}}>{t.title}</h3>
        <p style={{fontSize:13.5,color:"var(--ink-soft)",lineHeight:1.55,margin:0}}>{t.desc}</p>
        <div style={{marginTop:"auto",paddingTop:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",gap:14,fontSize:12.5,color:"var(--ink-mute)"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{t.time}
            </span>
            <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>{t.team}
            </span>
          </div>
          <button onClick={()=>onLaunch(t)} style={{display:"inline-flex",alignItems:"center",gap:hover?10:6,background:"var(--ink)",color:"#fff",padding:"9px 16px",borderRadius:999,fontSize:13,fontWeight:600,transition:"transform .2s, box-shadow .2s, gap .2s",boxShadow:"0 4px 12px rgba(10,37,64,.18)",transform:hover?"translateY(-1px)":undefined}}>
            Use template
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function Templates() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [launchTmpl, setLaunchTmpl] = useState<Template | null>(null);
  const [previewData, setPreviewData] = useState<TemplatePreviews>({});
  
  const visible = TEMPLATES.filter(t => activeFilter==="All" || t.filters.includes(activeFilter));

  useEffect(() => {
    let mounted = true;
    async function fetchPreviews() {
      try {
        const data = await getDemoDashboardPreviews();
        if (mounted && data) setPreviewData(data);
      } catch (err) {
        console.error("Failed to fetch template previews", err);
      }
    }
    fetchPreviews();
    const tid = setInterval(fetchPreviews, 5000);
    return () => { mounted = false; clearInterval(tid); };
  }, []);

  return (
    <>
      <section className="tplv2-section">
        <div aria-hidden="true" style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
          <div style={{position:"absolute",borderRadius:"50%",filter:"blur(70px)",opacity:.55,width:460,height:460,left:-120,top:-80,background:"radial-gradient(circle,rgba(99,91,255,.32),transparent 70%)",animation:"orbV2_1 22s ease-in-out infinite alternate"}}/>
          <div style={{position:"absolute",borderRadius:"50%",filter:"blur(70px)",opacity:.55,width:380,height:380,right:-100,top:60,background:"radial-gradient(circle,rgba(255,89,150,.26),transparent 70%)",animation:"orbV2_2 26s ease-in-out infinite alternate"}}/>
          <div style={{position:"absolute",borderRadius:"50%",filter:"blur(70px)",opacity:.55,width:420,height:420,left:"30%",bottom:-160,background:"radial-gradient(circle,rgba(0,212,177,.22),transparent 70%)",animation:"orbV2_3 28s ease-in-out infinite alternate"}}/>
          <div style={{position:"absolute",borderRadius:"50%",filter:"blur(70px)",opacity:.55,width:300,height:300,right:"18%",bottom:-100,background:"radial-gradient(circle,rgba(248,188,66,.22),transparent 70%)",animation:"orbV2_4 30s ease-in-out infinite alternate"}}/>
        </div>
        <div aria-hidden="true" className="tplv2-dots"/>
        <div className="container-x" style={{position:"relative",zIndex:1}}>
          <span className="tplv2-eyebrow">
            <span style={{width:7,height:7,borderRadius:"50%",background:"var(--indigo)",boxShadow:"0 0 0 4px rgba(99,91,255,.18)",animation:"pulse 2s ease-in-out infinite",display:"inline-block"}}/>
            Templates · v2026.5
          </span>
          <div className="tplv2-head">
            <div>
              <h2 className="tplv2-h2">Ship faster from a<br/><span className="tplv2-grad">proven base</span></h2>
            </div>
            <div className="tplv2-head-right">
              <p className="tplv2-head-sub">Production-ready scaffolds with auth, data, and integrations wired up. Hover any card to see it run — click to launch.</p>
              <a href="#" className="tplv2-browse">Browse all 64 templates →</a>
            </div>
          </div>
          <div className="tplv2-filters-wrap">
            <div className="tplv2-filters-pill">
              {FILTERS.map(f=>(
                <button key={f} className={`tplv2-filter ${activeFilter===f?"active":""}`} onClick={()=>setActiveFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="tplv2-count">Showing <strong>{visible.length}</strong> templates</div>
          </div>
          <div className="tplv2-grid">
            {visible.map(t=>(<TemplateCard key={t.id} t={t} onLaunch={setLaunchTmpl} data={previewData[t.preview]}/>))}
          </div>
        </div>
      </section>
      {launchTmpl && <LaunchModal tmpl={launchTmpl} onClose={()=>setLaunchTmpl(null)}/>}
    </>
  );
}