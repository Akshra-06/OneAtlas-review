import { Sparkles, Send } from "lucide-react";

export default function ChatPanel() {
  return (
    <div className="bg-white border border-[#E3E8EE] rounded-2xl shadow-sm h-[500px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#EDF1F6] p-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#635BFF]" />
          <h2 className="font-semibold text-[#0A2540]">
            Atlas AI Assistant
          </h2>
        </div>

        <p className="text-sm text-[#697386] mt-1">
          Ask Atlas AI anything about your project
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-[#F6F9FC] rounded-xl p-3 text-sm text-[#425466] max-w-[80%]">
          Hello! How can I help you today?
        </div>

        <div className="ml-auto bg-[#635BFF] text-white rounded-xl p-3 text-sm max-w-[80%]">
          Show me the latest project metrics.
        </div>

        <div className="bg-[#F6F9FC] rounded-xl p-3 text-sm text-[#425466] max-w-[80%]">
          Revenue is up 12%, user growth is up 8%, and conversion rate increased by 1.4%.
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 pb-3 flex gap-2 flex-wrap">
        <button className="text-xs px-3 py-2 rounded-full bg-[#F6F9FC] hover:bg-[#EDF1F6] text-[#425466]">
          Generate report
        </button>

        <button className="text-xs px-3 py-2 rounded-full bg-[#F6F9FC] hover:bg-[#EDF1F6] text-[#425466]">
          Analyze metrics
        </button>

        <button className="text-xs px-3 py-2 rounded-full bg-[#F6F9FC] hover:bg-[#EDF1F6] text-[#425466]">
          Suggest improvements
        </button>
      </div>

      {/* Input */}
      <div className="border-t border-[#EDF1F6] p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask Atlas AI..."
            className="flex-1 border border-[#E3E8EE] rounded-xl px-4 py-3 outline-none focus:border-[#635BFF]"
          />

          <button className="px-4 rounded-xl bg-[#635BFF] text-white flex items-center justify-center">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}