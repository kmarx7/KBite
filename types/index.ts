/** 1층 카테고리 — 지역·문화권 기준 6개 */
export type Category = "me" | "as" | "cj" | "we" | "af" | "rc";

export const CATEGORIES: Record<
  Category,
  { label: string; emoji: string; color: string }
> = {
  me: { label: "Middle Eastern", emoji: "🕌", color: "#FF6B35" },
  as: { label: "Asian", emoji: "🌏", color: "#F59E0B" },
  cj: { label: "China / Japan", emoji: "🥟", color: "#EF4444" },
  we: { label: "Western", emoji: "🥐", color: "#5B8DEF" },
  af: { label: "African", emoji: "🌍", color: "#8B5CF6" },
  rc: { label: "Russia & Central Asia", emoji: "🏔️", color: "#0EA5E9" },
};

/** 인증 배지 — 식당 카드에 표시 (카테고리 아님) */
export type Certification = "halal" | "vegan" | "kosher" | "gf" | "dairy-free";

/** 지원 언어 9개 — ar, fa는 RTL */
export type Language =
  | "en"
  | "ko"
  | "ar"
  | "zh"
  | "ja"
  | "vi"
  | "th"
  | "ru"
  | "fa";

export const LANGUAGES: Record<
  Language,
  { label: string; flag: string; rtl: boolean }
> = {
  en: { label: "English", flag: "🇬🇧", rtl: false },
  ko: { label: "한국어", flag: "🇰🇷", rtl: false },
  ar: { label: "العربية", flag: "🇸🇦", rtl: true },
  zh: { label: "中文", flag: "🇨🇳", rtl: false },
  ja: { label: "日本語", flag: "🇯🇵", rtl: false },
  vi: { label: "Tiếng Việt", flag: "🇻🇳", rtl: false },
  th: { label: "ภาษาไทย", flag: "🇹🇭", rtl: false },
  ru: { label: "Русский", flag: "🇷🇺", rtl: false },
  fa: { label: "فارسی", flag: "🇮🇷", rtl: true },
};

export type PriceRange = "budget" | "moderate" | "upscale";
export type PriceCurrency = "KRW" | "USD";
export type RestaurantStatus = "pending" | "approved" | "rejected";
export type Plan = "free" | "basic" | "premium";

export interface Restaurant {
  id: string;
  name: string;
  category: Category;
  address: string;
  lat: number;
  lng: number;
  opening_time: string | null; // "HH:MM"
  closing_time: string | null;
  price_range: PriceRange | null;
  price_currency: PriceCurrency | null;
  price_min: number | null;
  price_max: number | null;
  description: string | null;
  photo_url: string | null;
  certifications: Certification[];
  languages: Language[];
  booking_url: string | null;
  sns_url: string | null;
  status: RestaurantStatus;
  plan: Plan;
  owner_email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/** 목록/지도 화면에서 쓰는 식당 카드 데이터 (DB 뷰 restaurants_with_stats 기반) */
export interface RestaurantListItem {
  id: string;
  name: string;
  category: Category;
  address: string;
  lat: number;
  lng: number;
  opening_time: string | null; // "HH:MM"
  closing_time: string | null;
  price_range: PriceRange | null;
  price_currency: PriceCurrency | null;
  price_min: number | null;
  price_max: number | null;
  cover_emoji: string;
  photo_url: string | null;
  cuisine: string | null;
  starting_price: number | null;
  certifications: Certification[];
  languages: Language[];
  booking_url: string | null;
  description: string | null;
  plan: Plan;
  avg_rating: number;
  review_count: number;
  created_at: string;
}

/** 상세 페이지 리뷰 표시용 */
export interface ReviewDisplay {
  id: string;
  author: string;
  nationality: string;
  flag: string;
  rating: number;
  content: string;
  date: string;
}

export interface MenuItem {
  name: string;
  description: string;
  price: number; // KRW
  emoji: string;
}

export interface MenuItemRow extends MenuItem {
  id: string;
}

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string | null;
  nationality: string | null; // ISO 국적 코드
  created_at: string;
}

export interface Profile {
  id: string;
  nationality: string | null;
  preferred_language: Language;
  saved_restaurants: string[];
  created_at: string;
}
