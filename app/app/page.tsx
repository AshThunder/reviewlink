import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { QueueDashboard } from "@/components/queue-dashboard";
import { ErrorState } from "@/components/empty-state";
import {
  BufferApiError,
  getAccount,
  getChannels,
  getScheduledPosts,
  usableChannels,
} from "@/lib/buffer";
import { DEFAULT_WEEK } from "@/lib/dates";
import { getSession } from "@/lib/session";
import { listReviews, managerView } from "@/lib/reviews";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; start?: string; end?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/?error=auth");

  const params = await searchParams;
  const rangeStart = params.start || DEFAULT_WEEK.startUtc;
  const rangeEnd = params.end || DEFAULT_WEEK.endUtc;
  const selectedChannelId = params.channel || undefined;

  try {
    const account = await getAccount(session.accountId);
    const orgId = session.organizationId || account.organizations[0]?.id;

    if (!orgId) {
      return (
        <AppShell name={account.name} email={account.email}>
          <ErrorState
            title="No Buffer organization found"
            body="Your Buffer account didn’t return an organization. Open Buffer, make sure the account is set up, then Connect Buffer again."
            retryHref="/api/auth/login?consent=1"
          />
        </AppShell>
      );
    }

    const allChannels = await getChannels(session.accountId, orgId);
    const channels = usableChannels(allChannels);
    const skipped = allChannels.length - channels.length;
    const selected = selectedChannelId
      ? channels.filter((c) => c.id === selectedChannelId)
      : channels;

    let posts: Awaited<ReturnType<typeof getScheduledPosts>> = {
      posts: [],
      usedDueAtFilter: true,
    };
    let loadError: string | undefined;
    if (selected.length > 0) {
      try {
        posts = await getScheduledPosts({
          accountId: session.accountId,
          organizationId: orgId,
          channelIds: selected.map((c) => c.id),
          start: rangeStart,
          end: rangeEnd,
        });
      } catch (err) {
        loadError = err instanceof Error ? err.message : "Failed to load scheduled posts.";
      }
    }

    const paused = selected.filter((c) => c.isQueuePaused);
    const pausedWarning =
      paused.length > 0
        ? `${paused.map((c) => c.displayName || c.name).join(", ")} ${
            paused.length === 1 ? "has" : "have"
          } a paused queue in Buffer. Scheduled times may not go out until the queue is resumed.`
        : skipped > 0
          ? `${skipped} disconnected or locked ${skipped === 1 ? "channel was" : "channels were"} hidden from the picker.`
          : undefined;

    return (
      <AppShell
        name={account.name}
        email={account.email}
        orgName={account.organizations[0]?.name}
      >
        <QueueDashboard
          account={account}
          channels={channels}
          posts={posts.posts}
          reviews={(await listReviews(session.accountId)).map(managerView)}
          selectedChannelId={selectedChannelId}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          loadError={loadError}
          pausedWarning={pausedWarning}
        />
      </AppShell>
    );
  } catch (err) {
    if (err instanceof BufferApiError && err.status === 401) {
      redirect("/api/auth/login?consent=1");
    }
    const body = err instanceof Error ? err.message : "Unexpected error.";
    return (
      <AppShell>
        <ErrorState
          title="We couldn’t load your Buffer account"
          body={body}
          retryHref="/app"
        />
      </AppShell>
    );
  }
}
