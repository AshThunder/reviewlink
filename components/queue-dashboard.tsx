"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BufferAccount, BufferChannel, BufferPost } from "@/lib/buffer";
import { formatDueAt, weekLabel } from "@/lib/dates";
import { progressCounts, type ManagerReview } from "@/lib/review-logic";
import { EmptyState, ErrorState } from "./empty-state";
import { Filters } from "./filters";
import { ServiceIcon, serviceLabel } from "./service-icon";
import { CopyButton, whatsappShareUrl } from "./copy-button";
import Link from "next/link";

export function QueueDashboard({
  account,
  channels,
  posts,
  reviews,
  selectedChannelId,
  rangeStart,
  rangeEnd,
  loadError,
  pausedWarning,
}: {
  account: BufferAccount;
  channels: BufferChannel[];
  posts: BufferPost[];
  reviews: ManagerReview[];
  selectedChannelId?: string;
  rangeStart: string;
  rangeEnd: string;
  loadError?: string;
  pausedWarning?: string;
}) {
  const tz = account.timezone || "Africa/Lagos";
  const label = weekLabel(rangeStart, rangeEnd, tz);
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(posts.map((p) => [p.id, true])),
  );
  const selectedIds = useMemo(
    () => posts.filter((p) => selected[p.id]).map((p) => p.id),
    [posts, selected],
  );
  const [open, setOpen] = useState(false);

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
          disabled={selectedIds.length === 0}
          title={selectedIds.length === 0 ? "Select at least one scheduled post" : "Create a private review link"}
          onClick={() => setOpen(true)}
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
            <div className="flex items-center gap-3 text-[13px] font-medium text-muted">
              {posts.length > 0 ? (
                <button
                  type="button"
                  className="btn-ghost text-accent"
                  onClick={() => {
                    const allOn = selectedIds.length === posts.length;
                    setSelected(Object.fromEntries(posts.map((p) => [p.id, !allOn])));
                  }}
                >
                  {selectedIds.length === posts.length ? "Deselect all" : "Select all"}
                </button>
              ) : null}
              <span>
                {selectedIds.length}/{posts.length} selected · {label}
              </span>
            </div>
          </div>

          {loadError ? (
            <div className="p-4">
              <ErrorState title="We couldn’t load your Buffer queue" body={loadError} retryHref="/app" />
            </div>
          ) : channels.length === 0 ? (
            <EmptyState
              title="No channels connected"
              body="Connect at least one social channel in Buffer — Instagram, X, or LinkedIn — then refresh this page."
              action={
                <a className="btn btn-primary" href="https://publish.buffer.com" target="_blank" rel="noopener noreferrer">
                  Open Buffer
                </a>
              }
            />
          ) : posts.length === 0 ? (
            <EmptyState
              title="No scheduled posts in this range"
              body={`Schedule at least a few posts in Buffer for ${label}, then refresh. Those posts become the review your client will see.`}
              action={
                <a className="btn btn-secondary" href="https://publish.buffer.com" target="_blank" rel="noopener noreferrer">
                  Schedule posts in Buffer
                </a>
              }
            />
          ) : (
            <div>
              {posts.map((post) => {
                const service = post.channelService || post.channel?.service;
                const when = post.dueAt ? formatDueAt(post.dueAt, post.channel?.timezone || tz) : "Unscheduled";
                const checked = Boolean(selected[post.id]);
                return (
                  <label
                    key={post.id}
                    className={`post-check grid cursor-pointer grid-cols-[24px_72px_1fr] items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0 transition-colors hover:bg-bg/80 ${checked ? "" : "opacity-70"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setSelected((s) => ({ ...s, [post.id]: e.target.checked }))}
                      aria-label={`Include post scheduled ${when}`}
                    />
                    {post.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.thumbnailUrl} alt="" className="h-14 w-[72px] rounded-[8px] bg-bg object-cover" />
                    ) : (
                      <div className="grid h-14 w-[72px] place-items-center rounded-[8px] bg-bg text-muted" aria-hidden="true">
                        <ServiceIcon service={service} size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
                        <ServiceIcon service={service} size={18} />
                        {when}
                      </div>
                      <p className="line-clamp-2 m-0 mt-0.5 text-[13.5px] leading-snug">
                        {post.text || <span className="italic text-muted">No caption</span>}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </section>

        <aside>
          <section className="panel" aria-labelledby="links-h">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <h2 id="links-h" className="m-0 text-[15px] font-semibold">
                Review links
              </h2>
              <span className="text-[13px] font-medium text-muted">
                {reviews.length} {reviews.length === 1 ? "link" : "links"}
              </span>
            </div>
            {reviews.length === 0 ? (
              <EmptyState
                title="None yet"
                body="When you create a review link, it will show progress here — approved, pending, and changes requested."
              />
            ) : (
              reviews.map((r) => <LinkCard key={r.id} review={r} />)
            )}
          </section>
          <p className="m-0 mt-3 px-1 text-[13px] leading-relaxed text-muted">
            Links expire in 30 days. Clients never see your Buffer login. Decisions write back as Notes on each post.
          </p>
        </aside>
      </div>

      {open ? (
        <CreateLinkDialog
          posts={posts.filter((p) => selectedIds.includes(p.id))}
          postIds={selectedIds}
          channels={channels}
          selectedChannelId={selectedChannelId}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          defaultName={
            channels.find((c) => c.id === selectedChannelId)?.displayName ||
            channels[0]?.displayName ||
            "Scheduled posts"
          }
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function LinkCard({ review }: { review: ManagerReview }) {
  const counts = progressCounts(review.posts);
  const chip =
    review.status === "revoked"
      ? { cls: "chip-pending", label: "Revoked" }
      : review.status === "expired"
        ? { cls: "chip-pending", label: "Expired" }
        : review.status === "submitted"
          ? { cls: counts.changes ? "chip-changes" : "chip-ok", label: counts.changes ? "Needs changes" : "Complete" }
          : { cls: "chip-pending", label: "Waiting" };
  const summary = review.status === "submitted"
    ? `${counts.approved} of ${counts.total} approved${counts.changes ? `, ${counts.changes} need changes` : ""}`
    : `${counts.total} posts · waiting for review`;

  return (
    <Link href={`/app/reviews/${review.id}`} className="block border-b border-border px-4 py-3.5 text-inherit no-underline last:border-b-0 hover:bg-bg">
      <div className="flex items-center justify-between gap-2">
        <h3 className="m-0 text-[14px] font-semibold">
          {review.clientName}
        </h3>
        <span className={`chip ${chip.cls}`}>{chip.label}</span>
      </div>
      <p className="m-0 mt-0.5 text-[12px] text-muted">{weekLabel(review.rangeStart, review.rangeEnd)}</p>
      {review.status === "submitted" ? (
        <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-bg" role="img" aria-label={summary}>
          <i className="block h-full bg-accent" style={{ width: `${(counts.approved / counts.total) * 100}%` }} />
          <i className="block h-full bg-warning" style={{ width: `${(counts.changes / counts.total) * 100}%` }} />
        </div>
      ) : null}
      <div className="mt-2 flex justify-between text-[12px] font-semibold">
        <span>{summary}</span>
        <span className="font-medium text-muted">Open →</span>
      </div>
    </Link>
  );
}

function CreateLinkDialog({
  posts,
  postIds,
  channels,
  selectedChannelId,
  rangeStart,
  rangeEnd,
  defaultName,
  onClose,
}: {
  posts: BufferPost[];
  postIds: string[];
  channels: BufferChannel[];
  selectedChannelId?: string;
  rangeStart: string;
  rangeEnd: string;
  defaultName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [clientName, setClientName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; url: string } | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          postIds,
          channelIds: selectedChannelId ? [selectedChannelId] : channels.map((c) => c.id),
          rangeStart,
          rangeEnd,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; id?: string; url?: string };
      if (!res.ok || !json.id || !json.url) {
        setError(json.error || "Could not create the review link.");
        return;
      }
      setCreated({ id: json.id, url: json.url });
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-labelledby="create-title"
        aria-modal="true"
        className="dialog"
        onKeyDown={(e) => {
          if (e.key === "Escape" && !busy) onClose();
        }}
      >
        {!created ? (
          <>
            <h2 id="create-title" className="m-0 text-[20px] font-bold tracking-tight">
              Create a review link
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              {posts.length} {posts.length === 1 ? "post" : "posts"} from {weekLabel(rangeStart, rangeEnd)} will be snapshotted onto a private, 30-day link. Your client won’t need a Buffer account.
            </p>
            <div className="mt-4">
              <label htmlFor="clientName" className="field-label">
                Client or campaign name
              </label>
              <input
                id="clientName"
                className="name-field"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                maxLength={80}
                required
                autoFocus
              />
            </div>
            {error ? (
              <p role="alert" className="mt-3 text-[13px] font-medium text-danger">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={create}
                disabled={busy || !clientName.trim()}
              >
                {busy ? "Creating…" : "Create link"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="create-title" className="m-0 text-[20px] font-bold tracking-tight">
              Link ready
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Send this to your client on WhatsApp or email. It’s unguessable, and expires in 30 days.
            </p>
            <div className="url-box mt-4" title={created.url}>
              {created.url}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton value={created.url} className="btn btn-primary" />
              <a
                className="btn btn-secondary"
                href={whatsappShareUrl(created.url, clientName)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share on WhatsApp
              </a>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Done
              </button>
              <Link href={`/app/reviews/${created.id}`} className="btn btn-primary">
                Open status
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
