import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusView } from "@/components/status-view";
import { reviewFixture } from "@/lib/review-fixture";
import type { ManagerReview } from "@/lib/review-logic";

export const dynamic = "force-dynamic";

/** Local-only preview for screenshots. 404s on Vercel — not a production backdoor. */
export default function PreviewStatusPage() {
  if (process.env.VERCEL) notFound();
  const fx = reviewFixture("submitted");
  const review: ManagerReview = {
    ...fx,
    url: "https://reviewlink-commit.vercel.app/r/k3Vq9xT2mLp8RzW4nH7aBc",
    organizationId: "org",
    channelIds: ["ch1"],
    channels: [{ id: "ch1", name: "CasaLekki", displayName: "Casa Lekki", service: "twitter", avatar: null, timezone: "Africa/Lagos" }],
    posts: fx.posts.map((p) => ({ ...p, channelId: "ch1", statusAtSnapshot: "scheduled", noteId: "n", noteSyncedAt: Date.now(), noteError: null })),
  };
  return (
    <AppShell name="Teni Adeyemi" orgName="Teni Social">
      <StatusView initial={review} />
    </AppShell>
  );
}
