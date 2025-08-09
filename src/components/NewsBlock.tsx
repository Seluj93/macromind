'use client';

type NewsItem = {
  title: string;
  trendIcon?: string;
};

type NewsBlockProps = {
  title: string;
  icon: string;
  items: NewsItem[];
};

export default function NewsBlock({ title, icon, items }: NewsBlockProps) {
  return (
    <div className="bg-neutral-900 text-white rounded-xl p-4 h-full shadow-md hover:shadow-lg hover:scale-[1.02] transition">
      <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      <ul className="text-sm space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>{item.title}</span>
            <span>{item.trendIcon}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
