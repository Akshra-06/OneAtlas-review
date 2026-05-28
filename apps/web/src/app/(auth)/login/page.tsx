import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/landing/nav/logo";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FAFBFF] flex flex-col">
      <header className="px-8 py-5">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <LoginForm />
      </div>
    </main>
  );
}
