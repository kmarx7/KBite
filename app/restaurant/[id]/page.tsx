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
} from "@tabler/icons-react";
import {
  getRestaurantDetail,
  incrementViewCount,
} from "@/lib/api/restaurants";
import { DEFAULT_LOCATION, haversineKm, isOpenNow } from "@/lib/utils";
import { formatPriceDisplay } from "@/lib/price";
import DetailCover from "@/components/restaurant/DetailCover";
import MenuList from "@/components/restaurant/MenuList";
import LanguageAvailable from "@/components/restaurant/LanguageAvailable";
import VenueMap from "@/components/restaurant/VenueMap";
import ReviewList from "@/components/restaurant/ReviewList";
import ShareButton from "@/components/restaurant/ShareButton";
import DetailCTA from "@/components/restaurant/DetailCTA";
import TrackOnMount from "@/components/analytics/TrackOnMount";
import { TRACK_EVENTS } from "@/lib/analytics";
import { PLAN_FEATURES } from "@/lib/features";
import TabBar from "@/components/ui/TabBar";


export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  void incrementViewCount(id);
  const restaurant = await getRestaurantDetail(id);
  if (!restaurant) notFound();

  const t = await getTranslations("detail");
  const tc = await getTranslations("common");
  const tt = await getTranslations("tabs");
  const open = isOpenNow(restaurant.opening_time, restaurant.closing_time);
  /* 서버에서는 사용자 위치를 모름 — 이태원 기준 거리 (지도 연동 시 클라이언트 보정) */
  const distanceKm = Math.round(haversineKm(DEFAULT_LOCATION, restaurant) * 10) / 10;

  const infoGrid = [
    {
      Icon: IconToolsKitchen2,
      label: t("cuisine"),
      value: restaurant.cuisine ?? "—",
    },
    {
      Icon: IconClock,
      label: t("hours"),
      value:
        restaurant.opening_time && restaurant.closing_time
          ? `${restaurant.opening_time} – ${restaurant.closing_time}`
          : "—",
    },
    {
      Icon: IconMapPin,
      label: t("location"),
      value: t("distanceAway", { distance: `${distanceKm}km` }),
    },
    {
      Icon: IconCoin,
      label: t("price"),
      value:
        formatPriceDisplay(
          restaurant.price_currency,
          restaurant.price_min,
          restaurant.price_max,
          restaurant.price_range,
        ) || "—",
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
        <TrackOnMount
          event={TRACK_EVENTS.RESTAURANT_VIEW}
          properties={{
            restaurantId: restaurant.id,
            category: restaurant.category,
          }}
        />
        <DetailCover
          restaurantId={restaurant.id}
          category={restaurant.category}
          certifications={restaurant.certifications}
          showCertBadges={PLAN_FEATURES[restaurant.plan].certBadgeEnabled}
          coverEmoji={restaurant.cover_emoji}
          photoUrl={restaurant.photo_url}
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
              {restaurant.avg_rating > 0 ? restaurant.avg_rating : "—"}
            </span>
            · {tc("reviews", { count: restaurant.review_count })}
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
        {restaurant.description && (
          <section className="px-4 py-1">
            <h2 className="mb-1 text-[15px] font-extrabold text-[#1A0800]">
              {t("about")}
            </h2>
            <p className="text-[13px] leading-relaxed text-[#8A6040]">
              {restaurant.description}
            </p>
          </section>
        )}

        {restaurant.menu.length > 0 && <MenuList items={restaurant.menu} />}
        <LanguageAvailable available={restaurant.languages} />
        <VenueMap
          address={restaurant.address}
          distanceKm={distanceKm}
          lat={restaurant.lat}
          lng={restaurant.lng}
        />
        {restaurant.reviews.length > 0 && (
          <ReviewList reviews={restaurant.reviews} />
        )}
      </main>

      {/* CTA 바 — 고정 (클릭 추적 포함) */}
      <DetailCTA
        restaurantId={restaurant.id}
        name={restaurant.name}
        lat={restaurant.lat}
        lng={restaurant.lng}
        startingPrice={restaurant.starting_price}
        bookingUrl={restaurant.booking_url}
      />
      <TabBar active="explore" />
    </div>
  );
}
