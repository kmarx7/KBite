import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  MOCK_RESTAURANTS,
  type MockRestaurant,
} from "@/lib/mock/restaurants";
import type {
  Category,
  Certification,
  Language,
  PriceRange,
  RestaurantListItem,
} from "@/types";

export type { RestaurantListItem };

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
  cover_emoji: string | null;
  photo_url: string | null;
  cuisine: string | null;
  starting_price: number | null;
  certifications: Certification[] | null;
  languages: Language[] | null;
  booking_url: string | null;
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
    avg_rating: m.rating,
    review_count: m.reviewCount,
    created_at: "2026-06-01T00:00:00Z",
  };
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

export async function getRestaurantById(
  id: string,
): Promise<RestaurantListItem | null> {
  /* 목 데이터 id(r1~r6)는 UUID가 아니므로 DB 조회 없이 처리 */
  const mock = MOCK_RESTAURANTS.find((m) => m.id === id);
  if (mock) return mockToItem(mock);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("restaurants_with_stats")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? rowToItem(data as StatsRow) : null;
  } catch {
    return null;
  }
}
