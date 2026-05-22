import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#FAFBFF] flex flex-col">
      <header className="px-8 py-5 border-b border-[#EDF1F6] bg-white">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E8E7FF] text-[#635BFF] mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A2540]">
            Dashboard
          </h1>
          <p className="mt-3 text-[#425466] leading-relaxed">
            This route is reserved for your authenticated dashboard. The marketing site is fully built — connect your auth provider and projects API to populate this page.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/">← Back to home</Link>
            </Button>
            <Button asChild variant="gradient">
              <Link href="/builder">Open builder →</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
