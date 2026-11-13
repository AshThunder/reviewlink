import { Brand } from "@/components/brand";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6">
      <Brand />
      <div className="panel mt-8 max-w-md px-6 py-8 text-center">
        <h1 className="m-0 text-[22px] font-bold">Page not found</h1>
        <p className="mt-2 text-[15px] text-muted">
          That URL doesn’t match a ReviewLink page. Head back to the home page to Connect Buffer.
        </p>
        <Link href="/" className="btn btn-primary mt-6">
          Go to ReviewLink
        </Link>
      </div>
    </div>
  );
}
