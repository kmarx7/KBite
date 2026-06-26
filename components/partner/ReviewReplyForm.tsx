"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { IconSend } from "@tabler/icons-react";
import { replyToReview } from "@/app/actions/partner";

interface ReviewReplyFormProps {
  reviewId: string;
  restaurantId: string;
  existingReply: string | null;
}

export default function ReviewReplyForm({
  reviewId,
  restaurantId,
  existingReply,
}: ReviewReplyFormProps) {
  const t = useTranslations("partner");
  const [text, setText] = useState(existingReply ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!text.trim()) return;
    setSaved(false);
    setError(false);
    startTransition(async () => {
      const result = await replyToReview(reviewId, restaurantId, text.trim());
      if (result.ok) setSaved(true);
      else setError(true);
    });
  }

  return (
    <div className="mt-2">
      {existingReply && !saved && (
        <p className="mb-1 text-[10px] font-bold text-[#B07040]">
          {t("ownerReply")}
        </p>
      )}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSaved(false);
          }}
          placeholder={t("replyPlaceholder")}
          maxLength={1000}
          rows={2}
          className="min-w-0 flex-1 resize-none rounded-xl border border-[#FFD4B8] bg-[#FFFAF5] px-3 py-2 text-[12px] text-[#1A0800] placeholder-[#C0A080] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !text.trim()}
          className="flex shrink-0 items-center gap-1 self-end rounded-xl px-3 py-2 text-[12px] font-extrabold text-white disabled:opacity-40"
          style={{ backgroundColor: "#FF6B35" }}
        >
          <IconSend size={13} stroke={2.5} />
          {existingReply ? t("replyEdit") : t("replySubmit")}
        </button>
      </div>
      {saved && (
        <p className="mt-1 text-[11px] font-bold text-[#15803D]">
          {t("replySaved")}
        </p>
      )}
      {error && (
        <p className="mt-1 text-[11px] font-bold text-[#B91C1C]">
          {t("replyFailed")}
        </p>
      )}
    </div>
  );
}
