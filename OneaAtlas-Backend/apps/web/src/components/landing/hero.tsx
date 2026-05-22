"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { HeroCanvas } from "./hero-canvas";
import { createProject } from "@/services/projects";
import { useProjectStore } from "@/store/useProjectStore";
import { useBuilderStore } from "@/store/useBuilderStore";

export function Hero() {
  const router = useRouter();
  const { isSignedIn, orgId, getToken } = useAuth();
  const { addProject } = useProjectStore();
  const { setPrompt } = useBuilderStore();
  const [promptText, setPromptText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!promptText.trim()) return;
    setIsSubmitting(true);
    try {
      setPrompt(promptText);

      if (isSignedIn && orgId) {
        const token = await getToken();
        if (token) {
          const rawName = promptText.trim().split("\n")[0];
          const name = rawName.length > 30 ? `${rawName.substring(0, 30)}...` : rawName;

          const newProj = await createProject(orgId, token, {
            name,
            description: "Created from landing page prompt.",
            prompt: promptText,
            type: "CRUD_APP"
          });

          addProject(newProj);
          router.push(`/builder/${newProj.id}`);
          return;
        }
      }

      // Store prompt in localStorage if not logged in or no organization is active
      localStorage.setItem("pending_generation_prompt", promptText);
      if (isSignedIn) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to submit landing page prompt", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    let examplePrompt = "";
    if (category === "CRUD App") {
      examplePrompt = "I need a CRUD application to manage customer support tickets, search through active issues, and update ticket statuses.";
    } else if (category === "Dashboard") {
      examplePrompt = "I need a real-time sales dashboard showing total revenue, monthly growth, active customer trials, and a breakdown of sales by region.";
    } else if (category === "Admin Panel") {
      examplePrompt = "I need an admin panel for user moderation to view sign-up dates, change user roles, and flag or suspend accounts.";
    } else if (category === "Workflow") {
      examplePrompt = "I need a task assignment workflow to assign tasks to developers, track progress columns (To Do, In Progress, Review, Done), and set due dates.";
    }
    setPromptText(examplePrompt);
  };

  return (
    <section className="hero">
      <HeroCanvas />
      <div className="hero-inner">
        <div className="pill">
          <span className="dot" />
          Now in public beta
        </div>
        <h1 className="hero-title">
          Where ideas become <span className="grad">tools</span>
        </h1>
        <p className="hero-sub">
          Describe what your team needs. OneAtlas generates a production-ready
          internal tool and deploys it instantly.
        </p>

        <div className="prompt-card">
          <textarea
            className="prompt-input"
            placeholder="Describe the internal tool your team needs…"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="prompt-row">
            <div className="prompt-row-left">
              <button className="icon-btn" aria-label="Attach" disabled={isSubmitting}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <button className="model-chip" disabled={isSubmitting}>
                <span className="spark" />
                Claude Opus 4.7
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            <div className="prompt-row-right">
              <span className="public-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Public
              </span>
              <button className="icon-btn" disabled={isSubmitting}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              </button>
              <button className="icon-btn" disabled={isSubmitting}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
              <button 
                className="send-btn" 
                onClick={handleSubmit} 
                disabled={isSubmitting || !promptText.trim()}
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-[#635BFF] border-t-transparent animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="hero-grid">
          <button className="hero-grid-item" onClick={() => handleCategoryClick("CRUD App")} disabled={isSubmitting}>
            <div className="hero-grid-ico" style={{ background: "#EEF2FF" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#635BFF" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span>CRUD App</span>
          </button>
          <button className="hero-grid-item" onClick={() => handleCategoryClick("Dashboard")} disabled={isSubmitting}>
            <div className="hero-grid-ico" style={{ background: "#FFF4E8" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <polyline points="7 8 12 13 17 8" />
              </svg>
            </div>
            <span>Dashboard</span>
          </button>
          <button className="hero-grid-item" onClick={() => handleCategoryClick("Admin Panel")} disabled={isSubmitting}>
            <div className="hero-grid-ico" style={{ background: "#FFF0F6" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span>Admin Panel</span>
          </button>
          <button className="hero-grid-item" onClick={() => handleCategoryClick("Workflow")} disabled={isSubmitting}>
            <div className="hero-grid-ico" style={{ background: "#ECFDF5" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </div>
            <span>Workflow</span>
          </button>
        </div>

        <div className="try-row">
          <span className="try-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Try an example
          </span>
          <button className="try-chip" onClick={() => setPromptText("Inventory tracker with reorder alerts")} disabled={isSubmitting}>Inventory tracker with reorder alerts</button>
          <button className="try-chip" onClick={() => setPromptText("Client feedback portal")} disabled={isSubmitting}>Client feedback portal</button>
          <button className="try-chip" onClick={() => setPromptText("Invoice approval workflow")} disabled={isSubmitting}>Invoice approval workflow</button>
          <button className="try-chip" onClick={() => setPromptText("Employee onboarding hub")} disabled={isSubmitting}>Employee onboarding hub</button>
          <button className="try-chip" onClick={() => setPromptText("CRM with pipeline tracking")} disabled={isSubmitting}>CRM with pipeline tracking</button>
        </div>
      </div>
    </section>
  );
}
