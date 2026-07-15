import "server-only";
import { prisma } from "@/lib/db";
import { computeProfileCompleteness, computeRankingScore } from "./ranking";

/** Перераховує денормалізовані агрегати + rankingScore перевізника (викликати на подіях). */
export async function recomputeCarrierAggregates(carrierId: string) {
  const carrier = await prisma.carrier.findUnique({
    where: { id: carrierId },
    include: {
      reviews: { where: { status: "PUBLISHED" }, select: { overall: true } },
      documents: { select: { status: true } },
      vehicles: { select: { id: true, photos: { select: { id: true } } } },
      areas: { select: { areaId: true } },
      services: { select: { serviceId: true } },
      pricing: { select: { id: true } },
    },
  });
  if (!carrier) return;

  const reviews = carrier.reviews;
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? Math.round((reviews.reduce((s, r) => s + r.overall, 0) / reviewCount) * 10) / 10
      : null;

  const completed = await prisma.order.count({ where: { carrierId, status: "COMPLETED" } });
  const cancelled = await prisma.order.count({ where: { carrierId, status: "CANCELLED" } });
  const completionRate =
    completed + cancelled > 0 ? Math.round((completed / (completed + cancelled)) * 100) : null;

  const verifiedDocs = carrier.documents.filter((d) => d.status === "VERIFIED").length;
  const photosCount = carrier.vehicles.reduce((s, v) => s + v.photos.length, 0);

  const profileCompleteness = computeProfileCompleteness({
    description: carrier.description,
    companyName: carrier.companyName,
    experienceYears: carrier.experienceYears,
    vehiclesCount: carrier.vehicles.length,
    photosCount,
    areasCount: carrier.areas.length,
    servicesCount: carrier.services.length,
    verifiedDocsCount: verifiedDocs,
    hasPricing: !!carrier.pricing,
  });

  const daysSinceJoin = Math.max(
    0,
    (Date.now() - new Date(carrier.joinedAt).getTime()) / (1000 * 3600 * 24)
  );
  const rankingScore = computeRankingScore({
    profileCompleteness,
    verifiedDocsCount: verifiedDocs,
    isPublished: carrier.isPublished,
    isFeatured: carrier.isFeatured,
    daysSinceJoin,
    avgRating,
    reviewCount,
    completedJobs: completed,
  });

  await prisma.carrier.update({
    where: { id: carrierId },
    data: {
      avgRating,
      reviewCount,
      completedJobs: completed,
      cancelledJobs: cancelled,
      completionRate,
      profileCompleteness,
      rankingScore,
    },
  });
}
