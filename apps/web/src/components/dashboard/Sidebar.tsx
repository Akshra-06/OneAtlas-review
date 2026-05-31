export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-[#E3E8EE] rounded-2xl p-5 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#0A2540]">
          Atlas AI
        </h2>
        <p className="text-sm text-[#697386]">
          Workspace
        </p>
      </div>

      <nav className="space-y-2">
        <button className="w-full text-left px-4 py-3 rounded-xl bg-[#635BFF] text-white font-medium">
          Dashboard
        </button>

        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#F6F9FC] text-[#425466]">
          Templates
        </button>

        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#F6F9FC] text-[#425466]">
          Analytics
        </button>

        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#F6F9FC] text-[#425466]">
          Settings
        </button>
      </nav>
    </aside>
  );
}