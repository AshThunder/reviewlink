import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}

export async function GET(req: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/", req.url));
}
