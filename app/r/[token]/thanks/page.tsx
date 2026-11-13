import { Brand } from "@/components/brand";

export const dynamic = "force-dynamic";

export default function ThanksPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-bg px-4 py-8">
      <main className="w-full max-w-[390px]">
        <div className="mb-6 flex justify-center">
          <Brand href="/" size="sm" />
        </div>
        <div className="panel px-5 py-10 text-center">
          <div
            className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent"
            aria-hidden="true"
          >
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <path d="M4 8.2 L7 11 L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="m-0 text-[22px] font-bold tracking-tight">Decisions sent</h1>
          <p className="mx-auto mt-3 max-w-[32ch] text-[15px] leading-relaxed text-muted">
            Your manager will see them in ReviewLink and as Notes on each post in Buffer.
          </p>
        </div>
      </main>
    </div>
  );
}
