import Link from "next/link";

export function Mark({ size = 32 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 128 128"
      aria-hidden="true"
      className="rounded-[8px] flex-none"
    >
      <rect width="128" height="128" rx="28" fill="#0F766E" />
      <path
        d="M34 66 L55 87 L98 40"
        fill="none"
        stroke="#F7F5F2"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Brand({ href = "/", size = "md" }: { href?: string; size?: "sm" | "md" }) {
  const px = size === "sm" ? 28 : 32;
  const text = size === "sm" ? "text-[16px]" : "text-[18px]";
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-text no-underline ${text}`}
      aria-label="ReviewLink home"
    >
      <Mark size={px} />
      ReviewLink
    </Link>
  );
}
