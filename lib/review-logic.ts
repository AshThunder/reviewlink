import { createHash, randomBytes } from "node:crypto";

export const MAX_CLIENT_NAME = 80;
export const MAX_REVIEWER = 80;
export const MAX_COMMENT = 2000;
export const MAX_POSTS_PER_LINK = 50;
export const REVIEW_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const REVIEW_REDIS_TTL_SECONDS = 32 * 24 * 60 * 60;
export const DECISIONS_RATE_LIMIT = 10;
export const DECISIONS_RATE_WINDOW = 15 * 60;

export type Decision = "pending" | "approved" | "changes_requested";

export type ReviewPost = {
  postId: string;
  text: string;
  dueAt: string | null;
  statusAtSnapshot: string;
  channelId: string;
  service: string | null;
  displayName: string | null;
  handle: string | null;
  avatar: string | null;
  timezone: string | null;
  thumbnailUrl: string | null;
  decision: Decision;
  comment: string;
  noteId: string | null;
  noteSyncedAt: number | null;
  noteError: string | null;
};

export type ReviewChannel = {
  id: string;
  name: string;
  displayName: string;
  service: string;
  avatar: string | null;
  timezone: string | null;
};

export type Review = {
  id: string;
  tokenHash: string;
  tokenEncrypted: string;
  accountId: string;
  organizationId: string;
  clientName: string;
  sharedBy: string;
  channelIds: string[];
  channels: ReviewChannel[];
  rangeStart: string;
  rangeEnd: string;
  createdAt: number;
  expiresAt: number;
  revokedAt: number | null;
  submittedAt: number | null;
  reviewerLabel: string | null;
  posts: ReviewPost[];
};

export type PublicReview = {
  id: string;
  clientName: string;
  sharedBy: string;
  rangeStart: string;
  rangeEnd: string;
  createdAt: number;
  expiresAt: number;
  submittedAt: number | null;
  reviewerLabel: string | null;
  status: "open" | "submitted" | "expired" | "revoked";
  posts: Array<{
    postId: string;
    text: string;
    dueAt: string | null;
    service: string | null;
    displayName: string | null;
    handle: string | null;
    avatar: string | null;
    timezone: string | null;
    thumbnailUrl: string | null;
    decision: Decision;
    comment: string;
  }>;
};

export type ManagerReview = Omit<PublicReview, "posts"> & {
  url: string;
  organizationId: string;
  channelIds: string[];
  channels: ReviewChannel[];
  posts: ReviewPost[];
};

export type DecisionInput = {
  postId: string;
  decision: Decision;
  comment?: string;
};

export function generatePublicToken(): string {
  return randomBytes(16).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function firstName(name: string | null | undefined, fallback = "your manager"): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return fallback;
  return trimmed.split(/\s+/)[0] ?? fallback;
}

export function clampText(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

export function reviewStatus(review: Pick<Review, "expiresAt" | "revokedAt" | "submittedAt">): PublicReview["status"] {
  if (review.revokedAt) return "revoked";
  if (Date.now() > review.expiresAt) return "expired";
  if (review.submittedAt) return "submitted";
  return "open";
}

export function isLinkUsable(review: Pick<Review, "expiresAt" | "revokedAt">): boolean {
  return !review.revokedAt && Date.now() <= review.expiresAt;
}

export function progressCounts(posts: { decision: Decision }[]): {
  approved: number;
  changes: number;
  pending: number;
  total: number;
  reviewed: number;
} {
  let approved = 0;
  let changes = 0;
  let pending = 0;
  for (const p of posts) {
    if (p.decision === "approved") approved += 1;
    else if (p.decision === "changes_requested") changes += 1;
    else pending += 1;
  }
  return {
    approved,
    changes,
    pending,
    total: posts.length,
    reviewed: approved + changes,
  };
}

export function formatNoteText(input: {
  decision: Decision;
  name: string;
  comment?: string;
}): string {
  const name = clampText(input.name, MAX_REVIEWER) || "A reviewer";
  if (input.decision === "approved") {
    return `✅ Approved by ${name} via ReviewLink`;
  }
  if (input.decision === "changes_requested") {
    const comment = clampText(input.comment ?? "", MAX_COMMENT);
    return comment
      ? `✏️ Changes requested by ${name}: ${comment} (via ReviewLink)`
      : `✏️ Changes requested by ${name} (via ReviewLink)`;
  }
  return `ReviewLink · Note from ${name}`;
}

export function validateCreateInput(input: {
  clientName?: unknown;
  postIds?: unknown;
  channelIds?: unknown;
  rangeStart?: unknown;
  rangeEnd?: unknown;
}): { ok: true; clientName: string; postIds: string[]; channelIds: string[]; rangeStart?: string; rangeEnd?: string } | { ok: false; error: string } {
  const clientName = clampText(input.clientName, MAX_CLIENT_NAME);
  if (!clientName) return { ok: false, error: "Please enter a client or campaign name." };
  if (!Array.isArray(input.postIds) || input.postIds.length === 0) {
    return { ok: false, error: "Select at least one scheduled post." };
  }
  if (input.postIds.length > MAX_POSTS_PER_LINK) {
    return { ok: false, error: `A review link can include at most ${MAX_POSTS_PER_LINK} posts.` };
  }
  const postIds = input.postIds.map((id) => String(id));
  if (new Set(postIds).size !== postIds.length) {
    return { ok: false, error: "Duplicate posts were selected." };
  }
  const channelIds = Array.isArray(input.channelIds)
    ? input.channelIds.map((id) => String(id)).filter(Boolean)
    : [];
  return {
    ok: true,
    clientName,
    postIds,
    channelIds,
    rangeStart: input.rangeStart ? String(input.rangeStart) : undefined,
    rangeEnd: input.rangeEnd ? String(input.rangeEnd) : undefined,
  };
}

export function validateDecisions(
  review: Review,
  body: { reviewerLabel?: unknown; decisions?: unknown },
):
  | { ok: true; reviewerLabel: string; decisions: DecisionInput[] }
  | { ok: false; error: string; status: number } {
  const status = reviewStatus(review);
  if (status === "expired") {
    return { ok: false, error: "This review link has expired. Ask your manager for a new one.", status: 410 };
  }
  if (status === "revoked") {
    return { ok: false, error: "This review link was revoked. Ask your manager for a new one.", status: 410 };
  }

  const reviewerLabel = clampText(body.reviewerLabel, MAX_REVIEWER);
  if (!reviewerLabel) {
    return { ok: false, error: "Please enter your name so your manager knows who reviewed.", status: 400 };
  }
  if (!Array.isArray(body.decisions)) {
    return { ok: false, error: "Decisions are required.", status: 400 };
  }

  const allowed = new Set(review.posts.map((p) => p.postId));
  const seen = new Set<string>();
  const decisions: DecisionInput[] = [];

  for (const raw of body.decisions as DecisionInput[]) {
    const postId = String(raw?.postId ?? "");
    if (!postId || !allowed.has(postId)) {
      return { ok: false, error: "A decision referred to a post that is not in this review.", status: 400 };
    }
    if (seen.has(postId)) {
      return { ok: false, error: "Each post can only have one decision.", status: 400 };
    }
    seen.add(postId);
    const decision = raw?.decision;
    if (decision !== "approved" && decision !== "changes_requested") {
      return { ok: false, error: "Each post must be approved or marked for changes.", status: 400 };
    }
    const comment = clampText(raw?.comment ?? "", MAX_COMMENT);
    if (decision === "changes_requested" && !comment) {
      return { ok: false, error: "Please leave a short comment on every post that needs changes.", status: 400 };
    }
    decisions.push({ postId, decision, comment });
  }

  if (decisions.length !== review.posts.length) {
    return { ok: false, error: "Please review every post before sending.", status: 400 };
  }

  return { ok: true, reviewerLabel, decisions };
}

export function decisionsMatch(
  review: Review,
  decisions: DecisionInput[],
  reviewerLabel: string,
): boolean {
  if (clampText(review.reviewerLabel ?? "", MAX_REVIEWER) !== reviewerLabel) return false;
  const byId = new Map(review.posts.map((p) => [p.postId, p]));
  for (const d of decisions) {
    const existing = byId.get(d.postId);
    if (!existing) return false;
    if (existing.decision !== d.decision) return false;
    if (clampText(existing.comment, MAX_COMMENT) !== clampText(d.comment ?? "", MAX_COMMENT)) {
      return false;
    }
  }
  return true;
}

export function applyDecisions(review: Review, decisions: DecisionInput[], reviewerLabel: string, at: number): Review {
  const byId = new Map(decisions.map((d) => [d.postId, d]));
  return {
    ...review,
    reviewerLabel,
    submittedAt: review.submittedAt ?? at,
    posts: review.posts.map((p) => {
      const d = byId.get(p.postId);
      if (!d) return p;
      return {
        ...p,
        decision: d.decision,
        comment: clampText(d.comment ?? "", MAX_COMMENT),
      };
    }),
  };
}

const SENSITIVE_KEYS = [
  "accountId",
  "organizationId",
  "tokenHash",
  "tokenEncrypted",
  "token",
  "accessToken",
  "refreshToken",
  "access_token",
  "refresh_token",
];

export function toPublicReview(review: Review): PublicReview {
  return {
    id: review.id,
    clientName: review.clientName,
    sharedBy: firstName(review.sharedBy),
    rangeStart: review.rangeStart,
    rangeEnd: review.rangeEnd,
    createdAt: review.createdAt,
    expiresAt: review.expiresAt,
    submittedAt: review.submittedAt,
    reviewerLabel: review.reviewerLabel,
    status: reviewStatus(review),
    posts: review.posts.map((p) => ({
      postId: p.postId,
      text: p.text,
      dueAt: p.dueAt,
      service: p.service,
      displayName: p.displayName,
      handle: p.handle,
      avatar: p.avatar,
      timezone: p.timezone,
      thumbnailUrl: p.thumbnailUrl,
      decision: p.decision,
      comment: p.comment,
    })),
  };
}

export function assertNoSecrets(payload: unknown): void {
  const json = JSON.stringify(payload);
  for (const key of SENSITIVE_KEYS) {
    if (new RegExp(`"${key}"\\s*:`).test(json)) {
      throw new Error(`Refusing to expose ${key} in a public payload`);
    }
  }
}

export function reviewRedisTtl(review: Pick<Review, "expiresAt">): number {
  const end = review.expiresAt + 2 * 24 * 60 * 60 * 1000;
  return Math.max(60, Math.ceil((end - Date.now()) / 1000));
}
