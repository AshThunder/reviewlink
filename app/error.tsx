"use client";

import { Brand } from "@/components/brand";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6">
      <Brand />
      <div className="panel mt-8 max-w-md px-6 py-8 text-center">
        <h1 className="m-0 text-[22px] font-bold">Something went wrong</h1>
        <p className="mt-2 text-[15px] text-muted">
          An unexpected error stopped this page. Your data is safe — please try again.
        </p>
        <button type="button" className="btn btn-primary mt-6" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
