import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------ config you can tweak later ------------- */
const CATEGORIES = [
  "Macroeconomics",
  "Markets & Assets",
  "Geopolitics",
  "Trade & Supply Chain",
  "Energy & Resources",
  "Companies & Sectors",
  "Science, Tech & Innovation",
  "Crypto & DeFi",
] as const;

const INPUT = { perCategory: 2, freshnessHours: 24 };
/* ------------------------------------------------------ */

const FeedItemSchema = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().min(6),
  summary: z.string().min(10),
  stance: z.enum(["bullish", "bearish", "neutral"]),
  impact: z.number().int().min(1).max(5),
  sources: z.array(z.object({ name: z.string(), url: z.string().url() })).min(1),
  tickers: z.array(z.string()).optional().default([]),
  countries: z.array(z.string()).optional().default([]),
  published_at: z.string(),
  confidence: z.number().min(0).max(1),
});

const FeedSchema = z.object({
  date: z.string(),
  items: z.array(FeedItemSchema),
  model: z.string(),
  generation_ms: z.number().optional(),
});

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

function todayUTCDateStr() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

async function generateOnce() {
  const started = Date.now();

  const dateStr = todayUTCDateStr();
  const system = `You are a chief investment officer. Generate a daily tactical newsfeed.
Return STRICT JSON only (no prose). Categories: ${CATEGORIES.join(", ")}.
Rules: ${INPUT.perCategory} items per category; stance one of bullish/bearish/neutral; impact 1-5.
All items must be within last ${INPUT.freshnessHours} hours. Include at least one reputable source URL per item.`;

  const jsonSpec = `{
  "date": "${dateStr}",
  "items": [{
    "category": "<one of ${CATEGORIES.join(" | ")}>",
    "title": "string",
    "summary": "string",
    "stance": "bullish|bearish|neutral",
    "impact": 1,
    "sources": [{"name":"string","url":"https://..."}],
    "tickers": ["NVDA","CL=F"],
    "countries": ["US","CN"],
    "published_at": "YYYY-MM-DDTHH:mm:ssZ",
    "confidence": 0.0
  }],
  "model": "string"
}`;

  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: "gpt-5-turbo",
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content:
          `Generate exactly ${CATEGORIES.length * INPUT.perCategory} items covering all categories evenly.\n` +
          `Respond with JSON matching this schema:\n${jsonSpec}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices?.[0]?.message?.content ?? "{}";
  const parsed = FeedSchema.parse(JSON.parse(raw));
  const payload = { ...parsed, generation_ms: Date.now() - started };

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("feed")
    .upsert(
      [{
        date_utc: parsed.date,
        model: parsed.model,
        items: parsed.items as unknown as object,
        generated_at: new Date().toISOString(),
      }],
      { onConflict: "date_utc" }
    );

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
  return payload;
}

export async function POST() {
  try {
    const data = await generateOnce();
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("GEN ERROR:", err);
    const message = err?.message || err?.toString?.() || "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Convenience: allow GET from browser to trigger generation */
export async function GET() {
  return POST();
}
