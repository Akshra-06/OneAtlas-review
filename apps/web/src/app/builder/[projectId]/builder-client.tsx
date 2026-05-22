"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/store/useBuilderStore";
import { useAuthStore } from "@/store/useAuthStore";
import { generateApp } from "@/services/builder";
import { getProjects } from "@/services/projects";
import { Project } from "@/types";

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
    resetBuilder
  } = useBuilderStore();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleGenerate = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || prompt;
    if (!activeOrgId || !projectId || !promptToUse.trim()) return;
    const token = await getToken();
    if (!token) return;

    resetBuilder();
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
        if (event === "status") {
          setSseState("streaming");
          setGenerationPhase(data.step);
          addLog(data.step, data.message);
        } else if (event === "provider") {
          setSseState("streaming");
          setGenerationPhase("provider_selection");
          addLog("provider", data.message);
        } else if (event === "fallback") {
          setSseState("streaming");
          setGenerationPhase("fallback");
          addLog("fallback", data.message);
        } else if (event === "retry") {
          setSseState("streaming");
          setGenerationPhase("retry");
          addLog("retry", data.message);
        } else if (event === "progress") {
          setGenerationPhase(data.phase);
        } else if (event === "done") {
          setGenerationPhase("complete");
          addLog("done", `Completed with ${data.provider?.toUpperCase?.() ?? "AI"} ${data.model ? `(${data.model})` : ""}`);
          if (data.previewUrl) {
            setPreviewUrl(data.previewUrl);
          }
        } else if (event === "error") {
          setSseState("error");
          setGenerationPhase("error");
          setErrorMessage(data.message);
        }
      },
      () => {
        setSseState("completed");
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
        setAbortController(null);
      }
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

  if (!activeOrgId) {
    return <div className="p-8">Please select an organization in the Dashboard first.</div>;
  }

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
        {/* Left column: Controls */}
        <div className="w-[400px] flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#EDF1F6] shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-[#0A2540]">Generation Prompt</h2>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the application you want to build..."
              className="w-full h-32 p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#635BFF]/50 resize-none text-sm"
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
                className="w-full bg-[#635BFF] hover:bg-[#635BFF]/90 text-white"
              >
                {sseState === "error" ? "Retry Generation" : "Generate Application"}
              </Button>
            )}
          </div>

          {/* Logs panel */}
          {(streamLogs.length > 0 || errorMessage) && (
            <div className="bg-gray-900 p-4 rounded-xl shadow-sm text-gray-300 font-mono text-xs flex flex-col gap-2 h-64 overflow-y-auto">
              {streamLogs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="text-[#00D4B6] font-semibold">[{log.step}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
              {errorMessage && (
                <div className="text-red-400 font-semibold mt-2">
                  Error: {errorMessage}
                </div>
              )}
              {sseState === "streaming" && (
                <div className="animate-pulse text-gray-500">_</div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Preview and Output */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
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
                      <p className="text-sm text-gray-600 font-medium">Loading preview...</p>
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
