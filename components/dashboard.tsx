import type { BufferAccount, BufferChannel, BufferPost } from "@/lib/buffer";
import { formatDueAt, weekLabel, DEFAULT_WEEK } from "@/lib/dates";
import { EmptyState, ErrorState } from "./empty-state";
import { Filters } from "./filters";
import { ServiceIcon, serviceLabel } from "./service-icon";

function PostRow({ post, timezone }: { post: BufferPost; timezone?: string | null }) {
  const tz = post.channel?.timezone || timezone;
  const when = post.dueAt ? formatDueAt(post.dueAt, tz) : "Unscheduled";
  const service = post.channelService || post.channel?.service;
  return (
    <article className="grid grid-cols-[72px_1fr] items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0 transition-colors hover:bg-bg/80">
      {post.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.thumbnailUrl}
          alt=""
          className="h-14 w-[72px] rounded-[8px] bg-bg object-cover"
        />
      ) : (
        <div
          className="grid h-14 w-[72px] place-items-center rounded-[8px] bg-bg text-muted"
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 14l2.5-3 2 2.5 1.5-1.5 3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
          <ServiceIcon service={service} size={18} />
          {when}
        </div>
        <p className="line-clamp-2 m-0 mt-0.5 text-[13.5px] leading-snug">
          {post.text || <span className="text-muted italic">No caption</span>}
        </p>
      </div>
    </article>
  );
}

export function Dashboard({
  account,
  channels,
  posts,
  selectedChannelId,
  rangeStart,
  rangeEnd,
  loadError,
  pausedWarning,
}: {
  account: BufferAccount;
  channels: BufferChannel[];
  posts: BufferPost[];
  selectedChannelId?: string;
  rangeStart: string;
  rangeEnd: string;
  loadError?: string;
  pausedWarning?: string;
}) {
  const tz = account.timezone || "Africa/Lagos";
  const label = weekLabel(rangeStart, rangeEnd, tz);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-[28px] font-bold leading-tight tracking-tight">This week’s queue</h1>
          <p className="m-0 mt-1.5 text-[15px] text-muted">
            Pick a channel and a date range, then share a private review link with your client.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={posts.length === 0}
          title={
            posts.length === 0
              ? "Schedule some posts in Buffer first"
              : "Creating review links is next — your queue is live"
          }
          aria-disabled={posts.length === 0}
        >
          Create review link
        </button>
      </div>

      {pausedWarning ? (
        <div
          role="status"
          className="mb-4 rounded-[12px] border border-[#fcd34d] bg-[#fffbeb] px-4 py-3 text-[14px] text-[#92400e]"
        >
          {pausedWarning}
        </div>
      ) : null}

      {channels.length > 0 ? (
        <Filters channels={channels} selectedChannelId={selectedChannelId} />
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <section className="panel" aria-labelledby="posts-h">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <h2 id="posts-h" className="m-0 text-[15px] font-semibold">
              Scheduled posts
            </h2>
            <span className="text-[13px] font-medium text-muted">
              {posts.length} {posts.length === 1 ? "post" : "posts"} · {label}
            </span>
          </div>

          {loadError ? (
            <div className="p-4">
              <ErrorState
                title="We couldn’t load your Buffer queue"
                body={loadError}
                retryHref="/app"
              />
            </div>
          ) : channels.length === 0 ? (
            <EmptyState
              title="No channels connected"
              body="Connect at least one social channel in Buffer — Instagram, X, or LinkedIn — then refresh this page. The Free plan allows up to three."
              action={
                <a
                  className="btn btn-primary"
                  href="https://publish.buffer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Buffer
                </a>
              }
            />
          ) : posts.length === 0 ? (
            <EmptyState
              title="No scheduled posts in this range"
              body={`Schedule at least a few posts in Buffer for ${label}, then refresh. Those posts become the review your client will see.`}
              action={
                <a
                  className="btn btn-secondary"
                  href="https://publish.buffer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Schedule posts in Buffer
                </a>
              }
            />
          ) : (
            <div>
              {posts.map((post) => (
                <PostRow key={post.id} post={post} timezone={tz} />
              ))}
            </div>
          )}
        </section>

        <aside>
          <section className="panel" aria-labelledby="links-h">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <h2 id="links-h" className="m-0 text-[15px] font-semibold">
                Review links
              </h2>
              <span className="text-[13px] font-medium text-muted">0 links</span>
            </div>
            <EmptyState
              title="None yet"
              body="When you create a review link, it will show progress here — approved, pending, and changes requested."
            />
          </section>
          <p className="m-0 mt-3 px-1 text-[13px] leading-relaxed text-muted">
            Links expire in 30 days. Clients never see your Buffer login. Decisions write back as Notes on each post.
          </p>
          {channels.length > 0 ? (
            <ul className="mt-4 space-y-2 px-1 text-[13px] text-muted">
              {channels.map((ch) => (
                <li key={ch.id} className="flex items-center gap-2">
                  {ch.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ch.avatar} alt="" className="h-5 w-5 rounded-[6px] object-cover" />
                  ) : (
                    <ServiceIcon service={ch.service} size={18} />
                  )}
                  <span className="text-text font-medium">
                    {ch.displayName || ch.name}
                  </span>
                  <span>· {serviceLabel(ch.service)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </aside>
      </div>
    </>
  );
}
