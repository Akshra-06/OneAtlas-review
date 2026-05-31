export default function ChatPanel() {
  return (
    <div className="bg-white border border-[#E3E8EE] rounded-2xl shadow-sm h-[420px] flex flex-col">
      <div className="border-b border-[#EDF1F6] p-4">
        <h2 className="font-semibold text-[#0A2540]">
          Atlas AI Assistant
        </h2>
        <p className="text-sm text-[#697386]">
          Ask Atlas AI anything about your project
        </p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-[#F6F9FC] rounded-xl p-3 text-sm text-[#425466] max-w-[80%]">
          Hello! How can I help you today?
        </div>
      </div>

      <div className="border-t border-[#EDF1F6] p-4">
        <input
          type="text"
          placeholder="Ask Atlas AI..."
          className="w-full border border-[#E3E8EE] rounded-xl px-4 py-3 outline-none focus:border-[#635BFF]"
        />
      </div>
    </div>
  );
}