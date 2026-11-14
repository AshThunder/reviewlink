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
  initialCreated = null,
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
  initialCreated?: { id: string; url: string; clientName: string } | null;
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

  const [justCreated, setJustCreated] = useState<{ id: string; url: string; clientName: string } | null>(initialCreated);

  const defaultName =
    channels.find((c) => c.id === selectedChannelId)?.displayName || channels[0]?.displayName || "";

  return (
    <>
      <div className="mb-6">
        <h1 className="m-0 text-[26px] leading-tight tracking-tight sm:text-[32px]">Get this week approved</h1>
        <p className="m-0 mt-1.5 text-[15px] text-muted">Three steps: choose posts, create a link, send it to your client.</p>
      </div>

      <h2 className="dash-step"><span>1</span>Choose posts</h2>
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
      <section className="panel" aria-labelledby="posts-h">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border px-4 py-3">
            <h2 id="posts-h" className="m-0 text-[15px] font-medium">
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
                {selectedIds.length} of {posts.length} selected
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
              title="No scheduled posts this week"
              body={`Schedule some posts in Buffer for ${label}, then refresh this page.`}
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
                const ch = post.channel || channels.find((c) => c.id === post.channelId);
                return (
                  <label
                    key={post.id}
                    className={`post-check grid cursor-pointer grid-cols-[22px_40px_1fr] items-start gap-3 border-b border-border px-4 py-3.5 last:border-b-0 transition-colors hover:bg-bg/80 ${checked ? "" : "opacity-70"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setSelected((s) => ({ ...s, [post.id]: e.target.checked }))}
                      aria-label={`Include post scheduled ${when}`}
                    />
                    <span className="relative flex-none">
                      {ch?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ch.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-text text-[12px] font-bold text-white" aria-hidden="true">
                          {(ch?.displayName || ch?.name || "B").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span className="absolute -bottom-1 -right-1 rounded-full bg-surface p-[2px]"><ServiceIcon service={service} size={16} /></span>
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
                        <span className="text-text">{ch?.displayName || ch?.name || serviceLabel(service)}</span>
                        <span aria-hidden="true">·</span>
                        {when}
                      </div>
                      <p className="line-clamp-3 m-0 mt-1 text-[14.5px] leading-snug">
                        {post.text || <span className="italic text-muted">No caption</span>}
                      </p>
                      {post.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.thumbnailUrl} alt="" className="mt-2 h-20 w-full max-w-[220px] rounded-[10px] object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </section>

      <h2 className="dash-step"><span>2</span>Name the client and create the link</h2>
      <InlineCreate
        key={justCreated?.id ?? "new"}
        postIds={selectedIds}
        channels={channels}
        selectedChannelId={selectedChannelId}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        defaultName={defaultName}
        disabled={posts.length === 0}
        onCreated={(c) => {
          setJustCreated(c);
          window.setTimeout(() => document.getElementById("step-3")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        }}
      />

      <h2 id="step-3" className="dash-step"><span>3</span>Send it to your client</h2>
      {justCreated ? (
        <section className="success-panel anim-fade-up mb-5" aria-live="polite">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-accent text-white" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8.2 L6.4 11.5 L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="m-0 text-[17px] font-bold tracking-tight">Review link ready for {justCreated.clientName}</h2>
              <p className="m-0 mt-0.5 text-[14px] text-muted">Send it on WhatsApp or email. Private, no login, expires in 30 days.</p>
            </div>
            <button type="button" className="btn-ghost -mr-1 rounded-[8px] px-2 text-[20px] leading-none text-muted" aria-label="Dismiss" onClick={() => setJustCreated(null)}>×</button>
          </div>
          <div className="url-box mt-3" title={justCreated.url}>{justCreated.url}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
            <CopyButton value={justCreated.url} className="btn btn-primary" />
            <a className="btn btn-secondary" href={whatsappShareUrl(justCreated.url, justCreated.clientName)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <Link href={`/app/reviews/${justCreated.id}`} className="btn btn-ghost col-span-2 sm:col-span-1">Track status →</Link>
          </div>
        </section>
      ) : (
      <div className="panel mb-2 px-4 py-4 text-[15px] text-muted">Your link will appear here after step 2, with Copy and WhatsApp buttons.</div>
      )}

      <div className="mt-10">
      <section className="panel mb-6" aria-labelledby="links-h">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <h2 id="links-h" className="m-0 flex items-center gap-2 text-[16px] font-bold">
            Your review links
            <span className="chip chip-accent">{reviews.length}</span>
          </h2>
          
        </div>
        {reviews.length === 0 ? (
          <EmptyState
            title="No review links yet"
            body="Links you create show up here with their status: waiting, approved, or needs changes."
          />
        ) : (
          <div className="links-grid">
            {reviews.map((r) => <LinkCard key={r.id} review={r} />)}
          </div>
        )}
      </section>
      </div>
    </>
  );
}

function InlineCreate({
  postIds,
  channels,
  selectedChannelId,
  rangeStart,
  rangeEnd,
  defaultName,
  disabled,
  onCreated,
}: {
  postIds: string[];
  channels: BufferChannel[];
  selectedChannelId?: string;
  rangeStart: string;
  rangeEnd: string;
  defaultName: string;
  disabled: boolean;
  onCreated: (c: { id: string; url: string; clientName: string }) => void;
}) {
  const router = useRouter();
  const [clientName, setClientName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      onCreated({ id: json.id, url: json.url, clientName: clientName.trim() });
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  const n = postIds.length;
  return (
    <div className="panel p-4">
      <label htmlFor="clientName" className="field-label">Client or campaign name</label>
      <div className="mt-1 flex flex-col gap-3 sm:flex-row">
        <input
          id="clientName"
          className="name-field flex-1"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          maxLength={80}
          placeholder="e.g. Casa Lekki"
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={create}
          disabled={busy || disabled || n === 0 || !clientName.trim()}
        >
          {busy ? "Creating…" : `Create link for ${n} ${n === 1 ? "post" : "posts"}`}
        </button>
      </div>
      <p className="m-0 mt-2 text-[13px] text-muted">
        {n === 0 ? "Select at least one post in step 1." : "The link is private, needs no login, and expires in 30 days."}
      </p>
      {error ? <p role="alert" className="m-0 mt-2 text-[14px] font-medium text-danger">{error}</p> : null}
    </div>
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
  onCreated,
}: {
  posts: BufferPost[];
  postIds: string[];
  channels: BufferChannel[];
  selectedChannelId?: string;
  rangeStart: string;
  rangeEnd: string;
  defaultName: string;
  onClose: () => void;
  onCreated: (c: { id: string; url: string; clientName: string }) => void;
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
      onCreated({ id: json.id, url: json.url, clientName: clientName.trim() });
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
