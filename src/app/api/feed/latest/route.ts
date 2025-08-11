import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // always compute fresh

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE!;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  };
}

export async function GET() {
  try {
    const supabase = supabaseAdmin();

    // Latest by date_utc; (YYYY-MM-DD sorts lexicographically correctly)
    const { data, error } = await supabase
      .from("feed")
      .select("*")
      .order("date_utc", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // surface the real reason (e.g. table missing)
      throw new Error(`Supabase select failed: ${error.message}`);
    }
    if (!data) {
      return NextResponse.json({ error: "No feed found yet" }, { status: 404, headers: noStoreHeaders() });
    }

    return NextResponse.json(
      {
        date: data.date_utc,
        model: data.model,
        items: data.items,
        generated_at: data.generated_at,
      },
      { status: 200, headers: noStoreHeaders() }
    );
  } catch (err: any) {
    const message = err?.message || String(err);
    return NextResponse.json({ error: message }, { status: 500, headers: noStoreHeaders() });
  }
}
