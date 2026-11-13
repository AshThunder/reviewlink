import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getReviewById, managerView, withReviewLock } from "@/lib/reviews";
import { writeNotesForReview } from "@/lib/write-notes";

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
      if (!current.submittedAt) {
        throw Object.assign(new Error("Nothing to resync yet — the client hasn’t sent decisions."), { status: 400 });
      }
      return writeNotesForReview(current);
    });
    if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    return NextResponse.json({ review: managerView(review) });
  } catch (err) {
    const status = (err as { status?: number }).status || 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not resync notes." },
      { status },
    );
  }
}
