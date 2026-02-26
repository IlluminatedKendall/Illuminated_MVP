"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  created_at?: string;
};

export default function CategoryManager() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const payload = (await response.json()) as {
        error?: string;
        category?: Category;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create category.");
      }

      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <label className="flex-1">
        <span className="sr-only">Category name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Software Subscriptions"
          disabled={loading}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-violet-300 transition focus:ring-2 focus:ring-violet-400 disabled:opacity-60"
        />
      </label>
      <button
        type="submit"
        disabled={!name.trim() || loading}
        className="rounded-xl border border-violet-600 bg-white px-4 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
      >
        {loading ? "Saving…" : "Add Category"}
      </button>
      {error ? (
        <p className="w-full text-sm text-rose-600 sm:w-auto">{error}</p>
      ) : null}
    </form>
  );
}
