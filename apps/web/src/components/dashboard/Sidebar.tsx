export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full p-4">
      <div className="font-bold text-xl mb-6">
        Atlas AI
      </div>

      <nav className="flex flex-col gap-3">
        <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
          Dashboard
        </button>

        <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
          Templates
        </button>

        <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
          Analytics
        </button>

        <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
          Settings
        </button>
      </nav>
    </div>
  );
}