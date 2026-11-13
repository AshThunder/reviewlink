import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { BufferApiError, getAccount, getScheduledPosts } from "@/lib/buffer";
import { DEFAULT_WEEK } from "@/lib/dates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = req.nextUrl;
  const channelIds = (searchParams.get("channelIds") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const start = searchParams.get("start") || DEFAULT_WEEK.startUtc;
  const end = searchParams.get("end") || DEFAULT_WEEK.endUtc;

  try {
    const orgId =
      session.organizationId ||
      (await getAccount(session.accountId)).organizations[0]?.id;
    if (!orgId) {
      return NextResponse.json({ posts: [] });
    }
    const result = await getScheduledPosts({
      accountId: session.accountId,
      organizationId: orgId,
      channelIds,
      start,
      end,
    });
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof BufferApiError ? err.status : 502;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load posts" },
      { status },
    );
  }
}
