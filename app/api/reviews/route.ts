import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  BufferApiError,
  getAccount,
  getChannels,
  getScheduledPosts,
  usableChannels,
} from "@/lib/buffer";
import { DEFAULT_WEEK } from "@/lib/dates";
import {
  createReview,
  listReviews,
  managerView,
  validateCreateInput,
} from "@/lib/reviews";
import { firstName } from "@/lib/review-logic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reviews = await listReviews(session.accountId);
  return NextResponse.json({ reviews: reviews.map(managerView) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateCreateInput((body ?? {}) as Record<string, unknown>);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const account = await getAccount(session.accountId);
    const orgId = session.organizationId || account.organizations[0]?.id;
    if (!orgId) {
      return NextResponse.json({ error: "No Buffer organization found." }, { status: 400 });
    }
    const channels = usableChannels(await getChannels(session.accountId, orgId));
    const channelIds =
      parsed.channelIds.length > 0 ? parsed.channelIds : channels.map((c) => c.id);
    const { posts } = await getScheduledPosts({
      accountId: session.accountId,
      organizationId: orgId,
      channelIds,
      start: parsed.rangeStart || DEFAULT_WEEK.startUtc,
      end: parsed.rangeEnd || DEFAULT_WEEK.endUtc,
    });
    const wanted = new Set(parsed.postIds);
    const selected = posts.filter((p) => wanted.has(p.id));
    if (selected.length !== parsed.postIds.length) {
      return NextResponse.json(
        { error: "Some selected posts are no longer in this scheduled range. Refresh and try again." },
        { status: 409 },
      );
    }

    const { review, url } = await createReview({
      accountId: session.accountId,
      organizationId: orgId,
      clientName: parsed.clientName,
      sharedBy: firstName(account.name, "your manager"),
      channels,
      channelIds,
      rangeStart: parsed.rangeStart || DEFAULT_WEEK.startUtc,
      rangeEnd: parsed.rangeEnd || DEFAULT_WEEK.endUtc,
      posts: selected,
    });

    return NextResponse.json({
      id: review.id,
      url,
      review: managerView(review),
    });
  } catch (err) {
    const status = err instanceof BufferApiError ? err.status : 502;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create the review link." },
      { status },
    );
  }
}
