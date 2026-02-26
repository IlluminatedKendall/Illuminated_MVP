"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Transaction = {
  id: string;
  transaction_date: string | null;
  merchants: {
    merchant_name: string;
  } | null;
  user_categories: { name: string } | null;
  items: Array<{
    item_id: string | number;
    item_name: string;
    item_price: number | null;
    item_cat_1: string | null;
  }>;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatCurrency(value: number | null) {
  return currencyFormatter.format(value ?? 0);
}

type Props = {
  transactions: Transaction[];
};

function formatDateLabel(timestamp: string | null) {
  if (!timestamp) {
    return "Unknown Date";
  }
  const parsedDate = new Date(`${timestamp}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown Date";
  }
  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export default function TransactionList({ transactions }: Props) {
  const router = useRouter();
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);

  async function handleDelete(transactionId: string) {
    if (deletingTransactionId) {
      return;
    }

    setDeletingTransactionId(transactionId);
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", transactionId);

    if (error) {
      console.error("Failed to delete transaction:", error.message);
      setDeletingTransactionId(null);
      return;
    }

    if (expandedTransactionId === transactionId) {
      setExpandedTransactionId(null);
    }
    setDeletingTransactionId(null);
    router.refresh();
  }

  return (
    <ul className="space-y-3">
      {transactions.map((transaction) => {
        const isExpanded = expandedTransactionId === transaction.id;
        const merchantName = transaction.merchants?.merchant_name ?? "Unknown Merchant";
        const transactionTotal = transaction.items.reduce(
          (sum, item) => sum + Number(item.item_price ?? 0),
          0
        );

        return (
          <li key={transaction.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-6 md:items-center">
              <button
                type="button"
                onClick={() =>
                  setExpandedTransactionId(isExpanded ? null : transaction.id)
                }
                className="grid w-full grid-cols-1 gap-3 text-left md:col-span-5 md:grid-cols-5 md:items-center"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Merchant</p>
                  <p className="mt-1 font-medium text-slate-900">{merchantName}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Date</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatDateLabel(transaction.transaction_date)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Category</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {transaction.user_categories?.name ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Total Price</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatCurrency(transactionTotal)}
                  </p>
                </div>

                <div className="flex items-center justify-between md:block md:text-right">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Item Count</p>
                    <p className="mt-1 text-lg font-semibold text-neonPurple">
                      {transaction.items.length}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                    {isExpanded ? "Hide details" : "View details"}
                  </span>
                </div>
              </button>

              <div className="md:text-right">
                <button
                  type="button"
                  onClick={() => void handleDelete(transaction.id)}
                  disabled={deletingTransactionId === transaction.id}
                  className="text-sm font-semibold text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingTransactionId === transaction.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            {isExpanded ? (
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4">
                <ul className="space-y-2">
                  {transaction.items.map((item) => (
                    <li
                      key={item.item_id}
                      className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-3"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Item</p>
                        <p className="mt-1 text-sm font-medium text-zinc-900">{item.item_name}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Category</p>
                        <p className="mt-1 text-sm text-slate-700">
                          {item.item_cat_1 ?? "Uncategorized"}
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Price</p>
                        <p className="mt-1 text-sm font-semibold text-neonPurple">
                          {formatCurrency(item.item_price)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
