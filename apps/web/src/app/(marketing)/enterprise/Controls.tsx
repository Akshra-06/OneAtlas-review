"use client";
import { useState } from 'react';
import { 
   Shield,
  ClipboardCheck, 
  Lock, 
  CheckSquare,
  Users,
  CheckCircle2,
  FileText,
  Clock,
  ChevronRight,
  Code2,
  Cloud,
  LayoutGrid,
  RefreshCw,
  Rocket,
} from 'lucide-react';

export default function EnterpriseControls() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="w-full bg-[#FAFAFA] text-slate-900 font-sans antialiased relative flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-[4px] overflow-hidden select-none border-t border-slate-200/40">

      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.025)_0%,rgba(255,255,255,0)_70%)] pointer-events-none z-0" />

      {/* Single full-width layout — left text + right 3 cards, all at same level */}
      <div className="max-w-[1360px] w-full grid grid-cols-1 lg:grid-cols-[0.38fr_0.62fr] gap-10 lg:gap-8 items-start relative z-10">

        {/* ==================== LEFT COLUMN ==================== */}
        <div className="flex flex-col items-start text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-orange-200/60 rounded-full mb-6 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <span className="w-3 h-3 rounded-full border border-orange-500/20 flex items-center justify-center p-0.5 bg-white">
              <span className="w-full h-full rounded-full bg-orange-500" />
            </span>
            <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase">Enterprise controls</span>
          </div>

          {/* Headline */}
          <h2 className="text-[40px] sm:text-[46px] font-black tracking-[-0.035em] text-[#0A1124] leading-[1.06] mb-4">
            Enterprise controls, <br />
            <span className="text-[#FF6600]">built in.</span>
          </h2>
          
          <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-8 max-w-[300px]">
            Give teams the freedom to build with guardrails.
          </p>

          {/* Security illustration */}
          <div className="relative w-full max-w-[320px] h-[200px] mb-8">
            {/* Central lock card */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] bg-white rounded-[22px] shadow-[0_8px_32px_rgba(255,102,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center z-10 border border-orange-100/60">
              <div className="w-[64px] h-[64px] bg-gradient-to-br from-orange-200/50 to-orange-400/20 rounded-xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#FF6600]" strokeWidth={1.8} />
              </div>
            </div>

            {/* SVG connector lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 200" fill="none">
              <path d="M64,46 Q95,78 148,95"  stroke="#FF6600" strokeWidth="1.2" strokeDasharray="4 3" strokeOpacity="0.35" strokeLinecap="round"/>
              <path d="M256,46 Q225,78 172,95"  stroke="#FF6600" strokeWidth="1.2" strokeDasharray="4 3" strokeOpacity="0.35" strokeLinecap="round"/>
              <path d="M64,158 Q98,128 148,112"  stroke="#FF6600" strokeWidth="1.2" strokeDasharray="4 3" strokeOpacity="0.35" strokeLinecap="round"/>
              <path d="M256,158 Q222,128 172,112" stroke="#FF6600" strokeWidth="1.2" strokeDasharray="4 3" strokeOpacity="0.35" strokeLinecap="round"/>
              <circle cx="64"  cy="46"  r="2.5" fill="#FF6600" opacity="0.55"/>
              <circle cx="256" cy="46"  r="2.5" fill="#FF6600" opacity="0.55"/>
              <circle cx="64"  cy="158" r="2.5" fill="#FF6600" opacity="0.55"/>
              <circle cx="256" cy="158" r="2.5" fill="#FF6600" opacity="0.55"/>
            </svg>

            {/* Teams - top left */}
            <div className="absolute top-[18px] left-[28px] flex flex-col items-center gap-1.5">
              <div className="w-[48px] h-[48px] bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[#FF6600]" strokeWidth={2}/>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Teams</span>
            </div>
            {/* Apps - top right */}
            <div className="absolute top-[18px] right-[28px] flex flex-col items-center gap-1.5">
              <div className="w-[48px] h-[48px] bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-purple-500" strokeWidth={2}/>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Apps</span>
            </div>
            {/* Environments - bottom left */}
            <div className="absolute bottom-[10px] left-[8px] flex flex-col items-center gap-1.5">
              <div className="w-[48px] h-[48px] bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-slate-600" strokeWidth={2}/>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Environments</span>
            </div>
            {/* Data - bottom right */}
            <div className="absolute bottom-[10px] right-[8px] flex flex-col items-center gap-1.5">
              <div className="w-[48px] h-[48px] bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.06)] flex items-center justify-center">
                <Cloud className="w-5 h-5 text-blue-500" strokeWidth={2}/>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Data</span>
            </div>
          </div>

          
        </div>

        {/* ==================== RIGHT COLUMN: 3 CARDS ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 translate-y-12 w-full items-stretch">

          {/* CARD 1: PERMISSIONS */}
          <div
            className={`bg-white border border-[#EDEDED] rounded-[20px] p-5 flex flex-col gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.006)] transition-all duration-300 cursor-pointer ${hoveredCard === 1 ? 'shadow-[0_12px_28px_rgba(0,0,0,0.015)] -translate-y-0.5' : ''}`}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Users className="w-4.5 h-4.5 text-[#FF6600]" strokeWidth={2.3}/>
              </div>
              <h3 className="text-[15px] font-black text-slate-800 tracking-tight">Permissions</h3>
            </div>

            {/* Network diagram */}
            <div className="relative w-full h-[170px] bg-gradient-to-b from-orange-50/40 to-white rounded-2xl overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 220 170" fill="none">
                <line x1="54"  y1="52"  x2="110" y2="85" stroke="#FF6600" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4"/>
                <line x1="166" y1="52"  x2="110" y2="85" stroke="#FF6600" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4"/>
                <line x1="54"  y1="130" x2="110" y2="85" stroke="#FF6600" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4"/>
                <line x1="166" y1="130" x2="110" y2="85" stroke="#FF6600" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4"/>
              </svg>
              {/* Center */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[46px] h-[46px] rounded-full bg-[#FF6600] flex items-center justify-center shadow-[0_4px_12px_rgba(255,102,0,0.3)] z-10 border-2 border-white">
                <Users className="w-5 h-5 text-white" strokeWidth={2}/>
              </div>
              {/* JC */}
              <div className="absolute top-[26px] left-[26px] flex flex-col items-center gap-1">
                <div className="w-[34px] h-[34px] rounded-full bg-orange-100 text-orange-700 text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">JC</div>
                <span className="text-[9px] font-bold text-slate-500">Admin</span>
              </div>
              {/* RE */}
              <div className="absolute top-[26px] right-[26px] flex flex-col items-center gap-1">
                <div className="w-[34px] h-[34px] rounded-full bg-purple-100 text-purple-700 text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">RE</div>
                <span className="text-[9px] font-bold text-slate-500">Editor</span>
              </div>
              {/* CF */}
              <div className="absolute bottom-[18px] left-[26px] flex flex-col items-center gap-1">
                <div className="w-[34px] h-[34px] rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">CF</div>
                <span className="text-[9px] font-bold text-slate-500">Viewer</span>
              </div>
              {/* MW */}
              <div className="absolute bottom-[18px] right-[26px] flex flex-col items-center gap-1">
                <div className="w-[34px] h-[34px] rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">MW</div>
                <span className="text-[9px] font-bold text-slate-500">Viewer</span>
              </div>
            </div>

            {/* Avatar stack */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['bg-orange-400','bg-purple-400','bg-blue-400'].map((bg,i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${bg} border-2 border-white`}/>
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-500">+24</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-1 text-[10px] font-black tracking-wide text-slate-400">
              <span className={hoveredCard === 1 ? 'text-[#FF6600]' : ''}>Teams with the right access</span>
              <ChevronRight size={11} className={hoveredCard === 1 ? 'translate-x-0.5 text-[#FF6600]' : ''} strokeWidth={2.5}/>
            </div>
          </div>

          {/* CARD 2: APPROVALS */}
          <div
            className={`bg-white border border-[#EDEDED] rounded-[20px] p-5 flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.006)] transition-all duration-300 cursor-pointer ${hoveredCard === 2 ? 'shadow-[0_12px_28px_rgba(0,0,0,0.015)] -translate-y-0.5' : ''}`}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <CheckSquare className="w-4.5 h-4.5 text-[#FF6600]" strokeWidth={2.3}/>
              </div>
              <h3 className="text-[15px] font-black text-slate-800 tracking-tight">Approvals</h3>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 text-[#FF6600]" strokeWidth={2.5}/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-bold text-slate-700 truncate">Update customer m...</p>
                  <p className="text-[9.5px] font-semibold text-slate-400">Data Team</p>
                </div>
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" strokeWidth={2.5}/>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-black">RE</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-bold text-slate-700 truncate">Review</p>
                  <p className="text-[9.5px] font-semibold text-slate-400">Data Team</p>
                </div>
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" strokeWidth={2.5}/>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-black">EL</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-bold text-slate-700 truncate">Approve</p>
                  <p className="text-[9.5px] font-semibold text-slate-400">Engineering Lead</p>
                </div>
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" strokeWidth={2.5}/>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Rocket className="w-3.5 h-3.5 text-purple-600" strokeWidth={2.2}/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-bold text-slate-700 truncate">Ready for production</p>
                </div>
              </div>
            </div>

            <button className="w-full py-2.5 bg-[#FF6600] hover:bg-[#e65c00] text-white text-[12px] font-black rounded-xl transition-colors duration-200">
              12 pending reviews
            </button>
          </div>

          {/* CARD 3: AUDIT LOGS */}
          <div
            className={`bg-white border border-[#EDEDED] rounded-[20px] p-5 flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.006)] transition-all duration-300 cursor-pointer ${hoveredCard === 3 ? 'shadow-[0_12px_28px_rgba(0,0,0,0.015)] -translate-y-0.5' : ''}`}
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5 text-[#FF6600]" strokeWidth={2.3}/>
              </div>
              <h3 className="text-[15px] font-black text-slate-800 tracking-tight">Audit logs</h3>
            </div>

            <div className="flex flex-col gap-2.5 flex-1">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" strokeWidth={2.5}/>
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-bold text-slate-700 leading-tight">Deployment succeeded</p>
                  <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5">by Jane Cooper</p>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-400 shrink-0">
                  <Clock size={9}/><span>2m ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <RefreshCw size={14} className="text-orange-400 mt-0.5 shrink-0" strokeWidth={2.5}/>
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-bold text-slate-700 leading-tight">Workflow updated</p>
                  <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5">by Ralph Edwards</p>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-400 shrink-0">
                  <Clock size={9}/><span>14m ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users size={14} className="text-orange-400 mt-0.5 shrink-0" strokeWidth={2.5}/>
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-bold text-slate-700 leading-tight">Permission changed</p>
                  <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5">by Jane Cooper</p>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-medium text-slate-400 shrink-0">
                  <Clock size={9}/><span>1h ago</span>
                </div>
              </div>

              <div className="mt-1 rounded-xl bg-orange-50/60 border border-orange-100/50 p-3 flex items-end gap-3">
                <svg viewBox="0 0 90 48" className="flex-1 h-[48px]" fill="none">
                  <polyline points="4,38 20,28 36,32 52,18 68,22 86,8" stroke="#FF6600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="4"  cy="38" r="2.5" fill="#FF6600"/>
                  <circle cx="20" cy="28" r="2.5" fill="#FF6600"/>
                  <circle cx="36" cy="32" r="2.5" fill="#FF6600"/>
                  <circle cx="52" cy="18" r="2.5" fill="#FF6600"/>
                  <circle cx="68" cy="22" r="2.5" fill="#FF6600"/>
                  <circle cx="86" cy="8"  r="2.5" fill="#FF6600"/>
                </svg>
                <svg viewBox="0 0 44 48" className="h-[48px] w-[44px]" fill="none">
                  <rect x="2"  y="24" width="8" height="22" rx="2" fill="#FF6600" opacity="0.3"/>
                  <rect x="14" y="14" width="8" height="32" rx="2" fill="#FF6600" opacity="0.55"/>
                  <rect x="26" y="30" width="8" height="16" rx="2" fill="#FF6600" opacity="0.3"/>
                  <rect x="38" y="8"  width="8" height="38" rx="2" fill="#FF6600" opacity="0.75"/>
                </svg>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] font-black tracking-wide text-slate-400">
              <span className={hoveredCard === 3 ? 'text-[#FF6600]' : ''}>Real-time activity across teams</span>
              <ChevronRight size={11} className={hoveredCard === 3 ? 'translate-x-0.5 text-[#FF6600]' : ''} strokeWidth={2.5}/>
            </div>
          </div>

        </div>
      </div>
      <div className="max-w-[1360px] w-full mt-20 relative z-10">
  <div className="bg-white border border-slate-200 rounded-[20px] px-8 py-4">

    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4 text-[#FF6600]" />
        <span className="text-[13px] font-bold text-slate-700">
          Permissions
        </span>
      </div>

      <div className="flex-1 mx-4 border-t border-dashed border-slate-300" />

      <div className="flex items-center gap-3">
        <ClipboardCheck className="w-4 h-4 text-purple-500" />
        <span className="text-[13px] font-bold text-slate-700">
          Reviews
        </span>
      </div>

      <div className="flex-1 mx-4 border-t border-dashed border-slate-300" />

      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span className="text-[13px] font-bold text-slate-700">
          Approvals
        </span>
      </div>

      <div className="flex-1 mx-4 border-t border-dashed border-slate-300" />

      <div className="flex items-center gap-3">
        <Rocket className="w-4 h-4 text-blue-500" />
        <span className="text-[13px] font-bold text-slate-700">
          Deployments
        </span>
      </div>

      <div className="flex-1 mx-4 border-t border-dashed border-slate-300" />

      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4 text-amber-500" />
        <span className="text-[13px] font-bold text-slate-700">
          Audit Logs
        </span>
      </div>

    </div>

  </div>
</div>
      

    </section>
  );
}
