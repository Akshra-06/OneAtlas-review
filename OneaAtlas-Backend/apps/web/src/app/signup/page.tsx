import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/landing/logo";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#FAFBFF] flex flex-col">
      <header className="px-8 py-5">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <SignUp
          routing="hash"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-[0_2px_4px_rgba(10,37,64,.04),0_8px_24px_rgba(10,37,64,.06)] border border-[#E3E8EE] rounded-2xl",
            },
          }}
        />
      </div>
    </main>
  );
}
