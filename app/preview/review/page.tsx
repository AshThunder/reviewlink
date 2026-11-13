import { notFound } from "next/navigation";
import { ReviewExperience } from "@/components/review-experience";
import { reviewFixture } from "@/lib/review-fixture";

export const dynamic = "force-dynamic";

/** Local-only preview for screenshots. 404s on Vercel — not a production backdoor. */
export default function PreviewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  if (process.env.VERCEL) notFound();
  return searchParams.then(({ mode }) => {
    const allowed = ["open", "mid", "submitted", "expired"] as const;
    const picked = allowed.includes(mode as (typeof allowed)[number])
      ? (mode as (typeof allowed)[number])
      : "mid";
    return <ReviewExperience initial={reviewFixture(picked)} />;
  });
}
