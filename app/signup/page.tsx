"use client";

import { createClient } from "@/lib/supabase/client";
import { Lightbulb } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(
          signUpError.message === "User already registered"
            ? "An account with this email already exists. Try logging in."
            : "Unable to create account. Please try again."
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-violet-900/20"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(88, 28, 135, 0.3), transparent)",
        }}
      />
      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-md md:p-12">
        <div className="mb-10">
          <Lightbulb
            className="mb-4 h-10 w-10 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
            strokeWidth={1.5}
          />
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
            Illuminated Payments
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Sign Up for Illuminated Payments
          </h1>
          <p className="mt-4 max-w-sm text-base leading-7 text-slate-400">
            Create an account to access the Illuminated Payments dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-violet-400"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none ring-violet-400/50 transition focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-violet-400"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none ring-violet-400/50 transition focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-8 py-4 text-sm font-semibold tracking-wide text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition hover:-translate-y-0.5 hover:bg-violet-500 hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-400 underline-offset-2 hover:text-violet-300 hover:underline"
          >
            Log in
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-slate-400">
          <Link
            href="/"
            className="font-medium text-violet-400 underline-offset-2 hover:text-violet-300 hover:underline"
          >
            ← Back to home
          </Link>
        </p>
      </section>
    </main>
  );
}
