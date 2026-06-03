"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/store/useBuilderStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  generateApp,
  modifyApp,
} from "@/services/builder";
import { getProjects } from "@/services/projects";
import { Project } from "@/types";
import KpiCard from "@/components/dashboard/KpiCard";
import Sidebar from "@/components/dashboard/Sidebar";
import ChatPanel from "@/components/dashboard/ChatPanel";

  type GenerationStep =
  | "idle"
  | "initializing"
  | "blueprint"
  | "saving"
  | "completed"
  | "failed";
interface BuilderClientProps {
  projectId: string;
}


export function BuilderClient({ projectId }: BuilderClientProps) {
  const { orgId, getToken } = useAuth();
  const { activeOrgId, setActiveOrgId } = useAuthStore();

  const hasCheckedAutoStart = useRef(false);

  // Sync orgId with Zustand
  useEffect(() => {
    if (orgId) {
      setActiveOrgId(orgId);
    }
  }, [orgId, setActiveOrgId]);

 const {
  prompt,
  selectedModel,
  sseState,
  streamLogs,
  generationResult,
  errorMessage,
  previewUrl,
  previewReady,
updateAtlasMessage,
  requiresRegeneration,
  pendingRegenerationPrompt,
  setPendingRegenerationPrompt,
  setRequiresRegeneration,
addAtlasMessage,
  setPrompt,
  setModel,
  setSseState,
  setGenerationPhase,
  addLog,
  setGenerationResult,
  setErrorMessage,
  setPreviewUrl,
  setPreviewReady,
  abortController,
  setAbortController,
  resetBuilder,
} = useBuilderStore();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);




const [generationStep, setGenerationStep] =
  useState<GenerationStep>("idle");

const [friendlyError, setFriendlyError] =
  useState<{
    title: string;
    message: string;
    action: string;
  } | null>(null);




const [showLogs, setShowLogs] = useState(false);

  // Load project details
  useEffect(() => {
    async function loadProject() {
      if (!activeOrgId || !projectId) return;
      try {
        const token = await getToken();
        if (!token) return;
        const projects = await getProjects(activeOrgId, token);
        const p = projects.find(p => p.id === projectId);
        if (p) {
          setProject(p);
          let currentPrompt = prompt;
          if (p.prompt && !prompt) {
            setPrompt(p.prompt);
            currentPrompt = p.prompt;
          }
          if (p.generatedCode) {
            setGenerationResult(p.generatedCode);
            setSseState("completed");
          } else if (currentPrompt && !hasCheckedAutoStart.current) {
            hasCheckedAutoStart.current = true;
            handleGenerate(currentPrompt);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [activeOrgId, projectId, getToken]);


  function classifyError(error: string) {
  const lower = error.toLowerCase();

  if (
    lower.includes("quota") ||
    lower.includes("429")
  ) {
    return {
      title: "AI Credits Exhausted",
      message:
        "The selected AI provider has reached its usage limit.",
      action:
        "Add credits or switch to another provider."
    };
  }

  if (
    lower.includes("api key") ||
    lower.includes("401")
  ) {
    return {
      title: "Provider Authentication Failed",
      message:
        "The configured AI provider credentials are invalid.",
      action:
        "Update the API key and try again."
    };
  }

  if (
    lower.includes("timeout")
  ) {
    return {
      title: "Request Timed Out",
      message:
        "The AI provider took too long to respond.",
      action:
        "Retry generation."
    };
  }

  return {
    title: "Generation Failed",
    message:
      "Atlas AI could not complete generation.",
    action:
      "Retry generation."
  };
}

  const handleGenerate = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || prompt;
    if (!activeOrgId || !projectId || !promptToUse.trim()) return;
    const token = await getToken();
    if (!token) return;

    resetBuilder();
    setProgress(0);
setGenerationStep("idle");
setFriendlyError(null);
setShowLogs(false);

    setPrompt(promptToUse); // restore prompt after reset
    setSseState("connecting");
    setErrorMessage(null);

    const controller = new AbortController();
    setAbortController(controller);

    generateApp(
      activeOrgId,
      projectId,
      token,
      { prompt: promptToUse, model: selectedModel },
      controller.signal,
      (event, data) => {
        const text = (key: string) =>
          typeof data[key] === "string" ? data[key] : "";

        if (event === "status") {
          setSseState("streaming");
  const step = text("step");

  if (step === "init") {
    setGenerationStep("initializing");
  }

  if (step === "generation") {
    setGenerationStep("blueprint");
  }

  if (step === "saving") {
    setGenerationStep("saving");
  }


          addLog(text("step"), text("message"));
        } else if (event === "provider") {
          setSseState("streaming");
          setGenerationPhase("provider_selection");
          addLog("provider", text("message"));
        } else if (event === "fallback") {
          setSseState("streaming");
          setGenerationPhase("fallback");
          addLog("fallback", text("message"));
        } else if (event === "retry") {
          setSseState("streaming");
          setGenerationPhase("retry");
          addLog("retry", text("message"));
        } else if (event === "progress") {
  setGenerationPhase(text("phase"));

  const completed =
    typeof data.completed === "number" ? data.completed : 0;

  const total =
    typeof data.total === "number" ? data.total : 1;

  setProgress(Math.round((completed / total) * 100));
        } else if (event === "done") {
          setGenerationPhase("complete");
          const provider = text("provider") || "AI";
          const model = text("model");
          addLog("done", `Completed with ${provider.toUpperCase()} ${model ? `(${model})` : ""}`);
          const previewUrl = text("previewUrl");
          if (previewUrl) {
            setPreviewUrl(previewUrl);
          }
        } else if (event === "error") {
  const message = text("message");

  setSseState("error");
  setGenerationPhase("error");
  setGenerationStep("failed");

  setErrorMessage(message);

  setFriendlyError(
    classifyError(message)
  );
}
      },
      () => {

  setSseState("completed");
  setGenerationStep("completed");
  setProgress(100);
        setAbortController(null);
        // Refresh project to get generated code
        setTimeout(async () => {
           const tk = await getToken();
           if(tk) {
             const projs = await getProjects(activeOrgId, tk);
             const p = projs.find(p => p.id === projectId);
             if (p?.generatedCode) setGenerationResult(p.generatedCode);
           }
        }, 1000);
      },
      (err) => {
        setSseState("error");
        setErrorMessage(err);
        setGenerationStep("failed");
setFriendlyError(
  classifyError(err)
);
        setAbortController(null);
      }
    );
  };


const handleApplyRegeneration = async () => {
  const regenerationPrompt =
    pendingRegenerationPrompt;

  if (!regenerationPrompt) return;

  setRequiresRegeneration(false);
  setPendingRegenerationPrompt(null);

  await handleGenerate(
    regenerationPrompt
  );
};


  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setSseState("idle");
      addLog("cancelled", "Generation cancelled by user.");
    }
  };
const handleModifyApp = async (
  prompt: string
) => {
  if (!activeOrgId) return;

  const token = await getToken();

  if (!token) return;

  const controller =
    new AbortController();

  setAbortController(controller);

  const progressId =
    crypto.randomUUID();

  addAtlasMessage({
    id: progressId,
    role: "assistant",
    content: "Applying changes...",
    createdAt: new Date().toISOString(),
    progress: {
      currentStep: "init",
      completed: 0,
      total: 4,
    },
  });

  await modifyApp(
    activeOrgId,
    projectId,
    token,
    prompt,
    controller.signal,

    (event, data) => {
      if (event === "status") {
        updateAtlasMessage(
          progressId,
          {
            progress: {
              currentStep:
                typeof data.step === "string"
                  ? data.step
                  : "init",

              completed:
                data.step === "init"
                  ? 1
                  : data.step === "generation"
                  ? 2
                  : data.step === "saving"
                  ? 3
                  : 4,

              total: 4,
            },
          }
        );
      }
    },

    () => {
      updateAtlasMessage(
        progressId,
        {
          content:
            "✅ Modification complete",

          progress: {
            currentStep: "complete",
            completed: 4,
            total: 4,
          },
        }
      );
    },

    (error) => {
      let message =
        "Modification failed";

      try {
        const jsonStart =
          error.indexOf("{");

        if (jsonStart !== -1) {
          const parsed =
            JSON.parse(
              error.slice(jsonStart)
            );

          message =
            parsed?.error?.message ??
            message;
        }
      } catch {}

      updateAtlasMessage(
        progressId,
        {
          content: `❌ ${message}`,
        }
      );
    }
  );
};
  return (
    <main className="min-h-screen bg-[#FAFBFF] flex flex-col">
      <header className="px-8 py-5 border-b border-[#EDF1F6] bg-white flex items-center justify-between">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 font-medium">
            {loading ? "Loading..." : project?.name || "Unknown Project"}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <UserButton />
        </div>
      </header>

      <div className="flex-1 flex px-6 py-8 gap-8 max-w-7xl mx-auto w-full">
        <Sidebar />
        {/* Left column: Controls */}
        <div className="w-[400px] flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#EDF1F6] shadow-sm flex flex-col gap-4">


            <h2 className="text-lg font-semibold text-[#0A2540]">Generation Prompt</h2>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the application you want to build..."
              className="w-full h-32 p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 resize-none text-sm"
              disabled={sseState === "connecting" || sseState === "streaming"}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Model Tier</label>
              <select
                value={selectedModel}
                onChange={(e) => setModel(e.target.value as "FAST" | "SMART")}
                className="w-full p-2 border border-gray-200 rounded-md text-sm bg-white"
                disabled={sseState === "connecting" || sseState === "streaming"}
              >
                <option value="FAST">Fast (Draft)</option>
                <option value="SMART">Smart (Production)</option>
              </select>
            </div>

            {sseState === "streaming" || sseState === "connecting" ? (
              <Button variant="destructive" onClick={handleCancel} className="w-full">
                Cancel Generation
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => handleGenerate()}
                disabled={!prompt.trim()}
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              >
                {sseState === "error" ? "Retry Generation" : "Generate Application"}
              </Button>
            )}
          </div>

          {(sseState === "streaming" || sseState === "connecting") && (
  <div className="space-y-4">
    {/* Progress Card */}
    <div className="bg-white p-5 rounded-xl border border-[#EDF1F6] shadow-sm">
      <div className="flex justify-between mb-3">
        <span className="font-semibold text-[#0A2540]">
          Generation Progress
        </span>

        <span className="text-[#FF6B00] font-semibold">
          {progress}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-[#FF6B00] transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>

    {/* Timeline */}
    <div className="bg-white p-5 rounded-xl border border-[#EDF1F6] shadow-sm">
      <h3 className="font-semibold text-[#0A2540] mb-4">
        Generation Status
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <span>
            {generationStep !== "idle" ? "✓" : "○"}
          </span>
          <span>Initializing Workspace</span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            {["blueprint", "saving", "completed"].includes(generationStep)
              ? "✓"
              : generationStep === "initializing"
              ? "⏳"
              : "○"}
          </span>
          <span>Generating Application Blueprint</span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            {generationStep === "completed"
              ? "✓"
              : generationStep === "saving"
              ? "⏳"
              : "○"}
          </span>
          <span>Saving Project</span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            {generationStep === "completed"
              ? "✓"
              : "○"}
          </span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  </div>
)}
         {/* Error Card */}
{generationStep === "failed" && friendlyError && (
  <div className="bg-white
border
border-[#EDF1F6] rounded-xl p-5 shadow-sm">
    <div className="flex items-start gap-3">


      <div className="flex-1">
        <h3 className="font-semibold  text-[#FF6B00]">
          {friendlyError.title}
        </h3>

        <p className="text-sm font-medium text-gray-700">
          {friendlyError.message}
        </p>

        <p className="text-sm font-medium text-gray-700">
          {friendlyError.action}
        </p>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => handleGenerate()}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            Retry Generation
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs
              ? "Hide Technical Details"
              : "Technical Details"}
          </Button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Success Card */}
{sseState === "completed" && (
  <div className="
bg-white
border border-[#EDF1F6]
rounded-xl
p-5
shadow-sm
">
    <h3 className="font-semibold text-[#0A2540]">
      Application Generated Successfully
    </h3>

    <p className="mt-2 text-gray-700">
      Atlas AI has successfully generated your application.
    </p>

    <div className="mt-3 text-sm text-[#FF6B00]">
      ✓ Blueprint Created<br />
      ✓ Files Generated<br />
      ✓ Project Saved
    </div>
  </div>
)}

{/* Developer Logs */}
{showLogs && (streamLogs.length > 0 || errorMessage) && (
  <div className="bg-gray-900 p-4 rounded-xl shadow-sm text-gray-300 font-mono text-xs flex flex-col gap-2 h-64 overflow-y-auto">
    {streamLogs.map((log, i) => (
      <div key={i} className="flex gap-2">
        <span className="text-gray-500">
          [{new Date(log.timestamp).toLocaleTimeString()}]
        </span>

        <span className="text-[#00D4B6] font-semibold">
          [{log.step}]
        </span>

        <span>{log.message}</span>
      </div>
    ))}

    {errorMessage && (
      <div className="text-red-400 font-semibold mt-2 whitespace-pre-wrap">
        {errorMessage}
      </div>
    )}

    {sseState === "streaming" && (
      <div className="animate-pulse text-gray-500">
        _
      </div>
    )}
  </div>
)}
</div>
        {/* Right column: Preview and Output */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="grid grid-cols-3 gap-4">
            <KpiCard title="Revenue" value="$124K" />
            <KpiCard title="Users" value="12,430" />
            <KpiCard title="Conversion" value="4.2%" />
          </div>

<ChatPanel
  onModify={handleModifyApp}
/>
          {/* Preview Panel */}
          {sseState === "completed" && previewUrl ? (
            <div className="flex-1 bg-white rounded-xl border border-[#EDF1F6] shadow-md flex flex-col overflow-hidden">
              <div className="border-b border-gray-100 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-700">Live Preview</h3>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <span>↗</span> Open in new tab
                </a>
              </div>
              <div className="flex-1 relative bg-gray-50 overflow-hidden">
                {!previewReady && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                      <p className="text-sm text-[#FF6B00] font-medium">Loading preview...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  onLoad={() => setPreviewReady(true)}
                  title="Live App Preview"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
                />
              </div>
            </div>
          ) : sseState !== "completed" ? (
            <div className="flex-1 bg-white rounded-xl border border-[#EDF1F6] shadow-sm flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-sm">{sseState === "streaming" ? "Generating preview..." : "Generate to see live preview"}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-[#EDF1F6] shadow-sm flex items-center justify-center">
              <p className="text-sm text-gray-400">Preview unavailable</p>
            </div>
          )}

          {/* Generated Output JSON */}
          {generationResult && (
            <div className="bg-white rounded-xl border border-[#EDF1F6] shadow-sm flex flex-col overflow-hidden h-48">
              <div className="border-b border-gray-100 p-3 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-xs text-gray-700">Generated JSON</h3>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Ready</span>
              </div>
              <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
                <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto shadow-inner text-gray-800">
                  {JSON.stringify(generationResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
