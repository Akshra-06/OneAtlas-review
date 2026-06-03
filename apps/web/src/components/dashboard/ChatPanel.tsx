"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { useBuilderStore } from "@/store/useBuilderStore";
import { useParams } from "next/navigation";

import { useAuthStore } from "@/store/useAuthStore";
import { chatWithAtlas }
  from "@/services/chat";

interface ChatPanelProps {
  onModify: (prompt: string) => void;
}
export default function ChatPanel({
  onModify,
}: ChatPanelProps) {

  const [message, setMessage] = useState("");
const {
  atlasMessages,
  addAtlasMessage,
} = useBuilderStore();

const params = useParams();
const projectId = params.projectId as string;
const { activeOrgId } = useAuthStore();
const handleSend = async () => {
  if (!message.trim()) return;
  if (!activeOrgId) return;

  const userMessage = message;

  addAtlasMessage({
    id: crypto.randomUUID(),
    role: "user",
    content: userMessage,
    createdAt: new Date().toISOString(),
  });

  setMessage("");

  try {
    const result =
      await chatWithAtlas(
        activeOrgId,
        projectId,
        userMessage
      );

    addAtlasMessage({
      id: crypto.randomUUID(),
      role: "assistant",
      content: result.fullText,
      createdAt: new Date().toISOString(),

      action:
        result.requiresRegeneration
          ? {
              type: "modify",
              prompt: userMessage,
            }
          : undefined,
    });
  } catch (error) {
    console.error(error);

    addAtlasMessage({
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Sorry, I couldn't process your request.",
      createdAt: new Date().toISOString(),
    });
  }
};


  return (
    <div className="bg-white border border-[#E3E8EE] rounded-2xl shadow-sm h-[500px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#EDF1F6] p-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#FF6B00]" />
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
  {atlasMessages.length === 0 && (
    <div className="bg-[#F6F9FC] rounded-xl p-3 text-sm text-[#425466] max-w-[80%]">
      Hello! How can I help you today?
    </div>
  )}

  {atlasMessages.map((msg) => (
    <div
      key={msg.id}
      className={
        msg.role === "user"
          ? "ml-auto bg-[#FF6B00] text-white rounded-xl p-3 text-sm max-w-[80%]"
          : "bg-[#F6F9FC] rounded-xl p-3 text-sm text-[#425466] max-w-[80%]"
      }
    >
      <p>{msg.content}</p>
      {msg.progress && (
  <div className="mt-3">
    <div className="flex justify-between text-xs mb-1">
      <span>
        {msg.progress.currentStep}
      </span>

      <span>
        {Math.round(
          (msg.progress.completed /
            msg.progress.total) *
            100
        )}
        %
      </span>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 bg-[#FF6B00] transition-all duration-500 rounded-full"
        style={{
          width: `${
            (msg.progress.completed /
              msg.progress.total) *
            100
          }%`,
        }}
      />
    </div>

    <div className="mt-3 text-xs space-y-1">
      <div>
        {msg.progress.completed >= 1
          ? "✓"
          : "○"}{" "}
        Starting AI generation
      </div>

      <div>
        {msg.progress.completed >= 2
          ? "✓"
          : "○"}{" "}
        Generating blueprint
      </div>

      <div>
        {msg.progress.completed >= 3
          ? "✓"
          : "○"}{" "}
        Saving files
      </div>

      <div>
        {msg.progress.completed >= 4
          ? "✓"
          : "○"}{" "}
        Complete
      </div>
    </div>
  </div>
)}
     {msg.action?.type === "modify" && (
  <div className="flex gap-2 mt-3">
    <button
      onClick={() => {
        if (!msg.action) return;

        onModify(msg.action.prompt);
      }}
      className="px-3 py-2 rounded-lg bg-[#FF6B00] text-white text-xs"
    >
      Apply Changes
    </button>

    <button
      onClick={() => {
        // remove action buttons
      }}
      className="px-3 py-2 rounded-lg bg-gray-200 text-xs"
    >
      Dismiss
    </button>
  </div>
)}
    </div>
  ))}
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
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  }}
  placeholder="Ask Atlas AI..."
  className="flex-1 border border-[#E3E8EE] rounded-xl px-4 py-3 outline-none focus:border-[#FF6B00]"
/>

         <button
  onClick={handleSend}
  className="px-4 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center"
>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}