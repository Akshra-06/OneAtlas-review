"use client";
import { useState } from "react";

const ITEMS = [
  {
    q: "What is OneAtlas and how does it work?",
    a: "OneAtlas is an AI-powered platform that turns plain English descriptions into fully deployed internal tools. You describe what you need, choose your AI model, and OneAtlas generates the database schema, UI, roles, and business logic — then deploys it instantly on your own subdomain.",
  },
  {
    q: "What can I build with OneAtlas?",
    a: "Internal tools, dashboards, admin panels, CRMs, approval workflows, customer portals — anything that needs forms, tables, auth, and a backend.",
  },
  {
    q: "Do I need any coding experience?",
    a: "No. Describe what you want in plain English. Developers can drop into the generated code, but it's not required.",
  },
  {
    q: "Which AI models does OneAtlas support?",
    a: "All major frontier models — Claude, GPT, Gemini, Mistral, Llama, Qwen, DeepSeek, Grok — auto-selected per task or chosen manually.",
  },
  {
    q: "How is OneAtlas different from other no-code platforms?",
    a: "Most no-code tools give you basic forms and tables. OneAtlas generates a production-grade stack — backend, auth, hosting, and a real database — without external services to wire together.",
  },
  {
    q: "What happens to my data?",
    a: "Your data stays yours. It lives in your own database (managed or BYO), and you can export or migrate at any time.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="section faq-section">
      <div className="container-x">
        <div className="faq-grid">
          <div className="faq-left">
            <span className="eyebrow">FAQ</span>
            <h2>Frequently asked questions</h2>
            <p>Can&apos;t find what you&apos;re looking for? Reach out to our team.</p>
            <a className="contact" href="#">Contact support →</a>
          </div>
          <div className="faq-list">
            {ITEMS.map((it, i) => {
              const open = openIdx === i;
              return (
                <div className={`faq-item ${open ? "open" : ""}`} key={i}>
                  <button
                    className="faq-q"
                    onClick={() => setOpenIdx(open ? null : i)}
                  >
                    {it.q}
                    <span className="toggle">{open ? "−" : "+"}</span>
                  </button>
                  <div className="faq-a">
                    <div className="faq-a-inner">{it.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
