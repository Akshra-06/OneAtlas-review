import { useState } from 'react';
import {
  Settings2,
  Sparkles,
  Code2,
  TrendingUp,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  Wrench,
  PieChart,
  Bot,
  Rocket,
  Shield,
  Layers,
  Lock,
  Zap,
  Eye,
  DollarSign,
  Database,
  Users
} from 'lucide-react';

type TeamCard = {
  id: number;
  role: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  cardBg: string;
  illustrationBg: string;
  accentColor: string;
  features: { label: string; icon: React.ElementType }[];
  illustration: React.ReactNode;
};

function OpsIllustration() {
  return (
    <svg width="100%" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="80" y="4" width="40" height="22" rx="6" fill="#fdba74" opacity="0.9"/>
      <text x="100" y="19" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7c2d12">Start</text>
      <line x1="100" y1="26" x2="100" y2="36" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="68" y="36" width="64" height="22" rx="6" fill="#fb923c" opacity="0.85"/>
      <text x="100" y="51" textAnchor="middle" fontSize="9" fontWeight="600" fill="#fff">Review</text>
      <line x1="100" y1="58" x2="100" y2="62" stroke="#ea580c" strokeWidth="1.5"/>
      <polygon points="100,67 96,62 104,62" fill="#ea580c"/>
      <line x1="68" y1="47" x2="44" y2="47" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="12" y="38" width="32" height="18" rx="5" fill="#fed7aa" opacity="0.8"/>
      <text x="28" y="50" textAnchor="middle" fontSize="8" fill="#7c2d12">Ops</text>
      <line x1="132" y1="47" x2="156" y2="47" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="156" y="38" width="32" height="18" rx="5" fill="#fed7aa" opacity="0.8"/>
      <text x="172" y="50" textAnchor="middle" fontSize="8" fill="#7c2d12">Done</text>
    </svg>
  );
}

function ProductIllustration() {
  return (
    <svg width="100%" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="100" y="6" width="90" height="66" rx="8" fill="#c4b5fd" opacity="0.35"/>
      <rect x="106" y="13" width="78" height="8" rx="3" fill="#a78bfa" opacity="0.6"/>
      <rect x="106" y="26" width="36" height="24" rx="4" fill="#c4b5fd" opacity="0.65"/>
      <rect x="146" y="26" width="38" height="11" rx="3" fill="#ddd6fe" opacity="0.8"/>
      <rect x="146" y="40" width="38" height="10" rx="3" fill="#ddd6fe" opacity="0.8"/>
      <rect x="106" y="56" width="78" height="8" rx="3" fill="#a78bfa" opacity="0.35"/>
      <circle cx="46" cy="40" r="26" fill="#8b5cf6" opacity="0.12"/>
      <circle cx="46" cy="40" r="17" fill="#8b5cf6" opacity="0.2"/>
      <circle cx="46" cy="40" r="9" fill="#7c3aed" opacity="0.65"/>
    </svg>
  );
}

function EngineeringIllustration() {
  return (
    <svg width="100%" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="8" width="130" height="62" rx="8" fill="#bfdbfe" opacity="0.45"/>
      <rect x="28" y="16" width="114" height="8" rx="3" fill="#93c5fd" opacity="0.7"/>
      <rect x="28" y="28" width="76" height="6" rx="2" fill="#bfdbfe" opacity="0.9"/>
      <rect x="28" y="38" width="96" height="6" rx="2" fill="#bfdbfe" opacity="0.9"/>
      <rect x="28" y="48" width="64" height="6" rx="2" fill="#bfdbfe" opacity="0.9"/>
      <rect x="128" y="36" width="36" height="26" rx="7" fill="#3b82f6" opacity="0.8"/>
      <text x="146" y="53" textAnchor="middle" fontSize="14" fill="#fff">🔒</text>
    </svg>
  );
}

function BizIllustration() {
  return (
    <svg width="100%" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="10" width="160" height="58" rx="8" fill="#bbf7d0" opacity="0.4"/>
      <polyline points="32,58 68,42 108,50 168,18" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="32" cy="58" r="3.5" fill="#16a34a"/>
      <circle cx="68" cy="42" r="3.5" fill="#16a34a"/>
      <circle cx="108" cy="50" r="3.5" fill="#16a34a"/>
      <circle cx="168" cy="18" r="3.5" fill="#16a34a"/>
      <rect x="140" y="34" width="38" height="20" rx="5" fill="#4ade80" opacity="0.45"/>
      <text x="159" y="48" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="700">+24%</text>
    </svg>
  );
}

const teamCards: TeamCard[] = [
  {
    id: 1,
    role: 'Operations',
    icon: Settings2,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    cardBg: 'bg-orange-50',
    illustrationBg: 'bg-orange-100/60',
    accentColor: 'text-orange-600',
    features: [
      { label: 'Approvals', icon: CheckCircle2 },
      { label: 'Requests', icon: ClipboardList },
      { label: 'Compliance', icon: ShieldCheck },
      { label: 'Visibility', icon: BarChart3 },
    ],
    illustration: <OpsIllustration />,
  },
  {
    id: 2,
    role: 'Product Teams',
    icon: Sparkles,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-100',
    cardBg: 'bg-violet-50',
    illustrationBg: 'bg-violet-100/60',
    accentColor: 'text-violet-600',
    features: [
      { label: 'Tools', icon: Wrench },
      { label: 'Analytics', icon: PieChart },
      { label: 'AI Copilots', icon: Bot },
      { label: 'Prototyping', icon: Rocket },
    ],
    illustration: <ProductIllustration />,
  },
  {
    id: 3,
    role: 'Engineering',
    icon: Code2,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    cardBg: 'bg-blue-50',
    illustrationBg: 'bg-blue-100/60',
    accentColor: 'text-blue-600',
    features: [
      { label: 'Governance', icon: Shield },
      { label: 'Reusable', icon: Layers },
      { label: 'Secure', icon: Lock },
      { label: 'Deploy Faster', icon: Zap },
    ],
    illustration: <EngineeringIllustration />,
  },
  {
    id: 4,
    role: 'Business Leaders',
    icon: TrendingUp,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    cardBg: 'bg-emerald-50',
    illustrationBg: 'bg-emerald-100/60',
    accentColor: 'text-emerald-600',
    features: [
      { label: 'Visibility', icon: Eye },
      { label: 'Cost Savings', icon: DollarSign },
      { label: 'Data Driven', icon: Database },
      { label: 'Scale Growth', icon: Users },
    ],
    illustration: <BizIllustration />,
  },
];

export default function TeamsSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="w-full bg-[#FAFAFA] text-slate-900 overflow-hidden relative font-sans antialiased px-8 sm:px-16 lg:px-24 py-20">

      {/* Subtle radial glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.04)_0%,transparent_65%)] pointer-events-none" />

      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[0.38fr_0.62fr] gap-12 items-center relative z-10">

        {/* LEFT: Text */}
        <div className="flex flex-col items-start gap-5">
          <div className="inline-flex items-center px-3 py-1 bg-violet-100 rounded-full">
            <span className="text-[11px] font-bold tracking-[0.14em] text-violet-700 uppercase">Teams</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-[1.08] tracking-tight">
            Built for every team<span className="text-violet-600">.</span>
          </h2>

          <p className="text-[14px] font-medium text-slate-500 leading-relaxed max-w-[280px]">
            OneAtlas helps every function build operational software, faster.
          </p>

          <div className="w-10 h-[3px] bg-violet-600 rounded-full" />
          <div className="mt-6 flex flex-col gap-4">

  {/* Avatar Row */}
  <div className="flex items-center">
    <div className="flex -space-x-1">
      {[
        "https://i.pravatar.cc/80?img=1",
        "https://i.pravatar.cc/80?img=12",
        "https://i.pravatar.cc/80?img=32",
        "https://i.pravatar.cc/80?img=14",
        "https://i.pravatar.cc/80?img=5",
      ].map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="w-9 h-9 rounded-full border-[3px] border-white object-cover shadow-sm"
        />
      ))}
    </div>

    <div className="ml-2 w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm border border-white shadow-sm">
      +
    </div>
  </div>

  {/* Trust Copy */}
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
      <Users className="w-5 h-5 text-violet-600" />
    </div>

    <p className="text-[13px] leading-relaxed text-slate-500 max-w-[320px]">
      Trusted by operations, product, engineering, and business teams worldwide.
    </p>
  </div>

</div>
        </div>

        {/* RIGHT: 2×2 Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamCards.map((card) => {
            const Icon = card.icon;
            const isHovered = hoveredCard === card.id;

            return (
              <div
                key={card.id}
                className={`${card.cardBg} rounded-2xl p-5 flex flex-col gap-4 cursor-pointer transition-all duration-200 ${isHovered ? '-translate-y-1 shadow-lg' : 'shadow-sm'}`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-[16px] tracking-tight">{card.role}</h3>
                </div>

                {/* Illustration */}
                <div className={`rounded-xl ${card.illustrationBg} px-3 py-2 overflow-hidden`}>
                  {card.illustration}
                </div>

                {/* Feature Tags */}
                <div className="grid grid-cols-4 gap-2">
                  {card.features.map(({ label, icon: FIcon }) => (
                    <div
                      key={label}
                      className="bg-white/70 rounded-xl py-2 px-1 flex flex-col items-center gap-1.5"
                    >
                      <FIcon className={`w-4 h-4 ${card.iconColor}`} strokeWidth={2} />
                      <span className="text-[10px] font-semibold text-slate-500 text-center leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
