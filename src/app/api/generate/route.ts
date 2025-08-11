// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// ----- ENV & clients -----
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { "X-Client-Info": "macromind-generate" } },
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ----- EXACT category names used by the UI -----
const CATEGORIES = [
  "Macroeconomics",
  "Markets & Assets",
  "Geopolitics",
  "Trade & Supply Chain",
  "Energy & Commodities",
  "Companies & Sectors",
  "Science & Tech",
  "Crypto & DeFi",
] as const;

const FeedItemSchema = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().min(6),
  summary: z.string().min(10),
  sentiment: z.enum(["Bullish", "Bearish", "Neutral"]),
  source: z.string().optional(),
  url: z.string().url().optional(),
});

const FeedSchema = z.object({
  date_utc: z.string(), // YYYY-MM-DD
  items: z.array(FeedItemSchema).length(CATEGORIES.length * 2),
  model: z.string(),
});

function todayUTCDateStr() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function handleGenerate() {
  try {
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE" },
        { status: 500 }
      );
    }

    const dateStr = todayUTCDateStr();

    const system = `You are a chief investment officer. Generate a daily tactical newsfeed strictly as JSON. Categories: ${CATEGORIES.join(
      ", "
    )}. Rules: exactly 2 items per category; "sentiment" must be Bullish|Bearish|Neutral; include concise "summary"; prefer reputable sources. Only include items from today ${dateStr}T00:00Z to now.`;

    const jsonSpec = JSON.stringify(
      {
        date_utc: dateStr,
        items: [
          {
            category: "<one of " + CATEGORIES.join(" | ") + ">",
            title: "string",
            summary: "string",
            sentiment: "Bullish|Bearish|Neutral",
            source: "Reuters/Bloomberg/FT/...",
            url: "https://...",
          },
        ],
        model: "string",
      },
      null,
      2
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // <- correct model
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content:
            `Return EXACTLY ${CATEGORIES.length * 2} items covering all categories evenly.\n` +
            `Respond with a single JSON object shaped like:\n${jsonSpec}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = FeedSchema.parse(JSON.parse(raw));

    // Save idempotently (upsert on date_utc)
    const { error } = await supabase
      .from("feed")
      .upsert(
        [
          {
            date_utc: parsed.date_utc,
            model: parsed.model || "gpt-4o-mini",
            items: parsed.items,
          },
        ],
        { onConflict: "date_utc" }
      );

    if (error) throw error;

    return NextResponse.json({ ok: true, date_utc: parsed.date_utc, count: parsed.items.length }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Expose BOTH methods so browser and cron can hit it
export async function GET() {
  return handleGenerate();
}
export async function POST() {
  return handleGenerate();
}
