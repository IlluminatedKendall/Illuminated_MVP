
import { createClient } from "@/lib/supabase/server";
import CategoryManager from "./CategoryManager";
import LogoutButton from "./LogoutButton";
import TransactionList from "./TransactionList";
import UploadReceipt from "./UploadReceipt";
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
  user_categories: { name: string } | null;
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      id,
      transaction_date,
      merchants (
        merchant_name
      ),
      user_categories (
        name
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
    const categoryValue = (tx as { user_categories?: unknown }).user_categories;
    const itemsValue = (tx as { items?: unknown }).items;
    const merchantObject = Array.isArray(merchantValue)
      ? (merchantValue[0] as { merchant_name?: string } | undefined) ?? null
      : (merchantValue as { merchant_name?: string } | null);
    const categoryObject = Array.isArray(categoryValue)
      ? (categoryValue[0] as { name?: string } | undefined) ?? null
      : (categoryValue as { name?: string } | null);
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
      user_categories:
        categoryObject && categoryObject.name
          ? { name: categoryObject.name }
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
    <main className="min-h-screen bg-slate-50">
      <div className="page-shell">
        <div className="mb-6 flex justify-end">
          <LogoutButton />
        </div>

        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neonPurple">
              Illuminated Payments
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
              Dashboard
            </h1>
          </div>

          <div className="section-card w-full max-w-sm border-violet-200/50 bg-white shadow-sm ring-1 ring-slate-200/50">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              Total Spent
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-neonPurple">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </header>

        <section className="section-card mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Custom Categories
          </p>
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-zinc-900">
            Manage categories
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Create categories to organize your receipts. They will appear in the dropdown when uploading.
          </p>
          <CategoryManager />
        </section>

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
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
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