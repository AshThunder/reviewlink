import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getReviewById, managerView, saveReview, withReviewLock } from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  try {
    const review = await withReviewLock(id, async () => {
      const current = await getReviewById(id);
      if (!current || current.accountId !== session.accountId) return null;
      current.revokedAt = Date.now();
      current.expiresAt = Math.min(current.expiresAt, Date.now());
      await saveReview(current);
      return current;
    });
    if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    return NextResponse.json({ review: managerView(review) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not revoke the link." },
      { status: 500 },
    );
  }
}
