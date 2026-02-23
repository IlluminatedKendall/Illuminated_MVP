import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
      <section className="w-full max-w-3xl rounded-3xl border border-zinc-100 bg-white p-10 shadow-sm md:p-16">
        <div className="mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-neonPurple">
            Disruptive FinTech
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 md:text-6xl">
            Illuminated Payments
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-500 md:text-lg">
            Light-mode finance command center built for velocity, clarity, and
            bold decisions.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-neonPurple px-8 py-4 text-sm font-semibold tracking-wide text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-violet-700"
        >
          View Dashboard
        </Link>
      </section>
    </main>
  );
}
