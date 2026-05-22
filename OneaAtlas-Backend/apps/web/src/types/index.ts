// ===== USER =====
export interface User {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  createdAt: string;
}

// ===== PROJECT =====
export interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED" | "DELETED" | string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  previewUrl?: string;
  prompt?: string;
  generatedCode?: any;
}

// ===== GENERATION =====
export interface GenerationStatus {
  status: "idle" | "generating" | "complete" | "error";
  progress: number;
  message: string;
  result?: string;
  error?: string;
}

// ===== API RESPONSE =====
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// ===== MODEL =====
export type AIModel = 
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gemini-pro"
  | "deepseek-chat"
  | "groq-llama";