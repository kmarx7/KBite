import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  IconChevronLeft,
  IconStarFilled,
  IconClock,
  IconMapPin,
  IconCoin,
  IconToolsKitchen2,
  IconNavigation,
} from "@tabler/icons-react";
import { getMockRestaurant, isOpenNow } from "@/lib/mock/restaurants";
import type { PriceRange } from "@/types";
import DetailCover from "@/components/restaurant/DetailCover";
import MenuList from "@/components/restaurant/MenuList";
import LanguageAvailable from "@/components/restaurant/LanguageAvailable";
import VenueMap from "@/components/restaurant/VenueMap";
import ReviewList from "@/components/restaurant/ReviewList";
import ShareButton from "@/components/restaurant/ShareButton";
import TabBar from "@/components/ui/TabBar";

const PRICE_SYMBOL: Record<PriceRange, string> = {
  budget: "₩",
  moderate: "₩₩",
  upscale: "₩₩₩",
};

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurant = getMockRestaurant(id);
  if (!restaurant) notFound();

  const t = await getTranslations("detail");
  const tc = await getTranslations("common");
  const tt = await getTranslations("tabs");
  const open = isOpenNow(restaurant);

  const infoGrid = [
    { Icon: IconToolsKitchen2, label: t("cuisine"), value: restaurant.cuisine },
    {
      Icon: IconClock,
      label: t("hours"),
      value: `${restaurant.opening_time} – ${restaurant.closing_time}`,
    },
    {
      Icon: IconMapPin,
      label: t("location"),
      value: t("distanceAway", { distance: `${restaurant.distanceKm}km` }),
    },
    {
      Icon: IconCoin,
      label: t("price"),
      value: PRICE_SYMBOL[restaurant.price_range],
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      {/* NavBar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#FFE8D6] bg-[#FFFAF5]/95 px-3 py-2 backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-0.5 text-[12px] font-bold text-[#8A6040]"
        >
          <IconChevronLeft size={16} />
          {tt("explore")}
        </Link>
        <span className="text-[15px] font-black text-[#FF6B35]">
          {tc("appName")}
        </span>
        <ShareButton title={restaurant.name} />
      </header>

      <main className="flex-1 pb-2">
        <DetailCover
          category={restaurant.category}
          certifications={restaurant.certifications}
          coverEmoji={restaurant.coverEmoji}
        />

        {/* MainInfo */}
        <section className="px-4 pb-1 pt-4">
          <div className="flex items-center gap-2">
            <h1 className="min-w-0 flex-1 truncate text-[19px] font-extrabold text-[#1A0800]">
              {restaurant.name}
            </h1>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold"
              style={
                open
                  ? { backgroundColor: "#DCFCE7", color: "#15803D" }
                  : { backgroundColor: "#FEE2E2", color: "#B91C1C" }
              }
            >
              {open ? tc("openNow") : tc("closed")}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-[#8A6040]">
            <IconStarFilled size={13} color="#F59E0B" />
            <span className="font-extrabold text-[#1A0800]">
              {restaurant.rating}
            </span>
            · {tc("reviews", { count: restaurant.reviewCount })}
          </p>
        </section>

        {/* InfoGrid — 2열 (min-width:0 필수) */}
        <section className="grid grid-cols-2 gap-2 px-4 py-3">
          {infoGrid.map(({ Icon, label, value }) => (
            <div
              key={label}
              className="flex min-w-0 items-center gap-2 rounded-2xl border border-[#FFE8D6] bg-white p-3"
            >
              <Icon size={16} color="#FF6B35" className="shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#B07040]">{label}</p>
                <p className="truncate text-[12px] font-bold text-[#1A0800]">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* About */}
        <section className="px-4 py-1">
          <h2 className="mb-1 text-[15px] font-extrabold text-[#1A0800]">
            {t("about")}
          </h2>
          <p className="text-[13px] leading-relaxed text-[#8A6040]">
            {restaurant.description}
          </p>
        </section>

        <MenuList items={restaurant.menu} />
        <LanguageAvailable available={restaurant.languages} />
        <VenueMap
          address={restaurant.address}
          distanceKm={restaurant.distanceKm}
          lat={restaurant.lat}
          lng={restaurant.lng}
        />
        <ReviewList reviews={restaurant.reviews} />
      </main>

      {/* CTA 바 — 고정 */}
      <div className="sticky bottom-0 z-30 flex items-center gap-2 border-t border-[#FFE8D6] bg-[#FFFAF5] px-4 py-3">
        <p className="min-w-0 flex-1 text-[12px] font-bold text-[#8A6040]">
          {t("startingFrom", {
            price: `₩${restaurant.startingPrice.toLocaleString()}`,
          })}
        </p>
        <a
          href={`https://map.kakao.com/link/to/${encodeURIComponent(restaurant.name)},${restaurant.lat},${restaurant.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-[13px] font-bold text-[#CC4400]"
        >
          <IconNavigation size={14} />
          {t("directions")}
        </a>
        <a
          href={restaurant.booking_url ?? "#"}
          target={restaurant.booking_url ? "_blank" : undefined}
          rel="noopener noreferrer"
          aria-disabled={!restaurant.booking_url}
          className="shrink-0 rounded-xl px-5 py-2.5 text-[13px] font-extrabold text-white"
          style={{
            backgroundColor: "#FF6B35",
            opacity: restaurant.booking_url ? 1 : 0.5,
          }}
        >
          {t("reserve")}
        </a>
      </div>
      <TabBar active="explore" />
    </div>
  );
}
