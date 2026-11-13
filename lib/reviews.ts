import { encrypt, decrypt, randomId } from "./crypto";
import { getAppUrl } from "./env";
import { getJson, getStore, setJson } from "./redis";
import type { BufferChannel, BufferPost } from "./buffer";
import {
  REVIEW_REDIS_TTL_SECONDS,
  REVIEW_TTL_MS,
  generatePublicToken,
  hashToken,
  reviewRedisTtl,
  reviewStatus,
  toPublicReview,
  type ManagerReview,
  type Review,
  type ReviewPost,
  type ReviewChannel,
} from "./review-logic";

export {
  generatePublicToken,
  hashToken,
  toPublicReview,
  reviewStatus,
  progressCounts,
  formatNoteText,
  validateCreateInput,
  validateDecisions,
  decisionsMatch,
  applyDecisions,
  assertNoSecrets,
  firstName,
  clampText,
  isLinkUsable,
} from "./review-logic";
export type {
  Review,
  ReviewPost,
  PublicReview,
  ManagerReview,
  Decision,
  DecisionInput,
} from "./review-logic";

function channelSnapshot(ch: BufferChannel): ReviewChannel {
  return {
    id: ch.id,
    name: ch.name,
    displayName: ch.displayName || ch.name,
    service: ch.service,
    avatar: ch.avatar,
    timezone: ch.timezone,
  };
}

function handleFromChannel(ch?: BufferChannel | null, service?: string | null): string | null {
  const name = ch?.name || ch?.displayName;
  if (!name) return null;
  const svc = (service || ch?.service || "").toLowerCase();
  if (svc.includes("twitter") || svc === "x") {
    return name.startsWith("@") ? name : `@${name.replace(/^@/, "")}`;
  }
  return name;
}

export function snapshotPost(post: BufferPost, channels: BufferChannel[]): ReviewPost {
  const channel = channels.find((c) => c.id === post.channelId) ?? null;
  const service = post.channelService || post.channel?.service || channel?.service || null;
  const displayName =
    post.channel?.displayName || channel?.displayName || post.channel?.name || channel?.name || null;
  return {
    postId: post.id,
    text: post.text ?? "",
    dueAt: post.dueAt,
    statusAtSnapshot: post.status || "scheduled",
    channelId: post.channelId,
    service,
    displayName,
    handle: handleFromChannel(channel ?? (post.channel as BufferChannel | null), service),
    avatar: post.channel?.avatar || channel?.avatar || null,
    timezone: post.channel?.timezone || channel?.timezone || null,
    thumbnailUrl: post.thumbnailUrl,
    decision: "pending",
    comment: "",
    noteId: null,
    noteSyncedAt: null,
    noteError: null,
  };
}

export async function createReview(input: {
  accountId: string;
  organizationId: string;
  clientName: string;
  sharedBy: string;
  channels: BufferChannel[];
  channelIds: string[];
  rangeStart: string;
  rangeEnd: string;
  posts: BufferPost[];
}): Promise<{ review: Review; token: string; url: string }> {
  const token = generatePublicToken();
  const tokenHash = hashToken(token);
  const now = Date.now();
  const id = randomId(16);
  const selectedChannels = input.channels.filter(
    (c) => input.channelIds.includes(c.id) || input.posts.some((p) => p.channelId === c.id),
  );
  const review: Review = {
    id,
    tokenHash,
    tokenEncrypted: encrypt(token),
    accountId: input.accountId,
    organizationId: input.organizationId,
    clientName: input.clientName,
    sharedBy: input.sharedBy,
    channelIds: selectedChannels.map((c) => c.id),
    channels: selectedChannels.map(channelSnapshot),
    rangeStart: input.rangeStart,
    rangeEnd: input.rangeEnd,
    createdAt: now,
    expiresAt: now + REVIEW_TTL_MS,
    revokedAt: null,
    submittedAt: null,
    reviewerLabel: null,
    posts: input.posts.map((p) => snapshotPost(p, input.channels)),
  };

  const store = getStore();
  await setJson(`review:${id}`, review, { ex: REVIEW_REDIS_TTL_SECONDS });
  await setJson(`reviewByToken:${tokenHash}`, id, { ex: REVIEW_REDIS_TTL_SECONDS });
  await store.zadd(`user:${input.accountId}:reviews`, now, id);
  await store.expire(`user:${input.accountId}:reviews`, REVIEW_REDIS_TTL_SECONDS);

  return { review, token, url: publicUrl(token) };
}

export function publicUrl(token: string): string {
  return `${getAppUrl()}/r/${token}`;
}

export async function getReviewById(id: string): Promise<Review | null> {
  return getJson<Review>(`review:${id}`);
}

export async function getReviewByToken(token: string): Promise<Review | null> {
  const id = await getJson<string>(`reviewByToken:${hashToken(token)}`);
  if (!id) return null;
  return getReviewById(String(id));
}

export async function saveReview(review: Review): Promise<void> {
  const ttl = reviewRedisTtl(review);
  await setJson(`review:${review.id}`, review, { ex: ttl });
  await setJson(`reviewByToken:${review.tokenHash}`, review.id, { ex: ttl });
}

export async function listReviews(accountId: string): Promise<Review[]> {
  const ids = await getStore().zrevrange(`user:${accountId}:reviews`, 0, 49);
  const reviews: Review[] = [];
  for (const id of ids) {
    const review = await getReviewById(String(id));
    if (review && review.accountId === accountId) reviews.push(review);
  }
  return reviews;
}

export function managerView(review: Review): ManagerReview {
  let url = "";
  try {
    url = publicUrl(decrypt(review.tokenEncrypted));
  } catch {
    url = "";
  }
  return {
    ...toPublicReview(review),
    url,
    organizationId: review.organizationId,
    channelIds: review.channelIds,
    channels: review.channels,
    posts: review.posts,
  };
}

export async function withReviewLock<T>(reviewId: string, fn: () => Promise<T>): Promise<T> {
  const store = getStore();
  const key = `lock:review:${reviewId}`;
  for (let i = 0; i < 20; i++) {
    const got = await store.set(key, "1", { nx: true, ex: 20 });
    if (got) {
      try {
        return await fn();
      } finally {
        await store.del(key);
      }
    }
    await new Promise((r) => setTimeout(r, 100 + Math.random() * 80));
  }
  throw new Error("This review is busy. Please try again in a moment.");
}
