"use client";

import { IconShare2, IconCheck } from "@tabler/icons-react";
import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* 사용자가 공유 시트를 닫은 경우 무시 */
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share"
      className="flex h-8 w-8 items-center justify-center rounded-full"
    >
      {copied ? (
        <IconCheck size={18} color="#15803D" />
      ) : (
        <IconShare2 size={18} color="#8A6040" />
      )}
    </button>
  );
}
