import { ReviewExperience } from "@/components/review-experience";
import { Brand } from "@/components/brand";
import { getReviewByToken } from "@/lib/reviews";
import { toPublicReview, assertNoSecrets } from "@/lib/review-logic";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const review = await getReviewByToken(token);
  if (!review) return { title: "Review link", robots: { index: false, follow: false } };
  return {
    title: `${review.clientName} — Review`,
    description: `Review scheduled posts shared by ${review.sharedBy}. No Buffer login needed.`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const review = await getReviewByToken(token);
  if (!review) {
    return (
      <div className="review-shell flex justify-center px-4 py-10">
        <main className="review-col px-6 py-16 text-center">
          <div className="mb-6 flex justify-center">
            <Brand href="/" size="sm" />
          </div>
          <h1 className="m-0 text-[22px] font-bold tracking-tight">This review link isn’t available</h1>
          <p className="mx-auto mt-3 max-w-[32ch] text-[15px] leading-relaxed text-muted">
            It may have expired, been revoked, or not been created yet. Ask your manager for a new link.
          </p>
        </main>
      </div>
    );
  }
  const publicReview = toPublicReview(review);
  assertNoSecrets(publicReview);
  return <ReviewExperience token={token} initial={publicReview} />;
}
