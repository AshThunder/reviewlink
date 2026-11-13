import { Brand } from "@/components/brand";

export const dynamic = "force-dynamic";

export default async function PublicReviewPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-bg px-4 py-8">
      <main className="w-full max-w-[390px]">
        <div className="mb-6 flex justify-center">
          <Brand href="/" size="sm" />
        </div>
        <div className="panel px-5 py-10 text-center">
          <h1 className="m-0 text-[22px] font-bold tracking-tight">This review link isn’t available</h1>
          <p className="mx-auto mt-3 max-w-[32ch] text-[15px] leading-relaxed text-muted">
            It may have expired, been revoked, or not been created yet. Ask your manager for a new link.
          </p>
        </div>
      </main>
    </div>
  );
}
