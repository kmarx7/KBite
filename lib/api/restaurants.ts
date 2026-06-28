import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MOCK_RESTAURANTS,
  type MockRestaurant,
} from "@/lib/mock/restaurants";
import type {
  Category,
  Certification,
  Language,
  MenuItem,
  Plan,
  PriceCurrency,
  PriceRange,
  RestaurantListItem,
  ReviewDisplay,
} from "@/types";

export type { RestaurantListItem };

export interface RestaurantDetail extends RestaurantListItem {
  menu: MenuItem[];
  reviews: ReviewDisplay[];
}

type StatsRow = {
  id: string;
  name: string;
  category: Category;
  address: string;
  lat: number;
  lng: number;
  opening_time: string | null;
  closing_time: string | null;
  price_range: PriceRange | null;
  price_currency: PriceCurrency | null;
  price_min: number | null;
  price_max: number | null;
  cover_emoji: string | null;
  photo_url: string | null;
  cuisine: string | null;
  starting_price: number | null;
  certifications: Certification[] | null;
  languages: Language[] | null;
  booking_url: string | null;
  description: string | null;
  plan: Plan | null;
  avg_rating: number | null;
  review_count: number | null;
  created_at: string;
};

function rowToItem(row: StatsRow): RestaurantListItem {
  return {
    ...row,
    opening_time: row.opening_time?.slice(0, 5) ?? null,
    closing_time: row.closing_time?.slice(0, 5) ?? null,
    cover_emoji: row.cover_emoji ?? "🍽️",
    certifications: row.certifications ?? [],
    languages: row.languages ?? [],
    plan: row.plan ?? "free",
    avg_rating: Number(row.avg_rating ?? 0),
    review_count: row.review_count ?? 0,
  };
}

function mockToItem(m: MockRestaurant): RestaurantListItem {
  return {
    id: m.id,
    name: m.name,
    category: m.category,
    address: m.address,
    lat: m.lat,
    lng: m.lng,
    opening_time: m.opening_time,
    closing_time: m.closing_time,
    price_range: m.price_range,
    cover_emoji: m.coverEmoji,
    photo_url: null,
    cuisine: m.cuisine,
    starting_price: m.startingPrice,
    certifications: m.certifications,
    languages: m.languages,
    booking_url: m.booking_url,
    description: m.description,
    plan: "free",
    avg_rating: m.rating,
    review_count: m.reviewCount,
    created_at: "2026-06-01T00:00:00Z",
    price_currency: null,
    price_min: null,
    price_max: null,
  };
}

/** ISO 2자리 국적 코드 → 국기 이모지 */
function flagEmoji(code: string | null): string {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/**
 * 승인된 식당 목록 — RLS가 approved만 반환한다.
 * 마이그레이션 전(테이블 없음)이나 데이터 0건일 땐 목 데이터로 폴백해
 * 화면 개발이 막히지 않게 한다.
 */
export async function getApprovedRestaurants(): Promise<RestaurantListItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("restaurants_with_stats")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    if (!data || data.length === 0) return MOCK_RESTAURANTS.map(mockToItem);
    return (data as StatsRow[]).map(rowToItem);
  } catch {
    /* 마이그레이션 미적용 등 — 목 데이터 폴백 */
    return MOCK_RESTAURANTS.map(mockToItem);
  }
}

/** 조회수 원자적 증가 — DB 함수 호출 (fire-and-forget) */
export async function incrementViewCount(id: string): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.rpc("increment_view_count", { rid: id });
  } catch {
    /* 마이그레이션 미적용 등 — 무시 */
  }
}

/** 상세 페이지용 — 식당 + 메뉴 + 리뷰 */
export async function getRestaurantDetail(
  id: string,
): Promise<RestaurantDetail | null> {
  /* 목 데이터 id(r1~r6)는 UUID가 아니므로 DB 조회 없이 처리 */
  const mock = MOCK_RESTAURANTS.find((m) => m.id === id);
  if (mock) {
    return { ...mockToItem(mock), menu: mock.menu, reviews: mock.reviews };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("restaurants_with_stats")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { data: reviewRows } = await supabase
      .from("reviews")
      .select("id, rating, content, nationality, created_at, reply_text")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    const reviews: ReviewDisplay[] = (reviewRows ?? []).map((v) => ({
      id: v.id as string,
      author: "Guest", // 프로필 닉네임 도입 전까지 익명 표시
      nationality: (v.nationality as string | null) ?? "",
      flag: flagEmoji(v.nationality as string | null),
      rating: v.rating as number,
      content: (v.content as string | null) ?? "",
      date: (v.created_at as string).slice(0, 10),
      replyText: (v.reply_text as string | null) ?? undefined,
    }));

    const { data: menuRows } = await supabase
      .from("menu_items")
      .select("name, description, price, emoji")
      .eq("restaurant_id", id)
      .order("sort_order")
      .order("created_at");

    const menu: MenuItem[] = (menuRows ?? []).map((m) => ({
      name: m.name as string,
      description: (m.description as string | null) ?? "",
      price: m.price as number,
      emoji: (m.emoji as string | null) ?? "🍽️",
    }));

    return { ...rowToItem(data as StatsRow), menu, reviews };
  } catch {
    return null;
  }
}
