"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import {
  FILTERS,
  TEMPLATES,
  TemplateCard,
  Template,
} from "@/components/landing/templates";

export function TemplateMarketplace() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const featuredTemplates = useMemo(() => {
    return TEMPLATES.slice(0, 4);
  }, []);

  const filteredTemplates = useMemo(() => {
  const searchText = search.trim().toLowerCase();

  return TEMPLATES.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchText) ||
      template.desc.toLowerCase().includes(searchText) ||
      template.cat.toLowerCase().includes(searchText);

    // If user is searching, prioritize search
    if (searchText) {
      return matchesSearch;
    }

    return (
      activeFilter === "All" ||
      template.filters.includes(activeFilter)
    );
  });
}, [search, activeFilter]);

  const openTemplate = (template: Template) => {
  router.push(`/builder/${template.id}`);
};

  return (
    <main className="min-h-screen bg-[#FAFBFF]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#0A2540]">
            Template Marketplace
          </h1>

          <p className="mt-2 text-[#425466]">
            Start with a professionally designed template and customize it in
            the builder.
          </p>
        </div>

        {/* Featured Templates */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#0A2540]">
            Featured Templates
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredTemplates.map((template: any) => (
              <button
                key={template.id}
                onClick={() => openTemplate(template)}
                className="rounded-2xl border border-[#E6EBF1] bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-3 text-sm font-medium text-[#FF6600]">
                  {template.cat}
                </div>

                <h3 className="mb-2 font-semibold text-[#0A2540]">
                  {template.title}
                </h3>

                <p className="line-clamp-2 text-sm text-[#425466]">
                  {template.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Search */}
        <section className="mb-6">
            
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E6EBF1] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#FF6600]"
          />
        </section>

        {/* Filters */}
        <section className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((filter: string) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter
                  ? "bg-[#111111] text-white"
                  : "bg-white text-[#425466] border border-[#E6EBF1]"
              }`}
            >
              {filter}
            </button>
          ))}
        </section>

        {/* Templates Grid */}
        
          <section>
  <div className="mb-4 flex items-center justify-between">
    <h2 className="text-lg font-semibold text-[#0A2540]">
      Templates
    </h2>

    <span className="text-sm text-[#697386]">
      {filteredTemplates.length} templates
    </span>
  </div>

  {filteredTemplates.length === 0 ? (
    <div className="rounded-3xl border border-[#E5E7EB] bg-white py-20 px-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1E8]">
        🔍
      </div>

      <h3 className="text-xl font-semibold text-[#0A2540]">
        No templates found
      </h3>

      <p className="mt-2 text-[#697386]">
        Try a different search term or select another category.
      </p>

      <button
        onClick={() => {
          setSearch("");
          setActiveFilter("All");
        }}
        className="mt-6 rounded-full bg-[#FF6600] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        Reset Filters
      </button>
    </div>
  ) : (
    <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
      {filteredTemplates.map((template) => (
        <TemplateCard
          key={template.id}
          t={template}
          onLaunch={(t) => router.push(`/builder/${t.id}`)}
        />
      ))}
    </div>
  )}
</section>
      </div>
    </main>
  );
}