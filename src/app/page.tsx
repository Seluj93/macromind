"use client";

import { useEffect, useState } from "react";
import NewsBlock from "@/components/NewsBlock";
import InvestmentAdvisor from "@/components/InvestmentAdvisor";

/** ------- Fallback mock feed (renders until API has data) ------- */
type NewsItem = { title: string; trendIcon: string };
type NewsBlockType = { title: string; icon: string; items: NewsItem[] };

const initialFeed: NewsBlockType[] = [
  { title: "Macroeconomics", icon: "🏛️", items: [
    { title: "Placeholder macro item 1", trendIcon: "➖" },
    { title: "Placeholder macro item 2", trendIcon: "➖" },
  ]},
  { title: "Markets & Assets", icon: "📊", items: [
    { title: "Placeholder markets item 1", trendIcon: "➖" },
    { title: "Placeholder markets item 2", trendIcon: "➖" },
  ]},
  { title: "Geopolitics", icon: "🌍", items: [
    { title: "Placeholder geo item 1", trendIcon: "➖" },
    { title: "Placeholder geo item 2", trendIcon: "➖" },
  ]},
  { title: "Trade & Supply Chain", icon: "🚢", items: [
    { title: "Placeholder trade item 1", trendIcon: "➖" },
    { title: "Placeholder trade item 2", trendIcon: "➖" },
  ]},
  { title: "Energy & Commodities", icon: "⚡", items: [
    { title: "Placeholder energy item 1", trendIcon: "➖" },
    { title: "Placeholder energy item 2", trendIcon: "➖" },
  ]},
  { title: "Companies & Sectors", icon: "🏢", items: [
    { title: "Placeholder companies item 1", trendIcon: "➖" },
    { title: "Placeholder companies item 2", trendIcon: "➖" },
  ]},
  { title: "Science & Tech", icon: "🔬", items: [
    { title: "Placeholder tech item 1", trendIcon: "➖" },
    { title: "Placeholder tech item 2", trendIcon: "➖" },
  ]},
  { title: "Crypto & DeFi", icon: "₿", items: [
    { title: "Placeholder crypto item 1", trendIcon: "➖" },
    { title: "Placeholder crypto item 2", trendIcon: "➖" },
  ]},
];

/** ------- Map API items -> UI blocks ------- */
type ApiItem = {
  category: string;
  title: string;
  sentiment?: "Bullish" | "Bearish" | "Neutral";
};

const CATEGORY_ICONS: Record<string, string> = {
  "Macroeconomics": "🏛️",
  "Markets & Assets": "📊",
  "Geopolitics": "🌍",
  "Trade & Supply Chain": "🚢",
  "Energy & Commodities": "⚡",
  "Companies & Sectors": "🏢",
  "Science & Tech": "🔬",
  "Crypto & DeFi": "₿",
};

const SENTIMENT_ICON: Record<string, string> = {
  Bullish: "📈",
  Bearish: "📉",
  Neutral: "➖",
};

function toBlocks(items: ApiItem[]): NewsBlockType[] {
  const cats = Object.keys(CATEGORY_ICONS);
  const grouped: Record<string, NewsItem[]> = Object.fromEntries(
    cats.map((c) => [c, [] as NewsItem[]])
  );

  for (const it of items) {
    if (!CATEGORY_ICONS[it.category]) continue;
    grouped[it.category].push({
      title: it.title,
      trendIcon: it.sentiment ? SENTIMENT_ICON[it.sentiment] : "➖",
    });
  }

  return cats.map((c) => ({
    title: c,
    icon: CATEGORY_ICONS[c],
    items: (grouped[c] || []).slice(0, 2),
  }));
}

/** ------- Page ------- */
export default function HomePage() {
  const [feed, setFeed] = useState<NewsBlockType[]>(initialFeed);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/feed/latest", { cache: "no-store" });
        if (!res.ok) return; // keep fallback until first generation exists
        const json = await res.json();
        const blocks = toBlocks(json.items as ApiItem[]);
        if (blocks.some((b) => b.items.length)) setFeed(blocks);
      } catch (e) {
        console.warn("Failed to load latest feed", e);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {feed.map((block, idx) => (
          <NewsBlock
            key={block.title + idx}
            title={block.title}
            icon={block.icon}
            items={block.items}
          />
        ))}
      </div>

      <div className="mt-6">
        <InvestmentAdvisor />
      </div>
    </main>
  );
}
