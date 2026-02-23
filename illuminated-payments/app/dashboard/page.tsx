import Link from "next/link";
import { getRecentTransactions } from "@/lib/transactions";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function DashboardPage() {
  const { transactions, totalSpent, errorMessage } = await getRecentTransactions();

  return (
    <div className="min-h-screen bg-white px-6 py-10 sm:px-10 lg:px-16">
      <main className="mx-auto w-full max-w-6xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Illuminated Payments
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Main Dashboard
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to Login
          </Link>
        </header>

        <section className="mb-10 grid gap-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(124,58,237,0.6)]">
            <p className="text-sm font-medium text-slate-500">Total Spent</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[#7c3aed]">
              {currencyFormatter.format(totalSpent)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Across {transactions.length} recent transactions
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Recent Transactions
          </h2>
          {errorMessage ? (
            <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          {!errorMessage && transactions.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              No transactions found in the items table yet.
            </p>
          ) : null}

          <ul className="mt-6 space-y-3">
            {transactions.map((transaction, index) => (
              <li
                key={`${transaction.item_name}-${transaction.merchant_name}-${index}`}
                className="grid gap-3 rounded-xl border border-slate-100 p-4 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{transaction.item_name}</p>
                </div>
                <p className="text-sm text-slate-700">{transaction.merchant_name}</p>
                <p className="text-sm text-slate-500">{transaction.item_cat_1}</p>
                <p className="text-right text-base font-semibold text-[#7c3aed]">
                  {currencyFormatter.format(transaction.item_price)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
