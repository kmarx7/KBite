"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconSearch, IconMapPin, IconChevronDown } from "@tabler/icons-react";
import { CATEGORIES, type Category, type RestaurantListItem } from "@/types";
import { DEFAULT_LOCATION, haversineKm, isOpenNow } from "@/lib/utils";
import { TRACK_EVENTS, track } from "@/lib/analytics";
import MapView from "@/components/map/MapView";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import CategoryChip from "@/components/ui/CategoryChip";
import LanguageButton from "@/components/ui/LanguageButton";
import FilterSortButton from "@/components/ui/FilterSortButton";
import FilterSortSheet, {
  DEFAULT_FILTER,
  countActiveFilters,
  type FilterState,
  type SortOption,
} from "@/components/ui/FilterSortSheet";
import TabBar from "@/components/ui/TabBar";

const SORT_LABEL_KEY: Record<SortOption, string> = {
  nearest: "nearest",
  rating: "highestRated",
  open: "openNowFirst",
  newest: "newestListed",
};

export default function ExploreScreen({
  restaurants,
}: {
  restaurants: RestaurantListItem[];
}) {
  const t = useTranslations("home");
  const tf = useTranslations("filterSheet");
  const tc = useTranslations("categories");
  const router = useRouter();

  const [selectedCats, setSelectedCats] = useState<Category[]>([]);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [myLocation, setMyLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  /* 현재 위치 — 거부/실패 시 이태원 폴백 (myLocation null 유지) */
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setMyLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 },
    );
  }, []);

  const origin = myLocation ?? DEFAULT_LOCATION;

  /* 검색어 추적 — 1초 디바운스 (입력 중 노이즈 방지) */
  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) return;
    const timer = setTimeout(
      () => track(TRACK_EVENTS.SEARCH_QUERY, { query: query.slice(0, 100) }),
      1000,
    );
    return () => clearTimeout(timer);
  }, [search]);

  const toggleCat = (cat: Category) => {
    track(TRACK_EVENTS.FILTER_USED, { type: "category", value: cat });
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const applyFilter = (next: FilterState) => {
    track(TRACK_EVENTS.FILTER_USED, {
      type: "sheet",
      sort: next.sort,
      certifications: next.certifications.join(","),
      priceRanges: next.priceRanges.join(","),
    });
    setFilter(next);
  };

  const list = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = restaurants
      .filter(
        (r) =>
          selectedCats.length === 0 || selectedCats.includes(r.category),
      )
      .filter(
        (r) =>
          query === "" ||
          r.name.toLowerCase().includes(query) ||
          (r.cuisine ?? "").toLowerCase().includes(query),
      )
      .filter((r) =>
        filter.certifications.every((c) => r.certifications.includes(c)),
      )
      .filter(
        (r) =>
          filter.priceRanges.length === 0 ||
          (r.price_range !== null &&
            filter.priceRanges.includes(r.price_range)),
      )
      .map((r) => ({
        restaurant: r,
        distanceKm: haversineKm(origin, r),
        isOpen: isOpenNow(r.opening_time, r.closing_time),
      }));

    switch (filter.sort) {
      case "rating":
        items.sort((a, b) => b.restaurant.avg_rating - a.restaurant.avg_rating);
        break;
      case "open":
        items.sort(
          (a, b) =>
            Number(b.isOpen) - Number(a.isOpen) || a.distanceKm - b.distanceKm,
        );
        break;
      case "newest":
        items.sort((a, b) =>
          b.restaurant.created_at.localeCompare(a.restaurant.created_at),
        );
        break;
      default:
        items.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return items;
  }, [restaurants, selectedCats, search, filter, origin]);

  const allSelected = selectedCats.length === 0;

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5] px-4 py-2.5">
        <h1 className="text-[20px] font-black text-[#FF6B35]">KBite</h1>
        <button
          type="button"
          className="ms-auto flex items-center gap-1 rounded-full border border-[#FFD4B8] bg-white px-2.5 py-1.5 text-[12px] font-bold text-[#1A0800]"
        >
          <IconMapPin size={13} color="#FF6B35" />
          Seoul
          <IconChevronDown size={12} stroke={3} color="#B07040" />
        </button>
        <LanguageButton />
      </header>

      {/* MapArea (220px) */}
      <div className="relative h-[220px] shrink-0">
        <MapView
          restaurants={restaurants}
          visibleCategories={selectedCats}
          center={DEFAULT_LOCATION}
          myLocation={myLocation}
          onPinClick={(id) => router.push(`/restaurant/${id}`)}
        />
        {/* SearchBar — 지도 위 float */}
        <div className="absolute inset-x-3 top-3 z-10">
          <div className="flex items-center gap-2 rounded-full border border-[#FFD4B8] bg-white/95 px-3 py-2 shadow-md backdrop-blur">
            <IconSearch size={15} color="#FF6B35" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent text-[13px] font-semibold text-[#1A0800] placeholder:text-[#C0A080] focus:outline-none"
            />
          </div>
        </div>
        {/* CategoryChips — 지도 위 float, 중복 선택 */}
        <div className="absolute inset-x-0 bottom-3 z-10 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none]">
          <CategoryChip
            cat="all"
            label={tc("all")}
            emoji="✨"
            selected={allSelected}
            onClick={() => setSelectedCats([])}
          />
          {(Object.keys(CATEGORIES) as Category[]).map((cat) => (
            <CategoryChip
              key={cat}
              cat={cat}
              label={tc(cat)}
              emoji={CATEGORIES[cat].emoji}
              selected={selectedCats.includes(cat)}
              onClick={() => toggleCat(cat)}
            />
          ))}
        </div>
      </div>

      {/* HandleBar */}
      <div className="flex justify-center bg-[#FFFAF5] py-2">
        <div className="h-1 w-10 rounded-full bg-[#FFD4B8]" />
      </div>

      {/* BottomSheet 영역 */}
      <div className="flex min-h-0 flex-1 flex-col bg-[#FFFAF5]">
        <div className="flex items-center justify-between px-4 pb-2">
          <h2 className="text-[15px] font-extrabold text-[#1A0800]">
            {t("nearYou")}{" "}
            <span className="text-[#FF6B35]">
              {t("found", { count: list.length })}
            </span>
          </h2>
          <FilterSortButton
            activeCount={countActiveFilters(filter)}
            currentSort={tf(SORT_LABEL_KEY[filter.sort])}
            onOpen={() => setSheetOpen(true)}
          />
        </div>

        {/* ActiveFilterChips */}
        {!allSelected && (
          <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
            {selectedCats.map((cat) => (
              <span
                key={cat}
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white"
                style={{ backgroundColor: CATEGORIES[cat].color }}
              >
                {CATEGORIES[cat].emoji} {tc(cat)}
              </span>
            ))}
          </div>
        )}

        {/* 카드 리스트 */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
          {list.map(({ restaurant, distanceKm, isOpen }) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              distanceKm={distanceKm}
              isOpen={isOpen}
            />
          ))}
          {list.length === 0 && (
            <p className="py-10 text-center text-[12px] font-semibold text-[#B07040]">
              {t("found", { count: 0 })}
            </p>
          )}
        </div>
      </div>

      <FilterSortSheet
        open={sheetOpen}
        value={filter}
        onApply={applyFilter}
        onClose={() => setSheetOpen(false)}
      />
      <TabBar active="explore" />
    </div>
  );
}
