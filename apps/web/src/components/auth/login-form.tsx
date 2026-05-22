"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "./google-button";

export function LoginForm() {
  const { client, setActive } = useClerk();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setLoading(true);
    setError("");

    try {
      const result = await client.signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.log("Additional step required", result);
        setError("Additional verification required. Please use the main Clerk UI.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Invalid email or password");
    } finally {
      setLoading(false);
    }
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
            <Input
              type="email"
              placeholder="you@company.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
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
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <Button
            variant="gradient"
            className="w-full h-11"
            disabled={loading || !client}
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
