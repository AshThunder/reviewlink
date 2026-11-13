import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusView } from "@/components/status-view";
import { getAccount, listCollaborationNotes } from "@/lib/buffer";
import { getReviewById, managerView, saveReview } from "@/lib/reviews";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ReviewStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/?error=auth");
  const { id } = await params;
  const review = await getReviewById(id);
  if (!review || review.accountId !== session.accountId) notFound();

  if (review.submittedAt) {
    let dirty = false;
    for (const post of review.posts) {
      if (post.noteId) continue;
      try {
        const notes = await listCollaborationNotes(session.accountId, post.postId);
        const match = notes.find((n) => n.text.includes("via ReviewLink"));
        if (match) {
          post.noteId = match.id;
          post.noteSyncedAt = match.createdAt ? Date.parse(match.createdAt) || Date.now() : Date.now();
          post.noteError = null;
          dirty = true;
        }
      } catch {
        /* keep Redis state */
      }
    }
    if (dirty) await saveReview(review);
  }

  let name: string | null = null;
  let email: string | null = null;
  let org: string | null = null;
  try {
    const account = await getAccount(session.accountId);
    name = account.name;
    email = account.email;
    org = account.organizations[0]?.name ?? null;
  } catch {
    /* shell still renders */
  }

  return (
    <AppShell name={name} email={email} orgName={org}>
      <StatusView initial={managerView(review)} />
    </AppShell>
  );
}
