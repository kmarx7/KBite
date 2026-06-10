import type { Language } from "@/types";

export const LOCALES: Language[] = [
  "en",
  "ko",
  "ar",
  "zh",
  "ja",
  "vi",
  "th",
  "ru",
  "fa",
];

export const DEFAULT_LOCALE: Language = "en";

export const RTL_LOCALES: Language[] = ["ar", "fa"];

export const LOCALE_COOKIE = "KBITE_LOCALE";

export function isValidLocale(value: string): value is Language {
  return (LOCALES as string[]).includes(value);
}

export function getDir(locale: Language): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
