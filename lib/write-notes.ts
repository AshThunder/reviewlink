import {
  createCollaborationNote,
  findExistingReviewNote,
} from "./buffer";
import { formatNoteText, type Review } from "./review-logic";
import { saveReview } from "./reviews";

export async function writeNotesForReview(review: Review): Promise<Review> {
  const name = review.reviewerLabel || "A reviewer";
  const next: Review = {
    ...review,
    posts: review.posts.map((p) => ({ ...p })),
  };

  for (const post of next.posts) {
    if (post.decision === "pending") continue;
    if (post.noteId) continue;
    const text = formatNoteText({
      decision: post.decision,
      name,
      comment: post.comment,
    });
    const existing = await findExistingReviewNote(review.accountId, post.postId, text);
    if (existing) {
      post.noteId = existing.id;
      post.noteSyncedAt = existing.createdAt ? Date.parse(existing.createdAt) || Date.now() : Date.now();
      post.noteError = null;
      continue;
    }
    const result = await createCollaborationNote(review.accountId, post.postId, text);
    if (result.ok) {
      post.noteId = result.noteId;
      post.noteSyncedAt = result.createdAt ? Date.parse(result.createdAt) || Date.now() : Date.now();
      post.noteError = null;
    } else {
      // One more look in case it saved despite a timeout.
      const again = await findExistingReviewNote(review.accountId, post.postId, text);
      if (again) {
        post.noteId = again.id;
        post.noteSyncedAt = again.createdAt ? Date.parse(again.createdAt) || Date.now() : Date.now();
        post.noteError = null;
      } else {
        post.noteError =
          result.code === "INSUFFICIENT_SCOPE"
            ? "Buffer needs Notes permission. Reconnect ReviewLink and Allow notes:write."
            : result.error;
      }
    }
  }

  await saveReview(next);
  return next;
}
