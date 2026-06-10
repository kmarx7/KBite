import posthog from "posthog-js";

/**
 * 추적 이벤트 정의 — 수익화 판단의 근거 데이터 (로드맵 공통 인프라).
 * 보안 규칙: 이벤트에 PII 금지 — ID·코드만 보내고 이메일·전화번호는 절대 금지.
 */
export const TRACK_EVENTS = {
  // 사용자 행동
  RESTAURANT_VIEW: "restaurant_view",
  RESTAURANT_SAVE: "restaurant_save",
  RESERVE_CLICK: "reserve_click",
  DIRECTIONS_CLICK: "directions_click",
  SEARCH_QUERY: "search_query",
  FILTER_USED: "filter_used",
  LANGUAGE_CHANGED: "language_changed",

  // 수익 관련
  PREMIUM_VIEW: "premium_plan_view",
  PREMIUM_CLICK: "premium_plan_click",
  PAYMENT_START: "payment_start",
  PAYMENT_COMPLETE: "payment_complete",
  PAYMENT_FAILED: "payment_failed",

  // 식당 파트너
  PARTNER_SIGNUP: "partner_signup",
  RESTAURANT_REGISTERED: "restaurant_registered",
  PLAN_UPGRADED: "plan_upgraded",
} as const;

export type TrackEvent = (typeof TRACK_EVENTS)[keyof typeof TRACK_EVENTS];

let initialized = false;

/** PostHog 초기화 — 키가 없으면 추적 전체가 no-op */
export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: true,
    respect_dnt: true,
    persistence: "localStorage",
  });
  initialized = true;
}

/** 이벤트 추적 — 클라이언트 전용, 초기화 전·키 없음이면 조용히 무시 */
export function track(
  event: TrackEvent,
  properties?: Record<string, string | number | boolean>,
) {
  if (!initialized || typeof window === "undefined") return;
  posthog.capture(event, properties);
}
