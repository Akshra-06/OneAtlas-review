import {
  LayoutDashboard,
  Layers3,
  BarChart3,
  Settings,
  User,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-white border-r border-[#E3E8EE] flex flex-col justify-between p-5">
      <div>
        {/* Logo */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#0A2540]">
            Atlas AI
          </h2>
          <p className="text-sm text-[#697386] mt-1">
            Workspace
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FF6B00] text-white font-medium">
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#425466] hover:bg-[#F6F9FC] transition">
            <Layers3 size={18} />
            Templates
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#425466] hover:bg-[#F6F9FC] transition">
            <BarChart3 size={18} />
            Analytics
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#425466] hover:bg-[#F6F9FC] transition">
            <Settings size={18} />
            Settings
          </button>
        </nav>
      </div>

      {/* Profile */}
      <div className="border-t border-[#EDF1F6] pt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#F6F9FC] flex items-center justify-center">
            <User size={18} />
          </div>

          <div>
            <p className="text-sm font-medium text-[#0A2540]">
              Atlas User
            </p>
            <p className="text-xs text-[#697386]">
              Workspace Member
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}