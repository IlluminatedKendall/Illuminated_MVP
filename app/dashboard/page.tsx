import { supabase } from "@/lib/supabase";

type JoinedTransaction = {
  id: number;
  item_name: string;
  item_cat_1: string | null;
  item_price: number | null;
  merchants: {
    merchant_name: string;
  } | null;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatCurrency(value: number | null) {
  return currencyFormatter.format(value ?? 0);
}

async function getTransactions() {
  const { data, error } = await supabase
    .from("items")
    .select(
      `
      item_id,
      item_name,
      item_cat_1,
      item_price,
      merchants (
        merchant_name
      )
      `
    );

  if (error) {
    return {
      transactions: [] as JoinedTransaction[],
      errorMessage: error.message
    };
  }

  return {
    transactions: (data ?? []) as JoinedTransaction[],
    errorMessage: null
  };
}

export default async function DashboardPage() {
  const { transactions, errorMessage } = await getTransactions();
  const totalSpent = transactions.reduce(
    (sum, tx) => sum + Number(tx.item_price ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="page-shell">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Illuminated Payments
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
              Dashboard
            </h1>
          </div>

          <div className="section-card w-full max-w-sm border-neonPurple/25 bg-gradient-to-br from-white to-violet-50 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              Total Spent
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-neonPurple">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </header>

        <section className="section-card">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Recent Transactions
            </h2>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
              {transactions.length} records
            </span>
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-dashed border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              Could not load transactions: {errorMessage}
            </p>
          ) : transactions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-500">
              No transaction records found in `items`.
            </p>
          ) : (
            <ul className="space-y-3">
              {transactions.map((tx, index) => (
                <li
                 key={index}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-100 bg-white p-4 md:grid-cols-4 md:items-center"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                      Item
                    </p>
                    <p className="mt-1 font-medium text-zinc-900">
                      {tx.item_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                      Merchant
                    </p>
                    <p className="mt-1 font-medium text-zinc-800">
                      {tx.merchants?.merchant_name ?? "Unknown Merchant"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                      Category
                    </p>
                    <p className="mt-1 font-medium text-zinc-800">
                      {tx.item_cat_1 ?? "Uncategorized"}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                      Price
                    </p>
                    <p className="mt-1 text-lg font-semibold text-neonPurple">
                      {formatCurrency(tx.item_price)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
