import { getSupabaseClient, supabaseEnvReady } from "@/lib/supabase";

type MerchantJoin =
  | { merchant_name: string | null }
  | Array<{ merchant_name: string | null }>
  | null;

type ItemRow = {
  item_name: string | null;
  item_cat_1: string | null;
  item_price: number | string | null;
  merchants: MerchantJoin;
};

export type Transaction = {
  item_name: string;
  merchant_name: string;
  item_cat_1: string;
  item_price: number;
};

export type TransactionsResult = {
  transactions: Transaction[];
  totalSpent: number;
  errorMessage: string | null;
};

function getMerchantName(joinedMerchant: MerchantJoin) {
  if (!joinedMerchant) {
    return "Unknown Merchant";
  }

  if (Array.isArray(joinedMerchant)) {
    return joinedMerchant[0]?.merchant_name ?? "Unknown Merchant";
  }

  return joinedMerchant.merchant_name ?? "Unknown Merchant";
}

function toNumber(value: number | string | null) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export async function getRecentTransactions(): Promise<TransactionsResult> {
  const supabase = getSupabaseClient();

  if (!supabase || !supabaseEnvReady) {
    return {
      transactions: [],
      totalSpent: 0,
      errorMessage:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    };
  }

  const selectFields = `
    item_name,
    item_cat_1,
    item_price,
    merchants:merchant_id (
      merchant_name
    )
  `;

  const queryRecent = async (orderByColumn?: string) => {
    const query = supabase.from("items").select(selectFields).limit(12);

    if (!orderByColumn) {
      return query;
    }

    return query.order(orderByColumn, { ascending: false });
  };

  let queryResult = await queryRecent("created_at");

  if (queryResult.error) {
    queryResult = await queryRecent("id");
  }

  if (queryResult.error) {
    queryResult = await queryRecent();
  }

  if (queryResult.error) {
    return {
      transactions: [],
      totalSpent: 0,
      errorMessage: queryResult.error.message,
    };
  }

  const transactions = (queryResult.data ?? []).map((row: ItemRow) => {
    const price = toNumber(row.item_price);

    return {
      item_name: row.item_name ?? "Untitled Item",
      merchant_name: getMerchantName(row.merchants),
      item_cat_1: row.item_cat_1 ?? "Uncategorized",
      item_price: price,
    };
  });

  const totalSpent = transactions.reduce(
    (sum, transaction) => sum + transaction.item_price,
    0,
  );

  return {
    transactions,
    totalSpent,
    errorMessage: null,
  };
}
