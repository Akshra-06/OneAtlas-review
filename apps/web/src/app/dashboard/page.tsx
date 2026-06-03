"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useProjectStore } from "@/store/useProjectStore";
import { getProjects, createProject } from "@/services/projects";
import { useBuilderStore } from "@/store/useBuilderStore";

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, orgId, getToken } = useAuth();
  const { activeOrgId, setActiveOrgId } = useAuthStore();
  const { projects, setProjects, addProject } = useProjectStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Temporary Org Diagnostics
  useEffect(() => {
    if (isLoaded) {
      console.log("[dashboard] Clerk orgId:", orgId);
      console.log("[dashboard] Zustand activeOrgId:", activeOrgId);
      if (typeof window !== "undefined") {
        console.log("[dashboard] window.Clerk active org:", (window as any).Clerk?.organization?.id);
      }
    }
  }, [isLoaded, orgId, activeOrgId]);

  // Sync Clerk active org with Zustand store
  useEffect(() => {
    if (!isLoaded) return;

    if (activeOrgId !== (orgId || null)) {
      console.log(`[dashboard] Syncing stale Zustand orgId (${activeOrgId}) to Clerk orgId (${orgId})`);
      setActiveOrgId(orgId || null);
      setProjects([]); // Clear projects list to prevent stale visual flash
    }
  }, [isLoaded, orgId, activeOrgId, setActiveOrgId, setProjects]);

  // Fetch projects on mount or org switch
  useEffect(() => {
    async function fetchProjects() {
      if (!isLoaded) return;

      if (!orgId) {
        setProjects([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) {
          setError("AUTH_FAILURE");
          setLoading(false);
          return;
        }
        const data = await getProjects(orgId, token);
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects", err);
        setError("FETCH_FAILURE");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [isLoaded, orgId, getToken, setProjects]);

  // Handle pending generation prompt from landing page
  useEffect(() => {
    async function handlePendingPrompt() {
      if (!orgId) return;
      const pendingPrompt = localStorage.getItem("pending_generation_prompt");
      if (!pendingPrompt) return;

      // Remove immediately to prevent duplicate requests
      localStorage.removeItem("pending_generation_prompt");

      try {
        const token = await getToken();
        if (!token) return;

        const rawName = pendingPrompt.trim().split("\n")[0];
        const projectName = rawName.length > 30 ? `${rawName.substring(0, 30)}...` : rawName;

        const newProj = await createProject(orgId, token, {
          name: projectName,
          description: "Created from landing page prompt.",
          prompt: pendingPrompt,
          type: "CRUD_APP"
        });

        addProject(newProj);
        useBuilderStore.getState().setPrompt(pendingPrompt);
        router.push(`/builder/${newProj.id}`);
      } catch (err) {
        console.error("Failed to create pending project", err);
      }
    }

    if (orgId && !loading) {
      handlePendingPrompt();
    }
  }, [orgId, loading, getToken, addProject, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !name || !prompt) return;
    setIsSubmitting(true);
    try {
      const token = await getToken();
      if (!token) return;
      
      const newProj = await createProject(orgId, token, {
        name,
        description,
        prompt,
        type: "CRUD_APP"
      });
      addProject(newProj);
      setShowCreate(false);
      
      // Navigate straight to builder
      router.push(`/builder/${newProj.id}`);
    } catch (err) {
      console.error("Create failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFBFF] flex flex-col">
      <header className="px-8 py-5 border-b border-[#EDF1F6] bg-white flex items-center justify-between">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
        <div className="flex items-center gap-6">
          <OrganizationSwitcher hidePersonal={true} />
          <UserButton />
        </div>
      </header>
      
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        {!orgId ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-gray-700">Please select an Organization</h2>
            <p className="text-gray-500 mt-2">You must belong to an organization to view or create projects.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-[#0A2540]">
                Your Projects
              </h1>
              <Button onClick={() => setShowCreate(!showCreate)} variant="default" className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                {showCreate ? "Cancel" : "+ New Project"}
              </Button>
            </div>

            {showCreate && (
              <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-col gap-4">
                <h3 className="text-lg font-medium text-gray-800">Create a New Project</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Project Name</label>
                    <input required value={name} onChange={e => setName(e.target.value)} type="text" className="border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50" placeholder="My Internal Tool" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Short Description</label>
                    <input value={description} onChange={e => setDescription(e.target.value)} type="text" className="border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50" placeholder="A tool to manage..." />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Initial App Prompt</label>
                  <textarea required value={prompt} onChange={e => setPrompt(e.target.value)} className="border border-gray-200 p-3 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50" placeholder="I need a dashboard with a table that shows..." />
                </div>
                <div className="flex justify-end mt-2">
                  <Button type="submit" disabled={isSubmitting || !name || !prompt} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading projects...</div>
            ) : error === "AUTH_FAILURE" ? (
              <div className="text-center py-20 bg-white rounded-xl border border-red-200 shadow-sm">
                <p className="text-red-500 font-semibold mb-2">Authentication error</p>
                <p className="text-gray-500 text-sm">Failed to retrieve an authorization session. Please try logging in again.</p>
              </div>
            ) : error === "FETCH_FAILURE" ? (
              <div className="text-center py-20 bg-white rounded-xl border border-red-200 shadow-sm">
                <p className="text-red-500 font-semibold mb-2">Projects fetch failed</p>
                <p className="text-gray-500 text-sm">We couldn't reach the server. Please check your network connection.</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No projects found in this organization.</p>
                <Button onClick={() => setShowCreate(true)} variant="outline">Create your first project</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">{proj.name}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full font-medium text-gray-600">
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{proj.description || "No description"}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                      <span className="text-xs text-gray-400">Created {new Date(proj.createdAt).toLocaleDateString()}</span>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/builder/${proj.id}`}>Open Builder</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
