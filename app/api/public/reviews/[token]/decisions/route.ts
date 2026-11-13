import { NextRequest, NextResponse } from "next/server";
import {
  DECISIONS_RATE_LIMIT,
  DECISIONS_RATE_WINDOW,
  applyDecisions,
  assertNoSecrets,
  decisionsMatch,
  hashToken,
  toPublicReview,
  validateDecisions,
} from "@/lib/review-logic";
import { getReviewById, getReviewByToken, saveReview, withReviewLock } from "@/lib/reviews";
import { getStore as redisStore } from "@/lib/redis";
import { writeNotesForReview } from "@/lib/write-notes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function rateLimited(token: string): Promise<boolean> {
  const key = `ratelimit:decisions:${hashToken(token)}`;
  const store = redisStore();
  const n = await store.incr(key);
  if (n === 1) await store.expire(key, DECISIONS_RATE_WINDOW);
  return n > DECISIONS_RATE_LIMIT;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "This review link isn’t available." }, { status: 404 });
  }

  if (await rateLimited(token)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const existing = await getReviewByToken(token);
    if (!existing) {
      return NextResponse.json({ error: "This review link isn’t available." }, { status: 404 });
    }

    const result = await withReviewLock(existing.id, async () => {
      const review = (await getReviewById(existing.id)) ?? existing;

      const parsed = validateDecisions(review, (body ?? {}) as Record<string, unknown>);
      if (!parsed.ok) return { status: parsed.status as 400 | 410, body: { error: parsed.error } };

      if (review.submittedAt) {
        if (decisionsMatch(review, parsed.decisions, parsed.reviewerLabel)) {
          const payload = {
            review: toPublicReview(review),
            sync: review.posts.map((p) => ({
              postId: p.postId,
              noteId: p.noteId,
              noteError: p.noteError,
            })),
            idempotent: true,
          };
          assertNoSecrets(payload);
          return { status: 200 as const, body: payload };
        }
        return {
          status: 409 as const,
          body: { error: "Decisions were already sent — ask your manager for a new link." },
        };
      }

      const decided = applyDecisions(review, parsed.decisions, parsed.reviewerLabel, Date.now());
      await saveReview(decided);
      const synced = await writeNotesForReview(decided);
      const payload = {
        review: toPublicReview(synced),
        sync: synced.posts.map((p) => ({
          postId: p.postId,
          noteId: p.noteId,
          noteError: p.noteError,
        })),
      };
      assertNoSecrets(payload);
      return { status: 200 as const, body: payload };
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not send decisions." },
      { status: 500 },
    );
  }
}
