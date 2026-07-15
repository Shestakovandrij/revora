import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type CarrierFilters = {
  from?: string;
  to?: string;
  vehicleType?: string;
  service?: string;
  minRating?: number;
  europe?: boolean;
  tailLift?: boolean;
  sort?: string;
  helpers?: number;
};

const publishedWhere: Prisma.CarrierWhereInput = {
  isPublished: true,
  verificationStatus: "APPROVED",
};

export const carrierCardInclude = {
  user: { select: { name: true } },
  vehicles: { where: { isActive: true }, include: { photos: true }, take: 1 },
  areas: { include: { area: true } },
  services: { include: { service: true } },
  pricing: true,
} satisfies Prisma.CarrierInclude;

export type CarrierCard = Prisma.CarrierGetPayload<{ include: typeof carrierCardInclude }>;

/** Сортування каталогу з fallback tie-break на rankingScore (для cold start). */
function orderBy(sort?: string): Prisma.CarrierOrderByWithRelationInput[] {
  switch (sort) {
    case "rating":
      return [{ avgRating: { sort: "desc", nulls: "last" } }, { rankingScore: "desc" }];
    case "reviews":
      return [{ reviewCount: "desc" }, { rankingScore: "desc" }];
    case "jobs":
      return [{ completedJobs: "desc" }, { rankingScore: "desc" }];
    case "newest":
      return [{ joinedAt: "desc" }];
    case "price":
      return [{ rankingScore: "desc" }]; // ціна залежить від маршруту — сортуємо в пам'яті за потреби
    default: // "recommended"
      return [{ isFeatured: "desc" }, { rankingScore: "desc" }, { profileCompleteness: "desc" }];
  }
}

export async function getCarriers(filters: CarrierFilters = {}): Promise<CarrierCard[]> {
  const and: Prisma.CarrierWhereInput[] = [publishedWhere];

  if (filters.europe) and.push({ europeTransport: true });
  if (filters.minRating) and.push({ avgRating: { gte: filters.minRating } });
  if (filters.vehicleType)
    and.push({ vehicles: { some: { vehicleType: filters.vehicleType, isActive: true } } });
  if (filters.tailLift)
    and.push({ vehicles: { some: { tailLift: true, isActive: true } } });
  if (filters.service)
    and.push({ services: { some: { service: { code: filters.service } } } });

  // Маршрут: перевізник має покривати місто відправлення або призначення.
  const routeNames = [filters.from, filters.to].filter(Boolean) as string[];
  if (routeNames.length) {
    and.push({
      areas: { some: { area: { name: { in: routeNames } } } },
    });
  }

  return prisma.carrier.findMany({
    where: { AND: and },
    include: carrierCardInclude,
    orderBy: orderBy(filters.sort),
  });
}

export async function getTopCarriers(limit = 4): Promise<CarrierCard[]> {
  return prisma.carrier.findMany({
    where: publishedWhere,
    include: carrierCardInclude,
    orderBy: [{ isFeatured: "desc" }, { rankingScore: "desc" }],
    take: limit,
  });
}

export async function getCarrierBySlug(slug: string) {
  return prisma.carrier.findFirst({
    where: { slug, ...publishedWhere },
    include: {
      user: { select: { name: true } },
      vehicles: { include: { photos: true } },
      areas: { include: { area: true } },
      services: { include: { service: true } },
      pricing: true,
      documents: { select: { type: true, status: true } },
      reviews: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: { order: { select: { serviceCode: true } } },
      },
    },
  });
}

export async function getPopularAreas() {
  return prisma.area.findMany({
    where: { isPopular: true },
    include: { _count: { select: { carriers: true } } },
    orderBy: { type: "asc" },
  });
}

export async function getPublishedReviews(limit = 6) {
  return prisma.review.findMany({
    where: { status: "PUBLISHED", text: { not: null } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      carrier: { select: { companyName: true, user: { select: { name: true } } } },
      order: { select: { serviceCode: true, pickupAddress: true, deliveryAddress: true } },
    },
  });
}
