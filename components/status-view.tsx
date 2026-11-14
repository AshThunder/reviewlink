"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDueAt, weekLabel } from "@/lib/dates";
import { progressCounts, type ManagerReview } from "@/lib/review-logic";
import { CopyButton, whatsappShareUrl } from "./copy-button";
import { ServiceIcon } from "./service-icon";
import { EmptyState } from "./empty-state";

export function StatusView({ initial }: { initial: ManagerReview }) {
  const router = useRouter();
  const [review, setReview] = useState(initial);
  const [busy, setBusy] = useState<"revoke" | "resync" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const counts = progressCounts(review.posts);
  const synced = review.posts.filter((p) => p.noteId).length;
  const failed = review.posts.filter((p) => p.noteError && !p.noteId).length;
  const tz = review.channels[0]?.timezone || "Africa/Lagos";

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  }

  async function revoke() {
    if (!confirm("Revoke this link? Your client won’t be able to open it.")) return;
    setBusy("revoke");
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${review.id}/revoke`, { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as { error?: string; review?: ManagerReview };
      if (!res.ok || !json.review) {
        setError(json.error || "Could not revoke the link.");
        return;
      }
      setReview(json.review);
      flash("Link revoked");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function resync() {
    setBusy("resync");
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${review.id}/resync`, { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as { error?: string; review?: ManagerReview };
      if (!res.ok || !json.review) {
        setError(json.error || "Could not resync notes.");
        return;
      }
      setReview(json.review);
      flash("Tried Buffer again");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const headline =
    review.status === "submitted"
      ? `${counts.approved} of ${counts.total} approved`
      : review.status === "revoked"
        ? "This link was revoked"
        : review.status === "expired"
          ? "This link has expired"
          : "Waiting for your client";

  return (
    <>
      <Link href="/app" className="back-link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3 L5 8 L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to dashboard
      </Link>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-[24px] leading-tight tracking-tight sm:text-[28px]">
            {review.clientName} · {weekLabel(review.rangeStart, review.rangeEnd)}
          </h1>
          <p className="status-summary">
            {review.status === "revoked"
              ? "This link was revoked. Your client can no longer open it."
              : review.status === "expired"
                ? "This link has expired."
                : review.submittedAt
                  ? `${counts.approved} approved${counts.changes ? `, ${counts.changes} need${counts.changes === 1 ? "s" : ""} changes` : ""}. ${synced === review.posts.length ? "Notes added in Buffer." : failed ? `${failed} note${failed === 1 ? "" : "s"} couldn’t reach Buffer yet — tap Resync.` : "Adding notes in Buffer…"}`
                  : "Waiting for your client. Send them the link below."}
          </p>
          <p className="m-0 mt-1.5 text-[15px] text-muted">
            {review.submittedAt && review.reviewerLabel
              ? `Reviewed by ${review.reviewerLabel} · ${formatDueAt(new Date(review.submittedAt).toISOString(), tz)}`
              : "Share the private link, then watch decisions land as Buffer Notes."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {review.url && review.status !== "revoked" ? (
            <>
              <CopyButton value={review.url} />
              <a
                className="btn btn-secondary"
                href={whatsappShareUrl(review.url, review.clientName)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </>
          ) : null}
          {review.status === "open" ? (
            <button type="button" className="btn-danger-ghost text-[14px] font-semibold text-danger" onClick={revoke} disabled={busy !== null}>
              {busy === "revoke" ? "Revoking…" : "Revoke"}
            </button>
          ) : null}
        </div>
      </div>

      <section className="panel mb-4 px-5 py-4">
        {review.url ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="url-box min-w-[240px] flex-1" title={review.url}>
              {review.url}
            </div>
            <CopyButton value={review.url} label="Copy" className="btn btn-secondary" />
            {review.status === "submitted" && failed === 0 ? (
              <span className="chip chip-ok">All decisions synced</span>
            ) : review.status === "submitted" && failed > 0 ? (
              <span className="chip chip-changes">{failed} notes failed</span>
            ) : (
              <span className={`chip ${review.status === "open" ? "chip-pending" : "chip-pending"}`}>
                {review.status === "open" ? "Waiting" : review.status}
              </span>
            )}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
          <div>
            <div className="text-[22px] font-bold tracking-tight">
              {headline}
              {review.status === "submitted" && counts.changes > 0 ? (
                <span className="ml-2 text-[14px] font-medium text-muted">{counts.changes} need changes</span>
              ) : null}
            </div>
            {review.status === "submitted" ? (
              <div className="mt-2 flex h-1.5 max-w-[420px] overflow-hidden rounded-full bg-bg" role="img" aria-label={headline}>
                <i className="block h-full bg-accent" style={{ width: `${(counts.approved / counts.total) * 100}%` }} />
                <i className="block h-full bg-warning" style={{ width: `${(counts.changes / counts.total) * 100}%` }} />
              </div>
            ) : null}
          </div>
          <p className="m-0 max-w-[280px] text-right text-[12.5px] leading-relaxed text-muted">
            Expires {new Date(review.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · 30-day private link.
            <br />
            In Buffer, open the post and click the <strong className="text-text">Notes icon, top right</strong>.
          </p>
        </div>
      </section>

      {error ? (
        <p role="alert" className="mb-3 text-[14px] font-medium text-danger">
          {error}
        </p>
      ) : null}

      {failed > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#fcd34d] bg-[#fffbeb] px-4 py-3 text-[14px] text-[#92400e]">
          <p className="m-0">
            {failed} {failed === 1 ? "note" : "notes"} couldn’t be written to Buffer. Decisions are saved here — retry when you’re ready.
          </p>
          <button type="button" className="btn btn-secondary" onClick={resync} disabled={busy !== null}>
            {busy === "resync" ? "Retrying…" : "Resync failed notes"}
          </button>
        </div>
      ) : null}

      <section className="panel" aria-labelledby="decisions-h">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <h2 id="decisions-h" className="m-0 text-[15px] font-semibold">
            Decisions
          </h2>
          <span className="text-[13px] font-medium text-muted">
            {review.posts.length} posts{review.submittedAt ? ` · ${synced} notes written` : ""}
          </span>
        </div>
        {review.posts.length === 0 ? (
          <EmptyState title="No posts" body="This link has no snapshotted posts." />
        ) : (
          review.posts.map((post) => (
            <article key={post.postId} className="status-row">
              {post.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.thumbnailUrl} alt="" className="h-14 w-[72px] rounded-[8px] object-cover" />
              ) : (
                <div className="grid h-14 w-[72px] place-items-center rounded-[8px] bg-bg">
                  <ServiceIcon service={post.service} size={20} />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
                  <ServiceIcon service={post.service} size={18} />
                  {post.dueAt ? formatDueAt(post.dueAt, post.timezone || tz) : "Unscheduled"}
                </div>
                <p className="line-clamp-2 m-0 mt-0.5 text-[13.5px] leading-snug">{post.text}</p>
                {post.comment && post.decision === "changes_requested" ? (
                  <div className="comment-quote">“{post.comment}”</div>
                ) : null}
              </div>
              <div className="sync flex flex-col items-end gap-1.5 text-right">
                <span
                  className={`chip ${
                    post.decision === "approved"
                      ? "chip-ok"
                      : post.decision === "changes_requested"
                        ? "chip-changes"
                        : "chip-pending"
                  }`}
                >
                  {post.decision === "approved"
                    ? "Approved"
                    : post.decision === "changes_requested"
                      ? "Changes requested"
                      : "Pending"}
                </span>
                {post.noteId ? (
                  <div className="flex items-start gap-1.5 text-[12px] font-semibold text-accent">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4.5 8.2 L7 10.6 L11.7 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <span>
                      Synced to Buffer as a note
                      {post.noteSyncedAt ? (
                        <time className="mt-0.5 block text-[11px] font-medium text-muted" dateTime={new Date(post.noteSyncedAt).toISOString()}>
                          {formatDueAt(new Date(post.noteSyncedAt).toISOString(), tz)}
                        </time>
                      ) : null}
                    </span>
                  </div>
                ) : post.noteError ? (
                  <p className="m-0 text-[12px] font-medium text-danger">{post.noteError}</p>
                ) : review.submittedAt ? (
                  <p className="m-0 text-[12px] text-muted">Waiting to sync</p>
                ) : null}
              </div>
            </article>
          ))
        )}
      </section>
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </>
  );
}
