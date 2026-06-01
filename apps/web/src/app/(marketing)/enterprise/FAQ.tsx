

"use client";

import { useState } from "react";
import { ChevronDown } from 'lucide-react';
interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<string>("Platform");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = [
    "Platform",
    "Building Apps",
    "Deployment & Scale",
    "Security & Ownership"
  ];

  const faqData: FAQItem[] = [
    // Platform Category
    {
      category: "Platform",
      question: "What counts as AI usage?",
      answer: "AI usage includes app generation, editing, workflows, automations, AI actions, and model inference requests across the platform."
    },
    {
      category: "Platform",
      question: "Which AI models does OneAtlas support?",
      answer: "OneAtlas supports leading AI providers and models, including OpenAI, Anthropic, Gemini, DeepSeek, and selected open-source models."
    },
    {
      category: "Platform",
      question: "Can I collaborate with my team?",
      answer: "Yes. Team workspaces, permissions, shared environments, and collaboration features are available on Studio plans and above."
    },
    {
      category: "Platform",
      question: "Do you offer startup or student programs?",
      answer: "Yes. OneAtlas supports startups, universities, hackathons, and developer communities through special access programs."
    },
    
    // Building Apps Category
    {
      category: "Building Apps",
      question: "Can I connect external APIs and databases?",
      answer: "Absolutely. OneAtlas supports APIs, databases, webhooks, third-party services, and external integrations."
    },
    {
      category: "Building Apps",
      question: "What happens if I reach my plan limit?",
      answer: "You can purchase additional usage capacity or upgrade instantly without affecting existing projects."
    },

    // Deployment & Scale Category
    {
      category: "Deployment & Scale",
      question: "Can I deploy real production applications?",
      answer: "Yes. OneAtlas includes hosting, deployments, authentication, databases, and infrastructure management out of the box."
    },
    {
      category: "Deployment & Scale",
      question: "Is hosting included in every plan?",
      answer: "Yes. Hosting, SSL, deployment infrastructure, and scaling are built into the platform."
    },

    // Security & Ownership Category
    {
      category: "Security & Ownership",
      question: "Do you support private deployments?",
      answer: "Enterprise customers can deploy within isolated environments, dedicated infrastructure, or private cloud configurations."
    },
    {
      category: "Security & Ownership",
      question: "Who owns the generated apps and code?",
      answer: "You do. Your applications, data, workflows, and exported code remain fully yours."
    }
  ];

  const filteredFaqs = faqData.filter(item => item.category === activeCategory);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setOpenIndex(null); 
  };

  return (
    <section className="w-full bg-[#FAFAFA] text-slate-900 font-inter antialiased relative flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-15 overflow-hidden select-none border-t border-slate-200/40">
      
      <div className="flex flex-col items-center text-center max-w-[600px] mb-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-orange-200/60 rounded-full mb-4 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <span className="w-3 h-3 rounded-full border border-orange-500/20 flex items-center justify-center p-0.5 bg-white">
            <span className="w-full h-full rounded-full bg-orange-500" />
          </span>
          <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase">
            FAQ
          </span>
        </div>

        <h2 className="text-[36px] sm:text-[42px] font-black tracking-[-0.03em] text-[#0A1124] leading-tight mb-3">
          Frequently asked questions
        </h2>
        
        <p className="text-[14.5px] sm:text-[15px] font-medium text-slate-400">
          Everything you need to know about OneAtlas.
        </p>
      </div>

      <div className="max-w-[1360px] w-full grid grid-cols-1 lg:grid-cols-[1fr_2.4fr] gap-12 lg:gap-16 items-start relative z-10 pl-0 lg:pl-4">
        
        <div className="flex flex-col space-y-1 w-full lg:max-w-[260px]">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`w-full text-left px-4 py-3 text-[14px] font-black tracking-tight rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-orange-500/[0.07] text-[#FF6600]' 
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="w-full bg-white border border-[#EDEDED] rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.006)] overflow-hidden min-h-[400px]">
          <div className="divide-y divide-slate-100/80">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  className={`w-full transition-colors duration-200 ${isOpen ? 'bg-slate-50/[0.15]' : 'hover:bg-slate-50/[0.3]'}`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left px-6 sm:px-8 py-5.5 cursor-pointer group"
                  >
                    <span className="text-[14.5px] sm:text-[15.5px] font-black text-slate-800 tracking-tight group-hover:text-[#0A1124] transition-colors duration-150">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      size={16} 
                      className={`text-slate-400 shrink-0 ml-4 transition-transform duration-300 ease-out ${
                        isOpen ? 'rotate-180 text-[#FF6600]' : ''
                      }`}
                      strokeWidth={2.5}
                    />
                  </button>

                  <div 
                    className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[13.5px] sm:text-[14px] font-medium text-slate-400 leading-relaxed px-6 sm:px-8 pb-6 pr-6 sm:pr-16">
                        {faq.answer}
                      </p>
                    </div>
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
