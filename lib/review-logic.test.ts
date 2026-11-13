import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyDecisions,
  assertNoSecrets,
  clampText,
  decisionsMatch,
  firstName,
  formatNoteText,
  generatePublicToken,
  hashToken,
  progressCounts,
  reviewStatus,
  toPublicReview,
  validateCreateInput,
  validateDecisions,
  type Review,
  type ReviewPost,
} from "./review-logic.ts";

function post(id: string, extras: Partial<ReviewPost> = {}): ReviewPost {
  return {
    postId: id,
    text: "Hello",
    dueAt: "2026-11-16T08:00:00.000Z",
    statusAtSnapshot: "scheduled",
    channelId: "ch1",
    service: "twitter",
    displayName: "Chris",
    handle: "@ChrisGold__",
    avatar: null,
    timezone: "Africa/Lagos",
    thumbnailUrl: null,
    decision: "pending",
    comment: "",
    noteId: null,
    noteSyncedAt: null,
    noteError: null,
    ...extras,
  };
}

function review(overrides: Partial<Review> = {}): Review {
  const now = Date.now();
  return {
    id: "rev1",
    tokenHash: "abc",
    tokenEncrypted: "enc",
    accountId: "acct-secret",
    organizationId: "org-secret",
    clientName: "Casa Lekki",
    sharedBy: "Teniola Adeyemi",
    channelIds: ["ch1"],
    channels: [],
    rangeStart: "2026-11-16T00:00:00.000Z",
    rangeEnd: "2026-11-22T23:59:59.000Z",
    createdAt: now,
    expiresAt: now + 30 * 86400000,
    revokedAt: null,
    submittedAt: null,
    reviewerLabel: null,
    posts: [post("p1"), post("p2")],
    ...overrides,
  };
}

test("generatePublicToken is 128-bit base64url", () => {
  const token = generatePublicToken();
  assert.match(token, /^[A-Za-z0-9_-]+$/);
  // 16 bytes -> 22 chars without padding
  assert.equal(Buffer.from(token, "base64url").length, 16);
  assert.notEqual(generatePublicToken(), token);
});

test("hashToken is stable sha256 hex and does not contain the raw token", () => {
  const token = generatePublicToken();
  const hash = hashToken(token);
  assert.equal(hash.length, 64);
  assert.match(hash, /^[0-9a-f]+$/);
  assert.equal(hashToken(token), hash);
  assert.equal(hash.includes(token), false);
});

test("formatNoteText matches the product wording", () => {
  assert.equal(formatNoteText({ decision: "approved", name: "Ngozi" }), "✅ Approved by Ngozi via ReviewLink");
  assert.equal(
    formatNoteText({ decision: "changes_requested", name: "Ngozi", comment: "Drop the price" }),
    "✏️ Changes requested by Ngozi: Drop the price (via ReviewLink)",
  );
});

test("validateCreateInput rejects empty names and empty post lists", () => {
  assert.equal(validateCreateInput({ clientName: "  ", postIds: ["a"] }).ok, false);
  assert.equal(validateCreateInput({ clientName: "Casa", postIds: [] }).ok, false);
  const ok = validateCreateInput({ clientName: "Casa", postIds: ["a", "b"], channelIds: ["c"] });
  assert.equal(ok.ok, true);
});

test("validateDecisions requires every post, a name, and comments on changes", () => {
  const r = review();
  const missingName = validateDecisions(r, {
    reviewerLabel: "",
    decisions: [
      { postId: "p1", decision: "approved" },
      { postId: "p2", decision: "approved" },
    ],
  });
  assert.equal(missingName.ok, false);

  const missingComment = validateDecisions(r, {
    reviewerLabel: "Ngozi",
    decisions: [
      { postId: "p1", decision: "approved" },
      { postId: "p2", decision: "changes_requested", comment: "" },
    ],
  });
  assert.equal(missingComment.ok, false);

  const ok = validateDecisions(r, {
    reviewerLabel: "Ngozi",
    decisions: [
      { postId: "p1", decision: "approved" },
      { postId: "p2", decision: "changes_requested", comment: "Please tweak this" },
    ],
  });
  assert.equal(ok.ok, true);
});

test("expired and revoked links are rejected", () => {
  const expired = validateDecisions(review({ expiresAt: Date.now() - 1000 }), {
    reviewerLabel: "Ngozi",
    decisions: [
      { postId: "p1", decision: "approved" },
      { postId: "p2", decision: "approved" },
    ],
  });
  assert.equal(expired.ok, false);
  if (!expired.ok) assert.equal(expired.status, 410);

  const revoked = validateDecisions(review({ revokedAt: Date.now() }), {
    reviewerLabel: "Ngozi",
    decisions: [
      { postId: "p1", decision: "approved" },
      { postId: "p2", decision: "approved" },
    ],
  });
  assert.equal(revoked.ok, false);
});

test("applyDecisions + decisionsMatch is idempotent", () => {
  const r = review();
  const decisions = [
    { postId: "p1", decision: "approved" as const, comment: "" },
    { postId: "p2", decision: "changes_requested" as const, comment: "Edit the price" },
  ];
  const next = applyDecisions(r, decisions, "Ngozi", Date.now());
  assert.ok(next.submittedAt);
  assert.equal(next.posts[0]!.decision, "approved");
  assert.equal(decisionsMatch(next, decisions, "Ngozi"), true);
  assert.equal(decisionsMatch(next, decisions, "Someone else"), false);
});

test("toPublicReview never exposes tokens or account ids", () => {
  const pub = toPublicReview(review());
  const json = JSON.stringify(pub);
  assert.equal(json.includes("acct-secret"), false);
  assert.equal(json.includes("org-secret"), false);
  assert.equal(json.includes("tokenEncrypted"), false);
  assert.equal(json.includes("tokenHash"), false);
  assert.equal(json.includes("accessToken"), false);
  assert.equal(pub.sharedBy, "Teniola");
  assertNoSecrets(pub);
  assert.throws(() => assertNoSecrets({ accountId: "x" }));
});

test("progressCounts and reviewStatus", () => {
  const p = progressCounts([
    { decision: "approved" },
    { decision: "approved" },
    { decision: "changes_requested" },
    { decision: "pending" },
  ]);
  assert.deepEqual(p, { approved: 2, changes: 1, pending: 1, total: 4, reviewed: 3 });
  assert.equal(reviewStatus(review()), "open");
  assert.equal(reviewStatus(review({ submittedAt: Date.now() })), "submitted");
});

test("clampText and firstName", () => {
  assert.equal(clampText("  hi\u0000  ", 10), "hi");
  assert.equal(firstName("Teniola Adeyemi"), "Teniola");
  assert.equal(firstName("  "), "your manager");
});
