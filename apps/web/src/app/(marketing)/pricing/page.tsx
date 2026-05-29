"use client";

import Link from "next/link";
import { useState } from "react";
import { Nav } from "@/components/landing/nav/nav";

const plans = [
  {
    name: "Explorer",
    subtitle: "For testing ideas and first AI products.",
    price: "$0",
    cta: "Start Building Free",
  },
  {
    name: "Studio",
    subtitle: "For founders launching production apps.",
    price: "$24",
    suffix: "/month",
    cta: "Upgrade to Studio",
    previous: "Explorer",
  },
  {
    name: "Scale",
    subtitle: "For startups building serious AI software.",
    price: "$59",
    suffix: "/month",
    cta: "Start Scaling",
    previous: "Studio",
    highlighted: true,
  },
  {
    name: "Orbit",
    subtitle: "For high-growth companies at scale.",
    price: "$149",
    suffix: "/month",
    cta: "Contact Sales",
    previous: "Scale",
  },
];

const planFeatures: Record<string, string[]> = {
  Explorer: [
    "30 AI build credits",
    "200 automation credits",
    "Unlimited projects",
    "Visual app builder",
    "Built-in database & auth",
    "One-click deployment",
    "Hosted on OneAtlas domain",
    "Core AI generation tools",
  ],
  Studio: [
    "150 AI build credits",
    "5,000 automation credits",
    "Custom domains",
    "Backend functions & APIs",
    "In-app code editing",
    "GitHub synchronization",
    "Remove OneAtlas branding",
    "Faster build & deployment",
    "Standard support",
  ],
  Scale: [
    "500 AI build credits",
    "20,000 automation credits",
    "Advanced AI model access",
    "Production-grade hosting",
    "Shared team workspace",
    "App analytics & monitoring",
    "SEO optimization",
    "Staging environments",
    "Priority support",
    "Early access to new features",
  ],
  Orbit: [
    "1,500 AI build credits",
    "75,000 automation credits",
    "Premium AI model routing",
    "Dedicated infrastructure",
    "Advanced permissions",
    "Enterprise SSO/SAML",
    "Audit logs & usage insights",
    "Dedicated onboarding",
    "Slack-based support",
    "White-glove migration",
  ],
};

const categories = [
  {
    label: "Platform",
    items: [
      { q: "What is OneAtlas?", a: "OneAtlas is an AI-native platform for building runtime internal tools, operational dashboards, automations, and production-ready applications." },
      { q: "Who is OneAtlas built for?", a: "OneAtlas is designed for founders, startups, operators, agencies, and modern product teams building AI-powered software." },
      { q: "Do I need coding experience?", a: "No. You can generate applications conversationally using AI prompts and visually edit them inside the runtime builder." },
      { q: "Can I deploy production apps?", a: "Yes. OneAtlas supports production-ready deployments, databases, APIs, authentication, and custom domains." },
    ],
  },
  {
    label: "Pricing",
    items: [
      { q: "Can I start for free?", a: "Yes. The Explorer plan is completely free and includes AI build credits to help you explore the platform." },
      { q: "Can I upgrade later?", a: "Absolutely. You can upgrade your workspace anytime as your product and usage scale." },
      { q: "Is yearly billing discounted?", a: "Yes. Annual billing includes discounted pricing compared to monthly plans." },
      { q: "Are there usage limits?", a: "Each plan includes AI build credits and automation credits based on your subscription tier." },
    ],
  },
  {
    label: "Features",
    items: [
      { q: "Does OneAtlas include databases?", a: "Yes. Every plan includes built-in database functionality and authentication support." },
      { q: "Can I connect GitHub?", a: "Yes. GitHub synchronization is available on Studio plans and above." },
      { q: "Do you support APIs and backend functions?", a: "Yes. OneAtlas supports backend APIs, server logic, and runtime integrations." },
      { q: "Can I use custom domains?", a: "Yes. Custom domain support is included in paid plans." },
    ],
  },
  {
    label: "Enterprise",
    items: [
      { q: "Do you support enterprise infrastructure?", a: "Yes. Orbit includes dedicated infrastructure, advanced security, and enterprise-grade controls." },
      { q: "Do you support SSO?", a: "Yes. Enterprise SSO/SAML authentication is available for enterprise customers." },
      { q: "Do you provide onboarding?", a: "Yes. Enterprise onboarding and migration assistance are included for large teams." },
      { q: "Can OneAtlas scale with large organizations?", a: "Yes. OneAtlas is designed to support enterprise workloads, team collaboration, governance, and operational scale." },
    ],
  },
];

export default function PricingPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIndex, setOpenIndex] = useState(-1);

  function toggleFAQ(index: number) {
    setOpenIndex(openIndex === index ? -1 : index);
  }

  return (
    <main className="min-h-screen bg-[#F5F5EE] text-[#111111]">
      <Nav />

      <section className="mx-auto max-w-[1280px] px-5 pb-7 pt-16 text-center md:px-8 md:pt-20">

        <h1 className="mx-auto mt-5 max-w-[1200px] text-[42px] font-bold leading-[0.9] tracking-[-0.05em] md:text-[56px]">
          Simple pricing.{" "}
          <span className="text-[#FF6600]">Unlimited possibilities.</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-7 text-[#6B7280]">
          Choose the perfect plan for your stage.
        </p>

        <div className="mx-auto mt-6 flex w-fit items-center rounded-full border border-[#E5E7EB] bg-white p-1">
          <button className="rounded-full bg-[#111111] px-5 py-2 text-sm font-semibold text-white">
            Monthly
          </button>
          <button className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-[#6B7280]">
            Yearly
            <span className="rounded-full bg-[#FF6600] px-2 py-1 text-[10px] text-white">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-8 md:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const features = planFeatures[plan.name] || [];
            return (
              <div
                key={plan.name}
                className={`relative flex min-h-[710px] flex-col rounded-[24px] border bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_4px_24px_rgba(0,0,0,0.03)] transition hover:-translate-y-1 ${
                  plan.highlighted ? "border-[#FF6600]" : "border-[#E5E7EB]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6600] px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div>
                  <h2 className="text-[22px] font-semibold tracking-[-0.02em]">{plan.name}</h2>
                  <p className="mt-3 min-h-6 text-sm leading-6 text-[#6B7280] whitespace-nowrap">{plan.subtitle}</p>
                </div>
                <div className="mt-8">
                  <span className="text-5xl font-bold tracking-[-0.05em]">{plan.price}</span>
                  {plan.suffix && <span className="ml-1 text-sm text-[#6B7280]">{plan.suffix}</span>}
                </div>
                <p className="mt-3 mb-6 text-xs text-[#9CA3AF]">
                  {plan.name === "Explorer" ? "Free forever" : "Billed annually"}
                </p>
                <button
                  style={{
                    width: "100%",
                    padding: "13px 0",
                    borderRadius: 12,
                    border: plan.highlighted ? "none" : "1px solid #D1D5DB",
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 600,
                    background: plan.highlighted ? "#FF6600" : "#fff",
                    color: plan.highlighted ? "#fff" : "#111111",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    if (plan.highlighted) {
                      (e.currentTarget as HTMLElement).style.background = "#E65C00";
                    } else {
                      (e.currentTarget as HTMLElement).style.background = "#FF6600";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                      (e.currentTarget as HTMLElement).style.border = "1px solid #FF6600";
                    }
                  }}
                  onMouseLeave={e => {
                    if (plan.highlighted) {
                      (e.currentTarget as HTMLElement).style.background = "#FF6600";
                    } else {
                      (e.currentTarget as HTMLElement).style.background = "#fff";
                      (e.currentTarget as HTMLElement).style.color = "#111111";
                      (e.currentTarget as HTMLElement).style.border = "1px solid #D1D5DB";
                    }
                  }}
                >
                  {plan.cta}
                </button>
                <div className="my-7 h-px bg-[#E5E7EB]" />
                {plan.previous && (
                  <p className="mb-4 text-xs font-semibold text-[#9CA3AF]">
                    Everything in {plan.previous}, plus:
                  </p>
                )}
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-[#111111]">
                      <span className={`mt-0.5 ${plan.highlighted ? "text-[#FF6600]" : "text-[#6B7280]"}`}>✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-8">
        <div className="rounded-[32px] bg-[#FF6600] px-8 py-10 text-white md:px-14 flex items-center justify-between gap-8 flex-wrap">
          <div>
            <h2 className="text-4xl font-bold tracking-[-0.03em]">Enterprise</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/90">
              Custom infrastructure & deployment solutions for modern organizations.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm text-white/90">
              <div>✓ Private cloud or dedicated hosting</div>
              <div>✓ Custom integrations & workflows</div>
              <div>✓ SLA-backed uptime guarantees</div>
            </div>
          </div>
          <button className="rounded-xl bg-[#111111] px-6 py-3 text-sm font-semibold text-white hover:bg-[#222222] shrink-0">
            Talk to Enterprise Sales
          </button>
        </div>
      </section>

      <section className="bg-[#F5F5EE] px-5 pb-20 pt-6 md:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-8 text-center">
            
            <h2 className="text-[40px] font-bold tracking-[-0.03em]">Frequently asked questions</h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-[#6B7280]">
              Everything you need to know about OneAtlas.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-[240px_1fr]">
            <div className="flex flex-col gap-1">
              {categories.map((category, index) => (
                <button
                  key={category.label}
                  onClick={() => { setActiveCategory(index); setOpenIndex(-1); }}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    activeCategory === index
                      ? "bg-[#FFF7F1] text-[#FF6600]"
                      : "text-[#6B7280] hover:bg-white hover:text-[#111111]"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white">
              {categories[activeCategory].items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={item.q} className="border-b border-[#ECECEC] last:border-b-0">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <span className={`text-[15px] font-semibold ${isOpen ? "text-[#FF6600]" : "text-[#111111]"}`}>
                        {item.q}
                      </span>
                      <span className={`text-xl transition ${isOpen ? "rotate-45 text-[#FF6600]" : "text-[#9CA3AF]"}`}>
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-[15px] leading-7 text-[#6B7280]">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}