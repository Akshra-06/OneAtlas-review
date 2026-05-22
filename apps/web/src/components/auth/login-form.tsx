"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "./google-button";

export function LoginForm() {
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
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[#425466]">
          Sign in to continue building with OneAtlas.
        </p>
      </div>

      <div className="bg-white border border-[#E3E8EE] rounded-2xl p-8 shadow-[0_2px_4px_rgba(10,37,64,.04),0_8px_24px_rgba(10,37,64,.06)]">
        <GoogleButton label="Continue with Google" />

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
              Email
            </label>
            <Input type="email" placeholder="you@company.com" required />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#0A2540]">
                Password
              </label>
              <Link
                href="#"
                className="text-xs font-medium text-[#635BFF] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input type="password" placeholder="••••••••" required />
          </div>
          <Button
            variant="gradient"
            className="w-full h-11"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-[#425466] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[#635BFF] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
