import { Lightbulb } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-violet-900/20"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(88, 28, 135, 0.3), transparent)",
        }}
      />
      <section className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md sm:p-10 md:p-12 lg:p-16">
        <div className="mb-10 sm:mb-12">
          <Lightbulb
            className="mb-4 h-10 w-10 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] sm:h-12 sm:w-12"
            strokeWidth={1.5}
          />
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            Illuminated Payments
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 md:text-lg">
            Shed light on your expenses. Upload receipts, let AI instantly extract
            the data, and securely organize your finances with custom, private
            categories.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-8 py-4 text-sm font-semibold tracking-wide text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition hover:-translate-y-0.5 hover:bg-violet-500 hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] md:w-auto"
        >
          Login to Dashboard
        </Link>
      </section>
    </main>
  );
}
