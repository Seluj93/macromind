import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

// ✅ dummy export so Next.js treats it as a module
export const dynamic = "force-dynamic";
