import type { Certification, Category, Language, MenuItem, PriceRange } from "@/types";

/**
 * 작업 2(Supabase) 연결 전까지 화면 개발용 목 데이터.
 * DB 연동 시 lib/api/restaurants.ts 로 대체된다.
 */
export interface MockReview {
  id: string;
  author: string;
  nationality: string; // ISO 코드
  flag: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  date: string;
}

export interface MockRestaurant {
  id: string;
  name: string;
  category: Category;
  address: string;
  lat: number;
  lng: number;
  opening_time: string;
  closing_time: string;
  price_range: PriceRange;
  description: string;
  coverEmoji: string;
  certifications: Certification[];
  languages: Language[];
  booking_url: string | null;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  startingPrice: number;
  cuisine: string;
  menu: MenuItem[];
  reviews: MockReview[];
}

export const MOCK_RESTAURANTS: MockRestaurant[] = [
  {
    id: "r1",
    name: "Istanbul Kitchen",
    category: "me",
    address: "37 Usadan-ro 10-gil, Yongsan-gu, Seoul",
    lat: 37.5326,
    lng: 126.9911,
    opening_time: "11:00",
    closing_time: "22:00",
    price_range: "moderate",
    description:
      "Authentic Turkish home cooking by a chef from Istanbul. Our bread is baked fresh every morning and all meat is halal certified.",
    coverEmoji: "🥙",
    certifications: ["halal"],
    languages: ["en", "ko", "ar"],
    booking_url: null,
    rating: 4.8,
    reviewCount: 127,
    distanceKm: 0.4,
    startingPrice: 9000,
    cuisine: "Turkish",
    menu: [
      {
        name: "Iskender Kebab",
        description: "Sliced lamb over bread with tomato sauce & yogurt",
        price: 16000,
        emoji: "🍖",
      },
      {
        name: "Lahmacun",
        description: "Thin crispy flatbread with spiced minced meat",
        price: 9000,
        emoji: "🫓",
      },
      {
        name: "Baklava",
        description: "Layered pastry with pistachio and honey syrup",
        price: 7000,
        emoji: "🍯",
      },
    ],
    reviews: [
      {
        id: "v1",
        author: "Ahmed",
        nationality: "EG",
        flag: "🇪🇬",
        rating: 5,
        content:
          "Finally found real halal Turkish food in Seoul. The Iskender tastes just like home.",
        date: "2026-05-28",
      },
      {
        id: "v2",
        author: "Minji",
        nationality: "KR",
        flag: "🇰🇷",
        rating: 5,
        content:
          "이스탄불 여행에서 먹던 그 맛이에요. 라흐마준 꼭 드세요!",
        date: "2026-05-20",
      },
      {
        id: "v3",
        author: "Sara",
        nationality: "SA",
        flag: "🇸🇦",
        rating: 4,
        content: "Great halal options. Gets busy on weekends, go early.",
        date: "2026-05-11",
      },
    ],
  },
  {
    id: "r2",
    name: "Saigon Pho House",
    category: "as",
    address: "12 Itaewon-ro 27ga-gil, Yongsan-gu, Seoul",
    lat: 37.5349,
    lng: 126.9947,
    opening_time: "10:30",
    closing_time: "21:30",
    price_range: "budget",
    description:
      "Family-run Vietnamese kitchen. Broth simmered for 12 hours daily, herbs imported weekly.",
    coverEmoji: "🍜",
    certifications: [],
    languages: ["en", "ko", "vi"],
    booking_url: null,
    rating: 4.6,
    reviewCount: 89,
    distanceKm: 0.7,
    startingPrice: 8500,
    cuisine: "Vietnamese",
    menu: [
      {
        name: "Pho Bo",
        description: "Classic beef noodle soup with fresh herbs",
        price: 9500,
        emoji: "🍜",
      },
      {
        name: "Banh Mi",
        description: "Crispy baguette with grilled pork and pickles",
        price: 8500,
        emoji: "🥖",
      },
      {
        name: "Goi Cuon",
        description: "Fresh spring rolls with peanut sauce",
        price: 7000,
        emoji: "🥗",
      },
    ],
    reviews: [
      {
        id: "v4",
        author: "Linh",
        nationality: "VN",
        flag: "🇻🇳",
        rating: 5,
        content: "Phở ngon như ở nhà! The broth is incredibly rich.",
        date: "2026-06-01",
      },
      {
        id: "v5",
        author: "James",
        nationality: "US",
        flag: "🇺🇸",
        rating: 4,
        content: "Best pho I've had in Korea. Small place, big flavor.",
        date: "2026-05-15",
      },
    ],
  },
  {
    id: "r3",
    name: "Harbin Dumpling House",
    category: "cj",
    address: "8 Bogwang-ro 59-gil, Yongsan-gu, Seoul",
    lat: 37.5301,
    lng: 126.9968,
    opening_time: "11:00",
    closing_time: "23:00",
    price_range: "budget",
    description:
      "Northeastern Chinese dumplings handmade to order. Over 20 fillings including vegetarian options.",
    coverEmoji: "🥟",
    certifications: ["vegan"],
    languages: ["en", "ko", "zh"],
    booking_url: null,
    rating: 4.5,
    reviewCount: 64,
    distanceKm: 1.1,
    startingPrice: 7000,
    cuisine: "Chinese (Dongbei)",
    menu: [
      {
        name: "Pork & Chive Dumplings",
        description: "Hand-wrapped, 12 pieces, steamed or fried",
        price: 8000,
        emoji: "🥟",
      },
      {
        name: "Vegan Mushroom Dumplings",
        description: "Shiitake, tofu and glass noodle filling",
        price: 8000,
        emoji: "🍄",
      },
      {
        name: "Guo Bao Rou",
        description: "Crispy sweet & sour pork, Harbin style",
        price: 15000,
        emoji: "🍖",
      },
    ],
    reviews: [
      {
        id: "v6",
        author: "Wei",
        nationality: "CN",
        flag: "🇨🇳",
        rating: 5,
        content: "和哈尔滨老家的味道一样，饺子皮很有嚼劲。",
        date: "2026-05-30",
      },
    ],
  },
  {
    id: "r4",
    name: "La Piazza",
    category: "we",
    address: "45 Noksapyeong-daero 40-gil, Yongsan-gu, Seoul",
    lat: 37.5343,
    lng: 126.9882,
    opening_time: "12:00",
    closing_time: "22:00",
    price_range: "upscale",
    description:
      "Neapolitan trattoria with a wood-fired oven. Dough fermented 48 hours, mozzarella made in-house.",
    coverEmoji: "🍕",
    certifications: [],
    languages: ["en", "ko"],
    booking_url: "https://example.com/lapiazza",
    rating: 4.7,
    reviewCount: 203,
    distanceKm: 0.9,
    startingPrice: 14000,
    cuisine: "Italian",
    menu: [
      {
        name: "Margherita DOP",
        description: "San Marzano tomato, house mozzarella, basil",
        price: 17000,
        emoji: "🍕",
      },
      {
        name: "Tagliatelle al Ragù",
        description: "Slow-braised beef ragù, fresh egg pasta",
        price: 19000,
        emoji: "🍝",
      },
      {
        name: "Tiramisu",
        description: "Classic recipe with Marsala wine",
        price: 9000,
        emoji: "🍰",
      },
    ],
    reviews: [
      {
        id: "v7",
        author: "Marco",
        nationality: "IT",
        flag: "🇮🇹",
        rating: 5,
        content: "Vera pizza napoletana! I almost cried. Better than some places in Milan.",
        date: "2026-06-03",
      },
      {
        id: "v8",
        author: "Soyeon",
        nationality: "KR",
        flag: "🇰🇷",
        rating: 4,
        content: "유학 시절 생각나는 맛. 도우가 진짜 나폴리 스타일이에요.",
        date: "2026-05-22",
      },
    ],
  },
  {
    id: "r5",
    name: "Addis Ababa",
    category: "af",
    address: "19 Usadan-ro, Yongsan-gu, Seoul",
    lat: 37.5318,
    lng: 126.9925,
    opening_time: "12:00",
    closing_time: "21:00",
    price_range: "moderate",
    description:
      "Seoul's first Ethiopian restaurant. Injera fermented in-house, coffee ceremony on weekends.",
    coverEmoji: "🫓",
    certifications: ["vegan", "gf"],
    languages: ["en", "ko"],
    booking_url: null,
    rating: 4.9,
    reviewCount: 41,
    distanceKm: 0.5,
    startingPrice: 12000,
    cuisine: "Ethiopian",
    menu: [
      {
        name: "Veggie Combo",
        description: "Five vegan stews on fresh injera (gluten-free)",
        price: 15000,
        emoji: "🥗",
      },
      {
        name: "Doro Wat",
        description: "Spicy chicken stew with berbere and egg",
        price: 17000,
        emoji: "🍗",
      },
      {
        name: "Ethiopian Coffee",
        description: "Traditional ceremony-roasted single origin",
        price: 6000,
        emoji: "☕",
      },
    ],
    reviews: [
      {
        id: "v9",
        author: "Hanna",
        nationality: "ET",
        flag: "🇪🇹",
        rating: 5,
        content: "The injera is properly sour — just like my mother makes it.",
        date: "2026-05-25",
      },
    ],
  },
  {
    id: "r6",
    name: "Samarkand",
    category: "rc",
    address: "24 Dongdaemun-ro, Jung-gu, Seoul",
    lat: 37.5663,
    lng: 127.0092,
    opening_time: "10:00",
    closing_time: "22:00",
    price_range: "budget",
    description:
      "Uzbek family restaurant in the Central Asia street. Lagman noodles pulled by hand, halal meat only.",
    coverEmoji: "🍢",
    certifications: ["halal"],
    languages: ["en", "ko", "ru"],
    booking_url: null,
    rating: 4.7,
    reviewCount: 156,
    distanceKm: 4.2,
    startingPrice: 8000,
    cuisine: "Uzbek",
    menu: [
      {
        name: "Lagman",
        description: "Hand-pulled noodles with lamb and vegetables",
        price: 10000,
        emoji: "🍜",
      },
      {
        name: "Plov",
        description: "Uzbek rice pilaf with lamb and carrots",
        price: 11000,
        emoji: "🍚",
      },
      {
        name: "Samsa",
        description: "Tandoor-baked pastry with juicy lamb filling",
        price: 4000,
        emoji: "🥟",
      },
    ],
    reviews: [
      {
        id: "v10",
        author: "Aziz",
        nationality: "UZ",
        flag: "🇺🇿",
        rating: 5,
        content: "Настоящий узбекский плов! Как дома в Ташкенте.",
        date: "2026-06-05",
      },
      {
        id: "v11",
        author: "Olga",
        nationality: "RU",
        flag: "🇷🇺",
        rating: 4,
        content: "Лагман отличный, самса свежая. Рекомендую!",
        date: "2026-05-18",
      },
    ],
  },
];

export function getMockRestaurant(id: string): MockRestaurant | undefined {
  return MOCK_RESTAURANTS.find((r) => r.id === id);
}

export function isOpenNow(r: MockRestaurant, now = new Date()): boolean {
  const time = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = r.opening_time.split(":").map(Number);
  const [ch, cm] = r.closing_time.split(":").map(Number);
  return time >= oh * 60 + om && time < ch * 60 + cm;
}
