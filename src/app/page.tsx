'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import NewsBlock from '../components/NewsBlock';
import InvestmentAdvisor from '../components/InvestmentAdvisor';

type NewsItem = { title: string; trendIcon?: string };
type NewsBlockType = { title: string; icon: string; items: NewsItem[] };

const initialFeed: NewsBlockType[] = [
  {
    title: 'Macroeconomics',
    icon: '🏛️',
    items: [
      { title: 'US unemployment rate remains at 3.6%', trendIcon: '➖' },
      { title: 'Eurozone inflation dips to 2.3%', trendIcon: '📉' },
    ],
  },
  {
    title: 'Markets & Assets',
    icon: '📊',
    items: [
      { title: 'S&P 500 hits new record high', trendIcon: '📈' },
      { title: 'Gold rises above $2,100 amid inflation fears', trendIcon: '📈' },
    ],
  },
  {
    title: 'Geopolitics',
    icon: '🌍',
    items: [
      { title: 'China and Philippines clash in South China Sea', trendIcon: '📉' },
      { title: "Russia warns of NATO 'provocation' near Kaliningrad", trendIcon: '📉' },
    ],
  },
  {
    title: 'Trade & Supply Chain',
    icon: '🚢',
    items: [
      { title: 'US and India sign new trade pact', trendIcon: '📈' },
      { title: 'Global container rates rise 10%', trendIcon: '📈' },
    ],
  },
  {
    title: 'Energy & Commodities',
    icon: '⚡',
    items: [
      { title: 'Oil prices surge after OPEC cuts', trendIcon: '📈' },
      { title: 'Europe boosts LNG reserves', trendIcon: '📈' },
    ],
  },
  {
    title: 'Companies & Sectors',
    icon: '🏢',
    items: [
      { title: 'Amazon reports strong Q2 revenue, stock up 6%', trendIcon: '📈' },
      { title: 'Apple delays Vision Pro launch in Europe', trendIcon: '📉' },
    ],
  },
  {
    title: 'Science & Tech',
    icon: '🔬',
    items: [
      { title: 'Breakthrough in quantum computing', trendIcon: '📈' },
      { title: 'AI detects cancer cells with 96% accuracy', trendIcon: '📈' },
    ],
  },
  {
    title: 'Crypto & DeFi',
    icon: '₿',
    items: [
      { title: 'Bitcoin breaks $70K resistance', trendIcon: '📈' },
      { title: 'SEC delays Ethereum ETF decision', trendIcon: '➖' },
    ],
  },
];

export default function Home() {
  const [feed, setFeed] = useState(initialFeed);
  const [selected, setSelected] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const newFeed = Array.from(feed);
    const [moved] = newFeed.splice(result.source.index, 1);
    newFeed.splice(result.destination.index, 0, moved);
    setFeed(newFeed);
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-10 flex justify-center items-center gap-2">
        🧠 <span>MacroMind</span>
      </h1>

      {/* NEWS GRID (draggable) */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="newsfeed" direction="horizontal">
          {(provided) => (
            <div
              className="flex flex-wrap justify-center gap-6"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {feed.map((block, index) => (
                <Draggable key={block.title} draggableId={block.title} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => setSelected(block.title)}
                      className={`
                        w-full sm:w-[48%] lg:w-[22%] transition-all cursor-pointer rounded-xl
                        ${selected === block.title ? 'ring-4 ring-indigo-400' : ''}
                        ${snapshot.isDragging ? 'scale-105 opacity-80' : ''}
                      `}
                    >
                      <NewsBlock {...block} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* ADVISOR ROW (centered + separated) */}
      <div className="flex flex-wrap justify-center gap-6 mt-10">
        <InvestmentAdvisor />
      </div>
    </main>
  );
}

