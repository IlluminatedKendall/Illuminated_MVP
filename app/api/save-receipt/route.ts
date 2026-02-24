import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

type SaveItemInput = {
  item_name: string;
  item_price: number;
  item_cat_1: string;
};

type SaveReceiptPayload = {
  transaction_date: string;
  merchant_name: string;
  items: SaveItemInput[];
};

async function getOrCreateMerchantId(merchantName: string) {
  const cleanName = merchantName.trim();
  if (!cleanName) {
    throw new Error("merchant_name is required.");
  }

  const { data: existingRow, error: searchError } = await supabase
    .from("merchants")
    .select("*")
    .ilike("merchant_name", cleanName)
    .limit(1)
    .maybeSingle();

  if (searchError) {
    throw new Error(`Unable to read merchants table: ${searchError.message}`);
  }

  if (existingRow) {
    const existingId =
      existingRow.id ?? existingRow.merchant_id ?? existingRow.merchantId ?? null;
    if (!existingId) {
      throw new Error("Could not infer merchant id column from existing merchant row.");
    }
    return existingId;
  }

  const { data: insertedRow, error: insertError } = await supabase
    .from("merchants")
    .insert({ merchant_name: cleanName })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Unable to create merchant: ${insertError.message}`);
  }

  const insertedId =
    insertedRow.id ?? insertedRow.merchant_id ?? insertedRow.merchantId ?? null;
  if (!insertedId) {
    throw new Error("Could not infer merchant id column from inserted merchant row.");
  }

  return insertedId;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveReceiptPayload;
    const transactionDate = String(body?.transaction_date ?? "").trim();
    const merchantName = String(body?.merchant_name ?? "").trim();
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!transactionDate) {
      return NextResponse.json({ error: "transaction_date is required." }, { status: 400 });
    }

    if (!merchantName) {
      return NextResponse.json({ error: "merchant_name is required." }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "At least one item is required." }, { status: 400 });
    }

    const merchantId = await getOrCreateMerchantId(merchantName);

    const { data: insertedTransaction, error: insertTransactionError } = await supabase
      .from("transactions")
      .insert({
        merchant_id: merchantId,
        transaction_date: transactionDate
      })
      .select("*")
      .single();

    if (insertTransactionError) {
      return NextResponse.json(
        { error: `Failed to create transaction: ${insertTransactionError.message}` },
        { status: 500 }
      );
    }

    const transactionId =
      insertedTransaction.transaction_id ??
      insertedTransaction.id ??
      insertedTransaction.transactionId ??
      null;

    if (!transactionId) {
      return NextResponse.json(
        { error: "Could not infer transaction_id from inserted transaction row." },
        { status: 500 }
      );
    }

    const normalizedItems = items
      .map((item) => {
        const itemName = String(item?.item_name ?? "").trim();
        const itemCat1 = String(item?.item_cat_1 ?? "").trim() || "Uncategorized";
        const itemPrice = Number(item?.item_price);

        if (!itemName || Number.isNaN(itemPrice)) {
          return null;
        }

        return {
          item_name: itemName,
          item_cat_1: itemCat1,
          item_price: itemPrice,
          transaction_id: transactionId
        };
      })
      .filter(
        (
          item
        ): item is {
          item_name: string;
          item_cat_1: string;
          item_price: number;
          transaction_id: string | number;
        } => item !== null
      );

    if (normalizedItems.length === 0) {
      return NextResponse.json(
        { error: "No valid line items available to save." },
        { status: 422 }
      );
    }

    const { error: insertError } = await supabase.from("items").insert(normalizedItems);
    if (insertError) {
      return NextResponse.json(
        { error: `Failed to save items: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      inserted_count: normalizedItems.length
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while saving receipt.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
