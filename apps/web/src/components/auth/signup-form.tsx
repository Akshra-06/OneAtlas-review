"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "./google-button";

export function SignupForm() {
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#0A2540]">
          Start Building Free
        </h1>
        <p className="mt-2 text-sm text-[#425466]">
          Your first internal tool is free. No credit card needed.
        </p>
      </div>

      <div className="bg-white border border-[#E3E8EE] rounded-2xl p-8 shadow-[0_2px_4px_rgba(10,37,64,.04),0_8px_24px_rgba(10,37,64,.06)]">
        <GoogleButton label="Sign up with Google" />

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-[#EDF1F6]" />
          <span className="text-xs text-[#697386] uppercase tracking-wider">
            or
          </span>
          <div className="h-px flex-1 bg-[#EDF1F6]" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#0A2540] mb-1.5 block">
              Full name
            </label>
            <Input type="text" placeholder="Jane Doe" required />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0A2540] mb-1.5 block">
              Work email
            </label>
            <Input type="email" placeholder="you@company.com" required />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0A2540] mb-1.5 block">
              Password
            </label>
            <Input type="password" placeholder="At least 8 characters" required />
          </div>
          <Button
            variant="gradient"
            className="w-full h-11"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-[#425466] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#635BFF] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
