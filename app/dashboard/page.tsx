
import { supabase } from "@/lib/supabase";
import UploadReceipt from "./UploadReceipt";
import TransactionList from "./TransactionList";
export const dynamic = "force-dynamic";

type TransactionItem = {
  item_id: string | number;
  item_name: string;
  item_price: number | null;
  item_cat_1: string | null;
};

type DashboardTransaction = {
  id: string;
  transaction_date: string | null;
  merchants: {
    merchant_name: string;
  } | null;
  items: TransactionItem[];
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
    .from("transactions")
    .select(
      `
      id,
      transaction_date,
      merchants (
        merchant_name
      ),
      items (
        item_id,
        item_name,
        item_price,
        item_cat_1
      )
      `
    )
    .order("transaction_date", { ascending: false });

  if (error) {
    return {
      transactions: [] as DashboardTransaction[],
      errorMessage: error.message
    };
  }

  const normalizedTransactions = (data ?? []).map((tx) => {
    const merchantValue = (tx as { merchants?: unknown }).merchants;
    const itemsValue = (tx as { items?: unknown }).items;
    const merchantObject = Array.isArray(merchantValue)
      ? (merchantValue[0] as { merchant_name?: string } | undefined) ?? null
      : (merchantValue as { merchant_name?: string } | null);
    const normalizedItems = Array.isArray(itemsValue)
      ? itemsValue.map((item) => ({
          item_id: (item as { item_id?: string | number }).item_id ?? "",
          item_name: String((item as { item_name?: string }).item_name ?? ""),
          item_price: Number((item as { item_price?: number }).item_price ?? 0),
          item_cat_1: String((item as { item_cat_1?: string }).item_cat_1 ?? "Uncategorized")
        }))
      : [];

    return {
      ...tx,
      merchants:
        merchantObject && merchantObject.merchant_name
          ? { merchant_name: merchantObject.merchant_name }
          : null,
      items: normalizedItems
    };
  });

  return {
    transactions: normalizedTransactions as DashboardTransaction[],
    errorMessage: null
  };
}

export default async function DashboardPage() {
  const { transactions, errorMessage } = await getTransactions();
  const totalSpent = transactions.reduce(
    (sum, tx) =>
      sum + tx.items.reduce((itemSum, item) => itemSum + Number(item.item_price ?? 0), 0),
    0
  );
  
  return (
    <main className="min-h-screen bg-white">
      <div className="page-shell">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neonPurple">
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

        <UploadReceipt />

        <section className="section-card">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Recent Transactions
            </h2>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
              {transactions.length} transactions
            </span>
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-dashed border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              Could not load transactions: {errorMessage}
            </p>
          ) : transactions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-500">
              No transaction records found in `transactions`.
            </p>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </section>
      </div>
    </main>
  );
}


// Triggering new build