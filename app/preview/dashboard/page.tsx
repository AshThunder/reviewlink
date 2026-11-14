import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { QueueDashboard } from "@/components/queue-dashboard";
import { reviewFixture } from "@/lib/review-fixture";
import type { BufferChannel, BufferPost } from "@/lib/buffer";
import type { ManagerReview } from "@/lib/review-logic";

export const dynamic = "force-dynamic";

/** Local-only preview for screenshots. 404s on Vercel — not a production backdoor. */
export default function PreviewDashboardPage() {
  if (process.env.VERCEL) notFound();
  const channel: BufferChannel = {
    id: "ch1", name: "CasaLekki", displayName: "Casa Lekki", service: "twitter", avatar: null,
    timezone: "Africa/Lagos", isQueuePaused: false, isDisconnected: false, isLocked: false,
  };
  const fx = reviewFixture("submitted");
  const posts: BufferPost[] = fx.posts.map((p) => ({
    id: p.postId, text: p.text, dueAt: p.dueAt, status: "scheduled", channelId: "ch1", channelService: "twitter",
    channel: { id: "ch1", displayName: "Casa Lekki", name: "CasaLekki", service: "twitter", avatar: null, timezone: "Africa/Lagos" },
    thumbnailUrl: null,
  }));
  const base = {
    url: "https://reviewlink-commit.vercel.app/r/preview-link",
    organizationId: "org", channelIds: ["ch1"],
    channels: [{ id: "ch1", name: "CasaLekki", displayName: "Casa Lekki", service: "twitter", avatar: null, timezone: "Africa/Lagos" }],
  };
  const done: ManagerReview = {
    ...fx, ...base,
    posts: fx.posts.map((p) => ({ ...p, channelId: "ch1", statusAtSnapshot: "scheduled", noteId: "n", noteSyncedAt: Date.now(), noteError: null })),
  };
  const waiting: ManagerReview = {
    ...done, id: "w", clientName: "Casa Lekki — weekend", status: "open", submittedAt: null, reviewerLabel: null,
    posts: done.posts.slice(0, 3).map((p) => ({ ...p, decision: "pending" as const, comment: "", noteId: null })),
  };
  return (
    <AppShell name="Teni Adeyemi" orgName="Teni Social">
      <QueueDashboard
        account={{ id: "a", email: null, name: "Teni Adeyemi", timezone: "Africa/Lagos", organizations: [{ id: "org", name: "Teni Social" }] } as never}
        channels={[channel]}
        posts={posts}
        reviews={[waiting, done]}
        rangeStart="2026-11-15T23:00:00.000Z"
        rangeEnd="2026-11-22T22:59:59.999Z"
        initialCreated={{ id: "w", url: "https://reviewlink-commit.vercel.app/r/k3Vq9xT2mLp8RzW4nH7aBc", clientName: "Casa Lekki — weekend" }}
      />
    </AppShell>
  );
}
