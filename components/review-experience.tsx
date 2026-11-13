"use client";

import { useEffect, useMemo, useState } from "react";
import { Brand } from "./brand";
import { PostPreview } from "./post-preview";
import type { Decision, PublicReview } from "@/lib/review-logic";
import { progressCounts } from "@/lib/review-logic";
import { weekLabel } from "@/lib/dates";

const NAME_KEY = "reviewlink:reviewerName";

type LocalDecision = { decision: Decision; comment: string };

export function ReviewExperience({
  token,
  initial,
}: {
  token?: string;
  initial: PublicReview;
}) {
  const [name, setName] = useState(initial.reviewerLabel || "");
  const [items, setItems] = useState<Record<string, LocalDecision>>(() => {
    const map: Record<string, LocalDecision> = {};
    for (const p of initial.posts) {
      map[p.postId] = { decision: p.decision, comment: p.comment || "" };
    }
    return map;
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(initial.status === "submitted");
  const [syncErrors, setSyncErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initial.reviewerLabel) return;
    try {
      const saved = localStorage.getItem(NAME_KEY);
      if (saved) setName(saved);
    } catch {
      /* private mode */
    }
  }, [initial.reviewerLabel]);

  function updateName(value: string) {
    setName(value);
    try {
      localStorage.setItem(NAME_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function setDecision(postId: string, decision: Decision) {
    setItems((prev) => {
      const current = prev[postId] ?? { decision: "pending", comment: "" };
      const next: Decision = current.decision === decision ? "pending" : decision;
      return { ...prev, [postId]: { ...current, decision: next } };
    });
  }

  function setComment(postId: string, comment: string) {
    setItems((prev) => ({
      ...prev,
      [postId]: { decision: prev[postId]?.decision ?? "pending", comment },
    }));
  }

  function approveRemaining() {
    setItems((prev) => {
      const next = { ...prev };
      for (const p of initial.posts) {
        const cur = next[p.postId];
        if (!cur || cur.decision === "pending") {
          next[p.postId] = { decision: "approved", comment: cur?.comment ?? "" };
        }
      }
      return next;
    });
  }

  const tallies = useMemo(
    () => progressCounts(initial.posts.map((p) => ({ decision: items[p.postId]?.decision ?? "pending" }))),
    [initial.posts, items],
  );

  const changesMissingComment = initial.posts.some((p) => {
    const d = items[p.postId];
    return d?.decision === "changes_requested" && !d.comment.trim();
  });
  const canSend =
    tallies.reviewed === tallies.total &&
    tallies.total > 0 &&
    name.trim().length > 0 &&
    !changesMissingComment &&
    !sending &&
    !submitted &&
    initial.status === "open";

  async function send() {
    if (!token || !canSend) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/reviews/${encodeURIComponent(token)}/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerLabel: name.trim(),
          decisions: initial.posts.map((p) => ({
            postId: p.postId,
            decision: items[p.postId]!.decision,
            comment: items[p.postId]!.comment,
          })),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        review?: PublicReview;
        sync?: { postId: string; noteId: string | null; noteError: string | null }[];
      };
      if (!res.ok) {
        setError(json.error || "Could not send your decisions. Please try again.");
        return;
      }
      const errs = (json.sync ?? []).filter((s) => s.noteError && !s.noteId).map((s) => s.noteError!);
      setSyncErrors(errs);
      setSubmitted(true);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (initial.status === "expired" || initial.status === "revoked") {
    return (
      <ClosedState
        title={initial.status === "revoked" ? "This review link was revoked" : "This review link has expired"}
        body="Ask your manager for a new one. Your previous decisions, if any, were already saved."
      />
    );
  }

  if (submitted || initial.status === "submitted") {
    return (
      <ThanksState
        name={name || initial.reviewerLabel}
        sharedBy={initial.sharedBy}
        approved={tallies.approved || progressCounts(initial.posts).approved}
        changes={tallies.changes || progressCounts(initial.posts).changes}
        syncErrors={syncErrors}
      />
    );
  }

  const week = weekLabel(initial.rangeStart, initial.rangeEnd);

  return (
    <div className="review-shell">
      <div className="review-col">
        <header className="px-4 pb-2 pt-4">
          <div className="review-from">
            <p className="m-0 text-[12px] font-medium text-muted">
              Shared by <strong className="font-semibold text-text">{initial.sharedBy}</strong>
            </p>
            <span className="lock-chip" title="Private, unguessable link">
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
                <rect x="1" y="5" width="8" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
                <path d="M3 5V3.4a2 2 0 1 1 4 0V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Private
            </span>
          </div>
          <div className="mt-3">
            <h1 className="m-0 text-[22px] font-bold leading-tight tracking-tight">{initial.clientName}</h1>
            <p className="m-0 mt-1 text-[13px] text-muted">
              {week} · {initial.posts.length} {initial.posts.length === 1 ? "post" : "posts"} to review
            </p>
          </div>
          <div className="mt-3">
            <label htmlFor="reviewer" className="field-label">
              Your name
            </label>
            <input
              id="reviewer"
              className="name-field"
              value={name}
              onChange={(e) => updateName(e.target.value)}
              placeholder="So your manager knows who approved"
              autoComplete="name"
              maxLength={80}
            />
          </div>
        </header>

        <div className="week-strip px-4 pb-3.5 pt-1" aria-label="Review progress by day">
          {initial.posts.map((p) => {
            const d = items[p.postId]?.decision ?? "pending";
            const day = p.dueAt
              ? new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric" }).format(new Date(p.dueAt))
              : "—";
            const [num, wd] = splitDay(day);
            return (
              <div key={p.postId} className={`day ${d === "approved" ? "ok" : d === "changes_requested" ? "ch" : ""}`}>
                <b>{num}</b>
                {wd}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 px-4">
          {initial.posts.map((post) => {
            const d = items[post.postId] ?? { decision: "pending" as Decision, comment: "" };
            return (
              <article
                key={post.postId}
                className={`review-card ${d.decision === "approved" ? "is-approved" : ""} ${d.decision === "changes_requested" ? "is-changes" : ""}`}
              >
                <PostPreview post={post} />
                <div className="px-3.5 pb-3.5">
                  {d.decision === "approved" ? (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="stamp anim-stamp">Approved</span>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setDecision(post.postId, "approved")}
                      >
                        Undo
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="act act-approve"
                        aria-pressed={false}
                        onClick={() => setDecision(post.postId, "approved")}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 8.2 L6.4 11.5 L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Approve
                      </button>
                      <button
                        type="button"
                        className="act act-changes"
                        aria-pressed={d.decision === "changes_requested"}
                        onClick={() => setDecision(post.postId, "changes_requested")}
                      >
                        Request changes
                      </button>
                    </div>
                  )}
                  {d.decision === "changes_requested" ? (
                    <div className="comment-box mt-3 block">
                      <label htmlFor={`c-${post.postId}`}>What should {initial.sharedBy} change?</label>
                      <textarea
                        id={`c-${post.postId}`}
                        value={d.comment}
                        onChange={(e) => setComment(post.postId, e.target.value)}
                        placeholder="A short note is enough — they’ll see it in Buffer."
                        maxLength={2000}
                      />
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        <div className="sticky-bar">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="m-0 text-[13px] font-semibold">
              {tallies.reviewed} of {tallies.total} reviewed
            </p>
            <span className="text-[12px] font-medium text-muted">
              {tallies.approved} approved · {tallies.changes} need changes
            </span>
          </div>
          <div className="seg mb-2" aria-hidden="true">
            {initial.posts.map((p) => {
              const d = items[p.postId]?.decision;
              return <i key={p.postId} className={d === "approved" ? "ok" : d === "changes_requested" ? "ch" : ""} />;
            })}
          </div>
          {error ? (
            <p role="alert" className="m-0 mb-2 text-[13px] font-medium text-danger">
              {error}
            </p>
          ) : null}
          {tallies.pending > 0 ? (
            <button type="button" className="btn btn-ghost mb-1 w-full" onClick={approveRemaining}>
              Approve all remaining ({tallies.pending})
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={!canSend}
            onClick={send}
          >
            {sending ? "Sending…" : `Send decisions to ${initial.sharedBy}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function splitDay(label: string): [string, string] {
  const parts = label.replace(",", "").split(" ");
  if (parts.length >= 2) return [parts[1]!, parts[0]!];
  return [label, ""];
}

function ClosedState({ title, body }: { title: string; body: string }) {
  return (
    <div className="review-shell flex justify-center px-4 py-10">
      <main className="review-col flex flex-col items-center px-6 py-16 text-center">
        <Brand href="/" size="sm" />
        <h1 className="mt-8 text-[22px] font-bold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-muted">{body}</p>
      </main>
    </div>
  );
}

function ThanksState({
  name,
  sharedBy,
  approved,
  changes,
  syncErrors,
}: {
  name?: string | null;
  sharedBy: string;
  approved: number;
  changes: number;
  syncErrors: string[];
}) {
  return (
    <div className="review-shell flex justify-center px-4 py-10">
      <main className="review-col flex flex-col items-center px-6 py-16 text-center">
        <div
          className="grid h-14 w-14 place-items-center rounded-[14px] bg-accent text-white"
          aria-hidden="true"
        >
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.2 L6.4 11.5 L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-5 text-[28px] font-bold tracking-tight">Sent to {sharedBy}.</h1>
        <p className="mt-3 max-w-[30ch] text-[15px] leading-relaxed text-muted">
          {approved} approved{changes ? `, ${changes} need changes` : ""}.{" "}
          {name ? `Thank you, ${name}.` : "Thank you."} They’ll see every decision as a note on the post in Buffer.
        </p>
        {syncErrors.length > 0 ? (
          <p role="status" className="mt-4 max-w-[36ch] text-[13px] text-warning">
            Your decisions were saved, but {syncErrors.length === 1 ? "one note" : "some notes"} couldn’t reach Buffer. Your manager can retry from the status page.
          </p>
        ) : null}
      </main>
    </div>
  );
}
