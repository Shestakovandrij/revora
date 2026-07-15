import en from "@/messages/en.json";

/**
 * Легкий i18n-каркас (готовність до мультимовності з дня 1).
 * Наразі лише EN. Додати локаль: покласти messages/<locale>.json у LOCALES
 * і підключити next-intl з [locale]-роутуванням (свідомо відкладено до потреби).
 * Правило: НЕ хардкодити рядки — брати через t().
 */
export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

const DICTS: Record<Locale, Record<string, unknown>> = { en };

/** t("hero.title") -> рядок зі словника поточної локалі. */
export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  const parts = key.split(".");
  let node: unknown = DICTS[locale];
  for (const p of parts) {
    if (node && typeof node === "object" && p in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof node === "string" ? node : key;
}
