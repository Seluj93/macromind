import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MacroMind",
  description: "AI-powered, real-time, customizable macro news dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">{children}</body>
    </html>
  );
}
