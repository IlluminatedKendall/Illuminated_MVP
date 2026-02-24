import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

type ParsedReceiptItem = {
  item_name: string;
  item_price: number;
  item_cat_1?: string;
};

type ParsedReceiptPayload = {
  transaction_date: string;
  merchant_name: string;
  items: ParsedReceiptItem[];
};

function sanitizeModelJson(rawText: string) {
  const trimmed = rawText.trim();

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  return trimmed;
}

export async function POST(request: Request) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY environment variable." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = [
      "You are extracting ALL line items from a receipt image.",
      "Return ONLY a strict JSON object. No markdown, no code fences, no commentary.",
      "Use this exact top-level structure:",
      "{ transaction_date: \"YYYY-MM-DD\", merchant_name: \"Store\", items: [{ item_name: \"Coffee\", item_price: 4.00, item_cat_1: \"Food\" }] }",
      "transaction_date must be the physical receipt date formatted as YYYY-MM-DD.",
      "merchant_name must be the merchant shown on the receipt.",
      "items must ONLY contain physical products/services purchased.",
      "If Tax, Tip, Service Fee, Delivery Fee, or other fees exist, include them as separate item rows in items.",
      "CRITICAL RULE: NEVER include these as objects in items: Total, Subtotal, Balance Due, Cash, Visa, Mastercard, Change, Savings, Discounts, Coupons, or payment-method lines.",
      "Do not extract any payment rows, tender rows, or receipt summary totals into items.",
      "Grocery receipts (Kroger/King Soopers style) often show informational Savings, Coupons, or Discounts directly below an item.",
      "DO NOT extract those savings/coupon/discount lines as separate items or negative numbers if the main item price on the right already reflects post-discount cost.",
      "If you add the Total line as an item, you will ruin the math. The sum of the item_price values you extract must naturally equal the receipt's final total.",
      "The sum of all item_price values, including Tax and Fees, MUST perfectly equal the final total paid at the bottom of the receipt.",
      "If uncertain, make your best estimate from the visible receipt text."
    ].join("\n");

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType
        }
      }
    ]);

    const rawText = result.response.text();
    const jsonText = sanitizeModelJson(rawText);

    let parsed: ParsedReceiptPayload;
    try {
      parsed = JSON.parse(jsonText) as ParsedReceiptPayload;
    } catch {
      return NextResponse.json(
        { error: "Gemini returned non-JSON output.", raw: rawText },
        { status: 502 }
      );
    }

    const merchantName = String(parsed?.merchant_name ?? "").trim();
    const transactionDate = String(parsed?.transaction_date ?? "").trim();
    const parsedItems = Array.isArray(parsed?.items) ? parsed.items : [];

    if (!merchantName || !transactionDate || parsedItems.length === 0) {
      return NextResponse.json(
        { error: "Gemini returned an invalid receipt payload." },
        { status: 422 }
      );
    }

    const sanitizedItems = parsedItems
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
          item_price: itemPrice
        };
      })
      .filter(
        (
          item
        ): item is {
          item_name: string;
          item_cat_1: string;
          item_price: number;
        } =>
          item !== null
      );

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { error: "No valid line items were extracted from the receipt." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      extracted: {
        transaction_date: transactionDate,
        merchant_name: merchantName,
        items: sanitizedItems
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while scanning receipt.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
