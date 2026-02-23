import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white px-6 py-24 sm:px-10 lg:px-16">
      <main className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center rounded-3xl border border-slate-100 bg-white px-8 py-20 shadow-[0_25px_60px_-35px_rgba(124,58,237,0.25)] sm:px-16">
        <section className="w-full max-w-xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            FinTech MVP
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Illuminated Payments
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
            A disruptive payment command center built for clarity, speed, and
            modern finance workflows.
          </p>
          <Link
            href="/dashboard"
            className="mx-auto mt-12 inline-flex h-12 items-center justify-center rounded-xl bg-[#7c3aed] px-8 text-sm font-semibold text-white transition hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200"
          >
            View Dashboard
          </Link>
        </section>
      </main>
    </div>
  );
}
