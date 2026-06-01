
import {  Shield, Plug, Code2, RefreshCw} from 'lucide-react';

// Circle center and radius — smaller radius, tiles pushed further out
const CX = 310;
const CY = 290;
const R  = 145;   // reduced from 190

function circlePoint(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function tileCenter(angleDeg: number, offset: number = 82) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + (R + offset) * Math.cos(rad),
    y: CY + (R + offset) * Math.sin(rad),
  };
}

const LOGOS = [
  { name: 'Slack',        label: 'Slack',         angle: 0   },
  { name: 'HubSpot',      label: 'HubSpot',       angle: 36  },
  { name: 'Gmail',        label: 'Gmail',         angle: 72  },
  { name: 'SAP',          label: 'SAP',           angle: 108 },
  { name: 'Workday',      label: 'Workday',       angle: 144 },
  { name: 'Zapier',       label: 'Zapier',        angle: 180 },
  { name: 'Snowflake',    label: 'Snowflake',     angle: 216 },
  { name: 'Stripe',       label: 'Stripe',        angle: 252 },
  { name: 'Notion',       label: 'Notion',        angle: 288 },
  { name: 'GoogleSheets', label: 'Sheets',        angle: 324 },
];

const CANVAS_W = 620;
const CANVAS_H = 580;

// Tile dimensions
const TILE_SIZE = 82;
const TILE_WIDE = 110;

export default function Integrations() {
  return (
    <section className="w-full bg-[#FAFAFA] text-slate-900 font-sans antialiased relative flex flex-col items-center px-4 sm:px-8 lg:px-16 xl:px-24 py-12 overflow-hidden select-none border-t border-slate-200/40">
      <div className="max-w-[1360px] w-full grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-16 lg:gap-8 items-center relative z-10 mb-6">

        {/* LEFT */}
        <div className="flex flex-col items-start text-left max-w-xl pl-0 lg:pl-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50/60 border border-orange-100 rounded-full mb-8">
            <span className="w-3 h-3 rounded-full bg-orange-500 block" />
            <span className="text-[10px] font-bold tracking-wide text-orange-600 uppercase">Native integrations</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black tracking-[-0.035em] text-slate-900 leading-[1.1] mb-6">
            Connect to the systems your business{' '}
            <span className="text-[#FF6600]">already runs on.</span>
          </h2>

          <div className="text-[12.5px] sm:text-[15px] lg:text-[10px] font-medium text-slate-900 leading-relaxed max-w-[390px] mb-8">
            <p>No migration. No rebuilding. Connect OneAtlas to your existing stack.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8 max-w-[560px]">
      
  {/* Card 1 */}
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
      <Plug className="w-6 h-6 text-orange-500" />
    </div>

    <h4 className="text-[18px] font-black text-slate-900 mb-2">
      Native integrations
    </h4>

    <p className="text-[14px] text-slate-500 leading-relaxed">
      Pre-built connectors that just work.
    </p>
  </div>

  {/* Card 2 */}
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
    <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
      <RefreshCw className="w-6 h-6 text-violet-600" />
    </div>

    <h4 className="text-[18px] font-black text-slate-900 mb-2">
      Real-time sync
    </h4>

    <p className="text-[14px] text-slate-500 leading-relaxed">
      Keep your data accurate and up to date.
    </p>
  </div>

  {/* Card 3 */}
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
      <Shield className="w-6 h-6 text-emerald-600" />
    </div>

    <h4 className="text-[18px] font-black text-slate-900 mb-2">
      Enterprise-grade
    </h4>

    <p className="text-[14px] text-slate-500 leading-relaxed">
      Secure, reliable, and built for scale.
    </p>
  </div>

  {/* Card 4 */}
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
      <Code2 className="w-6 h-6 text-blue-600" />
    </div>

    <h4 className="text-[18px] font-black text-slate-900 mb-2">
      API-first
    </h4>

    <p className="text-[14px] text-slate-500 leading-relaxed">
      Flexible APIs to connect anything.
    </p>
  </div>

</div>
          
        </div>

        {/* RIGHT: Canvas */}
        <div
          className="relative mx-auto overflow-visible"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          {/* SVG: ring + dots + connector lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx={CX} cy={CY} r={R}
              stroke="#FF6600" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.35"
            />
            {LOGOS.map(({ name, angle }) => {
              const dot  = circlePoint(angle);
              const tile = tileCenter(angle);
              return (
                <g key={name}>
                  <line
                    x1={dot.x}  y1={dot.y}
                    x2={tile.x} y2={tile.y}
                    stroke="#FF6600" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.3"
                  />
                  <circle cx={dot.x} cy={dot.y} r="3" fill="#FF6600" opacity="0.75" />
                </g>
              );
            })}
          </svg>

          {/* Central orb */}
          <div
            className="absolute pointer-events-none animate-[orbFloat_6s_ease-in-out_infinite]"
            style={{
              left: CX,
              top:  CY,
              transform: 'translate(-50%, -50%)',
              width: 220,
              height: 220,
            }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0      border border-slate-200/20 rounded-full" />
              <div className="absolute inset-[18px] border border-slate-200/25 rounded-full bg-white/15" />
              <div className="absolute inset-[36px] border border-slate-200/30 rounded-full bg-white/25" />
              <div className="absolute inset-[54px] border border-slate-200/40 rounded-full bg-white/50">
                <div className="absolute inset-[14px] border border-slate-200/50 rounded-full bg-white flex items-center justify-center">
                  <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-orange-400 to-[#FF6600] flex items-center justify-center shadow-[0_4px_16px_rgba(255,102,0,0.25)]">
                    <span className="text-white text-[36px] font-black">A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo tiles with name labels */}
          {LOGOS.map(({ name, label, angle }) => {
            const { x, y } = tileCenter(angle);
            const wide = name === 'Stripe' || name === 'Zapier';
            const tileW = wide ? TILE_WIDE : TILE_SIZE;

            return (
              <div
                key={name}
                className="absolute flex flex-col items-center gap-1.5"
                style={{
                  left: x,
                  top:  y,
                  transform: 'translate(-50%, -50%)',
                  width: tileW + 24, // extra width so label doesn't clip
                }}
              >
                {/* Card */}
                <div
                  className="bg-white border border-[#EDEDED] shadow-[0_4px_16px_rgba(0,0,0,0.012)] flex items-center justify-center rounded-[18px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 w-full"
                  style={{ height: TILE_SIZE }}
                >
                  <LogoComponent name={name} />
                </div>
                {/* Name label */}
                <span className="text-[10.5px] font-semibold text-slate-400 tracking-wide text-center leading-none">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50%       { transform: translate(-50%, -50%) translateY(-6px); }
        }
      `}</style>
    </section>
  );
}

function LogoComponent({ name }: { name: string }) {
  switch (name) {
    case 'Slack':        return <SlackLogo />;
    case 'HubSpot':      return <HubSpotLogo />;
    case 'Gmail':        return <GmailLogo />;
    case 'SAP':          return <SAPLogo />;
    case 'Workday':      return <WorkdayLogo />;
    case 'Zapier':       return <ZapierLogo />;
    case 'Snowflake':    return <SnowflakeLogo />;
    case 'Stripe':       return <StripeLogo />;
    case 'Notion':       return <NotionLogo />;
    case 'GoogleSheets': return <GoogleSheetsLogo />;
    default:             return null;
  }
}

function SlackLogo() {
  return (
    <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none">
      <rect x="15" y="38" width="22" height="22" rx="11" fill="#36C5F0"/>
      <rect x="42" y="15" width="22" height="45" rx="11" fill="#36C5F0"/>
      <rect x="42" y="42" width="22" height="22" rx="11" fill="#2EB67D"/>
      <rect x="42" y="68" width="45" height="22" rx="11" fill="#2EB67D"/>
      <rect x="68" y="42" width="22" height="22" rx="11" fill="#E01E5A"/>
      <rect x="42" y="42" width="22" height="45" rx="11" fill="#E01E5A"/>
      <rect x="38" y="42" width="22" height="22" rx="11" fill="#ECB22E"/>
      <rect x="15" y="42" width="45" height="22" rx="11" fill="#ECB22E"/>
    </svg>
  );
}

function HubSpotLogo() {
  return (
    <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
      <path d="M21.4 10.4c-.4-.4-1-.4-1.4 0l-2.7 2.7c-.8-.5-1.8-.8-2.8-.8v-3.7c.9-.3 1.5-1.1 1.5-2.1 0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2c0 1 .6 1.8 1.5 2.1v3.7c-1 0-2 .3-2.8.8l-2.7-2.7c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l2.7 2.7c-.5.8-.8 1.8-.8 2.8 0 2.9 2.4 5.2 5.2 5.2s5.2-2.4 5.2-5.2c0-1-.3-2-.8-2.8l2.7-2.7c.4-.4.4-1.1 0-1.5zm-9.9-6.6c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7zm3.7 13.5c-1.3 0-2.4-1.1-2.4-2.4s1.1-2.4 2.4-2.4 2.4 1.1 2.4 2.4-1.1 2.4-2.4 2.4z" fill="#FF7A59"/>
    </svg>
  );
}

function GmailLogo() {
  return (
    <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="#EAEAEA"/>
      <path d="M22 6v12c0 1.1-.9 2-2 2h-3V8l-5 4-5-4v12H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h1l7 5 7-5h1c1.1 0 2 .9 2 2z" fill="#C5221F"/>
      <path d="M2 6v2l10 7 10-7V6c0-1.1-.9-2-2-2h-1l-7 5-7-5H4c-1.1 0-2 .9-2 2z" fill="#F22F26"/>
    </svg>
  );
}

function SAPLogo() {
  return (
    <div className="bg-[#003366] text-white font-black text-[15px] px-3 py-1 rounded-sm tracking-tighter">
      SAP
    </div>
  );
}

function WorkdayLogo() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 14.5c-2.5 0-4.5-2-4.5-4.5S9.5 7.5 12 7.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5z" fill="#005CB9"/>
      <path d="M12 9c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" fill="#FFC425"/>
    </svg>
  );
}

function ZapierLogo() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[#FF4A00] font-black text-2xl leading-none -mt-1">_</span>
      <span className="text-slate-800 font-black text-[16px] tracking-tight">zapier</span>
    </div>
  );
}

function SnowflakeLogo() {
  return (
    <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1L19.1 4.9" stroke="#29B6F6" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" fill="#29B6F6"/>
    </svg>
  );
}

function StripeLogo() {
  return (
    <span className="text-[#635BFF] font-black text-[20px] tracking-tight lowercase">stripe</span>
  );
}

function NotionLogo() {
  return (
    <div className="font-serif font-black text-slate-800 text-2xl border-2 border-slate-800 w-9 h-9 flex items-center justify-center rounded-md bg-white">
      N
    </div>
  );
}

function GoogleSheetsLogo() {
  return (
    <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
      <rect x="10" y="4" width="28" height="40" rx="2" fill="#23A566"/>
      <rect x="14" y="12" width="20" height="6" fill="white" opacity="0.9"/>
      <rect x="14" y="20" width="8"  height="6" fill="white" opacity="0.9"/>
      <rect x="26" y="20" width="8"  height="6" fill="white" opacity="0.9"/>
      <rect x="14" y="28" width="8"  height="6" fill="white" opacity="0.9"/>
      <rect x="26" y="28" width="8"  height="6" fill="white" opacity="0.9"/>
    </svg>
  );
}
