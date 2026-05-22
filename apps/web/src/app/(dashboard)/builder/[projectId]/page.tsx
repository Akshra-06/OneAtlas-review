import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";

export default function BuilderPage() {
  return (
    <main className="min-h-screen bg-[#FAFBFF] flex flex-col">
      <header className="px-8 py-5 border-b border-[#EDF1F6] bg-white flex items-center justify-between">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </header>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFE3EE] to-[#FFE9DC] text-[#FF5996] mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A2540]">
            Builder &amp; preview
          </h1>
          <p className="mt-3 text-[#425466] leading-relaxed">
            This route is reserved for the prompt-to-app builder with live preview. Wire your generation backend to render the prompt UI, iframe preview, and desktop/mobile toggle here.
          </p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/">← Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
