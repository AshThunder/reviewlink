import { PostSkeleton } from "@/components/empty-state";
import { Brand } from "@/components/brand";

export default function AppLoading() {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="h-16 border-b border-border bg-surface">
        <div className="mx-auto flex h-full max-w-[1120px] items-center px-8">
          <Brand href="/app" />
        </div>
      </header>
      <div className="mx-auto max-w-[1120px] px-8 py-7">
        <div className="skeleton mb-2 h-8 w-64" />
        <div className="skeleton mb-6 h-4 w-96" />
        <div className="panel">
          <div className="border-b border-border px-4 py-3.5">
            <div className="skeleton h-4 w-40" />
          </div>
          <PostSkeleton />
        </div>
        <p className="sr-only" aria-live="polite">
          Loading your Buffer queue…
        </p>
      </div>
    </div>
  );
}
