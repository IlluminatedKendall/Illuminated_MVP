"use client";

import { Lightbulb } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ReviewItem = {
  item_name: string;
  item_price: number;
  item_cat_1: string;
};

type ScannedReceipt = {
  transaction_date: string;
  merchant_name: string;
  items: ReviewItem[];
};

export default function UploadReceipt() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const isReviewing = reviewItems.length > 0;

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch("/api/categories");
      const payload = (await res.json()) as { categories?: { id: string; name: string }[] };
      setCategories(payload.categories ?? []);
      if (!payload.categories?.length) setCategoryId("");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isReviewing) fetchCategories();
  }, [isReviewing, fetchCategories]);

  function resetFlow() {
    setMerchantName("");
    setTransactionDate("");
    setReviewItems([]);
    setCategoryId("");
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file || isScanning || isSaving) {
      return;
    }

    setIsScanning(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as {
        error?: string;
        extracted?: ScannedReceipt;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to scan receipt.");
      }

      const extracted = payload.extracted;
      if (!extracted || !Array.isArray(extracted.items) || extracted.items.length === 0) {
        throw new Error("No line items were found in this receipt.");
      }

      setMerchantName(String(extracted.merchant_name ?? "").trim());
      setTransactionDate(String(extracted.transaction_date ?? "").trim());
      setReviewItems(
        extracted.items.map((item) => ({
          item_name: String(item.item_name ?? "").trim(),
          item_cat_1: String(item.item_cat_1 ?? "").trim() || "Uncategorized",
          item_price: Number(item.item_price ?? 0)
        }))
      );
      setMessage("Scan complete. Review and edit before saving.");
    } catch (uploadError) {
      const errorMessage =
        uploadError instanceof Error ? uploadError.message : "Unexpected upload error.";
      setError(errorMessage);
    } finally {
      setIsScanning(false);
    }
  }

  async function handleConfirmSave() {
    if (isSaving || isScanning) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/save-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_date: transactionDate,
          merchant_name: merchantName,
          items: reviewItems,
          category_id: categoryId.trim() || null
        })
      });

      const payload = (await response.json()) as {
        error?: string;
        inserted_count?: number;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save receipt.");
      }

      setMessage(
        `Success: Saved ${payload.inserted_count ?? reviewItems.length} item(s).`
      );
      resetFlow();
      router.refresh();
    } catch (saveError) {
      const errorMessage =
        saveError instanceof Error ? saveError.message : "Unexpected save error.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  function updateItem(
    index: number,
    key: keyof ReviewItem,
    value: string
  ) {
    setReviewItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (key === "item_price") {
          const parsedValue = Number(value);
          return { ...item, item_price: Number.isNaN(parsedValue) ? 0 : parsedValue };
        }

        return { ...item, [key]: value };
      })
    );
  }

  function removeItem(index: number) {
    setReviewItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section className="section-card mb-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            AI Receipt Scan
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Upload a receipt
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Drop in a receipt image and we will extract the transaction automatically.
          </p>
        </div>

        {!isReviewing ? (
          <form onSubmit={handleUpload} className="space-y-4">
          <label
            htmlFor="receiptFile"
            className="flex min-h-36 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-violet-300 hover:bg-violet-50/30"
          >
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {file ? file.name : "Choose a receipt image"}
                </p>
                <p className="mt-1 text-xs text-slate-500">PNG, JPG, or WEBP</p>
              </div>
            </label>

            <input
              ref={inputRef}
              id="receiptFile"
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              disabled={isScanning || isSaving}
              className="sr-only"
            />

            <button
              type="submit"
              disabled={!file || isScanning || isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.4)] transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-[0_6px_20px_rgba(124,58,237,0.5)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isScanning ? (
                <>
                  <Lightbulb className="h-5 w-5 animate-pulse text-violet-200" strokeWidth={1.5} />
                  Scanning with AI...
                </>
              ) : (
                "Scan Receipt"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Review & Edit
              </p>
              <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
                <label className="text-sm text-slate-700">
                  Transaction Date
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(event) => setTransactionDate(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-violet-300 transition focus:ring-2 focus:ring-violet-400"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  Merchant Name
                  <input
                    value={merchantName}
                    onChange={(event) => setMerchantName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-violet-300 transition focus:ring-2 focus:ring-violet-400"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  Category
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={categoriesLoading}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-violet-300 transition focus:ring-2 focus:ring-violet-400 disabled:opacity-60"
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {reviewItems.map((item, index) => (
                <div key={`${item.item_name}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Line Item {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <label className="text-sm text-slate-700">
                      Item Name
                      <input
                        value={item.item_name}
                        onChange={(event) =>
                          updateItem(index, "item_name", event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-violet-300 transition focus:ring-2 focus:ring-violet-400"
                      />
                    </label>
                    <label className="text-sm text-slate-700">
                      Price
                      <input
                        type="number"
                        step="0.01"
                        value={item.item_price}
                        onChange={(event) =>
                          updateItem(index, "item_price", event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-violet-300 transition focus:ring-2 focus:ring-violet-400"
                      />
                    </label>
                    <label className="text-sm text-slate-700">
                      Category
                      <input
                        value={item.item_cat_1}
                        onChange={(event) =>
                          updateItem(index, "item_cat_1", event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-violet-300 transition focus:ring-2 focus:ring-violet-400"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={
                  isSaving ||
                  isScanning ||
                  !merchantName.trim() ||
                  !transactionDate.trim() ||
                  reviewItems.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.4)] transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-[0_6px_20px_rgba(124,58,237,0.5)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSaving ? (
                  <>
                    <Lightbulb className="h-5 w-5 animate-pulse text-violet-200" strokeWidth={1.5} />
                    Saving...
                  </>
                ) : (
                  "Confirm & Save"
                )}
              </button>
              <button
                type="button"
                onClick={resetFlow}
                disabled={isSaving || isScanning}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
