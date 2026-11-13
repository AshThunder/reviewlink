"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy link",
  copiedLabel = "Copied",
  className = "btn btn-secondary",
  onCopied,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement("textarea");
      el.value = value;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    onCopied?.();
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button type="button" className={className} onClick={copy}>
      {copied ? copiedLabel : label}
    </button>
  );
}

export function whatsappShareUrl(url: string, clientName: string): string {
  const text = `Please review next week’s posts for ${clientName}: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
