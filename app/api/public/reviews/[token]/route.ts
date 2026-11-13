import { NextRequest, NextResponse } from "next/server";
import { assertNoSecrets, toPublicReview } from "@/lib/review-logic";
import { getReviewByToken } from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "This review link isn’t available." }, { status: 404 });
  }
  const review = await getReviewByToken(token);
  if (!review) {
    return NextResponse.json({ error: "This review link isn’t available." }, { status: 404 });
  }
  const payload = { review: toPublicReview(review) };
  assertNoSecrets(payload);
  const status = payload.review.status;
  const http = status === "expired" || status === "revoked" ? 200 : 200;
  return NextResponse.json(payload, { status: http });
}
