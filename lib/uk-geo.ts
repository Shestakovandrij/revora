// Мінімальний довідник координат для офлайн-оцінки відстані (fallback без ORS).
// Використовується і на клієнті (live-оцінка), і на сервері.

export const CITY_COORDS: Record<string, [number, number]> = {
  london: [51.5074, -0.1278],
  manchester: [53.4808, -2.2426],
  birmingham: [52.4862, -1.8904],
  leeds: [53.8008, -1.5491],
  bristol: [51.4545, -2.5879],
  glasgow: [55.8642, -4.2518],
  liverpool: [53.4084, -2.9916],
  edinburgh: [55.9533, -3.1883],
  cardiff: [51.4816, -3.1791],
  belfast: [54.5973, -5.9301],
  // Європа (приблизні центри)
  france: [48.8566, 2.3522],
  germany: [52.52, 13.405],
  spain: [40.4168, -3.7038],
  italy: [41.9028, 12.4964],
  netherlands: [52.3676, 4.9041],
  poland: [52.2297, 21.0122],
  belgium: [50.8503, 4.3517],
  portugal: [38.7223, -9.1393],
  switzerland: [46.9481, 7.4474],
};

function haversineMiles(a: [number, number], b: [number, number]): number {
  const R = 3958.8;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Витягує назву відомого міста/країни з довільної адреси. */
function matchPlace(address: string): [number, number] | null {
  const s = address.toLowerCase();
  for (const key of Object.keys(CITY_COORDS)) {
    if (s.includes(key)) return CITY_COORDS[key];
  }
  return null;
}

/**
 * Офлайн-оцінка відстані (миль) за прямою × дорожній коефіцієнт 1.3.
 * Повертає null, якщо не вдалося визначити міста (тоді використовуємо дефолт).
 */
export function estimateDistanceMiles(from: string, to: string): number | null {
  const a = matchPlace(from);
  const b = matchPlace(to);
  if (!a || !b) return null;
  const straight = haversineMiles(a, b);
  return Math.max(2, Math.round(straight * 1.3));
}

export function isInternational(from: string, to: string): boolean {
  const eu = ["france", "germany", "spain", "italy", "netherlands", "poland", "belgium", "portugal", "switzerland"];
  const s = `${from} ${to}`.toLowerCase();
  return eu.some((c) => s.includes(c));
}
