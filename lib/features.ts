import type { Plan } from "@/types";

/**
 * 플랜별 기능 매트릭스 (작업 14) — 수익화 로드맵 §2-4.
 * Free: 기본 등록 / Basic 월 29,000원 / Premium 월 59,000원.
 */
export const PLAN_PRICES: Record<Exclude<Plan, "free">, number> = {
  basic: 29000,
  premium: 59000,
};

export const PLAN_FEATURES = {
  free: {
    maxPhotos: 1,
    menuEnabled: false,
    reviewReplyEnabled: false,
    searchBoost: 0,
    analyticsEnabled: false,
    certBadgeEnabled: false,
  },
  basic: {
    maxPhotos: 5,
    menuEnabled: true,
    reviewReplyEnabled: true,
    searchBoost: 1,
    analyticsEnabled: false,
    certBadgeEnabled: false,
  },
  premium: {
    maxPhotos: 20,
    menuEnabled: true,
    reviewReplyEnabled: true,
    searchBoost: 2, // 검색 결과 상단 노출
    analyticsEnabled: true,
    certBadgeEnabled: true,
  },
} as const satisfies Record<Plan, Record<string, number | boolean>>;

export type PlanFeature = keyof (typeof PLAN_FEATURES)["free"];

export function canUseFeature(plan: Plan, feature: PlanFeature) {
  return PLAN_FEATURES[plan][feature];
}

/** 검색 정렬 가중치 — 유료 플랜 상단 노출 (free는 0이라 영향 없음) */
export function searchBoost(plan: Plan): number {
  return PLAN_FEATURES[plan].searchBoost;
}
