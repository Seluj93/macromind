'use client';

import { useState } from 'react';

/**
 * Renders THREE sibling cards (Time, Risk, Search) with the same widths
 * as the news cards: w-full / sm:w-[48%] / lg:w-[22%].
 * Place this component INSIDE the centered row in page.tsx:
 *
 *   <div className="flex flex-wrap justify-center gap-6 mt-10">
 *     <InvestmentAdvisor />
 *   </div>
 *
 * That wrapper centers these three cards horizontally.
 */
export default function InvestmentAdvisor() {
  const [horizon, setHorizon] = useState('');
  const [risk, setRisk] = useState('');

  const onSearch = () => {
    if (!horizon || !risk) {
      alert('Please select both Time Horizon and Risk Appetite.');
      return;
    }
    // TODO: wire up to your suggestion logic / API
    alert(`Searching ideas for: ${horizon} / ${risk}`);
  };

  const card = (title: string, children: React.ReactNode) => (
    <div className="w-full sm:w-[48%] lg:w-[22%]">
      <div className="bg-neutral-900 text-white rounded-xl p-4 h-full shadow-md hover:shadow-lg hover:scale-[1.02] transition">
        <h3 className="text-lg font-bold mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* Card 1: Time Horizon */}
      {card(
        '⏳ Time Horizon',
        <select
          className="bg-neutral-800 text-white rounded-lg px-3 py-2 w-full"
          value={horizon}
          onChange={(e) => setHorizon(e.target.value)}
        >
          <option value="">Select…</option>
          <option value="1-3m">1–3 months</option>
          <option value="3-9m">3–9 months</option>
          <option value="12m+">1+ year</option>
        </select>
      )}

      {/* Card 2: Risk Appetite */}
      {card(
        '⚠️ Risk Appetite',
        <select
          className="bg-neutral-800 text-white rounded-lg px-3 py-2 w-full"
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
        >
          <option value="">Select…</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      )}

      {/* Card 3: Search */}
      {card(
        '🔎 Get Suggestions',
        <div className="flex flex-col gap-3">
          <button
            onClick={onSearch}
            className="bg-green-600 hover:bg-green-700 rounded-lg px-5 py-2 font-semibold"
          >
            Search
          </button>
          <p className="text-xs text-neutral-300">
            Uses today’s context + your preferences to propose an idea.
          </p>
        </div>
      )}
    </>
  );
}
