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
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-[#7c3aed]">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                <path
                  d="M12 2.75L14.7 9.3L21.25 12L14.7 14.7L12 21.25L9.3 14.7L2.75 12L9.3 9.3L12 2.75Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
            <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Illuminated Payments
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Main Dashboard
            </h1>
            </div>
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
            <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-[#7c3aed]">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
                <path
                  d="M4.5 13.5H19.5M4.5 8.5H19.5M4.5 18.5H14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
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
          <div className="mt-6 hidden grid-cols-[1.5fr_1fr_1fr_auto] gap-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:grid">
            <p>Item</p>
            <p>Merchant</p>
            <p>Category</p>
            <p className="text-right">Price</p>
          </div>
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
