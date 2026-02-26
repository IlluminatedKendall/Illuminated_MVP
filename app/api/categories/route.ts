import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_categories")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch categories: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ categories: data ?? [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected error fetching categories.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { name?: string };
    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("user_categories")
      .insert({ user_id: user.id, name })
      .select("id, name, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create category: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ category: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected error creating category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
