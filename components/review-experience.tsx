"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [nameError, setNameError] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  function requireName(): boolean {
    if (name.trim()) return true;
    setNameError(true);
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameRef.current?.focus({ preventScroll: true });
    return false;
  }

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
    if (!requireName()) return;
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
    if (!requireName()) return;
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
            comment: items[p.postId]!.decision === "changes_requested" ? items[p.postId]!.comment : "",
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
  const nameMissing = !name.trim();

  return (
    <div className="review-shell">
      <div className="review-col">
        <header className="px-4 pb-1 pt-4">
          <div className="review-from">
            <Brand href="/" size="sm" />
            <span className="lock-chip" title="Private, unguessable link">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="3" y="7" width="10" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              Private link
            </span>
          </div>
          <p className="m-0 mt-4 text-[13px] font-medium text-muted">
            <strong className="font-semibold text-text">{initial.sharedBy}</strong> shared {tallies.total} scheduled{" "}
            {tallies.total === 1 ? "post" : "posts"} for your review
          </p>
          <h1 className="m-0 mt-1 text-[24px] font-bold leading-tight tracking-tight">{initial.clientName}</h1>
          <p className="m-0 mt-0.5 text-[14px] text-muted">{week} · no Buffer account needed</p>
        </header>

        <section
          className={`step-card mx-4 mt-4 ${nameError ? "is-error" : nameMissing ? "is-todo" : "is-done"}`}
          aria-labelledby="step1"
        >
          <div className="flex items-center gap-2">
            <span className="step-num" aria-hidden="true">{nameMissing ? "1" : "✓"}</span>
            <h2 id="step1" className="m-0 text-[15px] font-bold">
              Step 1 · Tell us who’s reviewing
            </h2>
          </div>
          <label htmlFor="reviewer" className="sr-only">Your name</label>
          <input
            ref={nameRef}
            id="reviewer"
            className="name-field mt-3"
            value={name}
            onChange={(e) => {
              updateName(e.target.value);
              if (e.target.value.trim()) setNameError(false);
            }}
            placeholder="Your first name, e.g. Ngozi"
            maxLength={80}
            autoComplete="given-name"
            aria-invalid={nameError}
            aria-describedby="reviewer-help"
          />
          <p id="reviewer-help" className={`m-0 mt-2 text-[13px] leading-snug ${nameError ? "font-semibold text-danger" : "text-muted"}`}>
            {nameError
              ? "Add your name first, so " + initial.sharedBy + " knows who approved."
              : `Your name is attached to each note ${initial.sharedBy} sees in Buffer.`}
          </p>
        </section>

        <div className="mx-4 mt-5">
          <div className="flex items-center gap-2">
            <span className="step-num step-num-plain" aria-hidden="true">2</span>
            <h2 className="m-0 text-[15px] font-bold">Step 2 · Review each post</h2>
          </div>
          <ul className="legend mt-2.5" aria-label="What the colours mean">
            <li><i className="dot dot-ok" />Approved</li>
            <li><i className="dot dot-ch" />Needs changes</li>
            <li><i className="dot" />Not reviewed</li>
          </ul>
        </div>

        <div className="week-strip px-4 pb-3 pt-3" aria-label="Review progress by day">
          {initial.posts.map((p) => {
            const d = items[p.postId]?.decision;
            const day = p.dueAt
              ? new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric" }).format(new Date(p.dueAt))
              : "—";
            const [num, wd] = splitDay(day);
            return (
              <a
                href={`#post-${p.postId}`}
                key={p.postId}
                className={`day ${d === "approved" ? "ok" : d === "changes_requested" ? "ch" : ""}`}
              >
                <b>{num}</b>
                {wd}
              </a>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 px-4">
          {initial.posts.map((post, i) => {
            const d = items[post.postId] ?? { decision: "pending" as Decision, comment: "" };
            const state = d.decision === "approved" ? "is-approved" : d.decision === "changes_requested" ? "is-changes" : "";
            return (
              <article id={`post-${post.postId}`} key={post.postId} className={`review-card ${state}`}>
                <div className="card-status">
                  <span className="text-[12px] font-semibold text-muted">
                    Post {i + 1} of {initial.posts.length}
                  </span>
                  {d.decision === "approved" ? (
                    <span className="badge badge-ok anim-pop">✓ Approved</span>
                  ) : d.decision === "changes_requested" ? (
                    <span className="badge badge-ch anim-pop">✎ Needs changes</span>
                  ) : (
                    <span className="badge">Not reviewed</span>
                  )}
                </div>
                <PostPreview post={post} />
                <div className="px-3.5 pb-3.5">
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="act act-approve"
                      aria-pressed={d.decision === "approved"}
                      onClick={() => setDecision(post.postId, "approved")}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8.2 L6.4 11.5 L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {d.decision === "approved" ? "Approved" : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="act act-changes"
                      aria-pressed={d.decision === "changes_requested"}
                      onClick={() => setDecision(post.postId, "changes_requested")}
                    >
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M10.8 2.7 13.3 5.2 5.6 12.9 2.5 13.5 3.1 10.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                      {d.decision === "changes_requested" ? "Changes" : "Request changes"}
                    </button>
                  </div>
                  {d.decision === "changes_requested" ? (
                    <div className="comment-box mt-3 block">
                      <label htmlFor={`c-${post.postId}`}>What should {initial.sharedBy} change?</label>
                      <textarea
                        id={`c-${post.postId}`}
                        value={d.comment}
                        onChange={(e) => setComment(post.postId, e.target.value)}
                        placeholder="A short note is enough — it lands on the post in Buffer."
                        maxLength={2000}
                        autoFocus={!d.comment}
                      />
                      {!d.comment.trim() ? (
                        <p className="m-0 mt-1 text-[12px] font-medium text-warning">A comment is required for changes.</p>
                      ) : null}
                    </div>
                  ) : null}
                  {d.decision !== "pending" ? (
                    <button type="button" className="undo-link" onClick={() => setDecision(post.postId, d.decision)}>
                      Undo
                    </button>
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
          {tallies.pending > 0 && tallies.reviewed > 0 ? (
            <button type="button" className="btn btn-ghost mb-1 w-full" onClick={approveRemaining}>
              Approve all remaining ({tallies.pending})
            </button>
          ) : null}
          <button type="button" className="btn btn-primary w-full" disabled={!canSend} onClick={send}>
            {sending
              ? "Sending to Buffer…"
              : nameMissing
                ? "Add your name to send"
                : tallies.pending > 0
                  ? `Review ${tallies.pending} more to send`
                  : changesMissingComment
                    ? "Add a comment on each change"
                    : `Send decisions to ${initial.sharedBy}`}
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
      <main className="review-col relative flex flex-col items-center overflow-hidden px-6 py-16 text-center">
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.08}s`, transform: `rotate(${i * 29}deg)` }} />
          ))}
        </div>
        <div
          className="thanks-check grid h-16 w-16 place-items-center rounded-[18px] bg-accent text-white"
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
        <div className="mt-6 flex gap-2">
          <span className="badge badge-ok">✓ {approved} approved</span>
          {changes ? <span className="badge badge-ch">✎ {changes} need changes</span> : null}
        </div>
        <span className="stamp anim-stamp mt-8">Sent to Buffer</span>
        {syncErrors.length > 0 ? (
          <p role="status" className="mt-4 max-w-[36ch] text-[13px] text-warning">
            Your decisions were saved, but {syncErrors.length === 1 ? "one note" : "some notes"} couldn’t reach Buffer. Your manager can retry from the status page.
          </p>
        ) : null}
      </main>
    </div>
  );
}
