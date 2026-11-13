import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getReviewById, managerView, saveReview } from "@/lib/reviews";
import { listCollaborationNotes } from "@/lib/buffer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const review = await getReviewById(id);
  if (!review || review.accountId !== session.accountId) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  // Best-effort enrichment from Buffer Notes, without failing the page.
  if (review.submittedAt) {
    try {
      let dirty = false;
      for (const post of review.posts) {
        if (post.noteId) continue;
        const notes = await listCollaborationNotes(session.accountId, post.postId);
        const match = notes.find((n) => n.text.includes("via ReviewLink"));
        if (match) {
          post.noteId = match.id;
          post.noteSyncedAt = match.createdAt ? Date.parse(match.createdAt) || Date.now() : Date.now();
          post.noteError = null;
          dirty = true;
        }
      }
      if (dirty) await saveReview(review);
    } catch {
      /* Redis record is still shown */
    }
  }

  return NextResponse.json({ review: managerView(review) });
}
