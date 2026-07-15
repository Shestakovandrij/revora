import "server-only";
import { estimateDistanceMiles } from "./uk-geo";

/**
 * Абстракція над провайдером відстані.
 * За наявності ORS_API_KEY — OpenRouteService (безкоштовний), інакше офлайн-оцінка.
 * Результат кешується у пам'яті процесу (для dev достатньо; у проді — таблиця/Redis).
 */
const cache = new Map<string, DistanceResult>();

export type DistanceResult = {
  distanceMiles: number;
  durationMin: number;
  source: "ors" | "estimate";
};

async function geocodeORS(key: string, text: string): Promise<[number, number] | null> {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${key}&text=${encodeURIComponent(text)}&size=1`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const c = data?.features?.[0]?.geometry?.coordinates;
    return c ? [c[1], c[0]] : null; // ORS повертає [lng, lat]
  } catch {
    return null;
  }
}

export async function resolveDistance(from: string, to: string): Promise<DistanceResult> {
  const cacheKey = `${from.toLowerCase().trim()}|${to.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const key = process.env.ORS_API_KEY;
  let result: DistanceResult | null = null;

  if (key) {
    const [a, b] = await Promise.all([geocodeORS(key, from), geocodeORS(key, to)]);
    if (a && b) {
      try {
        const res = await fetch("https://api.openrouteservice.org/v2/matrix/driving-car", {
          method: "POST",
          headers: { Authorization: key, "Content-Type": "application/json" },
          body: JSON.stringify({
            locations: [[a[1], a[0]], [b[1], b[0]]],
            metrics: ["distance", "duration"],
            units: "mi",
          }),
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) {
          const data = await res.json();
          const dist = data?.distances?.[0]?.[1];
          const dur = data?.durations?.[0]?.[1];
          if (typeof dist === "number") {
            result = {
              distanceMiles: Math.round(dist),
              durationMin: Math.round((dur ?? dist * 60) / 60),
              source: "ors",
            };
          }
        }
      } catch {
        /* fall through */
      }
    }
  }

  if (!result) {
    const miles = estimateDistanceMiles(from, to) ?? 15; // дефолт для нерозпізнаних адрес
    result = { distanceMiles: miles, durationMin: Math.round((miles / 30) * 60), source: "estimate" };
  }

  cache.set(cacheKey, result);
  return result;
}
