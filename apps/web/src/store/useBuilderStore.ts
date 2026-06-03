import { create } from "zustand";

export interface LogEntry {
  step: string;
  message: string;
  timestamp: string;
}
export interface AtlasChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;

  action?: {
    type: "modify";
    prompt: string;

  };

  progress?: {
    currentStep: string;
    completed: number;
    total: number;
  };
}

interface BuilderState {
  prompt: string;
  selectedModel: "FAST" | "SMART";
  regenerateParts: string[];

  sseState: "idle" | "connecting" | "streaming" | "completed" | "error";
  generationPhase: string;
  streamLogs: LogEntry[];
  generationResult: any | null;
  abortController: AbortController | null;
  errorMessage: string | null;

  previewDevice: "desktop" | "tablet" | "mobile";
  previewUrl: string | null;
  previewReady: boolean;

  atlasMessages: AtlasChatMessage[];
requiresRegeneration: boolean;
pendingRegenerationPrompt: string | null;

setAtlasMessages: (
  messages: AtlasChatMessage[]
) => void;

addAtlasMessage: (
  message: AtlasChatMessage
) => void;

updateAtlasMessage: (
  id: string,
  updates: Partial<AtlasChatMessage>
) => void;

setRequiresRegeneration: (
  value: boolean
) => void;

setPendingRegenerationPrompt: (
  prompt: string | null
) => void;

  setPrompt: (prompt: string) => void;
  setModel: (model: "FAST" | "SMART") => void;
  setRegenerateParts: (parts: string[]) => void;

  setSseState: (state: "idle" | "connecting" | "streaming" | "completed" | "error") => void;
  setGenerationPhase: (phase: string) => void;
  addLog: (step: string, message: string) => void;
  setGenerationResult: (result: any) => void;
  setAbortController: (controller: AbortController | null) => void;
  setErrorMessage: (msg: string | null) => void;

  setPreviewDevice: (device: "desktop" | "tablet" | "mobile") => void;
  setPreviewUrl: (url: string | null) => void;
  setPreviewReady: (ready: boolean) => void;
  resetBuilder: () => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  prompt: "",
selectedModel: "SMART",
regenerateParts: ["all"],

sseState: "idle",
generationPhase: "",
streamLogs: [],
generationResult: null,
abortController: null,
errorMessage: null,

atlasMessages: [],
requiresRegeneration: false,
pendingRegenerationPrompt: null,

previewDevice: "desktop",
previewUrl: null,
previewReady: false,

  setPrompt: (prompt) => set({ prompt }),
  setModel: (selectedModel) => set({ selectedModel }),
  setRegenerateParts: (regenerateParts) => set({ regenerateParts }),

  setSseState: (sseState) => set({ sseState }),
  setGenerationPhase: (generationPhase) => set({ generationPhase }),

  addLog: (step, message) =>
    set((state) => ({
      streamLogs: [
        ...state.streamLogs,
        { step, message, timestamp: new Date().toISOString() },
      ],
    })),
  setGenerationResult: (generationResult) => set({ generationResult }),
  setAbortController: (abortController) => set({ abortController }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setAtlasMessages: (atlasMessages) =>
  set({ atlasMessages }),

addAtlasMessage: (message) =>
  set((state) => ({
    atlasMessages: [
      ...state.atlasMessages,
      message,
    ],
  })),

updateAtlasMessage: (id, updates) =>
  set((state) => ({
    atlasMessages: state.atlasMessages.map(
      (msg) =>
        msg.id === id
          ? { ...msg, ...updates }
          : msg
    ),
  })),

setRequiresRegeneration: (
  requiresRegeneration
) =>
  set({ requiresRegeneration }),

setPendingRegenerationPrompt: (
  pendingRegenerationPrompt
) =>
  set({ pendingRegenerationPrompt }),
  setPreviewDevice: (previewDevice) => set({ previewDevice }),
  setPreviewUrl: (previewUrl) => set({ previewUrl }),

  setPreviewReady: (previewReady) => set({ previewReady }),
  resetBuilder: () =>
    set({
      sseState: "idle",
      generationPhase: "",
      streamLogs: [],
      generationResult: null,
      abortController: null,
      errorMessage: null,
      previewUrl: null,
      previewReady: false,
    }),
}));