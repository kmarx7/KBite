import { getTranslations } from "next-intl/server";
import { IconStarFilled } from "@tabler/icons-react";
import type { MockReview } from "@/lib/mock/restaurants";

export default async function ReviewList({
  reviews,
}: {
  reviews: MockReview[];
}) {
  const t = await getTranslations("detail");

  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 text-[15px] font-extrabold text-[#1A0800]">
        {t("reviews")}
      </h2>
      <ul className="flex flex-col gap-2">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-2xl border border-[#FFE8D6] bg-white p-3"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#1A0800]">
                {review.author}
              </span>
              {/* 국적 배지 */}
              <span className="flex items-center gap-0.5 rounded-full bg-[#FFF5EE] px-1.5 py-0.5 text-[10px] font-bold text-[#8A6040]">
                <span aria-hidden>{review.flag}</span>
                {review.nationality}
              </span>
              <span className="ms-auto flex items-center gap-0.5 text-[11px] font-extrabold text-[#F59E0B]">
                <IconStarFilled size={11} />
                {review.rating}
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-[#1A0800]">
              {review.content}
            </p>
            <p className="mt-1 text-[10px] text-[#C0A080]">{review.date}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
