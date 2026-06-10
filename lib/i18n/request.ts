import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isValidLocale,
} from "./config";

type Messages = Record<string, unknown>;

/* 미완성 언어 파일은 영어로 키 단위 폴백 */
function deepMerge(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = result[key];
    if (
      value !== null &&
      typeof value === "object" &&
      baseValue !== null &&
      typeof baseValue === "object"
    ) {
      result[key] = deepMerge(baseValue as Messages, value as Messages);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value ?? "";
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  const fallback = (await import(`@/locales/en.json`)).default as Messages;
  const messages =
    locale === "en"
      ? fallback
      : deepMerge(
          fallback,
          (await import(`@/locales/${locale}.json`)).default as Messages,
        );

  return { locale, messages };
});
