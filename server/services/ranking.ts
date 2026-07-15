import { DOCUMENT_TYPES } from "../../lib/enums";

type CompletenessInput = {
  description?: string | null;
  companyName?: string | null;
  experienceYears?: number | null;
  vehiclesCount: number;
  photosCount: number;
  areasCount: number;
  servicesCount: number;
  verifiedDocsCount: number;
  hasPricing: boolean;
};

/** 0..100 — наскільки повний профіль (не залежить від рейтингу). */
export function computeProfileCompleteness(i: CompletenessInput): number {
  const checks = [
    !!i.description && i.description.length > 20,
    !!i.companyName,
    (i.experienceYears ?? 0) > 0,
    i.vehiclesCount > 0,
    i.photosCount > 0,
    i.areasCount > 0,
    i.servicesCount > 0,
    i.hasPricing,
    i.verifiedDocsCount >= Math.ceil(DOCUMENT_TYPES.length / 2),
    i.verifiedDocsCount === DOCUMENT_TYPES.length,
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

type RankingInput = {
  profileCompleteness: number; // 0..100
  verifiedDocsCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  daysSinceJoin: number;
  avgRating: number | null;
  reviewCount: number;
  completedJobs: number;
};

/**
 * rankingScore — працює з дня 1 без рейтингу.
 * Композит: повнота + верифікація + свіжість + (потім) рейтинг/виконані.
 */
export function computeRankingScore(i: RankingInput): number {
  if (!i.isPublished) return 0;

  const completeness = i.profileCompleteness / 100; // 0..1
  const verification = Math.min(i.verifiedDocsCount / DOCUMENT_TYPES.length, 1);
  const freshness = Math.max(0, 1 - i.daysSinceJoin / 60); // спад за ~2 місяці

  // Рейтинговий компонент вмикається лише коли є відгуки.
  const ratingComponent =
    i.avgRating != null && i.reviewCount > 0
      ? (i.avgRating / 5) * Math.min(i.reviewCount, 10) / 10
      : 0;
  const jobsComponent = Math.min(i.completedJobs, 50) / 50;

  let score =
    0.34 * completeness +
    0.26 * verification +
    0.12 * freshness +
    0.18 * ratingComponent +
    0.10 * jobsComponent;

  if (i.isFeatured) score += 0.5; // ручний pin у «Top»

  return Math.round(score * 1000) / 1000;
}

/** Похідне: перевізник вважається новим, якщо немає ні відгуків, ні виконаних. */
export function isNewCarrier(reviewCount: number, completedJobs: number): boolean {
  return reviewCount === 0 && completedJobs === 0;
}
