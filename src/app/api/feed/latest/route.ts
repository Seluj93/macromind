import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const supabase = supabaseClient();
    const { data, error } = await supabase
      .from("feed")
      .select("*")
      .order("date_utc", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return NextResponse.json(data || {}, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ✅ dummy export so Next.js treats it as a module
export const dynamic = "force-dynamic";
