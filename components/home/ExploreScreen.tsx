"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  IconSearch,
  IconMapPin,
  IconChevronDown,
  IconCurrentLocation,
  IconX,
} from "@tabler/icons-react";
import { CATEGORIES, type Category, type RestaurantListItem } from "@/types";
import { DEFAULT_LOCATION, haversineKm, isOpenNow } from "@/lib/utils";
import { searchBoost } from "@/lib/features";
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
  const tp = useTranslations("policies");
  const router = useRouter();

  const [selectedCats, setSelectedCats] = useState<Category[]>([]);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [myLocation, setMyLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<
    "locationDenied" | "locationUnavailable" | null
  >(null);
  const [showLocationGuide, setShowLocationGuide] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/.test(navigator.userAgent);

  /* 버튼 클릭 — 사용자 제스처에서 권한 요청 (iOS에서 대화상자 표시) */
  const requestLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setMyLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (error) => {
        setLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "locationDenied"
            : "locationUnavailable",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => { setMounted(true); }, []);

  /* 최초 자동 요청 — 이미 허가된 경우만 조용히 위치 가져오기
     iOS Safari에서 'prompt' 상태일 때 useEffect 자동 요청은 대화상자를 표시하지 않을 수 있어
     권한 상태를 먼저 확인 후 granted일 때만 자동 요청 */
  useEffect(() => {
    if (!navigator.geolocation) return;

    const silentGet = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setMyLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => {},
        { enableHighAccuracy: false, timeout: 8000 },
      );
    };

    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          if (result.state === "granted") {
            silentGet();
          } else if (result.state === "denied") {
            setLocationError("locationDenied");
          }
          // 'prompt' 상태 → 자동 요청 건너뜀, 사용자가 버튼을 탭해야 함
        })
        .catch(silentGet); // permissions API 미지원 → 기존 방식 폴백
    } else {
      silentGet(); // 구버전 브라우저 폴백
    }
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
        isOpen: mounted ? isOpenNow(r.opening_time, r.closing_time) : false,
      }));

    /* 유료 플랜 검색 상단 노출(searchBoost) 우선, 그 안에서 선택한 기준으로 정렬 */
    const boostDiff = (
      a: (typeof items)[number],
      b: (typeof items)[number],
    ) => searchBoost(b.restaurant.plan) - searchBoost(a.restaurant.plan);

    switch (filter.sort) {
      case "rating":
        items.sort(
          (a, b) =>
            boostDiff(a, b) ||
            b.restaurant.avg_rating - a.restaurant.avg_rating,
        );
        break;
      case "open":
        items.sort(
          (a, b) =>
            boostDiff(a, b) ||
            Number(b.isOpen) - Number(a.isOpen) ||
            a.distanceKm - b.distanceKm,
        );
        break;
      case "newest":
        items.sort(
          (a, b) =>
            boostDiff(a, b) ||
            b.restaurant.created_at.localeCompare(a.restaurant.created_at),
        );
        break;
      default:
        items.sort((a, b) => boostDiff(a, b) || a.distanceKm - b.distanceKm);
    }
    return items;
  }, [restaurants, selectedCats, search, filter, origin, mounted]);

  const allSelected = selectedCats.length === 0;

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="z-30 flex items-center gap-2 bg-[#FFFAF5]/90 px-4 py-2.5 backdrop-blur-sm">
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

      {/* MapArea */}
      <div className="relative h-[45dvh] min-h-[200px] shrink-0">
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
        {/* 내 위치 버튼 — 클릭 시 권한 재요청, 거부 상태면 안내 배너 */}
        <button
          type="button"
          onClick={requestLocation}
          disabled={locating}
          aria-label={t("myLocation")}
          className="absolute bottom-14 end-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#FFD4B8] bg-white shadow-md disabled:opacity-60"
        >
          <IconCurrentLocation
            size={17}
            color={myLocation ? "#3B82F6" : "#8A6040"}
            className={locating ? "animate-pulse" : undefined}
          />
        </button>

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

      {/* 위치 권한 안내 배너 */}
      {locationError && (
        <div className="flex items-start gap-2 border-b border-[#FDE047] bg-[#FEF9C3] px-4 py-2.5">
          <button
            type="button"
            onClick={
              locationError === "locationDenied"
                ? () => setShowLocationGuide(true)
                : requestLocation
            }
            className="min-w-0 flex-1 text-start text-[11px] font-semibold leading-relaxed text-[#854D0E] underline decoration-[#854D0E]/50 underline-offset-2"
          >
            {t(locationError)}
          </button>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            aria-label="Close"
            className="shrink-0"
          >
            <IconX size={14} color="#854D0E" />
          </button>
        </div>
      )}

      {/* 위치 권한 안내 모달 */}
      {showLocationGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowLocationGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-5 pb-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 h-1 w-10 rounded-full bg-[#E5E7EB] mx-auto" />
            <h3 className="mb-4 mt-3 text-[15px] font-extrabold text-[#1A0800]">
              {t("locationGuideTitle")}
            </h3>
            <div className="space-y-2">
              {t(isIOS ? "locationGuideIOS" : "locationGuideOther")
                .split("\n")
                .map((step, i) => (
                  <p
                    key={i}
                    className="text-[12px] leading-relaxed text-[#4A3020]"
                  >
                    {step}
                  </p>
                ))}
            </div>
            <button
              type="button"
              onClick={() => setShowLocationGuide(false)}
              className="mt-5 w-full rounded-full bg-[#FF6B35] py-3 text-[13px] font-bold text-white"
            >
              {t("locationGuideConfirm")}
            </button>
          </div>
        </div>
      )}

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
                style={{ backgroundColor: CATEGORIES[cat].colorDark }}
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
          {/* 정책 링크 푸터 */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pb-2 pt-4">
            {(["terms", "privacy", "partner", "refund"] as const).map(
              (slug) => (
                <Link
                  key={slug}
                  href={`/policy/${slug}`}
                  className="text-[10px] font-semibold text-[#C0A080] underline-offset-2 hover:underline"
                >
                  {tp(slug)}
                </Link>
              ),
            )}
          </div>
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
