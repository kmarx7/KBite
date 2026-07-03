"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconStarFilled, IconStar, IconLogin2 } from "@tabler/icons-react";
import { submitReview } from "@/app/actions/reviews";

interface Props {
  restaurantId: string;
  /** 비로그인 시 작성 대신 로그인 유도 (서버 액션이 재차 강제) */
  isLoggedIn: boolean;
}

const NATIONALITY_OPTIONS = [
  { code: "KR", flag: "🇰🇷", name: "Korea" },
  { code: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "CN", flag: "🇨🇳", name: "China" },
  { code: "TW", flag: "🇹🇼", name: "Taiwan" },
  { code: "HK", flag: "🇭🇰", name: "Hong Kong" },
  { code: "US", flag: "🇺🇸", name: "USA" },
  { code: "GB", flag: "🇬🇧", name: "UK" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "IR", flag: "🇮🇷", name: "Iran" },
  { code: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "TH", flag: "🇹🇭", name: "Thailand" },
  { code: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "MN", flag: "🇲🇳", name: "Mongolia" },
  { code: "UZ", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "KZ", flag: "🇰🇿", name: "Kazakhstan" },
];

export default function ReviewForm({ restaurantId, isLoggedIn }: Props) {
  const t = useTranslations("detail");
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setRating(0);
    setHover(0);
    setError(null);
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending || rating === 0) return;
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("restaurantId", restaurantId);
    formData.set("rating", String(rating));

    startTransition(async () => {
      const result = await submitReview(formData);
      if (!result.ok) {
        setError(t("reviewError"));
        return;
      }
      setDone(true);
      setOpen(false);
    });
  }

  if (done) {
    return (
      <div className="mx-4 mb-3 rounded-2xl bg-[#DCFCE7] px-4 py-3 text-center text-[13px] font-bold text-[#15803D]">
        {t("reviewThanks")}
      </div>
    );
  }

  const activeRating = hover || rating;

  if (!isLoggedIn) {
    return (
      <div className="px-4 pb-3">
        <Link
          href={`/login?next=/restaurant/${restaurantId}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#FFD4B8] bg-white py-3 text-[13px] font-bold text-[#FF6B35]"
        >
          <IconLogin2 size={15} />
          {t("loginToReview")}
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pb-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-2xl border border-dashed border-[#FFD4B8] bg-white py-3 text-[13px] font-bold text-[#FF6B35]"
        >
          {t("writeReview")}
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#FFE8D6] bg-white p-4"
        >
          {/* 별점 */}
          <p className="mb-1.5 text-[11px] font-bold text-[#8A6040]">
            {t("ratingLabel")}
          </p>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="p-0.5"
                aria-label={`${star} star`}
              >
                {star <= activeRating ? (
                  <IconStarFilled size={26} color="#F59E0B" />
                ) : (
                  <IconStar size={26} color="#D1D5DB" />
                )}
              </button>
            ))}
          </div>

          {/* 코멘트 */}
          <p className="mb-1.5 text-[11px] font-bold text-[#8A6040]">
            {t("commentLabel")}
          </p>
          <textarea
            name="content"
            maxLength={2000}
            rows={3}
            placeholder={t("commentPlaceholder")}
            className="mb-3 w-full resize-none rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-[13px] text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none"
          />

          {/* 국적 */}
          <p className="mb-1.5 text-[11px] font-bold text-[#8A6040]">
            {t("nationalityLabel")}
          </p>
          <select
            name="nationality"
            defaultValue=""
            className="mb-4 w-full rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-[13px] text-[#1A0800] focus:border-[#FF6B35] focus:outline-none"
          >
            <option value="">{t("selectNationality")}</option>
            {NATIONALITY_OPTIONS.map(({ code, flag, name }) => (
              <option key={code} value={code}>
                {flag} {name}
              </option>
            ))}
          </select>

          {error && (
            <p className="mb-3 text-[12px] font-bold text-[#B91C1C]">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-xl border border-[#FFD4B8] py-2.5 text-[13px] font-bold text-[#8A6040]"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending || rating === 0}
              className="flex-1 rounded-xl py-2.5 text-[13px] font-extrabold text-white disabled:opacity-50"
              style={{ backgroundColor: "#FF6B35" }}
            >
              {isPending ? "…" : t("submitReview")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
