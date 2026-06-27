import { z } from "zod";

/**
 * 식당 등록 폼 검증 스키마.
 * 에러 message는 i18n 키(register 네임스페이스) — UI에서 t(message)로 표시.
 * 작업 2에서 서버(API/액션) 측 검증에 동일 스키마를 재사용한다 —
 * 클라이언트 검증은 UX용일 뿐, 서버 검증이 보안 경계다.
 */

export const CATEGORY_VALUES = ["me", "as", "cj", "we", "af", "rc"] as const;
export const CERT_VALUES = [
  "halal",
  "vegan",
  "kosher",
  "gf",
  "dairy-free",
] as const;
export const LANGUAGE_VALUES = [
  "en",
  "ko",
  "ar",
  "zh",
  "ja",
  "vi",
  "th",
  "ru",
  "fa",
] as const;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const step1Schema = z.object({
  name: z.string().trim().min(1, "requiredField").max(100, "requiredField"),
  ownerEmail: z
    .string()
    .trim()
    .min(1, "requiredField")
    .max(254, "invalidEmail")
    .email("invalidEmail"),
  phone: z
    .string()
    .trim()
    .max(20, "requiredField")
    .regex(/^[0-9+\-() ]*$/, "requiredField"),
  category: z.enum(CATEGORY_VALUES, { message: "requiredField" }),
});

export const CURRENCY_VALUES = ["KRW", "USD"] as const;

export const step2Schema = z.object({
  address: z.string().trim().min(1, "requiredField").max(200, "requiredField"),
  openingTime: z.string().regex(TIME_PATTERN).nullable(),
  closingTime: z.string().regex(TIME_PATTERN).nullable(),
  priceCurrency: z.enum(CURRENCY_VALUES),
  priceOptionIdx: z.coerce.number().int().min(0).max(3),
  about: z.string().trim().max(1000, "requiredField"),
  certifications: z.array(z.enum(CERT_VALUES)).max(CERT_VALUES.length),
  languages: z.array(z.enum(LANGUAGE_VALUES)).max(LANGUAGE_VALUES.length),
});

export const step3Schema = z.object({
  bizRegNo: z
    .string()
    .trim()
    .regex(/^\d{3}-\d{2}-\d{5}$/, "invalidBizNo"),
  snsUrl: z
    .string()
    .trim()
    .max(300, "invalidUrl")
    .regex(/^$|^https?:\/\/\S+$/i, "invalidUrl"),
});

/** 단계별 검증 — 통과 시 null, 실패 시 첫 에러의 i18n 키 반환 */
export function validateStep(
  step: 1 | 2 | 3,
  data: unknown,
): string | null {
  const schema =
    step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema;
  const result = schema.safeParse(data);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "requiredField";
}

/** 업로드 파일 제한 — 클라이언트 UX용. 서버 측에서도 동일 제한 적용 필수 */
export const MAX_UPLOAD_MB = 5;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
export const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];

export function validateFile(
  file: File,
  allowedTypes: string[],
): string | null {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return "fileTooLarge";
  if (!allowedTypes.includes(file.type)) return "fileType";
  return null;
}
