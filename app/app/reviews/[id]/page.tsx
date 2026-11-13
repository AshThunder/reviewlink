import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { getSession } from "@/lib/session";
import { getAccount } from "@/lib/buffer";

export const dynamic = "force-dynamic";

export default async function ReviewStatusPage() {
  const session = await getSession();
  if (!session) redirect("/?error=auth");
  let name: string | null = null;
  let email: string | null = null;
  try {
    const account = await getAccount(session.accountId);
    name = account.name;
    email = account.email;
  } catch {
    /* shell still renders */
  }
  return (
    <AppShell name={name} email={email}>
      <Link href="/app" className="mb-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent no-underline">
        ← Back to queue
      </Link>
      <h1 className="m-0 text-[28px] font-bold tracking-tight">Review status</h1>
      <div className="panel mt-6">
        <EmptyState
          title="This review isn’t ready yet"
          body="The status page — per-post decisions, comments, and “Synced to Buffer as a note” — is next. Your queue and Buffer sign-in already work."
          action={
            <Link href="/app" className="btn btn-secondary">
              Return to dashboard
            </Link>
          }
        />
      </div>
    </AppShell>
  );
}
